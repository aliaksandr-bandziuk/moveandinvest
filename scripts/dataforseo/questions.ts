import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FAQ_ALL } from "../../src/lib/faqData";

// The questions readers actually type, against the questions the site already
// answers.
//
//   npm run dfs:questions                # everything, grouped
//   npm run dfs:questions -- --lang en   # one language
//   npm run dfs:questions -- --new       # only what the FAQ does not cover
//   npm run dfs:questions -- --csv out.csv
//
// COSTS NOTHING AND CALLS NOTHING. Every question here was harvested by
// dfs:serp from the "people also ask" block of a result page already paid for,
// and every answer it is compared against is in src/lib/faqData.ts.
//
// WHY THE COMPARISON MATTERS MORE THAN THE LIST. Four hundred and thirty-two
// questions look like four hundred and thirty-two jobs. The FAQ already holds
// about sixty answers, written against the verification dossiers, and a good
// share of what a result page asks is the same question in a reader's words
// rather than an editor's. Publishing a second answer to a question already
// answered is the exact failure this project has recorded three times: one
// figure, two homes, and a correction that reaches one of them.
//
// ⚠ WHAT THIS SCRIPT DOES NOT DO, AND MUST NOT BE MADE TO DO. It supplies the
// WORDING OF A QUESTION and nothing else. The answer comes from the dossiers,
// carries its section of /sources, and says so when no primary source exists —
// the three rules at the top of faqData.ts. A list of questions is an
// invitation to answer them quickly from memory, and answering 432 questions
// from memory would undo the verification work that is the whole asset.

const OUT = ".dfs";

interface Capture {
  market: string;
  keyword: string;
  volume: number;
  questions: string[];
  failed?: string;
}

interface Harvested {
  question: string;
  language: string;
  markets: Set<string>;
  /** The queries whose result page asked it, and their volume. */
  from: { keyword: string; volume: number }[];
}

// ⚠ ALL THREE LANGUAGES, and the first version had only the first. The
// patterns were written in Latin script alone, so every Russian question fell
// through to "no jurisdiction": 182 of 183. The list looked like a Russian
// harvest about nothing in particular, which is the opposite of the truth.
// A classifier that cannot see two of the three languages it is run on does
// not report a gap, it manufactures one.
const JURISDICTIONS: [string, RegExp][] = [
  ["PT", /portug|lisbon|porto|\bd7\b|\bd8\b|португал|лиссабон|порту\b/i],
  ["GR", /greec|greek|athen|crete|grecj|grecji|греци|афин|крит/i],
  ["MT", /malta|maltese|malcie|malty|мальт/i],
  ["AE", /dubai|uae|emirat|dubaj|\bzea\b|дубай|оаэ|эмират/i],
  ["CY", /cypr|кипр/i],
];

const STOP = new Set([
  "a", "an", "the", "in", "to", "of", "for", "is", "get", "at", "on", "and",
  "as", "from", "your", "you", "what", "how", "can", "do", "does", "it", "i",
  "are", "be", "or", "my", "with", "much", "many", "long", "there",
  "в", "на", "и", "с", "по", "за", "для", "ли", "что", "как", "не", "это",
  "w", "na", "i", "z", "do", "czy", "jak", "co", "nie", "to", "się",
]);

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word.length > 1 && !STOP.has(word)),
  );
}

/**
 * Shared content words over the union of both — not over the shorter one.
 *
 * ⚠ THE FIRST VERSION DIVIDED BY THE SHORTER SET AND SILENTLY DESTROYED
 * DISTINCTIONS. "How do I get my Portuguese citizenship?" reduces to two
 * content words, {portuguese, citizenship}; "Can I claim Portuguese
 * citizenship by descent?" contains both, so the measure returned 1.0 and the
 * second question vanished into the first. Naturalisation and descent are
 * different routes with different answers, and one of them had just been
 * merged out of the work list.
 *
 * Over the union the same pair scores 0.5 and stays apart. The cost is
 * under-merging: two phrasings of one question sometimes both survive. That
 * trade is deliberate — a reviewer reading a list will see a duplicate and
 * delete it, and nobody can see a question that was absorbed.
 */
function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / (a.size + b.size - shared);
}

