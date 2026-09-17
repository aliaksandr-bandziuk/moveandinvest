import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// PERMANENT REDIRECTS FOR THE OTHER SPELLINGS OF A FIXED ROUTE, 17 Sep 2026.
//
// Search Console reported /ru/about, /pl/about, /ru/kontakt and /pl/kontakty
// as redirect errors. The first two are the English slugs these pages had
// until the routes were translated on 26 August; the other two are the
// neighbouring language's spelling. next-intl already sends every one of them
// to the right page — but with a 307, which tells a crawler the move is
// temporary and the old address should be kept. For an address that moved for
// good that is the wrong signal.
//
// So every spelling of a translated route that is NOT this locale's own gets a
// 308 here, and redirects() runs before the proxy, so next-intl never sees
// them. The list is derived from routing.pathnames: renaming a route there
// renames its redirect with it, and nobody has to remember this file.
//
// English is deliberately left out. Its routes are unprefixed and share the
// URL space with the jurisdiction and property slugs of /[slug]; a redirect
// from /o-nas at the root could one day shadow a real page.
//
// A source that is itself a live address in that locale is skipped — /pl/faq
// is both the English spelling and the Polish one — so this can never
// redirect a page away from itself.
function localisedRouteRedirects() {
  const pathnames = routing.pathnames as Record<string, string | Record<string, string>>;
  const localised = Object.entries(pathnames).filter(
    (entry): entry is [string, Record<string, string>] => typeof entry[1] !== "string",
  );
  const redirects: { source: string; destination: string; permanent: true }[] = [];
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    const live = new Set(localised.map(([, spellings]) => spellings[locale]));
    for (const [route, spellings] of localised) {
      const target = spellings[locale];
      if (!target) continue;
      const others = new Set([route, ...Object.values(spellings)]);
      for (const other of others) {
        if (other === target || live.has(other)) continue;
        redirects.push({
          source: `/${locale}${other}`,
          destination: `/${locale}${target}`,
          permanent: true,
        });
      }
    }
  }
  return redirects;
}

const nextConfig: NextConfig = {
  // Pin the workspace root: sibling directories under D:\applications carry
  // their own lockfiles, which would otherwise make Next.js infer the wrong
  // root and resolve modules from a neighbouring project.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // A SLUG CHANGED AFTER PUBLICATION. The first Poland entry went live on the
  // morning of 15 September 2026 at a slug without its main query in it and
  // was renamed the same day, when it was rebuilt around "проверка статуса
  // карты побыту". Hours old, but already in the sitemap, so the old address
  // answers with a permanent redirect rather than a 404.
  async redirects() {
    return [
      {
        source: "/ru/blog/karta-pobytu-dolgo-rassmatrivayut",
        destination: "/ru/blog/status-karty-pobytu",
        permanent: true,
      },
      ...localisedRouteRedirects(),
    ];
  },
};

export default withNextIntl(nextConfig);
