import { NextRequest } from "next/server";
import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";
import proxy from "@/proxy";

// A REPORT, NOT A TEST, and the reason it exists is that `next build` cannot
// run in every environment this project is edited from — next/font cannot
// reach Google Fonts from a sandbox, so the one check that exercises routing
// end to end is sometimes unavailable. This exercises the two things that
// actually decide whether a translated URL works, without a server:
//
//   * getPathname, which every canonical, hreflang alternate, sitemap entry
//     and JSON-LD @id on the site is built from;
//   * the middleware, which is what turns a request for an old URL into a
//     redirect and a request for a new one into the internal route.
//
// Run with: npm run routes
//
// Read the second table as three states. `-> /x` is a redirect and is what an
// OLD url should do. `rewrite -> /x` is the localized url being served by its
// internal route, and is what a NEW url should do. `pass` means the middleware
// had no opinion, which is right for a Sanity page and for any url whose
// spelling does not change in that language.

const BASE = "https://www.moveandinvest.com";
const { getPathname } = createNavigation(routing);

const FIXED = [
  "/",
  "/about",
  "/for-partners",
  "/faq",
  "/contacts",
  "/privacy",
  "/sources",
] as const;

console.log("routes, per locale\n");
for (const href of FIXED) {
  const cells = routing.locales.map(
    (locale) => `${locale}: ${getPathname({ href, locale })}`,
  );
  console.log(`  ${href.padEnd(15)} ${cells.join("   ")}`);
}

console.log("\nmiddleware\n");
const REQUESTS = [
  ...FIXED.flatMap((href) =>
    routing.locales.flatMap((locale) => {
      const localized = getPathname({ href, locale });
      const bare = locale === routing.defaultLocale ? href : `/${locale}${href}`;
      return bare === localized ? [localized] : [bare, localized];
    }),
  ),
  // A Sanity page, which this map does not touch and must not disturb.
  "/ru/gretsiya",
];

for (const path of [...new Set(REQUESTS)]) {
  const response = proxy(new NextRequest(new URL(BASE + path)));
  const location = response.headers.get("location");
  const rewrite = response.headers.get("x-middleware-rewrite");
  const verdict = location
    ? `${response.status} -> ${new URL(location).pathname}`
    : rewrite
      ? `rewrite -> ${new URL(rewrite).pathname}`
      : "pass";
  console.log(`  ${path.padEnd(24)} ${verdict}`);
}
