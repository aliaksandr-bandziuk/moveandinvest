import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/content";
import { AskBlock } from "@/components/marketing";
import { Breadcrumbs, type Crumb } from "@/components/ui";
import { getPathname } from "@/i18n/navigation";
import { CONTROLLER } from "@/lib/controller";
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
import { entryHref } from "@/lib/routes";
import { SOURCE_SECTIONS } from "@/lib/sourceData";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  BLOG_ENTRY_QUERY,
  BLOG_TAGS,
  COUNTRY_ROWS_QUERY,
  HOME_TAGS,
} from "@/sanity/queries";
import type {
  ArticleDetail,
  CountryRowResult,
  PageKind,
} from "@/sanity/types";

import styles from "./page.module.scss";

// THE ENTRY PAGE, SHARED BY TWO ROUTES — extracted 8 September 2026.
//
// One `article` document answers at one of two addresses, decided by its own
// `pageKind` field: a "research" entry at /blog/<slug>, a "reference" entry at
// /<slug> beside the jurisdiction and property pages. See the note at the top
// of src/sanity/schemaTypes/documents/article.ts for why that is a field
// rather than a second document type.
//
// EXTRACTED RATHER THAN COPIED, and the difference matters more here than
// usual. Everything below — the hreflang set, the Article JSON-LD, the
// citations built from `sources`, the FAQPage lifted out of the body, the
// enquiry block's single-jurisdiction rule — is logic that has already been
// wrong once and been fixed. A second copy is a second place for each of those
// fixes to rot, and the rot would be invisible: both pages would render.
//
// THIS FILE IS NOT A ROUTE. It sits inside a route folder, which App Router
// permits — only page.tsx, route.ts and their siblings are special — so that
// page.module.scss stays where it is and nothing had to move.
//
// WHAT DIFFERS BY KIND, and it is only this:
//   - the URL, through entryHref()
//   - the breadcrumb trail: a reference page is a child of the home page, not
//     of Guides & Research, because it does not live under it
// The link back to the listing inside ArticleBody stays in BOTH, deliberately.
// A reference entry is still listed in Guides & Research, and that link is the
// crawl path the whole change exists to shorten.

function dateFormatter(locale: string) {
  const format = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (iso: string) => format.format(new Date(iso));
}

// HREFLANG, FROM THE ENTRY'S OWN SIBLINGS — and the note that stood here before
// the extraction argued the opposite. It said an entry has nothing shared to
// derive siblings from, unlike a jurisdiction page with its `country`
// reference, so the page should declare its own URL and no others.
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
export async function entryMetadata({
  locale,
  slug,
  kind,
}: {
  locale: string;
  slug: string;
  kind: PageKind;
}): Promise<Metadata> {

  const entry = await sanityFetch<ArticleDetail | null>(
    BLOG_ENTRY_QUERY,
    { locale, slug },
    BLOG_TAGS,
  );
  if (!entry || entry.pageKind !== kind) return {};

  // THE STANDFIRST IS THE FALLBACK DESCRIPTION, and the schema makes it
  // required so this can never be empty. An entry whose SEO block is left blank
  // still gets a written summary rather than the first hundred characters of
  // its own body, which is how a meta description ends up mid-sentence.
  // One href per language that has a published version, itself included. Built
  // here rather than inside buildMetadata because only this page knows that a
  // /blog slug is data — see the note at the top of the file.
  const languages: Record<string, ReturnType<typeof entryHref>> = {};
  for (const alternate of entry.alternates ?? []) {
    if (!alternate.language || !alternate.slug) continue;
    if (!routing.locales.includes(alternate.language as never)) continue;
    // THE SIBLINGS SHARE THE KIND, and that is a property of how they are
    // made rather than an assumption: all three language versions of an entry
    // come from one record in scripts/articles.ts, which writes one `kind` to
    // all of them. The alternates projection therefore does not need to carry
    // the field.
    languages[alternate.language] = entryHref(alternate.slug, kind);
  }
  // An entry published before `translationKey` existed resolves no alternates
  // at all. It still has to declare itself, or it would be the one page on the
  // site with no self-referencing hreflang and no x-default.
  languages[locale] ??= entryHref(slug, kind);

  return buildMetadata({
    seo: {
      ...entry.seo,
      metaTitle: entry.seo?.metaTitle || entry.title,
      metaDescription: entry.seo?.metaDescription || entry.standfirst,
    },
    locale,
    href: entryHref(slug, kind),
    languages,
  });
}

