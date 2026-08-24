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
//
// No bold, no italics, no inline links. Not an oversight: the schema allows
// all three, and none of them earns its complexity here. Sources are named in
// running text — "art. 100 of Law 5038/2023" is quotable by an answer engine
// exactly as it stands, and a link is not.
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

export interface PortableBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3";
  markDefs: [];
  children: { _type: "span"; _key: string; text: string; marks: [] }[];
}

export function blocks(source: string, prefix: string): PortableBlock[] {
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((chunk, i) => {
      const raw = chunk.trim().replace(/\s*\n\s*/g, " ");
      const text = tightenNumbers(raw);

      const style = text.startsWith("### ") ? "h3" : text.startsWith("## ") ? "h2" : "normal";
      const content = style === "h3" ? text.slice(4) : style === "h2" ? text.slice(3) : text;

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
            marks: [] as [],
          },
        ],
      };
    });
}
