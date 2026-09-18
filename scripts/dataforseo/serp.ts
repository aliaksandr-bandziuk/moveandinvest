import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { post, firstResult, reportSpend } from "./client";
import { MARKETS, type Market } from "./markets";
import { readArticles } from "../articleTerms.mjs";

// The live result page for the terms this project could plausibly enter: who
// stands there today, what Google builds on top of them, and whom its AI
// Overview quotes.
//
//   npm run dfs:serp                       # the open English terms
//   npm run dfs:serp -- --market en-US     # one market
//   npm run dfs:serp -- --all              # every head term with volume
//   npm run dfs:serp -- --top 10           # cap the list, for a cheap dry run
//   npm run dfs:serp -- --questions        # reprint the last sweep's questions, free
//   npm run dfs:serp -- --seeds --market pl-PL   # every head term, ignoring the term dump
//
// --seeds EXISTS FOR RUSSIAN AND POLISH, and the reason is a real limit rather
// than a preference. The default list comes from dfs:terms, which asks Labs
// what a term is worth — and Labs carries volume for 5 of 61 Russian head
// terms through Kazakhstan and 32 through Ukraine. Selecting by a figure that
// mostly does not exist would drop the whole market. The SERP API answers for
// any keyword regardless, so for those two languages the list is the head
// terms themselves and the volumes are simply absent from the report.
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
  /** The engine's own message when it would not answer, after three tries. */
  failed?: string;
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

/** Every head term the articles declare, for one language. Volume and
 *  difficulty come back null: nothing has been asked about them, and printing
 *  a zero would say something this list does not know. */
function queriesFromSeeds(wanted: Market[]): Query[] {
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

  const out: Query[] = [];
  for (const market of wanted) {
    for (const keyword of [...(byLanguage.get(market.languageCode) ?? [])].sort()) {
      out.push({ market, keyword, volume: 0, difficulty: null });
    }
  }
  return out;
}

/**
 * ONE QUERY MAY NOT SINK A SWEEP. The search engine answers 40101 "Internal SE
 * Server Error" now and then — transient, unrelated to the keyword, and it
 * killed a whole run on its second query the first time it happened. A sweep
 * of a hundred and fifty pages that aborts on any one of them is not a
 * measurement instrument.
 *
 * So: three attempts, then the query is recorded as FAILED and the sweep goes
 * on. A failed capture carries no organic rows, which is why `failed` is a
 * field rather than an empty result — "the engine would not answer" and
 * "nothing ranks here" are different facts, and a report that merges them
 * would quietly under-count every domain.
 */
const ATTEMPTS = 3;

async function capture(query: Query): Promise<Capture> {
  let result: SerpResult | null = null;
  let lastError = "";

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
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
      result = firstResult(response);
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }

  if (!result) {
    return {
      market: query.market.key,
      keyword: query.keyword,
      volume: query.volume,
      difficulty: query.difficulty,
      itemTypes: [],
      organic: [],
      aiOverview: null,
      questions: [],
      failed: lastError,
    };
  }

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
  const args = process.argv.slice(2);
  const at = args.indexOf("--from");
  const files = readdirSync(OUT)
    .filter((name) => /^serp-\d{4}-\d{2}-\d{2}/.test(name) && name.endsWith(".json"))
    .filter((name) => (at >= 0 ? name.includes(args[at + 1] ?? "") : true))
    .sort();
  const file = files[files.length - 1];
  if (!file) {
    throw new Error(
      `No sweep in ${OUT}/ matching that. Run "npm run dfs:serp" first, or name one with --from.`,
    );
  }

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

/**
 * When one language is measured through two countries, the only question that
 * matters is whether they are showing the same internet.
 *
 * Russia is in none of DataForSEO's directories, so Russian can only be read
 * through Kazakhstan and Ukraine, and neither is the audience. If their top
 * tens largely agree, the reading is probably about the Russian-language web
 * rather than about one country's; if they diverge, each is local and neither
 * stands for anything beyond itself. Overlap is counted over DOMAINS rather
 * than positions — the order differs between any two result pages, and it is
 * the cast that carries the argument.
 */
