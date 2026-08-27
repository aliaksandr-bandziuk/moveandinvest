// What an entry is about. One key, chosen from six, required on every entry.
//
// I ARGUED AGAINST THIS AND THE ARGUMENT HAS EXPIRED. article.ts still carries
// the note explaining why the type had no taxonomy: the sibling project's
// article type has a seven-way category, a second independent one used only for
// filter chips and eighty-six imported tags, and it is shaped by four hundred
// and sixty-eight documents where this one started at two. A filter over two
// entries is furniture that tells a reader the shelf is empty.
//
// That was right about a filter and wrong as a reason to have no label. A
// category is what a reader uses to decide what to read next, and the person
// who came to work out what a route costs is not the person tracking what
// changed in a statute — the two want different entries and the list cannot
// tell them apart without this.
//
// SIX, AND THEY DIVIDE BY SUBJECT RATHER THAN BY GENRE. "Guide" against
// "research" was the other candidate and it is already the section's name; it
// also tells a reader nothing they cannot see from the shape of the piece in
// the first paragraph.
//
// EXACTLY ONE PER ENTRY, required at publish. An entry in three lists is an
// entry nobody can find again, and a piece that genuinely covers two of these
// is usually two pieces.
//
// NO PER-CATEGORY PAGES YET, deliberately. Six routes over three entries is six
// pages with one item on five of them, which is the thin-content pattern search
// engines are built to discount — and it would be this site publishing pages
// that exist to hold a keyword, which is the one thing /blog's own copy
// promises it does not do. The field earns its routes when the lists are long
// enough to be worth opening.

export const CATEGORY_KEYS = [
  "rules",
  "costs",
  "property",
  "taxes",
  "relocation",
  "citizenship",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** English names, for the Studio's own chrome. What a reader sees is
 *  translated — see CATEGORY_LABELS. */
const STUDIO_TITLES: Record<CategoryKey, string> = {
  rules: "Rules — what changed in the law, and when",
  costs: "Costs — what a route actually costs",
  property: "Property — buying, owning, letting",
  taxes: "Taxes — regimes and residency tests",
  relocation: "Relocation — the move itself",
  citizenship: "Citizenship — naturalisation and passports",
};

export const CATEGORY_OPTIONS = CATEGORY_KEYS.map((value) => ({
  value,
  title: STUDIO_TITLES[value],
}));

/** What a reader sees, one word where one word will do. Kept short because it
 *  is set as an eyebrow above a headline, not as a sentence. */
export const CATEGORY_LABELS: Record<string, Record<CategoryKey, string>> = {
  en: {
    rules: "Rules",
    costs: "Costs",
    property: "Property",
    taxes: "Taxes",
    relocation: "Relocation",
    citizenship: "Citizenship",
  },
  ru: {
    rules: "Правила",
    costs: "Стоимость",
    property: "Недвижимость",
    taxes: "Налоги",
    relocation: "Переезд",
    citizenship: "Гражданство",
  },
  pl: {
    rules: "Przepisy",
    costs: "Koszty",
    property: "Nieruchomości",
    taxes: "Podatki",
    relocation: "Przeprowadzka",
    citizenship: "Obywatelstwo",
  },
};

/**
 * The reader-facing name of a category, or undefined.
 *
 * Undefined rather than the key itself for an unknown value: the key is a
 * developer's word, and printing "citizenship" above a Russian headline is
 * worse than printing nothing. The schema requires the field, so the only way
 * to reach undefined is a key removed from this file while documents still
 * carry it — which is a migration, not a rendering problem.
 */
export function categoryLabel(
  key: string | null | undefined,
  locale: string,
): string | undefined {
  if (!key) return undefined;
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.en;
  return labels?.[key as CategoryKey];
}
