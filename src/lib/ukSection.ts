// THE UKRAINIAN SECTION, AS A LIST OF ADDRESSES. Decided 18 September 2026.
//
// uk is a locale of the router and not of the site: it exists for the Poland
// pages that Ukrainian readers search for in Ukrainian (карта побиту 14 800 a
// month against 2 400 for the Russian spelling, measured in
// .dfs/volume-poland-uk-all-2026-09-18.json). Everything else a Ukrainian
// reader can reach — the header, the footer, the jurisdictions, the tools — is
// Russian, and src/proxy.ts sends any /uk/ address NOT on this list to the same
// path under /ru/. The fixed routes spell their uk segment the Russian way in
// src/i18n/routing.ts precisely so that swap is the whole redirect.
//
// A LIST, NOT A LOOKUP, because the proxy runs on every request and must not
// wait for Sanity. The cost is that publishing a Ukrainian entry means adding
// its slug here, and `npm run articles` refuses to publish one that is missing
// — a Ukrainian page this list does not know would be unreachable: its own URL
// would redirect to a Russian 404.

/** Ukrainian Guides & Research entries, served at /uk/blog/<slug>. */
export const UK_RESEARCH_SLUGS: readonly string[] = [
  "karta-pobytu",
  "dokumenty-na-kartu-pobytu",
  "status-karty-pobytu",
  "karta-cukr",
  "pesel-v-polshchi",
  "karta-staloho-pobytu",
  "hromadianstvo-polshchi",
  "yak-vidkryty-firmu-v-polshchi",
  "podatky-v-polshchi",
  "ipoteka-v-polshchi",
];

/** Ukrainian reference (pillar) entries, served at /uk/<slug>. */
export const UK_REFERENCE_SLUGS: readonly string[] = ["legalizatsiia-v-polshchi"];

/** The one fixed route the section has in Ukrainian of its own: the privacy
 *  page, because the residence form's consent links to it. The uk segment is
 *  the Russian spelling — see routing.ts. */
export const UK_FIXED_PATHS: readonly string[] = ["/konfidentsialnost"];

/** The address a Ukrainian reader lands on at /uk itself. The section has no
 *  home page; its pillar is the nearest thing to one. */
export const UK_ENTRY_PATH = `/uk/${UK_REFERENCE_SLUGS[0]}`;

/** Whether a path, with its /uk prefix stripped ("/blog/karta-pobytu"), is a
 *  page the Ukrainian section actually has. */
export function isUkSectionPath(rest: string): boolean {
  const blog = /^\/blog\/([^/]+)$/.exec(rest);
  if (blog) return UK_RESEARCH_SLUGS.includes(blog[1] ?? "");
  const root = /^\/([^/]+)$/.exec(rest);
  if (root && UK_REFERENCE_SLUGS.includes(root[1] ?? "")) return true;
  return UK_FIXED_PATHS.includes(rest);
}
