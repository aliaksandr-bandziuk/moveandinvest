// Microsoft Clarity, gated the same way and for the same reason: the snippet
// Microsoft hands out is an IIFE with no consent check of its own, so pasting
// it into the layout would put the tag — and its request to clarity.ms — on
// the page before any decision exists. This reimplements that snippet's exact
// logic behind the gate.
//
// MASKING IS NOT SET HERE, AND CANNOT BE. The privacy policy states that
// session recording masks what a visitor types, which on this site means the
// enquiry form: a budget, a timeline and somebody's circumstances in their own
// words. There is no snippet parameter for it — the masking level is a
// per-project setting in the Clarity dashboard (Settings → Masking; "Strict"
// masks all text and input). **Until that is confirmed in the dashboard, the
// policy is making a promise this code cannot keep.** It is the one item in
// this integration that no amount of correct TypeScript can close.

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

// Not an environment variable — same reasoning as the GA measurement id.
const CLARITY_PROJECT_ID = "y6y6q1ry1n";

let loaded = false;

/** Only ever called via runWhenConsented("analytics", loadClarity). */
export function loadClarity(): void {
  if (loaded) return;
  loaded = true;

  if (!window.clarity) {
    const fn: ClarityFn = (...args: unknown[]) => {
      (fn.q = fn.q || []).push(args);
    };
    window.clarity = fn;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  const first = document.getElementsByTagName("script")[0];
  if (first?.parentNode) {
    first.parentNode.insertBefore(script, first);
  } else {
    document.head.appendChild(script);
  }

  // Clarity's own documented consent command, queued the same way `stop` is
  // below if the real script has not finished loading. A project configured
  // to withhold recording until it receives this will otherwise load and do
  // nothing, which looks identical to a broken integration.
  window.clarity("consent");
}

/** Halts an in-progress recording when consent is withdrawn after Clarity has
 *  already loaded.
 *
 *  GA re-checks consent on every pageview call, so withdrawal stops it
 *  naturally. Clarity records continuously and has no per-event hook, so
 *  without this an accepted-then-withdrawn session keeps recording pointer
 *  movement and clicks until the next full reload. */
export function stopClarity(): void {
  if (loaded) window.clarity?.("stop");
}

export function isClarityLoaded(): boolean {
  return loaded;
}
