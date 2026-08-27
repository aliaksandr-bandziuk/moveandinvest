import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { richBlocks, type PortableContent } from "./copy/portable";
import { LOCALES, type Locale } from "./copy/home";

// Writes the three Guides & Research entries and their figures into Sanity.
//
//   npm run articles            # parse, validate, upload nothing
//   npm run articles -- --write # upload the figures and write the documents
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
// metadata block, and the figure it resolves to is listed per language below.
// The Polish version does not carry the Greek zone diagram — it carries a
// "who actually needs this" diagram instead, because a Polish reader's problem
// is not which Greek zone applies to them — so the marker index and the file
// name cannot be the same thing.

const DOCS = join(import.meta.dirname, "../docs");
// THE SELF-CONTAINED SVGs, not the PNGs beside them. See
// scripts/figures/embed.mjs for the measurement that moved this: the raster
// path resampled every diagram twice and the 12px labels in them showed it.
const FIGURES = join(import.meta.dirname, "../public/figures/web");

/** Which figure each marker in each language resolves to, in the order the alt
 *  texts are listed in that file's metadata block. */
const FIGURE_FILES: Record<Locale, string[]> = {
  en: ["qualifies-en", "cost-en", "zones-en"],
  ru: ["qualifies-ru", "cost-ru", "zones-ru"],
  pl: ["qualifies-pl", "who-pl", "cost-pl"],
};

const SOURCE_FILE: Record<Locale, string> = {
  en: "article-en-property-residency.md",
  ru: "article-ru-property-residency.md",
  pl: "article-pl-property-residency.md",
};

/** The entry's date on the site. One date for all three: they are one piece of
 *  work in three languages, and three different dates would tell a reader the
 *  Polish version is newer research when it is the same research. */
const PUBLISHED_AT = "2026-08-27T09:00:00.000Z";

/** What ties the three documents together, and the one place it is written.
 *
 *  It is THREE THINGS AT ONCE and they must not be allowed to drift apart: the
 *  stem of each document's `_id`, the `translationKey` the site groups on, and
 *  the id of the plugin's translation-metadata document. The key used to be
 *  implied by the metadata document alone, which the site could not read; it is
 *  now a field, and a constant here rather than three string literals so that
 *  renaming the entry cannot rename two of the three. */
const ENTRY = "article-property-residency";

/** ONE CATEGORY FOR ALL THREE, because they are one entry in three languages
 *  rather than three entries. "property" and not "rules": the piece is about
 *  what a purchase achieves, and the statute changes inside it are the evidence
 *  for that rather than the subject. See src/lib/categories.ts. */
const CATEGORY = "property";

const COUNTRY_IDS = [
  "country-pt",
  "country-gr",
  "country-mt",
  "country-ae",
  "country-cy",
];

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

function parse(locale: Locale): Parsed {
  const raw = readFileSync(join(DOCS, SOURCE_FILE[locale]), "utf8");
  const lines = raw.split("\n");

  const title = lines[0]?.replace(/^# /, "").trim();
  if (!title || !lines[0]?.startsWith("# ")) {
    throw new Error(`${SOURCE_FILE[locale]}: first line must be "# <title>".`);
  }

  // The five header lines, in order: slug, language, jurisdictions, source
  // sections, date checked. Read positionally — see the note at the top.
  const header = lines.slice(1, 12).filter((line) => line.startsWith("**"));
  const slug = backticked(header[0] ?? "", "slug");
  const language = (header[1] ?? "").split("**").pop()?.trim();
  if (language !== locale) {
    throw new Error(
      `${SOURCE_FILE[locale]}: header language is "${language}", expected "${locale}".`,
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
      `${SOURCE_FILE[locale]}: no source sections in the header.`,
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
  if (alts.length !== FIGURE_FILES[locale].length) {
    throw new Error(
      `${SOURCE_FILE[locale]}: ${alts.length} alt texts but ${FIGURE_FILES[locale].length} figures.`,
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
      `${SOURCE_FILE[locale]}: expected at least three "## " headings.`,
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
      `${SOURCE_FILE[locale]}: figure marker ![${unknown + 1}] has no alt text.`,
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
): (PortableContent | ImageBlock)[] {
  const out: (PortableContent | ImageBlock)[] = [];

  parsed.segments.forEach((segment, i) => {
    if (segment.trim())
      out.push(...richBlocks(segment, `${parsed.locale}-${i}-`));

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
  const parsedAll = LOCALES.map(parse);

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
      FIGURE_FILES[parsed.locale].map((name) => `image-DRYRUN-${name}`),
    );

    const count = (kind: string) =>
      body.filter((block) => shapeOf(block) === kind).length;

    console.log(
      [
        `${parsed.locale}  ${parsed.title}`,
        `      /blog/${parsed.slug}`,
        `      ${words} words, category: ${CATEGORY}, sources: ${parsed.sources.join(", ")}`,
        `      meta title ${parsed.metaTitle.length} chars, description ${parsed.metaDescription.length} chars`,
        `      ${body.length} blocks: ${count("h2")} h2, ${count("h3")} h3, ${count("p")} paragraphs, ` +
          `${count("li")} list items, ${count("table")} tables, ${count("image")} figures, ` +
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
    if (count("image") !== FIGURE_FILES[parsed.locale].length) {
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
    const missing = FIGURE_FILES[parsed.locale].filter(
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
    for (const name of FIGURE_FILES[parsed.locale]) {
      const asset = await client.assets.upload(
        "image",
        readFileSync(join(FIGURES, `${name}.svg`)),
        { filename: `${name}.svg` },
      );
      assetIds.push(asset._id);
      console.log(`uploaded ${name}.svg -> ${asset._id}`);
    }

    transaction.createOrReplace({
      _id: `${ENTRY}-${parsed.locale}`,
      _type: "article",
      language: parsed.locale,
      // The field the language switcher and the sitemap group on. Same value on
      // all three, which is the whole content of the claim "one entry, three
      // languages" as far as the site is concerned.
      translationKey: ENTRY,
      title: parsed.title,
      slug: { _type: "slug", current: parsed.slug },
      publishedAt: PUBLISHED_AT,
      standfirst: parsed.standfirst,
      category: CATEGORY,
      countries: COUNTRY_IDS.map((id) => ({
        _key: id,
        _type: "reference",
        _ref: id,
      })),
      sources: parsed.sources,
      body: assemble(parsed, assetIds),
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
  // written from ENTRY above in the same transaction.
  transaction.createOrReplace({
    _id: `translation.metadata.${ENTRY}`,
    _type: "translation.metadata",
    schemaTypes: ["article"],
    translations: LOCALES.map((locale) => ({
      _key: locale,
      _type: "internationalizedArrayReferenceValue",
      value: {
        _type: "reference",
        _ref: `${ENTRY}-${locale}`,
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
