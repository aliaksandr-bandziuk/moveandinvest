import { get } from "./client";

// The Labs location directory, which is free and is not the same directory the
// SERP API uses.
//
//   npm run dfs:locations              # every country that offers en, ru or pl
//   npm run dfs:locations -- poland    # search by name
//   npm run dfs:locations -- --all     # all 94, with every language
//
// IT EXISTS BECAUSE THE OBVIOUS ANSWER WAS WRONG. The first version of the
// market table had Russia in it. DataForSEO Labs covers 94 countries and
// Russia is not one of them — Google left that market — so the code would have
// been rejected, or worse, silently substituted. Russian is available through
// Kazakhstan and Ukraine and nowhere else. A codes table written from memory
// is a table that is wrong in exactly this way.

const OURS = ["en", "ru", "pl"];

interface Loc {
  location_code: number;
  location_name: string;
  location_type: string;
  country_iso_code?: string;
  available_languages?: { language_code: string; language_name: string }[];
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const needle = args.find((a) => !a.startsWith("--"))?.toLowerCase();

  const response = await get<Loc>("/v3/dataforseo_labs/locations_and_languages");
  const locations = response.tasks[0]?.result ?? [];
  console.log(`${locations.length} locations in the Labs directory\n`);

  let shown = 0;
  for (const loc of locations) {
    const languages = (loc.available_languages ?? []).map((l) => l.language_code);
    const mine = languages.filter((code) => OURS.includes(code));

    if (needle) {
      if (!loc.location_name.toLowerCase().includes(needle)) continue;
    } else if (!all && (loc.location_type !== "Country" || mine.length === 0)) {
      continue;
    }

    console.log(
      `${String(loc.location_code).padStart(5)}  ${loc.location_name.padEnd(28)}` +
        `${(loc.country_iso_code ?? "").padEnd(4)}` +
        `${(all ? languages : mine).join(", ")}`,
    );
    shown += 1;
  }

  if (shown === 0) console.log(`nothing matched${needle ? ` "${needle}"` : ""}`);
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
