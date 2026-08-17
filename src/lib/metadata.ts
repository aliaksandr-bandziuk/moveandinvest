import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { SeoResult } from "@/sanity/types";
import { getSiteUrl, resolveRobots } from "./site";

interface BuildMetadataArgs {
  seo: SeoResult;
  locale: string;
  /** Locale-independent route, e.g. "/" or "/for-partners". */
  href: string;
}

// One place that turns a Sanity seo object into Next metadata, so canonical
// and hreflang can never drift apart per route.
//
// hreflang is built from routing.locales rather than from a document lookup:
// for a fixed route the URL is already known in code, and deriving it from a
// translation-metadata document is how a canonical silently falls back to "/"
// when that document does not exist yet.
export function buildMetadata({ seo, locale, href }: BuildMetadataArgs): Metadata {
  const siteUrl = getSiteUrl();

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${siteUrl}${getPathname({ href, locale: l })}`]),
  );

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    robots: resolveRobots(seo.noIndex),
    alternates: {
      canonical: `${siteUrl}${getPathname({ href, locale })}`,
      languages: {
        ...languages,
        // Points at the unprefixed default so a search engine has somewhere
        // to send a visitor whose language matches none of the three.
        "x-default": `${siteUrl}${getPathname({ href, locale: routing.defaultLocale })}`,
      },
    },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: `${siteUrl}${getPathname({ href, locale })}`,
      siteName: "moveandinvest",
      locale,
      type: "website",
    },
  };
}
