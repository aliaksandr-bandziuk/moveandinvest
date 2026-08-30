// Turns a plain string into Portable Text blocks.
//
// It exists because the alternative is writing copy as JSON. A Portable Text
// block is nine keys of scaffolding around one sentence, and a file of twelve
// jurisdiction bodies written that way is a file nobody proofreads — which for
// a site whose position is "the figures are checked" is the wrong file to make
// unreadable.
//
// The input is deliberately tiny, not Markdown:
//
//   "## " at the start of a line  -> an h2
//   "### "                        -> an h3
//   a blank line                  -> a new block
//   a run of lines starting "|"   -> a table, first row the header
//
// No bold, no italics. Not an oversight: the schema allows both and neither
// earns its complexity in page copy.
//
// LINKS: THE RULE WAS RIGHT AND ITS SCOPE WAS WRONG. What stood here said "no
// inline links", reasoning that a source named in running text — "art. 100 of
// Law 5038/2023" — is quotable by an answer engine exactly as it stands, and a
// link is not. That argument is sound and it survives: richBlocks() below
// REFUSES an external href, so a citation can still only be named, never
// linked.
//
// But the argument is about citations, and the rule it produced covered every
// link there is. The cost was measured on 29 August 2026: four entries, about
// 62 000 words, and zero links between them. The Greek guide did not point at
// the Portuguese one, the cost-of-living entry compared five jurisdictions and
// led to none of them, and the only thing joining the four was three rows in
// the footer. For a site with almost no inbound links, internal linking is the
// main way authority reaches a deep page at all — and it is also just how a
// reader gets from one guide to the next.
//
// So richBlocks() now accepts "[text](/sources)" and "[text](entry:key)" and
// nothing else, resolved by the caller, which is the only party that knows
// what locale it is writing and which entries exist. blocks() still refuses
// every link, because page copy has a nav.
//
// Keys are derived from the position rather than random, so running this twice
// on unchanged copy produces byte-identical documents and Sanity records no
// spurious revision. Math.random() here would make every content run look like
// an edit.
//
// ONE TRANSFORMATION IS APPLIED TO THE TEXT: a space between two digits
// becomes a non-breaking space. Russian and Polish group thousands with a
// space, so "€100 000" is a single number containing a break opportunity, and
// at 390px it duly broke — "€100" ended one line and "000 в год" began the
// next. English is unaffected because it groups with a comma. Caught by
// screenshotting the rendered page at mobile width; nothing in the type
// system or the linter can see it.

import { tightenNumbers } from "./typography";

export interface PortableRow {
  _key: string;
  cells: string[];
}

export interface PortableTable {
  _type: "table";
  _key: string;
  caption?: string;
  rows: PortableRow[];
}

/** One inline link, referenced by a span's `marks` through its `_key`. Matches
 *  the schema's linkAnnotation exactly — see
 *  src/sanity/schemaTypes/objects/linkAnnotation.ts, which the renderer in
 *  ArticleBody already handles. Nothing new had to be built at either end; the
 *  only piece missing was this converter. */
export interface PortableMarkDef {
  _type: "link";
  _key: string;
  href: string;
}

export interface PortableBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3";
  markDefs: PortableMarkDef[];
  children: PortableSpan[];
  /** Set only by richBlocks(). Portable Text has no list container — a list is
   *  a run of sibling blocks that share this. */
  listItem?: "bullet" | "number";
  level?: number;
}

// A chunk whose first line starts with a pipe. Markdown's own alignment row
// ("| --- |") is dropped rather than rendered: it carries no content, and the
// schema decides that the first row is the header, so there is nothing for it to
// say. A caption is the line immediately above the table, written as "^ ...".
function toTable(chunk: string, key: string): PortableTable | null {
  const lines = chunk
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const caption = lines[0]?.startsWith("^")
    ? lines.shift()?.slice(1).trim()
    : undefined;
  if (!lines.length || !lines[0]?.startsWith("|")) return null;

  const rows = lines
    .filter((line) => !/^\|[\s:|-]+\|$/.test(line))
    .map((line, i) => ({
      _key: `${key}r${i}`,
      cells: line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => tightenNumbers(cell.trim())),
    }));

  if (rows.length < 2) return null;

  // RAGGED ROWS THROW HERE, not at publish time. The schema also rejects them,
  // but a script that writes a broken table into the dataset and leaves an
  // editor to discover it in the Studio has moved the problem rather than
  // caught it — and this file is where the table is actually written.
  const width = rows[0]?.cells.length ?? 0;
  const bad = rows.findIndex((row) => row.cells.length !== width);
  if (bad !== -1) {
    throw new Error(
      `Table "${caption ?? rows[0]?.cells.join(" | ")}": row ${bad + 1} has ${rows[bad]?.cells.length} cells, header has ${width}.`,
    );
  }

  return { _type: "table", _key: key, ...(caption ? { caption } : {}), rows };
}

