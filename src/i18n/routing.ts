import { defineRouting } from "next-intl/routing";

// English is the default and is served unprefixed: the first audience for
// this site is partner-facing (immigration and tax firms in Greece and
// Portugal), and every outbound link in the first partner emails points at
// an English URL with no locale segment.
//
// ru and pl are declared from day one so that routing, hreflang and the
// Sanity translation pairs are all in place before any translated content
// exists. Declaring a locale costs nothing; retrofitting one after the URL
// structure is indexed costs redirects.
export const routing = defineRouting({
  // uk added 18 September 2026 for the Poland section ONLY — see RouteLocale
  // below and the uk rule in src/proxy.ts. Its URL segments reuse the Russian
  // spellings, so /uk/<route> is /ru/<route> with the prefix swapped.
  locales: ["en", "ru", "pl", "uk"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // URL structure alone decides the locale — no cookie or Accept-Language
  // negotiation. Deterministic for crawlers and for static caching, and it
  // keeps a Warsaw-based visitor from being silently redirected away from
  // the English page a partner just linked to.
  localeDetection: false,

  // TRANSLATED URLS FOR THE FIXED ROUTES, since 26 August 2026.
  //
  // Until then this block did not exist, and the consequence was visible from
  // outside: /ru/gretsiya sat next to /ru/about. The country pages take their
  // slug from the Sanity document, one per language, so they were translated
  // from the start; the service pages are file-system routes, and without a map
  // next-intl simply prefixes the English segment. Half a translated site.
  //
  // The keys are the INTERNAL routes — they match the folder names under
  // src/app/[locale], and they are what every `Link href` in this codebase is
  // written against. Nothing outside this file needs to know that /faq is
  // /ru/voprosy: the router does the substitution for links, canonicals,
  // hreflang, the sitemap and the JSON-LD @id alike, because all of those go
  // through getPathname.
  //
  // WHY TRANSLITERATION AND NOT CYRILLIC. Cyrillic slugs work, and Yandex is
  // happy with them, but they percent-encode the moment anyone copies one into
  // an email or a chat — which is most of how a link to this site travels. The
  // jurisdiction pages already settled this, /ru/gretsiya rather than the
  // Cyrillic, and a second convention in the same URL space would be worse than
  // either one on its own.
  //
  // WHY /pl/faq STAYS "faq". Not an untranslated leftover: FAQ is the ordinary
  // Polish word for this page and Polish sites use it in preference to
  // "pytania i odpowiedzi". Russian is the opposite case — there it reads as
  // jargon, so it becomes "voprosy".
  //
  // ADDING A ROUTE MEANS ADDING IT HERE. With this map in place next-intl types
  // `Link href` against its keys, so a route missing from it is a compile error
  // at the first link to it rather than a 404 in one language.
  pathnames: {
    "/": "/",
    "/[slug]": "/[slug]",
    "/about": { en: "/about", ru: "/o-nas", pl: "/o-nas", uk: "/o-nas" },
    "/for-partners": {
      en: "/for-partners",
      ru: "/partneram",
      pl: "/dla-partnerow",
      uk: "/partneram",
    },
    "/faq": { en: "/faq", ru: "/voprosy", pl: "/faq", uk: "/voprosy" },
    // The explainer. Transliterated in Russian for the reason stated above —
    // a Cyrillic slug percent-encodes the moment anyone pastes it into a chat,
    // which is most of how a link to this site travels.
    "/golden-visa": {
      en: "/golden-visa",
      ru: "/zolotaya-viza",
      pl: "/zlota-wiza",
      uk: "/zolotaya-viza",
    },
    // THE ONE SECTION WHOSE URL IS NOT TRANSLATED, and that is the decision
    // rather than an omission. "Blog" is the same word in Russian and Polish,
    // it is what a reader types, and the section's own NAME on the site is not
    // "blog" at all — it is Guides & Research. Translating the address would
    // produce three spellings of a word that has one, to no one's benefit.
    "/blog": "/blog",
    // PAGE TWO ONWARDS OF THE LISTING. A path segment rather than ?page=2:
    // reading searchParams in a server component makes the route dynamic for
    // every visitor, which is what the rendering rule in CLAUDE.md forbids.
    // Page one stays at /blog and is never /blog/page/1.
    "/blog/page/[page]": "/blog/page/[page]",
    "/blog/[slug]": "/blog/[slug]",
    "/contacts": { en: "/contacts", ru: "/kontakty", pl: "/kontakt", uk: "/kontakty" },
    // THE ENQUIRY, WITH AN ADDRESS OF ITS OWN since 31 August 2026.
    //
    // It was a fragment before that — section 08 of the home page, reached as
    // "/#enquiry" — and the header button, the footer link and every
    // jurisdiction page's call to action all pointed at it. From anywhere other
    // than the home page that is a full page load landing a reader eight
    // sections down a document they did not ask for, with the form's own head
    // already scrolled past.
    //
    // A fragment also cannot carry its own title, cannot be counted separately
    // from the home page, cannot be given to a partner firm as "this is the
    // page your leads come from", and has no room to say what happens after the
    // button is pressed — which is the one thing a reader deciding whether to
    // press it wants to know.
    //
    // THE HOME PAGE KEEPS ITS SECTION. Two mount points of one component, with
    // one route handler behind them, is not the duplication worth avoiding: a
    // reader who has just come through eight sections is the highest intent on
    // the site, and making them click first would be paying for tidiness in
    // leads.
    "/enquiry": { en: "/enquiry", ru: "/zayavka", pl: "/zgloszenie", uk: "/zayavka" },
    // THE CALCULATOR, 2 September 2026. Its own address rather than a section
    // of the home page: a tool is the thing other people link to, and a
    // fragment cannot carry a title, be counted separately, or be handed to a
    // partner firm as the page their leads read.
    //
    // Transliterated in Russian for the reason this file already gives about
    // /ru/gretsiya — a Cyrillic slug percent-encodes the moment anyone pastes
    // it into a message, which is most of how a link to a calculator travels.
    // The Polish takes its own spelling: "kalkulator" is the word, and
    // borrowing the Russian transliteration would produce a slug that is
    // neither language's.
    "/calculator": { en: "/calculator", ru: "/kalkulyator", pl: "/kalkulator", uk: "/kalkulyator" },
    // THE NATURALISATION CLOCK, 7 September 2026. Its own address for the same
    // reason the calculator has one: a tool is the thing other people link to,
    // and this is the first tool on the site that answers a question about a
    // DATE rather than a price.
    //
    // The Russian is transliterated, as everywhere else here. The Polish takes
    // its own word — "zegar" is the word, and borrowing the transliteration
    // would give a slug that is neither language's.
    "/naturalisation-clock": {
      en: "/naturalisation-clock",
      ru: "/chasy-naturalizatsii",
      pl: "/zegar-naturalizacji",
      uk: "/chasy-naturalizatsii",
    },
    // THE TRANSFER-TAX CALCULATOR, 9 September 2026. Third tool, third address,
    // and the reason it has one is not the reason the other two do.
    //
    // THIS ONE IS NOT A SEARCH PLAY. `portugal imt calculator` and every
    // sibling phrase return zero across all four keyword waves, and the plan
    // cancelled the item on that number on 7 September. The number was right
    // and it was the wrong number: the note at the head of
    // src/app/[locale]/calculator/page.tsx already records that a competitor's
    // transfer-tax calculator "is a page, and it is the page their
    // competitors' articles cite". A citable tool earns LINKS, and links are
    // the binding constraint on everything else this site does.
    //
    // Which makes the address the product. A section of another page cannot be
    // cited, and a tool nobody can link to cannot relieve the constraint it
    // exists to relieve.
    //
    // The Russian is transliterated, as everywhere else in this file. The
    // Polish takes its own words.
    "/property-transfer-tax-calculator": {
      en: "/property-transfer-tax-calculator",
      ru: "/kalkulyator-naloga-pri-pokupke",
      pl: "/kalkulator-podatku-od-zakupu",
      uk: "/kalkulyator-naloga-pri-pokupke",
    },
    "/privacy": { en: "/privacy", ru: "/konfidentsialnost", pl: "/prywatnosc", uk: "/konfidentsialnost" },
    "/sources": { en: "/sources", ru: "/istochniki", pl: "/zrodla", uk: "/istochniki" },
    // The rule-change log. Translated like every other fixed route, and the
    // Russian is transliterated for the reason this file already gives about
    // /ru/gretsiya: a Cyrillic slug percent-encodes the moment anyone pastes
    // it into an email, which is most of how a link to this site travels.
    "/changes": { en: "/changes", ru: "/izmeneniya", pl: "/zmiany", uk: "/izmeneniya" },
    // Internal, noindex, and deliberately the same word everywhere: read by
    // whoever is building the site, not by a reader.
    "/styleguide": "/styleguide",
  },
});

/** Every locale the router serves, uk included. */
export type RouteLocale = (typeof routing.locales)[number];

/**
 * The locales the WHOLE site is written in. uk is deliberately not one of them:
 * it serves only the Poland section (the Poland entries, their pillar and the
 * privacy page), and everything else under /uk/ is redirected to /ru/ by the
 * proxy. Keeping it out of this type is what keeps the 27 Record<Locale, …>
 * copy maps from needing a Ukrainian site they are not going to get.
 */
export type Locale = Exclude<RouteLocale, "uk">;

/** The site locales, as a value. Iterate THIS, not routing.locales, anywhere a
 *  route is assumed to exist in every language — hreflang for a fixed route,
 *  the sitemap's code-owned routes. routing.locales includes uk, and a fixed
 *  route under /uk/ is a redirect, not a page. */
export const SITE_LOCALES = ["en", "ru", "pl"] as const satisfies readonly Locale[];

export function isSiteLocale(locale: string): locale is Locale {
  return locale === "en" || locale === "ru" || locale === "pl";
}

/** The language a page's SITE-WIDE content is read in: the header, the
 *  footer, the registry labels, the author line. A site locale reads itself;
 *  uk reads Russian, because every page those parts link to is Russian for a
 *  Ukrainian reader — see the proxy. Anything else (which the middleware does
 *  not let through) reads English. */
export function contentLocale(locale: string): Locale {
  if (isSiteLocale(locale)) return locale;
  return locale === "uk" ? "ru" : "en";
}
