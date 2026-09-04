import { createClient } from "@sanity/client";

// Write-only client for the PRIVATE enquiries dataset.
//
// Two datasets on one project, and the split is a privacy boundary rather
// than an organisational one:
//
//   production  — public. Every jurisdiction page, every figure, every
//                 translated string. Readable by anyone with the project id,
//                 which is fine: all of it is published on the site anyway.
//   enquiries   — private. Names, emails and personal circumstances. Mark it
//                 private when creating it; nothing here ever reads it back
//                 for the front end, and the Studio reaches it through an
//                 authenticated session, not a token.
//
// Putting enquiries in the content dataset would make them readable with one
// GROQ query and no credentials.
//
// This module reads SANITY_API_WRITE_TOKEN, which has no NEXT_PUBLIC_ prefix,
// so Next replaces it with undefined in any client bundle rather than
// inlining it — importing this from a client component breaks the write, it
// does not leak the token. Import it from server code only.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

export interface EnquiryPayload {
  where: string;
  budget: string;
  timeline: string;
  goals: string[];
  situation: string;
  /** Property brief only: the city or area asked for. Empty on the home page
   *  enquiry, which asks about a country rather than a street. */
  city?: string;
  /** Property brief only: live / let / residency / unsure. */
  purpose?: string;
  /** Which form this came from. "enquiry" is the long block — the home page's
   *  section 08 and /enquiry, which are the same component; "brief" a property
   *  page; "article" the short two-field block at the foot of a guide. One
   *  payload rather than three, so the email template, the stored document and
   *  the log line each stay single.
   *
   *  An "article" enquiry carries less than the other two by design: an address,
   *  a sentence, and whichever jurisdiction the guide was about. Asking a reader
   *  who is still reading for a budget is how a foot-of-page form gets skipped. */
  kind?: "enquiry" | "brief" | "article";
  /** WHAT THE CALCULATOR SHOWED, when the enquiry came from it. Absent on
   *  every other route, which is most of them.
   *
   *  Recomputed on the server from the figures the reader's own link carried —
   *  see src/lib/calcSummary.ts — so these are the site's numbers, not a
   *  browser's. Worth carrying for the reason `source` is: nothing else can
   *  answer "was this person qualified before they wrote to us", and an
   *  analytics event cannot hold a euro figure against a name. */
  calc?: {
    /** Euro, as the reader typed it. */
    budget: number;
    /** Codes the budget covers, cheapest first. */
    fits: string[];
    /** The cheapest one it does not, and by how much. */
    nearestCode?: string;
    nearestShort?: number;
    /** The address that reproduces their screen. */
    href: string;
  };
  /** Article enquiries only: the slug of the guide it was sent from.
   *
   *  WORTH CARRYING FOR ONE REASON. Five guides now exist and more are coming,
   *  and nothing else on this site can answer "which of them is earning its
   *  keep" — an analytics event cannot, because the jurisdiction and the page a
   *  reader was on are exactly what this project has decided never to send to an
   *  analytics or advertising tool. It reaches the mailbox instead, where the
   *  person answering already has the enquiry in front of them. */
  source?: string;
  name: string;
  email: string;
  consentToShare: boolean;
  locale: string;
  submittedAt: string;
}

// The change-alert list. Two fields and a timestamp — deliberately the
// smallest payload on the site, because an address given for one purpose
// should not arrive attached to everything else the person was doing.
export interface SubscribePayload {
  email: string;
  /** ISO alpha-2 codes the reader picked, or empty for "all five". Not
   *  personal data about them; it is what they asked to be told about. */
  jurisdictions: string[];
  locale: string;
  submittedAt: string;
}

/** A question from /contacts. Deliberately the smallest shape here: an
 *  address, what they wrote, and the page's language.
 *
 *  IT IS NOT A LEAD, and keeping it a separate type is what stops it becoming
 *  one by accident. An enquiry carries a jurisdiction, a budget, a timeline and
 *  consent to be passed to a partner — that consent is what makes it passable
 *  at all. A question carries none of those, so it may never be handed to
 *  anybody: it is answered by us and it stops there. A shared shape with three
 *  empty fields would eventually be routed like the thing it resembles. */
export interface QuestionPayload {
  name: string;
  email: string;
  message: string;
  locale: string;
  submittedAt: string;
}

/** Null when the enquiries dataset or the write token is not configured. */
export function getEnquiryClient() {
  if (!projectId || !dataset || !token) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-15",
    useCdn: false,
    token,
  });
}

export function describeMissingConfig(): string | null {
  const missing: string[] = [];
  if (!projectId) missing.push("NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!dataset) missing.push("NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET");
  if (!token) missing.push("SANITY_API_WRITE_TOKEN");
  return missing.length > 0 ? missing.join(", ") : null;
}

export interface PartnerEnquiryPayload {
  jurisdiction: string;
  organisation: string;
  name: string;
  email: string;
  terms: string;
  locale: string;
  submittedAt: string;
}

export async function storeEnquiry(payload: EnquiryPayload): Promise<boolean> {
  const client = getEnquiryClient();
  if (!client) return false;

  await client.create({ _type: "enquiry", ...payload });
  return true;
}

// Same pattern again. Storing it is best effort; the email is the record,
// exactly as it is for the other two forms — see the note at the top of
// /api/enquiry/route.ts.
export async function storeSubscribe(payload: SubscribePayload): Promise<boolean> {
  const client = getEnquiryClient();
  if (!client) return false;

  await client.create({ _type: "subscriber", ...payload });
  return true;
}

// Same dataset, same client, different document type. A firm quoting its
// terms and a person asking for help have almost no fields in common, and
// merging them would make every field on both optional — see
// schemaTypes/documents/partnerEnquiry.ts.
export async function storePartnerEnquiry(
  payload: PartnerEnquiryPayload,
): Promise<boolean> {
  const client = getEnquiryClient();
  if (!client) return false;

  await client.create({ _type: "partnerEnquiry", ...payload });
  return true;
}
