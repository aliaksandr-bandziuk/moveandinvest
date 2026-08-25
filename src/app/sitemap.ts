import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
import { sanityFetchPublished } from "@/sanity/client";
import {
  SITEMAP_COUNTRY_QUERY,
  SITEMAP_PROPERTY_QUERY,
  SITEMAP_SINGLETON_QUERY,
} from "@/sanity/queries";
import type { SitemapCountryDoc, SitemapDoc } from "@/sanity/types";

// The sitemap, built the same way as the sibling `giuseppeiannone` project's:
// one list of fixed routes paired with the Sanity type that owns each, one
// query per type, and hreflang alternates assembled from the languages that
// actually survived the index filter.
//
// `sanityFetchPublished`, not `sanityFetch`. A sitemap must describe the
// published site regardless of whether the person requesting it happens to
// have a draft-mode cookie — see the comment on that wrapper.
//
// The jurisdiction pages are here as of 23 Aug 2026, when the `[slug]` route
// was built. They cannot go through ROUTES: their path is a slug that differs
// in every language — portugal / portugaliya / portugalia — so their URLs come
// from the documents themselves, and the hreflang set is assembled by grouping
// on the `country` each of them references. See the second loop.
//
// ONE THING IS DELIBERATELY ABSENT. `/styleguide` is not here and must not be.
// It is an internal reference for building the site, not a page anyone should
// arrive at from a search result; robots.ts disallows it for the same reason.
// "Everything open for indexing" means every page written for a reader, and
// the styleguide is not one.

interface SingletonRoute {
  /** Locale-independent route, exactly as `getPathname` expects it. */
  href: string;
  /** The Sanity type whose document owns this route's lastModified. */
  documentType: string;
}

// Adding a page to the site is adding a line here. That is the whole point of
// the list: a sitemap assembled by hand somewhere else is one that silently
// stops matching the site the first time a route is added in a hurry.
const ROUTES: SingletonRoute[] = [
  { href: "/", documentType: "homePage" },
  { href: "/for-partners", documentType: "partnersPage" },
  { href: "/about", documentType: "aboutPage" },
  { href: "/sources", documentType: "sourcesPage" },
  { href: "/contacts", documentType: "contactsPage" },
  { href: "/privacy", documentType: "privacyPage" },
];

function isLocale(value: unknown): value is (typeof routing.locales)[number] {
  return typeof value === "string" && routing.locales.includes(value as never);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [results, countryDocs, propertyDocs] = await Promise.all([
    Promise.all(
      ROUTES.map((route) =>
        sanityFetchPublished<SitemapDoc[]>(
          SITEMAP_SINGLETON_QUERY,
          { documentType: route.documentType },
          [route.documentType],
        ).then((docs) => ({ route, docs })),
      ),
    ),
    sanityFetchPublished<SitemapCountryDoc[]>(SITEMAP_COUNTRY_QUERY, {}, ["countryPage"]),
    sanityFetchPublished<SitemapCountryDoc[]>(SITEMAP_PROPERTY_QUERY, {}, ["propertyPage"]),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const { route, docs } of results) {
    // A language is listed only if its own document exists AND is not marked
    // noIndex. Both halves matter: a route whose Polish document has never
    // been written should not appear as a Polish URL, and a page deliberately
    // held back should not appear at all.
    //
    // The alternates map is built from the SAME filtered set, so an indexable
    // language never advertises a sibling that is being kept out of the
    // index. Building it from routing.locales instead — which is what
    // buildMetadata does for the page's own <link rel="alternate">, where it
    // is correct because the URL is known statically — would reintroduce
    // exactly that mismatch here, where the document may not exist.
    const indexable = docs.filter((doc) => isLocale(doc.language) && doc.noIndex !== true);
    if (indexable.length === 0) continue;

    const languages: Record<string, string> = Object.fromEntries(
      indexable.map((doc) => [
        doc.language as string,
        `${siteUrl}${getPathname({ href: route.href, locale: doc.language as string })}`,
      ]),
    );

    // x-default, and it has to be here because buildMetadata puts one in the
    // page's own <link rel="alternate"> set. Search Console compares the two
    // and reports a mismatch as an hreflang error, so a sitemap that lists
    // three languages against a page that lists four is a warning waiting to
    // happen. Added only when the default locale is itself indexable — an
    // x-default pointing at a page being held out of the index is worse than
    // none, since it is the fallback for every language that matches nothing.
    // `noUncheckedIndexedAccess` is on, so this reads the value once rather
    // than indexing twice — the second read is what the compiler cannot know
    // is still defined.
    const defaultUrl = languages[routing.defaultLocale];
    if (defaultUrl) {
      languages["x-default"] = defaultUrl;
    }

    for (const doc of indexable) {
      entries.push({
        url: `${siteUrl}${getPathname({ href: route.href, locale: doc.language as string })}`,
        lastModified: doc._updatedAt,
        alternates: { languages },
      });
    }
  }

  // --- Jurisdiction and property pages ---------------------------------------
  // Both are grouped by the country they reference, because that is what makes
  // three documents one page in three languages. A jurisdiction with no page in
  // a given language simply has no URL there, and no hreflang pointing at one.
  //
  // The two sets are grouped SEPARATELY even though they share a URL space and
  // a `country`. Grouping them together would put /greece and
  // /property-in-greece in one hreflang set, telling a search engine that the
  // Russian version of the buying page is the English jurisdiction page — the
  // exact mistake hreflang exists to prevent.
  const addGrouped = (docs: SitemapCountryDoc[]) => {
    const byCountry = new Map<string, SitemapCountryDoc[]>();
    for (const doc of docs) {
      if (!doc.countryId || !doc.slug || !isLocale(doc.language) || doc.noIndex === true) continue;
      const group = byCountry.get(doc.countryId) ?? [];
      group.push(doc);
      byCountry.set(doc.countryId, group);
    }

    for (const group of byCountry.values()) {
      const languages: Record<string, string> = Object.fromEntries(
        group.map((doc) => [
          doc.language as string,
          `${siteUrl}${getPathname({ href: `/${doc.slug}`, locale: doc.language as string })}`,
        ]),
      );

      const defaultUrl = languages[routing.defaultLocale];
      if (defaultUrl) {
        languages["x-default"] = defaultUrl;
      }

      for (const doc of group) {
        entries.push({
          url: `${siteUrl}${getPathname({ href: `/${doc.slug}`, locale: doc.language as string })}`,
          lastModified: doc._updatedAt,
          alternates: { languages },
        });
      }
    }
  };

  addGrouped(countryDocs);
  addGrouped(propertyDocs);

  return entries;
}
