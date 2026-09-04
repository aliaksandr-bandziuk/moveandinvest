import { createClient } from "@sanity/client";
import { LOCALES } from "./copy/home";
import { COUNTRY_PAGES, countryPageSeo, type Locale } from "./copy/jurisdictions";
import { PROPERTY_PAGES } from "./copy/property";

// Patches the SEO block of the jurisdiction and property pages from
// scripts/copy/, one document at a time, touching nothing else.
//
//   npm run seo                      # show what would change, write nothing
//   npm run seo -- --write           # apply it
//   npm run seo -- --locale ru       # only the Russian documents
//   npm run seo -- --type propertyPage --write
//
// WHY THIS EXISTS RATHER THAN `npm run seed`. Both write the same fields from
// the same copy, but seed uses createOrReplace and builds the whole document —
// so on a page that is already live it would discard the body that
// `npm run facts` wrote onto it, and any correction made in the Studio since.
// The jurisdiction and property pages are precisely the documents where that
// matters: their prose carries thresholds, permit timelines and statements
// about what a buyer may do, and none of that is in scripts/copy/.
//
// `npm run content` covers the singletons for the same reason and by the same
// method. This is its counterpart for the two types keyed by country, which it
// deliberately does not touch.
//
// A TITLE IS NOT A FIGURE, WHICH IS WHY THIS RUNS SEPARATELY FROM `publish`.
// Rewording a meta title changes what search engines show and nothing a reader
// relies on; it does not need the "I have looked at these and I accept them"
// step that promoting a draft does. But it does need a dry run, because a
// title is also the one field where a slip is invisible on the site itself.
//
// Needs SANITY_API_WRITE_TOKEN in .env.local. Create the token, run this,
// delete the token.

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
  // Both halves of every document: the published one the site serves and the
  // draft that exists the moment anyone opens it in the Studio. Patching only
  // the published copy is how a correction survives until the next time
  // someone presses Publish and the stale draft overwrites it.
  perspective: "raw",
});

/** What the copy says this document's SEO block should be. */
interface Target {
  id: string;
  type: "countryPage" | "propertyPage";
  locale: Locale;
  metaTitle: string;
  metaDescription: string;
}

const PUBLISHABLE = new Set(["countryPage", "propertyPage"]);

function parseArgs(argv: string[]) {
  const write = argv.includes("--write");
  let locale: Locale | null = null;
  let type: Target["type"] | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--locale") {
      const next = argv[i + 1];
      if (!next || !LOCALES.includes(next as Locale)) {
        throw new Error(`--locale needs one of: ${LOCALES.join(", ")}`);
      }
      locale = next as Locale;
    } else if (argv[i] === "--type") {
      const next = argv[i + 1];
      if (!next || !PUBLISHABLE.has(next)) {
        throw new Error(
          `--type needs one of: ${[...PUBLISHABLE].join(", ")}`,
        );
      }
      type = next as Target["type"];
    }
  }
  return { write, locale, type };
}

function buildTargets({
  locale,
  type,
}: {
  locale: Locale | null;
  type: Target["type"] | null;
}): Target[] {
  const targets: Target[] = [];
  const locales = locale ? [locale] : LOCALES;

  if (!type || type === "countryPage") {
    for (const page of COUNTRY_PAGES) {
      const code = page.country.replace("country-", "");
      for (const l of locales) {
        targets.push({
          id: `countryPage-${code}-${l}`,
          type: "countryPage",
          locale: l,
          ...countryPageSeo(page, l),
        });
      }
    }
  }

  if (!type || type === "propertyPage") {
    for (const page of PROPERTY_PAGES) {
      const code = page.country.replace("country-", "");
      for (const l of locales) {
        targets.push({
          id: `propertyPage-${code}-${l}`,
          type: "propertyPage",
          locale: l,
          metaTitle: page.metaTitle[l],
          metaDescription: page.metaDescription[l],
        });
      }
    }
  }

  return targets;
}

interface Existing {
  _id: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

/** Shows the change on one line each way, with the length, because the length
 *  is the half of a meta title that is easy to get wrong and impossible to see
 *  on the page. */
function report(id: string, field: string, before: string | null, after: string) {
  const from = before ?? "(empty)";
  console.log(`  ${id}`);
  console.log(`    ${field}`);
  console.log(`      was  [${from.length.toString().padStart(3)}] ${from}`);
  console.log(`      now  [${after.length.toString().padStart(3)}] ${after}`);
}

async function run() {
  const { write, locale, type } = parseArgs(process.argv.slice(2));
  const targets = buildTargets({ locale, type });

  // Every document twice: `x` and `drafts.x`. A dataset may hold either, both
  // or neither, and the ones it holds are the ones this patches.
  const ids = targets.flatMap((t) => [t.id, `drafts.${t.id}`]);
  const existing = await client.fetch<Existing[]>(
    `*[_id in $ids]{ _id, "metaTitle": seo.metaTitle, "metaDescription": seo.metaDescription }`,
    { ids },
  );
  const byId = new Map(existing.map((d) => [d._id, d]));

  if (existing.length === 0) {
    console.error("No jurisdiction or property documents found. Run `npm run seed` first.");
    process.exit(1);
  }

  const transaction = client.transaction();
  let planned = 0;
  const missing: string[] = [];
  const long: string[] = [];

  for (const target of targets) {
    // Warn rather than refuse: the copy is the source of truth, and a title
    // that has outgrown the cut is a copy problem to fix in the file, not a
    // reason to leave the document stale.
    if (target.metaTitle.length > 60) {
      long.push(`${target.id} (${target.metaTitle.length} chars)`);
    }

    let seenAny = false;
    for (const id of [target.id, `drafts.${target.id}`]) {
      const doc = byId.get(id);
      if (!doc) continue;
      seenAny = true;

      const set: Record<string, string> = {};
      if (doc.metaTitle !== target.metaTitle) {
        report(id, "seo.metaTitle", doc.metaTitle, target.metaTitle);
        set["seo.metaTitle"] = target.metaTitle;
      }
      if (doc.metaDescription !== target.metaDescription) {
        report(id, "seo.metaDescription", doc.metaDescription, target.metaDescription);
        set["seo.metaDescription"] = target.metaDescription;
      }
      if (Object.keys(set).length === 0) continue;

      transaction.patch(id, { set });
      planned += 1;
    }

    if (!seenAny) missing.push(target.id);
  }

  if (missing.length > 0) {
    console.log(`\nnot in the dataset, skipped: ${missing.join(", ")}`);
  }
  if (long.length > 0) {
    console.log(
      `\nover 60 characters and will be truncated in search: ${long.join(", ")}`,
    );
  }
  if (planned === 0) {
    console.log("\nEvery document already matches the copy. Nothing to do.");
    return;
  }

  if (!write) {
    console.log(
      `\nDry run. ${planned} document(s) would change. Re-run with --write to apply:\n  npm run seo -- --write`,
    );
    return;
  }

  await transaction.commit();
  console.log(`\nPatched ${planned} document(s).`);
  console.log(
    "Titles and descriptions are live on the published copies; the drafts carry the same text, so publishing one later will not undo this.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
