import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import {
  CostCalculator,
  type CostCalculatorJurisdiction,
  type CostCalculatorLabels,
} from "@/components/country";
import {
  AED_MINIMUM_AED,
  AED_RATE_CHECKED_ON,
  CALC_CODES,
  UPDATED_ON,
  type CalcCode,
  type CalcInput,
  linesFor,
} from "@/lib/costModel";
import {
  currencyFormatter,
  formatEur,
  percentText,
} from "@/components/country/CostCalculator/format";
import { buildRow, type Row } from "@/components/country/CostCalculator/rows";
import { baseInputs } from "@/lib/calcSummary";
import { buildMetadata } from "@/lib/metadata";
import { ENQUIRY_HREF, SOURCES_HREF, slugHref } from "@/lib/routes";
import { CalcEnquiryForm } from "@/components/marketing";
import { sanityFetch } from "@/sanity/client";
import { COUNTRY_ROWS_QUERY, HOME_TAGS } from "@/sanity/queries";
import type { CountryRowResult } from "@/sanity/types";

import styles from "./page.module.scss";

// /calculator — what a route actually costs, at the reader's own numbers.
//
// A ROUTE OF ITS OWN RATHER THAN A SECTION OF THE HOME PAGE, and the reasoning
// is the same the enquiry made on 31 August. A tool is the thing people link
// to: Get Golden Visa's transfer-tax calculator is a page, and it is the page
// their competitors' articles cite. A fragment cannot carry its own title,
// cannot be counted separately, and cannot be handed to a partner firm as
// "this is what your leads read before they wrote to you".
//
// ITS COPY IS NOT IN SANITY, and that is deliberate rather than a shortcut.
// The head of /sources lives in the dataset while its table lives in
// src/lib/sourceData.ts, because a figure that can be edited in Studio is a
// figure that can move without its evidence moving. This page is that argument
// taken one step further: it is ALL table. The labels name lines of a model
// whose keys are defined in code, so a label edited in Studio against a line
// that no longer exists would render an empty column with no error anywhere.
// They live in messages/, beside every other UI string on the site.
//
// WHAT IT DOES NOT ASK FOR. Family composition — see the note at the head of
// the component, and docs/costmodel-verification-2026-09-02.md for the data
// that does not exist to support it.
const ROUTE = "/calculator";

/** The three members of next-intl's translator this page needs, named rather
 *  than imported: `t` for an ordinary string, `raw` for a TEMPLATE whose
 *  placeholder the browser fills, and `has` for a message that is allowed not
 *  to exist. */
interface Translator {
  (key: string, values?: Record<string, string>): string;
  raw: (key: string) => unknown;
  has: (key: string) => boolean;
}

