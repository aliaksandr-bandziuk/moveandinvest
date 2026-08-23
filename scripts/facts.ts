import { createClient } from "@sanity/client";
import { FAQ_ITEMS } from "./copy/faq";
import { COUNTRY_PAGES, SOURCE_NOTE } from "./copy/jurisdictions";

// Fills the per-jurisdiction facts that the home page's lower sections need
// and that seeding never wrote:
//
//   * minimumInvestment / timeToPermit / taxRegime / intro, on every
//     countryPage — the comparison table, section 01.
//   * costAdvertisedEur / costExtrasEur + sourceNote, on every countryPage —
//     the cost comparison, section 04.
//   * speedBand / strengths, on every country — the route finder, section 05.
//   * question / answer, on every faqItem — the FAQ, section 07.
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

interface FactSeed {
  /** ISO alpha-2, lowercased — the suffix in both document ids. */
  code: string;
  /** The figure the programme advertises, converted to euro. */
  advertised: number;
  /** Taxes, professional fees, government charges and the first renewal. */
  extras: number;
  /** What the extras figure is actually made of. Not written to Sanity — it
   *  is here so the next person to verify a number knows what to verify. */
  breakdown: string;
  /** Which deadline this route can meet. Cumulative — see matching.ts. */
  speedBand: "weeks" | "months" | "long";
  /** Comparative advantages only. A value ticked on all five would stop
   *  discriminating and make the route finder's third question useless. */
  strengths: ("passport" | "tax" | "speed")[];
}

