import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readArticles } from "../articleTerms.mjs";

// Which of the queries worth entering the site already has a page for, and what
// is wrong with that page.
//
//   npm run dfs:coverage                     # every open term, every market
//   npm run dfs:coverage -- --market en-US
//   npm run dfs:coverage -- --juris PT       # one jurisdiction
//   npm run dfs:coverage -- --gaps           # only the queries nothing claims
//
// IT COSTS NOTHING AND CALLS NOTHING. Everything it needs was already paid
// for: the term dump from dfs:terms, the result pages from dfs:serp, the
// crawled pages from dfs:onpage, and the head terms the articles declare. It
// is the join across those four, and it exists because "write fourteen pages"
// and "write three pages and retarget five" are weeks apart and look identical
// until somebody does the join.
//
// THE ANSWER IT GIVES IS A CLAIM, NOT A RANKING. A page that declares a term
// in its keyword block has claimed it; whether it ranks is a separate fact,
// and today the answer is no for all of them. So a claimed term is a page that
// exists and is not winning, which is a different job from a term nothing
// covers at all. Telling those two apart is the whole point.

const OUT = ".dfs";
const MIN_VOLUME = 200;
const MAX_DIFFICULTY = 15;

// Repeated from the analysis that produced the jurisdiction split, and kept
// here rather than in a note, because a classification used to plan work
// should be runnable.
const JURISDICTIONS: [string, RegExp][] = [
  ["PT", /portug|lisbon|porto|\bd7\b|\bd8\b|aima/i],
  ["GR", /greec|greek|athen|crete|thessalonik/i],
  ["MT", /malta|maltese/i],
  ["AE", /dubai|uae|emirat|abu dhabi/i],
  ["CY", /cypr/i],
];

// Execution against exploration, which is not Google's intent label. A named
// programme, permit, law or threshold means the reader has chosen a country
// and is working out how to do it; cost of living and "moving to" are still
// choosing.
const EXECUTION =
  /visa|permit|residenc|citizenship|nationality|passport|golden|naturalis|naturaliz|programme|requirements|apply|application|\btax\b|renew/i;

interface TermItem {
  keyword?: string;
  keyword_info?: { search_volume?: number | null };
  keyword_properties?: { keyword_difficulty?: number | null };
  search_intent_info?: { main_intent?: string | null };
}

interface Capture {
  market: string;
  keyword: string;
  organic: { rank: number; domain: string; url: string; title: string }[];
  aiOverview: { cites: { domain: string }[] } | null;
  failed?: string;
}

interface CrawledPage {
  url?: string;
  status_code?: number;
  meta?: {
    title?: string | null;
    htags?: Record<string, string[]> | null;
    content?: { plain_text_word_count?: number | null } | null;
  } | null;
}

function newest(prefix: string): string | null {
  const files = readdirSync(OUT)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
    .sort();
  return files[files.length - 1] ?? null;
}

function load<T>(file: string): T {
  return JSON.parse(readFileSync(join(OUT, file), "utf8")) as T;
}

const STOP = new Set([
  "a", "an", "the", "in", "to", "of", "for", "is", "get", "at", "on", "and",
  "as", "from", "your", "you", "what", "how", "can", "do", "does", "it",
]);

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word && !STOP.has(word)),
  );
}

/** How much of the query's meaning a candidate covers: every content word of
 *  the query present in the candidate scores 1. Asymmetric on purpose — a long
 *  page title that contains the whole query has covered it, and the extra
 *  words in the title are not a penalty. */
function coverage(query: Set<string>, candidate: Set<string>): number {
  if (query.size === 0) return 0;
  let shared = 0;
  for (const word of query) if (candidate.has(word)) shared += 1;
  return shared / query.size;
}

