// THE RESIDENCE FORM'S ANSWERS, AS TOKENS, IN THE ORDER THE CHIPS APPEAR.
//
// One list read by two places: the route's allow-list, which drops anything not
// here, and the entry page, which renders a chip per token with its label from
// the message catalogue. When the two kept their own copies, a chip added to the
// form and forgotten in the route would have been posted and silently dropped —
// the failure every other allow-list in the route warns about in a comment.
// Here it cannot happen.
//
// The decode maps in src/lib/enquiry/sender.ts are the third reader and are
// still typed by hand, because they are a Russian sentence per token rather
// than a token; a missing one prints the raw token, which is legible enough.
//
// Tokens are stable. A label can be reworded in the catalogue at any time; a
// token that changed meaning would change the meaning of every stored answer.
export const RESIDENCE_TOKENS = {
  citizenship: ["ua", "by", "ru", "other"],
  status: ["ukr", "card", "pending", "visa", "unsure"],
  matter: ["waiting", "refusal", "cukr", "temporary", "permanent", "citizenship", "other"],
  deadline: ["soon", "months", "none", "unsure"],
} as const;

/** The /sources section whose presence on an entry makes it an entry about
 *  staying in Poland — and therefore ends it with the residence form rather
 *  than the guide block. See the note in blog/[slug]/entry.tsx. */
export const RESIDENCE_SOURCE_KEY = "pl-legal";

// THE COUNTRY AN ENTRY IS ABOUT WHEN IT IS NOT A JURISDICTION OF THE REGISTRY.
//
// Added 15 September 2026 because the first Poland entry named Poland nowhere
// but in its prose: `countries` is empty by design — Poland is a section, not a
// sixth jurisdiction — so the "Jurisdictions" line under the title and on the
// listing card simply did not render, and a reader scanning the list could not
// tell which country a page about "karta pobytu" was about.
//
// Derived from the source section for the same reason the form is: the
// evidence an entry cites is what it is about, and a second field saying so
// would be a second place to disagree. Adding the registry's `country` document
// instead would put Poland in the comparison table, the map, the PDF and the
// footer, which CLAUDE.md rules out.
const REGIONS_BY_SOURCE: Record<string, { code: string; name: Record<"en" | "ru" | "pl", string> }> = {
  [RESIDENCE_SOURCE_KEY]: {
    code: "PL",
    name: { en: "Poland", ru: "Польша", pl: "Polska" },
  },
};

/** Country names, in the reader's language, for the non-registry countries an
 *  entry cites. Empty for every entry about the five jurisdictions. */
export function entryRegionNames(sources: readonly string[], locale: string): string[] {
  const lang = locale === "ru" || locale === "pl" ? locale : "en";
  return sources.flatMap((key) => {
    const region = REGIONS_BY_SOURCE[key];
    return region ? [region.name[lang]] : [];
  });
}

/** The same countries as schema.org Country nodes, English names, for JSON-LD. */
export function entryRegionNodes(sources: readonly string[]) {
  return sources.flatMap((key) => {
    const region = REGIONS_BY_SOURCE[key];
    return region
      ? [{ "@type": "Country" as const, name: region.name.en, identifier: region.code }]
      : [];
  });
}
