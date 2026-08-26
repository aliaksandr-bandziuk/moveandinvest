import { sanityFetch } from "@/sanity/client";
import {
  SITEMAP_COUNTRY_QUERY,
  SITEMAP_PROPERTY_QUERY,
} from "@/sanity/queries";
import type { SitemapCountryDoc } from "@/sanity/types";

// Which localised slug is which, across the eight pages whose URL is genuinely
// translated: /greece, /gretsiya and /grecja are one page in three languages,
// and nothing in the URL says so.
//
// WHY THIS EXISTS AT ALL — a live bug, found on 25 August 2026 by reading the
// header's own links rather than the component that writes them. The language
// switcher was building its target by taking the current path and prefixing a
// locale: on /greece the RU button pointed at /ru/greece. There is no such
// page. Measured across the live site, twenty-eight of the forty-five URLs had
// a switcher link that returned 404 — every jurisdiction and property page, in
// every language pairing.
//
// The component knew. Its own comment said the translated slugs were coming
// "in step 5", and that when they did it would have to read the reciprocal
// path instead of building one. Step 5 shipped, the pages appeared, and the
// note about the future outlived the future it described. Meanwhile the
// <head> of every one of those pages carried the correct hreflang — so the
// site was telling search engines the truth and handing a reader a 404.
//
// THE SAME TWO QUERIES THE SITEMAP USES, deliberately. The sitemap already
// groups these documents by `countryId` to turn three documents into one URL
// with two hreflang siblings; this is that grouping, flattened the other way
// round so any slug can find its siblings. One source, so the switcher and the
// sitemap cannot disagree about what the Russian Greece page is called.
export type SlugSiblings = Record<string, string>;

/** Keyed by EVERY localised slug, each pointing at the full sibling set. So
 *  "greece", "gretsiya" and "grecja" are three keys onto one object. */
export type SlugMap = Record<string, SlugSiblings>;

function addGroup(map: SlugMap, docs: SitemapCountryDoc[]): void {
  const byCountry = new Map<string, SitemapCountryDoc[]>();

  for (const doc of docs) {
    if (!doc.countryId || !doc.slug || !doc.language) continue;
    const group = byCountry.get(doc.countryId) ?? [];
    group.push(doc);
    byCountry.set(doc.countryId, group);
  }

  for (const group of byCountry.values()) {
    const siblings: SlugSiblings = {};
    for (const doc of group)
      siblings[doc.language as string] = doc.slug as string;
    // Every member points at the same object, so the lookup works from
    // whichever language the reader happens to be standing in.
    for (const doc of group) map[doc.slug as string] = siblings;
  }
}

// Jurisdiction and property pages are grouped SEPARATELY even though both key
// off `country`. Together they would make /greece and /property-in-greece
// siblings, which is the same mistake the sitemap's own comment warns about:
// it would tell a reader that the Russian version of the buying page is the
// English jurisdiction page.
export async function getSlugMap(): Promise<SlugMap> {
  const [countryDocs, propertyDocs] = await Promise.all([
    sanityFetch<SitemapCountryDoc[]>(SITEMAP_COUNTRY_QUERY, {}, [
      "countryPage",
      "country",
    ]),
    sanityFetch<SitemapCountryDoc[]>(SITEMAP_PROPERTY_QUERY, {}, [
      "propertyPage",
      "country",
    ]),
  ]);

  const map: SlugMap = {};
  addGroup(map, countryDocs);
  addGroup(map, propertyDocs);
  return map;
}