export async function EntryView({
  locale,
  slug,
  kind,
}: {
  locale: string;
  slug: string;
  kind: PageKind;
}) {
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

  const tAsk = await getTranslations({ locale, namespace: "ask" });

  if (!entry) notFound();
  // ONE DOCUMENT, ONE ADDRESS. Without this a reference entry would also answer
  // at /blog/<slug> and a research entry at /<slug> — two live URLs for one
  // page, which is a duplicate we would have created ourselves.
  if (entry.pageKind !== kind) notFound();

  const url = routeUrl(entryHref(slug, kind), locale);
  const formatDate = dateFormatter(locale);

  // A source section is either one of the five jurisdictions, whose name comes
  // from the registry, or a cross-cutting section that carries its own heading.
  const sectionNames: Record<string, string> = {};
  for (const section of SOURCE_SECTIONS) {
    const country = countries.find((row) => row.code === section.key);
    const heading = section.heading?.[locale as "en" | "ru" | "pl"];
    sectionNames[section.key] = country?.name ?? heading ?? section.key;
  }

  // A reference page is not under /blog, so it must not claim to be: a
  // breadcrumb that names a parent the URL does not have is a lie told to both
  // the reader and the BreadcrumbList below it.
  const trail: Crumb[] =
    kind === "reference"
      ? [{ name: t("home"), href: "/" }, { name: entry.title }]
      : [
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

  // THE JURISDICTION THE ASK WILL CARRY, and only when there is exactly one.
  //
  // An entry tagged with a single country is a guide about that country, and
  // the enquiry can say so. An entry tagged with several — the cost-of-living
  // comparison — is about all of them, and guessing one would put a country in
  // a partner's inbox that the reader never named. Tagged with none, same
  // answer. So: one, or nothing, and the block prints a line saying which,
  // because a hidden field the reader cannot see is not something this site
  // sends on their behalf.
  const only = entry.countries?.length === 1 ? entry.countries[0] : undefined;

  const ask = (
    <AskBlock
      locale={locale}
      slug={slug}
      {...(only ? { countryCode: only.code } : {})}
      privacyHref={getPathname({ href: "/privacy", locale })}
      longFormHref={getPathname({ href: "/enquiry", locale })}
      labels={{
        heading: tAsk("heading"),
        body: tAsk("body"),
        ...(only ? { about: tAsk("about", { country: only.name }) } : {}),
        emailLabel: tAsk("emailLabel"),
        emailPlaceholder: tAsk("emailPlaceholder"),
        situationLabel: tAsk("situationLabel"),
        situationPlaceholder: tAsk("situationPlaceholder"),
        consentLabel: tAsk("consentLabel"),
        honeypotLabel: tAsk("honeypotLabel"),
        submitLabel: tAsk("submitLabel"),
        fine: tAsk("fine"),
        privacyLabel: tAsk("privacyLabel"),
        longFormLabel: tAsk("longFormLabel"),
        sent: { title: tAsk("sent.title"), body: tAsk("sent.body") },
        error: { title: tAsk("error.title"), body: tAsk("error.body") },
        // The address is a PLACEHOLDER filled from the one definition the
        // project has, exactly as the change-list block does it — see the note
        // there. Typing it into three catalogues is how the site ended up
        // printing a hello@ address no mailbox ever answered.
        broke: {
          title: tAsk("broke.title"),
          body: tAsk("broke.body", { email: CONTROLLER.email }),
        },
      }}
    />
  );

  // The same trail, in the machine-readable form. Built from one branch so the
  // two cannot disagree about who the page's parent is.
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(
    kind === "reference"
      ? [{ name: t("home"), url: routeUrl("/", locale) }, { name: entry.title, url }]
      : [
          { name: t("home"), url: routeUrl("/", locale) },
          { name: tNav("links.research"), url: routeUrl("/blog", locale) },
          { name: entry.title, url },
        ],
  );

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
            ask={ask}
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
