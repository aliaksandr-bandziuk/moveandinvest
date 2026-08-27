// Renders every SVG in public/figures to a 2x PNG beside it.
//
// WHY A RASTER AT ALL. Sanity accepts SVG, but next/image will not serve one
// without `dangerouslyAllowSVG`, and turning that on for the whole site to
// publish three diagrams trades a real attack surface for a file-size saving
// that does not matter at this scale. The SVG stays in the repo as the editable
// source; the PNG is what gets uploaded.
//
// THE FONTS ARE EMBEDDED AS FILES, not named and hoped for. A headless browser
// with no Inter installed silently substitutes a fallback, and the result looks
// almost right — which is the worst kind of wrong, because nobody checks a
// picture that looks fine. Cyrillic and Latin-Extended subsets are loaded too:
// without them the Russian and Polish figures render in a different face from
// the English one and only a side-by-side would show it.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "/tmp/node_modules/playwright-core/index.mjs";

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


const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});

const files = readdirSync(DIR).filter((f) => f.endsWith(".svg"));

for (const file of files) {
  const svg = readFileSync(join(DIR, file), "utf8");
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);

  const page = await browser.newPage({
    viewport: { width: Number(w), height: Number(h) },
    deviceScaleFactor: 2,
  });
  await page.setContent(
    `<style>${css}html,body{margin:0;padding:0}svg{display:block}</style>${svg}`,
    { waitUntil: "load" },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(DIR, file.replace(/\.svg$/, ".png")) });
  await page.close();
  console.log(`  ${file.replace(/\.svg$/, ".png")}  ${w}x${h} @2x`);
}

await browser.close();
