import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { post, allResults, reportSpend } from "./client";

// Google Ads search volume for any country and language pairing, which is the
// one thing Labs cannot give.
//
//   npm run dfs:volume -- scripts/dataforseo/seeds/poland-legalisation.json
//   npm run dfs:volume -- <seeds.json> --expand   # also ask Google for related terms
//
// WHY THIS EXISTS BESIDE dfs:terms. Labs carries Poland with Polish only. The
// readers a Polish legalisation consultancy serves are already in Poland and
// search in Russian and Ukrainian, so a Labs measurement of that market would
// measure the wrong language and report a small number as though it were the
// answer. Google Ads keyword data accepts a language per location, which is
// the pairing this question needs. Measured 14 September 2026: Poland with
// Russian and with Ukrainian both answer.
//
// THE SEED FILE, NOT THE SCRIPT, HOLDS THE QUESTION. Each file names a
// location, its languages, the seeds per language and a topic pattern that
// expansion results must match. A new market is a new file.
//
// ⚠ VOLUMES ARE ROUNDED BUCKETS AND SYNONYMS SHARE THEM. Google reports 10,
// 20, 30, 50, 70, 90, 110, 140, 170, 210, 260, 320... and gives every member of
// a synonym set the same bucket. Summing a column double-counts; the report
// collapses equal-volume rows with overlapping words first, the same rule
// dfs:compare uses, and prints both totals.

const OUT = ".dfs";
const EXPAND_CHUNK = 20; // keywords_for_keywords accepts at most 20 seeds

interface SeedFile {
  location: number;
  languages: Record<string, string[]>;
  topic?: string;
}

interface AdsItem {
  keyword?: string;
  search_volume?: number | null;
  competition?: string | null;
  competition_index?: number | null;
  cpc?: number | null;
  low_top_of_page_bid?: number | null;
  high_top_of_page_bid?: number | null;
}

interface Row {
  keyword: string;
  volume: number;
  cpc: number | null;
  competition: string | null;
  seed: boolean;
}

function words(keyword: string): Set<string> {
  return new Set(keyword.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2));
}

function collapse(rows: Row[]): (Row & { phrasings: number })[] {
  const out: (Row & { phrasings: number })[] = [];
  for (const row of [...rows].sort((a, b) => b.volume - a.volume || a.keyword.length - b.keyword.length)) {
    const mine = words(row.keyword);
    const into = out.find((c) => {
      if (c.volume !== row.volume || row.volume === 0) return false;
      const theirs = words(c.keyword);
      const shared = [...mine].filter((w) => theirs.has(w)).length;
      return shared >= Math.ceil(Math.min(mine.size, theirs.size) * 0.67);
    });
    if (into) {
      into.phrasings += 1;
      continue;
    }
    out.push({ ...row, phrasings: 1 });
  }
  return out;
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) throw new Error("Pass a seed file: npm run dfs:volume -- <seeds.json>");
  const expand = args.includes("--expand");
  const seeds = JSON.parse(readFileSync(file, "utf8")) as SeedFile;
  const topic = seeds.topic ? new RegExp(seeds.topic, "i") : null;

  const dump: Record<string, unknown> = { measured: new Date().toISOString(), file, location: seeds.location };

  for (const [language, list] of Object.entries(seeds.languages)) {
    const rows = new Map<string, Row>();

    const volume = await post<AdsItem>("/v3/keywords_data/google_ads/search_volume/live", [
      { keywords: list, location_code: seeds.location, language_code: language },
    ]);
    for (const item of allResults(volume)) {
      if (!item.keyword) continue;
      rows.set(item.keyword, {
        keyword: item.keyword,
        volume: item.search_volume ?? 0,
        cpc: item.cpc ?? null,
        competition: item.competition ?? null,
        seed: true,
      });
    }

    let offTopic = 0;
    if (expand) {
      for (let at = 0; at < list.length; at += EXPAND_CHUNK) {
        const related = await post<AdsItem>("/v3/keywords_data/google_ads/keywords_for_keywords/live", [
          {
            keywords: list.slice(at, at + EXPAND_CHUNK),
            location_code: seeds.location,
            language_code: language,
            sort_by: "search_volume",
          },
        ]);
        for (const item of allResults(related)) {
          if (!item.keyword || rows.has(item.keyword)) continue;
          // Expansion pulls in whatever Google thinks is adjacent, which for
          // "карта" includes bank cards and maps. The topic pattern in the
          // seed file is what keeps a residence-permit report about residence
          // permits.
          if (topic && !topic.test(item.keyword)) {
            offTopic += 1;
            continue;
          }
          rows.set(item.keyword, {
            keyword: item.keyword,
            volume: item.search_volume ?? 0,
            cpc: item.cpc ?? null,
            competition: item.competition ?? null,
            seed: false,
          });
        }
      }
    }

    const all = [...rows.values()];
    const withVolume = all.filter((r) => r.volume > 0);
    const clusters = collapse(withVolume);
    const raw = withVolume.reduce((s, r) => s + r.volume, 0);
    const real = clusters.reduce((s, r) => s + r.volume, 0);
    const seedsWithVolume = all.filter((r) => r.seed && r.volume > 0).length;
    const cpcRows = clusters.filter((r) => (r.cpc ?? 0) > 0);
    const weightedCpc = cpcRows.length
      ? cpcRows.reduce((s, r) => s + r.volume * (r.cpc ?? 0), 0) / cpcRows.reduce((s, r) => s + r.volume, 0)
      : 0;

    console.log(`\n=== ${language} @ ${seeds.location} ===`);
    console.log(
      `  seeds with volume: ${seedsWithVolume} of ${list.length}` +
        (expand ? `   related terms kept: ${all.length - list.length}, off topic dropped: ${offTopic}` : ""),
    );
    console.log(
      `  ${real.toLocaleString("en-US")} searches a month across ${clusters.length} distinct terms ` +
        `(${raw.toLocaleString("en-US")} if synonyms are summed)`,
    );
    console.log(`  volume-weighted cpc: $${weightedCpc.toFixed(2)}`);
    console.log(`  volume    cpc  comp     term`);
    for (const r of clusters.slice(0, 30)) {
      console.log(
        `  ${String(r.volume).padStart(6)}  ${r.cpc === null ? "    -" : `$${r.cpc.toFixed(2)}`.padStart(5)}  ` +
          `${(r.competition ?? "-").padEnd(7)}  ${r.keyword}${r.seed ? "" : "  +"}${r.phrasings > 1 ? `  (×${r.phrasings})` : ""}`,
      );
    }

    dump[language] = { rows: all, clusters, total: real, summed: raw, weightedCpc };
  }

  mkdirSync(OUT, { recursive: true });
  const out = join(OUT, `volume-${basename(file, ".json")}-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(out, JSON.stringify(dump, null, 2));
  console.log(`\nraw -> ${out}\n  (+ marks a term found by expansion rather than seeded)`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
