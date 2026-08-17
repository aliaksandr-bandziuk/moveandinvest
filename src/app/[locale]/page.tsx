import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { CountryRow } from "@/components/country";
import {
  CostComparison,
  type CostRow,
  type Jurisdiction,
  JurisdictionMap,
  type Priority,
  RouteFinder,
  type SpeedBand,
} from "@/components/country";
import {
  EnquiryForm,
  type FaqEntry,
  type FaqFilterOption,
  FaqSection,
  HomeHero,
  MethodSection,
  PartnerTeaser,
} from "@/components/marketing";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { sanityFetch } from "@/sanity/client";
import {
  COUNTRY_ROWS_QUERY,
  FAQ_ITEMS_QUERY,
  HOME_PAGE_QUERY,
  HOME_TAGS,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import type {
  CountryRowResult,
  FaqItemResult,
  HomePageResult,
  SiteSettingsResult,
} from "@/sanity/types";

const DASH = "—";

// A jurisdiction with no published page in this locale still gets a row, with
// its cells set to an em dash. Dropping it would tell the reader the site
// covers four jurisdictions when it covers five — one of which is simply not
// written yet.
function toRows(results: CountryRowResult[]): CountryRow[] {
  return results.map((result) => ({
    id: result._id,
    name: result.name,
    code: result.code,
    status: result.status,
    href: result.page ? `/${result.page.slug}` : undefined,
    route: result.page?.route ?? DASH,
    minimumInvestment: result.page?.minimumInvestment ?? DASH,
    timeToPermit: result.page?.timeToPermit ?? DASH,
    taxRegime: result.page?.taxRegime ?? DASH,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const [home, settings] = await Promise.all([
    sanityFetch<HomePageResult | null>(HOME_PAGE_QUERY, { locale }, HOME_TAGS),
    sanityFetch<SiteSettingsResult | null>(
      SITE_SETTINGS_QUERY,
      { locale },
      HOME_TAGS,
    ),
  ]);

  const seo = home?.seo ?? settings?.defaultSeo;
  if (!seo) return {};

  return buildMetadata({ seo, locale, href: "/" });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  // Six messages on this page deliberately keep their `{placeholders}`: they
  // are templates handed to a client component, which fills them in from state
  // the server has never seen. `t()` parses every message as ICU and throws
  // FORMATTING_ERROR the moment a placeholder has no value — which is exactly
  // what happened, six times, one per template. `t.raw` is the documented way
  // to take a message as written.
  const template = (key: string): string => {
    const value: unknown = t.raw(key);
    if (typeof value === "string") return value;
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[moveandinvest] Missing or non-string message: home.${key}`);
    }
    return "";
  };

  const [home, countries, faq] = await Promise.all([
    sanityFetch<HomePageResult | null>(HOME_PAGE_QUERY, { locale }, HOME_TAGS),
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    sanityFetch<FaqItemResult[]>(FAQ_ITEMS_QUERY, { locale }, HOME_TAGS),
  ]);

  // No homePage document for this locale is a content gap, not a page that
  // should render half-empty. A bare 404 gives no clue why, though, and the
  // three ways to get here during setup — dataset never seeded, wrong
  // dataset name, dev server started before .env.local existed — all look
  // identical from the browser. So say which one it is, in the terminal.
  if (!home) {
    console.error(
      `[moveandinvest] No homePage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run seed", or check those two values in .env.local and restart the dev server.`,
    );
    notFound();
  }

  const rows = toRows(countries);
  // A jurisdiction whose page is still an unpublished draft has nothing to
  // put in any cell. One such row alongside four real ones is honest; five
  // of them is a table of em dashes, which reads as broken rather than as
  // pending — so the table only renders once at least one jurisdiction has
  // real figures, and the pending note stands in until then.
  const publishedRows = rows.filter((row) => row.href);

  // A jurisdiction joins the cost comparison only once BOTH euro figures
  // exist. Half a pair would put a bar on the page that understates the real
  // number, which is the exact failure this block is about.
  const costRows: CostRow[] = countries
    .filter(
      (c) =>
        typeof c.page?.costAdvertisedEur === "number" &&
        typeof c.page?.costExtrasEur === "number",
    )
    .map((c) => ({
      id: c._id,
      name: c.name,
      advertised: c.page?.costAdvertisedEur ?? 0,
      extras: c.page?.costExtrasEur ?? 0,
    }));
  const hasPublishedData = publishedRows.length > 0;

  // The route finder gets every jurisdiction, including ones whose page is
  // still a draft and ones whose figures are unverified. It filters on what
  // it has and gives the benefit of the doubt on what it does not, so a
  // half-filled jurisdiction stays visible rather than disappearing — the
  // same rule the comparison table follows with its em dashes.
  const STRENGTHS: Priority[] = ["passport", "tax", "speed"];
  const jurisdictions: Jurisdiction[] = countries.map((c) => ({
    id: c._id,
    code: c.code,
    name: c.name,
    href: c.page ? `/${c.page.slug}` : undefined,
    advertised: c.page?.costAdvertisedEur ?? null,
    extras: c.page?.costExtrasEur ?? null,
    speedBand: (c.speedBand ?? null) as SpeedBand | null,
    strengths: (c.strengths ?? []).filter((s): s is Priority =>
      STRENGTHS.includes(s as Priority),
    ),
    timeToPermit: c.page?.timeToPermit ?? DASH,
    taxRegime: c.page?.taxRegime ?? DASH,
  }));

  const faqEntries: FaqEntry[] = faq.map((item) => ({
    id: item._id,
    question: item.question,
    answer: item.answer,
    codes: item.codes ?? [],
  }));

  // A chip is offered only for a jurisdiction that actually has a question of
  // its own. Rendering all five regardless would give three of them a filter
  // that returns only the general questions — a control that looks broken
  // because nothing appears to change.
  const taggedCodes = new Set(faqEntries.flatMap((entry) => entry.codes));
  const faqFilters: FaqFilterOption[] = [
    { value: "all", label: t("faqAll") },
    ...countries
      .filter((c) => taggedCodes.has(c.code))
      .map((c) => ({ value: c.code, label: c.name })),
  ];

  // The note shown under the table on the home page comes from whichever
  // jurisdiction page was checked least recently — a single date under a
  // combined table would otherwise imply all five were verified together.
  const sourceNote =
    countries.find((c) => c.page?.sourceNote)?.page?.sourceNote ??
    t("sourcePending");

  // Structured data mirrors what the table already says in HTML. Both are
  // read: the markup by an answer engine parsing the page, this by a
  // crawler that only takes JSON-LD.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: home.seo.metaTitle,
    description: home.seo.metaDescription,
    url: getSiteUrl(),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "moveandinvest",
      url: getSiteUrl(),
    },
    about: publishedRows.map((row) => ({
      "@type": "Country",
      name: row.name,
      identifier: row.code.toUpperCase(),
    })),
  };

  // A second block rather than a branch of the first: FAQPage is its own
  // top-level type, and the questions are the single most quotable thing on
  // the page. Every question is included, not just the ones a filter would
  // currently show — the filter is a reading aid, not a statement about what
  // the page covers.
  const faqJsonLd =
    faqEntries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: locale,
          mainEntity: faqEntries.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }
      : null;

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <HomeHero
        eyebrow={home.eyebrow}
        heading={home.heading}
        intro={home.intro}
        primaryCta={home.primaryCta}
        secondaryCta={home.secondaryCta}
        tableCaption={home.comparisonHeading}
        tableIntro={home.comparisonIntro}
        columnLabels={{
          jurisdiction: t("columns.jurisdiction"),
          route: t("columns.route"),
          minimumInvestment: t("columns.minimumInvestment"),
          timeToPermit: t("columns.timeToPermit"),
          taxRegime: t("columns.taxRegime"),
        }}
        rows={hasPublishedData ? rows : []}
        sourceNote={sourceNote}
        updatedLabel={t("updated")}
        pendingLabel={t("pendingLabel")}
        pendingNote={t("pendingNote")}
      />

      <MethodSection
        index="02"
        eyebrow={t("methodEyebrow")}
        heading={home.methodHeading}
        intro={home.methodIntro}
        points={home.methodPoints ?? []}
      />

      <JurisdictionMap
        index="03"
        eyebrow={t("mapEyebrow")}
        heading={t("mapHeading")}
        intro={t("mapIntro")}
        rows={rows}
        note={t("mapNote")}
        fromLabel={t("columns.minimumInvestment")}
        permitLabel={t("columns.timeToPermit")}
      />

      <CostComparison
        index="04"
        eyebrow={t("costEyebrow")}
        heading={t("costHeading")}
        intro={t("costIntro")}
        rows={costRows}
        labels={{
          advertised: t("costAdvertised"),
          extras: t("costExtras"),
          real: t("costReal"),
        }}
        note={t("costNote")}
        locale={locale}
      />

      <RouteFinder
        index="05"
        eyebrow={t("routeEyebrow")}
        heading={t("routeHeading")}
        intro={t("routeIntro")}
        locale={locale}
        jurisdictions={jurisdictions}
        questions={[
          {
            name: "budget",
            index: "01",
            legend: t("routeQ.budget"),
            options: [
              { value: "300", label: t("routeQ.budget300") },
              { value: "500", label: t("routeQ.budget500") },
              { value: "any", label: t("routeQ.budgetAny") },
            ],
          },
          {
            name: "speed",
            index: "02",
            legend: t("routeQ.speed"),
            options: [
              { value: "fast", label: t("routeQ.speedFast") },
              { value: "half-year", label: t("routeQ.speedHalf") },
              { value: "any", label: t("routeQ.speedAny") },
            ],
          },
          {
            name: "priority",
            index: "03",
            legend: t("routeQ.priority"),
            options: [
              { value: "passport", label: t("routeQ.priorityPassport") },
              { value: "tax", label: t("routeQ.priorityTax") },
              { value: "speed", label: t("routeQ.prioritySpeed") },
            ],
          },
        ]}
        figureLabels={{
          advertised: t("routeAdvertised"),
          extras: t("routeExtras"),
          real: t("routeReal"),
          permit: t("routePermit"),
          tax: t("routeTax"),
        }}
        ctaLabel={t("routeCta")}
        pendingLabel={t("routePending")}
        placeholder={t("routePlaceholder")}
        unverified={t("routeUnverified")}
        controlLabels={{
          count: template("routeCount"),
          compromise: template("routeCompromise"),
          relax: {
            budget: t("routeRelaxBudget"),
            speed: t("routeRelaxSpeed"),
            priority: t("routeRelaxPriority"),
          },
          cut: {
            budget: template("routeCutBudget"),
            speed: template("routeCutSpeed"),
            priority: template("routeCutPriority"),
          },
          join: t("routeJoin"),
          clauseJoin: t("routeClauseJoin"),
        }}
      />

      <FaqSection
        index="06"
        eyebrow={t("faqEyebrow")}
        heading={t("faqHeading")}
        entries={faqEntries}
        filters={faqFilters}
        filterLegend={t("faqFilterLegend")}
        countTemplate={template("faqCount")}
        note={t("faqNote")}
      />

      <PartnerTeaser
        index="07"
        eyebrow={t("partnerEyebrow")}
        heading={home.partnerTeaserHeading}
        body={home.partnerTeaserBody}
        ctaLabel={t("partnerCta")}
        ctaHref="/for-partners"
        qualifiersLabel={t("qualifiersLabel")}
        qualifiers={[
          t("qualifiers.jurisdiction"),
          t("qualifiers.budget"),
          t("qualifiers.timeline"),
          t("qualifiers.goal"),
        ]}
      />
      <EnquiryForm
        index="08"
        eyebrow={t("enquiryEyebrow")}
        heading={t("enquiryHeading")}
        locale={locale}
        fork={{
          chosenIndex: "01",
          chosenTitle: t("enquiryForkChosen"),
          chosenBody: t("enquiryForkChosenBody"),
          undecidedIndex: "02",
          undecidedTitle: t("enquiryForkOpen"),
          undecidedBody: t("enquiryForkOpenBody"),
        }}
        // Labels come from the registry, so the form and the table can never
        // disagree about which five jurisdictions exist.
        jurisdictions={countries.map((c) => ({ value: c.code, label: c.name }))}
        openOptions={[
          { value: "undecided", label: t("enquiryUndecided") },
          { value: "other", label: t("enquiryOther") },
        ]}
        budget={{
          legend: t("enquiryBudget"),
          options: [
            { value: "300", label: t("enquiryBudget300") },
            { value: "500", label: t("enquiryBudget500") },
            { value: "over500", label: t("enquiryBudgetOver") },
            { value: "unknown", label: t("enquiryBudgetUnknown") },
          ],
        }}
        timeline={{
          legend: t("enquiryTimeline"),
          options: [
            { value: "fast", label: t("enquiryTimeFast") },
            { value: "half-year", label: t("enquiryTimeHalf") },
            { value: "year", label: t("enquiryTimeYear") },
            { value: "browsing", label: t("enquiryTimeBrowsing") },
          ],
        }}
        goals={{
          legend: t("enquiryGoals"),
          hint: t("enquiryGoalsHint"),
          options: [
            { value: "residency", label: t("enquiryGoalResidency") },
            { value: "tax", label: t("enquiryGoalTax") },
            { value: "passport", label: t("enquiryGoalPassport") },
            { value: "business", label: t("enquiryGoalBusiness") },
            { value: "property", label: t("enquiryGoalProperty") },
          ],
        }}
        situation={{
          legend: t("enquirySituation"),
          hint: t("enquirySituationHint"),
        }}
        contact={{
          legend: t("enquiryContact"),
          name: t("enquiryName"),
          email: t("enquiryEmail"),
        }}
        consent={t("enquiryConsent")}
        fine={t("enquiryFine")}
        submit={t("enquirySubmit")}
        sent={{ title: t("enquirySentTitle"), body: t("enquirySentBody") }}
        failed={{ title: t("enquiryFailedTitle"), body: t("enquiryFailedBody") }}
        honeypot={t("enquiryHoneypot")}
      />
    </main>
  );
}
