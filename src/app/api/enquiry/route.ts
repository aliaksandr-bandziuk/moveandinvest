import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import {
  describeMissingConfig,
  type EnquiryPayload,
  storeEnquiry,
} from "@/sanity/enquiries";

// Receives the home page enquiry form (section 08).
//
// The form posts a normal multipart body and this handler answers with a
// redirect, so the whole thing works with JavaScript disabled — the client
// enhancer is an upgrade, never the mechanism. The redirect target carries a
// fragment rather than a query parameter on purpose: a query parameter read
// in a server component would make the home page dynamic, and the home page
// is statically generated.

export const runtime = "nodejs";

const ALLOWED = {
  where: new Set(["pt", "gr", "cy", "mt", "ae", "undecided", "other"]),
  budget: new Set(["300", "500", "over500", "unknown"]),
  timeline: new Set(["fast", "half-year", "year", "browsing"]),
  goals: new Set(["residency", "tax", "passport", "business", "property"]),
};

const MAX_SITUATION = 4000;
const MAX_SHORT = 200;

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

function redirectTo(request: NextRequest, locale: string, fragment: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const url = new URL(`${prefix}/${fragment}`, request.nextUrl.origin);
  // 303: the browser must follow a POST's redirect with GET, otherwise a
  // refresh on the thank-you view re-submits the form.
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const rawLocale = field(form, "locale");
  const locale = routing.locales.includes(rawLocale as never)
    ? rawLocale
    : routing.defaultLocale;

  // Honeypot. A hidden field no human ever sees; bots fill every input they
  // find. Answer with the success redirect rather than an error — telling a
  // bot which check it failed is how the next attempt passes.
  if (field(form, "company") !== "") {
    return redirectTo(request, locale, "#enquiry-sent");
  }

  const email = field(form, "email").slice(0, MAX_SHORT);
  const consent = form.get("consentToShare") === "on";

  // The two fields without which the enquiry cannot be acted on at all. The
  // rest of the form is optional by design: someone who has not decided
  // anything yet is exactly who this block is for, and a required "budget"
  // would turn them away.
  if (!looksLikeEmail(email) || !consent) {
    return redirectTo(request, locale, "#enquiry-error");
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
    name: field(form, "name").slice(0, MAX_SHORT),
    email,
    consentToShare: consent,
    locale,
    submittedAt: new Date().toISOString(),
  };

  try {
    const stored = await storeEnquiry(payload);
    if (!stored) {
      // Losing an enquiry silently is the worst outcome this route has, so
      // the terminal gets the whole payload and the reason. In production
      // this is a misconfiguration that needs fixing within the hour.
      console.error(
        `[moveandinvest] Enquiry NOT stored — missing ${describeMissingConfig()}. ` +
          `Create a private dataset, set NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET and ` +
          `SANITY_API_WRITE_TOKEN. Payload follows so it is not lost:`,
      );
      console.error(JSON.stringify(payload));
      return redirectTo(request, locale, "#enquiry-error");
    }
  } catch (error) {
    console.error("[moveandinvest] Enquiry write failed:", error);
    console.error(JSON.stringify(payload));
    return redirectTo(request, locale, "#enquiry-error");
  }

  return redirectTo(request, locale, "#enquiry-sent");
}
