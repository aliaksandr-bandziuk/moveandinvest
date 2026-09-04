import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { embeddedFontCss } from "./embedFonts";
import { HOME_COPY, LOCALES, type Locale } from "./copy/home";
import { COUNTRY_LABELS } from "./copy/jurisdictions";

// GENERATES the site's brand images, and writes them into the repo:
//
//   src/app/icon.svg        the favicon Next serves from the file convention
//   src/app/apple-icon.png  180x180, because iOS ignores an SVG icon
//   public/og/<locale>.png  1200x630, the card a messenger unfurls
//
//   npx tsx scripts/og.ts
//
// TWO PREREQUISITES, both of which this script checks and names:
//
//   npm run dev     — run once, so next/font downloads the woff2 files.
//                     scripts/embedFonts.ts reads them out of whichever build
//                     is present, dev or production. This script deliberately
//                     does not fetch from Google: the images must be set in the
//                     SAME files the site serves, and a second download is a
//                     second chance to get a different one.
//   npm i --no-save playwright  — a one-off, not in package.json, exactly
//                     as scripts/generate-map.mjs treats topojson. It is needed
//                     to run this generator and never to build or serve the
//                     site; carrying a browser in the dependency tree of a
//                     deployment that never opens one is not worth the install.
//
// WHY GENERATED RATHER THAN DRAWN. Everything on these images already exists
// in the project: the ampersand is the outline of Spectral 600's own glyph,
// the same face and weight as the wordmark in the header; the headline is the
// home page hero's headline, imported, not retyped; the jurisdiction names are
// the labels the table renders. Nothing here can disagree with the site,
// because nothing here is a copy of the site.
//
// WHAT IS DELIBERATELY NOT ON THE CARD: figures. A threshold on a PNG is a
// figure that cannot be corrected by `npm run facts` — it goes stale in a
// place no script reaches, which is the one thing this site cannot afford.

// The ampersand, as an outline path in a 1000-unit em square, y up.
//
// Taken from Spectral 600 — the display face, the weight the wordmark uses —
// with fontTools:
//
//   from fontTools.ttLib import TTFont
//   from fontTools.pens.svgPathPen import SVGPathPen
//   f = TTFont("<the spectral_latin_600 woff2 under .next/static/media>")
//   gs = f.getGlyphSet(); pen = SVGPathPen(gs)
//   gs[f.getBestCmap()[ord("&")]].draw(pen); print(pen.getCommands())
//
// It is a path and not text because a favicon is rasterised in a context that
// loads no fonts — an SVG icon that names a family gets the system serif, or
// nothing. Regenerate it only if the display face changes; the transform below
// is fitted to this glyph's bounding box (x 30..729, y -10..670).
const AMPERSAND =
  "M233 -10Q142 -10 86.0 35.5Q30 81 30 160Q30 212 63.5 259.5Q97 307 169 347Q138 380 120.5 405.0Q103 430 95.0 453.5Q87 477 87 507Q87 551 113.0 588.0Q139 625 184.0 647.5Q229 670 286 670Q370 670 418.5 633.0Q467 596 467 537Q467 494 427.5 457.5Q388 421 302 382Q311 374 320.0 365.0Q329 356 338 346L491 192Q542 269 584 390L486 429V445H729V429L643 392Q613 326 582.5 268.5Q552 211 519 164L631 52L714 16V0H514L441 73Q397 33 346.0 11.5Q295 -10 233 -10ZM202 540Q202 506 220.5 476.5Q239 447 277 408Q313 437 332.5 469.0Q352 501 352 541Q352 577 332.0 601.0Q312 625 277 625Q243 625 222.5 601.0Q202 577 202 540ZM147 194Q147 130 184.5 94.5Q222 59 282 59Q351 59 411 104L255 260Q238 276 223.5 291.0Q209 306 197 319Q166 289 156.5 260.5Q147 232 147 194Z";

