import { NextRequest } from "next/server";
import { POST } from "@/app/api/enquiry/route";

// WHERE EVERY FORM ON THE SITE COMES BACK TO, measured rather than reasoned
// about — a report in the same spirit as scripts/routes.ts, and written for the
// same reason: `next build` cannot run in every environment this project is
// edited from, so the redirect targets have never once been checked end to end.
//
// HOW IT AVOIDS SENDING ANYTHING. Every case below trips the honeypot — the
// hidden `q7` field, filled. That branch is the first thing the handler does
// after reading the locale and the kind: it logs, answers with the SUCCESS
// redirect, and returns. Nothing is stored, no email leaves, no rate-limit
// allowance is spent, and the Location header it produces is built by exactly
// the same target functions the real paths use.
//
// So this proves the ADDRESSES are right. It does not prove an enquiry is
// delivered — that needs SMTP credentials and a live dataset, and it is what
// npm run mailcheck is for.
//
// WHAT TO LOOK FOR. Every line must be a path that exists. Before 31 August
// 2026 three of them did not resolve directly: the long form always came back
// to the home page's fragment even when it was submitted from /enquiry, and the
// question form and the partner reply came back to /ru/contacts and
// /ru/for-partners, which the middleware then had to 307 onwards. The partner
// one was found by this script and by nothing else.

const ORIGIN = "https://www.moveandinvest.com";

interface Case {
  label: string;
  fields: Record<string, string>;
}

const CASES: Case[] = [
  { label: "reader — home", fields: { from: "home" } },
  { label: "reader — /enquiry", fields: { from: "enquiry" } },
  {
    label: "article — guide foot",
    fields: { kind: "article", returnTo: "greece-residency" },
  },
  {
    label: "article — slug rejected",
    fields: { kind: "article", returnTo: "../../evil" },
  },
  {
    label: "brief — property page",
    fields: { kind: "brief", returnTo: "lisbon-apartments" },
  },
  // The next two send ONE slug for all three locales, which no page does — a
  // jurisdiction page and /changes each pass their own language's slug. Read
  // these two rows for the shape of the path, not for the slug in it.
  {
    label: "subscribe — jurisdiction (ru slug, all three)",
    fields: { kind: "subscribe", returnTo: "gretsiya" },
  },
  {
    label: "subscribe — /changes (ru slug, all three)",
    fields: { kind: "subscribe", returnTo: "izmeneniya" },
  },
  { label: "question — /contacts", fields: { kind: "question" } },
  {
    label: "question — /faq (ru slug, all three)",
    fields: { kind: "question", returnTo: "voprosy" },
  },
  { label: "partner — /for-partners", fields: { kind: "partner" } },
];

async function target(fields: Record<string, string>, locale: string) {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.append(name, value);
  form.append("locale", locale);
  // The trap. Everything after this point in the handler is skipped.
  form.append("q7", "a bot filled this");

  const response = await POST(
    new NextRequest(`${ORIGIN}/api/enquiry`, { method: "POST", body: form }),
  );

  const location = response.headers.get("location") ?? "(none)";
  return `${response.status} ${location.replace(ORIGIN, "")}`;
}

async function run() {
  console.log("redirect targets, per locale (honeypot path — nothing sent)\n");

  for (const testCase of CASES) {
    console.log(`  ${testCase.label}`);
    for (const locale of ["en", "ru", "pl"]) {
      console.log(`    ${locale}  ${await target(testCase.fields, locale)}`);
    }
    console.log("");
  }
}

void run();
