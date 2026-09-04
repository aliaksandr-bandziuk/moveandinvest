import { CALC_CODES, type Computed, linesFor } from "@/lib/costModel";

// The eight priced lines of a jurisdiction, folded into the five or six
// headings a reader actually thinks in.
//
// WHY THIS EXISTS AT ALL. The line table answers "can I check this figure";
// the structure bar answers "where does my money go", and those are different
// questions with different resolutions. Nobody holds "e-paravolo €2,000",
// "residence card €16" and "first renewal €2,000" in their head as three
// facts — they hold one, "permits, about four thousand". A bar with eight
// segments, three of which are one pixel wide, is a bar nobody reads.
//
// WHY THE MAP IS BY BARE LINE KEY. Only two keys repeat across jurisdictions —
// `legal` and `agency` — and they mean the same thing in both, so prefixing by
// code would buy nothing and would silently drop a line the day a key moved.
// The check below makes an unmapped key loud instead.

export type GroupKey =
  | "purchase-tax"
  | "state-contribution"
  | "lease"
  | "professional"
  | "agency"
  | "fund"
  | "permit";

/** Reading order, and it is an argument rather than an alphabet: the money
 *  that leaves for the state first, the money that buys a service second, the
 *  administrative tail last. The bar is drawn in this order too, so the same
 *  colour sits in the same place on every jurisdiction. */
export const GROUP_ORDER: GroupKey[] = [
  "purchase-tax",
  "state-contribution",
  "lease",
  "professional",
  "agency",
  "fund",
  "permit",
];

const GROUP_OF: Record<string, GroupKey> = {
  // Greece
  "transfer-tax": "purchase-tax",
  "land-registry": "purchase-tax",
  notary: "professional",
  legal: "professional",
  agency: "agency",
  "permit-fee": "permit",
  "permit-card": "permit",
  "permit-renewal": "permit",
  // Portugal
  "aima-analysis": "permit",
  "aima-grant": "permit",
  "aima-renewal": "permit",
  "fund-charges": "fund",
  // Malta
  "stamp-duty": "purchase-tax",
  rent: "lease",
  "admin-fee": "state-contribution",
  contribution: "state-contribution",
  "ngo-donation": "state-contribution",
  "residence-card": "permit",
  "notary-legal": "professional",
  // UAE
  "dld-transfer": "purchase-tax",
  "dld-admin": "purchase-tax",
  "golden-visa-fees": "permit",
};

// LOUD BEATS BLANK, the rule /calculator already follows for a missing label.
// A line with no group would vanish from the bar while still counting towards
// the total, so the segments would no longer add up to the figure printed
// beside them — the one failure this component cannot be allowed to have.
if (process.env.NODE_ENV !== "production") {
  const orphans = CALC_CODES.flatMap((code) =>
    linesFor(code)
      .filter((line) => GROUP_OF[line.key] === undefined)
      .map((line) => `${code}.${line.key}`),
  );
  if (orphans.length > 0) {
    console.warn(
      "[moveandinvest] Cost lines with no group, missing from the structure " +
        `bar: ${orphans.join(", ")}. Add them to GROUP_OF in groups.ts.`,
    );
  }
}

export interface GroupSlice {
  key: GroupKey;
  eur: number;
}

/**
 * The applicable lines of one result, summed by group, in GROUP_ORDER, with
 * empty groups dropped.
 *
 * Lines whose `applies` is false are excluded here exactly as they are from
 * every total — Malta's rent while the reader is buying, its stamp duty while
 * leasing. They are still in the HTML; they are simply not in this bar.
 */
export function slices(result: Computed): GroupSlice[] {
  const sums = new Map<GroupKey, number>();
  for (const line of result.lines) {
    if (!line.applies || line.eur <= 0) continue;
    const group = GROUP_OF[line.key];
    if (!group) continue;
    sums.set(group, (sums.get(group) ?? 0) + line.eur);
  }
  return GROUP_ORDER.filter((key) => (sums.get(key) ?? 0) > 0).map((key) => ({
    key,
    eur: sums.get(key) ?? 0,
  }));
}

/** Every group any jurisdiction can produce, so the server can print a legend
 *  row for each and the browser only ever hides and unhides them. */
export const ALL_GROUPS: GroupKey[] = GROUP_ORDER;
