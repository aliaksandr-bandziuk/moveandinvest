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
  locales: ["en", "ru", "pl"],
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
    "/about": { en: "/about", ru: "/o-nas", pl: "/o-nas" },
    "/for-partners": {
      en: "/for-partners",
      ru: "/partneram",
      pl: "/dla-partnerow",
    },
    "/faq": { en: "/faq", ru: "/voprosy", pl: "/faq" },
    // THE ONE SECTION WHOSE URL IS NOT TRANSLATED, and that is the decision
    // rather than an omission. "Blog" is the same word in Russian and Polish,
    // it is what a reader types, and the section's own NAME on the site is not
    // "blog" at all — it is Guides & Research. Translating the address would
    // produce three spellings of a word that has one, to no one's benefit.
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/contacts": { en: "/contacts", ru: "/kontakty", pl: "/kontakt" },
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
    "/enquiry": { en: "/enquiry", ru: "/zayavka", pl: "/zgloszenie" },
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
    "/calculator": { en: "/calculator", ru: "/kalkulyator", pl: "/kalkulator" },
    "/privacy": { en: "/privacy", ru: "/konfidentsialnost", pl: "/prywatnosc" },
    "/sources": { en: "/sources", ru: "/istochniki", pl: "/zrodla" },
    // The rule-change log. Translated like every other fixed route, and the
    // Russian is transliterated for the reason this file already gives about
    // /ru/gretsiya: a Cyrillic slug percent-encodes the moment anyone pastes
    // it into an email, which is most of how a link to this site travels.
    "/changes": { en: "/changes", ru: "/izmeneniya", pl: "/zmiany" },
    // Internal, noindex, and deliberately the same word everywhere: read by
    // whoever is building the site, not by a reader.
    "/styleguide": "/styleguide",
  },
});

export type Locale = (typeof routing.locales)[number];
