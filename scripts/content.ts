import { createClient } from "@sanity/client";
import { HOME_COPY, LOCALES } from "./copy/home";
import { CONTACT_EMAIL, PARTNERS_COPY } from "./copy/partners";
import { PRIVACY_COPY } from "./copy/privacy";

// Writes the page copy from scripts/copy/ onto the homePage and partnersPage
// documents that are ALREADY published, one patch per locale.
//
//   npm run content            # show what would change, write nothing
//   npm run content -- --write # apply it
//
// This is the migration that moved every visitor-facing string out of
// messages/<locale>.json and into the CMS. Before it, five of the eight home
// page sections had no Sanity fields at all and fixing a typo needed a
// deploy. Run it once per dataset; after that the Studio is where copy is
// edited and this script is only useful for rebuilding a dataset from
// scratch.
//
// Why not `npm run seed`: seed uses createOrReplace on the singletons, so it
// would discard anything edited in the Studio since the last run. This sets
// named fields and leaves everything else — including hand edits to fields it
// does not touch — alone. Dry run is the default for the same reason.
//
// The old flat fields (heading, comparisonHeading, methodPoints, anatomy*, …)
// are UNSET in the same patch. Leaving them behind would mean two copies of
// the same paragraph in one document, and the next person to edit would have
// no way to tell which one the page reads.

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
  // The singletons are published, but a draft copy exists alongside them the
  // moment anyone opens the document in the Studio. `raw` sees both.
  perspective: "raw",
});

// Every array member in Sanity needs a stable _key, or the Studio cannot
// reorder the list and React cannot tell two rows apart.
function keyed<T extends object>(items: T[], prefix: string) {
  return items.map((item, i) => ({ _key: `${prefix}${i + 1}`, ...item }));
}

// Field names the old schema used. Unset in the same transaction that writes
// the new ones — see the note at the top.
const RETIRED_HOME = [
  "eyebrow",
  "heading",
  "intro",
  "primaryCta",
  "secondaryCta",
  "comparisonHeading",
  "comparisonIntro",
  "methodHeading",
  "methodIntro",
  "methodPoints",
  "partnerTeaserHeading",
  "partnerTeaserBody",
];

const RETIRED_PARTNERS = [
  "eyebrow",
  "heading",
  "intro",
  "principles",
  "anatomyHeading",
  "anatomyIntro",
  "anatomySampleLabel",
  "anatomySampleTag",
  "anatomyFields",
  "anatomyNote",
  "qualificationHeading",
  "qualificationSteps",
  "terms",
  "contactEmail",
  "ctaLabel",
];

interface Doc {
  _id: string;
  _type: string;
}

async function run() {
  const write = process.argv.slice(2).includes("--write");

  const docs = await client.fetch<Doc[]>(
    `*[_type in ["homePage", "partnersPage", "privacyPage"]] | order(_id asc){ _id, _type }`,
  );

  if (docs.length === 0) {
    console.error("No page documents found. Run `npm run seed` first.");
    process.exit(1);
  }

  // The privacy policy arrived after the first seed ran, so unlike the other
  // two singletons its documents may not exist yet. createOrReplace rather
  // than patch: there is nothing to patch on a dataset seeded before this
  // page existed, and the policy has no editor-authored state worth
  // preserving — every word of it is generated from scripts/copy/privacy.ts
  // on purpose, because a legal text edited in two places is a legal text
  // that disagrees with itself.
  const existingPrivacy = new Set(
    docs.filter((d) => d._type === "privacyPage").map((d) => d._id.replace(/^drafts\./, "")),
  );

  const transaction = client.transaction();
  let planned = 0;
  const skipped: string[] = [];

  for (const doc of docs) {
    // `homePage-ru` and `drafts.homePage-ru` both end in the locale, so the
    // suffix survives the drafts prefix.
    const locale = doc._id.replace(/^drafts\./, "").split("-").pop();
    const isLocale = LOCALES.includes(locale as never);

    if (!isLocale) {
      skipped.push(doc._id);
      continue;
    }

    if (doc._type === "privacyPage") {
      const copy = PRIVACY_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          updatedLabel: copy.updatedLabel,
          updated: copy.updated,
          sections: keyed(copy.sections, "p"),
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} privacy policy`);
      continue;
    }

    if (doc._type === "homePage") {
      const copy = HOME_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          hero: copy.hero,
          method: { ...copy.method, points: keyed(copy.method.points, "m") },
          map: copy.map,
          cost: copy.cost,
          routeFinder: copy.routeFinder,
          faq: copy.faq,
          partnerTeaser: copy.partnerTeaser,
          enquiry: copy.enquiry,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
        unset: RETIRED_HOME,
      });
    } else {
      const copy = PARTNERS_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          hero: {
            ...copy.hero,
            principles: keyed(copy.hero.principles, "p"),
            contactEmail: CONTACT_EMAIL,
          },
          anatomy: { ...copy.anatomy, fields: keyed(copy.anatomy.fields, "f") },
          journey: { ...copy.journey, steps: keyed(copy.journey.steps, "s") },
          honesty: {
            ...copy.honesty,
            notItems: keyed(copy.honesty.notItems, "n"),
            yesItems: keyed(copy.honesty.yesItems, "y"),
          },
          contact: copy.contact,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
        unset: RETIRED_PARTNERS,
      });
    }

    console.log(`  ${doc._id.padEnd(26)} ${doc._type.padStart(13)}  ->  every section rewritten`);
    planned += 1;
  }

  // The three privacy documents may not exist at all: they were added after
  // the first seed ran, and `seed.ts` is a one-shot on an empty dataset that
  // must never be run again on a live one. createOrReplace is safe here for
  // the reason given above — every word of this page is generated, so there
  // is no editor state to lose — and it is what makes `npm run content` the
  // single command that brings a dataset up to date.
  for (const locale of LOCALES) {
    const id = `privacyPage-${locale}`;
    if (existingPrivacy.has(id)) continue;

    const copy = PRIVACY_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "privacyPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      updatedLabel: copy.updatedLabel,
      updated: copy.updated,
      sections: keyed(copy.sections, "p"),
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  if (skipped.length > 0) {
    console.log(`\nskipped (id does not end in a known locale): ${skipped.join(", ")}`);
  }

  if (!write) {
    console.log(
      `\nDry run. ${planned} document(s) would change. Re-run with --write to apply:\n  npm run content -- --write`,
    );
    return;
  }

  await transaction.commit();
  console.log(`\nPatched ${planned} document(s).`);
  console.log("Reload the site. Every string on both pages now comes from Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
