import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getPathname } from "@/i18n/navigation";
import { SourceTable, type SourceTableLabels } from "@/components/content";
import { SectionHead } from "@/components/ui";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { CHECKED_ON, SOURCE_SECTIONS } from "@/lib/sourceData";
import { sanityFetch } from "@/sanity/client";
import { COUNTRY_ROWS_QUERY, HOME_TAGS, SOURCES_PAGE_QUERY, SOURCES_TAGS } from "@/sanity/queries";
import type { CountryRowResult, SourcesPage } from "@/sanity/types";

import styles from "./page.module.scss";

// /sources — the evidence behind every headline figure.
//
// WHY IT IS A PAGE AND NOT A SECTION OF /about. /about states the method:
// primary sources only, a date on every figure, nothing published where no
// primary source exists. This is the proof of that statement, and proof is
// long — thirty-three checks and twenty-eight citations. Folding it into
// /about would bury the argument under the evidence; leaving it in
// docs/figures-verification-2026-08-23.md, where it lived until now, meant a
// method described but never shown.
//
// ONE PATH FOR ALL THREE LOCALES, like /about and /privacy: this URL goes into
// an outbound email and into the source note of every jurisdiction page, and
// one address that resolves everywhere beats three that each resolve once.
const ROUTE = "/sources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<SourcesPage | null>(SOURCES_PAGE_QUERY, { locale }, SOURCES_TAGS);
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

export default async function Sources({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, countries, t, tAbout] = await Promise.all([
    sanityFetch<SourcesPage | null>(SOURCES_PAGE_QUERY, { locale }, SOURCES_TAGS),
    // Only for the jurisdiction NAMES. Taking them from the registry rather
    // than hardcoding five headings is what stops this page calling a country
    // something the rest of the site does not — the defect that had the
    // Russian home page saying "Greece" for a fortnight.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "sources" }),
    getTranslations({ locale, namespace: "about" }),
  ]);

  if (!page) {
    console.error(
      `[moveandinvest] No sourcesPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write", or check those two values in .env.local.`,
    );
    notFound();
  }

  const nameByCode = new Map(countries.map((country) => [country.code, country.name]));

  const labels: SourceTableLabels = {
    subject: t("subject"),
    verdict: t("verdict"),
    finding: t("finding"),
    sourcesLabel: t("sourcesLabel"),
    official: t("official"),
    reproduction: t("reproduction"),
    verdicts: {
      confirmed: t("verdicts.confirmed"),
      corrected: t("verdicts.corrected"),
      added: t("verdicts.added"),
      unverified: t("verdicts.unverified"),
      withdrawn: t("verdicts.withdrawn"),
    },
  };

  const checked = CHECKED_ON[locale as keyof typeof CHECKED_ON] ?? CHECKED_ON.en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${getSiteUrl()}${getPathname({ href: ROUTE, locale })}`,
    url: `${getSiteUrl()}${getPathname({ href: ROUTE, locale })}`,
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
    // The date the evidence was gathered. Not `dateModified`, which would be
    // about the document; this is about the checking.
    datePublished: "2026-08-23",
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={styles.section}>
        <div className="container">
          <SectionHead level={1} eyebrow={page.eyebrow} heading={page.heading} intro={page.intro}>
            <p className={styles.howToRead}>{page.howToRead}</p>
            <p className={styles.back}>
              <Link href="/about">{tAbout("breadcrumb")}</Link>
            </p>
          </SectionHead>

          {SOURCE_SECTIONS.map((section) => (
            <SourceTable
              key={section.key}
              id={section.key}
              // A jurisdiction takes its name from the registry; a
              // cross-cutting section carries its own heading. Falling back to
              // the key would render "citizenship" as a headline, so the
              // heading is required for anything that is not a country.
              heading={
                section.heading?.[locale as "en" | "ru" | "pl"] ??
                nameByCode.get(section.key) ??
                section.heading?.en ??
                section.key.toUpperCase()
              }
              claims={section.claims}
              sources={section.sources}
              note={section.note?.[locale as "en" | "ru" | "pl"] ?? null}
              locale={locale}
              labels={labels}
            />
          ))}

          <p className={styles.checked}>{checked}</p>
        </div>
      </section>
    </main>
  );
}
