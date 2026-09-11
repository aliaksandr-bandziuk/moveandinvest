import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, firstResult, reportSpend } from "./client";
import { MARKETS, TARGET, type Market } from "./markets";
import { readArticles } from "../articleTerms.mjs";

// Who actually stands in the results for the queries this site's own articles
// claim to target, and where the site itself stands.
//
//   npm run dfs:competitors
//
// THE SEED LIST IS NOT INVENTED HERE. It is the head terms declared in the
// keyword block of every docs/article-*.md, read through the one parser in
// scripts/articleTerms.mjs. That matters twice over: the list is the site's
// own published commitment rather than a guess made on the day of the
// measurement, and it cannot drift from what scripts/keywords.mjs checks,
// because both read the same file.
//
// ONLY HEAD TERMS, NEVER THE TAIL. A long-tail query has whoever happens to
// be there in its top ten, so competitors computed over a tail list are
// largely noise with a plausible shape.
//
// TWO MEASUREMENTS, AND THE SECOND IS THE HONEST ONE. serp_competitors says
// who is there; ranked_keywords on our own domain says where we are. The
// second is expected to come back close to empty — Search Console shows 558
// impressions and 2 clicks in the three months to 8 September 2026, at an
// average position in the forties — and printing that emptiness next to the
// competitor table is the point. A competitive report that shows only the
// competitors reads as though the gap were a matter of tactics.

const OUT = ".dfs";

// Read off a live response on 11 September 2026 rather than from the docs.
// The first version of this interface guessed `intersections` and
// `full_domain_metrics.organic.pos_1`; neither field exists on this endpoint,
// and because every absent field printed as 0 or "-" the table looked
// plausible and said nothing. The real count of our own seed terms a domain
// stands on is `keywords_count`, and `keywords_positions` carries which ones.
interface CompetitorItem {
  domain?: string;
  avg_position?: number;
  median_position?: number;
  rating?: number;
  etv?: number;
  keywords_count?: number;
  visibility?: number;
  relevant_serp_items?: number;
  keywords_positions?: Record<string, number[]>;
}

interface CompetitorResult {
  seed_keywords?: string[];
  location_code?: number;
  language_code?: string;
  total_count?: number | null;
  items_count?: number;
  items?: CompetitorItem[] | null;
}

// Domains that stand in these results without competing for the enquiry. They
// are not filtered out — YouTube on 77 of 181 head terms is a finding about
// intent, not noise — but a table that lets a reader mistake a government
// portal for a rival is worse than no table.
const PLATFORMS =
  /(^|\.)(youtube|facebook|reddit|quora|wikipedia|instagram|tiktok|linkedin|twitter|x|medium|tripadvisor|numbeo|expatica)\./;
const OFFICIAL = /(^|\.)(gov|gouv|gob)(\.|$)|\.gov\.|\.gov$|europa\.eu$|\.uw\.gov\.pl$/;

function kindOf(domain: string): string {
  if (OFFICIAL.test(domain)) return "official";
  if (PLATFORMS.test(domain)) return "platform";
  return "";
}

interface RankedItem {
  keyword_data?: {
    keyword?: string;
    keyword_info?: { search_volume?: number | null; competition?: number | null };
    keyword_properties?: { keyword_difficulty?: number | null };
  };
  ranked_serp_element?: {
    serp_item?: { rank_group?: number; rank_absolute?: number; url?: string; etv?: number };
  };
}

interface RankedResult {
  target?: string;
  total_count?: number;
  items_count?: number;
  items?: RankedItem[] | null;
}

