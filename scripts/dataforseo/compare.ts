import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, firstResult, reportSpend } from "./client";
import { MARKETS, type Market } from "./markets";

// Does the comparison layer exist as a market, or only in our heads?
//
//   npm run dfs:compare              # the whole stem list, every market
//   npm run dfs:compare -- --market en-US
//   npm run dfs:compare -- --min 100 # raise the volume floor
//
// WHY THIS IS A SEPARATE QUESTION FROM dfs:terms. That script scores the head
// terms the articles declare, and the articles are organised one country at a
// time: what a permit costs in Portugal, what it costs in Greece. Nothing in
// the seed list asks which of them a reader should choose. So the whole
// comparison layer is invisible to every measurement taken so far, and its
// absence from the reports says nothing about whether anyone searches for it.
//
// IT MATTERS BECAUSE IT IS THE ONE THING A PARTNER CANNOT PUBLISH. A law firm
// in Lisbon cannot write that Greece would suit this reader better; a site
// that takes no commission on a transaction and lists one partner per
// jurisdiction can. Wherever this layer has volume, it is defensible in a way
// a country guide never is, because the competitor who would out-write us is
// disqualified by his own business from saying the true thing.
//
// keyword_suggestions RATHER THAN keyword_ideas, and the difference decides
// the answer. Ideas returns keywords from the same CATEGORY, which for this
// subject means more country guides. Suggestions returns keywords that
// literally CONTAIN the stem, so "cheapest golden visa" returns the phrasings
// people actually type around that comparison and nothing else.
//
// THE VOLUME FLOOR IS APPLIED BY THE API, not here, because results are
// charged for one by one. Asking for everything and discarding it locally
// would cost several dollars to learn the same thing.

const OUT = ".dfs";
const ENDPOINT = "/v3/dataforseo_labs/google/keyword_suggestions/live";
const LIMIT = 200;

// ⚠ THE FLOOR IS PER LANGUAGE, AND THE FIRST RUN GOT THIS WRONG. A single
// floor of 50 searches a month was applied to all three, and every Russian
// stem came back empty — which read as "the comparison layer does not exist in
// Russian" and was in fact the floor being set above the market. The largest
// Russian head term this project targets measures 50 a month through Ukraine.
// A threshold has to be scaled to the market it is applied to or it does not
// measure the market, it measures the threshold.
const FLOOR: Record<string, number> = { en: 200, ru: 10, pl: 20 };

// The subject, for discarding what a broad stem drags in. "which country"
// returned two hundred keywords of which the largest were "georgia in which
// country" and "code 44 which country" — geography quizzes and telephone
// prefixes, at 165 000 a month, which would have put a third of a million
// searches into a report about residency. The stem is gone; the filter stays,
// because the next broad stem will do the same thing.
const TOPIC =
  /visa|residenc|citizenship|permit|passport|nationality|relocat|moving to|move to|expat|golden|non.?dom|tax resid|внж|пмж|гражданств|резидент|переезд|виза|obywatelstwo|pobyt|rezydenc|wiza|przeprowadzk/i;

// The stems, per language. Each one is a way of asking "which of these should
// I pick", and they are deliberately not about any one country: a stem naming
// Portugal would return the country guide layer we already have.
//
// Russian and Polish are here at a fraction of the English count on purpose.
// Labs position data for Russian is thin to the point of uselessness, and the
// Polish market measured 1 670 searches a month across every head term the
// site declares. What these few stems answer is whether the comparison layer
// exists there AT ALL, not how it is shaped.
const STEMS: Record<string, string[]> = {
  en: [
    "cheapest golden visa",
    "best golden visa",
    "golden visa comparison",
    "golden visa vs",
    "easiest citizenship",
    "cheapest citizenship by investment",
    "best country for residency",
    "best country to move to",
    "fastest citizenship by investment",
    "residency by investment comparison",
    "compare residency",
    "which country citizenship",
    "best country for expats",
  ],
  ru: [
    "самое дешевое внж",
    "сравнение внж",
    "где дешевле внж",
    "лучшая золотая виза",
    "в какой стране проще получить гражданство",
    "куда переехать",
  ],
  pl: [
    "najtańsza złota wiza",
    "najlepsza złota wiza",
    "porównanie rezydencji",
    "gdzie najłatwiej o obywatelstwo",
    "gdzie się przeprowadzić",
  ],
};

