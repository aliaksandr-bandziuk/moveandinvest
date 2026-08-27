import { createClient } from "@sanity/client";
import { FAQ_ITEMS } from "./copy/faq";
import { JURISDICTION_BODY } from "./copy/jurisdictionBody";
import { PROPERTY_BODY } from "./copy/propertyBody";
import {
  COUNTRY_LABELS,
  COUNTRY_PAGES,
  SOURCE_NOTE,
} from "./copy/jurisdictions";
import { FACTS } from "./copy/costs";

// Fills the per-jurisdiction facts that the home page's lower sections need
// and that seeding never wrote:
//
//   * minimumInvestment / timeToPermit / taxRegime / intro, on every
//     countryPage — the comparison table, section 01.
//   * costAdvertisedEur / costExtrasEur + sourceNote, on every countryPage —
//     the cost comparison, section 04.
//   * speedBand / strengths, on every country — the route finder, section 05.
//   * question / answer, on every faqItem — the FAQ, section 07.
//   * body, on every countryPage — the prose on the jurisdiction page.
//   * the six sections, on every propertyPage — the prose on the buying page.
//
// Published documents and drafts alike.
//
//   npm run facts            # show what would change, write nothing
//   npm run facts -- --write # apply it
//
// (Was `npm run costs` until section 05 needed two more fields on a different
// document type. One command that writes every unseeded fact beats two that
// each write half, and the old name would have lied about what it touches.)
//
// Why this is a separate script and not part of `npm run seed`: seeding runs
// once on an empty dataset and leaves drafts. These values land on documents
// that are ALREADY published, so writing them is an edit to live content, and
// an edit to live content should never be a side effect of a command whose
// name says "seed". Dry-run is the default for the same reason.
//
// The numbers below were VERIFIED against primary sources on 23 August 2026.
// The working is in docs/figures-verification-2026-08-23.md, one section per
// jurisdiction, with the statute or the ministry page and its date. Five of
// the six headline figures the site had before that date were wrong.
//
// Two conventions that the figures are meaningless without, and that the
// rendered note therefore states out loud:
//
//   BASIS: one main applicant, no dependants. Family members are priced
//   completely differently from one jurisdiction to the next — in Portugal a
//   spouse costs the same as the main applicant, on Malta a spouse is free —
//   so a per-family column would compare four different things. Dependant
//   pricing belongs on each jurisdiction page.
//
//   PERIOD: everything payable to get in and hold the permit through its
//   first renewal.
//
// Anything not confirmable from a primary source is left out of the totals
// rather than estimated, and named in the breakdown as market practice.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary Editor token, run this, then delete it.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token,
  // Same reason as publish.ts: the default perspective hides drafts, and half
  // the documents this touches are drafts.
  perspective: "raw",
});

type Locale = "en" | "ru" | "pl";

// Rewritten on every document this touches. The wording matters: the block
// puts it under the bars, so it is the sentence that stops an unchecked
// number from reading as a checked one.

interface PageDoc {
  _id: string;
  language?: string;
  costAdvertisedEur?: number | null;
  costExtrasEur?: number | null;
}

interface CountryDoc {
  _id: string;
  code?: string;
  speedBand?: string | null;
  strengths?: string[] | null;
}

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ru" || value === "pl";
}

