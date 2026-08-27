import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { ArticleList } from "@/components/content";
import { SectionHead } from "@/components/ui";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  BLOG_ENTRIES_QUERY,
  BLOG_PAGE_QUERY,
  BLOG_TAGS,
} from "@/sanity/queries";
import type { ArticleSummary, BlogPage } from "@/sanity/types";

import styles from "./page.module.scss";

// /blog — Guides & Research.
//
// THE URL IS /blog AND THE SECTION IS NOT CALLED THAT. Deliberate: "blog" is
// the word a reader types and the word every language already has, so it is the
// right address; "Guides & Research" is what the section is, and that belongs
// in the label rather than in the path. Nothing in this file knows the display
// name — it comes from the message catalogue, which is why renaming the section
// costs three strings and no code.
const ROUTE = "/blog";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<BlogPage | null>(
    BLOG_PAGE_QUERY,
    { locale },
    BLOG_TAGS,
  );
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

export default async function Blog({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, entries, t] = await Promise.all([
    sanityFetch<BlogPage | null>(BLOG_PAGE_QUERY, { locale }, BLOG_TAGS),
    sanityFetch<ArticleSummary[]>(BLOG_ENTRIES_QUERY, { locale }, BLOG_TAGS),
    getTranslations({ locale, namespace: "blog" }),
  ]);

  if (!page) notFound();

  const siteUrl = getSiteUrl();
  const url = routeUrl(ROUTE, locale);

  // A CollectionPage rather than a Blog. The difference is not pedantry: `Blog`
  // asserts a periodical with a posting cadence, and this section makes no
  // promise about how often it publishes — the entries themselves are
  // BlogPosting, which is where the claim belongs.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: page.heading,
    description: page.intro,
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
            eyebrow={page.eyebrow}
            heading={page.heading}
            intro={page.intro}
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
              empty: page.empty || t("empty"),
            }}
            formatDate={dateFormatter(locale)}
          />

          {/* UNDER the list, not above it — see blogPage.ts. A reader who has
              seen what is here is the one for whom "how this section works" is
              worth four paragraphs; a reader who has not is still looking for
              the entries. */}
          {page.editorial ? (
            <div className={styles.editorial}>
              <PortableText value={page.editorial as never} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
