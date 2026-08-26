import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { CountryRow } from "@/components/country";
import {
  CostComparison,
  type CostRow,
  type Jurisdiction,
  JurisdictionCards,
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
import { organizationRef } from "@/lib/jsonLd";
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

  // Two strings, and both are punctuation the route finder glues clauses
  // with: ", " and ". ". They stay in the message catalogue on purpose —
  // separators are not copy, and a CMS field holding ", " is an invitation to
  // break a sentence. Everything a reader would call TEXT comes from Sanity.
  const t = await getTranslations("home");

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
    { value: "all", label: home.faq.allLabel },
    ...countries
      .filter((c) => taggedCodes.has(c.code))
      .map((c) => ({ value: c.code, label: c.name })),
  ];

  // The note shown under the table on the home page comes from whichever
  // jurisdiction page was checked least recently — a single date under a
  // combined table would otherwise imply all five were verified together.
  const sourceNote =
    countries.find((c) => c.page?.sourceNote)?.page?.sourceNote ??
    home.hero.sourcePending;

  // The hero's contents list. Every label is the eyebrow of the section it
  // points at, read from the same document — so a section renamed in the
  // studio renames itself here too, and there is no second list of section
  // names anywhere in the codebase. The fragments are the ids the components
  // set on their own <section> elements.
  const contents = [
    { index: "01", label: home.hero.tableEyebrow, href: "#comparison" },
    { index: "02", label: home.method.eyebrow, href: "#method" },
    { index: "03", label: home.map.eyebrow, href: "#jurisdictions" },
    { index: "04", label: home.cost.eyebrow, href: "#cost" },
    { index: "05", label: home.routeFinder.eyebrow, href: "#route" },
    { index: "06", label: home.faq.eyebrow, href: "#faq" },
    { index: "07", label: home.partnerTeaser.eyebrow, href: "#partners" },
    { index: "08", label: home.enquiry.eyebrow, href: "#enquiry" },
  ];

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
    // References rather than inline copies since 24 Aug 2026: the WebSite node
    // and the Organization behind it are published in full on /about, and a
    // JSON-LD graph is assembled across a site by @id. Restating them here
    // would be two more copies to keep in step.
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
    about: publishedRows.map((row) => ({
      "@type": "Country",
      name: row.name,
      identifier: row.code.toUpperCase(),
    })),
  };

  // NO FAQPage HERE, SINCE 25 AUGUST 2026, and the removal is deliberate.
  //
  // This block used to emit one over the six questions the section below shows.
  // Two things changed. Google removed FAQ rich results from Search on 7 May
  // 2026 — the Search Console report followed in June and the API in August —
  // so the markup no longer produces anything visible there, and the warning in
  // jsonLd.ts about "losing the rich result" now describes a thing that does not
  // exist to lose.
  //
  // The one that actually decides it is the rule this project already holds
  // itself to: the markup must describe what is visibly on the page. `FAQPage`
  // is a claim that the page IS a list of questions and answers. That was a
  // stretch when six of them sat in section 06 of a home page; once /faq exists
  // and carries all fifty-two, it is simply wrong — the home page shows an
  // excerpt, and the canonical set lives at one URL.
  //
  // The questions themselves are unchanged and still rendered below. What went
  // away is the assertion about what kind of document this is, not the content.

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeHero
        eyebrow={home.hero.eyebrow}
        heading={home.hero.heading}
        intro={home.hero.intro}
        primaryCta={home.hero.primaryCta}
        secondaryCta={home.hero.secondaryCta}
        contentsLabel={home.hero.contentsLabel}
        contents={contents}
        tableEyebrow={home.hero.tableEyebrow}
        tableCaption={home.hero.tableHeading}
        tableIntro={home.hero.tableIntro}
        tableDetailLabel={home.hero.tableDetailLabel}
        tableScrollHint={home.hero.tableScrollHint}
        columnLabels={home.hero.columns}
        rows={hasPublishedData ? rows : []}
        sourceNote={sourceNote}
        updatedLabel={home.hero.updatedLabel}
        pendingLabel={home.hero.pendingLabel}
        pendingNote={home.hero.pendingNote}
      />

      <MethodSection
        index="02"
        eyebrow={home.method.eyebrow}
        heading={home.method.heading}
        intro={home.method.intro}
        points={home.method.points ?? []}
      />

      {/* Replaced the world map that stood here — see the note at the top of
          the component. The map is still in src/components/country and is
          one import away if this turns out to be the wrong trade. */}
      <JurisdictionCards
        index="03"
        eyebrow={home.map.eyebrow}
        heading={home.map.heading}
        intro={home.map.intro}
        note={home.map.note}
        rows={rows}
        // Reusing the table's own column heads rather than adding three more
        // fields that would have to say the same thing in three languages.
        labels={home.hero.columns}
      />

      <CostComparison
        index="04"
        eyebrow={home.cost.eyebrow}
        heading={home.cost.heading}
        intro={home.cost.intro}
        rows={costRows}
        labels={{
          advertised: home.cost.advertisedLabel,
          extras: home.cost.extrasLabel,
          real: home.cost.realLabel,
        }}
        noteLabel={home.cost.noteLabel}
        note={home.cost.note}
        locale={locale}
      />

      <RouteFinder
        index="05"
        eyebrow={home.routeFinder.eyebrow}
        heading={home.routeFinder.heading}
        intro={home.routeFinder.intro}
        locale={locale}
        jurisdictions={jurisdictions}
        questions={[
          {
            name: "budget",
            index: "01",
            legend: home.routeFinder.questions.budget.legend,
            options: [
              {
                value: "500",
                label: home.routeFinder.questions.budget.upTo500,
              },
              {
                value: "800",
                label: home.routeFinder.questions.budget.upTo800,
              },
              { value: "any", label: home.routeFinder.questions.budget.any },
            ],
          },
          {
            name: "speed",
            index: "02",
            legend: home.routeFinder.questions.speed.legend,
            options: [
              { value: "fast", label: home.routeFinder.questions.speed.fast },
              {
                value: "half-year",
                label: home.routeFinder.questions.speed.half,
              },
              { value: "any", label: home.routeFinder.questions.speed.any },
            ],
          },
          {
            name: "priority",
            index: "03",
            legend: home.routeFinder.questions.priority.legend,
            options: [
              {
                value: "passport",
                label: home.routeFinder.questions.priority.passport,
              },
              { value: "tax", label: home.routeFinder.questions.priority.tax },
              {
                value: "speed",
                label: home.routeFinder.questions.priority.speed,
              },
            ],
          },
        ]}
        figureLabels={{
          advertised: home.routeFinder.rows.advertised,
          extras: home.routeFinder.rows.extras,
          real: home.routeFinder.rows.real,
          permit: home.routeFinder.rows.permit,
          tax: home.routeFinder.rows.tax,
        }}
        ctaLabel={home.routeFinder.ctaLabel}
        pendingLabel={home.routeFinder.pending}
        placeholder={home.routeFinder.placeholder}
        unverified={home.routeFinder.unverified}
        controlLabels={{
          // Plain strings straight from Sanity. They still carry
          // {placeholders}, but nothing parses them as ICU any more, so the
          // FORMATTING_ERROR failure mode is gone rather than worked around.
          count: home.routeFinder.templates.count,
          compromise: home.routeFinder.templates.compromise,
          relax: home.routeFinder.relaxWords,
          cut: {
            budget: home.routeFinder.templates.cutBudget,
            speed: home.routeFinder.templates.cutSpeed,
            priority: home.routeFinder.templates.cutPriority,
          },
          join: t("routeJoin"),
          clauseJoin: t("routeClauseJoin"),
        }}
      />

      <FaqSection
        index="06"
        eyebrow={home.faq.eyebrow}
        heading={home.faq.heading}
        intro={home.faq.intro}
        entries={faqEntries}
        filters={faqFilters}
        filterLegend={home.faq.filterLegend}
        countTemplate={home.faq.countTemplate}
        note={home.faq.note}
      />

      <PartnerTeaser
        index="07"
        eyebrow={home.partnerTeaser.eyebrow}
        heading={home.partnerTeaser.heading}
        intro={home.partnerTeaser.body}
        ctaLabel={home.partnerTeaser.ctaLabel}
        ctaHref="/for-partners"
        qualifiersLabel={home.partnerTeaser.qualifiersLabel}
        qualifiers={home.partnerTeaser.qualifiers ?? []}
      />
      <EnquiryForm
        index="08"
        eyebrow={home.enquiry.eyebrow}
        heading={home.enquiry.heading}
        intro={home.enquiry.intro}
        locale={locale}
        fork={{
          chosenIndex: "01",
          chosenTitle: home.enquiry.fork.chosenLabel,
          chosenBody: home.enquiry.fork.chosenBody,
          undecidedIndex: "02",
          undecidedTitle: home.enquiry.fork.openLabel,
          undecidedBody: home.enquiry.fork.openBody,
        }}
        // Labels come from the registry, so the form and the table can never
        // disagree about which five jurisdictions exist.
        jurisdictions={countries.map((c) => ({ value: c.code, label: c.name }))}
        openOptions={[
          { value: "undecided", label: home.enquiry.fork.undecidedOption },
          { value: "other", label: home.enquiry.fork.otherOption },
        ]}
        budget={{
          legend: home.enquiry.budget.label,
          options: [
            { value: "500", label: home.enquiry.budget.upTo500 },
            { value: "800", label: home.enquiry.budget.upTo800 },
            { value: "over800", label: home.enquiry.budget.over800 },
            { value: "unknown", label: home.enquiry.budget.unknown },
          ],
        }}
        timeline={{
          legend: home.enquiry.timeline.label,
          options: [
            { value: "fast", label: home.enquiry.timeline.fast },
            { value: "half-year", label: home.enquiry.timeline.halfYear },
            { value: "year", label: home.enquiry.timeline.year },
            { value: "browsing", label: home.enquiry.timeline.browsing },
          ],
        }}
        goals={{
          legend: home.enquiry.goals.label,
          hint: home.enquiry.goals.hint,
          options: [
            { value: "residency", label: home.enquiry.goals.residency },
            { value: "tax", label: home.enquiry.goals.tax },
            { value: "passport", label: home.enquiry.goals.passport },
            { value: "business", label: home.enquiry.goals.business },
            { value: "property", label: home.enquiry.goals.property },
          ],
        }}
        situation={{
          legend: home.enquiry.contact.situationLabel,
          hint: home.enquiry.contact.situationHint,
        }}
        contact={{
          legend: home.enquiry.contact.contactLabel,
          name: home.enquiry.contact.nameLabel,
          email: home.enquiry.contact.emailLabel,
        }}
        consent={home.enquiry.contact.consentLabel}
        fine={home.enquiry.fine}
        privacyLabel={home.enquiry.privacyLabel}
        submit={home.enquiry.contact.submitLabel}
        sent={{
          title: home.enquiry.result.sentTitle,
          body: home.enquiry.result.sentBody,
        }}
        broke={{
          title: home.enquiry.result.brokeTitle,
          body: home.enquiry.result.brokeBody,
        }}
        failed={{
          title: home.enquiry.result.failedTitle,
          body: home.enquiry.result.failedBody,
        }}
        honeypot={home.enquiry.contact.honeypotLabel}
      />
    </main>
  );
}