export interface PortableFaqItem {
  _key: string;
  question: string;
  answer: string;
}

export interface PortableFaq {
  _type: "faq";
  _key: string;
  items: PortableFaqItem[];
}

/** A run of text carrying zero or more decorators. `marks` is a plain string
 *  array rather than the empty tuple it used to be: the article bodies are the
 *  first copy on this site with bold in them. */
export interface PortableSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

/** What the converters return: a paragraph, a heading, a list item, or a
 *  table. Exported as one name so a caller that only pipes the result into a
 *  document never has to care which, and so adding a fourth kind later widens
 *  one type rather than every copy file. */
export type PortableContent = PortableBlock | PortableTable | PortableFaq;

// --- Shared plumbing ---------------------------------------------------------

// A CAPTION IS ALLOWED TO SIT A BLANK LINE ABOVE ITS TABLE. Writing it hard
// against the header row is what the format says; leaving a blank line there is
// what a person actually types, and I typed it myself on the first try. Without
// this the caption chunk falls through to the paragraph branch and the page
// renders a line reading "^Пороги по зонам" — an authoring slip that looks like
// content, which is the class of failure this file exists to refuse. So the two
// chunks are joined here, and a "^" line that is NOT above a table throws.
function chunksOf(source: string): string[] {
  return source
    .trim()
    .split(/\n\s*\n/)
    .reduce<string[]>((acc, chunk) => {
      const previous = acc[acc.length - 1];
      if (previous?.trim().startsWith("^") && chunk.trim().startsWith("|")) {
        acc[acc.length - 1] = `${previous.trim()}\n${chunk.trim()}`;
        return acc;
      }
      acc.push(chunk);
      return acc;
    }, []);
}

/** A chunk that is a table, or null. Shared so both converters treat "^" and
 *  ragged rows identically. */
function asTable(trimmed: string, key: string): PortableTable | null {
  const firstContentLine = trimmed.replace(/^\^[^\n]*\n\s*/, "");
  if (firstContentLine.startsWith("|")) return toTable(trimmed, key);

  if (trimmed.startsWith("^")) {
    throw new Error(
      `A "^" line is a table caption and must sit above a table. Found: "${trimmed.slice(0, 60)}".`,
    );
  }
  return null;
}

const BULLET = /^[-*] +/;
const NUMBERED = /^\d+\. +/;

/** A question. Marked explicitly, like "^" for a table caption and "|" for a
 *  row, rather than inferred.
 *
 *  THE IMPLICIT VERSION WAS TEMPTING AND WRONG. In the article sources a
 *  question is already a bold line with the answer on the line below, and
 *  nothing else in those files has that shape — so "bold alone on the first
 *  line" would have worked today. It would also mean that the day somebody
 *  writes a paragraph opening with a bold sentence and no text after it on that
 *  line, a paragraph silently becomes an accordion. A converter that changes
 *  what something IS based on how it happens to be typed is the failure this
 *  whole file is arranged against. */
const QUESTION = /^\? +/;

/** A Markdown thematic break. There is no block for one — a rule between two
 *  sections is what a heading already is here — so a chunk that is only dashes
 *  is a separator the converter must not turn into a paragraph. */
const RULE = /^-{3,}$/;

