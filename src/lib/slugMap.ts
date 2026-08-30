import { sanityFetch } from "@/sanity/client";
import {
  BLOG_SITEMAP_QUERY,
  SITEMAP_COUNTRY_QUERY,
  SITEMAP_PROPERTY_QUERY,
} from "@/sanity/queries";
import type { ArticleSitemapDoc, SitemapCountryDoc } from "@/sanity/types";

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
export type SlugLookup = Record<string, SlugSiblings>;

/** TWO LOOKUPS, NOT ONE, because two different routes have a [slug] and their
 *  slug spaces are unrelated. An entry called "greece-raised-the-
 *  threshold" and a jurisdiction page called "greece" live at /blog/... and /...
 *  respectively; one flat map would let a collision between them send a reader
 *  to the wrong section in the wrong language, and the collision would be
 *  invisible until it happened. */
export interface SlugMap {
  /** Jurisdiction and property pages, at the top level. */
  pages: SlugLookup;
  /** Guides & Research entries, under /blog. */
  entries: SlugLookup;
  /** THE SAME ENTRIES, KEYED BY `translationKey` INSTEAD OF BY SLUG, and it
   *  exists for one caller: the footer, which has promised three guides since
   *  launch and could not link them.
   *
   *  A footer link is one value shared by all three locales — that is what
   *  makes /faq work, since the router spells a fixed route per language. An
   *  entry's slug is data and differs per language, so the footer cannot hold
   *  one. What it can hold is the entry's stable key, and this is what turns
   *  that key into the slug for the language being rendered. */
  entriesByKey: SlugLookup;
}

/** What the grouping needs from a document, whatever type it is: which set it
 *  belongs to, which language it is in, and what it is called in that
 *  language. */
interface Localised {
  key?: string | null;
  language?: string | null;
  slug?: string | null;
}

// ONE FUNCTION FOR ALL THREE TYPES, because there was never more than one rule:
// documents that share a value are one page in several languages. There used to
// be two — `addGroup` keyed on a jurisdiction page's `country` reference and
// `addEntries` on the translation-set document the internationalization plugin
// writes — and the second one was the only thing on this site reading that
// document. It read empty for a visitor, because the plugin's bookkeeping is
// not public while the content is; see BLOG_SITEMAP_QUERY. Entries now carry
// their own key, so the two mechanisms are one.
function addGroup(
  map: SlugLookup,
  docs: Localised[],
  byKey?: SlugLookup,
): void {
  // The narrowed shape, because `Required<Localised>` would only drop the `?`
  // and leave `| null` behind — and a null slug used as a key is exactly the
  // state the loop below exists to skip.
  type Complete = { [K in keyof Localised]-?: NonNullable<Localised[K]> };
  const bySet = new Map<string, Complete[]>();

  for (const doc of docs) {
    if (!doc.key || !doc.slug || !doc.language) continue;
    const group = bySet.get(doc.key) ?? [];
    group.push({ key: doc.key, slug: doc.slug, language: doc.language });
    bySet.set(doc.key, group);
  }

  for (const group of bySet.values()) {
    const siblings: SlugSiblings = {};
    for (const doc of group) siblings[doc.language] = doc.slug;
    // Every member points at the same object, so the lookup works from
    // whichever language the reader happens to be standing in.
    for (const doc of group) map[doc.slug] = siblings;
    // And the same object once more under the group's own key, for a caller
    // that knows which entry it wants but not what it is called today.
    if (byKey) {
      const first = group[0];
      if (first) byKey[first.key] = siblings;
    }
  }
}

const byCountry = (doc: SitemapCountryDoc): Localised => ({
  key: doc.countryId,
  language: doc.language,
  slug: doc.slug,
});

const byTranslationKey = (doc: ArticleSitemapDoc): Localised => ({
  key: doc.translationKey,
  language: doc.language,
  slug: doc.slug,
});

// Jurisdiction and property pages are grouped SEPARATELY even though both key
// off `country`. Together they would make /greece and /property-in-greece
// siblings, which is the same mistake the sitemap's own comment warns about:
// it would tell a reader that the Russian version of the buying page is the
// English jurisdiction page.
// Guides & Research entries group on a different value, and the difference is
// worth stating. A jurisdiction page's siblings are derivable from the `country`
// it references — three documents pointing at one country ARE one page in three
// languages, and there is nothing extra to keep in sync. An entry references
// nothing shared, because an entry is not about a country the way a country page
// is: some concern two jurisdictions, some concern none. So an entry carries a
// key of its own instead, written by the script that publishes it.
//
// The defensiveness is real rather than cargo, whichever value is grouped on: an
// entry written only in Russian shares its key with nothing, gets no siblings,
// and correctly offers the reader no link to a page that does not exist.

// FETCHED IN THE LAYOUT, ON EVERY PAGE, which is fine at this size and will not
// be forever. Two jurisdictions' worth of pages and a handful of entries is a
// few dozen rows. The ceiling is the Guides & Research section: at a few hundred entries this
// becomes a few hundred rows loaded to render a header, and the answer then is
// the one the sibling project already uses — every page emits its own hreflang
// alternates into <head> for search engines anyway, so the switcher can read
// them from the document instead of the whole corpus being re-derived here.
// Noted rather than built, because building it now would be machinery for a
// scale this section does not have.
export async function getSlugMap(): Promise<SlugMap> {
  const [countryDocs, propertyDocs, entryDocs] = await Promise.all([
    sanityFetch<SitemapCountryDoc[]>(SITEMAP_COUNTRY_QUERY, {}, [
      "countryPage",
      "country",
    ]),
    sanityFetch<SitemapCountryDoc[]>(SITEMAP_PROPERTY_QUERY, {}, [
      "propertyPage",
      "country",
    ]),
    sanityFetch<ArticleSitemapDoc[]>(BLOG_SITEMAP_QUERY, {}, ["article"]),
  ]);

  const pages: SlugLookup = {};
  addGroup(pages, countryDocs.map(byCountry));
  addGroup(pages, propertyDocs.map(byCountry));

  const entries: SlugLookup = {};
  const entriesByKey: SlugLookup = {};
  addGroup(entries, entryDocs.map(byTranslationKey), entriesByKey);

  return { pages, entries, entriesByKey };
}
