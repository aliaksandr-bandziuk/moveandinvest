import {
  type CalcCode,
  type CalcInput,
  type Computed,
  compute,
  minimumFor,
} from "@/lib/costModel";

import { slices, type GroupSlice } from "./groups";

// One row of the answer: what a programme advertises, and what entering it
// actually costs.
//
// WHAT CHANGED AND WHY. The version this replaces built a row FROM the budget:
// it solved backwards for what the money could buy, so every figure in the row
// moved whenever the budget moved, and the bar changed length on every
// keystroke. Nobody could connect an action to a result, and the calculator
// was unreadable — see docs/calculator-spec-2026-09-03.md.
//
// Here a row is a fact about the programme and nothing else. The budget is not
// an input to it. It decides only two things, both outside this function: the
// verdict printed beside the row, and the order the rows are shown in. The
// bars therefore stand still and only the reader's own line moves across them.

export interface Row {
  code: CalcCode;
  /** The programme's own floor, in euro. The number it advertises. */
  advertised: number;
  /** What clearing that floor actually costs, all in, rounded the way the
   *  site publishes figures. */
  real: number;
  /** real − advertised: taxes, duties, contributions and intermediaries. */
  extras: number;
  /** The priced lines, for the table under the row. */
  result: Computed;
  /** Those lines folded into reading groups, for the structure bar. */
  groups: GroupSlice[];
}

/** Rounded the way the site publishes: `ROUND_TO` in the model is €1,000, and
 *  a calculator that prints €435,329 beside a page that prints €435,000 is a
 *  calculator that contradicts its own site. */
const ROUND_TO = 1_000;
const round = (value: number) => Math.round(value / ROUND_TO) * ROUND_TO;

/**
 * @param amount What the reader says the asset costs. Defaults to the
 *   programme's own floor. Above it the percentage lines grow; below it the
 *   floor still governs, so the row is built at the floor.
 */
export function buildRow(
  code: CalcCode,
  rest: Omit<CalcInput, "amount">,
  amount?: number,
): Row {
  const advertised = minimumFor(code, { ...rest, amount: 0 });
  const priced = Math.max(advertised, amount ?? 0);
  const result = compute(code, { ...rest, amount: priced });

  return {
    code,
    advertised: round(advertised),
    real: round(result.total),
    extras: round(result.total) - round(advertised),
    result,
    groups: slices(result),
  };
}

export interface Verdict {
  fits: boolean;
  /** What is left over when it fits, what is missing when it does not. Always
   *  positive: the sign is carried by `fits`, not by the number, because
   *  "−€1,000" printed beside "short by" reads as a double negative. */
  diff: number;
}

export function verdictFor(row: Row, budget: number): Verdict {
  return { fits: budget >= row.real, diff: Math.abs(budget - row.real) };
}

/** Affordable first, then cheapest first. Within the second group the nearest
 *  miss leads, because "you are €1,000 short of Malta" is the most useful
 *  thing this page can say to someone it cannot say yes to. */
export function rankRows(rows: Row[], budget: number): Row[] {
  return [...rows].sort((a, b) => {
    const af = budget >= a.real;
    const bf = budget >= b.real;
    if (af !== bf) return af ? -1 : 1;
    return a.real - b.real;
  });
}

/** The scale every bar is drawn to. Constant with respect to the budget — that
 *  is the entire point of the redesign — so it is taken from the programmes
 *  themselves with room to spare. A budget past the end pins the line to the
 *  right edge, where everything qualifies anyway. */
export function scaleOf(rows: Row[]): number {
  return Math.max(...rows.map((row) => row.real), 1) * 1.15;
}
