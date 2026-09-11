// The whole of this project's access to api.dataforseo.com. Every script under
// scripts/dataforseo/ goes through here and none of them opens its own fetch.
//
// NO SDK, AND THAT IS DELIBERATE. DataForSEO publishes a client library; it
// wraps Basic auth and a POST in several hundred kilobytes of generated code,
// and it would be a dependency every `npm ci` installs and every audit reports
// for the sake of four lines. The same argument the geometry script makes for
// world-atlas, except here the four lines are below and nothing has to be
// installed ad hoc either.
//
// THE TRAP THIS FILE EXISTS TO CLOSE: a DataForSEO task can fail while the
// HTTP response is 200 and the envelope's own status_code is 20000. The
// envelope reports whether the REQUEST was understood; each task reports
// whether the WORK was done. A caller that reads response.tasks[0].result
// without looking at the task's status_code gets `null`, reads it as "no
// keywords found", and writes a confident zero into a report. Hence
// firstResult/allResults below, which are the only sanctioned way to reach a
// result, and which name the task's own status_message when it failed.

const BASE = "https://api.dataforseo.com";

export interface DfsTask<T> {
  id: string;
  status_code: number;
  status_message: string;
  cost: number;
  path?: string[];
  data?: Record<string, unknown>;
  result: T[] | null;
}

export interface DfsResponse<T> {
  status_code: number;
  status_message: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: DfsTask<T>[];
}

// 20000 is "Ok". 20100 is "Task Created" and is a SUCCESS — the queued
// endpoints (SERP standard, On-Page) answer with it and the result is
// collected later. Treating it as a failure is how a cheap queued call gets
// abandoned for an expensive live one.
const OK = new Set([20000, 20100]);

// What this run has cost, in DataForSEO's own accounting. Printed by
// reportSpend() at the end of every script rather than left for the dashboard
// to reveal tomorrow: a loop over 6 000 keywords that costs more than expected
// should say so in the terminal where it can still be stopped.
let spent = 0;

export function reportSpend(): void {
  console.log(`\nthis run cost $${spent.toFixed(4)}`);
}

function authHeader(): string {
  const login = process.env.DATAFORSEO_API_LOGIN;
  const password = process.env.DATAFORSEO_API_PASSWORD;

  // Names, never values — the discipline sender.ts keeps, for the same reason:
  // these lines end up pasted into a chat window when something breaks.
  const missing: string[] = [];
  if (!login) missing.push("DATAFORSEO_API_LOGIN");
  if (!password) missing.push("DATAFORSEO_API_PASSWORD");
  if (missing.length > 0) {
    throw new Error(
      `Not configured: ${missing.join(", ")} is not reaching this process.\n` +
        `Both belong in .env.local, and these scripts are run through tsx with\n` +
        `--env-file=.env.local — check the npm script if they are set and still missing.`,
    );
  }

  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

async function call<T>(
  method: "GET" | "POST",
  path: string,
  payload?: unknown[],
): Promise<DfsResponse<T>> {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  // 401 arrives as an HTTP status with an empty-ish body, so it needs saying
  // in words: it is the one failure whose cause is the credentials rather than
  // the request.
  if (response.status === 401) {
    throw new Error(
      `401 from ${path}. The login or the password is wrong, or the account is\n` +
        `suspended. Run "npm run dfs:whoami" — it answers that question and nothing else.`,
    );
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} from ${path}: ${body.slice(0, 500)}`);
  }

  const envelope = (await response.json()) as DfsResponse<T>;

  if (!OK.has(envelope.status_code)) {
    throw new Error(
      `${path} refused the request: ${envelope.status_code} ${envelope.status_message}`,
    );
  }

  spent += envelope.cost ?? 0;
  return envelope;
}

export function post<T>(path: string, tasks: unknown[]): Promise<DfsResponse<T>> {
  return call<T>("POST", path, tasks);
}

export function get<T>(path: string): Promise<DfsResponse<T>> {
  return call<T>("GET", path);
}

function describeFailure<T>(task: DfsTask<T>): string {
  return `task ${task.id} failed: ${task.status_code} ${task.status_message}`;
}

/** The single result of a single-task call. Throws rather than returning a
 *  silent null when the task itself failed. */
export function firstResult<T>(response: DfsResponse<T>): T {
  const task = response.tasks[0];
  if (!task) throw new Error("the response carried no tasks at all");
  if (!OK.has(task.status_code)) throw new Error(describeFailure(task));

  const result = task.result?.[0];
  if (result === undefined) {
    throw new Error(`task ${task.id} succeeded and returned an empty result`);
  }
  return result;
}

/** Every result across every task of a batch call. A batch is posted as up to
 *  100 tasks and they fail INDIVIDUALLY, so one bad location code must not
 *  discard the ninety-nine that worked — the failures are named on stderr and
 *  the successes are returned. All of them failing is an error. */
export function allResults<T>(response: DfsResponse<T>): T[] {
  const out: T[] = [];
  const failures: string[] = [];

  for (const task of response.tasks) {
    if (!OK.has(task.status_code)) {
      failures.push(describeFailure(task));
      continue;
    }
    for (const result of task.result ?? []) out.push(result);
  }

  if (failures.length > 0 && failures.length === response.tasks.length) {
    throw new Error(`every task failed:\n  ${failures.join("\n  ")}`);
  }
  for (const failure of failures) console.error(`  ! ${failure}`);

  return out;
}
