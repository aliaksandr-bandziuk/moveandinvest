// One typographic rule, applied in more than one place.
//
// Russian and Polish group thousands with a SPACE, so "€100 000" is a single
// number containing a break opportunity. At 360px it duly breaks — "€100"
// ending one line and "000 в год" starting the next — and it reads as two
// numbers rather than one. English is unaffected: it groups with a comma.
//
// This lived as an inline regex inside copy/portable.ts, which converts the
// long-form bodies into Portable Text, and so it protected exactly the strings
// that went through that converter and nothing else. On 24 Aug 2026 the
// comparison PDF made the gap visible: the Greek tax-regime cell reads
// "Non-dom, €100 000 в год, отдельная инвестиция €500 000", never passes
// through the converter, and was breaking on the live Russian and Polish home
// pages at phone width. Measured with a Range over the text node and
// getClientRects() — a broken number spans two line boxes — not by eye.
//
// So the rule moved here, and the values it protects are tightened at the
// point they are EXPORTED rather than at each of the three places that consume
// them (seed, facts, the PDF). A consumer that forgets is the failure mode
// this is escaping.
//
// MOVED AGAIN on 24 Aug 2026, from scripts/copy/ to src/lib/, when the sources
// dataset became the fourth consumer — and the first one the app renders
// directly, which cannot import from scripts/. It found the same defect within
// minutes of the page first rendering: "€220 000" and "€4 210,30" breaking
// across lines. The copy scripts import it back across the boundary.
//
// Why not simply type the non-breaking spaces into the source: they are
// invisible. A copy file full of characters that look like spaces, some of
// which are load-bearing, is proofread wrongly forever after — and the first
// person to retype a line silently undoes it.

// WIDENED on 27 Aug 2026, when article tables arrived. Digit-space-digit only
// holds the groups of one number together; it says nothing about what sits
// either side of it, and a table cell is narrow enough for that to show. The
// four-column Russian table was rendered at 390px under three treatments and
// every number phrase in it measured with a Range over the text node:
//
//   untightened                     6 phrases broken across two line boxes
//   digit-space-digit only          2 broken: "AED 2 000 000", "AED 9 884,75"
//   plus the two rules below        0 broken
//
// So the leading abbreviation and the trailing unit are bound too. "AED" alone
// at the end of a line above its own amount is the same defect as "€100" above
// "000", and it survived the first rule only because that rule was written
// from one example. The tempting alternative — white-space: nowrap on the cell
// — was measured and is not needed: with these rules the table needs no help,
// and nowrap would have made a long row label push the table wider for nothing.

const DIGIT_GROUP = /(\d) (?=\d)/g;

/** An abbreviation immediately before a number: AED 2 000 000, \u03A6\u039C\u0391 3,09. Any
 *  script's capitals, because the Greek transfer tax is written in Greek.
 *
 *  The preceding character is matched and put back rather than tested with a
 *  lookbehind. Lookbehind is a SYNTAX error in Safari before 16.4, and a syntax
 *  error in a regex literal takes down the whole bundle it is in rather than
 *  the one string it was meant to fix — an expensive way to buy one character.
 *  This module is imported by the sources and FAQ data, which reach the client. */
const ABBREVIATION = /(^|[^\p{L}])(\p{Lu}{2,4}) (?=\d)/gu;

/** A unit or currency sign after a number: 400 000 \u20AC, 3,09 %, 120 m\u00B2. */
const TRAILING_UNIT = /(\d) (%|\u2030|\u20AC|\$|\u00A3|\u20BD|z\u0142|m\u00B2|\u043C\u00B2)(?!\p{L})/gu;

/**
 * Replaces the breakable spaces inside a number phrase with U+00A0: between
 * digit groups, after a leading abbreviation, and before a trailing unit.
 */
export function tightenNumbers(value: string): string {
  return value
    .replace(DIGIT_GROUP, "$1\u00A0")
    .replace(ABBREVIATION, "$1$2\u00A0")
    .replace(TRAILING_UNIT, "$1\u00A0$2");
}

/**
 * `tightenNumbers` over every string in a structure, leaving the shape and
 * every non-string value untouched.
 *
 * Deliberately generic and deliberately total: the seed literals are nested
 * records of records, they gain fields, and a version of this that listed the
 * fields to visit would go stale on the next one added. Nothing else in these
 * files is a string that a non-breaking space could damage — the slugs, the
 * codes and the ids contain no digit-space-digit sequence, and if one ever did
 * it would be a bug in the slug.
 */
export function tightenDeep<T>(value: T): T {
  if (typeof value === "string") return tightenNumbers(value) as T;
  if (Array.isArray(value)) return value.map(tightenDeep) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, tightenDeep(entry)]),
    ) as T;
  }
  return value;
}