function run(): void {
  const args = process.argv.slice(2);
  const marketAt = args.indexOf("--market");
  const onlyMarket = marketAt >= 0 ? args[marketAt + 1] : null;
  const jurisAt = args.indexOf("--juris");
  const onlyJuris = jurisAt >= 0 ? (args[jurisAt + 1] ?? "").toUpperCase() : null;
  const gapsOnly = args.includes("--gaps");

  const termsFile = newest("terms-");
  if (!termsFile) throw new Error(`No terms dump in ${OUT}/. Run "npm run dfs:terms".`);
  const terms = load<{ markets: Record<string, { items?: TermItem[] }> }>(termsFile);

  // Every sweep, merged. They were taken on different days for different
  // market sets, and a query measured in any of them is measured.
  const captures = new Map<string, Capture>();
  for (const file of readdirSync(OUT).filter((n) => n.startsWith("serp-") && n.endsWith(".json"))) {
    for (const capture of load<{ captures: Capture[] }>(file).captures) {
      if (capture.failed) continue;
      captures.set(`${capture.market}|${capture.keyword}`, capture);
    }
  }

  const onpageFile = newest("onpage-");
  const pages: CrawledPage[] = onpageFile
    ? load<{ pages: CrawledPage[] }>(onpageFile).pages.filter((p) => p.status_code === 200)
    : [];

  const { pages: articles } = readArticles();

  console.log(
    `terms ${termsFile} · ${captures.size} result pages across every sweep · ` +
      `${pages.length} live pages${onpageFile ? ` from ${onpageFile}` : " (no crawl found)"}`,
  );

  for (const [marketKey, market] of Object.entries(terms.markets)) {
    if (onlyMarket && marketKey !== onlyMarket) continue;
    const language = marketKey.split("-")[0] ?? "";

    const open = (market.items ?? [])
      .filter(
        (item) =>
          (item.keyword_info?.search_volume ?? 0) >= MIN_VOLUME &&
          (item.keyword_properties?.keyword_difficulty ?? 100) <= MAX_DIFFICULTY,
      )
      .sort((a, b) => (b.keyword_info?.search_volume ?? 0) - (a.keyword_info?.search_volume ?? 0));
    if (open.length === 0) continue;

    const rows: string[] = [];
    let gaps = 0;
    let claimed = 0;

    for (const item of open) {
      const keyword = item.keyword ?? "";
      const juris = JURISDICTIONS.find(([, re]) => re.test(keyword))?.[0] ?? "—";
      if (onlyJuris && juris !== onlyJuris) continue;

      const query = words(keyword);

      // Strongest claim first: an article that declares this term, or a
      // declared term that contains all of it.
      let owner = "";
      let how = "";
      for (const article of articles) {
        if (article.locale !== language) continue;
        for (const term of article.head) {
          if (term === keyword) {
            owner = article.key;
            how = "declared";
            break;
          }
          if (!owner && coverage(query, words(term)) === 1) {
            owner = article.key;
            how = "covered by a declared term";
          }
        }
        if (how === "declared") break;
      }

      // Weaker: a live page whose title or first heading carries the query.
      let bestPage = "";
      let bestScore = 0;
      for (const page of pages) {
        const url = page.url ?? "";
        // Locale segment, so an English query is not matched to a Russian page.
        const pageLanguage = /moveandinvest\.com\/(ru|pl)\//.test(url)
          ? url.includes("/ru/") ? "ru" : "pl"
          : "en";
        if (pageLanguage !== language) continue;
        const text = `${page.meta?.title ?? ""} ${(page.meta?.htags?.h1 ?? [])[0] ?? ""}`;
        const score = coverage(query, words(text));
        if (score > bestScore) {
          bestScore = score;
          bestPage = url.replace("https://www.moveandinvest.com", "") || "/";
        }
      }

      const capture = captures.get(`${marketKey}|${keyword}`);
      const first = capture?.organic.find((o) => o.rank === 1);

      const verdict = owner
        ? `page: ${owner} (${how})`
        : bestScore >= 0.8
          ? `page: ${bestPage} (title covers it, ${(bestScore * 100).toFixed(0)}%)`
          : bestScore >= 0.5
            ? `PARTIAL: nearest is ${bestPage} at ${(bestScore * 100).toFixed(0)}%`
            : `GAP: nothing covers it (nearest ${bestPage || "none"} at ${(bestScore * 100).toFixed(0)}%)`;

      if (verdict.startsWith("GAP")) gaps += 1;
      else claimed += 1;
      if (gapsOnly && !verdict.startsWith("GAP")) continue;

      rows.push(
        `  ${String(item.keyword_info?.search_volume).padStart(5)}  ` +
          `kd ${String(item.keyword_properties?.keyword_difficulty ?? "-").padStart(3)}  ` +
          `${juris}  ${(EXECUTION.test(keyword) ? "exec" : "expl").padEnd(4)}  ${keyword}\n` +
          `          ${verdict}\n` +
          `          #1 today: ${first ? `${first.domain} — ${first.title.slice(0, 64)}` : "not swept"}`,
      );
    }

    if (rows.length === 0) continue;
    console.log(`\n=== ${marketKey}: ${claimed} claimed, ${gaps} with nothing covering them ===\n`);
    console.log(rows.join("\n"));
  }
}

try {
  run();
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
