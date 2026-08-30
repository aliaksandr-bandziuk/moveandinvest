import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { richBlocks, type PortableContent } from "./copy/portable";
import { LOCALES, type Locale } from "./copy/home";
import { FOOTER_GROUPS } from "../src/lib/footerNav";
import { routing } from "../src/i18n/routing";

// Writes one Guides & Research entry — its three language versions and their
// figures — into Sanity.
//
//   npm run articles -- --entry income-cost-of-living
//   npm run articles -- --entry income-cost-of-living --write
//
// Without --write it parses, converts and validates everything and uploads
// nothing. The entry is named rather than defaulted; see selectEntry.
//
// THE MARKDOWN IN docs/ IS THE SOURCE, not a draft that was then re-typed into
// a copy module. Those three files are what was written, checked against the
// statutes and read end to end; a second copy of 90 000 characters in
// scripts/copy/ would be a second thing to proofread and the first place the
// two would silently disagree. So this parses them.
//
// The header labels are translated ("Slug" / "Язык" / "Sekcje źródeł"), so the
// header is read BY POSITION rather than by label. Each file's first block is
// five lines in a fixed order, and a file that does not match throws here
// rather than writing half a document.
//
// FIGURES ARE PLACED BY A MARKER LINE, "![1]" for the first alt text in the
// metadata block, and the figure that marker resolves to is listed per language
// in the entry's own record below — because the marker index and the file name
// are not the same thing. A localisation may carry a different diagram in the
// same position, or the same three in a different order.

const DOCS = join(import.meta.dirname, "../docs");
// THE SELF-CONTAINED SVGs, not the PNGs beside them. See
// scripts/figures/embed.mjs for the measurement that moved this: the raster
// path resampled every diagram twice and the 12px labels in them showed it.
const FIGURES = join(import.meta.dirname, "../public/figures/web");

/** Everything that is true of one entry and not of the next one.
 *
 *  ONE RECORD PER ENTRY, ADDED RATHER THAN EDITED. Until 28 August 2026 all of
 *  this was six top-level constants, which is fine for exactly one entry and
 *  becomes a copied file on the second. The copy is the failure mode worth
 *  avoiding: two scripts that publish articles will diverge in the part that
 *  converts the body, and the divergence shows up as a malformed document
 *  rather than as an error. */
interface EntryConfig {
  /** THREE THINGS AT ONCE, and they must not drift apart: the stem of each
   *  document's `_id`, the `translationKey` the site groups on, and the id of
   *  the plugin's translation-metadata document. One value so that renaming an
   *  entry cannot rename two of the three. */
  key: string;
  /** The source file per language, under docs/. */
  sources: Record<Locale, string>;
  /** Which figure each marker in each language resolves to, in the order the
   *  alt texts are listed in that file's metadata block. The marker index and
   *  the file name are deliberately not the same thing: a localisation may
   *  carry a different diagram in the same position. */
  figures: Record<Locale, string[]>;
  /** The entry's date on the site. ONE DATE FOR ALL THREE: they are one piece
   *  of work in three languages, and three different dates would tell a reader
   *  the Polish version is newer research when it is the same research. */
  publishedAt: string;
  /** One key from CATEGORY_KEYS, the same for all three. See
   *  src/lib/categories.ts. */
  category: string;
  /** Which jurisdictions the entry concerns. */
  countries: string[];
}