function headTermsByLanguage(): Map<string, string[]> {
  const { pages, problems } = readArticles();

  // The parser's complaints are FATAL here, not advisory. A file it could not
  // read contributes no seeds, and a seed list short by one article produces a
  // competitor table that looks complete.
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ! ${problem.message}`);
    throw new Error(
      `${problems.length} article(s) yielded no keywords. Fix them, or run ` +
        `"npm run keywords" to see the same list, before measuring anything.`,
    );
  }

  const byLanguage = new Map<string, Set<string>>();
  for (const page of pages) {
    let set = byLanguage.get(page.locale);
    if (!set) byLanguage.set(page.locale, (set = new Set<string>()));
    for (const term of page.head) set.add(term);
  }

  return new Map([...byLanguage].map(([language, set]) => [language, [...set].sort()]));
}

async function competitorsFor(market: Market, keywords: string[]): Promise<CompetitorItem[]> {
  const response = await post<CompetitorResult>(
    "/v3/dataforseo_labs/google/serp_competitors/live",
    [
      {
        keywords,
        location_code: market.locationCode,
        language_code: market.languageCode,
        limit: 50,
      },
    ],
  );
  return firstResult(response).items ?? [];
}

async function rankedFor(market: Market): Promise<RankedResult> {
  const response = await post<RankedResult>(
    "/v3/dataforseo_labs/google/ranked_keywords/live",
    [
      {
        target: TARGET,
        location_code: market.locationCode,
        language_code: market.languageCode,
        limit: 200,
        order_by: ["ranked_serp_element.serp_item.rank_group,asc"],
      },
    ],
  );
  return firstResult(response);
}

async function run(): Promise<void> {
  const seeds = headTermsByLanguage();
  for (const [language, terms] of seeds) {
    console.log(`seeds  ${language}  ${terms.length} head terms`);
  }

  mkdirSync(OUT, { recursive: true });
  const dump: Record<string, unknown> = { measured: new Date().toISOString(), markets: {} };

  for (const market of MARKETS) {
    const keywords = seeds.get(market.languageCode) ?? [];
    if (keywords.length === 0) {
      console.error(`\n${market.key}: no seeds for ${market.languageCode}, skipped`);
      continue;
    }

    console.log(
      `\n=== ${market.key}  ${market.locationName} / ${market.languageCode}` +
        `${market.proxy ? "  (proxy for the audience, not the audience)" : ""} ===`,
    );

    const competitors = await competitorsFor(market, keywords);
    const ranked = await rankedFor(market);

    (dump.markets as Record<string, unknown>)[market.key] = {
      location: market.locationName,
      language: market.languageCode,
      proxy: market.proxy,
      seeds: keywords,
      competitors,
      ranked,
    };

    // total_count comes back null rather than 0 when a domain ranks for
    // nothing, so it is coalesced here — printing "null keywords" reads as a
    // broken call and this particular zero is the most important number in
    // the report.
    console.log(`  us: ${ranked.total_count ?? 0} ranking keywords in this market`);
    for (const item of (ranked.items ?? []).slice(0, 10)) {
      const serp = item.ranked_serp_element?.serp_item;
      console.log(
        `      #${String(serp?.rank_group ?? "?").padStart(3)}  ` +
          `${(item.keyword_data?.keyword ?? "").padEnd(46)}` +
          `vol ${item.keyword_data?.keyword_info?.search_volume ?? "-"}`,
      );
    }

    // How many of OUR seed terms this market's data covers at all. Printing it
    // is what turns an empty competitor table from a mystery into a reading:
    // zero domains over sixty-one seeds means the database has no positions
    // here, not that nobody ranks.
    const covered = new Set<string>();
    for (const item of competitors) {
      for (const keyword of Object.keys(item.keywords_positions ?? {})) covered.add(keyword);
    }
    console.log(
      `  they: ${competitors.length} domains, standing on ${covered.size} of our ` +
        `${keywords.length} head terms`,
    );

    const ranking = [...competitors].sort(
      (a, b) => (b.keywords_count ?? 0) - (a.keywords_count ?? 0),
    );
    for (const item of ranking.slice(0, 15)) {
      const kind = kindOf(item.domain ?? "");
      console.log(
        `      ${(item.domain ?? "?").padEnd(32)}` +
          `${String(item.keywords_count ?? 0).padStart(4)} terms   ` +
          `med pos ${String(item.median_position ?? "-").padStart(4)}   ` +
          `vis ${(item.visibility ?? 0).toFixed(1).padStart(6)}` +
          `${kind ? `   ${kind}` : ""}`,
      );
    }
  }

  const file = join(OUT, `competitors-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(file, JSON.stringify(dump, null, 2));
  console.log(`\nraw -> ${file}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
