import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/content";
import { Breadcrumbs, type Crumb } from "@/components/ui";
import { routing } from "@/i18n/routing";
import {
  buildArticleJsonLd,
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  faqFromBody,
} from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { readingTimeMinutes } from "@/lib/readingTime";
import { authorCopy } from "@/lib/author";
import { categoryLabel } from "@/lib/categories";
import { articleHref } from "@/lib/routes";
import { SOURCE_SECTIONS } from "@/lib/sourceData";
import { routeUrl } from "@/lib/urls";
import { sanityFetch, sanityFetchPublished } from "@/sanity/client";
import {
  BLOG_ENTRIES_QUERY,
  BLOG_ENTRY_QUERY,
  BLOG_TAGS,
  COUNTRY_ROWS_QUERY,
  HOME_TAGS,
} from "@/sanity/queries";
import type {
  ArticleDetail,
  ArticleSummary,
  CountryRowResult,
} from "@/sanity/types";

import styles from "./page.module.scss";

// One entry, at /blog/<slug>.
//
// HREFLANG, FROM THE ENTRY'S OWN SIBLINGS — and the note that stood here said
// the opposite. It argued that an entry has nothing shared to derive siblings
// from, unlike a jurisdiction page with its `country` reference, so this page
// should declare its own URL and no others.
//
// The first half was true and the conclusion did not follow from it. An entry
// does have something shared: `translationKey`, the same field the language
// switcher groups on. Without alternates the three translations of one piece
// were published as three unrelated documents, which does not make them
// independent — it makes them competitors, and which one a search engine shows
// a Russian reader is then decided by whichever it ranked rather than by the
// language they asked for.
//
// WHAT WAS RIGHT IN IT AND IS KEPT: an entry is not obliged to exist in every
// language, so the set holds the languages that have a published document and
// no others, and the x-default appears only when the English one does. An
// hreflang pointing at a page nobody wrote is worse than an absent one.

function dateFormatter(locale: string) {
  const format = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (iso: string) => format.format(new Date(iso));
}

export async function generateStaticParams() {
  // Every published entry in every language. `sanityFetchPublished` rather than
  // the draft-aware client: a draft has no business pre-rendering a URL.
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const entries = await sanityFetchPublished<ArticleSummary[]>(
        BLOG_ENTRIES_QUERY,
        { locale },
        BLOG_TAGS,
      );
      return entries.map((entry) => ({ locale, slug: entry.slug }));
    }),
  );

  return perLocale.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const entry = await sanityFetch<ArticleDetail | null>(
    BLOG_ENTRY_QUERY,
    { locale, slug },
    BLOG_TAGS,
  );
  if (!entry) return {};

  // THE STANDFIRST IS THE FALLBACK DESCRIPTION, and the schema makes it
  // required so this can never be empty. An entry whose SEO block is left blank
  // still gets a written summary rather than the first hundred characters of
  // its own body, which is how a meta description ends up mid-sentence.
  // One href per language that has a published version, itself included. Built
  // here rather than inside buildMetadata because only this page knows that a
  // /blog slug is data — see the note at the top of the file.
  const languages: Record<string, ReturnType<typeof articleHref>> = {};
  for (const alternate of entry.alternates ?? []) {
    if (!alternate.language || !alternate.slug) continue;
    if (!routing.locales.includes(alternate.language as never)) continue;
    languages[alternate.language] = articleHref(alternate.slug);
  }
  // An entry published before `translationKey` existed resolves no alternates
  // at all. It still has to declare itself, or it would be the one page on the
  // site with no self-referencing hreflang and no x-default.
  languages[locale] ??= articleHref(slug);

  return buildMetadata({
    seo: {
      ...entry.seo,
      metaTitle: entry.seo?.metaTitle || entry.title,
      metaDescription: entry.seo?.metaDescription || entry.standfirst,
    },
    locale,
    href: articleHref(slug),
    languages,
  });
}

export default async function Entry({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [entry, countries, t, tNav] = await Promise.all([
    sanityFetch<ArticleDetail | null>(
      BLOG_ENTRY_QUERY,
      { locale, slug },
      BLOG_TAGS,
    ),
    // Only for the section NAMES under "Checked against". Taken from the
    // registry for the same reason /faq takes them from there: this page must
    // not call a jurisdiction something the rest of the site does not.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "blog" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  if (!entry) notFound();

  const url = routeUrl(articleHref(slug), locale);
  const formatDate = dateFormatter(locale);

  // A source section is either one of the five jurisdictions, whose name comes
  // from the registry, or a cross-cutting section that carries its own heading.
  const sectionNames: Record<string, string> = {};
  for (const section of SOURCE_SECTIONS) {
    const country = countries.find((row) => row.code === section.key);
    const heading = section.heading?.[locale as "en" | "ru" | "pl"];
    sectionNames[section.key] = country?.name ?? heading ?? section.key;
  }

  const trail: Crumb[] = [
    { name: t("home"), href: "/" },
    { name: tNav("links.research"), href: "/blog" },
    { name: entry.title },
  ];

  const articleJsonLd = buildArticleJsonLd({
    url,
    headline: entry.title,
    description: entry.standfirst,
    datePublished: entry.publishedAt,
    dateModified: entry._updatedAt,
    authorUrl: routeUrl("/about", locale),
    // The machine-readable half of the line the reader sees. Same array, so the
    // two cannot say different things.
    citations: entry.sources.map(
      (key) => `${routeUrl("/sources", locale)}#${key}`,
    ),
  });

  // The questions this entry ends with, marked up as a FAQPage. Null when the
  // entry carries none, and filtered out below rather than emitted as an empty
  // node — see buildFaqPageJsonLd.
  const faqJsonLd = buildFaqPageJsonLd(faqFromBody(entry.body));

  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: t("home"), url: routeUrl("/", locale) },
    { name: tNav("links.research"), url: routeUrl("/blog", locale) },
    { name: entry.title, url },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from objects built above, never from user input.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean),
          ),
        }}
      />

      <div className={styles.wrap}>
        <div className="container">
          <Breadcrumbs trail={trail} label={tNav("navLabel")} />
        </div>

        <div className="container">
          <ArticleBody
            category={categoryLabel(entry.category, locale)}
            title={entry.title}
            standfirst={entry.standfirst}
            publishedAt={entry.publishedAt}
            updatedAt={entry._updatedAt}

            countries={entry.countries}
            sources={entry.sources}
            body={entry.body}
            formatDate={formatDate}
            labels={{
              published: t("published"),
              updated: t("updated"),
              // WITH ITS VALUE, not as a template the component patches. This
              // read `t("readingTime")` and the component did
              // `.replace("{minutes}", …)`; next-intl validates placeholders at
              // call time and threw FORMATTING_ERROR on the live page. The
              // manual replace also silently bypassed the locale's own number
              // formatting, which is the reason to use the library at all.
              readingTime: t("readingTime", {
                minutes: readingTimeMinutes(entry.body),
              }),
              sourcesLabel: t("sourcesLabel"),
              jurisdictionsLabel: t("jurisdictionsLabel"),
              backToIndex: t("backToIndex"),
              contents: t("contents"),
              author: authorCopy(locale),
              sectionNames,
            }}
          />
        </div>
      </div>
    </main>
  );
}