const ENTRIES: Record<string, EntryConfig> = {
  "property-residency": {
    key: "article-property-residency",
    sources: {
      en: "article-en-property-residency.md",
      ru: "article-ru-property-residency.md",
      pl: "article-pl-property-residency.md",
    },
    // The Polish version does not carry the Greek zone diagram — it carries a
    // "who actually needs this" diagram instead, because a Polish reader's
    // problem is not which Greek zone applies to them.
    figures: {
      en: ["qualifies-en", "cost-en", "zones-en"],
      ru: ["qualifies-ru", "cost-ru", "zones-ru"],
      pl: ["qualifies-pl", "who-pl", "cost-pl"],
    },
    publishedAt: "2026-08-27T09:00:00.000Z",
    // "property" and not "rules": the piece is about what a purchase achieves,
    // and the statute changes inside it are the evidence rather than the
    // subject.
    category: "property",
    countries: [
      "country-pt",
      "country-gr",
      "country-mt",
      "country-ae",
      "country-cy",
    ],
  },
  "portugal-residency": {
    key: "article-portugal-residency",
    sources: {
      en: "article-en-portugal-residency.md",
      ru: "article-ru-portugal-residency.md",
      pl: "article-pl-portugal-residency.md",
    },
    // THE SAME THREE DIAGRAMS AND THE SAME ORDER in all three languages, which
    // is unusual for this entry set and worth a note: the Polish version is a
    // different article — a Pole needs none of the routes it describes — but
    // the pictures still carry, because the first one is what he does NOT need
    // and the third is the standard of the pages he will meet in search.
    figures: {
      en: ["pt-routes-en", "pt-clock-en", "pt-published-en"],
      ru: ["pt-routes-ru", "pt-clock-ru", "pt-published-ru"],
      pl: ["pt-routes-pl", "pt-clock-pl", "pt-published-pl"],
    },
    publishedAt: "2026-08-28T12:00:00.000Z",
    // "relocation", not "rules": the statute changes are the material, and what
    // the reader takes away is what moving there involves. This is also the
    // first of the "Moving guides" the footer has been promising since launch.
    category: "relocation",
    // ONE JURISDICTION, and that is the change of shape. The first two entries
    // compared five; this one goes down instead of across, because the search
    // data says the demand is a country plus a number rather than a concept.
    countries: ["country-pt"],
  },
  "income-cost-of-living": {
    key: "article-income-cost-of-living",
    sources: {
      en: "article-en-income-cost-of-living.md",
      ru: "article-ru-income-cost-of-living.md",
      pl: "article-pl-income-cost-of-living.md",
    },
    // THE SAME THREE DIAGRAMS IN ALL THREE LANGUAGES, unlike the first entry,
    // but the Polish version places them in a different order: its article
    // opens on cost of living and reaches the income tests second, so the
    // data-availability table comes first there. The marker index resolves
    // that, which is exactly what this per-language list is for.
    figures: {
      en: ["income-tests-en", "greece-scale-en", "data-age-en"],
      ru: ["income-tests-ru", "greece-scale-ru", "data-age-ru"],
      pl: ["income-tests-pl", "greece-scale-pl", "data-age-pl"],
    },
    publishedAt: "2026-08-28T09:00:00.000Z",
    // "costs" and not "rules": the thresholds are the material, but what the
    // reader takes away is what a route and a country cost them.
    category: "costs",
    countries: [
      "country-pt",
      "country-gr",
      "country-mt",
      "country-ae",
      "country-cy",
    ],
  },
  "greece-residency": {
    key: "article-greece-residency",
    sources: {
      en: "article-en-greece-residency.md",
      ru: "article-ru-greece-residency.md",
      pl: "article-pl-greece-residency.md",
    },
    // THE SAME THREE DIAGRAMS AND THE SAME ORDER IN ALL THREE LANGUAGES, which
    // is worth a note only because the three articles are not the same article.
    // The English one opens on the thresholds, the Russian one on whether its
    // reader may apply at all, and the Polish one on the fact that a Polish
    // reader needs none of this — but all three arrive at the thresholds, at
    // the presence rule and at the three tax regimes, in that order, because
    // that is the order the argument runs in whoever is reading.
    figures: {
      en: ["gr-tiers-en", "gr-presence-en", "gr-tax-en"],
      ru: ["gr-tiers-ru", "gr-presence-ru", "gr-tax-ru"],
      pl: ["gr-tiers-pl", "gr-presence-pl", "gr-tax-pl"],
    },
    publishedAt: "2026-08-28T21:00:00.000Z",
    // "relocation", like the Portuguese guide: this is the second of the moving
    // guides the footer has promised since launch. The statute changes are the
    // material; what the reader takes away is what living there involves.
    category: "relocation",
    countries: ["country-gr"],
  },
  "uae-residency": {
    key: "article-uae-residency",
    sources: {
      en: "article-en-uae-residency.md",
      ru: "article-ru-uae-residency.md",
      pl: "article-pl-uae-residency.md",
    },
    // THE RUSSIAN VERSION PUTS THE TAX DIAGRAM FIRST, and that is the marker
    // index doing its job. The English and Polish versions reach the visa
    // early; the Russian one opens on what an individual actually pays, because
    // for its reader nothing is suspended and the question of eligibility never
    // arises. Same three pictures, a different order.
    figures: {
      en: ["ae-chain-en", "ae-absence-en", "ae-tax-en"],
      ru: ["ae-tax-ru", "ae-chain-ru", "ae-absence-ru"],
      pl: ["ae-chain-pl", "ae-absence-pl", "ae-tax-pl"],
    },
    publishedAt: "2026-08-30T09:00:00.000Z",
    // "rules" and not "relocation", and this is the first entry to earn that
    // category. The others are guides to a decision; this one is about what an
    // instrument says and, for two 2026 changes, about the fact that no
    // instrument says anything at all.
    category: "rules",
    countries: ["country-ae"],
  },
};