const FACTS: FactSeed[] = [
  {
    code: "gr",
    // Law 5038/2023 art. 100 as amended by Law 5100/2024 art. 64, in force
    // 1 Sep 2024. THREE tiers, not one: €800,000 across the whole of Attica,
    // the regional unit of Thessaloniki, Mykonos, Santorini and every island
    // over 3,100 inhabitants; €400,000 everywhere else; €250,000 only for a
    // change of use to residential, a factory idle five years, or the full
    // restoration of a listed building — with the work FINISHED before the
    // application. The table carries €400,000 and says the rest in a note.
    advertised: 400_000,
    extras: 36_000,
    breakdown:
      "transfer tax 3.09% (3% + 3% municipal surcharge on the tax) 12,360; notary ~1.5% 6,000; legal ~1.5% 6,000; agency ~2% 8,000; e-paravolo 2,000 + card 16; first renewal 2,000",
    // The permit card takes months and the backlog reached 18 months, but
    // art. 10 of Law 5038/2023 issues a bebaiosi on filing that ITSELF confers
    // lawful residence and the rights of the permit until the decision. That
    // is what a relocator actually needs, so the band follows the receipt, not
    // the card. Challenge this if the receipt ever stops carrying the rights.
    speedBand: "months",
    // 7 years of ACTUAL residence for naturalisation, and the investor permit
    // is a qualifying title — but it carries no minimum stay, so the permit
    // alone never accrues the period. Shortest EU route in the set after
    // Malta's ~5 years.
    strengths: ["passport"],
  },
  {
    code: "pt",
    // Fund subscription, subalinea vii of art. 3(1) of Lei 23/2007. The two
    // real-estate options and the plain capital transfer were revoked by
    // Lei 56/2023 art. 53; art. 3(5) additionally bars any investment aimed
    // directly or indirectly at real estate.
    advertised: 500_000,
    extras: 28_000,
    breakdown:
      "AIMA fees from 1 Mar 2026: analysis 842.80 + grant 8,418.90 + first renewal 4,210.30 = 13,472 (25% less if filed online); legal ~8,000; fund subscription and management charges ~6,500 over the first year",
    // Statute says 90 days (art. 82(5) Lei 23/2007). Reality is a year to
    // three: filing to biometrics 6–24 months, biometrics to card 6–18, and
    // AIMA still reported ~30,000 pending files on 4 Aug 2026.
    speedBand: "long",
    // NOT a passport route any more. Lei Organica 1/2026, in force 19 May
    // 2026, took naturalisation to 7 years for EU and CPLP nationals and 10
    // for everyone else, counted from the ISSUE of the permit, with a culture
    // and history exam on top. Malta at ~5 years is now shorter. What
    // Portugal does have is IFICI: 20% flat on Portuguese category A and B
    // income for 10 years.
    strengths: ["tax"],
  },
  {
    code: "mt",
    // MPRP, S.L. 217.26 under Cap. 217, as amended by L.N. 310 of 2024 (from
    // 1 Jan 2025) and L.N. 146 of 2025 (22 Jul 2025). The €300,000 the site
    // used to publish was the pre-reform floor for the south of Malta and
    // Gozo; that regional discount no longer exists.
    advertised: 375_000,
    extras: 126_000,
    breakdown:
      "stamp duty 5% 18,750; administrative fee 60,000; government contribution 37,000; NGO donation 2,000; residence card 500; notary and legal ~7,750. Leasing instead of buying: 14,000/yr rent and no stamp duty. Agency commission excluded — on Malta the seller normally pays it",
    // Residency Malta publishes no processing time at all; the agents'
    // handbook says only "reasonable times". The regulations allow 8 months
    // after the letter of approval in principle just to complete the purchase
    // and the payments, so 6–12 months end to end is the honest range.
    speedBand: "months",
    // Ordinary naturalisation: 4 years within the last 6, plus 12 continuous
    // months before applying. The shortest in the set. Citizenship BY
    // INVESTMENT is closed — after CJEU C-181/23 (29 Apr 2025) the scheme was
    // replaced by merit-based naturalisation under S.L. 188.06, where payment
    // alone does not qualify. Remittance basis for non-domiciled residents,
    // but MPRP by itself confers no tax residence.
    strengths: ["passport", "tax"],
  },
  {
    code: "ae",
    // AED 2,000,000, one or more properties, mortgage allowed with a bank
    // no-objection letter. 10 years, renewable. Off-plan is NOT claimed here:
    // no ICP, GDRFA or DLD page supports it, and GDRFA's property-owner page
    // requires a completed building.
    //
    // Converted at 4.288 AED/EUR on 23 Aug 2026. The rate is part of the
    // figure, not a constant: the previous 490,000 came from 4.08 and was
    // 24,000 euro out by the time anyone read it. Re-convert when re-checking.
    advertised: 466_000,
    extras: 31_000,
    breakdown:
      "golden visa government fees AED 9,884.75 (medical 700, Emirates ID 1,153, residency 2,856.75, DLD 4,020, admin 1,155) = 2,305; DLD transfer 4% + admin ~19,640 and agency ~2% ~9,330 — both market practice, not confirmed by a DLD tariff page",
    // DLD publishes 7–10 working days, GDRFA about 5, ICP two days for the
    // entry permit. Title deed to Emirates ID is realistically 2–4 weeks.
    speedBand: "weeks",
    // u.ae, verbatim: "The UAE does not levy income tax on individuals."
    // Corporate tax and the 15% domestic top-up do not touch personal income.
    // Naturalisation is discretionary and by nomination; property never
    // triggers it, so no passport strength.
    strengths: ["tax", "speed"],
  },
  {
    code: "cy",
    // Regulation 6(2), revised criteria of 2 May 2023. €300,000 EXCLUDING
    // VAT, plus €50,000 of secured annual income from abroad, +€15,000 for a
    // spouse and +€10,000 per minor child, health insurance, and an annual
    // proof that the investment is still held.
    //
    // Deferred on the site, and the figures below are the weakest in this
    // file: gov.cy returns 403 to an automated request, mip.gov.cy has an
    // expired certificate and the tax department's PDF is robots-blocked, so
    // everything here rests on secondary sources. Do not publish Cyprus until
    // a primary source has been read by a human.
    advertised: 300_000,
    extras: 19_000,
    breakdown:
      "VAT at the reduced 5% 15,000 (19% if the reduced rate does not apply, which is 57,000); legal ~1% 3,000; permit and immigration fees ~500. Transfer fees are NIL where VAT was paid, and the 6(2) route requires a first-sale property — so they are not in the stack at all",
    speedBand: "months",
    strengths: ["tax"],
  },
];

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
      typeof page.costAdvertisedEur === "number" && typeof page.costExtrasEur === "number"
        ? `${page.costAdvertisedEur} + ${page.costExtrasEur}`
        : "empty";

    console.log(
      `  ${page._id.padEnd(38)} ${before.padStart(18)}  ->  ${cost.advertised} + ${cost.extras}`,
    );

    // The table fields come from the same shared module `seed.ts` reads, so
    // a corrected figure reaches an already-published document and an empty
    // dataset by the same edit. `seed` runs once and never again; this is the
    // only route a correction has to live content.
    const table = COUNTRY_PAGES.find((entry) => entry.country === `country-${code}`);

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
      },
    });
    planned += 1;
  }

  // --- country: route-finder inputs -----------------------------------------
  // These live on `country` rather than `countryPage` because they are
  // language-neutral. One patch per jurisdiction, not one per locale.
  const registry = await client.fetch<CountryDoc[]>(
    `*[_type == "country"] | order(_id asc){ _id, code, speedBand, strengths }`,
  );

  console.log(`\nroute finder (section 05)`);
  for (const doc of registry) {
    const fact = FACTS.find((entry) => entry.code === doc.code);
    if (!fact) {
      skipped.push(doc._id);
      continue;
    }

    const before = doc.speedBand
      ? `${doc.speedBand} · ${(doc.strengths ?? []).join("+") || "—"}`
      : "empty";

    console.log(
      `  ${doc._id.padEnd(38)} ${before.padStart(18)}  ->  ${fact.speedBand} · ${fact.strengths.join("+")}`,
    );

    transaction.patch(doc._id, {
      set: { speedBand: fact.speedBand, strengths: fact.strengths },
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

    console.log(`  ${doc._id.padEnd(38)}  ->  ${item.a[doc.language].slice(0, 48)}…`);

    transaction.patch(doc._id, {
      set: { question: item.q[doc.language], answer: item.a[doc.language] },
    });
    planned += 1;
  }

  if (skipped.length > 0) {
    console.log(`\nskipped (no entry for that code, or no language): ${skipped.join(", ")}`);
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
