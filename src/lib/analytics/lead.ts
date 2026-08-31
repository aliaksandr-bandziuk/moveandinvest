import { hasConsent } from "@/lib/consent/consent";

// One lead, measured once, through the same gate everything else goes
// through.
//
// WHY THIS IS HARDER THAN A CLICK HANDLER. Every form on this site is a plain
// HTML form that posts to /api/enquiry and gets a 303 back to a fragment. That
// is deliberate — it works with JavaScript off — but it means there is no
// moment in the browser where "the enquiry succeeded" is a return value. The
// only evidence is the fragment the server chose, and it appears after a full
// page load.
//
// So the event fires on the RETURN, not on the click. Two consequences worth
// knowing before reading the numbers:
//
//   * it counts DELIVERED leads, not attempts. The route only redirects to a
//     success fragment once a channel accepted the payload, so a lead that was
//     lost is not counted as one. That is the more useful number of the two,
//     and it is not the number a click handler would give.
//   * a visitor with JavaScript off is never counted. Nothing can be done
//     about that without breaking the no-JavaScript promise, and pretending
//     otherwise by counting clicks would count spam and failures too.

const STASH_KEY = "mi_lead";

// "article" is the short block at the foot of a guide. It is a separate kind
// from "enquiry" rather than folded into it because the whole question this
// measurement has to answer is which of the two surfaces produces leads, and a
// shared label would make that unanswerable.
//
// ON `form_path` FOR THIS KIND: it will read /blog/greece-residency, which
// names a jurisdiction. That is the same position this file already takes for
// the property brief a few lines below — the country is in the URL, the URL is
// about the submission rather than its contents, and what the reader CHOSE
// inside a form is still never measured. Stated here so the next person to read
// the warning does not have to decide it again.
export type LeadKind = "enquiry" | "brief" | "partner" | "subscribe" | "article";

export interface LeadDetail {
  kind: LeadKind;
  /** The path the form was submitted from — not the one it returned to. */
  path: string;
}

// ⚠ THE JURISDICTION IS NOT HERE, AND MUST NOT BE ADDED.
//
// The privacy policy says this, in three languages, in the section headed
// "what we do not do, whatever you agree to":
//
//   "If a tool one day records that an enquiry was submitted, it records that
//    fact and nothing in it — not your email address, NOT THE JURISDICTION,
//    not the budget, not a word of what you typed."
//
// The first version of this file sent `jurisdiction` to GA4 and tagged the
// Clarity session with it. It was written before the policy was re-read, and
// it broke that sentence directly. Removed on 24 Aug 2026.
//
// What survives is `form_path`, which is about the submission and not its
// contents — and on a property page it happens to answer the same question,
// because the country is in the URL. On the home page form the country is
// something the visitor chose inside the form, so it is not measured at all.
// That is the promise working as intended, not a gap to be closed.

// The stash is what makes the event fire exactly once, and it is why there is
// no separate "already fired" flag.
//
// It is written when the form is submitted and consumed when the event fires.
// A refresh of the thank-you page finds no stash and sends nothing; a second,
// genuine submission writes a fresh one and is counted. A flag would have had
// to guess which of those two it was looking at.
export function stashLead(detail: LeadDetail): void {
  try {
    sessionStorage.setItem(STASH_KEY, JSON.stringify(detail));
  } catch {
    // Private mode, storage disabled. The form still works; this lead is
    // simply not measured, which is the correct order of priorities.
  }
}

export function takeLead(): LeadDetail | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STASH_KEY);
    const parsed = JSON.parse(raw) as Partial<LeadDetail>;
    const KINDS: LeadKind[] = ["enquiry", "brief", "partner", "subscribe", "article"];
    if (!KINDS.includes(parsed.kind as LeadKind)) return null;
    return {
      kind: parsed.kind as LeadKind,
      path: typeof parsed.path === "string" ? parsed.path : "",
    };
  } catch {
    return null;
  }
}

interface GtagWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
}

// `generate_lead` rather than a name of our own: it is one of GA4's recommended
// events, so it appears in the standard reports without configuration. The two
// parameters are custom, and custom parameters do NOT appear in reports until
// they are registered as custom dimensions in the GA4 admin — Admin → Custom
// definitions, one per parameter, event-scoped. Until that is done the event
// count is visible and the breakdown is not, which looks like a bug in this
// file and is not.
//
// Clarity gets the same event plus one tag, which turns "which sessions ended
// in a lead" into a filter — and the recordings of the sessions that did NOT
// are where the form's problems are visible.
// `hasConsent` and NOT `runWhenConsented`, which is what everything else in
// this codebase uses to reach a tag. The difference matters here.
//
// `runWhenConsented` subscribes: if the visitor has not agreed, it waits and
// fires the moment they do. That is right for a loader — the tag should start
// when permission arrives. It is wrong for an event about a moment that has
// already passed. A visitor who declines, sends a brief, and accepts cookies
// twenty minutes later would otherwise generate a lead event timestamped to
// the acceptance, from a different page, with no relation to what they were
// doing. And the subscription would never be released.
//
// So this asks once and drops the event if the answer is no. An unmeasured
// lead is a smaller problem than a mis-timed one.
export function trackLead(detail: LeadDetail): void {
  if (!hasConsent("analytics")) return;

  const w = window as GtagWindow;

  w.gtag?.("event", "generate_lead", {
    form_kind: detail.kind,
    form_path: detail.path,
  });

  w.clarity?.("event", `lead_${detail.kind}`);
  w.clarity?.("set", "lead_kind", detail.kind);
}
