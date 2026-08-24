import { createClient } from "@sanity/client";

// Promotes drafts to published.
//
// `npm run seed` deliberately leaves every jurisdiction page, property page and
// FAQ answer as a draft, because each one carries investment thresholds, permit
// timelines, tax regimes or statements about what a buyer may and may not do.
// This script is the explicit "I have looked at these and I accept them" step —
// it is not part of seeding, and it is not something to run by reflex.
//
//   npm run publish -- gr pt mt ae                    # English pages, four codes
//   npm run publish -- gr --locale ru                 # the Russian Greece page
//   npm run publish -- --all                          # every countryPage draft
//   npm run publish -- --type propertyPage --all      # every property page
//   npm run publish -- --type faqItem --all           # every FAQ draft
//
// --type defaults to countryPage. Only types listed in PUBLISHABLE below are
// accepted: promoting an arbitrary type by name is how a half-written singleton
// reaches the live site.
//
// ADDING A DOCUMENT TYPE THAT SEEDS AS A DRAFT MEANS ADDING IT TO THAT SET.
// `propertyPage` shipped on 24 Aug 2026 with the seed writing twelve drafts and
// this list still naming two types, so the only way to publish them was by hand
// in Studio. The error message was at least honest about it.
//
// Needs SANITY_API_WRITE_TOKEN in .env.local. Create the token, run this,
// delete the token.
//
// Publishing in Sanity is not a flag: it is "copy the draft to the published
// id, then remove the draft". Both halves run in ONE transaction, so a failure
// can never leave a document that is neither draft nor published.

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
  // Load-bearing. Without it the client uses the default perspective, which
  // filters drafts out of every query — so a script whose entire job is to
  // find drafts found none, on a dataset that had twelve of them, and said so
  // truthfully. Fixed after `npm run inspect` (which does set this) listed
  // them all.
  perspective: "raw",
});

interface DraftDoc {
  _id: string;
  _type: string;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
  title?: string;
  question?: string;
  language?: string;
  [key: string]: unknown;
}

const PUBLISHABLE = new Set(["countryPage", "propertyPage", "faqItem"]);

// Which types are addressed by jurisdiction code. `npm run publish -- gr pt`
// builds ids from these; faqItem is keyed by question instead, which is why it
// tells you to use --all.
const CODE_ADDRESSED = new Set(["countryPage", "propertyPage"]);

function parseArgs(argv: string[]) {
  const codes: string[] = [];
  let locale = "en";
  // Whether the caller CHOSE a language or inherited the default. Worth
  // tracking, because `npm run publish -- gr pt mt ae` promotes four documents
  // and reports success — and the site then has English jurisdiction pages
  // while the Russian and Polish ones 404. That is exactly what happened.
  let localeExplicit = false;
  let all = false;
  let type = "countryPage";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--all") {
      all = true;
    } else if (arg === "--type") {
      const next = argv[i + 1];
      if (!next || !PUBLISHABLE.has(next)) {
        throw new Error(
          `--type must be one of: ${[...PUBLISHABLE].join(", ")}`,
        );
      }
      type = next;
      i += 1;
    } else if (arg === "--locale") {
      const next = argv[i + 1];
      if (!next) throw new Error("--locale needs a value, e.g. --locale ru");
      locale = next;
      localeExplicit = true;
      i += 1;
    } else if (arg && !arg.startsWith("--")) {
      codes.push(arg);
    }
  }

  return { codes, locale, localeExplicit, all, type };
}

async function run() {
  const { codes, locale, localeExplicit, all, type } = parseArgs(process.argv.slice(2));

  // Said BEFORE the work, not after, because after it the line sits under a
  // list of successes and reads as a footnote.
  if (!all && !localeExplicit) {
    console.log(
      `No --locale given, so this publishes the "${locale}" documents ONLY.` +
        ` The other two languages stay drafts and their pages 404.\n` +
        `  every language at once:  npm run publish -- --all\n`,
    );
  }

  // Scoped to a known type on purpose. The singletons are already published
  // and nothing else in this dataset should be promoted by a script.
  const query = all
    ? `*[_type == $type && _id in path("drafts.**")]`
    : `*[_type == $type && _id in path("drafts.**") && _id in $ids]`;

  const ids = codes.map((code) => `drafts.${type}-${code}-${locale}`);

  if (!all && ids.length === 0) {
    console.error(
      `Nothing to do. Pass jurisdiction codes (gr pt mt ae) or --all.` +
        (CODE_ADDRESSED.has(type)
          ? ""
          : ` Drafts of type ${type} are not addressed by jurisdiction code — use --all.`),
    );
    process.exit(1);
  }

  const drafts = await client.fetch<DraftDoc[]>(
    query,
    all ? { type } : { type, ids },
  );

  if (drafts.length === 0) {
    console.log("No matching drafts found — they may already be published.");
    return;
  }

  const transaction = client.transaction();

  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, "");
    // System fields are dropped: _rev and the timestamps belong to the draft,
    // and carrying them over makes the published document claim a revision it
    // does not have.
    const { _id, _rev, _createdAt, _updatedAt, ...content } = draft;
    void _id;
    void _rev;
    void _createdAt;
    void _updatedAt;

    transaction.createOrReplace({ ...content, _id: publishedId } as DraftDoc);
    transaction.delete(draft._id);
  }

  await transaction.commit();

  console.log(`Published ${drafts.length} document(s):`);
  for (const draft of drafts) {
    console.log(
      `  ${draft._id.replace(/^drafts\./, "")} — ${draft.title ?? draft.question ?? "(untitled)"}`,
    );
  }
  console.log("");
  console.log(
    "These figures are still the seeded, UNVERIFIED ones. Check each against a",
  );
  console.log(
    "primary source and update sourceNote before the real domain goes live.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
