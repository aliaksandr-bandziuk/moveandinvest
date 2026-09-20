import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_LOCALES } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { ArticleList, Pagination } from "@/components/content";
import { SectionHead } from "@/components/ui";
import {
  blogPageHref,
  pageCount,
  pageRange,
} from "@/lib/blogPagination";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  BLOG_ENTRIES_COUNT_QUERY,
  BLOG_ENTRIES_PAGE_QUERY,
  BLOG_PAGE_QUERY,
  BLOG_TAGS,
} from "@/sanity/queries";
import type { ArticleSummary, BlogPage } from "@/sanity/types";

import styles from "./page.module.scss";

// ONE LISTING, RENDERED AT TWO ADDRESSES: /blog and /blog/page/2 onwards. Both
// routes call the two functions below, so the head, the JSON-LD, the editorial
// block and the pager cannot drift apart between page one and the rest — which
// is exactly what happens when pagination is added by copying the page file.
//
// The date, in the reader's language, without a formatter per component. Set to
// UTC on purpose: `publishedAt` is a date the entry claims, not a moment in the
// reader's day, and rendering it in the visitor's zone would move an entry
// published late in the evening onto the previous day for readers to the west.
function dateFormatter(locale: string) {
  const format = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (iso: string) => format.format(new Date(iso));
}

/** The head document and one page of entries, in one round trip each. */
async function load(locale: string, page: number) {
  const { from, to } = pageRange(page);
  const [doc, entries, total, t] = await Promise.all([
    sanityFetch<BlogPage | null>(BLOG_PAGE_QUERY, { locale }, BLOG_TAGS),
    sanityFetch<ArticleSummary[]>(
      BLOG_ENTRIES_PAGE_QUERY,
      { locale, from, to },
      BLOG_TAGS,
    ),
    sanityFetch<number>(BLOG_ENTRIES_COUNT_QUERY, { locale }, BLOG_TAGS),
    getTranslations({ locale, namespace: "blog" }),
  ]);
  return { doc, entries, total, t };
}

export async function listingMetadata(
  locale: string,
  page: number,
): Promise<Metadata> {
  // The count in every site language, because the hreflang set depends on it:
  // page three exists in Russian and in English and not in Polish, and naming
  // a language that 404s there is the mismatch Search Console reports weeks
  // later. Cheap — the three counts share the request cache with the page
  // itself, which asks for its own.
  const [doc, ...counts] = await Promise.all([
    sanityFetch<BlogPage | null>(BLOG_PAGE_QUERY, { locale }, BLOG_TAGS),
    ...SITE_LOCALES.map((l) =>
      sanityFetch<number>(BLOG_ENTRIES_COUNT_QUERY, { locale: l }, BLOG_TAGS),
    ),
  ]);
  const pagesPerLocale = new Map(
    SITE_LOCALES.map((l, i) => [l, pageCount(counts[i] ?? 0)]),
  );
  const total = counts[SITE_LOCALES.indexOf(locale as never)] ?? 0;
  if (!doc) return {};
  if (page > pageCount(total)) return {};

  const t = await getTranslations({ locale, namespace: "blog" });

  // PAGE TWO ONWARDS CARRIES ITS NUMBER IN THE TITLE AND ITS OWN CANONICAL.
  // Not a canonical pointing back at /blog: that is the common shortcut and it
  // asks Google to drop from the index the only page where entries 13 to 24
  // are listed. The number in the title is what keeps the ten results from
  // reading as ten duplicates in a search result.
  const seo =
    page > 1
      ? {
          ...doc.seo,
          metaTitle: t("pageTitle", {
            title: doc.seo.metaTitle,
            page,
          }),
          metaDescription: t("pageDescription", {
            description: doc.seo.metaDescription,
            page,
            total: pageCount(total),
          }),
        }
      : doc.seo;

  const languages = Object.fromEntries(
    SITE_LOCALES.filter((l) => (pagesPerLocale.get(l) ?? 1) >= page).map((l) => [
      l,
      blogPageHref(page),
    ]),
  );

  return buildMetadata({
    seo,
    locale,
    href: blogPageHref(page),
    languages,
  });
}

export async function Listing({
  locale,
  page,
}: {
  locale: string;
  page: number;
}) {
  setRequestLocale(locale);

  const { doc, entries, total, t } = await load(locale, page);

  if (!doc) notFound();
  // A page past the end is a 404 rather than an empty list: an address that
  // answers 200 with nothing on it is a page Google keeps and a reader mistrusts.
  const pages = pageCount(total);
  if (page > pages) notFound();

  const siteUrl = getSiteUrl();
  const url = routeUrl(blogPageHref(page), locale);

  // A CollectionPage rather than a Blog. The difference is not pedantry: `Blog`
  // asserts a periodical with a posting cadence, and this section makes no
  // promise about how often it publishes — the entries themselves are
  // BlogPosting, which is where the claim belongs.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: doc.heading,
    description: doc.intro,
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: organizationRef(siteUrl),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from objects built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={styles.section}>
        <div className="container">
          <SectionHead
            eyebrow={doc.eyebrow}
            heading={doc.heading}
            intro={doc.intro}
            level={1}
          />

          <ArticleList
            entries={entries}
            locale={locale}
            labels={{
              jurisdictionsLabel: t("jurisdictionsLabel"),
              // The CMS sentence when there is one, the catalogue's fallback
              // when the field has not been filled — an empty section that says
              // nothing at all is worse than a generic line.
              empty: doc.empty || t("empty"),
            }}
            formatDate={dateFormatter(locale)}
          />

          <Pagination
            current={page}
            total={pages}
            labels={{
              navLabel: t("paginationLabel"),
              previous: t("previous"),
              next: t("next"),
              position: t("pagePosition", { page, total: pages }),
              pageLabel: (n: number) => t("pageLink", { page: n }),
            }}
          />

          {/* UNDER the list, not above it — see blogPage.ts. A reader who has
              seen what is here is the one for whom "how this section works" is
              worth four paragraphs; a reader who has not is still looking for
              the entries.

              ON PAGE ONE ONLY. Repeating it under every page would put the
              same four paragraphs at five addresses, which is the duplication
              the numbered titles above exist to avoid. */}
          {page === 1 && doc.editorial ? (
            <div className={styles.editorial}>
              <PortableText value={doc.editorial as never} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
