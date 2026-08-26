// The route finder's entire decision logic, as pure functions over plain
// data. No React, no DOM, no Sanity types — so the same module runs on the
// server (to render the fallback) and in the browser (to recompute on every
// answer), and can be tested without a renderer.
//
// Three properties this file is built around:
//
// 1. FILTERS ARE MONOTONE. "Within six months" is a ceiling, not a band: a
//    route that takes three weeks also satisfies it. Same for budget. A
//    reader who relaxes a constraint can only ever gain options, never swap
//    them — which is what makes the block feel like it is narrowing rather
//    than shuffling.
//
// 2. BUDGET IS CHECKED AGAINST THE REAL TOTAL, not the advertised threshold.
//    That is the payoff of section 04, and verification made it sharper:
//    Malta advertises €375,000 and costs €501,000, because the government
//    contribution, the administrative fee and the 5% stamp duty are not
//    optional. A reader with a €500,000 ceiling should not be shown Malta.
//
// 3. MISSING DATA NEVER DISQUALIFIES. A jurisdiction whose speed band has not
//    been filled yet passes that condition instead of failing it. The site's
//    standing rule is that it never silently drops a jurisdiction for want of
//    a field — the comparison table does the same with em dashes.

/** A ceiling the reader is willing to go up to, not a band they sit in.
 *  Rebanded 23 Aug 2026 when the figures were verified: the old €300,000 rung
 *  matched nothing at all once Greece's threshold turned out to be €400,000
 *  and Malta's €375,000 plus €99,500 of government charges. */
export type BudgetCeiling = "500" | "800" | "any";
/** The latest the reader can accept a first permit. Also a ceiling. */
export type SpeedNeed = "fast" | "half-year" | "any";
export type Priority = "passport" | "tax" | "speed";
export type SpeedBand = "weeks" | "months" | "long";

export interface Jurisdiction {
  id: string;
  code: string;
  name: string;
  /** The page for this jurisdiction, ALREADY RESOLVED for the reader's
   *  language. Undefined while the page is an unpublished draft.
   *
   *  A resolved string rather than a route object, unlike everywhere else in
   *  this codebase: RouteFinder filters on the client and renders a plain <a>
   *  rather than next-intl's Link, so there is nothing here to do the
   *  resolution — the route is compiled once on the server, in the page. */
  href?: string;
  /** costAdvertisedEur, or null until both figures are verified. */
  advertised: number | null;
  /** costExtrasEur, or null until both figures are verified. */
  extras: number | null;
  speedBand: SpeedBand | null;
  strengths: Priority[];
  /** Free strings from the country page, already in the reader's language. */
  timeToPermit: string;
  taxRegime: string;
}

export interface Answers {
  budget?: BudgetCeiling;
  speed?: SpeedNeed;
  priority?: Priority;
}

/** Which condition ruled a jurisdiction out. Used to explain the exclusion. */
export type FailReason = "budget" | "speed" | "priority";

const BUDGET_CEILING: Record<BudgetCeiling, number> = {
  "500": 500_000,
  "800": 800_000,
  any: Number.POSITIVE_INFINITY,
};

// Cumulative by construction: each need lists every band that satisfies it.
const SPEED_ALLOWS: Record<SpeedNeed, SpeedBand[]> = {
  fast: ["weeks"],
  "half-year": ["weeks", "months"],
  any: ["weeks", "months", "long"],
};

/** The number a reader actually has to find, or null if unverified. */
export function realTotal(j: Jurisdiction): number | null {
  if (typeof j.advertised !== "number" || typeof j.extras !== "number") {
    return null;
  }
  return j.advertised + j.extras;
}

/**
 * Every condition this jurisdiction fails, in the order the questions are
 * asked. An empty array means it fits everything answered so far — including
 * the case where nothing has been answered yet.
 */
