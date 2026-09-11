import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, firstResult, reportSpend } from "./client";
import { MARKETS, type Market } from "./markets";

// The live result page for the terms this project could plausibly enter: who
// stands there today, what Google builds on top of them, and whom its AI
// Overview quotes.
//
//   npm run dfs:serp                       # the open English terms
//   npm run dfs:serp -- --market en-US     # one market
//   npm run dfs:serp -- --all              # every head term with volume
//   npm run dfs:serp -- --top 10           # cap the list, for a cheap dry run
//   npm run dfs:serp -- --questions        # reprint the last sweep's questions, free
//
// IT READS ITS QUERY LIST FROM THE LAST dfs:terms RUN, never from a list typed
// here. "Open" means the pairing that run establishes — volume of 200 a month
// or more at an organic difficulty of 15 or less — so the two measurements
// cannot drift apart, and re-running dfs:terms after a rule change changes
// what this looks at without an edit.
//
// ⚠ load_async_ai_overview MUST STAY TRUE. Without it the response still
// carries an ai_overview item, still reports its position, and carries NO
// markdown and NO references — measured on "cost of living in portugal",
// 11 September 2026: absent the flag, 0 references; present, 9 references and
// 4 163 characters. A sweep run without it would have concluded that Google's
// AI Overview cites nobody, from data that looked complete.
//
// DEPTH IS 10 ON PURPOSE. A result page is billed per page of depth, and
// nothing this report asks is answered by positions 11 to 20.

const OUT = ".dfs";
const ENDPOINT = "/v3/serp/google/organic/live/advanced";
const CONCURRENCY = 4;

// Volume and difficulty thresholds, kept here because dfs:terms prints the
// same pair and the two must agree. Neither number is sacred; both are a
// judgement about what this site can enter in its first year.
const MIN_VOLUME = 200;
const MAX_DIFFICULTY = 15;

interface SerpItem {
  type?: string;
  rank_group?: number;
  rank_absolute?: number;
  domain?: string;
  url?: string;
  title?: string;
  asynchronous_ai_overview?: boolean;
  markdown?: string | null;
  references?: { domain?: string; url?: string; title?: string }[] | null;
  items?: { title?: string; seed_question?: string | null }[] | null;
}

interface SerpResult {
  keyword?: string;
  location_code?: number;
  language_code?: string;
  item_types?: string[];
  se_results_count?: number;
  items?: SerpItem[] | null;
}

interface Query {
  market: Market;
  keyword: string;
  volume: number;
  difficulty: number | null;
}

interface Capture {
  market: string;
  keyword: string;
  volume: number;
  difficulty: number | null;
  itemTypes: string[];
  organic: { rank: number; domain: string; url: string; title: string }[];
  aiOverview: { position: number | null; cites: { domain: string; url: string; title: string }[] } | null;
  questions: string[];
}

/** The newest dfs:terms dump. Its date is printed, because a SERP sweep read
 *  against a stale term list silently measures last month's plan. */
