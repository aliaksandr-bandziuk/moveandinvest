import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FaqAccordion, type FaqAccordionLabels } from "@/components/content";
import { SectionHead } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { FAQ_ALL, FAQ_SECTIONS } from "@/lib/faqData";
import { buildFaqPageJsonLd, organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  COUNTRY_ROWS_QUERY,
  FAQ_PAGE_QUERY,
  FAQ_PAGE_TAGS,
  HOME_TAGS,
} from "@/sanity/queries";
import type { CountryRowResult, FaqPage } from "@/sanity/types";

import styles from "./page.module.scss";

// /faq — the fifty-two questions, grouped, every figure linked to its statute.
//
// ONE PATH FOR ALL THREE LOCALES, like /about, /sources and /privacy: this URL
// goes into outbound email and into the footer, and one address that resolves
// everywhere beats three that each resolve once.
//
// THE FAQPage MARKUP LIVES HERE AND NOWHERE ELSE ON THE SITE. It used to be
// emitted by the home page too, over the six questions that section shows.
// Two reasons it moved. Google removed FAQ rich results from Search on 7 May
// 2026 — the report went in June, the API in August — so the markup no longer
// produces anything visible there and the old comment in jsonLd.ts warning
// about "losing the rich result" describes a thing that no longer exists.
// What it still does is feed answer engines, and for that one complete FAQPage
// at one URL is worth more than the same six questions marked up at three.
const ROUTE = "/faq";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<FaqPage | null>(
    FAQ_PAGE_QUERY,
    { locale },
    FAQ_PAGE_TAGS,
  );
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

export default async function Faq({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, countries, t] = await Promise.all([
    sanityFetch<FaqPage | null>(FAQ_PAGE_QUERY, { locale }, FAQ_PAGE_TAGS),
    // Only for the jurisdiction NAMES, used to label the source links. Taken
    // from the registry rather than hardcoded, so this page cannot call a
    // country something the rest of the site does not.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "faq" }),
  ]);

  if (!page) {
    console.error(
      `[moveandinvest] No faqPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write", or check those two values in .env.local.`,
    );
    notFound();
  }

  // The source link under an answer says "Portugal", not "pt". The two
  // cross-cutting sections of /sources are not jurisdictions and have no entry
  // in the registry, so they take their names from the message catalogue.
  const nameByCode = new Map(
    countries.map((country) => [country.code, country.name]),
  );
  const sectionNames: Record<string, string> = {
    pt: nameByCode.get("PT") ?? "Portugal",
    gr: nameByCode.get("GR") ?? "Greece",
    mt: nameByCode.get("MT") ?? "Malta",
    ae: nameByCode.get("AE") ?? "UAE",
    cy: nameByCode.get("CY") ?? "Cyprus",
    citizenship: t("sourceSections.citizenship"),
  };

  const labels: FaqAccordionLabels = {
    sourcesLabel: t("sourcesLabel"),
    sectionNames,
  };

  const url = routeUrl(ROUTE, locale);

  // BUILT FROM THE SAME ARRAY THE ACCORDION RENDERS, flattened across all
  // eleven sections. The one rule governing every function in jsonLd.ts is that
  // the markup describes what is visibly on the page; deriving both from one
  // source is how that stays true without anybody having to remember it.
  //
  // Visible even when collapsed, which is the property that makes an accordion
  // acceptable here at all: <details> keeps its content in the document whether
  // open or shut, so a FAQPage listing all fifty-two describes fifty-two
  // answers a reader can actually reach.
  const faqJsonLd = buildFaqPageJsonLd(
    FAQ_ALL.map((item) => ({
      question: item.q[locale as keyof typeof item.q],
      answer: item.a[locale as keyof typeof item.a],
    })),
  );

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
  };

  // Where each section's numbering starts, computed once rather than
  // accumulated inside the map — a counter mutated during render is a counter
  // that gives different answers on a re-render, and the linter is right to
  // refuse it. Numbering runs 01..52 across the whole page rather than
  // restarting per section, so "question 34" means one thing.
  const startIndexes = FAQ_SECTIONS.reduce<number[]>(
    (acc, section, i) => [
      ...acc,
      (acc[i - 1] ?? 0) + (FAQ_SECTIONS[i - 1]?.items.length ?? 0),
    ],
    [],
  );

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from objects built above, never from user input.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([pageJsonLd, faqJsonLd]),
        }}
      />

      <section className={styles.section}>
        <div className="container">
          <SectionHead
            level={1}
            eyebrow={page.eyebrow}
            heading={page.heading}
            intro={page.intro}
          >
            <p className={styles.howToRead}>{page.howToRead}</p>
            <p className={styles.back}>
              <Link href="/sources">{t("allSources")}</Link>
            </p>
          </SectionHead>

          {/* One `name` for every accordion on the page, so opening any answer
              closes whichever was open — including one in another section.
              Fifty-two panels open at once is a page nobody can navigate, and
              the browser enforces this without a line of JavaScript. */}
          {FAQ_SECTIONS.map((section, sectionIndex) => {
            return (
              <section
                key={section.key}
                id={section.key}
                className={styles.group}
              >
                <h2 className={styles.groupTitle}>
                  {section.title[locale as keyof typeof section.title]}
                </h2>
                <p className={styles.groupIntro}>
                  {section.intro[locale as keyof typeof section.intro]}
                </p>

                <FaqAccordion
                  groupName="faq"
                  // Resolved here rather than inside the component — see FaqRow
                  // for why the accordion no longer knows about locale maps.
                  items={section.items.map((item) => ({
                    key: item.key,
                    question: item.q[locale as keyof typeof item.q],
                    answer: item.a[locale as keyof typeof item.a],
                    sources: item.sources,
                  }))}
                  labels={labels}
                  startIndex={startIndexes[sectionIndex] ?? 0}
                />
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
