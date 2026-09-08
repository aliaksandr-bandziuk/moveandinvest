// WHEN THE CITIZENSHIP CLOCK ACTUALLY LETS YOU FILE, AS DATA.
//
// Every page in this market answers the question with a single number per
// country — "Portugal: 10 years, Greece: 7, Malta: 5" — and every one of those
// numbers is wrong for somebody, because a naturalisation period is three
// separate rules pretending to be one:
//
//   1. HOW LONG. The period itself. This is the number the market publishes.
//   2. FROM WHEN. The date the period is counted from, which is not always the
//      date on the permit and changed in Portugal on 19 May 2026.
//   3. COUNTED HOW. Whether the years must be unbroken, and if not, what
//      window broken periods may be spread across.
//
// Get any one of the three wrong and the answer is out by years. The Portuguese
// case is the sharpest: an investor who applied for a residence permit in 2023
// and waited two and a half years for the card was, under the law as it stood
// in April 2026, five years from a passport counted from the application. Under
// the law from 19 May 2026 they are ten years from it counted from the card —
// a swing of more than seven years, from two provisions in two different
// articles that moved on the same day.
//
// --- WHAT THIS MODULE WILL NOT DO -------------------------------------------
//
// IT WILL NOT GUESS. Where a rule has not been read at its source, the result
// carries a caveat key and the UI prints it; it does not quietly fall back to
// the figure everyone else publishes. Two such gaps exist today and both are
// named below: Greece's reduced periods, and Malta's four-of-six arithmetic
// once residence has been broken.
//
// IT WILL NOT MODEL CYPRUS. Same standing instruction as costModel.ts: nothing
// Cypriot is published until a human has read a primary source.
//
// IT WILL NOT TURN THE UAE INTO A NUMBER. Emirati naturalisation is by
// nomination, not application; there is no period to count because there is no
// filing to count towards. A tool that printed "30 years" or an em dash would
// both mislead. It returns a verdict of its own instead.
//
// --- SOURCES ----------------------------------------------------------------
//
// Portugal: Lei 37/81 as amended by Lei Orgânica 1/2026 of 18 May 2026, in
// force 19 May — art. 6(1)(b) for the periods, art. 7(2) for the transitional
// rule, art. 15(1) for what counts as legal residence, art. 15(3) for the
// aggregation windows, and art. 5 of that law for the repeal of art. 15(4).
// Read at the Diário da República PDF, 7 September 2026.
// docs/portugal-verification-2026-08-28.md
//
// Greece: Law 3284/2004, the Citizenship Code, art. 5(1)(δ) for the seven
// continuous years, art. 5(1)(ε) for the exhaustive list of qualifying titles
// (the investor permit is item αθ), art. 5(3) excluding temporary titles, and
// art. 5Α for the language and history conditions. Read at the Ministry of the
// Interior's consolidated text to 17 September 2025, on 7 September 2026.
// docs/greece-citizenship-verification-2026-09-07.md
//
// Malta: Cap. 188, the Maltese Citizenship Act — twelve continuous months
// immediately before the application plus four years within the six preceding
// them. docs/malta-verification-2026-09-01.md

import type { Locale } from "@/i18n/routing";

export type NatCode = "pt" | "gr" | "mt" | "ae";

/** THE APPLICANT'S GROUP, NOT THEIR COUNTRY, and the distinction is the reason
 *  this is a two-value type rather than a list of nationalities.
 *
 *  Portugal's short period is for citizens of EU member states and of
 *  Portuguese-speaking countries together — one rule, two very different sets
 *  of people. Greece's reduction (see CAVEATS.grReduction) is for EU citizens
 *  and spouses of Greeks, which is a different grouping again. Asking for a
 *  nationality would mean maintaining a map of every country in the world to
 *  two different groupings, and getting one wrong silently. Asking which group
 *  the reader is in puts the question where the reader can answer it. */
export type NationalityGroup = "eu-or-cplp" | "other";