interface SuggestionItem {
  keyword?: string;
  keyword_info?: {
    search_volume?: number | null;
    competition?: number | null;
    cpc?: number | null;
  };
  keyword_properties?: { keyword_difficulty?: number | null };
  search_intent_info?: { main_intent?: string | null };
}

interface SuggestionResult {
  items?: SuggestionItem[] | null;
  items_count?: number;
  total_count?: number | null;
}

interface Row {
  market: string;
  keyword: string;
  volume: number;
  difficulty: number | null;
  intent: string;
  stems: string[];
}

async function suggestionsFor(
  market: Market,
  stem: string,
  minVolume: number,
): Promise<SuggestionItem[]> {
  try {
    const response = await post<SuggestionResult>(ENDPOINT, [
      {
        keyword: stem,
        location_code: market.locationCode,
        language_code: market.languageCode,
        include_seed_keyword: true,
        limit: LIMIT,
        filters: [["keyword_info.search_volume", ">=", minVolume]],
        order_by: ["keyword_info.search_volume,desc"],
      },
    ]);
    return firstResult(response).items ?? [];
  } catch (error) {
    // A stem with nothing above the floor answers as a failed task rather than
    // as an empty list, and that is a RESULT, not an outage: it means nobody
    // asks the question in this market. Distinguishing the two would need a
    // second call, and the aggregate below already shows which stems returned.
    console.error(`  · ${market.key} "${stem}": ${error instanceof Error ? error.message : error}`);
    return [];
  }
}

interface Cluster extends Row {
  /** How many ways of writing the same question fell into this cluster. */
  phrasings: number;
}

/**
 * ⚠ THESE VOLUMES MAY NOT BE ADDED UP AS THEY COME.
 *
 * Google reports a synonym set at one figure per member. "Easiest country to
 * get citizenship" came back fourteen times at 5 400 a month each, in fourteen
 * word orders. Summing them turns one question worth 5 400 into a market worth
 * 75 600, and the first run of this script duly reported three and a half
 * million searches for a subject that has perhaps eighty thousand.
 *
 * The project's own earlier keyword work collapsed synonyms on the pair
 * (volume, competition). The same idea here: equal volume plus an overlapping
 * word set is one question, and the shortest phrasing represents it, because
 * the shortest is usually the one a person would type.
 */
