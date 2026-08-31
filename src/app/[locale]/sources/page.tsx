import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPathname, Link } from "@/i18n/navigation";
import { SourceTable, type SourceTableLabels } from "@/components/content";
import { AlertsSignup, type AlertsSignupLabels } from "@/components/marketing";
import { SectionHead } from "@/components/ui";
import { CONTROLLER } from "@/lib/controller";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { CHECK_DATES, CHECKED_ON, SOURCE_SECTIONS } from "@/lib/sourceData";
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

// The change list's fifteen labels, one of which carries a placeholder. The
// same mapping the jurisdiction pages and /changes use, and a copy rather than
// an import for the same reason each of those is: it is eleven lines, and the
// alternative is a shared helper that exists to save eleven lines and has to be
// found before anybody can read what the block is being given.
function buildAlertsLabels(
  t: (key: string, values?: Record<string, string>) => string,
): AlertsSignupLabels {
  return {
    heading: t("heading"),
    body: t("body"),
    emailLabel: t("emailLabel"),
    emailPlaceholder: t("emailPlaceholder"),
    jurisdictionsLegend: t("jurisdictionsLegend"),
    jurisdictionsHint: t("jurisdictionsHint"),
    consentLabel: t("consentLabel"),
    honeypotLabel: t("honeypotLabel"),
    submitLabel: t("submitLabel"),
    fine: t("fine"),
    privacyLabel: t("privacyLabel"),
    sent: { title: t("sent.title"), body: t("sent.body") },
    error: { title: t("error.title"), body: t("error.body") },
    // A PLACEHOLDER, filled from the one definition the project has. Typing it
    // into three catalogues is how the site once printed a hello@ address that
    // no mailbox answered.
    broke: {
      title: t("broke.title"),
      body: t("broke.body", { email: CONTROLLER.email }),
    },
  };
}

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

  const [page, countries, t, tAbout, tAlerts] = await Promise.all([
    sanityFetch<SourcesPage | null>(SOURCES_PAGE_QUERY, { locale }, SOURCES_TAGS),
    // Only for the jurisdiction NAMES. Taking them from the registry rather
    // than hardcoding five headings is what stops this page calling a country
    // something the rest of the site does not — the defect that had the
    // Russian home page saying "Greece" for a fortnight.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "sources" }),
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "alerts" }),
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
    // Rendered here, once per date, rather than inside the table: the table is
    // handed finished strings and does no formatting of its own.
    recheckedByDate: Object.fromEntries(
      Object.entries(CHECK_DATES).map(([iso, dates]) => [
        iso,
        t("rechecked", {
          date: dates[locale as keyof typeof dates] ?? dates.en,
        }),
      ]),
    ),
  };

  // THE BASELINE, AND IT NOW SAYS THAT IT IS ONE. This line used to render a
  // bare date — "23 August 2026" under a rule, with no sentence around it —
  // which read as the date the whole page was checked and, once individual
  // rows started carrying their own, was no longer true. See the note above
  // CHECK_DATES in src/lib/sourceData.ts for why the fix is a baseline plus
  // overrides rather than a date on every row.
  const checkedDate =
    CHECKED_ON[locale as keyof typeof CHECKED_ON] ?? CHECKED_ON.en;
  const checked = t("checkedOn", { date: checkedDate });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": routeUrl(ROUTE, locale),
    url: routeUrl(ROUTE, locale),
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
    // The date the evidence was gathered. Not `dateModified`, which would be
    // about the document; this is about the checking.
    datePublished: "2026-08-23",
    // AND NOW BOTH, because both events have happened. Three rows were read
    // again after the page was published, and a page that offers only a
    // datePublished tells an aggregator its newest fact is as old as its
    // oldest. Bump this whenever a row gains a `checked` date later than it.
    dateModified: "2026-08-28",
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

      {/* THE OFFER THIS PAGE'S OWN ARGUMENT MAKES. Every row here carries the
          date it was last read against a primary source; the page exists to say
          that a figure is only as good as its check date. "We will tell you
          when one moves" is not a pitch bolted onto that — it is the same
          sentence, addressed to the reader instead of about the site.

          No jurisdiction pre-ticked: this page covers all five, and an unticked
          set means all five. */}
      <AlertsSignup
        labels={buildAlertsLabels(tAlerts)}
        locale={locale}
        // The page's own segment — /istochniki, /zrodla — so the 303 comes back
        // here. Split off getPathname rather than typed out.
        slug={getPathname({ href: ROUTE, locale }).split("/").pop() ?? ""}
        jurisdictions={countries.map((row) => ({
          code: row.code,
          name: row.name,
        }))}
        privacyHref={getPathname({ href: "/privacy", locale })}
        instance="sources"
      />
    </main>
  );
}
