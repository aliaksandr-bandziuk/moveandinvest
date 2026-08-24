import type { MetadataRoute } from "next";
import { getSiteUrl, isProductionDeployment } from "@/lib/site";

// AI answer engines are named explicitly rather than left to the wildcard
// rule. This site's whole positioning is being the source an answer engine
// quotes when someone asks where to move and what it costs — blocking or
// silently omitting these crawlers would cut off the channel the project is
// built around.
const NAMED_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
];

// EVERY PAGE WRITTEN FOR A READER IS OPEN. The entries below are not
// exceptions to that — none of them is a page written for a reader. /studio is
// the CMS, /api/ is a form handler that answers a POST with a redirect, and
// the styleguide is an internal reference for building the site. There is no
// content held back here and no per-document noIndex set anywhere in the
// dataset; if a page ever needs excluding, that flag is the mechanism, not
// this list.
//
// /comparison/ is the PDF a subscriber gets back, and its reason is the one
// easiest to state wrongly. It is NOT withheld content: every figure in it is
// on the open pages, in the same three languages, and those pages are what we
// want an answer engine to quote. The PDF is a second copy of them with worse
// markup and no internal links — indexed, it would compete with its own source
// for the query it was derived from. Excluding it protects the pages, not a
// secret. (It also keeps the offer meaning something, but that alone would not
// be reason enough to close a URL on this site.)
//
// The styleguide is listed under both shapes because the locale prefix is
// part of the path for ru and pl: /styleguide and /ru/styleguide are two
// different URLs, and a bare "/styleguide" entry would only cover the first.
const DISALLOWED_PATHS = [
  "/studio",
  "/api/",
  "/styleguide",
  "/*/styleguide",
  "/comparison/",
];

export default function robots(): MetadataRoute.Robots {
  // Local dev and every preview deployment: nothing is crawlable at all.
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      { userAgent: NAMED_BOTS, allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
    ],
    // src/app/sitemap.ts, which exists as of 23 Aug 2026 — until then this
    // line pointed at a 404, which is a worse signal than no sitemap line at
    // all: it tells a crawler to expect one and then wastes the fetch.
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
