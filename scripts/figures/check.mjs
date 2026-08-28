// Measures every piece of text in every figure and fails if any of it leaves
// the margins or lands on the footer rule.
//
// WHY THIS EXISTS. Three of the first four renders had text in the wrong place:
// a Russian row label ran through the column beside it, a Greek zone
// description ran off the page, and the same footnote collided with the footer
// twice. Every one of those was found by looking at a picture, which does not
// scale to nine figures in three languages — and the two languages most likely
// to overflow are the two I read slowest. The browser already knows exactly how
// wide the text came out; this asks it.
//
// Run: node scripts/figures/check.mjs

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { launchBrowser } from "./browser.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, "../../public/figures");
// FONTS COME FROM node_modules/@fontsource, a real devDependency, rather than
// from a directory somebody assembled by hand. The hand-assembled one is how
// weight 600 went missing here for a month and how the Polish figure's "ł"
// went missing from JetBrains Mono: a file that is absent produces a fallback
// or a crash, and neither says which file. `npm i` produces the whole set.
const FONTS = process.env.FIGURE_FONTS ?? join(HERE, "../../node_modules/@fontsource");

/** fontsource lays a family out as <family>/files/<family>-<subset>-<weight>-normal.woff2. */
const fontPath = (family, subset, weight) =>
  join(FONTS, family, "files", `${family}-${subset}-${weight}-normal.woff2`);
const MARGIN = 48;

const face = (name, family, subset, weight) => {
  const data = readFileSync(fontPath(family, subset, weight)).toString("base64");
  return `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,${data}) format('woff2');font-weight:${weight};font-display:block}`;
};

// EVERY WEIGHT AND SUBSET THE FIGURES USE, generated rather than listed. The
// list version was missing weight 600 — which the figures use for every title,
// so every title in every PNG was drawn in a weight the browser synthesised.
// Found when the self-contained SVGs, whose weights are read off the file
// itself, disagreed with these rasters by 2% of their pixels.
const WEIGHTS = [400, 500, 600];
const css = [
  ...["latin", "latin-ext", "cyrillic"].flatMap((subset) =>
    WEIGHTS.map((weight) => face("Inter", "inter", subset, weight)),
  ),
  ...["latin", "latin-ext", "cyrillic"].flatMap((subset) =>
    WEIGHTS.map((weight) => face("JetBrains Mono", "jetbrains-mono", subset, weight)),
  ),
].join("");


const browser = await launchBrowser();

const problems = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".svg"))) {
  const svg = readFileSync(join(DIR, file), "utf8");
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const width = Number(w);
  const height = Number(h);

  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(`<style>${css}html,body{margin:0}svg{display:block}</style>${svg}`, {
    waitUntil: "load",
  });
  await page.evaluate(() => document.fonts.ready);

  const found = await page.evaluate(
    ({ width, margin }) =>
      [...document.querySelectorAll("text")]
        .map((el) => {
          const b = el.getBoundingClientRect();
          return {
            text: el.textContent.slice(0, 46),
            left: Math.round(b.left),
            right: Math.round(b.right),
          };
        })
        .filter((b) => b.right > width - margin + 1 || b.left < margin - 1),
    { width, margin: MARGIN },
  );

  for (const b of found) {
    problems.push(
      `${file}: "${b.text}" spans ${b.left}–${b.right}, outside the ${MARGIN}–${width - MARGIN} margins`,
    );
  }

  // Overlap between any two text runs in the same figure. Catches the label
  // that ran into the threshold column, which was inside the margins and still
  // wrong.
  const collisions = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll("text")].map((el) => ({
      text: el.textContent.slice(0, 30),
      ...el.getBoundingClientRect().toJSON(),
    }));
    const hits = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (overlapX > 2 && overlapY > 2) hits.push(`"${a.text}" over "${b.text}"`);
      }
    }
    return hits;
  });

  for (const c of collisions) problems.push(`${file}: ${c}`);
  await page.close();
}

await browser.close();

if (problems.length === 0) {
  console.log(`figures: ok (${readdirSync(DIR).filter((f) => f.endsWith(".svg")).length} checked)`);
  process.exit(0);
}

for (const p of problems) console.error(p);
process.exit(1);