export interface ClockInput {
  /** The date the FIRST residence permit was issued, ISO yyyy-mm-dd. */
  permitIssued: string;
  /** The date that permit was APPLIED for, ISO, when the reader knows it.
   *
   *  THE MOST CONSEQUENTIAL OPTIONAL FIELD ON THE SITE. Between 5 March 2024
   *  and 18 May 2026, art. 15(4) of the Portuguese Nationality Act counted the
   *  period from this date rather than from the permit, provided the permit was
   *  eventually granted — a provision written for an immigration queue that
   *  runs one to three years. Article 5 of Lei Orgânica 1/2026 repealed it. So
   *  this field changes the Portuguese answer by up to three years for anyone
   *  the transitional rule protects, and by nothing at all for everyone else. */
  permitApplied?: string;
  group: NationalityGroup;
  /** Whether a NATIONALITY application was already pending on 19 May 2026.
   *
   *  Note what this attaches to. Art. 7(2) of Lei Orgânica 1/2026 protects
   *  "procedimentos administrativos pendentes" — pending nationality
   *  proceedings. Holding a residence permit from 2021 does not help; having
   *  filed for citizenship on 18 May 2026 does. This is the single most
   *  misreported sentence of the Portuguese reform. */
  filedBefore19May2026: boolean;
  /** Whether residence has been unbroken since the permit was issued. */
  continuous: boolean;
}

/** What kind of answer the model could give. */
export type Verdict =
  /** A date, resting on provisions we have read. */
  | "computed"
  /** There is no application to make. The UAE, and only the UAE. */
  | "no-route"
  /** A rule applies that we have not read at its source. No date is given. */
  | "unread";

/** Which date the period was counted from. Rendered, not inferred: a reader
 *  who sees a date without knowing what it was counted from cannot check it. */
export type CountedFrom = "permit-issued" | "permit-applied";

/** Every caveat the model can attach. Keys rather than sentences, so the text
 *  lives in messages/ with the rest of the UI and exists in three languages. */
export type CaveatKey =
  /** PT: broken residence is summed only inside a 6, 9 or 12 year window. */
  | "ptWindow"
  /** PT: the answer rests on the transitional rule; the old text applies whole. */
  | "ptTransitional"
  /** PT: the permit queue no longer counts, art. 15(4) repealed 19 May 2026. */
  | "ptQueueGone"
  /** GR: the seven years must be unbroken; a gap restarts them. */
  | "grContinuous"
  /** GR: reduced periods exist for EU citizens and spouses of Greeks and we
   *  have NOT read how long they are. Named, not guessed. */
  | "grReduction"
  /** GR: temporary residence titles do not qualify at all, art. 5(3). */
  | "grTemporary"
  /** MT: with residence broken we cannot compute the four-of-six arithmetic
   *  without year-by-year presence, which this tool does not ask for. */
  | "mtBroken"
  /** MT: the twelve months immediately before the application must be
   *  continuous, whatever the earlier years look like. */
  | "mtFinalYear"
  /** Everywhere: the period is one condition of several. Language, civics,
   *  good character and fees are not modelled and can each stop an application
   *  that the calendar allows. */
  | "conditionsBeyondTime";

export interface ClockResult {
  code: NatCode;
  verdict: Verdict;
  /** ISO date, or null when the verdict is not "computed". */
  earliest: string | null;
  /** The period the answer rests on, in years. Null when not computed. */
  years: number | null;
  countedFrom: CountedFrom | null;
  /** The provision, as a short citation. Printed beside the date, because a
   *  date without its rule is the thing this site exists to be an alternative
   *  to. */
  instrument: string;
  caveats: CaveatKey[];
}

/** Splits an ISO date into three numbers, and throws rather than returning
 *  NaN on anything that is not one.
 *
 *  A separate function because `iso.split("-").map(Number)` destructured into
 *  three consts types each of them `number | undefined` under this project's
 *  `noUncheckedIndexedAccess`, and the two call sites were quietly coercing
 *  that away. The coercion is the bug: a malformed date would have produced a
 *  NaN year and rendered "NaN-06-01" as an answer about somebody's passport. */
function parseIso(iso: string): { y: number; m: number; d: number } {
  const parts = iso.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (parts.length !== 3 || !Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error(`Not an ISO date: "${iso}"`);
  }
  return { y, m, d };
}

/** Add whole years to an ISO date without a date library.
 *
 *  29 FEBRUARY IS WHY THIS IS NOT ONE LINE. `setFullYear` on 29 February 2024
 *  plus seven years gives 1 March 2031, silently — JavaScript rolls the
 *  overflow forward. For a tool whose whole subject is that a date is a date,
 *  a silent one-day drift on one input in 1,461 is the kind of defect that is
 *  never found and never forgiven. Clamping to the last day of the target
 *  month is the conventional legal reading and it is what is done here. */
