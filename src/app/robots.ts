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

// The styleguide is listed under both shapes because the locale prefix is
// part of the path for ru and pl: /styleguide and /ru/styleguide are two
// different URLs, and a bare "/styleguide" entry would only cover the first.
const DISALLOWED_PATHS = ["/studio", "/api/", "/styleguide", "/*/styleguide"];

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
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
