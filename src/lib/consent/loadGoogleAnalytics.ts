import { hasConsent } from "./consent";

// Google Analytics 4, gated by the "analytics" category. The only entry point
// is `loadGoogleAnalytics`, called exclusively as
// `runWhenConsented("analytics", loadGoogleAnalytics)` from AnalyticsLoader.
//
// This is NOT Google's Consent Mode, which loads the tag immediately and
// reports "denied" to it. The published privacy policy says nothing loads
// before consent, so the tag itself must not exist until then — Consent Mode
// would make that sentence false while looking, from the outside, like
// compliance.
//
// The snippet Google hands out is pasted into <head> and self-executes. This
// module reimplements exactly what it does, in a named function that only
// runs behind the gate.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Not an environment variable. A GA4 measurement ID is visible in the page
// source of every site running GA and is therefore not a secret; there is one
// analytics account rather than one per environment, so an env var would buy
// indirection and nothing else.
const GA_MEASUREMENT_ID = "G-3NRRFNFEHT";

let loaded = false;

function sendPageView(): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Never call this directly from a mount effect — that bypasses the gate. */
export function loadGoogleAnalytics(): void {
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  // Queued BEFORE js/config. Consent Mode applies whatever state is current
  // as each queued command is walked, so a "granted" pushed afterwards does
  // not retroactively unlock the earlier ones.
  window.gtag("consent", "default", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  // send_page_view off: the App Router does not fire a document load on
  // client-side navigation, so GA's automatic pageview would only ever cover
  // the first one. Every pageview goes through trackPageView instead — one
  // rule for all of them rather than "the first is automatic, the rest are not".
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  trackPageView();
}

/** Called on every route change and once from the loader above.
 *
 *  It re-checks LIVE consent rather than trusting that GA was loaded at some
 *  point, because gtag.js cannot be un-loaded: removing the script element
 *  does not undo what it already defined, so after a withdrawal `window.gtag`
 *  stays callable. This check is what actually stops new data leaving. */
export function trackPageView(): void {
  if (!hasConsent("analytics")) return;
  sendPageView();
}

export function isGoogleAnalyticsLoaded(): boolean {
  return loaded;
}