function buildLabels(t: Translator): CostCalculatorLabels {
  // The line labels, assembled from the model rather than typed out: every
  // line the model defines gets a lookup, so a line added in costModel.ts
  // without its three translations shows its own key on the page instead of an
  // empty cell. Loud beats blank — an empty row in a cost table reads as a
  // charge of nothing.
  //
  // KEYED BY JURISDICTION AND THEN BY LINE, and the nesting is not a matter of
  // taste: next-intl reads "." as its own nesting separator, so a leaf key
  // written "gr.transfer-tax" is rejected — and it rejects the whole namespace
  // with it, which is how twenty-four labels disappeared at once and the page
  // rendered its own keys.
  const lines: Record<string, string> = {};
  const lineNotes: Record<string, string> = {};
  for (const code of CALC_CODES) {
    for (const line of linesFor(code)) {
      const key = `${code}.${line.key}`;
      const message = `lines.${code}.${line.key}`;
      lines[key] = t.has(message) ? t(message) : key;
      const noteMessage = `lineNotes.${code}.${line.key}`;
      if (t.has(noteMessage)) lineNotes[key] = t(noteMessage);
    }
  }

  return {
    bandTitle: t("bandTitle"),
    bandNote: t("bandNote"),

    // THE ONLY QUESTION. See docs/calculator-spec-2026-09-03.md: a programme's
    // variants are a sentence under its own row, not a control at the top.
    qValue: t("qValue"),
    valueAria: t("valueAria"),
    sliderAria: t("sliderAria"),

    colProgramme: t("colProgramme"),
    colAdvertised: t("colAdvertised"),
    capAdvertised: t("capAdvertised"),
    capReal: t("capReal"),
    colReal: t("colReal"),
    colBar: t("colBar"),
    colYours: t("colYours"),

    emptyPrompt: t("emptyPrompt"),
    fits: t("fits"),

    // One sentence per programme, naming its variants with their figures.
    notes: {
      gr: t("notes.gr"),
      pt: t("notes.pt"),
      mt: t("notes.mt"),
      ae: t("notes.ae"),
    },

    workingLabel: t("workingLabel"),
    amountLabel: t("amountLabel"),
    structureLabel: t("structureLabel"),
    groups: {
      "purchase-tax": t("groups.purchase-tax"),
      "state-contribution": t("groups.state-contribution"),
      lease: t("groups.lease"),
      professional: t("groups.professional"),
      agency: t("groups.agency"),
      fund: t("groups.fund"),
      permit: t("groups.permit"),
    },

    basisNote: t("basisNote"),
    ctaHeading: t("ctaHeading"),
    ctaLabel: t("ctaLabel"),
    ctaNote: t("ctaNote"),
    dialogTitle: t("dialogTitle"),
    dialogClose: t("dialogClose"),
    dialogNote: t("dialogNote"),

    columnLine: t("columnLine"),
    columnBasis: t("columnBasis"),
    columnAmount: t("columnAmount"),
    flat: t("flat"),
    discount: t("discount"),
    confidence: {
      primary: t("confidence.primary"),
      secondary: t("confidence.secondary"),
      custom: t("confidence.custom"),
    },
    sourceLabel: t("sourceLabel"),
    lines,
    lineNotes,

    share: t("share"),
    shareDone: t("shareDone"),
    jurisdictionCta: t("jurisdictionCta"),

    // TEMPLATES, READ RAW. Each carries a placeholder only the browser can
    // fill, and `t()` parses every message as ICU, so passing one through it
    // without values throws FORMATTING_ERROR and paints the string red on the
    // page. See "Messages that keep their placeholders" in CLAUDE.md.
    //
    // They are also why the verdict is written with a colon rather than as
    // "2 programmes qualify": Russian and Polish decline the noun after 1,
    // after 2-4 and after 5 or more, and a sentence built by string
    // replacement cannot do that. "хватает на 2 из четырёх" is correct at
    // every count there is.
    verdictSome: t.raw("verdictSome") as string,
    verdictAll: t.raw("verdictAll") as string,
    verdictNearest: t.raw("verdictNearest") as string,
    verdictNone: t.raw("verdictNone") as string,
    fitsSub: t.raw("fitsSub") as string,
    missBy: t.raw("missBy") as string,
    missSub: t.raw("missSub") as string,
    cutTag: t.raw("cutTag") as string,
    perYear: t.raw("perYear") as string,
  };
}

/**
 * Every figure the prose below the calculator names, computed from the model
 * rather than typed into the copy.
 *
 * THE COPY MUST NOT BE ABLE TO DISAGREE WITH THE TABLE. A sentence that says
 * "on Malta the extra is €126,000" is the same claim as the row above it, and
 * two places to write one claim is one place for it to go stale — the exact
 * failure /sources exists to prevent. So the messages carry `{mtGap}` and this
 * fills it, from `buildRow`, which is the function the calculator itself
 * calls. A rule changes in costModel.ts and the paragraph changes with it.
 */
