import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { post, get, firstResult, reportSpend } from "./client";

// A crawl of the live site, by something that is not us.
//
//   npm run dfs:onpage                 # crawl and report
//   npm run dfs:onpage -- --id <id>    # re-pull the reports of a finished crawl, free
//   npm run dfs:onpage -- --pages 500  # raise the page cap
//
// WHAT THIS ADDS TO scripts/canonicals.ts, WHICH ALREADY EXISTS. That script
// checks canonicals, hreflang and og:url by calling the app's own helpers, and
// says so in its own header: the jurisdiction, property and guide pages take
// their slugs from Sanity, so what it exercises for them is the SHAPE of the
// output and not the live set. This crawls the pages as served, with the real
// slugs, from outside. The two disagree only when something between the
// helper and the response goes wrong, which is exactly the class of fault
// neither the type system nor a unit check can see.
//
// JAVASCRIPT IS OFF ON PURPOSE. Every public page here is server-rendered by
// rule, and a page that comes back thin without JavaScript is not a crawler
// limitation to work around — it is the rule being broken, and this is the
// cheapest place it would show.
//
// THE CRAWL IS THE ONLY PAID PART, at a fraction of a cent per page. Every
// report endpoint below is free, which is why --id exists: once a crawl is
// finished its reports can be pulled again and again for nothing.

const OUT = ".dfs";
const TARGET = "www.moveandinvest.com";
const DEFAULT_PAGES = 400;
const POLL_SECONDS = 10;

interface TaskPosted {
  id?: string;
}

interface Summary {
  crawl_progress?: string;
  crawl_status?: { max_crawl_pages?: number; pages_in_queue?: number; pages_crawled?: number };
  domain_info?: { server?: string; ssl_info?: { valid_certificate?: boolean } | null; total_pages?: number };
  page_metrics?: {
    links_external?: number;
    links_internal?: number;
    duplicate_title?: number;
    duplicate_description?: number;
    duplicate_content?: number;
    broken_links?: number;
    broken_resources?: number;
    non_indexable?: number;
    checks?: Record<string, number>;
  };
}

interface PageItem {
  url?: string;
  status_code?: number;
  meta?: {
    title?: string | null;
    description?: string | null;
    canonical?: string | null;
    htags?: Record<string, string[]> | null;
    internal_links_count?: number;
    content?: { plain_text_word_count?: number | null } | null;
  } | null;
  checks?: Record<string, boolean> | null;
}

interface LinkItem {
  type?: string;
  link_from?: string;
  link_to?: string;
  page_from?: string;
  page_to?: string;
  direction?: string;
  is_broken?: boolean;
  page_to_status_code?: number;
  is_valid_hreflang?: boolean | null;
  hreflang?: string | null;
}

function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function duplicatesBy(pages: PageItem[], of: (page: PageItem) => string | null): [string, string[]][] {
  const byValue = new Map<string, string[]>();
  for (const page of pages) {
    if ((page.status_code ?? 0) !== 200) continue;
    const value = of(page);
    if (!value) continue;
    const list = byValue.get(value) ?? [];
    list.push(page.url ?? "");
    byValue.set(value, list);
  }
  return [...byValue].filter(([, urls]) => urls.length > 1);
}

async function startCrawl(maxPages: number): Promise<string> {
  const response = await post<TaskPosted>("/v3/on_page/task_post", [
    {
      target: TARGET,
      max_crawl_pages: maxPages,
      load_resources: false,
      enable_javascript: false,
      enable_browser_rendering: false,
      store_raw_html: true,
      check_spell: false,
    },
  ]);
  const task = response.tasks[0];
  const id = task?.id;
  if (!id) throw new Error(`task_post returned no id: ${task?.status_message ?? "no task"}`);
  console.log(`crawl ${id} posted for ${TARGET}, cap ${maxPages} pages`);
  return id;
}

// 40602 "Task In Queue" is the summary endpoint's answer between task_post and
// the crawler actually starting, and it arrives as a FAILED task rather than
// as a progress state. firstResult throws on it, correctly — a failed task
// must never be read as an empty result — so it is caught here instead, which
// is the one place where that particular failure means "not yet".
const IN_QUEUE = 40602;

