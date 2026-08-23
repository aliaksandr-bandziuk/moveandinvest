// The consent gate. Mechanism only — no vendor code here, and nothing in
// this file ever creates a script tag.
//
// Ported from the sibling `giuseppeiannone` project, whose version of this
// was built before the tags it gates. The one substantive difference is that
// there the categories arrived with a preferences panel; here the banner is
// two buttons and nothing else, so `marketing` exists in the stored shape and
// has no UI yet. That is deliberate: the privacy policy already names Meta
// Pixel and Google Ads tags as things that may run later, and adding the
// category then would mean every visitor's stored choice suddenly lacking a
// field. A stored shape is cheap to write once and expensive to migrate.
//
// Framework-agnostic on purpose — no React import. The banner subscribes; a
// plain script loader could call these directly.

// ⚠ TEMPORARY — ANALYTICS RUN BEFORE CONSENT. ONE LINE, FLIP IT BACK.
//
// Set to `false` and this file behaves as designed: nothing loads until the
// visitor agrees. Set to `true`, as it is now, and Google Analytics and
// Microsoft Clarity load for anyone who has not yet answered the banner.
//
// It is `true` at the owner's explicit instruction, 23 Aug 2026, so the tags
// can be verified end to end. It was an environment variable for one
// revision; a constant replaced it because a variable that must be set
// identically in .env.local and on the host is a variable that ends up set in
// one of them and forgotten in the other.
//
// WHILE THIS IS TRUE:
//   * the privacy policy is false in three languages — it states that nothing
//     loads before agreement;
//   * Clarity may record a session on the page where a visitor types their
//     budget and their circumstances into the enquiry form;
//   * a stored decision still wins, so anyone who clicks "Only necessary"
//     genuinely stops both tools.
//
// The last point is what keeps this recoverable rather than merely wrong: the
// gate is intact, only its default is inverted.
const LOAD_BEFORE_CONSENT = true;

export type ConsentCategory = "analytics" | "marketing";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

// A cookie rather than localStorage, and this is the one cookie the site sets
// for itself. It has to be a cookie because it is the only piece of state
// that must survive a visitor who clears site data expecting to be asked
// again — which is exactly what clearing cookies is for.
const COOKIE_NAME = "mi_consent";
// Six months. Long enough not to nag; short enough that a choice made once is
// not treated as permanent. Re-asking after it expires is the point, not a
// side effect.
const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

function readRawCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeRawCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

function deleteRawCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
      return {
        necessary: true,
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        decidedAt:
          typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
      };
    }
  } catch {
    // Malformed — hand-edited, truncated, or written by an older shape.
    // Treated as undecided, so the banner reappears. That is the safe
    // direction to fail in: asking again costs a click, assuming consent
    // that was never given costs a breach.
  }
  return null;
}

/** The stored choice, or null when the visitor has not decided. */
export function getConsent(): ConsentState | null {
  return parseConsent(readRawCookie(COOKIE_NAME));
}

/** Whether a category is granted.
 *
 *  False before any decision — consent is never inferred from scrolling, from
 *  clicking through, or from silence. The one exception is LOAD_BEFORE_CONSENT
 *  above, and it applies ONLY while no decision is stored: a visitor who has
 *  answered has answered, and the constant never overrides them. */
export function hasConsent(category: ConsentCategory): boolean {
  const stored = getConsent();
  if (stored) return stored[category];
  return LOAD_BEFORE_CONSENT && category === "analytics";
}

const consentListeners = new Set<(state: ConsentState | null) => void>();

export function onConsentChange(listener: (state: ConsentState | null) => void): () => void {
  consentListeners.add(listener);
  return () => consentListeners.delete(listener);
}

function notify(state: ConsentState | null): void {
  for (const listener of consentListeners) listener(state);
}

/** Records an explicit choice. Both banner buttons call this — accepting
 *  with true, declining with false — which is what makes the two decisions
 *  symmetrical in the code as well as on screen. */
export function setConsent(choice: { analytics: boolean; marketing: boolean }): void {
  const state: ConsentState = {
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    decidedAt: new Date().toISOString(),
  };
  writeRawCookie(COOKIE_NAME, JSON.stringify(state), COOKIE_MAX_AGE_SECONDS);
  notify(state);
}

/** Withdrawal: deletes the record rather than setting everything to false,
 *  so the visitor returns to genuinely undecided and is asked again. */
export function withdrawConsent(): void {
  deleteRawCookie(COOKIE_NAME);
  notify(null);
}

// --- Reopening the banner ----------------------------------------------------
// Separate from the consent VALUE: the footer link must be able to reopen the
// banner after a decision exists, which "has the visitor decided" cannot express.
let managerOpen = false;
const managerListeners = new Set<(open: boolean) => void>();

export function isConsentManagerOpen(): boolean {
  return managerOpen;
}

export function onConsentManagerOpenChange(listener: (open: boolean) => void): () => void {
  managerListeners.add(listener);
  return () => managerListeners.delete(listener);
}

export function openConsentManager(): void {
  managerOpen = true;
  for (const listener of managerListeners) listener(true);
}

export function closeConsentManager(): void {
  managerOpen = false;
  for (const listener of managerListeners) listener(false);
}

/**
 * The only sanctioned way to start a gated script. Runs `loader` now if the
 * category is already granted, and the moment it is granted later — never
 * before.
 *
 * THE POINT IS THAT THE TAG DOES NOT EXIST UNTIL THIS FIRES. A script element
 * mounted with an internal "if consented" check has already made its network
 * request by the time that check runs; the vendor has the IP address and the
 * fact of the visit whatever the check then decides. So a loader must create
 * the element, and nothing may create one outside this function.
 */
export function runWhenConsented(category: ConsentCategory, loader: () => void): () => void {
  if (hasConsent(category)) {
    // Loud on purpose. A tag firing before a decision is the exact thing this
    // module exists to prevent, so when it happens by configuration it says
    // so in the console of whoever is looking — including, eventually, on a
    // production deployment where the flag was left behind.
    if (LOAD_BEFORE_CONSENT && getConsent() === null) {
      console.warn(
        `[consent] LOAD_BEFORE_CONSENT is true — "${category}" loaded WITHOUT a ` +
          `decision. Temporary, for verification: while this is set the privacy ` +
          `policy's "nothing loads until you agree" is not true. ` +
          `src/lib/consent/consent.ts`,
      );
    }
    loader();
    return () => {};
  }
  return onConsentChange((state) => {
    if (state?.[category]) loader();
  });
}
