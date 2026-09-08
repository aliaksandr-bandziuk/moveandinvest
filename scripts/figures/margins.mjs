// DOES ANY TEXT RUN PAST THE RIGHT MARGIN? Rendered, not estimated.
//
// WHY THIS EXISTS. On 8 September 2026 one sweep found twenty-three of
// eighty-nine figures with text running past the frame's own hairline — titles
// and notes written without a length budget, on pages that had been published
// for a week. They had never been caught because a figure is only looked at
// when somebody happens to render it, and nobody renders the ones they are not
// currently editing.
//
// WHAT check.mjs DOES NOT DO. That file measures text runs against each other
// and against the margins from the SVG's own coordinates, which means it
// believes the width that the generator assumed. This one asks a browser how
// wide the glyphs actually came out, which is the only way to catch a Cyrillic
// title that fits in Latin and not in Russian — the failure mode that produced
// most of the twenty-three.
//
// THE BUDGETS, measured rather than theorised, on the 1200px canvas:
//   title  (26px × 1.33)  about 46 characters, fewer in Cyrillic
//   note   (13px × 1.33)  about 105 characters in Cyrillic, 115 in Latin
//   row note from x=300   about 95 characters
// They are guidance for writing. This script is the authority.
//
// THE BACKGROUND RECT IS EXCLUDED and that is not laziness: frame() paints a
// rect across the whole canvas by design, so including non-text elements makes
// every figure fail and the signal disappears. Text is what gets clipped.
//
// TOLERANCE. Anything under 6px is ignored. The frame's hairline sits at
// width − 48 while the canvas runs to width, so a label ending a few pixels
// past the rule is not clipped and not visible as a defect.

import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "../../public/figures");
const TOLERANCE = 6;

const only = process.argv[2];
const files = readdirSync(DIR)
  .filter((f) => f.endsWith(".svg"))
  .filter((f) => !only || f.includes(only))
  .sort();

if (files.length === 0) {
  console.error(only ? `No figure matches "${only}".` : "No figures found. Run build.mjs first.");
  process.exit(1);
}

const browser = await chromium.launch();
const bad = [];

for (const file of files) {
  const svg = readFileSync(join(DIR, file), "utf8");
  const box = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  if (!box) {
    bad.push(`${file}  no viewBox`);
    continue;
  }
  const width = Number(box[1]);
  const height = Number(box[2]);

  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(`<style>html,body{margin:0}</style>${svg}`);
  const worst = await page.evaluate((limit) => {
    let over = 0;
    let who = "";
    for (const el of document.querySelectorAll("text")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > limit && r.right - limit > over) {
        over = r.right - limit;
        who = (el.textContent || "").slice(0, 60);
      }
    }
    return { over: Math.round(over), who };
  }, width - 48);
  await page.close();

  if (worst.over > TOLERANCE) bad.push(`${file}  +${worst.over}px  «${worst.who}»`);
}

await browser.close();

if (bad.length === 0) {
  console.log(`margins: ${files.length} figures, nothing past the right margin.`);
  process.exit(0);
}

console.error(`margins: ${bad.length} of ${files.length} figures have text past the right margin.\n`);
for (const line of bad) console.error("  " + line);
console.error(
  "\nShorten the string. A title is about 46 characters and a note about 105;" +
    "\nCyrillic and Polish run wider than English at the same count.",
);
process.exit(1);