async function run() {
  const write = process.argv.slice(2).includes("--write");

  const pages = await client.fetch<PageDoc[]>(
    `*[_type == "countryPage"] | order(_id asc){ _id, language, costAdvertisedEur, costExtrasEur }`,
  );

  if (pages.length === 0) {
    console.error("No countryPage documents found. Run `npm run seed` first.");
    process.exit(1);
  }

  const transaction = client.transaction();
  let planned = 0;
  const skipped: string[] = [];

  for (const page of pages) {
    // `countryPage-gr-en` and `drafts.countryPage-gr-en` both end in the same
    // two segments, so the code survives the drafts prefix.
    const parts = page._id.replace(/^drafts\./, "").split("-");
    const code = parts[1];
    const cost = FACTS.find((entry) => entry.code === code);

    if (!cost || !isLocale(page.language)) {
      skipped.push(page._id);
      continue;
    }

    const before =
      typeof page.costAdvertisedEur === "number" &&
      typeof page.costExtrasEur === "number"
        ? `${page.costAdvertisedEur} + ${page.costExtrasEur}`
        : "empty";

    console.log(
      `  ${page._id.padEnd(38)} ${before.padStart(18)}  ->  ${cost.advertised} + ${cost.extras}`,
    );

    // The table fields come from the same shared module `seed.ts` reads, so
    // a corrected figure reaches an already-published document and an empty
    // dataset by the same edit. `seed` runs once and never again; this is the
    // only route a correction has to live content.
    const table = COUNTRY_PAGES.find(
      (entry) => entry.country === `country-${code}`,
    );

    // The page prose. Written per jurisdiction per locale in
    // copy/jurisdictionBody.ts and converted to Portable Text there; this
    // script is only the delivery. Cyprus has no entry, which is why the
    // lookup is optional rather than required — the four published
    // jurisdictions get a body and the deferred one keeps an empty field,
    // and the route renders no heading over it.
    const body = code ? JURISDICTION_BODY[code]?.[page.language] : undefined;

    transaction.patch(page._id, {
      set: {
        costAdvertisedEur: cost.advertised,
        costExtrasEur: cost.extras,
        sourceNote: SOURCE_NOTE[page.language],
        ...(table
          ? {
              minimumInvestment: table.minimumInvestment,
              timeToPermit: table.timeToPermit[page.language],
              taxRegime: table.taxRegime[page.language],
              intro: table.intro[page.language],
            }
          : {}),
        ...(body ? { body } : {}),
      },
    });

    if (body) {
      // A table has no `children`; its words live in cells. Counted rather
      // than skipped, because the word count is what this line reports and a
      // body that is half table would otherwise read as half empty.
      const words = body.reduce((total, block) => {
        if (block._type === "table") {
          return (
            total +
            block.rows.reduce(
              (sum, row) =>
                sum +
                row.cells.reduce(
                  (n, cell) => n + cell.split(/\s+/).filter(Boolean).length,
                  0,
                ),
              0,
            )
          );
        }
        if (block._type === "faq") {
          // Question and answer both count: a closed accordion still holds
          // every word, which is exactly why it is native <details>.
          return (
            total +
            block.items.reduce(
              (sum, item) =>
                sum +
                `${item.question} ${item.answer}`.split(/\s+/).filter(Boolean)
                  .length,
              0,
            )
          );
        }
        return total + (block.children[0]?.text.split(/\s+/).length ?? 0);
      }, 0);
      console.log(
        `  ${" ".repeat(38)} ${String(body.length).padStart(18)} blocks, ${words} words`,
      );
    }
    planned += 1;
  }

  // --- country: route-finder inputs -----------------------------------------
  // These live on `country` rather than `countryPage` because they are
  // language-neutral. One patch per jurisdiction, not one per locale.
  const registry = await client.fetch<CountryDoc[]>(
    `*[_type == "country"] | order(_id asc){ _id, code, speedBand, strengths }`,
  );

  console.log(`\nroute finder (section 05) and the reader-facing name`);
  for (const doc of registry) {
    const fact = FACTS.find((entry) => entry.code === doc.code);
    if (!fact) {
      skipped.push(doc._id);
      continue;
    }

    // The label every component actually renders. Until 23 Aug 2026 there was
    // no such field and the six components that show a jurisdiction read the
    // English `name`, so the Russian home page said "Greece". Seeding cannot
    // deliver this — these documents were published months ago — which is the
    // whole reason this script exists.
    const label = doc.code ? COUNTRY_LABELS[doc.code] : undefined;

    const before = doc.speedBand
      ? `${doc.speedBand} · ${(doc.strengths ?? []).join("+") || "—"}`
      : "empty";

    console.log(
      `  ${doc._id.padEnd(38)} ${before.padStart(18)}  ->  ${fact.speedBand} · ${fact.strengths.join("+")}`,
    );

    if (label) {
      console.log(
        `  ${" ".repeat(38)} ${"label".padStart(18)}  ->  ${label.ru} · ${label.pl}`,
      );
    }

    transaction.patch(doc._id, {
      set: {
        speedBand: fact.speedBand,
        strengths: fact.strengths,
        ...(label ? { label } : {}),
      },
    });
    planned += 1;
  }

  // --- propertyPage: the six sections ---------------------------------------
  // Same reason as everything else in this script: seeding writes the frame
  // once, and the prose has to reach documents that are already published.
  //
  // Each section is written by NAME rather than by spreading an object, so a
  // field renamed in the schema fails the typecheck here instead of silently
  // writing nothing — which is the failure mode that would look like "the
  // section just isn't rendering".
  interface PropertyDoc {
    _id: string;
    language?: string;
  }

  const properties = await client.fetch<PropertyDoc[]>(
    `*[_type == "propertyPage"] | order(_id asc){ _id, language }`,
  );

  console.log(`\nproperty pages`);
  for (const doc of properties) {
    const parts = doc._id.replace(/^drafts\./, "").split("-");
    const code = parts[1];
    const body =
      code && isLocale(doc.language)
        ? PROPERTY_BODY[code]?.[doc.language]
        : undefined;

    if (!body) {
      skipped.push(doc._id);
      continue;
    }

    const blockCount = Object.values(body).reduce(
      (n, section) => n + section.length,
      0,
    );
    console.log(
      `  ${doc._id.padEnd(38)}  ->  6 sections, ${blockCount} blocks`,
    );

    transaction.patch(doc._id, {
      set: {
        whoMayBuy: body.whoMayBuy,
        transactionCosts: body.transactionCosts,
        steps: body.steps,
        annualCosts: body.annualCosts,
        shortLet: body.shortLet,
        residencyLink: body.residencyLink,
      },
    });
    planned += 1;
  }

  // --- faqItem: the answers, section 07 -------------------------------------
  // Same reason as the table fields above: these were seeded as drafts, and
  // once promoted `seed` can never correct them again.
  interface FaqDoc {
    _id: string;
    language?: string;
  }

  const faqs = await client.fetch<FaqDoc[]>(
    `*[_type == "faqItem"] | order(_id asc){ _id, language }`,
  );

  console.log(`\nfaq (section 07)`);
  for (const doc of faqs) {
    // `faqItem-citizenship-years-ru` and its drafts prefix both end in the
    // key and the locale, so slicing off the type and the language leaves it.
    const bare = doc._id.replace(/^drafts\./, "").replace(/^faqItem-/, "");
    const key = bare.replace(/-(en|ru|pl)$/, "");
    const item = FAQ_ITEMS.find((entry) => entry.key === key);

    if (!item || !isLocale(doc.language)) {
      skipped.push(doc._id);
      continue;
    }

    console.log(
      `  ${doc._id.padEnd(38)}  ->  ${item.a[doc.language].slice(0, 48)}…`,
    );

    transaction.patch(doc._id, {
      set: { question: item.q[doc.language], answer: item.a[doc.language] },
    });
    planned += 1;
  }

  if (skipped.length > 0) {
    console.log(
      `\nskipped (no entry for that code, or no language): ${skipped.join(", ")}`,
    );
  }

  if (!write) {
    console.log(
      `\nDry run. ${planned} document(s) would change. Re-run with --write to apply:\n  npm run facts -- --write`,
    );
    return;
  }

  await transaction.commit();
  console.log(`\nPatched ${planned} document(s).`);
  console.log("Verify with `npm run inspect`, then reload the home page.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
