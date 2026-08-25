import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { isRateLimited } from "@/lib/enquiry/rateLimit";
import {
  sendEnquiryEmails,
  sendPartnerEmails,
  sendQuestionEmail,
  sendSubscribeEmails,
} from "@/lib/enquiry/sender";
import {
  type EnquiryPayload,
  type PartnerEnquiryPayload,
  type QuestionPayload,
  storeEnquiry,
  storePartnerEnquiry,
  storeSubscribe,
  type SubscribePayload,
} from "@/sanity/enquiries";

// Receives BOTH forms on the site: the home page enquiry (section 08) and the
// partner reply on /for-partners (section 05). A hidden `kind` field decides
// which, and everything before that branch — honeypot, locale, the redirect
// helper — is shared.
//
// One route rather than two on purpose. The spam trap, the allow-list
// discipline and the 303-with-a-fragment answer are the parts that must never
// drift, and a second route would be a second copy of all three: the copy
// that gets forgotten when one of them is fixed.
//
// The form posts a normal multipart body and this handler answers with a
// redirect, so the whole thing works with JavaScript disabled — the client
// enhancer is an upgrade, never the mechanism. The redirect target carries a
// fragment rather than a query parameter on purpose: a query parameter read
// in a server component would make the home page dynamic, and the home page
// is statically generated.
//
// TWO CHANNELS, AND ONE OF THEM IS ENOUGH. An enquiry is delivered if the
// email left the building OR the document landed in the private dataset. It
// is lost only if both failed, and only then does the visitor see an error.
//
// This replaced a store-then-notify design that treated the dataset as the
// source of truth. That design assumed a second, private Sanity dataset, and
// the project's plan does not allow one — so on 23 Aug 2026 the email became
// the record rather than a notification about it. The dataset is now the
// optional half: configure NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET one day and
// it starts being written with no change here; leave it unset and the site
// works exactly as it does today.
//
// Which half carried it is written to the log every time, because "we have
// the enquiry" and "we have it in two places" are different operational
// facts and the difference is invisible from the outside.
//
// Both are awaited rather than fired and forgotten: a serverless function is
// frozen the moment it answers, so an un-awaited send does not reliably leave
// the machine. It costs the visitor a second on a form they submit once.

// nodemailer needs Node APIs (net, tls) that the Edge runtime does not have.
// Explicit even though Node is already the default for route handlers, so
// this does not break quietly if that default ever changes.
export const runtime = "nodejs";

const ALLOWED = {
  where: new Set(["pt", "gr", "cy", "mt", "ae", "undecided", "other"]),
  budget: new Set(["500", "800", "over800", "unknown"]),
  timeline: new Set(["fast", "half-year", "year", "browsing"]),
  goals: new Set(["residency", "tax", "passport", "business", "property"]),
  // The property brief's third question. Same discipline as every other
  // allow-list here: adding an option means adding it in this file first, or
  // the server drops it without a word.
  purpose: new Set(["live", "let", "residency", "unsure"]),
  // The change list. Five real jurisdictions and nothing else: "undecided"
  // and "other" are answers to a question about a plan, and this form asks
  // what to send, not what the reader intends.
  alerts: new Set(["pt", "gr", "cy", "mt", "ae"]),
  // Partner reply. The labels for these live in Sanity and can be reworded
  // freely; these values cannot — adding an option means adding it here
  // first, or the server silently drops it.
  jurisdiction: new Set(["pt", "gr", "cy", "mt", "ae", "several"]),
  organisation: new Set(["law-firm", "relocation", "developer", "estate-agent"]),
};

const MAX_SITUATION = 4000;
const MAX_SHORT = 200;

// x-forwarded-for's first entry, which is what a proxy in front of this puts
// there. Spoofable by anyone who sends the header themselves — which is fine,
// because the limit below is a speed bump, not an access control.
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function oneOf(value: string, allowed: Set<string>): string {
  return allowed.has(value) ? value : "";
}

// Deliberately permissive. Rejecting a real address because it has a plus
// sign or a long TLD loses a lead; the only thing worth catching here is an
// obvious non-address, and the confirmation email is the real check.
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX_SHORT;
}

// WHERE TO SEND THE VISITOR BACK TO, and the only place on this route where
// user input reaches a URL.
//
// The property brief lives on twelve different pages, so unlike the two forms
// that came before it, the redirect target cannot be a constant — the form
// has to say which page it was submitted from. That makes it an open-redirect
// hazard the moment the value is trusted, so it is not: only a bare slug is
// accepted, matched against the same shape the slug field itself allows, and
// anything else falls back to the home page. No slashes, no scheme, no dots,
// no percent-encoding survives this.
//
// Returning the reader to the home page on a malformed value is deliberate:
// the enquiry has already been delivered by the time this runs, and landing
// somewhere real beats an error over a redirect target.
const SLUG = /^[a-z0-9-]{1,96}$/;