export function failures(j: Jurisdiction, answers: Answers): FailReason[] {
  const failed: FailReason[] = [];

  const total = realTotal(j);
  if (answers.budget && total !== null && total > BUDGET_CEILING[answers.budget]) {
    failed.push("budget");
  }

  if (answers.speed && j.speedBand && !SPEED_ALLOWS[answers.speed].includes(j.speedBand)) {
    failed.push("speed");
  }

  if (answers.priority && j.strengths.length > 0 && !j.strengths.includes(answers.priority)) {
    failed.push("priority");
  }

  return failed;
}

// How hard each constraint is for a READER to relax, not how hard it is to
// satisfy. Doubling a budget is not a decision anyone makes at a comparison
// table; accepting that a route is strong on something else is. So when
// nothing fits and a nearest miss has to be chosen, the tie goes to whoever
// misses on the cheapest thing to give up.
//
// This matters more than it looks: with five jurisdictions and 27 possible
// answer sets, 13 have no exact match. The compromise is not an edge case —
// it is the block's second main state, and picking well inside it is most of
// what makes the finder feel like it knows the material.
const RELAX_COST: Record<FailReason, number> = {
  budget: 3,
  speed: 2,
  priority: 1,
};

export interface Ranking {
  /** Jurisdictions that fail nothing, in the input order (Sanity's). */
  fits: Jurisdiction[];
  /** The rest, each with the FIRST condition it failed. */
  cut: { jurisdiction: Jurisdiction; reason: FailReason }[];
  /** The one to show. Null only when the list itself is empty. */
  best: Jurisdiction | null;
  /** True when nothing fits and `best` is a nearest miss, not a match. */
  isCompromise: boolean;
  /** What `best` fails. Empty unless `isCompromise`. Ordered cheapest first,
   *  so [0] is the constraint worth asking the reader to move. */
  mustRelax: FailReason[];
}

/**
 * Ranks the list against the answers.
 *
 * When nothing fits, this deliberately does NOT render an empty state. It
 * returns the jurisdiction that fails fewest conditions and marks the result
 * a compromise, so the block can say "nothing matches all three, here is the
 * closest and here is where it diverges". An empty state would end the
 * conversation; a named compromise continues it, and being explicit about the
 * divergence is the same promise the rest of the site makes.
 */
export function rank(list: Jurisdiction[], answers: Answers): Ranking {
  const scored = list.map((jurisdiction) => ({
    jurisdiction,
    failed: failures(jurisdiction, answers),
  }));

  const fits = scored.filter((s) => s.failed.length === 0).map((s) => s.jurisdiction);
  const cut = scored
    .filter((s) => s.failed.length > 0)
    // `failures` returns them in question order, so [0] is the first
    // condition that ruled this jurisdiction out — the one worth naming.
    .map((s) => ({ jurisdiction: s.jurisdiction, reason: s.failed[0] as FailReason }));

  if (fits.length > 0) {
    return { fits, cut, best: fits[0] ?? null, isCompromise: false, mustRelax: [] };
  }

  // Nothing fits. Cheapest-to-relax wins, not fewest-failures: a jurisdiction
  // that misses only on "strong at something else" beats one that misses only
  // on speed, and both beat one that misses on budget. Equal cost keeps
  // Sanity's order, which is the order every other list on the site uses.
  const cost = (failed: FailReason[]) =>
    failed.reduce((sum, reason) => sum + RELAX_COST[reason], 0);

  // Secondary sort on the raw count, because the weights collide: missing on
  // budget alone and missing on both speed and priority both cost 3. Asking a
  // reader to move one thing beats asking them to move two, so the shorter
  // list wins the tie — otherwise "up to €500k, weeks, speed matters" answers
  // Portugal (slow AND strong at something else) over the UAE, which fits.
  const nearest = [...scored].sort(
    (a, b) => cost(a.failed) - cost(b.failed) || a.failed.length - b.failed.length,
  )[0];

  return {
    fits,
    cut,
    best: nearest?.jurisdiction ?? null,
    isCompromise: nearest !== undefined,
    mustRelax: [...(nearest?.failed ?? [])].sort(
      (a, b) => RELAX_COST[a] - RELAX_COST[b],
    ),
  };
}
