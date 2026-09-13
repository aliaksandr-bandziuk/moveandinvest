import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, firstResult, reportSpend } from "./client";

// Where this industry's links actually come from.
//
//   npm run dfs:linksources
//   npm run dfs:linksources -- --limit 500
//   npm run dfs:linksources -- example.com other.com   # a different set
//
// THE QUESTION IS NOT "WHO LINKS TO IMMIGRANTINVEST". One competitor's profile
// is nine thousand domains and most of them are noise a new site could never
// and should never reproduce. The question is which domains link to SEVERAL of
// them, because a site that has linked to four firms in this niche has a
// reason to link to a fifth, and a site that has linked to one may simply have
// been paid.
//
// SO THE INTERSECTION IS COMPUTED HERE RATHER THAN BY THE API. The
// domain_intersection endpoint returns domains linking to ALL of the targets
// given, which for six competitors is a short and unrepresentative list. What
// decides whether a domain is worth approaching is HOW MANY of them it links
// to, and that needs the full referring list per competitor and a join.
//
// QUALITY IS JUDGED, NOT ASSUMED. The first probe's top result was a Peruvian
// university subdomain sending 145 image links from blog sections — a scraper
// artefact with a high rank and no value. Rank alone selects for that. The
// columns that matter are the link TYPE (an anchor is a link, an image
// embedded by a scraper is not) and the spam score.

const OUT = ".dfs";
const DEFAULT_TARGETS = [
  "immigrantinvest.com",
  "getgoldenvisa.com",
  "globalcitizensolutions.com",
  "passportivity.com",
  "imin-portugal.com",
  "us.iasservices.org.uk",
];
const DEFAULT_LIMIT = 1000;

interface ReferringDomain {
  domain?: string;
  rank?: number | null;
  backlinks?: number | null;
  first_seen?: string | null;
  lost_date?: string | null;
  backlinks_spam_score?: number | null;
  referring_links_types?: Record<string, number> | null;
  referring_links_platform_types?: Record<string, number> | null;
  referring_links_attributes?: Record<string, number> | null;
}

interface Row {
  domain: string;
  rank: number;
  spam: number;
  linksTo: string[];
  anchors: number;
  images: number;
  nofollow: number;
  platforms: Set<string>;
  firstSeen: string;
}

async function referringDomains(target: string, limit: number): Promise<ReferringDomain[]> {
  const response = await post<{ items?: ReferringDomain[] | null }>(
    "/v3/backlinks/referring_domains/live",
    [
      // No server-side filter: the endpoint rejected one on lost_date, and
      // lost links are dropped locally instead. They describe a profile's
      // history rather than a place a link could be had today, so counting
      // them would inflate every figure below.
      { target, limit, order_by: ["rank,desc"] },
    ],
  );
  return firstResult(response).items ?? [];
}

function run2(rows: Map<string, Row>): Row[] {
  return [...rows.values()].sort(
    (a, b) => b.linksTo.length - a.linksTo.length || b.rank - a.rank,
  );
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const limitAt = args.indexOf("--limit");
  const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : DEFAULT_LIMIT;
  const targets = args.filter((a) => !a.startsWith("--") && a !== String(limit));
  const set = targets.length > 0 ? targets : DEFAULT_TARGETS;

  const rows = new Map<string, Row>();

  for (const target of set) {
    const items = await referringDomains(target, limit);
    console.log(`${target.padEnd(32)}${String(items.length).padStart(5)} live referring domains read`);
    for (const item of items) {
      const domain = item.domain ?? "";
      if (!domain || domain === target) continue;
      if (item.lost_date) continue;
      const row = rows.get(domain) ?? {
        domain,
        rank: 0,
        spam: 0,
        linksTo: [],
        anchors: 0,
        images: 0,
        nofollow: 0,
        platforms: new Set<string>(),
        firstSeen: "",
      };
      row.rank = Math.max(row.rank, item.rank ?? 0);
      row.spam = Math.max(row.spam, item.backlinks_spam_score ?? 0);
      if (!row.linksTo.includes(target)) row.linksTo.push(target);
      row.anchors += item.referring_links_types?.anchor ?? 0;
      row.images += item.referring_links_types?.image ?? 0;
      row.nofollow += item.referring_links_attributes?.nofollow ?? 0;
      for (const platform of Object.keys(item.referring_links_platform_types ?? {})) {
        row.platforms.add(platform);
      }
      if (!row.firstSeen || (item.first_seen ?? "") < row.firstSeen) {
        row.firstSeen = item.first_seen ?? "";
      }
      rows.set(domain, row);
    }
  }

  const all = run2(rows);
  const shared = all.filter((row) => row.linksTo.length >= 2);
  const worth = shared.filter(
    (row) => row.spam <= 20 && row.anchors > 0 && row.anchors >= row.images,
  );

  console.log(
    `\n${rows.size} distinct referring domains across ${set.length} competitors\n` +
      `  ${shared.length} link to two or more of them\n` +
      `  ${worth.length} of those send real anchor links and score 20 or less for spam`,
  );

  const byCount = new Map<number, number>();
  for (const row of shared) byCount.set(row.linksTo.length, (byCount.get(row.linksTo.length) ?? 0) + 1);
  console.log(`\n  competitors linked   domains`);
  for (const [count, n] of [...byCount].sort((a, b) => b[0] - a[0])) {
    console.log(`  ${String(count).padStart(18)}   ${n}`);
  }

  console.log(`\n  the ones worth a name, by how many of the six they link to:\n`);
  console.log(`  n  rank  spam  platform            domain`);
  for (const row of worth.slice(0, 40)) {
    console.log(
      `  ${row.linksTo.length}  ${String(row.rank).padStart(4)}  ${String(row.spam).padStart(4)}  ` +
        `${[...row.platforms].join(",").slice(0, 18).padEnd(20)}${row.domain}`,
    );
  }

  mkdirSync(OUT, { recursive: true });
  const file = join(OUT, `linksources-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        measured: new Date().toISOString(),
        targets: set,
        rows: all.map((row) => ({ ...row, platforms: [...row.platforms] })),
      },
      null,
      2,
    ),
  );
  console.log(`\nraw -> ${file}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
