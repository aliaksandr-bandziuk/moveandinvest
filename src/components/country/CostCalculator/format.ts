import type { ComputedLine } from "@/lib/costModel";

// The two strings a priced line renders, as pure functions.
//
// IN THEIR OWN MODULE FOR ONE REASON: the server prints them at the default
// inputs and the browser reprints them on every keystroke, and if the two ever
// formatted differently the page would visibly rewrite itself the moment
// anyone touched a field — the same figure in two shapes, which on a site
// whose argument is that its figures are stable is worse than a wrong number.
// One implementation, imported twice.

export function currencyFormatter(locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

/** Line amounts round to whole euro. The cents are real — AIMA charges €842.80
 *  — but a column of them beside a €500,000 threshold is precision theatre,
 *  and the exact figure is in the citation. */
export function formatEur(value: number, format: Intl.NumberFormat): string {
  return format.format(Math.round(value));
}

export interface BasisLabels {
  /** A charge that does not move with the amount. */
  flat: string;
  /** An annual charge. `{n}` is the number of years priced. */
  perYear: string;
}

/**
 * What the line is computed FROM, in four words or fewer.
 *
 * This column is the one that makes the table checkable rather than merely
 * itemised: "3.09%" beside "€12,360" beside "€400,000" is a multiplication a
 * reader can do in their head, and a total nobody can reproduce is the thing
 * every competitor's calculator prints.
 */
export function basisText(
  line: ComputedLine,
  labels: BasisLabels,
  locale: string,
  years: number,
): string {
  if (line.basis.of === "annualFixed" || line.basis.of === "annualRate") {
    return labels.perYear.split("{n}").join(String(years));
  }
  if (line.aed !== undefined) {
    return `AED ${line.aed.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  }
  if (line.appliedRate !== undefined) {
    return `${(line.appliedRate * 100).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }
  return labels.flat;
}

/** The share of an outlay that is fees, as one decimal place. The column no
 *  competitor publishes — and the only one that still discriminates once the
 *  page is solving for a budget, because then every qualifying total is the
 *  budget. */
export function percentText(share: number, locale: string): string {
  return `${(share * 100).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/** Grouped digits for the one field a reader types into. No currency symbol:
 *  the label above it already says what the number is, and a symbol inside an
 *  editable field is something people try to delete. */
export function groupDigits(value: number, locale: string): string {
  return Math.round(value).toLocaleString(locale, { maximumFractionDigits: 0 });
}

/** Digits only. Whatever a reader pastes — spaces, a euro sign, a thousands
 *  separator from another locale — becomes the number they meant. */
export function parseDigits(text: string): number {
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/** Fills "{placeholders}" by plain replacement. Not ICU: these templates are
 *  finished in the browser from state the server never sees, and `t()` throws
 *  on an unfilled one. Shared so the server and the control fill them the same
 *  way — see the note in the control. */
export function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.split(`{${key}}`).join(value),
    template,
  );
}