function safeReturnTo(value: string): string {
  return SLUG.test(value) ? value : "";
}

// TWO KINDS OF FAILURE, two fragments, and the difference matters more than
// it looks. `#enquiry-error` means the visitor left out something only they
// can supply — an address, the consent box. `#enquiry-failed` means WE broke:
// the write did not land, or the address was rate limited. For a while there
// was one panel for both, and when the enquiries dataset turned out to be
// unconfigured the page told a person who had filled the form correctly that
// their email address was missing. Blaming a visitor for our own outage is
// how a lead leaves and does not come back, so the second panel says the
// fault is ours and gives an address to write to instead.
//
// `target` is a path plus a fragment, relative to the locale root — "" plus
// "#enquiry-sent" for the home page, "for-partners#partner-sent" for the
// partner page. The fragment, not a query parameter: a query parameter read
// in a server component would make that page dynamic, and both pages are
// statically generated.
function redirectTo(request: NextRequest, locale: string, target: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const url = new URL(`${prefix}/${target}`, request.nextUrl.origin);
  // 303: the browser must follow a POST's redirect with GET, otherwise a
  // refresh on the thank-you view re-submits the form.
  return NextResponse.redirect(url, 303);
}

// The change list. One field, one checkbox, and its own consent.
//
// The consent here is NOT the enquiry's `consentToShare` and must never be
// merged with it. That one is permission to pass a person's circumstances to a
// third party; this one is permission to send them email. Different purposes,
// different legal bases, different withdrawal — a single checkbox covering
// both is the shape a regulator reads as bundled consent, and it would also be
// dishonest to the reader.
async function handleSubscribe(
  request: NextRequest,
  form: FormData,
  locale: string,
  back: (fragment: string) => string,
) {
  const email = field(form, "email").slice(0, MAX_SHORT);
  const consent = form.get("consentToEmail") === "on";

  if (!looksLikeEmail(email) || !consent) {
    return redirectTo(request, locale, back("error"));
  }

  const payload: SubscribePayload = {
    email,
    jurisdictions: form
      .getAll("alerts")
      .filter((value): value is string => typeof value === "string")
      .map((value) => oneOf(value, ALLOWED.alerts))
      .filter(Boolean),
    locale,
    submittedAt: new Date().toISOString(),
  };

  let stored = false;
  try {
    stored = await storeSubscribe(payload);
  } catch (error) {
    console.error("[enquiry] Subscriber write failed:", error);
  }

  const mailed = await sendSubscribeEmails(payload);

  if (!stored && !mailed.ok) {
    // The address is the whole payload, so the log line IS the subscription
    // if this happens. Printed for that reason and no other.
    console.error(
      `[enquiry] Subscriber LOST — neither channel accepted it ` +
        `(mail: ${mailed.reason ?? "unknown"}). Payload follows:`,
    );
    console.error(JSON.stringify(payload));
    return redirectTo(request, locale, back("failed"));
  }

  console.log(`[enquiry] Subscriber — mailed: ${mailed.ok}, stored: ${stored}`);

  return redirectTo(request, locale, back("sent"));
}

// A question from /contacts.
//
// NO CONSENT CHECKBOX, and the reason is the same one that exempts the partner
// reply: consent on this site governs being passed to a third party, and a
// question is never passed to anybody. Adding a checkbox that consents to
// nothing would be consent theatre — and would make the real one, on the
// enquiry form, look like the same ritual.
//
// It is also NOT STORED. The enquiries dataset holds leads; a question answered
// and closed is correspondence, and correspondence belongs in a mailbox. That
// means the email is the only channel, so unlike the enquiry there is no "one
// of the two worked" — if the mail fails, the visitor is told plainly.
async function handleQuestion(
  request: NextRequest,
  form: FormData,
  locale: string,
  back: (fragment: string) => string,
) {
  const email = field(form, "email").slice(0, MAX_SHORT);
  const message = field(form, "message").slice(0, MAX_SITUATION);

  if (!looksLikeEmail(email) || message.trim() === "") {
    return redirectTo(request, locale, back("error"));
  }

  const payload: QuestionPayload = {
    name: field(form, "name").slice(0, MAX_SHORT),
    email,
    message,
    locale,
    submittedAt: new Date().toISOString(),
  };

  const mailed = await sendQuestionEmail(payload);

  if (!mailed.ok) {
    // Metadata only. What they wrote is never printed — the standing rule for
    // every path in this route, failure paths included.
    console.error(`[enquiry] Question LOST (mail: ${mailed.reason ?? "unknown"}).`);
    return redirectTo(request, locale, back("failed"));
  }

  console.log("[enquiry] Question — mailed: true");

  return redirectTo(request, locale, back("sent"));
}