function run(): void {
  const args = process.argv.slice(2);
  const langAt = args.indexOf("--lang");
  const onlyLanguage = langAt >= 0 ? args[langAt + 1] : null;
  const newOnly = args.includes("--new");
  const jurisAt = args.indexOf("--juris");
  const onlyJuris = jurisAt >= 0 ? (args[jurisAt + 1] ?? "").toUpperCase() : null;
  const csvAt = args.indexOf("--csv");
  const csvPath = csvAt >= 0 ? args[csvAt + 1] : null;

  const harvested = new Map<string, Harvested>();
  let sweeps = 0;

  for (const file of readdirSync(OUT).filter((n) => n.startsWith("serp-") && n.endsWith(".json"))) {
    sweeps += 1;
    const data = JSON.parse(readFileSync(join(OUT, file), "utf8")) as { captures: Capture[] };
    for (const capture of data.captures) {
      if (capture.failed) continue;
      const language = capture.market.split("-")[0] ?? "en";
      for (const question of capture.questions) {
        const key = `${language}|${question.toLowerCase()}`;
        const existing = harvested.get(key);
        if (existing) {
          existing.markets.add(capture.market);
          existing.from.push({ keyword: capture.keyword, volume: capture.volume });
          continue;
        }
        harvested.set(key, {
          question,
          language,
          markets: new Set([capture.market]),
          from: [{ keyword: capture.keyword, volume: capture.volume }],
        });
      }
    }
  }

  // Collapse near-duplicates WITHIN the harvest. A result page asks the same
  // thing in four word orders across four queries, and counting those as four
  // questions inflates the job in exactly the way the volume figures did.
  const clusters: (Harvested & { alsoAsked: string[] })[] = [];
  for (const item of [...harvested.values()].sort((a, b) => a.question.length - b.question.length)) {
    const mine = words(item.question);
    const into = clusters.find(
      (cluster) => cluster.language === item.language && similarity(mine, words(cluster.question)) >= 0.7,
    );
    if (into) {
      into.alsoAsked.push(item.question);
      for (const market of item.markets) into.markets.add(market);
      into.from.push(...item.from);
      continue;
    }
    clusters.push({ ...item, alsoAsked: [] });
  }

  // What the FAQ already answers, per language.
  const answered = FAQ_ALL.map((entry) => ({
    key: entry.key,
    byLanguage: new Map(Object.entries(entry.q).map(([lang, text]) => [lang, words(String(text))])),
  }));

  const rows = clusters
    .map((cluster) => {
      const mine = words(cluster.question);
      let best = "";
      let bestScore = 0;
      for (const entry of answered) {
        const theirs = entry.byLanguage.get(cluster.language);
        if (!theirs) continue;
        const score = similarity(mine, theirs);
        if (score > bestScore) {
          bestScore = score;
          best = entry.key;
        }
      }
      const demand = Math.max(...cluster.from.map((f) => f.volume), 0);
      const juris = JURISDICTIONS.find(([, re]) => re.test(cluster.question))?.[0] ?? "—";
      return { ...cluster, juris, demand, covered: bestScore >= 0.7, nearest: best, score: bestScore };
    })
    .sort((a, b) => b.demand - a.demand || b.alsoAsked.length - a.alsoAsked.length);

  console.log(
    `${sweeps} sweeps · ${harvested.size} questions harvested · ` +
      `${clusters.length} after collapsing near-duplicates · ${FAQ_ALL.length} answers in the FAQ`,
  );

  for (const language of ["en", "ru", "pl"]) {
    if (onlyLanguage && language !== onlyLanguage) continue;
    const mine = rows.filter((row) => row.language === language);
    if (mine.length === 0) continue;
    const covered = mine.filter((row) => row.covered).length;

    console.log(
      `\n=== ${language}: ${mine.length} distinct questions, ${covered} already answered, ` +
        `${mine.length - covered} not ===`,
    );
    for (const row of mine) {
      if (newOnly && row.covered) continue;
      // "—" is a question from the comparison sweep: it names no jurisdiction
      // because it asks about none in particular. Those were measured and set
      // aside, so --juris is how the rest of the list is read without them.
      if (onlyJuris && row.juris !== onlyJuris) continue;
      // The nearest existing answer is printed for EVERY row, not only for the
      // ones over the threshold. "Covered" and "not covered" is a line drawn
      // by a word-overlap measure through questions a person wrote, and the
      // person triaging this list can judge "close to citizenship-years, 0.42"
      // better than any threshold can.
      console.log(
        `  ${row.juris}  ${String(row.demand).padStart(5)}/mo  ` +
          `${row.covered ? "COVERED" : "new    "}  ${row.question}`,
      );
      if (row.nearest) {
        console.log(`        nearest answer: ${row.nearest} (${row.score.toFixed(2)})`);
      }
      if (row.alsoAsked.length > 0) {
        console.log(`        also asked as: ${row.alsoAsked.slice(0, 3).join(" · ")}`);
      }
    }
  }

  if (csvPath) {
    const esc = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const lines = ["language,jurisdiction,demand,covered,nearest,question,also_asked"];
    for (const row of rows) {
      lines.push(
        [
          row.language,
          row.juris,
          String(row.demand),
          row.covered ? "yes" : "no",
          esc(row.nearest),
          esc(row.question),
          esc(row.alsoAsked.join(" | ")),
        ].join(","),
      );
    }
    writeFileSync(csvPath, `﻿${lines.join("\n")}\n`);
    console.log(`\ncsv -> ${csvPath}`);
  }
}

try {
  run();
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
