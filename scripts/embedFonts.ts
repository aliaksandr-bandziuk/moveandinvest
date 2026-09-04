import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// Turns the site's own font files into inline @font-face rules.
//
// Extracted from scripts/og.ts on 24 Aug 2026 when a second generator — the
// comparison PDF — needed the same thing. Two copies of this would be two
// places for the family names to drift, and a PDF set in a different weight
// from the OG card is exactly the kind of difference nobody notices until both
// are printed side by side.
//
// It reads the files next/font already downloaded rather than fetching from
// Google. That is deliberate: a generated image or PDF must be set in the SAME
// file the site serves, and a second download is a second chance to get a
// different one.
//
// --- WHY IT PARSES CSS RATHER THAN GUESSING FILENAMES ------------------------
//
// The first version listed filename prefixes — "spectral_latin_600" — and read
// `.next/static/media` directly. Those names exist only after a PRODUCTION
// build, so `npm run pdf` failed with ENOENT on any machine that had only ever
// run `npm run dev`, which is most of them, and the advice in the error was
// "run npm run build first" — a five-minute build to print one document.
//
// next/font emits a stylesheet beside the files, and that stylesheet already
// says which file is which family, which weight and which subset. Reading it
// is both less work and more correct: the subsets come with their own
// `unicode-range`, so a generated page picks the Cyrillic file for Cyrillic
// text the same way the site does, instead of relying on three hand-listed
// prefixes that silently drop whatever they forgot.
//
// A missing file is still an error and never a silent fallback. A card or a
// document rendered in the container's default sans is worse than none at all:
// it looks like a different project.

/** Where a build leaves its assets, newest layout first. `.next/dev` is what a
 *  development server writes; `.next/static` is what `npm run build` writes. */
const ROOTS = [".next/static", ".next/dev/static"];

interface Face {
  family: string;
  /** As declared. A variable font declares a range, e.g. "100 900". */
  weight: string;
  file: string;
  unicodeRange?: string;
}

function styleSheets(): { css: string; dir: string }[] {
  const found: { css: string; dir: string }[] = [];
  for (const root of ROOTS) {
    for (const sub of ["chunks", "css"]) {
      const dir = path.join(root, sub);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (!name.endsWith(".css")) continue;
        found.push({ css: readFileSync(path.join(dir, name), "utf8"), dir });
      }
    }
    // A production build and a dev server can both be present. The production
    // one wins outright rather than being merged: mixing the two would inline
    // one family from each and the document would be set in two vintages.
    if (found.length > 0) return found;
  }
  return found;
}

function collect(): Face[] {
  const faces: Face[] = [];
  const seen = new Set<string>();

  for (const { css, dir } of styleSheets()) {
    for (const block of css.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
      const family = block.match(/font-family:\s*['"]?([^;'"]+?)['"]?\s*;/)?.[1];
      const weight = block.match(/font-weight:\s*([^;]+?)\s*;/)?.[1];
      const url = block.match(/src:\s*url\(["']?([^"')]+)["']?\)/)?.[1];
      if (!family || !weight || !url) continue;

      const file = path.resolve(dir, url);
      const key = `${family}|${weight}|${file}`;
      if (seen.has(key) || !existsSync(file)) continue;
      seen.add(key);

      faces.push({
        family,
        weight,
        file,
        unicodeRange: block.match(/unicode-range:\s*([^;]+?)\s*;/)?.[1],
      });
    }
  }
  return faces;
}

/** True when a declared weight covers the one asked for. Inter and JetBrains
 *  Mono are variable and declare "100 900"; Spectral is not and declares
 *  "400" or "600". */
function covers(declared: string, wanted: number): boolean {
  const parts = declared.trim().split(/\s+/).map(Number);
  if (parts.length === 2 && parts.every(Number.isFinite)) {
    return wanted >= parts[0]! && wanted <= parts[1]!;
  }
  return Number(declared) === wanted;
}

/** The families the site uses and the weights a generated page needs, keyed
 *  by the family name next/font declares in its own stylesheet. */
const NEEDED: Record<string, number[]> = {
  Spectral: [600],
  Inter: [400, 600],
  "JetBrains Mono": [400],
};

export function embeddedFontCss(): string {
  const faces = collect();

  if (faces.length === 0) {
    throw new Error(
      "No next/font stylesheet found under " +
        ROOTS.join(" or ") +
        ". Run `npm run dev` once (or `npm run build`) so next/font downloads " +
        "the files this document has to be set in.",
    );
  }

  // EACH FILE ONCE, UNDER THE WEIGHT IT DECLARES. Inter and JetBrains Mono are
  // variable: one file carries every weight, and emitting it a second time
  // under a second `font-weight` would add two hundred kilobytes of base64 to
  // the document for a face the browser already had.
  const out: string[] = [];
  for (const face of faces) {
    const wanted = NEEDED[face.family];
    if (!wanted?.some((weight) => covers(face.weight, weight))) continue;
    const data = readFileSync(face.file).toString("base64");
    const range = face.unicodeRange ? `;unicode-range:${face.unicodeRange}` : "";
    out.push(
      `@font-face{font-family:"${face.family}";font-weight:${face.weight};` +
        `font-display:block;src:url(data:font/woff2;base64,${data}) format("woff2")${range}}`,
    );
  }

  // A weight nobody covers is a silent substitution three files later, so it
  // is checked here rather than discovered in a printed document.
  for (const [family, weights] of Object.entries(NEEDED)) {
    for (const weight of weights) {
      const covered = faces.some(
        (face) => face.family === family && covers(face.weight, weight),
      );
      if (!covered) {
        throw new Error(
          `No font file covers ${family} ${weight} in the generated ` +
            "stylesheets. Check src/lib/fonts.ts — a family or a weight was " +
            "changed there without being changed here.",
        );
      }
    }
  }

  return out.join("");
}