async function summaryOf(id: string): Promise<Summary | null> {
  const response = await get<Summary>(`/v3/on_page/summary/${id}`);
  const task = response.tasks[0];
  if (task?.status_code === IN_QUEUE) return null;
  return firstResult(response);
}

async function waitFor(id: string): Promise<Summary> {
  for (;;) {
    const summary = await summaryOf(id);
    if (!summary) {
      process.stdout.write(`\r  waiting for the crawler to pick the task up   `);
      await sleep(POLL_SECONDS);
      continue;
    }
    const status = summary.crawl_status;
    process.stdout.write(
      `\r  ${summary.crawl_progress ?? "?"}: ${status?.pages_crawled ?? 0} crawled, ` +
        `${status?.pages_in_queue ?? 0} queued   `,
    );
    if (summary.crawl_progress === "finished") {
      process.stdout.write("\n");
      return summary;
    }
    await sleep(POLL_SECONDS);
  }
}

// Each report is pulled on its own and a failure is NAMED rather than thrown.
// These endpoints do not share a payload shape — duplicate_tags wants a `type`
// where the others want nothing — and one rejected field used to discard a
// finished crawl's other five reports along with it. The crawl is the part
// that costs money; losing it to a typo in an optional filter is the one
// outcome worth engineering against.
async function report<T>(
  label: string,
  path: string,
  id: string,
  extra: Record<string, unknown> = {},
): Promise<T[]> {
  try {
    const response = await post<{ items?: T[] | null }>(path, [{ id, limit: 1000, ...extra }]);
    return firstResult(response).items ?? [];
  } catch (error) {
    console.error(`  ! ${label}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

async function allLinks(id: string): Promise<LinkItem[]> {
  const out: LinkItem[] = [];
  for (let offset = 0; ; offset += 1000) {
    const batch = await report<LinkItem>(`links at ${offset}`, "/v3/on_page/links", id, { offset });
    for (const link of batch) out.push(link);
    if (batch.length < 1000) return out;
  }
}

/**
 * The check scripts/canonicals.ts cannot make: hreflang as SERVED, across the
 * real Sanity slugs.
 *
 * ⚠ IT READS THE PAGES ITSELF RATHER THAN THE CRAWLER'S LINK REPORT, and the
 * reason is a false finding this script produced on its first run. That report
 * carries `type: "alternate"` rows with an `hreflang` value and an
 * `is_valid_hreflang` flag, which looks like everything needed. It holds 277
 * such rows for this site, valued en, pl and ru — and NOT ONE x-default row,
 * although every page serves one. Audited from that data the site came back
 * with 107 pages missing x-default, which is every page it has, and the
 * correct number is zero. Absence in a report is evidence only once you have
 * established the report carries the thing at all.
 *
 * Fetching 107 pages of our own site costs nothing and removes the question.
 *
 * Three faults are looked for. A page must name ITSELF among its alternates,
 * or the cluster has no anchor. Every alternate must name it BACK: if the
 * English page points at the Russian one and the Russian one does not point
 * home, Search Console files the error against the Russian page, days later,
 * under a name that does not mention the page that caused it. And the
 * canonical must be the page's own address.
 */
interface Served {
  url: string;
  status: number;
  canonical: string | null;
  alternates: Map<string, string>;
}

async function fetchServed(urls: string[]): Promise<Map<string, Served>> {
  const out = new Map<string, Served>();
  let next = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const url = urls[next++];
      if (url === undefined) return;
      try {
        const response = await fetch(url, { headers: { "user-agent": "moveandinvest-audit" } });
        const html = await response.text();
        const alternates = new Map<string, string>();
        for (const match of html.matchAll(/<link[^>]*rel="alternate"[^>]*>/gi)) {
          const lang = /hreflang="([^"]+)"/i.exec(match[0])?.[1];
          const href = /href="([^"]+)"/i.exec(match[0])?.[1];
          if (lang && href) alternates.set(lang.toLowerCase(), href);
        }
        out.set(url, {
          url,
          status: response.status,
          canonical: /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i.exec(html)?.[1] ?? null,
          alternates,
        });
      } catch {
        out.set(url, { url, status: 0, canonical: null, alternates: new Map() });
      }
      process.stdout.write(`\r  ${out.size}/${urls.length} pages read`);
    }
  }

  await Promise.all(Array.from({ length: 6 }, () => worker()));
  process.stdout.write("\n");
  return out;
}

function auditAlternates(served: Map<string, Served>): {
  pages: number;
  noAlternates: string[];
  noSelf: string[];
  oneWay: [string, string][];
  withoutDefault: string[];
  canonicalElsewhere: [string, string][];
} {
  // An address can be written with or without a trailing slash and with or
  // without "www" and still be the same page. Comparing the raw strings is how
  // a correct cluster gets reported as broken.
  const key = (url: string): string => url.replace(/\/+$/, "").toLowerCase();
  const byKey = new Map<string, Served>();
  for (const page of served.values()) byKey.set(key(page.url), page);

  const noAlternates: string[] = [];
  const noSelf: string[] = [];
  const oneWay: [string, string][] = [];
  const withoutDefault: string[] = [];
  const canonicalElsewhere: [string, string][] = [];

  for (const page of served.values()) {
    if (page.status !== 200) continue;
    if (page.canonical && key(page.canonical) !== key(page.url)) {
      canonicalElsewhere.push([page.url, page.canonical]);
    }
    if (page.alternates.size === 0) {
      noAlternates.push(page.url);
      continue;
    }
    const targets = new Set([...page.alternates.values()].map(key));
    if (!targets.has(key(page.url))) noSelf.push(page.url);
    if (!page.alternates.has("x-default")) withoutDefault.push(page.url);

    for (const [lang, href] of page.alternates) {
      if (lang === "x-default" || key(href) === key(page.url)) continue;
      const other = byKey.get(key(href));
      // A target that was never fetched cannot be checked for a return tag,
      // and reporting it as missing would be an accusation from no evidence.
      if (!other) continue;
      const back = new Set([...other.alternates.values()].map(key));
      if (!back.has(key(page.url))) oneWay.push([page.url, href]);
    }
  }

  return {
    pages: served.size,
    noAlternates,
    noSelf,
    oneWay,
    withoutDefault,
    canonicalElsewhere,
  };
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const idAt = args.indexOf("--id");
  const pagesAt = args.indexOf("--pages");
  const maxPages = pagesAt >= 0 ? Number(args[pagesAt + 1]) : DEFAULT_PAGES;

  let id = idAt >= 0 ? args[idAt + 1] : undefined;
  let summary: Summary;

  if (id) {
    console.log(`re-reading crawl ${id}`);
    const existing = await summaryOf(id);
    summary = existing?.crawl_progress === "finished" ? existing : await waitFor(id);
  } else {
    id = await startCrawl(maxPages);
    summary = await waitFor(id);
  }

  const metrics = summary.page_metrics ?? {};
  console.log(`\ncrawled ${summary.crawl_status?.pages_crawled ?? 0} pages`);
  console.log(
    `  internal links ${metrics.links_internal ?? 0}, external ${metrics.links_external ?? 0}`,
  );

  // The counted faults, in one place. Zero is printed as well as non-zero:
  // a report that lists only what is wrong cannot be told apart from a report
  // that failed to look.
  const headline: [string, number | undefined][] = [
    ["duplicate title", metrics.duplicate_title],
    ["duplicate description", metrics.duplicate_description],
    ["duplicate content", metrics.duplicate_content],
    ["broken links", metrics.broken_links],
    ["broken resources", metrics.broken_resources],
    ["non indexable", metrics.non_indexable],
  ];
  console.log(`\n  headline counts`);
  for (const [label, value] of headline) {
    console.log(`    ${label.padEnd(24)}${String(value ?? 0).padStart(5)}`);
  }

  const checks = metrics.checks ?? {};
  const raised = Object.entries(checks)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  console.log(`\n  checks raised (${raised.length} of ${Object.keys(checks).length})`);
  for (const [name, count] of raised) {
    console.log(`    ${name.padEnd(40)}${String(count).padStart(5)}`);
  }

  const pages = await report<PageItem>("pages", "/v3/on_page/pages", id);
  const nonIndexable = await report<unknown>("non indexable", "/v3/on_page/non_indexable", id);
  const redirectChains = await report<unknown>("redirect chains", "/v3/on_page/redirect_chains", id);

  // EVERY LINK, PAGED, AND FILTERED HERE RATHER THAN BY THE API. The endpoint
  // rejected a server-side filter on the status code, and there is no reason
  // to fight it: the whole link graph of this site is three and a half
  // thousand rows, it is free, and holding it locally is what makes the
  // hreflang audit below possible at all.
  const links = await allLinks(id);
  const broken = links.filter(
    (link) => link.is_broken === true || (link.page_to_status_code ?? 0) >= 400,
  );
  const toRedirects = links.filter((link) => {
    const code = link.page_to_status_code ?? 0;
    return code >= 300 && code < 400;
  });

  // Duplicates are counted from the crawled pages rather than from
  // /on_page/duplicate_tags, which rejected every payload shape tried. The
  // page report carries every title and description already, so the extra
  // call bought nothing but a second way to be wrong.
  const duplicateTitles = duplicatesBy(pages, (page) => page.meta?.title ?? null);
  const duplicateDescriptions = duplicatesBy(pages, (page) => page.meta?.description ?? null);

  console.log(`\n  reading the served HTML of every 200 page for alternates and canonicals`);
  const served = await fetchServed(
    pages.filter((page) => page.status_code === 200).map((page) => page.url ?? "").filter(Boolean),
  );
  const hreflang = auditAlternates(served);

  mkdirSync(OUT, { recursive: true });
  const file = join(OUT, `onpage-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      {
        measured: new Date().toISOString(),
        id,
        target: TARGET,
        summary,
        pages,
        links,
        hreflang,
        duplicateTitles,
        duplicateDescriptions,
        nonIndexable,
        redirectChains,
      },
      null,
      2,
    ),
  );

  const bad = pages.filter((page) => (page.status_code ?? 0) >= 400 || (page.status_code ?? 0) === 0);
  if (bad.length > 0) {
    console.log(`\n  pages answering with an error`);
    for (const page of bad) {
      console.log(`    ${String(page.status_code).padStart(4)}  ${page.url ?? ""}`);
    }
  }

  if (broken.length > 0) {
    console.log(`\n  links to an error`);
    for (const link of broken.slice(0, 20)) {
      console.log(`    ${link.link_to ?? ""}\n      from ${link.link_from ?? ""}`);
    }
  }

  if (toRedirects.length > 0) {
    const byTarget = new Map<string, Set<string>>();
    for (const link of toRedirects) {
      const set = byTarget.get(link.link_to ?? "") ?? new Set<string>();
      set.add(link.link_from ?? "");
      byTarget.set(link.link_to ?? "", set);
    }
    console.log(`\n  internal links pointing at a redirect (${toRedirects.length})`);
    for (const [target, from] of [...byTarget].slice(0, 15)) {
      console.log(`    ${target}   from ${from.size} page(s)`);
    }
  }

  for (const [label, rows] of [
    ["duplicate title", duplicateTitles],
    ["duplicate description", duplicateDescriptions],
  ] as const) {
    if (rows.length === 0) continue;
    console.log(`\n  ${label} (${rows.length})`);
    for (const [value, urls] of rows.slice(0, 10)) {
      console.log(`    "${value.slice(0, 70)}"`);
      for (const url of urls) console.log(`       ${url}`);
    }
  }

  console.log(`\n  alternates and canonicals, read from ${hreflang.pages} served pages`);
  const faults: [string, string[]][] = [
    ["declaring no alternates at all", hreflang.noAlternates],
    ["missing their own self-reference", hreflang.noSelf],
    ["without x-default", hreflang.withoutDefault],
    ["canonical pointing elsewhere", hreflang.canonicalElsewhere.map(([a, b]) => `${a} -> ${b}`)],
    ["one-way pairs (no return tag)", hreflang.oneWay.map(([a, b]) => `${a} -> ${b}`)],
  ];
  for (const [label, rows] of faults) {
    console.log(`    ${label.padEnd(34)}${String(rows.length).padStart(4)}`);
    for (const row of rows.slice(0, 8)) console.log(`        ${row}`);
  }

  console.log(
    `\n  ${pages.length} pages, ${links.length} links, ${nonIndexable.length} non-indexable, ` +
      `${redirectChains.length} redirect chains`,
  );
  console.log(`\nraw -> ${file}`);
  console.log(`re-read it for nothing with:  npm run dfs:onpage -- --id ${id}`);
  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
