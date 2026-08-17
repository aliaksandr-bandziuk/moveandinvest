import { chromium, webkit } from "playwright";
import { compile } from "sass";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Does the scroll divider actually work in WebKit?
//
//   npm i -D playwright               # once
//   npx playwright install webkit     # once, ~90 MB
//   node scripts/check-parallax.mjs
//
// `playwright` is deliberately NOT in package.json: it is a one-off diagnostic,
// not something the build needs, and this repo does not carry dependencies for
// tools it runs twice a year. Uninstall it again afterwards if you like.
//
// The divider (src/components/layout/ScrollDivider) reveals a stationary
// position:fixed photograph through a moving frame, using `clip-path` on the
// frame to clip a descendant that would otherwise be anchored to the viewport
// and escape. Chromium does this. The open question is WebKit — and the
// failure mode is silent: if WebKit treats `clip-path` as establishing a
// containing block for fixed positioning, the image anchors to the FRAME
// instead, and the block degrades into an ordinary cropped photograph with no
// error anywhere.
//
// So this measures rather than looks. The whole test is one invariant:
//
//   as the page scrolls, the image's top stays at 0 relative to the VIEWPORT
//   while the frame's top moves.
//
// If the image's top tracks the frame's top instead, the effect is dead.
//
// Playwright's WebKit is not iOS Safari — it is the same engine on a
// different platform port, so it answers the layout-and-paint question but
// not compositor-level smoothness on a phone. For that, a real device on
// BrowserStack or similar is the only honest answer.
//
// The stylesheet under test is the REAL one, compiled from source here, so
// this cannot drift away from what ships.

const SCSS_PATH = "src/components/layout/ScrollDivider/ScrollDivider.module.scss";

// A flat SVG stand-in for the photograph: no file, no network, and the bands
// make vertical movement obvious in the screenshots.
const IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
     <rect width="1600" height="900" fill="#1a1e26"/>
     ${Array.from({ length: 18 }, (_, i) => {
       const y = i * 50;
       return `<rect x="0" y="${y}" width="1600" height="25" fill="${i % 2 ? "#39414f" : "#232b38"}"/>
               <text x="24" y="${y + 19}" font-family="monospace" font-size="18" fill="#aeb7c6">${String(y).padStart(4, "0")}</text>`;
     }).join("")}
   </svg>`,
)}`;

function buildPage() {
  // CSS Modules hash class names; compiling the module directly leaves them
  // literal, which is exactly what this fixture wants.
  const css = compile(SCSS_PATH, { loadPaths: ["src"] }).css;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    :root{--color-dark:#0b0f16;--space-6:2rem}
    body{background:#0b0f16}
    .before,.after{block-size:150vh;background:#0b0f16}
    img{display:block;max-inline-size:100%}
    ${css}
  </style></head><body>
    <div class="before"></div>
    <div class="divider" id="divider"><div class="frame"><img class="image" src="${IMAGE}" alt=""></div></div>
    <div class="after"></div>
  </body></html>`;
}

async function run(browserType, name, file) {
  const browser = await browserType.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`file://${file}`);
  await page.waitForTimeout(200);

  const samples = [];
  for (const y of [400, 700, 1000, 1300]) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(80);
    samples.push(
      await page.evaluate(() => ({
        scrollY: Math.round(window.scrollY),
        image: Math.round(document.querySelector(".image").getBoundingClientRect().top),
        frame: Math.round(document.querySelector(".frame").getBoundingClientRect().top),
      })),
    );
  }
  await page.screenshot({ path: `parallax-${name}.png` });
  await browser.close();

  const imageMoved = Math.max(...samples.map((s) => Math.abs(s.image)));
  const frameMoved =
    Math.max(...samples.map((s) => s.frame)) - Math.min(...samples.map((s) => s.frame));
  // The image is allowed a pixel or two of rounding; anything more means it is
  // travelling with the frame rather than staying put.
  const works = imageMoved <= 2 && frameMoved > 100;

  console.log(`\n${name}`);
  for (const s of samples) {
    console.log(
      `  scrollY ${String(s.scrollY).padStart(5)}   image top ${String(s.image).padStart(6)}   frame top ${String(s.frame).padStart(6)}`,
    );
  }
  console.log(
    `  -> ${works ? "WORKS" : "BROKEN"}: image drifted ${imageMoved}px from the viewport (want 0), frame travelled ${frameMoved}px`,
  );
  if (!works) {
    console.log(
      "  The image is anchored to the frame, not the viewport. Turn the effect off\n" +
        `  for this engine: include the static-crop mixin in ${SCSS_PATH}.`,
    );
  }
  console.log(`  screenshot: parallax-${name}.png`);
  return works;
}

const dir = mkdtempSync(join(tmpdir(), "parallax-"));
const file = join(dir, "fixture.html");
writeFileSync(file, buildPage());

const chromiumOk = await run(chromium, "chromium", file);
const webkitOk = await run(webkit, "webkit", file);

console.log("");
if (chromiumOk && webkitOk) {
  console.log("Both engines keep the image still while the frame moves. Ship it.");
} else if (chromiumOk && !webkitOk) {
  console.log(
    "WebKit does not clip the fixed child. Switch the divider to the static crop\n" +
      "there — see the static-crop mixin in the stylesheet.",
  );
  process.exit(1);
} else {
  console.log("Chromium failed too, which means something changed in the stylesheet.");
  process.exit(1);
}