function latestTerms(): { file: string; data: Record<string, unknown> } {
  const files = readdirSync(OUT)
    .filter((name) => /^terms-\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();
  const file = files[files.length - 1];
  if (!file) {
    throw new Error(`No terms dump in ${OUT}/. Run "npm run dfs:terms" first.`);
  }
  return { file, data: JSON.parse(readFileSync(join(OUT, file), "utf8")) as Record<string, unknown> };
}

interface TermItem {
  keyword?: string;
  keyword_info?: { search_volume?: number | null };
  keyword_properties?: { keyword_difficulty?: number | null };
}

function queriesFrom(
  data: Record<string, unknown>,
  wanted: Market[],
  all: boolean,
  top: number | null,
): Query[] {
  const markets = (data.markets ?? {}) as Record<string, { items?: TermItem[] }>;
  const out: Query[] = [];

  for (const market of wanted) {
    const items = markets[market.key]?.items ?? [];
    const picked = items
      .filter((item) => {
        const volume = item.keyword_info?.search_volume ?? 0;
        if (volume < (all ? 1 : MIN_VOLUME)) return false;
        if (all) return true;
        return (item.keyword_properties?.keyword_difficulty ?? 100) <= MAX_DIFFICULTY;
      })
      .sort(
        (a, b) => (b.keyword_info?.search_volume ?? 0) - (a.keyword_info?.search_volume ?? 0),
      );

    for (const item of top ? picked.slice(0, top) : picked) {
      if (!item.keyword) continue;
      out.push({
        market,
        keyword: item.keyword,
        volume: item.keyword_info?.search_volume ?? 0,
        difficulty: item.keyword_properties?.keyword_difficulty ?? null,
      });
    }
  }
  return out;
}

async function capture(query: Query): Promise<Capture> {
  const response = await post<SerpResult>(ENDPOINT, [
    {
      keyword: query.keyword,
      location_code: query.market.locationCode,
      language_code: query.market.languageCode,
      device: "desktop",
      depth: 10,
      load_async_ai_overview: true,
    },
  ]);
  const result = firstResult(response);
  const items = result.items ?? [];

  const overview = items.find((item) => item.type === "ai_overview");
  const paa = items.find((item) => item.type === "people_also_ask");

  return {
    market: query.market.key,
    keyword: query.keyword,
    volume: query.volume,
    difficulty: query.difficulty,
    itemTypes: result.item_types ?? [],
    organic: items
      .filter((item) => item.type === "organic")
      .map((item) => ({
        rank: item.rank_group ?? 0,
        domain: item.domain ?? "",
        url: item.url ?? "",
        title: item.title ?? "",
      })),
    aiOverview: overview
      ? {
          position: overview.rank_group ?? null,
          cites: (overview.references ?? []).map((ref) => ({
            domain: ref.domain ?? "",
            url: ref.url ?? "",
            title: ref.title ?? "",
          })),
        }
      : null,
    questions: (paa?.items ?? []).map((q) => q.title ?? "").filter(Boolean),
  };
}

/** A small pool. Live SERP calls take seconds each, and seventy of them in
 *  sequence is a ten-minute wait for a report that costs twenty cents. */
async function pool<T, R>(items: T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array<R>(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const at = next++;
      const item = items[at];
      if (item === undefined) return;
      out[at] = await work(item);
      process.stdout.write(`\r  ${at + 1}/${items.length} captured`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
  process.stdout.write("\n");
  return out;
}

function tally<T>(rows: T[], key: (row: T) => string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const value of key(row)) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return new Map([...counts].sort((a, b) => b[1] - a[1]));
}

/** Reprints the questions from the last sweep, grouped by the query that
 *  produced them. They are the reason the sweep is worth keeping: FAQPage
 *  markup is already on the jurisdiction pages, and what it has never had is
 *  questions in the words readers actually use. Answers still come from the
 *  dossiers — this supplies the wording of the question and nothing else. */
function printQuestions(): void {
  const files = readdirSync(OUT)
    .filter((name) => /^serp-\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();
  const file = files[files.length - 1];
  if (!file) throw new Error(`No sweep in ${OUT}/. Run "npm run dfs:serp" first.`);

  const data = JSON.parse(readFileSync(join(OUT, file), "utf8")) as { captures: Capture[] };
  const seen = new Set<string>();
  console.log(`questions from ${file}\n`);

  for (const capture of data.captures) {
    const fresh = capture.questions.filter((q) => !seen.has(q));
    for (const question of fresh) seen.add(question);
    if (fresh.length === 0) continue;
    console.log(`${capture.market}  ${capture.keyword}  (${capture.volume}/mo)`);
    for (const question of fresh) console.log(`    ${question}`);
  }
  console.log(`\n${seen.size} distinct questions`);
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--questions")) {
    printQuestions();
    return;
  }
  const all = args.includes("--all");
  const topAt = args.indexOf("--top");
  const top = topAt >= 0 ? Number(args[topAt + 1]) : null;
  const marketAt = args.indexOf("--market");
  const marketKey = marketAt >= 0 ? args[marketAt + 1] : null;

  // English only by default, and that is a conclusion rather than a
  // convenience: the 11 September sweep found no Labs position data for
  // Russian in either proxy market and two covered terms out of 35 in Polish,
  // so an "open term" does not exist to look up there.
  const wanted = MARKETS.filter(
    (market) => (marketKey ? market.key === marketKey : market.languageCode === "en"),
  );
  if (wanted.length === 0) throw new Error(`No market matches "${marketKey ?? ""}"`);

  const { file, data } = latestTerms();
  const queries = queriesFrom(data, wanted, all, top);
  console.log(`terms from ${file}`);
  console.log(
    `${queries.length} queries across ${wanted.map((m) => m.key).join(", ")}` +
      `${all ? " (every term with volume)" : ` (volume ${MIN_VOLUME}+, difficulty ${MAX_DIFFICULTY} or under)`}`,
  );
  if (queries.length === 0) return;

  const captures = await pool(queries, CONCURRENCY, capture);

  mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  writeFileSync(
    join(OUT, `serp-${stamp}.json`),
    JSON.stringify({ measured: new Date().toISOString(), terms: file, captures }, null, 2),
  );

  for (const market of wanted) {
    const rows = captures.filter((row) => row.market === market.key);
    if (rows.length === 0) continue;

    console.log(`\n=== ${market.key}  ${rows.length} result pages ===`);

    const features = tally(rows, (row) => row.itemTypes);
    console.log(`  features, of ${rows.length} pages:`);
    for (const [type, count] of features) {
      console.log(`    ${type.padEnd(24)}${String(count).padStart(4)}`);
    }

    const withOverview = rows.filter((row) => (row.aiOverview?.cites.length ?? 0) > 0);
    console.log(
      `\n  AI Overview with sources on ${withOverview.length} of ${rows.length} pages`,
    );
    const cited = tally(withOverview, (row) =>
      [...new Set((row.aiOverview?.cites ?? []).map((c) => c.domain))],
    );
    for (const [domain, count] of [...cited].slice(0, 15)) {
      console.log(`    ${domain.padEnd(34)}${String(count).padStart(4)} pages`);
    }

    const topThree = tally(rows, (row) =>
      [...new Set(row.organic.filter((o) => o.rank <= 3).map((o) => o.domain))],
    );
    console.log(`\n  holding a top-3 organic place:`);
    for (const [domain, count] of [...topThree].slice(0, 15)) {
      console.log(`    ${domain.padEnd(34)}${String(count).padStart(4)} pages`);
    }

    const questions = new Set(rows.flatMap((row) => row.questions));
    console.log(`\n  ${questions.size} distinct "people also ask" questions harvested`);
  }

  console.log(`\nraw -> ${join(OUT, `serp-${stamp}.json`)}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
