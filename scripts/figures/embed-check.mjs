// Does each self-contained figure draw the same picture on its own that it
// draws with the fonts handed to it?
//
// WHAT THIS CATCHES. An <img> loads its SVG as an isolated document: the page's
// stylesheet and webfonts cannot reach inside. If embed.mjs ever misses a face
// — a new weight in a figure, a subset that stopped shipping, a family renamed
// — the browser substitutes a system font and the figure still renders. It just
// renders in the wrong typeface, at the wrong widths, with labels that no
// longer line up with the bars they belong to. Nobody re-reads a picture that
// looks like a picture, which is why this is a script and not a glance.
//
// HOW. Two renders of the same file: once inline with the full fonts injected
// by the page, once as an <img> on a page whose own font-family is deliberately
// something else. Then count the pixels that disagree.
//
// THE THRESHOLD IS 3.5% AND BOTH SIDES OF IT WERE MEASURED. The honest
// disagreement across the nine figures is 0.08–2.52%: pyftsubset re-encodes the
// font, and Chromium rasterises an isolated SVG document slightly differently
// from an inline one, so glyphs land a fraction of a pixel apart. Both parts
// were isolated — subsetting alone accounts for 0.62% under every combination
// of pyftsubset flags, the <img> boundary for the rest.
//
// The failing side was measured too, by deleting the <style> block from one
// figure and running this: 5.28%. Not the 10% first assumed — these diagrams
// are mostly bars and white space, so only the text disagrees, and Chromium's
// fallback sans is not metrically far from Inter.
//
// BOTH NUMBERS MOVE WITH THE DESIGN, and that is worth knowing rather than
// discovering. They were 1.62 and 3.46 before the type in the figures was
// scaled up by a third; more text area means more pixels on both sides of the
// comparison, and the honest side rose past the old threshold on its own. If
// this starts failing after a figure is redrawn, re-measure both sides before
// touching the number — the point of writing them down is that the next person
// can tell a moved band from a real substitution.
//
// Run: node scripts/figures/embed-check.mjs   (part of `npm run figures`)

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "/tmp/node_modules/playwright-core/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, "../../public/figures");
const FONTS = process.env.FIGURE_FONTS ?? join(HERE, "../../node_modules/@fontsource");
const LIMIT = 3.5;

const fontPath = (family, subset, weight) =>
  join(FONTS, family, "files", `${family}-${subset}-${weight}-normal.woff2`);

const face = (name, family, subset, weight) =>
  `@font-face{font-family:'${name}';src:url(data:font/woff2;base64,` +
  `${readFileSync(fontPath(family, subset, weight)).toString("base64")}) ` +
  `format('woff2');font-weight:${weight};font-display:block}`;

const css = ["latin", "latin-ext", "cyrillic"]
  .flatMap((subset) =>
    [400, 500, 600].flatMap((weight) =>
      [
        ["Inter", "inter"],
        ["JetBrains Mono", "jetbrains-mono"],
      ].map(([name, pkg]) => face(name, pkg, subset, weight)),
    ),
  )
  .join("");

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});

const problems = [];

for (const file of readdirSync(DIR).filter((name) => name.endsWith(".svg"))) {
  const svg = readFileSync(join(DIR, file), "utf8");
  const match = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  if (!match) throw new Error(`${file}: no viewBox.`);
  const width = Number(match[1]);
  const height = Number(match[2]);
  const embedded = readFileSync(join(DIR, "web", file)).toString("base64");

  const render = async (html) => {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const shot = await page.screenshot();
    await page.close();
    return shot;
  };

  const reference = await render(
    `<style>${css}html,body{margin:0}svg{display:block}</style>${svg}`,
  );
  const isolated = await render(
    // The page's own font is deliberately wrong: anything the figure borrows
    // from its surroundings rather than carrying itself shows up immediately.
    `<style>html,body{margin:0;font-family:'Comic Sans MS',cursive}img{display:block}</style>` +
      `<img src="data:image/svg+xml;base64,${embedded}" width="${width}" height="${height}">`,
  );

  const page = await browser.newPage();
  const percent = await page.evaluate(
    async ([a, b, w, h]) => {
      const decode = async (data) => {
        const bitmap = await createImageBitmap(
          await (await fetch(`data:image/png;base64,${data}`)).blob(),
        );
        const canvas = new OffscreenCanvas(w, h);
        const context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, w, h).data;
      };
      const [one, two] = await Promise.all([decode(a), decode(b)]);
      let differing = 0;
      for (let i = 0; i < one.length; i += 4) {
        // Luma, so a colour shift and a position shift count the same.
        const l1 = 0.299 * one[i] + 0.587 * one[i + 1] + 0.114 * one[i + 2];
        const l2 = 0.299 * two[i] + 0.587 * two[i + 1] + 0.114 * two[i + 2];
        if (Math.abs(l1 - l2) > 16) differing += 1;
      }
      return (100 * differing) / (one.length / 4);
    },
    [reference.toString("base64"), isolated.toString("base64"), width, height],
  );
  await page.close();

  const label = `${file}: ${percent.toFixed(2)}% of pixels differ from the reference render`;
  if (percent > LIMIT) problems.push(`${label} — over ${LIMIT}%, check for a substituted face`);
  else console.log(`  ${label}`);
}

await browser.close();

if (problems.length === 0) {
  console.log("figures: every self-contained SVG draws itself");
  process.exit(0);
}

for (const problem of problems) console.error(problem);
process.exit(1);