function bodyFigures(locale: string): Record<string, string> {
  const format = currencyFormatter(locale);
  const eur = (value: number) => formatEur(value, format);

  // The same defaults the calculator itself renders from and the enquiry route
  // rebuilds from, with room for the one thing this page varies: a Greek tier,
  // a Maltese route. See src/lib/calcSummary.ts.
  const base = baseInputs();
  const rest = (code: CalcCode, extra: Partial<CalcInput> = {}) =>
    ({ ...base[code], ...extra }) as Omit<CalcInput, "amount">;
  const line = (row: Row, key: string) =>
    row.result.lines.find((entry) => entry.key === key)?.eur ?? 0;
  const share = (row: Row) => percentText(row.result.extras / row.result.total, locale);

  const gr = buildRow("gr", rest("gr"));
  const grLow = buildRow("gr", rest("gr", { tier: "250" }));
  const grHigh = buildRow("gr", rest("gr", { tier: "800" }));
  const pt = buildRow("pt", rest("pt"));
  const mt = buildRow("mt", rest("mt"));
  const mtRent = buildRow("mt", rest("mt", { route: "rent" }));
  const ae = buildRow("ae", rest("ae"));

  // What filing online actually saves, to the nearest hundred: a quarter of
  // the lines the model marks discountable, not a figure anybody typed.
  const ptOnlineSaving =
    Math.round(
      (pt.result.lines
        .filter((entry) => entry.applies && entry.discountable)
        .reduce((sum, entry) => sum + entry.eur, 0) *
        0.25) /
        100,
    ) * 100;

  const transferTax = gr.result.lines.find((entry) => entry.key === "transfer-tax");

  return {
    grAdvertised: eur(gr.advertised),
    grReal: eur(gr.real),
    grGap: eur(gr.extras),
    grLow: eur(grLow.advertised),
    grLowReal: eur(grLow.real),
    grHigh: eur(grHigh.advertised),
    grHighReal: eur(grHigh.real),
    grRate: `${((transferTax?.appliedRate ?? 0) * 100).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`,
    grTransferTax: eur(line(gr, "transfer-tax")),

    aeAdvertised: eur(ae.advertised),
    aeReal: eur(ae.real),
    aeGap: eur(ae.extras),
    aeAed: `${AED_MINIMUM_AED.toLocaleString(locale)} AED`,
    aeDld: eur(line(ae, "dld-transfer")),
    aeDate: AED_RATE_CHECKED_ON,

    mtAdvertised: eur(mt.advertised),
    mtReal: eur(mt.real),
    mtGap: eur(mt.extras),
    mtShare: share(mt),
    mtStampDuty: eur(line(mt, "stamp-duty")),
    mtAdminFee: eur(line(mt, "admin-fee")),
    mtContribution: eur(line(mt, "contribution")),
    mtNgo: eur(line(mt, "ngo-donation")),
    mtContribTotal: eur(
      line(mt, "admin-fee") + line(mt, "contribution") + line(mt, "ngo-donation"),
    ),
    mtRent: eur(mtRent.advertised),
    mtRentFirstYear: eur(mtRent.real),

    ptAdvertised: eur(pt.advertised),
    ptReal: eur(pt.real),
    ptShare: share(pt),
    ptAnalysis: eur(line(pt, "aima-analysis")),
    ptGrant: eur(line(pt, "aima-grant")),
    ptRenewal: eur(line(pt, "aima-renewal")),
    ptOnlineSaving: eur(ptOnlineSaving),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });

  return buildMetadata({
    seo: { metaTitle: t("metaTitle"), metaDescription: t("metaDescription") },
    locale,
    href: ROUTE,
  });
}

