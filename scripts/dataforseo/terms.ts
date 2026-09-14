import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, firstResult, reportSpend } from "./client";
import { MARKETS, type Market } from "./markets";
import { readArticles } from "../articleTerms.mjs";

// What every head term this site claims to target is actually worth, in every
// market, measured rather than assumed.
//
//   npm run dfs:terms
//
// THE POINT IS THE SECOND COLUMN, NOT THE FIRST. The project's three keyword
// waves were scored on Keyword Planner's "competition", which measures how
// many ADVERTISERS bid on a term. It says nothing about how hard the organic
// top ten is to enter, and the two disagree loudly: a term nobody advertises
// on can be held by a wall of established sites, and a term with heavy bidding
// can have a top ten of forum threads. keyword_difficulty is the organic
// figure, 0 to 100, derived from the link profiles of the pages actually
// standing there. Wherever a plan was made on the first number, it was made on
// the wrong one.
//
// A TERM THAT COMES BACK MISSING IS NOT A TERM WITH ZERO VOLUME. The endpoint
// answers only for keywords in its database; below a threshold it returns
// nothing at all. Both states are reported separately here, because "nobody
// searches this" and "this is too small for the index to carry" lead to
// different decisions and look identical if merged.

const OUT = ".dfs";

interface OverviewItem {
  keyword?: string;
  keyword_info?: {
    search_volume?: number | null;
    competition?: number | null;
    cpc?: number | null;
    low_top_of_page_bid?: number | null;
    high_top_of_page_bid?: number | null;
  };
  keyword_properties?: { keyword_difficulty?: number | null };
  search_intent_info?: { main_intent?: string | null; foreign_intent?: string[] | null };
}

interface OverviewResult {
  items?: OverviewItem[] | null;
  items_count?: number;
}

// keyword_overview takes at most 700 keywords per call. The head-term lists
// are far smaller than that today; the chunking is here so that the day a
// fourth language or the long tail goes through this script, it does not fail
// on a limit nobody remembered.
const CHUNK = 700;

function headTermsByLanguage(): Map<string, string[]> {
  const { pages, problems } = readArticles();
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ! ${problem.message}`);
    throw new Error(`${problems.length} article(s) yielded no keywords; fix them first.`);
  }

  const byLanguage = new Map<string, Set<string>>();
  for (const page of pages) {
    let set = byLanguage.get(page.locale);
    if (!set) byLanguage.set(page.locale, (set = new Set<string>()));
    for (const term of page.head) set.add(term);
  }
  return new Map([...byLanguage].map(([language, set]) => [language, [...set].sort()]));
}

async function overview(market: Market, keywords: string[]): Promise<OverviewItem[]> {
  const items: OverviewItem[] = [];
  for (let at = 0; at < keywords.length; at += CHUNK) {
    const response = await post<OverviewResult>(
      "/v3/dataforseo_labs/google/keyword_overview/live",
      [
        {
          keywords: keywords.slice(at, at + CHUNK),
          location_code: market.locationCode,
          language_code: market.languageCode,
        },
      ],
    );
    for (const item of firstResult(response).items ?? []) items.push(item);
  }
  return items;
}

async function run(): Promise<void> {
  const seeds = headTermsByLanguage();
  mkdirSync(OUT, { recursive: true });
  const dump: Record<string, unknown> = { measured: new Date().toISOString(), markets: {} };

  for (const market of MARKETS.filter((m) => m.labs !== false)) {
    const keywords = seeds.get(market.languageCode) ?? [];
    if (keywords.length === 0) continue;

    const items = await overview(market, keywords);
    const answered = new Set(items.map((item) => item.keyword ?? ""));
    const missing = keywords.filter((keyword) => !answered.has(keyword));
    const scored = items.filter((item) => (item.keyword_info?.search_volume ?? 0) > 0);
    const total = scored.reduce((sum, item) => sum + (item.keyword_info?.search_volume ?? 0), 0);

    (dump.markets as Record<string, unknown>)[market.key] = {
      location: market.locationName,
      language: market.languageCode,
      proxy: market.proxy,
      asked: keywords.length,
      missing,
      items,
    };

    console.log(
      `\n=== ${market.key}  ${market.locationName} / ${market.languageCode}` +
        `${market.proxy ? "  (proxy)" : ""} ===`,
    );
    console.log(
      `  ${keywords.length} head terms asked, ${items.length} in the index, ` +
        `${scored.length} with volume, ${missing.length} not carried at all`,
    );
    console.log(`  ${total.toLocaleString("en-US")} searches a month across the set`);

    const byValue = [...scored].sort(
      (a, b) => (b.keyword_info?.search_volume ?? 0) - (a.keyword_info?.search_volume ?? 0),
    );

    console.log(`  volume   kd   intent        term`);
    for (const item of byValue.slice(0, 20)) {
      const kd = item.keyword_properties?.keyword_difficulty;
      console.log(
        `  ${String(item.keyword_info?.search_volume).padStart(6)}  ` +
          `${String(kd ?? "-").padStart(3)}   ` +
          `${(item.search_intent_info?.main_intent ?? "-").padEnd(14)}` +
          `${item.keyword ?? ""}`,
      );
    }

    // The pairing this whole script exists for: real volume, low organic
    // difficulty. Anything the project can plausibly enter is in here.
    const open = byValue.filter(
      (item) =>
        (item.keyword_info?.search_volume ?? 0) >= 200 &&
        (item.keyword_properties?.keyword_difficulty ?? 100) <= 15,
    );
    if (open.length > 0) {
      console.log(`\n  open: volume 200+ and organic difficulty 15 or under — ${open.length} terms`);
      for (const item of open.slice(0, 25)) {
        console.log(
          `  ${String(item.keyword_info?.search_volume).padStart(6)}  ` +
            `${String(item.keyword_properties?.keyword_difficulty ?? "-").padStart(3)}   ` +
            `${(item.search_intent_info?.main_intent ?? "-").padEnd(14)}` +
            `${item.keyword ?? ""}`,
        );
      }
    }
  }

  const file = join(OUT, `terms-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(file, JSON.stringify(dump, null, 2));
  console.log(`\nraw -> ${file}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