function compareProxies(captures: Capture[], markets: Market[]): void {
  const byLanguage = new Map<string, Market[]>();
  for (const market of markets) {
    byLanguage.set(market.languageCode, [...(byLanguage.get(market.languageCode) ?? []), market]);
  }

  for (const [language, pair] of byLanguage) {
    const [a, b] = pair;
    if (!a || !b || pair.length !== 2) continue;

    const left = new Map(captures.filter((c) => c.market === a.key).map((c) => [c.keyword, c]));
    const right = new Map(captures.filter((c) => c.market === b.key).map((c) => [c.keyword, c]));

    const scores: [string, number, number][] = [];
    for (const [keyword, one] of left) {
      const two = right.get(keyword);
      if (!two) continue;
      const setA = new Set(one.organic.map((o) => o.domain).filter(Boolean));
      const setB = new Set(two.organic.map((o) => o.domain).filter(Boolean));
      if (setA.size === 0 && setB.size === 0) continue;
      const shared = [...setA].filter((d) => setB.has(d)).length;
      const union = new Set([...setA, ...setB]).size;
      scores.push([keyword, union === 0 ? 0 : shared / union, shared]);
    }
    if (scores.length === 0) continue;

    const mean = scores.reduce((sum, [, score]) => sum + score, 0) / scores.length;
    scores.sort((x, y) => y[1] - x[1]);

    console.log(`\n=== ${language}: ${a.key} against ${b.key}, over ${scores.length} queries ===`);
    console.log(`  mean overlap of the top ten, by domain: ${(mean * 100).toFixed(0)}%`);
    console.log(`  queries where the two agree completely: ${scores.filter(([, s]) => s === 1).length}`);
    console.log(`  queries with no domain in common:       ${scores.filter(([, s]) => s === 0).length}`);
    console.log(`  most alike`);
    for (const [keyword, score, shared] of scores.slice(0, 5)) {
      console.log(`    ${(score * 100).toFixed(0).padStart(3)}%  ${String(shared).padStart(2)} shared  ${keyword}`);
    }
    console.log(`  least alike`);
    for (const [keyword, score, shared] of scores.slice(-5)) {
      console.log(`    ${(score * 100).toFixed(0).padStart(3)}%  ${String(shared).padStart(2)} shared  ${keyword}`);
    }
  }
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
  const langAt = args.indexOf("--lang");
  const lang = langAt >= 0 ? args[langAt + 1] : null;

  // English only by default, and that is a conclusion rather than a
  // convenience: the 11 September sweep found no Labs position data for
  // Russian in either proxy market and two covered terms out of 35 in Polish,
  // so an "open term" does not exist to look up there.
  const wanted = MARKETS.filter((market) =>
    marketKey
      ? market.key === marketKey
      : market.languageCode === (lang ?? "en") && !market.onDemand,
  );
  if (wanted.length === 0) throw new Error(`No market matches "${marketKey ?? lang ?? ""}"`);

  const listAt = args.indexOf("--from-list");
  const listPath = listAt >= 0 ? args[listAt + 1] : null;
  const fromSeeds = args.includes("--seeds");
  let queries: Query[];
  if (listPath) {
    // A list written by another script — dfs:compare produces one. The capture
    // logic, the retry policy and the AI Overview flag all live here and are
    // not worth a second copy somewhere else: a sweep that measured the same
    // pages by slightly different rules would be uncomparable with this one
    // and would not look it.
    const rows = JSON.parse(readFileSync(listPath, "utf8")) as {
      market: string;
      keyword: string;
      volume?: number;
      difficulty?: number | null;
    }[];
    queries = rows.flatMap((row) => {
      const market = MARKETS.find((m) => m.key === row.market);
      if (!market) {
        console.error(`  ! ${row.keyword}: no market "${row.market}", skipped`);
        return [];
      }
      return [{ market, keyword: row.keyword, volume: row.volume ?? 0, difficulty: row.difficulty ?? null }];
    });
    if (top) queries = queries.slice(0, top);
    console.log(`terms from ${listPath}`);
  } else if (fromSeeds) {
    queries = queriesFromSeeds(wanted);
    if (top) queries = queries.slice(0, top);
    console.log(`terms from the article keyword blocks (no volume asked)`);
  } else {
    const { file, data } = latestTerms();
    queries = queriesFrom(data, wanted, all, top);
    console.log(`terms from ${file}`);
  }
  const used = listPath
    ? [...new Set(queries.map((q) => q.market))]
    : wanted;
  console.log(
    `${queries.length} queries across ${used.map((m) => m.key).join(", ")}` +
      `${listPath ? "" : fromSeeds ? " (every declared head term)" : all ? " (every term with volume)" : ` (volume ${MIN_VOLUME}+, difficulty ${MAX_DIFFICULTY} or under)`}`,
  );
  if (queries.length === 0) return;

  const captures = await pool(queries, CONCURRENCY, capture);

  mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  // The market keys are in the filename because a run over Polish must not
  // overwrite the English sweep of the same day, and the questions reader
  // picks the newest file by name.
  const name = `serp-${stamp}-${(listPath ? basename(listPath, ".json") : "") || used.map((m) => m.key).join("+")}.json`;
  writeFileSync(
    join(OUT, name),
    JSON.stringify({ measured: new Date().toISOString(), captures }, null, 2),
  );

  const failed = captures.filter((row) => row.failed);
  if (failed.length > 0) {
    console.log(`\n  ${failed.length} queries the engine would not answer after ${ATTEMPTS} tries:`);
    for (const row of failed.slice(0, 10)) {
      console.log(`    ${row.market}  ${row.keyword}  — ${row.failed}`);
    }
  }

  for (const market of used) {
    const rows = captures.filter((row) => row.market === market.key && !row.failed);
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

  compareProxies(captures, used);

  console.log(`\nraw -> ${join(OUT, name)}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
