import { createClient } from "next-sanity";
import { draftMode } from "next/headers";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  // Freshness comes from Next's own fetch cache plus revalidateTag, not
  // from Sanity's CDN cache — two caches with different invalidation
  // stories is how a page stays stale after a successful webhook.
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

// Separate client, separate (Viewer-scoped) token, used only when draft
// mode is active. stega is enabled here and nowhere else: it encodes
// invisible characters into string values so Presentation's click-to-edit
// can trace rendered text back to its source field. On the published
// client those characters would leak into real, indexed content.
const previewClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token: process.env.SANITY_API_PREVIEW_TOKEN,
  perspective: "drafts",
  stega: { enabled: true, studioUrl: "/studio" },
});

// Single entry point for every page fetch, so "is this request in draft
// mode" is decided in exactly one place. Draft responses are never cached,
// on top of Next already rendering the route dynamically once
// draftMode().isEnabled is read.
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
): Promise<T> {
  const isDraft = await isDraftModeEnabled();

  if (isDraft) {
    return previewClient.fetch<T>(query, params, { cache: "no-store" });
  }

  return client.fetch<T>(query, params, { next: { tags } });
}

export async function isDraftModeEnabled(): Promise<boolean> {
  const { isEnabled } = await draftMode();
  return isEnabled;
}

// For callers that must never branch on draft mode: generateStaticParams
// (build time — no request exists yet, so draftMode() is meaningless) and
// public routes like sitemap.ts and robots.ts, which must reflect published
// content regardless of the requester's own draft-mode cookie.
//
// `tags` is a required argument on both wrappers on purpose: an untagged
// fetch is one the revalidation webhook can never invalidate, and that is
// not a mistake worth making twice. These two functions are the only place
// allowed to call .fetch() — see CLAUDE.md.
export function sanityFetchPublished<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
): Promise<T> {
  return client.fetch<T>(query, params, { next: { tags } });
}
