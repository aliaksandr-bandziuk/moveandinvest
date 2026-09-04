import {
  CALC_CODES,
  DEFAULTS,
  compute,
  minimumFor,
  type CalcCode,
  type CalcInput,
  type Computed,
} from "./costModel";

// THE ARITHMETIC BEHIND THE CALCULATOR, in lib rather than beside the component
// that shows it — because two things now need it and they sit on opposite sides
// of the network.
//
// The calculator renders rows from it. The enquiry route rebuilds the same
// answer from the figures a reader's link carried, so the email that lands in
// the inbox says what that reader actually saw. Recomputing rather than
// trusting numbers posted by a browser is not paranoia about tampering — the
// stake is one line in an internal email — it is the same rule the whole site
// runs on: a figure is published only if it came from the model.
//
// What is NOT here: anything about drawing. Scale, ordering for display and the
// grouping of lines into coloured slices stay in the component, because they
// are decisions about a picture and this file has no picture.

/** Rounded the way the site publishes: a calculator printing €435,329 beside a
 *  page printing €435,000 contradicts its own site. */
export const CALC_ROUND_TO = 1_000;

export const roundPublished = (value: number) =>
  Math.round(value / CALC_ROUND_TO) * CALC_ROUND_TO;

/** The basis, fixed rather than asked: every published figure on this site
 *  counts the first cycle once. See docs/calculator-spec-2026-09-03.md. */
export const CALC_YEARS = 1;

export interface Totals {
  code: CalcCode;
  /** The programme's own floor, in euro. The number it advertises. */
  advertised: number;
  /** What clearing that floor actually costs, all in. */
  real: number;
  /** real − advertised: taxes, duties, contributions and intermediaries. */
  extras: number;
  /** The priced lines behind `real`. */
  result: Computed;
}

/**
 * @param amount What the reader says the asset costs. Defaults to the
 *   programme's own floor. Above it the percentage lines grow; below it the
 *   floor still governs, so the totals are built at the floor.
 */
export function totalsFor(
  code: CalcCode,
  rest: Omit<CalcInput, "amount">,
  amount?: number,
): Totals {
  const advertised = minimumFor(code, { ...rest, amount: 0 });
  const priced = Math.max(advertised, amount ?? 0);
  const result = compute(code, { ...rest, amount: priced });

  return {
    code,
    advertised: roundPublished(advertised),
    real: roundPublished(result.total),
    extras: roundPublished(result.total) - roundPublished(advertised),
    result,
  };
}

/** The defaults every caller starts from, with the fixed basis applied and the
 *  amount removed — the amount is the one thing a reader supplies. */
export function baseInputs(): Record<CalcCode, Omit<CalcInput, "amount">> {
  return Object.fromEntries(
    CALC_CODES.map((code) => {
      const { amount: _amount, ...rest } = DEFAULTS[code];
      return [code, { ...rest, years: CALC_YEARS } as Omit<CalcInput, "amount">];
    }),
  ) as Record<CalcCode, Omit<CalcInput, "amount">>;
}

export interface CalcSummary {
  /** What the reader said they had, in euro. */
  budget: number;
  /** Programmes the budget covers, cheapest first. */
  fits: CalcCode[];
  /** The cheapest programme it does not cover, and by how much. Absent when
   *  everything fits. */
  nearest?: { code: CalcCode; short: number };
  /** Property prices the reader typed into a programme's own working. Empty
   *  when they left every one at its floor, which is the usual case. */
  amounts: Partial<Record<CalcCode, number>>;
  /** The same parameters, written out again from the parsed numbers. Use this
   *  and never the caller's string when building a link: what comes back here
   *  is provably digits and known keys, and what came in is whatever a browser
   *  posted. */
  params: string;
}

/** Longer than any legitimate value — four amounts and a budget — and short
 *  enough that a parse can never be expensive. */
const MAX_PARAMS = 200;
const DIGITS = /^\d{1,9}$/;

/**
 * Rebuilds the calculator's answer from the parameters its share link carries:
 * `value=500000&gr.amount=450000`.
 *
 * STRICT ON THE WAY IN, and deliberately so. This string is the only thing
 * that crosses from a browser into an email, so it is not text: every key is
 * checked against a fixed set, every value must be plain digits, and one bad
 * pair discards the whole thing rather than half of it. A malformed string is
 * not an error — the enquiry itself is unaffected; it simply arrives without
 * the calculator's context.
 */
export function summarise(params: string): CalcSummary | undefined {
  if (!params || params.length > MAX_PARAMS) return undefined;

  let budget = 0;
  const amounts: Partial<Record<CalcCode, number>> = {};

  for (const [key, raw] of new URLSearchParams(params)) {
    if (!DIGITS.test(raw)) return undefined;
    const value = Number(raw);

    if (key === "value") {
      budget = value;
      continue;
    }
    const match = /^([a-z]{2})\.amount$/.exec(key);
    const code = match?.[1] as CalcCode | undefined;
    if (!code || !CALC_CODES.includes(code)) return undefined;
    amounts[code] = value;
  }

  if (budget <= 0) return undefined;

  const inputs = baseInputs();
  const totals = CALC_CODES.map((code) =>
    totalsFor(code, inputs[code], amounts[code]),
  ).sort((a, b) => a.real - b.real);

  const fits = totals.filter((row) => budget >= row.real);
  const missed = totals.find((row) => budget < row.real);

  const canonical = new URLSearchParams();
  canonical.set("value", String(budget));
  for (const code of CALC_CODES) {
    const amount = amounts[code];
    if (amount !== undefined) canonical.set(`${code}.amount`, String(amount));
  }

  return {
    budget,
    fits: fits.map((row) => row.code),
    ...(missed
      ? { nearest: { code: missed.code, short: missed.real - budget } }
      : {}),
    amounts,
    params: canonical.toString(),
  };
}
