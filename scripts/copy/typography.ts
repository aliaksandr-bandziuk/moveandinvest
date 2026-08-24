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
// Why not simply type the non-breaking spaces into the source: they are
// invisible. A copy file full of characters that look like spaces, some of
// which are load-bearing, is proofread wrongly forever after — and the first
// person to retype a line silently undoes it.

/** Replaces a space between two digits with U+00A0. */
export function tightenNumbers(value: string): string {
  return value.replace(/(\d) (?=\d)/g, "$1\u00A0");
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