// 44 of 64. Measured, not guessed: at 40 the mark reads as a square with
// something in it at 16px, and at 48 the glyph crowds the edges. The favicon
// is the one image on this site that has to survive being 16 pixels wide.
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#7a2230"/><path transform="translate(7.44 53.35) scale(0.06471 -0.06471)" fill="#ffffff" d="${AMPERSAND}"/></svg>`;

// Fonts come from scripts/embedFonts.ts, shared with the PDF generator.

// --- the card ---------------------------------------------------------------
// Colours are the literal values of the tokens in _tokens.scss. They are
// copied rather than imported for the same reason the enquiry email copies
// them: this renders in a page that never loads globals.scss, and a var()
// that resolves to nothing renders as black on black.
const DARK = "#0b0f16";
const ON_DARK = "#ffffff";
const ON_DARK_MUTED = "#aeb7c6";
const HAIRLINE = "rgba(255,255,255,0.12)";
const ACCENT_ON_DARK = "#c9646f";

function card(locale: Locale): string {
  const hero = HOME_COPY[locale].hero;
  const jurisdictions = ["pt", "gr", "mt", "ae", "cy"]
    .map((code) => COUNTRY_LABELS[code]?.[locale] ?? "")
    .filter(Boolean)
    .join("  ·  ");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${embeddedFontCss()}
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:${DARK};color:${ON_DARK};
         font-family:Inter,sans-serif;display:flex;flex-direction:column;
         justify-content:space-between;padding:72px 80px}
    .top{display:flex;align-items:center;gap:20px}
    .mark{width:56px;height:56px;flex:0 0 auto}
    .wordmark{font-family:Spectral,serif;font-weight:600;font-size:34px;letter-spacing:-0.01em}
    .amp{color:${ACCENT_ON_DARK}}
    .eyebrow{font-family:"JetBrains Mono",monospace;font-size:19px;letter-spacing:0.14em;
             text-transform:uppercase;color:${ON_DARK_MUTED};margin-left:auto}
    h1{font-family:Spectral,serif;font-weight:600;font-size:76px;line-height:1.05;
       letter-spacing:-0.02em;max-width:1000px}
    .foot{border-top:1px solid ${HAIRLINE};padding-top:26px;
          font-family:"JetBrains Mono",monospace;font-size:21px;letter-spacing:0.05em;
          color:${ON_DARK_MUTED}}
  </style></head><body>
    <div class="top">
      <div class="mark">${ICON_SVG}</div>
      <span class="wordmark">move<span class="amp">&amp;</span>invest</span>
      <span class="eyebrow">${hero.eyebrow}</span>
    </div>
    <h1>${hero.heading}</h1>
    <div class="foot">${jurisdictions}</div>
  </body></html>`;
}

// --- run --------------------------------------------------------------------
async function run() {
  writeFileSync("src/app/icon.svg", `${ICON_SVG}\n`);
  console.log("src/app/icon.svg");

  // CHROMIUM_PATH is for a machine that already has a browser and does not
  // want playwright to download a second one. Unset, playwright uses its own.
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });

  const iconPage = await browser.newPage({ viewport: { width: 180, height: 180 } });
  // Full bleed, no rounding: iOS applies its own mask, and a corner radius
  // baked into the file gets rounded twice.
  await iconPage.setContent(
    `<body style="margin:0;width:180px;height:180px">${ICON_SVG.replace("<svg", '<svg width="180" height="180"')}</body>`,
  );
  await iconPage.screenshot({ path: "src/app/apple-icon.png" });
  await iconPage.close();
  console.log("src/app/apple-icon.png");

  mkdirSync("public/og", { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const locale of LOCALES) {
    await page.setContent(card(locale));
    // The fonts are inline base64, so nothing is fetched — but they are still
    // decoded asynchronously, and a screenshot taken before that lands shows
    // the fallback.
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/og/${locale}.png` });
    console.log(`public/og/${locale}.png`);
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
