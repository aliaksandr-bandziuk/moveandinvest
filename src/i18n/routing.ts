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
});

export type Locale = (typeof routing.locales)[number];