/** The entry this run publishes, chosen with `--entry <name>`.
 *
 *  NO DEFAULT, and that is deliberate. A default would mean that a mistyped
 *  name silently republishes the first entry over the one you meant to write,
 *  and `createOrReplace` would not complain. */
// THE FOOTER NAMES ENTRIES BY KEY, AND A TYPO THERE IS INVISIBLE. A footer row
// whose `entry` matches nothing simply stays greyed out and says "soon", which
// is exactly what it looked like before the entry was written — so the failure
// mode of a misspelt key is a promise that silently never gets kept. This runs
// on every invocation, publish or dry run, because it costs nothing.
function checkFooterKeys(): void {
  const known = new Set(Object.values(ENTRIES).map((entry) => entry.key));
  const referenced = FOOTER_GROUPS.flatMap((group) =>
    group.links.map((link) => link.entry).filter((key): key is string => !!key),
  );
  const unknown = referenced.filter((key) => !known.has(key));

  if (unknown.length > 0) {
    throw new Error(
      `src/lib/footerNav.ts references entries that do not exist here: ${unknown.join(", ")}. Known keys: ${[...known].join(", ")}`,
    );
  }
}

// --- Links ------------------------------------------------------------------
//
// TWO HREF FORMS AND NOTHING ELSE, resolved here because this is the only place
// that knows both the locale being written and which entries exist:
//
//   [text](/sources)            a fixed route, from routing.pathnames
//   [text](entry:greece-residency)   another entry in ENTRIES, by its key here
//
// WHY NOT A PLAIN "/blog/some-slug". Because the slug is translated and a
// hand-written one would be right in one language and a 404 in the other two —
// which is the failure this whole file is arranged to make impossible, and the
// one that would be least visible: a dead link inside a 6 000-word guide fails
// silently and forever.
//
// WHY THE LOCALE PREFIX IS BAKED IN. Portable Text renders a plain <a href>;
// nothing on that path goes through next-intl's Link, so nothing adds "/ru".
// English is the default locale and served unprefixed, so it gets none.
//
// WHY EXTERNAL LINKS THROW. See the note at the top of scripts/copy/portable.ts:
// a source named in running text is quotable by an answer engine exactly as it
// stands, and this site's whole position is that its citations are quotable.
// That rule was always right; what was wrong was applying it to internal
// navigation as well.
//
// JURISDICTION PAGES ARE DELIBERATELY NOT LINKABLE YET, and the reason is that
// their slugs live in Sanity rather than in this repo, so resolving one would
// mean a network call — and the dry run's whole value is that it validates
// everything while touching nothing. They are also the pages that need it
// least: the header dropdown and the footer link all five from every page on
// the site, while the entries were linked from nowhere but the footer. When
// this changes it should be a "country:gr" form resolved from the same query
// the sitemap already runs.

/** Every entry's slug in every language, read from the markdown headers rather
 *  than from a table kept beside them. One source, so a slug cannot be renamed
 *  in the file and stay stale in a link. */
function entrySlugs(): Record<string, Record<Locale, string>> {
  const out: Record<string, Record<Locale, string>> = {};
  for (const [name, config] of Object.entries(ENTRIES)) {
    const perLocale = {} as Record<Locale, string>;
    for (const locale of LOCALES) {
      const raw = readFileSync(join(DOCS, config.sources[locale]), "utf8");
      const header = raw
        .split("\n")
        .slice(1, 12)
        .filter((line) => line.startsWith("**"));
      perLocale[locale] = backticked(header[0] ?? "", "slug");
    }
    out[name] = perLocale;
  }
  return out;
}

