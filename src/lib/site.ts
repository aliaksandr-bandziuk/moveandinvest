// Single source of truth for the site's own base URL and for whether this
// deployment is allowed to be indexed. Canonicals, hreflang, the sitemap and
// JSON-LD all read from here — never hardcode a host anywhere else.
//
// Deviation from the sibling giuseppeiannone project, where these two
// functions live in src/sanity/metadata.ts: nothing about them is
// Sanity-specific, and robots.ts needs them before any Sanity wiring exists.

// Falls back through: the real production domain (set at launch) -> the
// current Vercel deployment's own URL (correct for previews, whose canonical
// should point at themselves) -> localhost.
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

// True only on a real production deployment with a real domain configured,
// so "local dev" and "preview deployment" behave identically (both
// non-indexable) without a separate toggle.
//
// This does NOT cover the "any *.vercel.app host is always noindex" rule —
// that includes the production deployment's own vercel.app alias, where
// VERCEL_ENV is also "production". It can only be distinguished by the
// request hostname, which is why that rule lives in src/proxy.ts as a
// response header instead.
export function isProductionDeployment(): boolean {
  return (
    process.env.VERCEL_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  );
}

// A per-document noIndex flag (Sanity, added in step 2) always wins over the
// environment check.
export function resolveRobots(noIndex?: boolean) {
  if (noIndex) {
    return { index: false, follow: false };
  }
  const shouldIndex = isProductionDeployment();
  return { index: shouldIndex, follow: shouldIndex };
}
