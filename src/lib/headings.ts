// The headings of an article body, and the anchor each one gets.
//
// WHY THE IDS ARE TRANSLITERATED RATHER THAN STRIPPED. The obvious slugifier —
// normalise to NFD, drop the combining marks, keep [a-z0-9-] — is correct for
// Italian or English and produces an EMPTY string for every Russian heading on
// this site, because Cyrillic has no decomposition into ASCII. Twelve headings
// would all slug to "", collide, and the table of contents would link every
// entry to the same place. Polish fails more quietly: ł has no combining form
// either, so "Pełny koszt" becomes "peny-koszt".
//
// So the map below is explicit. It is longer than a regex and it is the reason
// the anchors are readable in all three languages.
//
// WHY NOT THE PORTABLE TEXT _key, which is unique for free: an anchor is a URL
// somebody shares. "#polnaya-stoimost" tells a reader what they are about to
// land on; "#ru-3-12" tells them nothing, and it changes if the Studio ever
// regenerates the block's key.

const CYRILLIC: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/** Latin letters that carry a mark NFD cannot separate. The rest — á, ę, ó,
 *  ü — decompose and are handled by the normalise below. */
const LATIN: Record<string, string> = {
  ł: "l",
  đ: "d",
  ø: "o",
  æ: "ae",
  œ: "oe",
  ß: "ss",
  þ: "th",
};

/** A heading's text as an anchor: lower case, transliterated, hyphenated. */
export function headingSlug(text: string): string {
  const mapped = [...text.toLowerCase()]
    .map((char) => CYRILLIC[char] ?? LATIN[char] ?? char)
    .join("");

  return mapped
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

export interface TocHeading {
  /** The block's own Portable Text _key, so the renderer can put this id on
   *  the right element without slugifying a second time and hoping the two
   *  agree. */
  key: string;
  id: string;
  text: string;
  level: "h2" | "h3";
}

interface HeadingBlock {
  _type?: string;
  _key?: string;
  style?: string;
  children?: { text?: string }[];
}

export function extractHeadings(body: unknown): TocHeading[] {
  if (!Array.isArray(body)) return [];

  const seen = new Map<string, number>();
  const headings: TocHeading[] = [];

  for (const block of body as HeadingBlock[]) {
    if (block?._type !== "block" || !block._key) continue;
    if (block.style !== "h2" && block.style !== "h3") continue;

    const text = block.children?.map((span) => span.text ?? "").join("") ?? "";
    if (!text.trim()) continue;

    // A HEADING THAT SLUGS TO NOTHING STILL GETS AN ANCHOR. "50 000 €" is a
    // legal heading and reduces to "50-000"; a heading of nothing but
    // punctuation reduces to "". Falling back to the key keeps the id unique
    // rather than producing a second empty one that steals the first's link.
    const base = headingSlug(text) || `section-${headings.length + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    headings.push({
      key: block._key,
      id: count === 0 ? base : `${base}-${count + 1}`,
      text,
      level: block.style,
    });
  }

  return headings;
}

/** `_key` → anchor id, for the renderer. */
export function headingIds(headings: TocHeading[]): Record<string, string> {
  return Object.fromEntries(
    headings.map((heading) => [heading.key, heading.id]),
  );
}
