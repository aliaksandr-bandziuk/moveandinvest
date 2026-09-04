import { buildMetadata } from "@/lib/metadata";
import { articleHref, slugHref } from "@/lib/routes";
import type { AppPathname } from "@/lib/routes";
import { routeUrl } from "@/lib/urls";
import { routing } from "@/i18n/routing";

// WHAT EVERY PAGE SAYS ITS OWN ADDRESS IS. A report, like scripts/routes.ts and
// scripts/enquiry-targets.ts, and written for the same reason: `next build`
// cannot run in every environment this project is edited from, so the one thing
// that decides whether forty-odd URLs are one site or three has never been
// checked anywhere but by reading the code.
//
// WHAT IT CHECKS, and each of these has a way of going wrong quietly:
//
//   1. The canonical is the page's OWN url. A canonical pointing somewhere else
//      is a page asking to be dropped from the index, and it is the single most
//      expensive one-line mistake available on a multilingual site.
//   2. The hreflang set names ITSELF. A page missing its own self-reference is
//      the most common hreflang error there is, and Search Console reports it
//      as "no return tag" from the other two languages rather than from here.
//   3. x-default points at the English url, and only when English exists.
//   4. og:url agrees with the canonical, character for character.
//
// WHAT IT CANNOT CHECK, stated so nobody reads a clean run as more than it is.
// The jurisdiction, property and guide pages take their slug from Sanity and
// build their alternates from the documents that actually exist, so their real
// output needs the dataset. What is exercised below for those is the SHAPE —
// one made-up slug through the same helpers — not the live set.
//
// WHAT USED TO BE WRONG HERE, and why the sitemap is no longer compared. The
// home page's canonical said ".../" with no trailing slash while the sitemap
// said ".../" with one, because Next strips it from metadata and leaves the
// sitemap alone. Both now go through routeUrl, which is one function, so the
// two cannot disagree any more — there is nothing left for a script to compare.
// See the note in src/lib/urls.ts.

const SEO = { metaTitle: "t", metaDescription: "d" };

const FIXED: AppPathname[] = [
  "/",
  "/about",
  "/for-partners",
  "/faq",
  "/blog",
  "/contacts",
  "/enquiry",
  "/privacy",
  "/sources",
  "/changes",
  "/calculator",
];

let failures = 0;

function check(label: string, href: AppPathname) {
  console.log(`  ${label}`);

  for (const locale of routing.locales) {
    const meta = buildMetadata({ seo: SEO, locale, href });
    const expected = routeUrl(href, locale);

    const canonical = String(meta.alternates?.canonical ?? "");
    const languages = (meta.alternates?.languages ?? {}) as Record<string, string>;
    const ogUrl = String(meta.openGraph?.url ?? "");

    const problems: string[] = [];
    if (canonical !== expected) problems.push(`canonical ${canonical} != ${expected}`);
    if (languages[locale] !== canonical) {
      problems.push(`no self-reference (hreflang ${locale} = ${languages[locale]})`);
    }
    if (ogUrl !== canonical) problems.push(`og:url ${ogUrl} != canonical`);
    const xDefault = languages["x-default"];
    const english = languages[routing.defaultLocale];
    if (xDefault !== english) {
      problems.push(`x-default ${xDefault} != en ${english}`);
    }

    if (problems.length > 0) failures += problems.length;

    console.log(`    ${locale}  ${canonical}`);
    console.log(
      `        hreflang: ${routing.locales
        .map((l) => `${l}=${languages[l] ?? "(none)"}`)
        .join("  ")}  x-default=${xDefault ?? "(none)"}`,
    );
    for (const problem of problems) console.log(`        ✗ ${problem}`);
  }

  console.log("");
}

console.log("canonical and hreflang, per route and locale\n");

for (const href of FIXED) check(String(href), href);

// The two dataset-slugged shapes. One invented slug, to show the shape the
// helpers produce — the live sets come from the documents.
check('/blog/[slug]  (shape only, slug "example")', articleHref("example"));
check('/[slug]  (shape only, slug "example")', slugHref("example"));

console.log(failures === 0 ? "canonicals: ok" : `canonicals: ${failures} PROBLEM(S)`);
if (failures > 0) process.exitCode = 1;