export function addYears(iso: string, years: number): string {
  const { y, m, d } = parseIso(iso);
  const targetYear = y + years;
  const lastDayOfMonth = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
  const day = Math.min(d, lastDayOfMonth);
  return `${String(targetYear).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** The day Lei Orgânica 1/2026 came into force, and the boundary between the
 *  two Portuguese regimes. Art. 8 of that law: the day after publication. */
export const PT_REFORM_DATE = "2026-05-19";

const PT_YEARS_NEW: Record<NationalityGroup, number> = {
  "eu-or-cplp": 7,
  other: 10,
};
/** Before 19 May 2026 the period was five years for everybody, with no group
 *  distinction at all. The distinction is itself part of what the reform
 *  introduced. */
const PT_YEARS_OLD = 5;

/** Art. 15(3): broken periods are summed only if they fall inside a window of
 *  6, 9 or 12 years — stateless persons, CPLP and EU citizens, everyone else.
 *  Statelessness is not an input here, so the model carries the two it can
 *  determine. */
const PT_WINDOW: Record<NationalityGroup, number> = {
  "eu-or-cplp": 9,
  other: 12,
};

function portugal(input: ClockInput): ClockResult {
  const caveats: CaveatKey[] = ["conditionsBeyondTime"];

  // THE TRANSITIONAL BRANCH IS FIRST BECAUSE IT IS THE ONE THAT GETS LOST.
  // A reader protected by art. 7(2) is governed by the PREVIOUS TEXT ENTIRE —
  // not merely the previous period. That includes art. 15(4), under which the
  // clock ran from the date temporary residence was requested. Splitting the
  // period from the counting rule, which is how every summary of this reform
  // has been written, gives such a reader an answer that is wrong twice.
  if (input.filedBefore19May2026) {
    const from = input.permitApplied ?? input.permitIssued;
    caveats.push("ptTransitional");
    if (!input.continuous) caveats.push("ptWindow");
    return {
      code: "pt",
      verdict: "computed",
      earliest: addYears(from, PT_YEARS_OLD),
      years: PT_YEARS_OLD,
      countedFrom: input.permitApplied ? "permit-applied" : "permit-issued",
      instrument: "Lei 37/81, art. 6(1)(b) and art. 15(4) as they stood before 19 May 2026; Lei Orgânica 1/2026, art. 7(2)",
      caveats,
    };
  }

  const years = PT_YEARS_NEW[input.group];
  caveats.push("ptQueueGone");
  if (!input.continuous) caveats.push("ptWindow");
  return {
    code: "pt",
    verdict: "computed",
    earliest: addYears(input.permitIssued, years),
    years,
    // ALWAYS FROM THE PERMIT IN THE NEW REGIME, even when the reader gave us an
    // application date. Art. 15(1) counts lawful presence under a title, visa
    // or authorisation; a pending application for one is not a title. Using the
    // application date here would reproduce the repealed rule.
    countedFrom: "permit-issued",
    instrument: `Lei 37/81, art. 6(1)(b) and art. 15(1) as amended by Lei Orgânica 1/2026; window of ${PT_WINDOW[input.group]} years under art. 15(3)`,
    caveats,
  };
}

const GR_YEARS = 7;

function greece(input: ClockInput): ClockResult {
  const caveats: CaveatKey[] = [
    "conditionsBeyondTime",
    "grTemporary",
  ];

  // THE REDUCTION IS FLAGGED FOR EVERY EU READER AND NEVER APPLIED, because we
  // have not read how long it is. Art. 5(1)(δ) carries separate sentences for
  // EU citizens and for spouses of Greeks, and on 7 September 2026 every
  // rendering of the consolidated text we could reach truncated them. Printing
  // the figure in general circulation would be exactly the error this site
  // audits other sites for. So an EU reader is told the standard period AND
  // told that a shorter one exists which we have not verified — which is worse
  // service than a number and better service than a wrong number.
  if (input.group === "eu-or-cplp") caveats.push("grReduction");

  // SEVEN CONTINUOUS YEARS, and "continuous" is load-bearing rather than
  // decorative: unlike Portugal, the Greek Code offers no window inside which
  // broken periods may be summed. A gap does not shorten the total, it starts
  // it again — so with residence broken there is no date to give from the
  // inputs this tool asks for.
  if (!input.continuous) {
    caveats.push("grContinuous");
    return {
      code: "gr",
      verdict: "unread",
      earliest: null,
      years: GR_YEARS,
      countedFrom: null,
      instrument: "Law 3284/2004, art. 5(1)(δ)",
      caveats,
    };
  }

  return {
    code: "gr",
    verdict: "computed",
    earliest: addYears(input.permitIssued, GR_YEARS),
    years: GR_YEARS,
    countedFrom: "permit-issued",
    instrument: "Law 3284/2004, art. 5(1)(δ); qualifying titles art. 5(1)(ε), the investor permit at item αθ",
    caveats,
  };
}

/** Twelve continuous months immediately before the application, plus four years
 *  inside the six preceding them. The floor is therefore five years and the
 *  ceiling seven — a range, not a number, and the market publishes the floor. */
const MT_YEARS_MIN = 5;

function malta(input: ClockInput): ClockResult {
  const caveats: CaveatKey[] = ["conditionsBeyondTime", "mtFinalYear"];

  // WITH RESIDENCE BROKEN, MALTA IS THE ONE JURISDICTION WHERE WE COULD
  // COMPUTE AND WILL NOT. Four years inside the preceding six is arithmetic
  // over year-by-year presence, and this tool deliberately does not ask for
  // year-by-year presence: a control that demanded twelve numbers to answer one
  // question would not be filled in, and a half-filled one would produce a
  // confident wrong date. Saying so is the honest output.
  if (!input.continuous) {
    caveats.push("mtBroken");
    return {
      code: "mt",
      verdict: "unread",
      earliest: null,
      years: MT_YEARS_MIN,
      countedFrom: null,
      instrument: "Cap. 188, the Maltese Citizenship Act",
      caveats,
    };
  }

  return {
    code: "mt",
    verdict: "computed",
    earliest: addYears(input.permitIssued, MT_YEARS_MIN),
    years: MT_YEARS_MIN,
    countedFrom: "permit-issued",
    instrument: "Cap. 188 — twelve continuous months immediately before the application plus four years within the preceding six",
    caveats,
  };
}

function uae(): ClockResult {
  return {
    code: "ae",
    verdict: "no-route",
    earliest: null,
    years: null,
    countedFrom: null,
    instrument: "Federal Law 17/1972 as amended — naturalisation by nomination",
    caveats: [],
  };
}

export const NAT_CODES: NatCode[] = ["pt", "gr", "mt", "ae"];

/** The whole tool, as one pure function. */
export function clock(input: ClockInput): ClockResult[] {
  return [portugal(input), greece(input), malta(input), uae()];
}

/** The soonest date across the jurisdictions that produced one, for the
 *  summary line. Null when none did. */
export function soonest(results: ClockResult[]): ClockResult | null {
  const dated = results.filter((r) => r.earliest !== null);
  if (dated.length === 0) return null;
  return dated.reduce((a, b) => (a.earliest! <= b.earliest! ? a : b));
}

/** THE DEFAULT IS A REAL CASE, NOT AN EMPTY FORM.
 *
 *  A tool that opens blank shows nothing and teaches nothing; the reader has to
 *  do work before it says anything at all. This default is the case the whole
 *  page exists for — an investor whose permit was issued in the middle of the
 *  AIMA queue, who has not filed for citizenship, and who is not an EU or CPLP
 *  citizen. It is also the case where the 19 May 2026 reform costs the most. */
export const DEFAULT_INPUT: ClockInput = {
  permitApplied: "2023-03-01",
  permitIssued: "2025-06-01",
  group: "other",
  filedBefore19May2026: false,
  continuous: true,
};

/** Formats an ISO date for display. Month names come from the locale; the
 *  hand-written Russian month is deliberate, as elsewhere in this codebase —
 *  Intl abbreviates it and the abbreviation reads as a typo beside a legal
 *  citation. */
export function formatClockDate(iso: string, locale: Locale): string {
  const { y, m, d } = parseIso(iso);
  const RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  const PL = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
  const EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  if (locale === "ru") return `${d} ${RU[m - 1] ?? ""} ${y} года`;
  if (locale === "pl") return `${d} ${PL[m - 1] ?? ""} ${y}`;
  return `${d} ${EN[m - 1] ?? ""} ${y}`;
}