export default async function Calculator({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [countries, t] = await Promise.all([
    // For the NAMES and the links only — every figure on this page comes from
    // src/lib/costModel.ts. Taking the names from the registry rather than
    // hardcoding four headings is what stops this page calling a country
    // something the rest of the site does not.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "calculator" }),
  ]);

  const jurisdictions: CostCalculatorJurisdiction[] = countries
    .filter((country): country is CountryRowResult & { code: CalcCode } =>
      (CALC_CODES as string[]).includes(country.code),
    )
    .map((country) => ({
      code: country.code,
      name: country.name,
      href: country.page
        ? getPathname({ href: slugHref(country.page.slug), locale })
        : undefined,
    }));

  const labels = buildLabels(t as unknown as Translator);

  // One lookup for the prose, with every model figure already in scope, so a
  // paragraph that names a sum cannot be written without it.
  const figures = bodyFigures(locale);
  const b = (key: string) => t(`body.${key}`, figures);

  return (
    <>
      <CostCalculator
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        intro={t("intro", figures)}
        jurisdictions={jurisdictions}
        labels={labels}
        enquiryHref={getPathname({ href: ENQUIRY_HREF, locale })}
        enquiryForm={
          <CalcEnquiryForm
            labels={{
              nameLabel: t("enquiry.nameLabel"),
              namePlaceholder: t("enquiry.namePlaceholder"),
              emailLabel: t("enquiry.emailLabel"),
              emailPlaceholder: t("enquiry.emailPlaceholder"),
              reachLabel: t("enquiry.reachLabel"),
              reachPlaceholder: t("enquiry.reachPlaceholder"),
              messageLabel: t("enquiry.messageLabel"),
              messagePlaceholder: t("enquiry.messagePlaceholder"),
              consentLabel: t("enquiry.consentLabel"),
              honeypotLabel: t("enquiry.honeypotLabel"),
              submitLabel: t("enquiry.submitLabel"),
              fine: t("enquiry.fine"),
              privacyLabel: t("enquiry.privacyLabel"),
              sent: { title: t("enquiry.sent.title"), body: t("enquiry.sent.body") },
              error: { title: t("enquiry.error.title"), body: t("enquiry.error.body") },
              broke: { title: t("enquiry.broke.title"), body: t("enquiry.broke.body") },
            }}
            locale={locale}
            privacyHref={getPathname({ href: "/privacy", locale })}
          />
        }
        locale={locale}
      />

      {/* THE PROSE, AND EVERY FIGURE IN IT COMES FROM `figures`. The headings
          carry the terms this page is meant to be found by; the sentences
          carry the same numbers the table above prints, filled from the model
          so the two cannot drift apart. */}
      <div className={`container ${styles.body}`}>
        <section className={styles.block}>
          <h2 className={styles.h2}>{b("extrasHeading")}</h2>
          <p className={styles.lead}>{b("extrasLead")}</p>
          <dl className={styles.defs}>
            {(["Taxes", "State", "Permits", "Agents"] as const).map((part) => (
              <div key={part} className={styles.def}>
                <dt className={styles.term}>{b(`extras${part}Term`)}</dt>
                <dd className={styles.desc}>{b(`extras${part}`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>{b("countriesHeading")}</h2>
          <div className={styles.countries}>
            {CALC_CODES.map((code) => (
              <article key={code} className={styles.country}>
                <h3 className={styles.h3}>{b(`${code}Heading`)}</h3>
                <p className={styles.text}>{b(`${code}Text`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>{b("excludedHeading")}</h2>
          <p className={styles.lead}>{b("excludedLead")}</p>
          <dl className={styles.defs}>
            {(["Family", "After", "Owning", "Rate"] as const).map((part) => (
              <div key={part} className={styles.def}>
                <dt className={styles.term}>{b(`excluded${part}Term`)}</dt>
                <dd className={styles.desc}>{b(`excluded${part}`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.block}>
          <h2 className={styles.h2}>{b("sourcesHeading")}</h2>
          <p className={styles.text}>{b("sourcesText")}</p>
          <a className={styles.sourcesLink} href={getPathname({ href: SOURCES_HREF, locale })}>
            {b("sourcesLink")}
          </a>
        </section>
      </div>

      {/* THE DATE, DERIVED. docs/competitors-strengths-2026-09-02.md names the
          home page's hardcoded "Updated 15 Aug 2026" as the most awkward gap on
          a site whose own copy says an answer expires. This one is the newest
          date on which any line above was read against its source, computed
          from those lines — so it cannot be refreshed while they stand still,
          and cannot go stale while they move. */}
      <div className={`container ${styles.pageFoot}`}>
        <p className={styles.updated}>{t("updated", { date: UPDATED_ON })}</p>
        <p className={styles.method}>{t("method")}</p>
      </div>
    </>
  );
}
