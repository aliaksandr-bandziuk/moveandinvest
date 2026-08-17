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
  name: string;
  email: string;
  consentToShare: boolean;
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

export async function storeEnquiry(payload: EnquiryPayload): Promise<boolean> {
  const client = getEnquiryClient();
  if (!client) return false;

  await client.create({ _type: "enquiry", ...payload });
  return true;
}
