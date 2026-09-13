import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, firstResult, reportSpend } from "./client";

// What stands behind the domain, against the domains it is trying to displace.
//
//   npm run dfs:backlinks
//   npm run dfs:backlinks -- example.com other.com    # any set of targets
//
// WHY THIS IS THE LAST DIAGNOSTIC AND NOT THE FIRST. dfs:coverage showed that
// every one of the 71 queries worth entering is already claimed by a page that
// exists, is two to five thousand words long, is titled for the query and is
// internally linked. So the content is not the thing missing, and the next
// candidate explanation is the one nobody can write their way out of in a
// week. This measures it instead of assuming it.
//
// The account carries a backlinks subscription, so the index is included
// rather than metered per row.

const OUT = ".dfs";
const DEFAULT_TARGETS = [
  "moveandinvest.com",
  "immigrantinvest.com",
  "getgoldenvisa.com",
  "globalcitizensolutions.com",
  "passportivity.com",
  "imin-portugal.com",
  "us.iasservices.org.uk",
];

interface Summary {
  target?: string;
  first_seen?: string | null;
  rank?: number | null;
  backlinks?: number | null;
  backlinks_spam_score?: number | null;
  referring_domains?: number | null;
  referring_main_domains?: number | null;
  referring_pages?: number | null;
  referring_links_types?: Record<string, number> | null;
  internal_links_count?: number | null;
  external_links_count?: number | null;
}

async function summaryOf(target: string): Promise<Summary | null> {
  try {
    const response = await post<Summary>("/v3/backlinks/summary/live", [
      { target, internal_list_limit: 5, include_subdomains: true },
    ]);
    return firstResult(response);
  } catch (error) {
    console.error(`  ! ${target}: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

async function run(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const targets = args.length > 0 ? args : DEFAULT_TARGETS;

  const rows: Summary[] = [];
  for (const target of targets) {
    const summary = await summaryOf(target);
    if (summary) rows.push(summary);
  }

  console.log(
    `\n  ${"domain".padEnd(32)}${"rank".padStart(6)}${"ref domains".padStart(13)}` +
      `${"backlinks".padStart(12)}${"spam".padStart(6)}   first seen`,
  );
  for (const row of rows) {
    console.log(
      `  ${(row.target ?? "?").padEnd(32)}` +
        `${String(row.rank ?? "-").padStart(6)}` +
        `${(row.referring_main_domains ?? row.referring_domains ?? 0).toLocaleString("en-US").padStart(13)}` +
        `${(row.backlinks ?? 0).toLocaleString("en-US").padStart(12)}` +
        `${String(row.backlinks_spam_score ?? "-").padStart(6)}   ` +
        `${(row.first_seen ?? "never").slice(0, 10)}`,
    );
  }

  mkdirSync(OUT, { recursive: true });
  const file = join(OUT, `backlinks-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(file, JSON.stringify({ measured: new Date().toISOString(), rows }, null, 2));
  console.log(`\nraw -> ${file}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