function collapse(rows: Row[]): Cluster[] {
  const STOP = new Set(["a", "an", "the", "in", "to", "of", "for", "is", "get", "at", "on", "and"]);
  const words = (keyword: string): Set<string> =>
    new Set(
      keyword
        .split(/[^\p{L}\p{N}]+/u)
        .filter((word) => word && !STOP.has(word)),
    );

  const out: Cluster[] = [];
  for (const row of [...rows].sort((a, b) => b.volume - a.volume || a.keyword.length - b.keyword.length)) {
    const mine = words(row.keyword);
    const into = out.find((cluster) => {
      if (cluster.volume !== row.volume) return false;
      const theirs = words(cluster.keyword);
      const shared = [...mine].filter((word) => theirs.has(word)).length;
      // Two thirds of the smaller set in common. Lower and "easiest country to
      // get citizenship" swallows "easiest country to get a driving licence";
      // higher and three word orders of one question count as three.
      return shared >= Math.ceil(Math.min(mine.size, theirs.size) * 0.67);
    });
    if (into) {
      into.phrasings += 1;
      if (row.keyword.length < into.keyword.length) into.keyword = row.keyword;
      continue;
    }
    out.push({ ...row, phrasings: 1 });
  }
  return out.sort((a, b) => b.volume - a.volume);
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const marketAt = args.indexOf("--market");
  const marketKey = marketAt >= 0 ? args[marketAt + 1] : null;
  const minAt = args.indexOf("--min");
  const override = minAt >= 0 ? Number(args[minAt + 1]) : null;

  // One market per language for discovery. The comparison layer is a property
  // of a LANGUAGE — the same question asked in the same words — and running
  // both English markets would double the cost to learn the same shape. Where
  // a term matters, dfs:serp checks it in every market that counts.
  const wanted = marketKey
    ? MARKETS.filter((market) => market.key === marketKey)
    : [
        MARKETS.find((m) => m.key === "en-US"),
        MARKETS.find((m) => m.key === "ru-UA"),
        MARKETS.find((m) => m.key === "pl-PL"),
      ].filter((m): m is Market => m !== undefined);

  const byKeyword = new Map<string, Row>();

  for (const market of wanted) {
    const stems = STEMS[market.languageCode] ?? [];
    const minVolume = override ?? FLOOR[market.languageCode] ?? 50;
    console.log(`\n=== ${market.key}: ${stems.length} stems, volume ${minVolume}+ ===`);

    for (const stem of stems) {
      const items = await suggestionsFor(market, stem, minVolume);
      let added = 0;
      let offTopic = 0;
      for (const item of items) {
        const keyword = item.keyword;
        if (!keyword) continue;
        if (!TOPIC.test(keyword)) {
          offTopic += 1;
          continue;
        }
        const key = `${market.key}|${keyword}`;
        const existing = byKeyword.get(key);
        if (existing) {
          if (!existing.stems.includes(stem)) existing.stems.push(stem);
          continue;
        }
        byKeyword.set(key, {
          market: market.key,
          keyword,
          volume: item.keyword_info?.search_volume ?? 0,
          difficulty: item.keyword_properties?.keyword_difficulty ?? null,
          intent: item.search_intent_info?.main_intent ?? "-",
          stems: [stem],
        });
        added += 1;
      }
      console.log(
        `  ${stem.padEnd(42)}${String(items.length).padStart(4)} returned, ${added} new` +
          `${offTopic > 0 ? `, ${offTopic} off topic` : ""}`,
      );
    }
  }

  const rows = [...byKeyword.values()].sort((a, b) => b.volume - a.volume);

  for (const market of wanted) {
    const mine = rows.filter((row) => row.market === market.key);
    if (mine.length === 0) {
      console.log(
        `\n${market.key}: nothing on topic above ${FLOOR[market.languageCode] ?? "?"} a month.`,
      );
      continue;
    }

    const clusters = collapse(mine);
    const raw = mine.reduce((sum, row) => sum + row.volume, 0);
    const real = clusters.reduce((sum, cluster) => sum + cluster.volume, 0);
    const open = clusters.filter((cluster) => (cluster.difficulty ?? 100) <= 15);

    console.log(
      `\n=== ${market.key}: ${mine.length} phrasings, ${clusters.length} distinct questions ===`,
    );
    console.log(
      `  ${real.toLocaleString("en-US")} searches a month once synonyms are collapsed ` +
        `(${raw.toLocaleString("en-US")} if each phrasing is counted separately)`,
    );
    console.log(`  ${open.length} questions at difficulty 15 or under`);
    console.log(`\n  volume   kd   as   intent         question`);
    for (const cluster of clusters.slice(0, 20)) {
      console.log(
        `  ${String(cluster.volume).padStart(6)}  ${String(cluster.difficulty ?? "-").padStart(3)}  ` +
          `${String(cluster.phrasings).padStart(3)}   ${cluster.intent.padEnd(15)}${cluster.keyword}`,
      );
    }
  }

  mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  writeFileSync(
    join(OUT, `compare-${stamp}.json`),
    JSON.stringify({ measured: new Date().toISOString(), floor: FLOOR, rows }, null, 2),
  );

  // A plain list for dfs:serp, so the result pages of the best of these are
  // read by exactly the same capture as every other sweep.
  const shortlist = rows
    .filter((row) => row.volume >= 200 && (row.difficulty ?? 100) <= 30)
    .slice(0, 40)
    .map((row) => ({ market: row.market, keyword: row.keyword, volume: row.volume, difficulty: row.difficulty }));
  const listFile = join(OUT, `compare-queries-${stamp}.json`);
  writeFileSync(listFile, JSON.stringify(shortlist, null, 2));

  console.log(`\nraw -> ${join(OUT, `compare-${stamp}.json`)}`);
  console.log(`${shortlist.length} shortlisted -> ${listFile}`);
  console.log(`read their result pages with:  npm run dfs:serp -- --from-list ${listFile}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
