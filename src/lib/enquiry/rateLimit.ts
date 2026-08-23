// Per-IP speed bump on /api/enquiry. Ported from the sibling
// `giuseppeiannone` project, comment and limits intact, because the honest
// part of that comment is the part worth keeping:
//
// In-memory only. No Redis or Upstash is wired up here, and adding one is an
// infrastructure decision with a bill attached — it does not belong smuggled
// into a form feature. This Map is process-local, so it resets on every cold
// start and every concurrent serverless instance keeps its own counter. That
// is NOT a distributed rate limit. It is a speed bump against a naive script,
// and for a site whose enquiry form should see a handful of submissions a
// week that is the right amount of machinery.
//
// It is also not the spam defence. The honeypot in the route is, and unlike
// the sibling's signed form token, both of these keep working with JavaScript
// switched off — which the enquiry form has to, by the rule in CLAUDE.md.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}
