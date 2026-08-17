import { createClient } from "@sanity/client";

// Fills the two euro figures the cost comparison (home page, section 04)
// needs, on every countryPage — published documents and drafts alike.
//
//   npm run costs            # show what would change, write nothing
//   npm run costs -- --write # apply it
//
// Why this is a separate script and not part of `npm run seed`: seeding runs
// once on an empty dataset and leaves drafts. These figures land on documents
// that are ALREADY published, so writing them is an edit to live content, and
// an edit to live content should never be a side effect of a command whose
// name says "seed". Dry-run is the default for the same reason.
//
// The numbers below are STARTING POINTS. Every one is a plausible order of
// magnitude assembled from public programme documentation, and not one has
// been checked against a primary source. That is why the script also rewrites
// sourceNote: the block renders the note directly under the bars, so the page
// says so out loud rather than presenting a guess as a finding.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
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

interface CostSeed {
  /** ISO alpha-2, lowercased — the suffix in `countryPage-<code>-<locale>`. */
  code: string;
  /** The figure the programme advertises, converted to euro. */
  advertised: number;
  /** Taxes, professional fees, government charges and the first renewal. */
  extras: number;
  /** What the extras figure is actually made of. Not written to Sanity — it
   *  is here so the next person to verify a number knows what to verify. */
  breakdown: string;
}

const COSTS: CostSeed[] = [
  {
    code: "gr",
    advertised: 250_000,
    extras: 34_000,
    breakdown:
      "transfer tax 3.09%, notary ~1.5%, legal ~1.5%, agency ~2%, permit fees per applicant, first renewal",
  },
  {
    code: "pt",
    advertised: 500_000,
    extras: 62_000,
    breakdown:
      "fund subscription and management fees, AIMA processing and permit fees per applicant, legal, biometrics, first renewal",
  },
  {
    code: "mt",
    advertised: 300_000,
    extras: 118_000,
    breakdown:
      "government contribution, administrative fee, mandatory donation, stamp duty 5%, agent and legal fees",
  },
  {
    code: "ae",
    advertised: 490_000,
    extras: 38_000,
    breakdown:
      "AED 2,000,000 converted at ~4.08; DLD transfer 4%, agency 2%, visa and medical fees, Emirates ID, admin",
  },
  {
    code: "cy",
    advertised: 300_000,
    extras: 46_000,
    breakdown:
      "VAT 5% or 19% depending on the property, transfer fees, legal ~1%, permit and immigration fees",
  },
];

// Rewritten on every document this touches. The wording matters: the block
// puts it under the bars, so it is the sentence that stops an unchecked
// number from reading as a checked one.
const NOTE: Record<Locale, string> = {
  en: "Order-of-magnitude estimates compiled from public programme documentation and NOT yet verified against primary sources. Extras cover transfer taxes, professional and government fees and the first renewal; they vary with the property, the family size and the year.",
  ru: "Оценки порядка величины, собранные из публичной документации программ и ЕЩЁ НЕ сверенные с первоисточниками. В «сверх того» входят налоги на переход права, профессиональные и государственные сборы и первое продление; суммы зависят от объекта, состава семьи и года.",
  pl: "Szacunki rzędu wielkości zebrane z publicznej dokumentacji programów i NIEZWERYFIKOWANE ze źródłami pierwotnymi. Pozycja „ponad to” obejmuje podatki od przeniesienia, opłaty profesjonalne i rządowe oraz pierwsze odnowienie; kwoty zależą od nieruchomości, liczby osób i roku.",
};

interface PageDoc {
  _id: string;
  language?: string;
  costAdvertisedEur?: number | null;
  costExtrasEur?: number | null;
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
    const cost = COSTS.find((entry) => entry.code === code);

    if (!cost || !isLocale(page.language)) {
      skipped.push(page._id);
      continue;
    }

    const before =
      typeof page.costAdvertisedEur === "number" && typeof page.costExtrasEur === "number"
        ? `${page.costAdvertisedEur} + ${page.costExtrasEur}`
        : "empty";

    console.log(
      `  ${page._id.padEnd(38)} ${before.padStart(18)}  ->  ${cost.advertised} + ${cost.extras}`,
    );

    transaction.patch(page._id, {
      set: {
        costAdvertisedEur: cost.advertised,
        costExtrasEur: cost.extras,
        sourceNote: NOTE[page.language],
      },
    });
    planned += 1;
  }

  if (skipped.length > 0) {
    console.log(`\nskipped (no cost entry or no language): ${skipped.join(", ")}`);
  }

  if (!write) {
    console.log(
      `\nDry run. ${planned} document(s) would change. Re-run with --write to apply:\n  npm run costs -- --write`,
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
