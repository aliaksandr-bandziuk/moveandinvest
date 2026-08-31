import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { articleHref, slugHref } from "@/lib/routes";
import type { AppPathname } from "@/lib/routes";
import { routeUrl } from "@/lib/urls";
import { sanityFetchPublished } from "@/sanity/client";
import {
  BLOG_SITEMAP_QUERY,
  SITEMAP_COUNTRY_QUERY,
  SITEMAP_PROPERTY_QUERY,
  SITEMAP_SINGLETON_QUERY,
} from "@/sanity/queries";
import type {
  ArticleSitemapDoc,
  SitemapCountryDoc,
  SitemapDoc,
} from "@/sanity/types";

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
  /** Locale-independent route, exactly as `routeUrl` expects it. */
  href: AppPathname;
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
  { href: "/changes", documentType: "changesPage" },
  { href: "/faq", documentType: "faqPage" },
  { href: "/blog", documentType: "blogPage" },
  { href: "/contacts", documentType: "contactsPage" },
  { href: "/enquiry", documentType: "enquiryPage" },
  { href: "/privacy", documentType: "privacyPage" },
];

function isLocale(value: unknown): value is (typeof routing.locales)[number] {
  return typeof value === "string" && routing.locales.includes(value as never);
}

// ITS OWN TIME FLOOR, because the sitemap sits outside the [locale] tree and
// inherits nothing from that layout's `revalidate`. Without one it had the same
// hole every other page had: cached at build, refreshed only by a webhook, and
// therefore silently missing an entry that published itself by the clock.
//
// AN HOUR, NOT A MINUTE. A crawler fetches this on its own schedule and would
// not notice the difference; the pages themselves are what a reader sees, and
// they carry the shorter floor.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [results, countryDocs, propertyDocs, articleDocs] = await Promise.all([
    Promise.all(
      ROUTES.map((route) =>
        sanityFetchPublished<SitemapDoc[]>(
          SITEMAP_SINGLETON_QUERY,
          { documentType: route.documentType },
          [route.documentType],
        ).then((docs) => ({ route, docs })),
      ),
    ),
    sanityFetchPublished<SitemapCountryDoc[]>(SITEMAP_COUNTRY_QUERY, {}, [
      "countryPage",
    ]),
    sanityFetchPublished<SitemapCountryDoc[]>(SITEMAP_PROPERTY_QUERY, {}, [
      "propertyPage",
    ]),
    sanityFetchPublished<ArticleSitemapDoc[]>(BLOG_SITEMAP_QUERY, {}, [
      "article",
    ]),
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
    const indexable = docs.filter(
      (doc) => isLocale(doc.language) && doc.noIndex !== true,
    );
    if (indexable.length === 0) continue;

    const languages: Record<string, string> = Object.fromEntries(
      indexable.map((doc) => [
        doc.language as string,
        routeUrl(route.href, doc.language as string),
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
        url: routeUrl(route.href, doc.language as string),
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
      if (
        !doc.countryId ||
        !doc.slug ||
        !isLocale(doc.language) ||
        doc.noIndex === true
      )
        continue;
      const group = byCountry.get(doc.countryId) ?? [];
      group.push(doc);
      byCountry.set(doc.countryId, group);
    }

    for (const group of byCountry.values()) {
      const languages: Record<string, string> = Object.fromEntries(
        group.map((doc) => [
          doc.language as string,
          routeUrl(slugHref(doc.slug as string), doc.language as string),
        ]),
      );

      const defaultUrl = languages[routing.defaultLocale];
      if (defaultUrl) {
        languages["x-default"] = defaultUrl;
      }

      for (const doc of group) {
        entries.push({
          url: routeUrl(slugHref(doc.slug as string), doc.language as string),
          lastModified: doc._updatedAt,
          alternates: { languages },
        });
      }
    }
  };

  addGrouped(countryDocs);
  addGrouped(propertyDocs);

  // --- Guides & Research entries ---------------------------------------------
  // Grouped on the entry's own `translationKey` rather than on a shared
  // reference, because there is no shared reference to group on: an entry is not
  // about a country the way a country page is, and one written only in Russian
  // is a legitimate document rather than a missing translation. An entry sharing
  // its key with nothing stands alone and gets no hreflang, which is the
  // truthful thing to publish.
  //
  // It was grouped on the translation-metadata document until 27 August 2026,
  // and that read empty for everyone who was not holding a token — so this
  // sitemap published the three translations of one entry as three unrelated
  // URLs, telling search engines the opposite of what is true. Same cause as the
  // dead language switcher; see BLOG_SITEMAP_QUERY.
  const bySet = new Map<string, ArticleSitemapDoc[]>();
  const solo: ArticleSitemapDoc[] = [];

  for (const doc of articleDocs) {
    // noIndex EXCLUDES THE ENTRY ENTIRELY, from the list and from every
    // sibling's hreflang set — the same rule the two loops above hold, and the
    // one this loop was missing until 27 August 2026. An entry held out of the
    // index while being listed here tells a crawler two opposite things about
    // one URL, and Search Console reports the pair as an error rather than
    // picking one.
    if (!doc.slug || !isLocale(doc.language) || doc.noIndex === true) continue;
    if (!doc.translationKey) {
      solo.push(doc);
      continue;
    }
    const group = bySet.get(doc.translationKey) ?? [];
    group.push(doc);
    bySet.set(doc.translationKey, group);
  }

  for (const group of bySet.values()) {
    const languages: Record<string, string> = Object.fromEntries(
      group.map((doc) => [doc.language, routeUrl(articleHref(doc.slug), doc.language)]),
    );

    const defaultUrl = languages[routing.defaultLocale];
    if (defaultUrl) {
      languages["x-default"] = defaultUrl;
    }

    for (const doc of group) {
      entries.push({
        url: routeUrl(articleHref(doc.slug), doc.language),
        lastModified: doc._updatedAt,
        alternates: { languages },
      });
    }
  }

  for (const doc of solo) {
    entries.push({
      url: routeUrl(articleHref(doc.slug), doc.language),
      lastModified: doc._updatedAt,
    });
  }

  return entries;
}