const HEADING = /^(#{2,3}) /;

function headingOf(text: string): {
  style: "normal" | "h2" | "h3";
  content: string;
} {
  const match = HEADING.exec(text);
  if (!match?.[1]) return { style: "normal", content: text };
  return {
    style: match[1].length === 2 ? "h2" : "h3",
    content: text.slice(match[1].length + 1),
  };
}

// --- blocks(): page copy, no inline markup -----------------------------------

/** An asterisk pair or a list marker in page copy. Rejected rather than
 *  rendered: `blocks()` has no inline parser, so "**Сроки.**" would reach the
 *  page with its asterisks showing — visible, wrong, and the kind of thing that
 *  survives a proofread because it looks like a typo somebody else will fix.
 *
 *  Only the FIRST line of a chunk is tested for a list marker, and a numbered
 *  list must start at 1. The first version tested every line with /m and fired
 *  on the Polish property body: "…do\n20. dnia miesiąca…" is a hard-wrapped
 *  sentence whose second line begins with an ordinal. A guard that cries wolf
 *  on correct copy gets switched off, so it tests what a list actually looks
 *  like — a marker where a list would have to begin. */
function unsupported(trimmed: string): boolean {
  if (trimmed.includes("**")) return true;
  if (RULE.test(trimmed)) return true;
  const first = trimmed.split("\n", 1)[0] ?? "";
  return BULLET.test(first) || /^1\. +/.test(first) || QUESTION.test(first);
}

export function blocks(source: string, prefix: string): PortableContent[] {
  return chunksOf(source).map((chunk, i) => {
    const trimmed = chunk.trim();

    const table = asTable(trimmed, `${prefix}t${i}`);
    if (table) return table;

    if (unsupported(trimmed)) {
      throw new Error(
        `blocks() has no inline markup and no lists — use richBlocks() for copy that needs them. Found: "${trimmed.slice(0, 60)}".`,
      );
    }

    const text = tightenNumbers(trimmed.replace(/\s*\n\s*/g, " "));
    const { style, content } = headingOf(text);

    return {
      _type: "block" as const,
      _key: `${prefix}${i}`,
      style,
      markDefs: [] as [],
      children: [
        {
          _type: "span" as const,
          _key: `${prefix}${i}s`,
          text: content,
          marks: [],
        },
      ],
    };
  });
}

// --- richBlocks(): article bodies --------------------------------------------

/** How a caller turns the href an author wrote into the one this locale
 *  serves. Required before a link is allowed at all: this file has no idea
 *  which locale it is converting or which entries exist, and a converter that
 *  guessed would be a converter that emitted a 404 into a flagship article
 *  where nothing would fail and nobody would look. */
export type HrefResolver = (raw: string) => string;

/** `**bold**` and `[text](href)` into spans plus their markDefs. Anything left
 *  over throws: a stray asterisk pair is either markup the author expected to
 *  work or a typo, and both are worth stopping for. Italic is deliberately
 *  absent — the article bodies use bold lead-ins and nothing else, and a mark
 *  nobody uses is a mark that goes wrong the first time somebody does.
 *
 *  ONE PASS OVER BOTH PATTERNS rather than bold-then-links, because two passes
 *  would let a link inside a bold run be found after its own text had already
 *  been sliced into a span and the offsets had stopped meaning anything. The
 *  alternation also makes nesting impossible by construction, which is the
 *  behaviour wanted: a bold link is not a thing this copy needs. */
function spansOf(
  text: string,
  key: string,
  resolveHref?: HrefResolver,
): { spans: PortableSpan[]; markDefs: PortableMarkDef[] } {
  const spans: PortableSpan[] = [];
  const markDefs: PortableMarkDef[] = [];
  let cursor = 0;
  let n = 0;

  // Bold, or a markdown link whose href has no spaces and no closing paren.
  for (const match of text.matchAll(/\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    const at = match.index;
    if (at > cursor) {
      spans.push({
        _type: "span",
        _key: `${key}s${n++}`,
        text: text.slice(cursor, at),
        marks: [],
      });
    }

    const bold = match[1];
    if (bold !== undefined) {
      spans.push({
        _type: "span",
        _key: `${key}s${n++}`,
        text: bold,
        marks: ["strong"],
      });
    } else {
      const label = match[2] ?? "";
      const raw = match[3] ?? "";
      if (!resolveHref) {
        throw new Error(
          `A link is not allowed in this copy: "[${label}](${raw})". Page copy has a nav; only article bodies take links.`,
        );
      }
      // Deterministic, like every other key here: running this twice on
      // unchanged copy must produce byte-identical documents.
      const defKey = `${key}l${markDefs.length}`;
      markDefs.push({ _type: "link", _key: defKey, href: resolveHref(raw) });
      spans.push({
        _type: "span",
        _key: `${key}s${n++}`,
        text: label,
        marks: [defKey],
      });
    }

    cursor = at + match[0].length;
  }

  const rest = text.slice(cursor);
  if (rest.includes("**")) {
    throw new Error(`Unclosed bold in: "${text.slice(0, 60)}".`);
  }
  if (rest || spans.length === 0) {
    spans.push({ _type: "span", _key: `${key}s${n}`, text: rest, marks: [] });
  }
  return { spans, markDefs };
}

/**
 * The article converter: everything `blocks()` does, plus bold and lists.
 *
 * WHY THIS IS A SECOND FUNCTION rather than a flag on the first. The note at
 * the top of this file says no bold and no lists, and that rule is right for
 * what it was written about — the page copy, where a bulleted list in a section
 * intro is a sign the section is doing too much. It is wrong for a 25 000
 * character guide, where a list of three prohibitions is a list of three
 * prohibitions and setting it as a sentence makes it harder to check. So the
 * rule keeps its enforcement — `blocks()` now throws rather than rendering
 * asterisks — and the article bodies get a converter that says what they need.
 */
export function richBlocks(
  source: string,
  prefix: string,
  resolveHref?: HrefResolver,
): PortableContent[] {
  const out: PortableContent[] = [];

  chunksOf(source).forEach((chunk, i) => {
    const trimmed = chunk.trim();

    const table = asTable(trimmed, `${prefix}t${i}`);
    if (table) {
      out.push(table);
      return;
    }

    // A SEPARATOR IS NOT CONTENT, and it reached the page as one. The article
    // sources put "---" between the piece and the working notes below it, and
    // the body slice ends at the next H2 — which left the rule inside it, and
    // the converter, having no block for a thematic break, rendered a paragraph
    // whose text was three hyphens. Visible at the foot of the published entry.
    // Thrown rather than skipped: the slice is what is wrong, and silently
    // dropping the marker would hide that the boundary had moved.
    if (RULE.test(trimmed)) {
      throw new Error(
        'A "---" separator reached the converter. It belongs outside the body slice, not in it.',
      );
    }

    const lines = trimmed.split("\n").map((line) => line.trim());
    const first = lines[0] ?? "";

    // CONSECUTIVE QUESTIONS ARE ONE ACCORDION. Each "? " chunk is one row: the
    // marked line is the question, everything under it is the answer. A chunk
    // that is not a question ends the run, so two sets separated by a heading
    // stay two accordions.
    if (QUESTION.test(first)) {
      const answer = lines.slice(1).join(" ").trim();
      if (!answer) {
        throw new Error(
          `A question has no answer under it: "${first.slice(0, 60)}".`,
        );
      }

      const previous = out[out.length - 1];
      const item = {
        _key: `${prefix}q${i}`,
        question: tightenNumbers(first.replace(QUESTION, "")),
        answer: tightenNumbers(answer),
      };

      if (previous?._type === "faq") previous.items.push(item);
      else out.push({ _type: "faq", _key: `${prefix}f${i}`, items: [item] });
      return;
    }
    // A numbered list has to START at 1. Accepting any ordinal here is what
    // made the guard below misread "20. dnia miesiąca" — the second line of a
    // hard-wrapped Polish sentence — as a list.
    const listItem = BULLET.test(first)
      ? ("bullet" as const)
      : /^1\. +/.test(first)
        ? ("number" as const)
        : undefined;

    // A LIST IS ONE CHUNK, ONE BLOCK PER LINE. Portable Text has no list
    // container: a list is a run of sibling blocks that happen to share
    // `listItem`, which is why a stray paragraph pasted between two items
    // silently splits the list in the Studio.
    if (listItem) {
      lines.forEach((line, j) => {
        const marker = listItem === "bullet" ? BULLET : NUMBERED;
        if (!marker.test(line)) {
          throw new Error(
            `A list chunk mixes item and non-item lines. Found: "${line.slice(0, 60)}".`,
          );
        }
        const key = `${prefix}${i}i${j}`;
        const { spans, markDefs } = spansOf(
          tightenNumbers(line.replace(marker, "")),
          key,
          resolveHref,
        );
        out.push({
          _type: "block",
          _key: key,
          style: "normal",
          markDefs,
          listItem,
          level: 1,
          children: spans,
        });
      });
      return;
    }

    const text = tightenNumbers(trimmed.replace(/\s*\n\s*/g, " "));
    const { style, content } = headingOf(text);
    const key = `${prefix}${i}`;
    const { spans, markDefs } = spansOf(content, key, resolveHref);

    out.push({
      _type: "block",
      _key: key,
      style,
      markDefs,
      children: spans,
    });
  });

  return out;
}
