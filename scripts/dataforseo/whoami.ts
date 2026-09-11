import { get, firstResult, reportSpend } from "./client";

// Answers three questions and nothing else, before a single paid call is made:
//
//   npm run dfs:whoami          # credentials, balance, rate limits, our prices
//   npm run dfs:whoami -- --all # every price in the account's own price list
//   npm run dfs:whoami -- --raw # the whole response, unread
//
// The same role mailcheck.ts plays for the relay. When a DataForSEO script
// fails there are four candidate causes and they need different fixes: the
// variables are not loaded, the credentials are wrong, the balance is spent,
// or the request was wrong. Only this script can tell the first three apart,
// and it is free — /v3/appendix/user_data is the one endpoint DataForSEO does
// not charge for.
//
// IT PRINTS PRICES FROM THE ACCOUNT RATHER THAN FROM ANYWHERE ELSE. Published
// rate cards go stale and per-account rates differ; a plan built on a price
// somebody half-remembered is how a 6 000-keyword loop turns out to cost two
// orders of magnitude more than the sentence that authorised it. The numbers
// this prints are the numbers this account will be charged.

const args = process.argv.slice(2);
const RAW = args.includes("--raw");
const ALL = args.includes("--all");

// The families the plan actually spends on. Everything else in the price list
// is noise here — the account carries prices for merchant data, app data and
// a dozen other APIs this project will never call.
const OF_INTEREST = [
  "dataforseo_labs.",
  "serp.live",
  "serp.task_post",
  "serp.task_get",
  "on_page.",
  "backlinks.",
  "business_data.google.",
  "ai_optimization.",
];

interface Limits {
  minute?: { total?: number };
  day?: { total?: number };
}

interface UserData {
  login?: string;
  timezone?: string;
  money?: { total?: number; balance?: number; limits?: Limits };
  rates?: { limits?: Limits };
  price?: unknown;
  backlinks_subscription_expiry_date?: string;
  llm_mentions_subscription_expiry_date?: string;
}

// A price leaf is an array of {cost_type, cost}, because an endpoint can
// charge per request AND per row returned — Labs charges $0.012 to ask and
// $0.00012 for each keyword it hands back, so "the price" is two numbers and
// a plan built on either one alone is wrong.
interface CostEntry {
  cost_type?: string;
  cost?: number;
}

function isCostArray(value: unknown): value is CostEntry[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "object" && item !== null && "cost" in item)
  );
}

function formatCosts(entries: CostEntry[]): string {
  const parts = entries
    .filter((entry) => (entry.cost ?? 0) > 0)
    .map((entry) => `$${entry.cost}/${(entry.cost_type ?? "").replace(/^per_/, "")}`);
  return parts.length > 0 ? parts.join(" + ") : "free";
}

// Shape, never the value — the two ways a pasted credential is commonly wrong
// are both invisible in a .env file: quotation marks copied in with it, and a
// trailing space picked up from the paste.
function describeSecret(value: string): string {
  const notes: string[] = [`${value.length} characters`];
  if (/^["']|["']$/.test(value)) notes.push("STARTS OR ENDS WITH A QUOTE — remove them");
  if (value !== value.trim()) notes.push("HAS LEADING OR TRAILING WHITESPACE — remove it");
  return notes.join(", ");
}

// The price tree nests differently in every family — Labs is endpoint-first
// (dataforseo_labs.ranked_keywords.live), SERP is mode-first (serp.live.
// advanced) — so this walks rather than reaching for a known path. The first
// version stopped at the arrays and printed nothing at all, which is why it
// reports the count it found: a filter that matches zero rows and a tree that
// parsed to zero rows look identical in a terminal otherwise.
//
// ONLY priority_normal IS KEPT. Every endpoint prices three queue priorities
// and they are almost always identical; printing all three triples a table
// nobody would then read. Where they differ (SERP task_post charges double at
// high priority) it is the normal rate these scripts will pay.
function flattenPrices(node: unknown, path: string, into: Map<string, string>): void {
  if (isCostArray(node)) {
    into.set(path.replace(/\.priority_normal$/, ""), formatCosts(node));
    return;
  }
  if (node === null || typeof node !== "object" || Array.isArray(node)) return;

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "priority_low" || key === "priority_high") continue;
    flattenPrices(value, path ? `${path}.${key}` : key, into);
  }
}

async function run(): Promise<void> {
  const login = process.env.DATAFORSEO_API_LOGIN;
  const password = process.env.DATAFORSEO_API_PASSWORD;

  console.log(`DATAFORSEO_API_LOGIN     ${login ?? "— NOT SET"}`);
  console.log(
    `DATAFORSEO_API_PASSWORD  ${password ? `set — ${describeSecret(password)}` : "— NOT SET"}`,
  );
  console.log();

  const response = await get<UserData>("/v3/appendix/user_data");

  if (RAW) {
    console.log(JSON.stringify(response, null, 2));
    reportSpend();
    return;
  }

  const user = firstResult(response);

  console.log(`account   ${user.login ?? "(the response named no login)"}`);
  console.log(`timezone  ${user.timezone ?? "(none)"}`);

  const balance = user.money?.balance;
  const total = user.money?.total;
  console.log(
    `balance   ${typeof balance === "number" ? `$${balance.toFixed(2)}` : "(not in the response)"}` +
      (typeof total === "number" ? `   spent to date $${total.toFixed(2)}` : ""),
  );

  // TWO DIFFERENT LIMITS, and they are not interchangeable. The rate limit is
  // requests per minute and decides whether a batch script has to be
  // resumable; the money limit is dollars per day and decides whether a run
  // can be authorised at all. They live in different objects, and reading
  // either one as "the limit" is how a script gets written for the wrong
  // constraint.
  const perMinute = user.rates?.limits?.minute?.total;
  const perDay = user.money?.limits?.day?.total;
  console.log(
    `limits    ${perMinute ?? "?"} requests/minute` +
      `   spend cap $${perDay ?? "?"}/day`,
  );

  for (const [label, date] of [
    ["backlinks", user.backlinks_subscription_expiry_date],
    ["llm mentions", user.llm_mentions_subscription_expiry_date],
  ] as const) {
    if (date) console.log(`sub       ${label} until ${date.slice(0, 10)}`);
  }

  const prices = new Map<string, string>();
  flattenPrices(user.price, "", prices);

  console.log(`\nprices — ${prices.size} endpoints in this account's price list`);

  if (prices.size === 0) {
    console.log(
      `  The response carried no price tree. Re-run with --raw and look for where\n` +
        `  the prices moved to; do NOT plan a batch against a remembered rate card.`,
    );
    reportSpend();
    return;
  }

  const rows = [...prices.entries()]
    .filter(([path]) => ALL || OF_INTEREST.some((prefix) => path.includes(prefix)))
    .sort(([a], [b]) => a.localeCompare(b));

  if (rows.length === 0) {
    console.log(`  Nothing matched the families we plan to use. Re-run with --all.`);
  }

  const width = rows.reduce((max, [path]) => Math.max(max, path.length), 0);
  for (const [path, price] of rows) {
    console.log(`  ${path.padEnd(width)}  ${price}`);
  }

  if (!ALL && rows.length > 0) {
    console.log(`\n  (${prices.size - rows.length} more, --all to see them)`);
  }

  reportSpend();
}

run().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
