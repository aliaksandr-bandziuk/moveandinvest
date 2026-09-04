// The handover between the route finder (section 05) and the enquiry form
// (section 08) — and now the jurisdiction pages' closing link and the
// calculator as well.
//
// It lives here rather than in one of the three components because all three
// touch it, and a component barrel is not a place the other two are allowed to
// import from — `country/` reaching into `marketing/` by deep path is exactly
// the dependency direction CLAUDE.md forbids. Before this file the key was a
// constant in one component and a bare string literal in another, which is one
// rename away from a silent break nobody would see: the form would simply stop
// prefilling, and nothing would error.
//
// sessionStorage, not a cookie and not a query parameter: the answers never
// leave the tab, they expire when it closes, and the pages stay statically
// generated. Every function here fails silently — this is a convenience, and
// no block on the site depends on it.

export const ROUTE_ANSWERS_KEY = "mi.routeAnswers";

export interface RouteAnswers {
  budget?: string;
  speed?: string;
  priority?: string;
  /** ISO alpha-2 of the jurisdiction the reader has landed on or been shown. */
  jurisdiction?: string;
  /** THE CALCULATOR'S STATE, exactly as its share link carries it:
   *  "value=500000&gr.amount=450000". Opaque here on purpose — this file is a
   *  courier, and the one place that knows what the string means is
   *  src/lib/calcSummary.ts, which rebuilds the answer from it on the server.
   *
   *  Not the computed answer. A summary written here would be a second copy of
   *  a figure the model already owns, and the first thing to go stale the next
   *  time a rate changes. */
  calc?: string;
}

/** The route finder's own vocabulary for a budget, from an exact figure.
 *
 *  The calculator knows the number to the euro; the enquiry form asks for one
 *  of three bands, and those bands are what /for-partners promises partners
 *  they will receive. So the exact figure travels separately, in `calc`, and
 *  this only ticks the right radio — the same one the finder would have
 *  ticked, in the same words, so the form has one vocabulary rather than two.
 *
 *  The finder's values, not the form's: `EnquiryPrefill` already maps between
 *  them, and teaching a second caller the form's spelling would put that
 *  mapping in two places. */
export function budgetBandFor(euro: number): string | undefined {
  if (!Number.isFinite(euro) || euro <= 0) return undefined;
  if (euro <= 500_000) return "500";
  if (euro <= 800_000) return "800";
  return "any";
}

export function readRouteAnswers(): RouteAnswers {
  try {
    const stored = window.sessionStorage.getItem(ROUTE_ANSWERS_KEY);
    return stored ? (JSON.parse(stored) as RouteAnswers) : {};
  } catch {
    // Private mode, storage disabled by policy, or a malformed value written
    // by an older shape. An empty object is the correct answer to all three.
    return {};
  }
}

/** Merges rather than replaces. A reader may have answered the route finder,
 *  then opened a jurisdiction page: overwriting the object would throw away
 *  their budget and deadline to record a country. */
export function mergeRouteAnswers(patch: RouteAnswers): void {
  try {
    window.sessionStorage.setItem(
      ROUTE_ANSWERS_KEY,
      JSON.stringify({ ...readRouteAnswers(), ...patch }),
    );
  } catch {
    // Nothing to do and nothing lost.
  }
}