// The partner reply on /for-partners. Two required fields and no consent
// checkbox: a firm writing to us about its own commercial terms is not
// handing over personal data about somebody else, which is what that checkbox
// governs on the home page form.
async function handlePartnerReply(
  request: NextRequest,
  form: FormData,
  locale: string,
) {
  const email = field(form, "email").slice(0, MAX_SHORT);
  const terms = field(form, "terms").slice(0, MAX_SITUATION);

  // An address to reply to, and something to reply about. Everything else is
  // optional: a firm that answers "we do not buy leads" in one line has told
  // us exactly what the outbound wave was sent to find out.
  if (!looksLikeEmail(email) || terms === "") {
    return redirectTo(request, locale, "for-partners#partner-error");
  }

  const payload: PartnerEnquiryPayload = {
    jurisdiction: oneOf(field(form, "jurisdiction"), ALLOWED.jurisdiction),
    organisation: oneOf(field(form, "organisation"), ALLOWED.organisation),
    name: field(form, "name").slice(0, MAX_SHORT),
    email,
    terms,
    locale,
    submittedAt: new Date().toISOString(),
  };

  // The dataset is optional; the email is not. `stored` is best effort and
  // never decides the answer on its own.
  let stored = false;
  try {
    stored = await storePartnerEnquiry(payload);
  } catch (error) {
    console.error("[enquiry] Partner reply write failed:", error);
  }

  const mailed = await sendPartnerEmails(payload);

  if (!stored && !mailed.ok) {
    // Nothing holds this reply but the log. Print it whole — it is the only
    // remaining copy, and a partner who took the trouble to answer an
    // outbound email is exactly who we cannot afford to drop.
    console.error(
      `[enquiry] Partner reply LOST — neither channel accepted it ` +
        `(mail: ${mailed.reason ?? "unknown"}). Payload follows:`,
    );
    console.error(JSON.stringify(payload));
    return redirectTo(request, locale, "for-partners#partner-failed");
  }

  console.log(`[enquiry] Partner reply — mailed: ${mailed.ok}, stored: ${stored}`);

  return redirectTo(request, locale, "for-partners#partner-sent");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const ip = clientIp(request);

  const rawLocale = field(form, "locale");
  const locale = routing.locales.includes(rawLocale as never)
    ? rawLocale
    : routing.defaultLocale;

  const rawKind = field(form, "kind");
  const kind =
    rawKind === "partner"
      ? "partner"
      : rawKind === "brief"
        ? "brief"
        : rawKind === "subscribe"
          ? "subscribe"
          : rawKind === "question"
            ? "question"
            : "reader";

  // The brief is submitted from a property page and returns to it. Everything
  // else about it is a reader enquiry — same honeypot, same rate limit, same
  // two delivery channels, same consent rule — which is why it is a branch
  // here and not a second route.
  // Both the brief and the change list live on many pages and come back to
  // the one they were sent from. The enquiry block exists once, on the home
  // page, so it needs no such thing.
  const returnTo =
    kind === "brief" || kind === "subscribe" ? safeReturnTo(field(form, "returnTo")) : "";
  const readerTarget = (fragment: string) =>
    kind === "brief" ? `${returnTo}#brief-${fragment}` : `#enquiry-${fragment}`;
  const subscribeTarget = (fragment: string) => `${returnTo}#alerts-${fragment}`;
  // The question form exists once, on /contacts, so it needs no returnTo.
  const questionTarget = (fragment: string) => `contacts#question-${fragment}`;

  // Honeypot, checked before the branch so neither form can be built without
  // it. A hidden field no human ever sees; bots fill every input they find.
  // Answer with the success redirect rather than an error — telling a bot
  // which check it failed is how the next attempt passes.
  //
  // THE FIELD NAME IS DELIBERATELY MEANINGLESS, and it has to stay that way.
  //
  // It was `company`, labelled "Company (leave empty)", until 23 Aug 2026,
  // when the owner filled in the live form himself and got "Sent." while
  // nothing was stored and no email was sent: Chrome's address autofill
  // matched `company` to its `organization` token and filled the trap. The
  // first fix renamed it to `ref`, which is better and still wrong in
  // principle — anything that reads like a real field is something some
  // browser, password manager or extension may one day decide to fill.
  // `q7` reads like nothing, which is the entire specification.
  //
  // Three layers, because the name alone is not a guarantee:
  //
  //   1. a name no heuristic can match;
  //   2. `readonly` on the input — Chrome will not autofill a readonly field
  //      at all, and no human can reach it (off-screen, tabindex -1,
  //      aria-hidden), while a script posting the form body directly is
  //      completely unaffected by it;
  //   3. autocomplete="off" plus the two password-manager opt-outs.
  //
  // Layer 2 costs a little catch rate: a bot that parses the HTML and skips
  // readonly inputs will not trip the trap. That trade is deliberate and it
  // is not close — spam in the dataset is an annoyance, a silently rejected
  // enquiry is a lost client who thinks we ignored them.
  if (field(form, "q7") !== "") {
    console.warn(`[enquiry] Honeypot tripped — nothing stored, nothing sent. ip=${clientIp(request)}`);
    return redirectTo(
      request,
      locale,
      kind === "partner"
        ? "for-partners#partner-sent"
        : kind === "subscribe"
          ? subscribeTarget("sent")
          : kind === "question"
            ? questionTarget("sent")
            : readerTarget("sent"),
    );
  }

  // After the honeypot, so a bot that trips the trap does not also consume
  // somebody else's allowance from a shared address, and before either
  // branch, so both forms are covered by one check. A limited request is
  // answered with the error fragment rather than a 429: the form has no
  // JavaScript to read a status code with, and the error view already says
  // "did not go through, try again".
  if (isRateLimited(ip)) {
    console.warn(`[enquiry] Rate limited. ip=${ip}`);
    return redirectTo(
      request,
      locale,
      kind === "partner"
        ? "for-partners#partner-failed"
        : kind === "subscribe"
          ? subscribeTarget("failed")
          : kind === "question"
            ? questionTarget("failed")
            : readerTarget("failed"),
    );
  }

  if (kind === "partner") {
    return handlePartnerReply(request, form, locale);
  }

  if (kind === "subscribe") {
    return handleSubscribe(request, form, locale, subscribeTarget);
  }

  if (kind === "question") {
    return handleQuestion(request, form, locale, questionTarget);
  }

  const email = field(form, "email").slice(0, MAX_SHORT);
  const consent = form.get("consentToShare") === "on";

  // The two fields without which the enquiry cannot be acted on at all. The
  // rest of the form is optional by design: someone who has not decided
  // anything yet is exactly who this block is for, and a required "budget"
  // would turn them away.
  if (!looksLikeEmail(email) || !consent) {
    return redirectTo(request, locale, readerTarget("error"));
  }

  const payload: EnquiryPayload = {
    where: oneOf(field(form, "where"), ALLOWED.where),
    budget: oneOf(field(form, "budget"), ALLOWED.budget),
    timeline: oneOf(field(form, "timeline"), ALLOWED.timeline),
    goals: form
      .getAll("goals")
      .filter((value): value is string => typeof value === "string")
      .map((value) => oneOf(value, ALLOWED.goals))
      .filter(Boolean),
    situation: field(form, "situation").slice(0, MAX_SITUATION),
    // Only the brief sends these two. They stay on the shared payload rather
    // than in a separate shape because everything downstream — the email
    // template, the stored document, the log line — would otherwise need a
    // second version of itself for a form that differs by two fields.
    city: field(form, "city").slice(0, MAX_SHORT),
    purpose: oneOf(field(form, "purpose"), ALLOWED.purpose),
    kind: kind === "brief" ? "brief" : "enquiry",
    name: field(form, "name").slice(0, MAX_SHORT),
    email,
    consentToShare: consent,
    locale,
    submittedAt: new Date().toISOString(),
  };

  let stored = false;
  try {
    stored = await storeEnquiry(payload);
  } catch (error) {
    console.error("[enquiry] Enquiry write failed:", error);
  }

  const mailed = await sendEnquiryEmails(payload);

  if (!stored && !mailed.ok) {
    // The worst outcome this route has. The log is the last copy, so it gets
    // the whole payload and the reason — and the visitor gets the panel that
    // says the fault is ours and gives them an address, rather than one that
    // tells them to check the form they filled in correctly.
    console.error(
      `[enquiry] Enquiry LOST — neither channel accepted it ` +
        `(mail: ${mailed.reason ?? "unknown"}). Payload follows:`,
    );
    console.error(JSON.stringify(payload));
    return redirectTo(request, locale, readerTarget("failed"));
  }

  console.log(`[enquiry] ${payload.kind} — mailed: ${mailed.ok}, stored: ${stored}`);

  return redirectTo(request, locale, readerTarget("sent"));
}
