// Turns each figure into a self-contained SVG: the same drawing with the exact
// glyphs it uses embedded in it, written to public/figures/web/.
//
// WHY, AND WHAT I GOT WRONG BEFORE. render.mjs says at the top that a raster is
// used because "next/image will not serve an SVG without dangerouslyAllowSVG,
// and turning that on for the whole site to publish three diagrams trades a
// real attack surface for a file-size saving that does not matter at this
// scale." Two things in that sentence are wrong. The saving is not file size,
// it is sharpness — and the trade was never necessary, because an SVG in a
// plain <img> cannot run script at all, which is the thing the flag guards.
//
// The blur was measured rather than argued about. Mean absolute Laplacian over
// the same crop of the same figure, each chain ending at the 1780 device pixels
// the figure actually occupies:
//
//   the raster chain that shipped   6.16   Sanity 1600 q80, then next/image
//                                          UPSCALED it to 1920 and re-encoded
//   the same chain at 2400 q90      6.38   quality barely matters
//   one resize only, Sanity 1920    7.12   cutting next/image out helps
//   vector, no raster step at all   9.00
//
// So the ranking is not "compression" — it is how many times the pixels are
// resampled, and the only way to get to zero is to stop rasterising.
//
// THE FONTS ARE SUBSET TO THE CHARACTERS EACH FIGURE USES. An <img> loads its
// SVG as an isolated document: no page stylesheet, no page fonts. Naming Inter
// and hoping gets a system fallback that looks almost right, which is the
// failure render.mjs already warns about. Embedding the whole Cyrillic and
// Latin subsets would add 90KB per figure; embedding only the eighty-odd
// characters a diagram contains adds two or three.
//
// AND IT FIXES A DEFECT IN THE RASTERS. The figures use weight 600 for their
// titles; render.mjs only ever embedded 400 and 500, so every title in every
// PNG has been drawn in a synthesised weight. The weights below come from the
// file, not from a list.
//
// Run: node scripts/figures/embed.mjs   (part of `npm run figures`)
// Needs pyftsubset: pip install fonttools brotli

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, "../../public/figures");
const OUT = join(DIR, "web");
// The same place render.mjs and check.mjs read, under the same variable, so the
// pipeline has ONE font source rather than three. A real devDependency, not a
// directory assembled by hand: the hand-assembled one was missing weight 600
// for every figure and JetBrains Mono latin-ext for the Polish one, and the
// only reason either was found is that this file refuses to leave a character
// unmapped.
const FONTS = process.env.FIGURE_FONTS ?? join(HERE, "../../node_modules/@fontsource");
const TMP = "/tmp/figure-subsets";

/** The families a figure can name, and the file naming they use. Fontsource
 *  splits a family by unicode range; a figure gets whichever ranges actually
 *  contain one of its characters. */
const FAMILIES = {
  Inter: { package: "inter" },
  "JetBrains Mono": { package: "jetbrains-mono" },
};

/** fontsource lays a family out as <family>/files/<family>-<subset>-<weight>-normal.woff2. */
const fontPath = (family, subset, weight) =>
  join(FONTS, family, "files", `${family}-${subset}-${weight}-normal.woff2`);

const SUBSETS = ["latin", "latin-ext", "cyrillic"];

/** Which characters each family/weight pair actually draws.
 *
 *  READ PER ELEMENT, not as a cross product. The first version collected every
 *  family and every weight the file mentions and paired them all, which asked
 *  for eighteen faces per figure — including JetBrains Mono at weight 600 for a
 *  diagram whose mono text is all one weight, and a Cyrillic subset for the
 *  English figure, which passed the "does it map anything" test on a shared
 *  dash. Every <text> in these files carries its own font-family and
 *  font-weight, so the exact answer costs no more than the guess did. There are
 *  no <tspan>s to inherit through — checked, all nine files. */
function used(svg) {
  const faces = new Map();

  for (const match of svg.matchAll(/<text\b([^>]*)>([^<]*)</g)) {
    const attrs = match[1] ?? "";
    const text = match[2] ?? "";
    if (!text) continue;

    const family = /font-family="([^"]+)"/
      .exec(attrs)?.[1]
      ?.split(",")[0]
      ?.replace(/^['"]|['"]$/g, "")
      .trim();
    if (!family || !FAMILIES[family]) continue;

    const weight = /font-weight="(\d+)"/.exec(attrs)?.[1] ?? "400";
    const key = `${family}|${weight}`;
    const set = faces.get(key) ?? new Set();
    for (const char of text) set.add(char);
    faces.set(key, set);
  }

  return faces;
}

