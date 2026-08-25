import { getPathname } from "@/i18n/navigation";
import { getSiteUrl } from "./site";

// ONE FUNCTION THAT BUILDS AN ABSOLUTE URL FOR A ROUTE. Until 25 Aug 2026 the
// expression `${getSiteUrl()}${getPathname({ href, locale })}` was written out
// by hand in sixteen places — metadata, the sitemap, and every page that emits
// JSON-LD. Sixteen copies of one string is sixteen chances for one of them to
// be normalised differently from the rest, and that is exactly what happened.
//
// THE BUG IT FIXES, found by reading all forty-two live pages rather than the
// code. The home page's canonical, og:url and self-referencing hreflang all
// said `https://www.moveandinvest.com`, while the sitemap said
// `https://www.moveandinvest.com/`. Both were built from the same expression:
// `getPathname({ href: "/", locale: "en" })` returns "/", so both started life
// with the slash — and then Next STRIPPED IT from the metadata and left the
// sitemap alone, because `trailingSlash` defaults to false and that setting is
// applied to canonical and og:url but not to sitemap entries.
//
// (Worth recording that the first diagnosis here was wrong: I assumed
// getPathname returned an empty string for the root and wrote a guard that
// restored the slash — which would have changed nothing, since the slash was
// never missing at this end. Running getPathname and reading what it actually
// returns is what corrected it.)
//
// The two forms are the same address under RFC 3986 and Google normalises them
// together, so nothing was being lost in the index. It is still wrong in the
// way that matters on this site: a project whose entire product is that a
// figure can be traced should not state its own address two ways in one crawl,
// and the next consumer that compares the strings verbatim is not obliged to be
// as forgiving as Google.
//
// THE NO-SLASH FORM WINS, because it is not a choice: Next enforces it on
// canonical and og:url and the only way to change that is `trailingSlash: true`
// across every URL on the site. So the sitemap is made to agree with the
// canonical rather than the other way round. This only ever affects the root —
// every other route has a non-empty path and no trailing slash to begin with.
export function routeUrl(href: string, locale: string): string {
  const path = getPathname({ href, locale });
  return `${getSiteUrl()}${path === "/" ? "" : path}`;
}
