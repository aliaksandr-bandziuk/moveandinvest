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
//
// NOTE ON THE MIDDLE RUNG: `VERCEL_URL` is ALWAYS the deployment's own
// hostname — moveandinvest-<buildhash>-<team>.vercel.app — even in production
// with a custom domain attached. It is never the custom domain. So production
// genuinely requires NEXT_PUBLIC_SITE_URL; there is no environment variable
// Vercel sets that would do instead without being chosen deliberately.
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

let warned = false;

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
  const isProduction = process.env.VERCEL_ENV === "production";
  const hasDomain = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  // SAY IT OUT LOUD. The guard above is correct and stays: a forgotten variable
  // means "do not index" rather than "index the wrong address", which is the
  // right way round. But until 25 Aug 2026 it was also SILENT, and a silent
  // guard is one you discover weeks later by noticing that every URL in the
  // sitemap carries a build hash — which is exactly how this was found.
  //
  // ONCE PER PROCESS, not once per call. The first version printed on every
  // call and produced forty-five identical paragraphs in one build log, which
  // buries the rest of the output and trains whoever reads it to scroll past.
  // A warning nobody reads is the same as no warning.
  if (isProduction && !hasDomain && !warned) {
    warned = true;
    console.error(
      "[moveandinvest] NEXT_PUBLIC_SITE_URL is not set on a production " +
        "deployment. The whole site is therefore serving robots.txt " +
        '"Disallow: /" and noindex on every page, and every canonical, ' +
        "hreflang, OG image and JSON-LD @id points at this build's own " +
        "vercel.app hostname — which changes on the next push. Set it to the " +
        "real domain in the Vercel project's environment variables, " +
        "Production scope, and redeploy.",
    );
  }

  return isProduction && hasDomain;
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