/** One woff2 holding only the requested characters, plus the set it managed to
 *  map — null when this subset file has none of them. */
function subset(source, characters, out) {
  execFileSync("pyftsubset", [
    source,
    `--text=${characters}`,
    "--flavor=woff2",
    `--output-file=${out}`,
    // The tables a rendered SVG never reads. NOT `--layout-features=`, which
    // the first version passed: it strips OpenType layout, kerning included,
    // and the figure then draws every string a fraction of a pixel wider than
    // the reference. Visible as a doubled outline on every heading in the
    // difference map, and as 2.5% of pixels disagreeing where antialiasing
    // alone accounts for 0.3%. pyftsubset's default feature set is what a
    // renderer expects; the only tables worth dropping are the ones nothing
    // reads.
    "--desubroutinize",
    "--drop-tables+=DSIG",
  ]);

  // pyftsubset always writes a file; what matters is which of the requested
  // characters ended up in its cmap. Asked rather than inferred from the file
  // size, because a subset holding one glyph and a subset holding none differ
  // by a few dozen bytes.
  //
  // `getBestCmap()` returns None — not an empty dict — for a subset that mapped
  // nothing, which is the normal answer when a Latin figure is offered the
  // Cyrillic file. Handled here rather than left to throw: an exception here
  // lands in the caller's catch, which exists for a missing FILE, and the two
  // would then be indistinguishable in the one place it matters.
  const mapped = execFileSync("python3", [
    "-c",
    "import sys;from fontTools.ttLib import TTFont;" +
      "print(''.join(chr(c) for c in (TTFont(sys.argv[1]).getBestCmap() or {})))",
    out,
  ]).toString();

  const covered = new Set([...mapped].filter((char) => characters.includes(char)));
  return covered.size > 0 ? { data: readFileSync(out), covered } : null;
}

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

let total = 0;

for (const file of readdirSync(DIR).filter((name) => name.endsWith(".svg"))) {
  const svg = readFileSync(join(DIR, file), "utf8");
  const faces = used(svg);

  const rules = [];
  let glyphs = 0;

  for (const [face, characters] of faces) {
    const [family, weight] = face.split("|");
    const spec = FAMILIES[family ?? ""];
    if (!spec || !weight) continue;
    glyphs += characters.size;

    // ONE SUBSET FILE PER FACE WHERE POSSIBLE. fontsource splits a family by
    // unicode range, so a Russian figure needs the Cyrillic file for its words
    // and the Latin one for "€" and its digits. Walked in order, each file
    // asked only for what the ones before it could not supply, and skipped
    // when that leaves nothing.
    let remaining = new Set(characters);

    for (const name of SUBSETS) {
      if (remaining.size === 0) break;
      const source = fontPath(spec.package, name, weight);

      let result;
      try {
        result = subset(
          source,
          [...remaining].join(""),
          join(TMP, `${file}-${family}-${weight}-${name}.woff2`),
        );
      } catch {
        // The family does not ship this subset (JetBrains Mono has no
        // latin-ext). Not an error: every subset is asked and the ones that
        // answer are kept.
        continue;
      }
      if (!result) continue;

      rules.push(
        `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
          `src:url(data:font/woff2;base64,${result.data.toString("base64")}) format('woff2')}`,
      );
      remaining = new Set([...remaining].filter((char) => !result.covered.has(char)));
    }

    if (remaining.size > 0) {
      throw new Error(
        `${file}: ${family} ${weight} has no glyph for ${[...remaining].join("")} in any subset.`,
      );
    }
  }

  if (rules.length === 0) {
    throw new Error(`${file}: no fonts embedded — the figure would render in a fallback face.`);
  }

  const embedded = svg.replace(/(<svg\b[^>]*>)/, `$1<style>${rules.join("")}</style>`);
  if (embedded === svg) throw new Error(`${file}: no <svg> tag to inject into.`);

  writeFileSync(join(OUT, file), embedded);
  total += 1;
  const kb = (Buffer.byteLength(embedded) / 1024).toFixed(1);
  console.log(`  web/${file}  ${kb}KB  ${rules.length} faces, ${glyphs} glyphs`);
}

rmSync(TMP, { recursive: true, force: true });
console.log(`figures: ${total} self-contained SVGs`);
