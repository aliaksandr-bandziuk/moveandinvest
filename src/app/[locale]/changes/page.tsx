import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPathname, Link } from "@/i18n/navigation";
import { ChangeLog, type ChangeLogLabels } from "@/components/content";
import { AlertsSignup, type AlertsSignupLabels } from "@/components/marketing";
import { SectionHead } from "@/components/ui";
import { CONTROLLER } from "@/lib/controller";
import {
  CHANGES_NOT_COVERED,
  CHANGES_REVIEWED_ON,
  CHANGES_UPDATED_ON,
  RULE_CHANGES,
} from "@/lib/changeData";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  CHANGES_PAGE_QUERY,
  CHANGES_TAGS,
  COUNTRY_ROWS_QUERY,
  HOME_TAGS,
} from "@/sanity/queries";
import type { ChangesPage, CountryRowResult } from "@/sanity/types";

import styles from "./page.module.scss";

// /changes — what changed in the rules, when, and by which act.
//
// THE LAST OF THE THREE THINGS THE FOOTER PROMISED AT LAUNCH, and the one that
// was argued about longest. It was proposed three times as a Guides & Research
// entry and refused three times, on the section's own stated principle: an
// entry carries one date, its publication, and a log whose newest fact is as
// old as its publication date is precisely the "recently updated, long stale"
// pattern that three rows of /sources call out in competitors.
//
// WHY IT IS NOT /sources WITH MORE ROWS. Two different events. /sources records
// what THIS SITE claimed and how it compared to the source; this page records
// what the LAW did. A reader who cannot tell "Greece raised a threshold" from
// "we misread an article" has been handed a worse page, not a fuller one. The
// two are joined by the deep link in each row's last column instead.
const ROUTE = "/changes";

// Fifteen labels, one of which carries a placeholder. Lifted from the
// jurisdiction page rather than rewritten: the same block, the same catalogue,
// and a second copy of the mapping is a second place for the address to be
// typed in by hand — which is exactly how the site once printed a hello@
// address that no mailbox answered.
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

  const page = await sanityFetch<ChangesPage | null>(
    CHANGES_PAGE_QUERY,
    { locale },
    CHANGES_TAGS,
  );
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

export default async function Changes({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, countries, t] = await Promise.all([
    sanityFetch<ChangesPage | null>(CHANGES_PAGE_QUERY, { locale }, CHANGES_TAGS),
    // Jurisdiction NAMES from the registry, like /sources and /faq. One place
    // decides what a country is called and every page inherits it.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "changes" }),
  ]);

  const tAlerts = await getTranslations({ locale, namespace: "alerts" });

  if (!page) {
    console.error(
      `[moveandinvest] No changesPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write".`,
    );
    notFound();
  }

  const countryNames = new Map(
    countries.map((country) => [country.code, country.name]),
  );

  // ONE FORMATTER FOR TWO PRECISIONS. A row whose day is not established prints
  // its month and no day, because a precision we do not have is a precision we
  // must not print — the same rule that keeps four unverified figures off this
  // site entirely.
  const dayFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const formatDate = (iso: string, approximate?: boolean) =>
    (approximate ? monthFormat : dayFormat).format(new Date(iso));

  const labels: ChangeLogLabels = {
    date: t("columns.date"),
    change: t("columns.change"),
    instrument: t("columns.instrument"),
    moved: t("columns.moved"),
    noInstrument: t("noInstrument"),
    seeWorking: t("seeWorking"),
  };

  const notCovered = CHANGES_NOT_COVERED.map(
    (code) => countryNames.get(code) ?? code.toUpperCase(),
  ).join(", ");

  // The href the log's per-row links point at. Built through getPathname so
  // that it is /istochniki in Russian and /zrodla in Polish: the table renders
  // a plain <a> and nothing on that path adds a locale segment for it.
  const sourcesHref = getPathname({ href: "/sources", locale });

  // WHERE THE SIGNUP COMES BACK TO. The route handler builds the redirect as
  // "<locale prefix>/<returnTo>#alerts-sent", so what it wants is this page's
  // own segment WITHOUT the prefix — "changes", "izmeneniya", "zmiany". Taken
  // from getPathname and stripped rather than written out, because a route
  // renamed in routing.ts must not leave a form redirecting to a 404.
  const changesSlug = getPathname({ href: ROUTE, locale }).split("/").pop() ?? "";

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
    // THE TWO DATES, AND THEY ARE NOT THE SAME EVENT. `dateModified` is when a
    // row last changed; `datePublished` is when the log first went up. The
    // review date is deliberately NOT mapped to either — schema.org has no
    // property meaning "somebody checked and nothing had changed", and
    // borrowing dateModified for it would tell an aggregator a change happened
    // when none did. It is stated in prose instead, where it can be true.
    datePublished: "2026-08-30",
    dateModified: CHANGES_UPDATED_ON,
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
          <SectionHead
            level={1}
            eyebrow={page.eyebrow}
            heading={page.heading}
            intro={page.intro}
          >
            <p className={styles.howToRead}>{page.howToRead}</p>
            <p className={styles.back}>
              <Link href="/sources">{t("toSources")}</Link>
            </p>
          </SectionHead>

          <ChangeLog
            changes={RULE_CHANGES}
            locale={locale}
            labels={labels}
            countryNames={countryNames}
            formatDate={formatDate}
            sourcesHref={sourcesHref}
          />

          {/* WHO IS ABSENT AND WHY, stated rather than left to inference. A
              reader who does not find Malta here is entitled to know whether
              nothing changed or nobody looked, and on this site it is always
              the second until it is written down that it is the first. */}
          <p className={styles.notCovered}>
            {t("notCovered", { countries: notCovered })}
          </p>

          {/* THE TWO DATES AGAIN, IN PROSE, and this is the maintenance promise
              made honestly. A changelog is a promise to keep it up; an
              abandoned one is a fresh stamp over a stale fact, which is the
              failure this site audits others for. So the cadence is stated as
              what it actually is — a full pass whenever a jurisdiction is
              researched — rather than as a month nobody will keep. */}
          <p className={styles.dates}>
            {t("reviewedOn", { date: dayFormat.format(new Date(CHANGES_REVIEWED_ON)) })}{" "}
            {t("updatedOn", { date: dayFormat.format(new Date(CHANGES_UPDATED_ON)) })}{" "}
            {t("cadence")}
          </p>
        </div>
      </section>

      {/* THE ONE PAGE WHERE THIS OFFER IS NOT AN INTERRUPTION. Everywhere else
          the change list is the quieter alternative to a larger ask; here it is
          the same sentence the page has just spent eighteen rows making — that
          these rules move, and that somebody is watching them. A reader who has
          read the log has already agreed with the premise.

          No jurisdiction is pre-ticked, unlike the two instances on a
          jurisdiction page: this page is about all five, and an unticked set
          means all five. */}
      <AlertsSignup
        labels={buildAlertsLabels(tAlerts)}
        locale={locale}
        slug={changesSlug}
        jurisdictions={countries.map((row) => ({
          code: row.code,
          name: row.name,
        }))}
        privacyHref={getPathname({ href: "/privacy", locale })}
        instance="changes"
      />
    </main>
  );
}