function makeResolver(locale: Locale, slugs: Record<string, Record<Locale, string>>) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (raw: string): string => {
    if (/^[a-z]+:\/\//i.test(raw) || raw.startsWith("mailto:")) {
      throw new Error(
        `External link "${raw}" in the ${locale} body. Name the source in running text instead — see the note above HrefResolver in scripts/copy/portable.ts.`,
      );
    }

    if (raw.startsWith("entry:")) {
      const name = raw.slice("entry:".length);
      const perLocale = slugs[name];
      if (!perLocale) {
        throw new Error(
          `Link to unknown entry "${name}". Known: ${Object.keys(slugs).join(", ")}`,
        );
      }
      return `${prefix}/blog/${perLocale[locale]}`;
    }

    if (!raw.startsWith("/")) {
      throw new Error(
        `Link href "${raw}" is neither a route (starting "/") nor "entry:<key>".`,
      );
    }

    // A fragment is allowed on a route — /sources#gr is how an entry points at
    // its own working — and is carried through untouched.
    const [path, hash] = raw.split("#", 2);
    const declared = (routing.pathnames as Record<string, unknown>)[path ?? ""];
    if (declared === undefined) {
      throw new Error(
        `Link to "${raw}", which is not a route in src/i18n/routing.ts. A translated slug cannot be written by hand; use entry:<key> for a Guides & Research entry.`,
      );
    }
    if (path?.includes("[")) {
      throw new Error(
        `Link to "${raw}" names a dynamic route. Use entry:<key> instead.`,
      );
    }

    const localised =
      typeof declared === "string"
        ? declared
        : ((declared as Record<string, string>)[locale] ?? (path as string));

    // "/" is the one route whose localised form is a bare slash, and
    // "/ru" + "/" would be "/ru/". The site's canonical form has no trailing
    // slash — see the long note in src/lib/urls.ts about the two spellings.
    const body = localised === "/" ? "" : localised;
    return `${prefix}${body}${hash ? `#${hash}` : ""}` || "/";
  };
}

function selectEntry(): { name: string; config: EntryConfig } {
  const args = process.argv.slice(2);
  const at = args.indexOf("--entry");
  const name = at === -1 ? undefined : args[at + 1];

  if (!name) {
    throw new Error(
      `Which entry? Pass --entry <name>. Known: ${Object.keys(ENTRIES).join(", ")}`,
    );
  }

  const config = ENTRIES[name];
  if (!config) {
    throw new Error(
      `Unknown entry "${name}". Known: ${Object.keys(ENTRIES).join(", ")}`,
    );
  }

  return { name, config };
}

interface Parsed {
  locale: Locale;
  title: string;
  slug: string;
  sources: string[];
  metaTitle: string;
  metaDescription: string;
  standfirst: string;
  alts: string[];
  /** Body segments and the marker indexes between them: segments.length is
   *  always markers.length + 1. */
  segments: string[];
  markers: number[];
}

/** The value inside the first pair of backticks on a line. */
function backticked(line: string, what: string): string {
  const match = /`([^`]+)`/.exec(line);
  if (!match?.[1])
    throw new Error(`Expected a backticked ${what} in: "${line.slice(0, 60)}"`);
  return match[1];
}

function parse(locale: Locale, config: EntryConfig): Parsed {
  const source = config.sources[locale];
  const raw = readFileSync(join(DOCS, source), "utf8");
  const lines = raw.split("\n");

  const title = lines[0]?.replace(/^# /, "").trim();
  if (!title || !lines[0]?.startsWith("# ")) {
    throw new Error(`${source}: first line must be "# <title>".`);
  }

  // The five header lines, in order: slug, language, jurisdictions, source
  // sections, date checked. Read positionally — see the note at the top.
  const header = lines.slice(1, 12).filter((line) => line.startsWith("**"));
  const slug = backticked(header[0] ?? "", "slug");
  const language = (header[1] ?? "").split("**").pop()?.trim();
  if (language !== locale) {
    throw new Error(
      `${source}: header language is "${language}", expected "${locale}".`,
    );
  }
  const sources = (header[3] ?? "")
    .split("**")
    .pop()!
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (sources.length === 0) {
    throw new Error(
      `${source}: no source sections in the header.`,
    );
  }

  // The metadata block: three backticked values in order, then the alt texts as
  // a numbered list. Positional again, and for the same reason.
  const values = lines
    .slice(
      0,
      lines.findIndex((line) => /^!\[|^### /.test(line)),
    )
    .filter((line) => line.trim().startsWith("`"));
  const metaTitle = backticked(values[0] ?? "", "meta title");
  const metaDescription = backticked(values[1] ?? "", "meta description");
  const standfirst = backticked(values[2] ?? "", "excerpt");

  const alts = lines
    .filter((line) => /^\d+\. `/.test(line))
    .map((line) => backticked(line, "alt text"));
  if (alts.length !== config.figures[locale].length) {
    throw new Error(
      `${source}: ${alts.length} alt texts but ${config.figures[locale].length} figures.`,
    );
  }

  // THE BODY IS EVERYTHING BETWEEN THE ARTICLE HEADING AND THE NEXT "## ".
  // The files carry two sections after the body — the keyword sets and the
  // competitor analysis — which are working notes, not the article. Slicing to
  // the next H2 rather than to the end of the file is what keeps them out; if
  // that boundary ever moves, the word count in the dry run moves with it and
  // says so.
  const starts = lines.reduce<number[]>((acc, line, i) => {
    if (line.startsWith("## ")) acc.push(i);
    return acc;
  }, []);
  const bodyStart = starts[1];
  const bodyEnd = starts[2];
  if (bodyStart === undefined || bodyEnd === undefined) {
    throw new Error(
      `${source}: expected at least three "## " headings.`,
    );
  }

  // The article's own headings are one level deeper than the file's, because
  // the file's H1 is the title and its H2s are the file's own sections. Lifted
  // by one so "### Greece" becomes the page's H2 — which is what the schema
  // allows and what the document outline needs.
  // ONE PASS, not two chained replaces. Written as
  // `.replace(/^#### /gm, "### ").replace(/^### /gm, "## ")` it lifted the H4s
  // twice and every subsection came out as an H2 — a body with fifteen H2s and
  // no H3, which is a flattened outline that still looks like an article. The
  // dry run's block-shape line is what showed it.
  // THE SLICE ENDS AT THE NEXT H2, WHICH IS ONE LINE TOO LATE. These files put a
  // "---" rule between the article and the working notes under it, so the rule
  // sits inside the slice — and it reached the published page as a paragraph
  // reading "---". Trimmed here, at the boundary that owns it; the converter
  // now throws if one ever gets past this, so the next time the file's shape
  // changes it fails loudly rather than printing hyphens at the foot of an
  // entry.
  const body = lines
    .slice(bodyStart + 1, bodyEnd)
    .filter((line) => !/^-{3,}$/.test(line.trim()))
    .join("\n")
    .replace(
      /^(#{3,4}) /gm,
      (_, hashes: string) => `${"#".repeat(hashes.length - 1)} `,
    )
    .trim();

  const segments: string[] = [];
  const markers: number[] = [];
  let cursor = 0;
  for (const match of body.matchAll(/^!\[(\d+)\]$/gm)) {
    segments.push(body.slice(cursor, match.index));
    markers.push(Number(match[1]) - 1);
    cursor = match.index + match[0].length;
  }
  segments.push(body.slice(cursor));

  const unknown = markers.find((index) => !alts[index]);
  if (unknown !== undefined) {
    throw new Error(
      `${source}: figure marker ![${unknown + 1}] has no alt text.`,
    );
  }

  return {
    locale,
    title,
    slug,
    sources,
    metaTitle,
    metaDescription,
    standfirst,
    alts,
    segments,
    markers,
  };
}

interface ImageBlock {
  _type: "image";
  _key: string;
  alt: string;
  asset: { _type: "reference"; _ref: string };
}

/** Body segments converted, with the uploaded figures spliced in between. */
function assemble(
  parsed: Parsed,
  assetIds: string[],
  resolveHref: (raw: string) => string,
): (PortableContent | ImageBlock)[] {
  const out: (PortableContent | ImageBlock)[] = [];

  parsed.segments.forEach((segment, i) => {
    if (segment.trim())
      out.push(
        ...richBlocks(segment, `${parsed.locale}-${i}-`, resolveHref),
      );

    const marker = parsed.markers[i];
    if (marker === undefined) return;

    const assetId = assetIds[marker];
    const alt = parsed.alts[marker];
    if (!assetId || !alt)
      throw new Error(`Missing upload for figure ${marker + 1}.`);

    out.push({
      _type: "image",
      _key: `${parsed.locale}-fig${marker}`,
      alt,
      asset: { _type: "reference", _ref: assetId },
    });
  });

  return out;
}

/** What a block is, for the dry run's structure line. A count of paragraphs
 *  and headings is the cheapest way to see that a body converted into the
 *  shape it was written in — a file that suddenly has one 3 000-word paragraph
 *  parsed wrong, and the number says so before anything reaches the dataset. */
function shapeOf(block: PortableContent | ImageBlock): string {
  if (block._type === "image") return "image";
  if (block._type === "table") return "table";
  if (block._type === "faq") return `faq(${block.items.length})`;
  if (block.listItem) return "li";
  return block.style === "normal" ? "p" : block.style;
}

// --- Write -------------------------------------------------------------------

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

async function run() {
  const write = process.argv.slice(2).includes("--write");
  checkFooterKeys();
  const { name, config } = selectEntry();
  const parsedAll = LOCALES.map((locale) => parse(locale, config));
  // Every entry's slug in every language, so a link from this body to another
  // entry resolves without a network call and fails loudly if it cannot.
  const slugs = entrySlugs();

  console.log(`entry: ${name} (translationKey ${config.key})\n`);

  for (const parsed of parsedAll) {
    const words = parsed.segments.join(" ").split(/\s+/).filter(Boolean).length;

    // THE DRY RUN CONVERTS THE BODY TOO. Uploading nine figures and only then
    // discovering that a list chunk or an unclosed bold throws would leave the
    // assets in the dataset with no document referencing them, and the whole
    // point of a dry run is that it exercises the part that can fail. The
    // asset ids are placeholders here; nothing else about the conversion
    // differs.
    const body = assemble(
      parsed,
      config.figures[parsed.locale].map((name) => `image-DRYRUN-${name}`),
      makeResolver(parsed.locale, slugs),
    );

    const count = (kind: string) =>
      body.filter((block) => shapeOf(block) === kind).length;

    // PRINTED BECAUSE IT WAS ZERO AND NOBODY NOTICED. Four entries and about
    // 62 000 words went out with no link between them, and nothing in the
    // output said so — the summary counted paragraphs, tables and figures, all
    // of which were obviously present. A number that is allowed to be zero
    // silently is a number worth putting on screen.
    const links = body.reduce(
      (n, block) =>
        n + ("markDefs" in block ? (block.markDefs?.length ?? 0) : 0),
      0,
    );

    // --links prints every resolved href. Added because "4 links" on the line
    // below proves that four were parsed and nothing about where they point,
    // and a link that resolves to the wrong locale's slug is exactly the
    // failure that would pass every check and reach a reader.
    if (process.argv.slice(2).includes("--links")) {
      for (const block of body) {
        if (!("markDefs" in block)) continue;
        for (const def of block.markDefs ?? []) {
          console.log(`      link  ${def.href}`);
        }
      }
    }

    console.log(
      [
        `${parsed.locale}  ${parsed.title}`,
        `      /blog/${parsed.slug}`,
        `      ${words} words, category: ${config.category}, sources: ${parsed.sources.join(", ")}`,
        `      meta title ${parsed.metaTitle.length} chars, description ${parsed.metaDescription.length} chars`,
        `      ${body.length} blocks: ${count("h2")} h2, ${count("h3")} h3, ${count("p")} paragraphs, ` +
          `${count("li")} list items, ${count("table")} tables, ${count("image")} figures, ` +
          `${links} links, ` +
          `${
            body
              .filter((block) => shapeOf(block).startsWith("faq"))
              .map(shapeOf)
              .join(" ") || "no questions"
          }`,
      ].join("\n"),
    );

    if (parsed.metaTitle.length > 60 || parsed.metaDescription.length > 160) {
      throw new Error(
        `${parsed.locale}: meta title or description is over the limit.`,
      );
    }
    if (count("image") !== config.figures[parsed.locale].length) {
      throw new Error(
        `${parsed.locale}: ${count("image")} figures placed, 3 expected.`,
      );
    }

    // THE FILES ARE CHECKED HERE, not when the upload reaches them. The first
    // real run got through all three summaries and then died on a missing
    // qualifies-en.png — public/figures/ is generated by `npm run figures` and
    // had never been copied to the machine running this. Failing on the fourth
    // language's second figure would have left assets uploaded and no document
    // referencing them; the dry run has to touch everything the write touches.
    const missing = config.figures[parsed.locale].filter(
      (name) => !existsSync(join(FIGURES, `${name}.svg`)),
    );
    if (missing.length > 0) {
      throw new Error(
        `${parsed.locale}: missing ${missing.map((name) => `${name}.svg`).join(", ")} in public/figures/web. Run \`npm run figures\` first.`,
      );
    }
  }

  if (!write) {
    console.log(
      "\nDry run. Nothing written. Re-run with --write to upload and publish.",
    );
    return;
  }

  if (!projectId || !dataset) {
    throw new Error(
      "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
    );
  }
  if (!token) {
    throw new Error(
      "Missing SANITY_API_WRITE_TOKEN. Create a temporary Editor token, run this, then delete it.",
    );
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-15",
    useCdn: false,
    token,
    perspective: "raw",
  });

  const transaction = client.transaction();

  for (const parsed of parsedAll) {
    // Uploaded one at a time and awaited, because the asset id is needed before
    // the body that references it can be assembled. Sanity deduplicates by file
    // hash, so re-running this does not create a second copy of a figure.
    const assetIds: string[] = [];
    for (const name of config.figures[parsed.locale]) {
      const asset = await client.assets.upload(
        "image",
        readFileSync(join(FIGURES, `${name}.svg`)),
        { filename: `${name}.svg` },
      );
      assetIds.push(asset._id);
      console.log(`uploaded ${name}.svg -> ${asset._id}`);
    }

    transaction.createOrReplace({
      _id: `${config.key}-${parsed.locale}`,
      _type: "article",
      language: parsed.locale,
      // The field the language switcher and the sitemap group on. Same value on
      // all three, which is the whole content of the claim "one entry, three
      // languages" as far as the site is concerned.
      translationKey: config.key,
      title: parsed.title,
      slug: { _type: "slug", current: parsed.slug },
      publishedAt: config.publishedAt,
      standfirst: parsed.standfirst,
      category: config.category,
      countries: config.countries.map((id) => ({
        _key: id,
        _type: "reference",
        _ref: id,
      })),
      sources: parsed.sources,
      body: assemble(parsed, assetIds, makeResolver(parsed.locale, slugs)),
      seo: {
        _type: "seo",
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
      },
    });
  }

  // FOR THE STUDIO, AND ONLY FOR THE STUDIO. This is the record
  // @sanity/document-internationalization keeps; without it an editor opening
  // the Russian version has no route to the Polish one and the plugin's own
  // actions do not know the three are related.
  //
  // The SITE no longer reads it, and the comment that used to stand here said it
  // did — that the switcher on /blog/<slug> had nothing to switch to without
  // this document. It had nothing to switch to WITH it, because a visitor
  // holding no token cannot see a document of this type while the articles
  // themselves are readable. That is why every article now carries
  // `translationKey`. Keeping both is not two sources of truth: the field is
  // what the site groups on, this is the Studio's own bookkeeping, and both are
  // written from the entry's `key` in the same transaction.
  transaction.createOrReplace({
    _id: `translation.metadata.${config.key}`,
    _type: "translation.metadata",
    schemaTypes: ["article"],
    translations: LOCALES.map((locale) => ({
      _key: locale,
      _type: "internationalizedArrayReferenceValue",
      value: {
        _type: "reference",
        _ref: `${config.key}-${locale}`,
      },
    })),
  });

  await transaction.commit();
  // PUBLISHED, not drafted. The ids carry no `drafts.` prefix, so these three
  // documents are live the moment this commits and the cache tag revalidates —
  // which is the intent, the text having been read and checked before it got
  // here. Said plainly rather than "open the Studio to publish", because a
  // script that has already published while telling you it has not is how a
  // wrong figure stays up for a day.
  console.log("\nPublished. Live at /blog once the cache tag revalidates.");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
