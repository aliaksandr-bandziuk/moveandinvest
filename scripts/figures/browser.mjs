// One place that finds a headless Chromium for the figure checks.
//
// WHY THIS FILE EXISTS, and it is a defect being closed rather than a feature.
// render.mjs, check.mjs and embed-check.mjs each carried two absolute paths:
//
//   import { chromium } from "/tmp/node_modules/playwright-core/index.mjs";
//   executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
//
// Both are real paths — in the container the figures were developed in. On any
// other machine the first one resolves to a directory that does not exist and
// the run dies with ERR_MODULE_NOT_FOUND before drawing anything. That is the
// same failure as a script that only works on its author's laptop, and it was
// found the only way it could be: by someone else running `npm run figures`.
//
// NEITHER PLAYWRIGHT NOR A BROWSER IS A DEPENDENCY OF THIS PROJECT, on purpose.
// They are needed by three verification scripts and by nothing the site ships,
// and adding a browser download to every `npm install` for that is a poor
// trade. So this resolves what is there, and when nothing is there it says
// exactly what to install instead of printing a stack trace.

import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

/** Where a caller may point us, in order of precedence. Both are escape
 *  hatches for an environment that has the pieces somewhere unusual — the
 *  container these were written in is one such environment, and it now passes
 *  them as variables rather than having them baked into the source. */
const MODULE_ENV = "PLAYWRIGHT_CORE_PATH";
const BROWSER_ENV = "PLAYWRIGHT_CHROMIUM_PATH";

async function loadChromium() {
  const explicit = process.env[MODULE_ENV];
  if (explicit) {
    const url = explicit.startsWith("file:")
      ? explicit
      : pathToFileURL(explicit).href;
    return (await import(url)).chromium;
  }

  // Normal resolution, from this file outwards: the project's own
  // node_modules, then anything above it. playwright-core first because it is
  // the smaller package and the one that carries the launcher.
  for (const name of ["playwright-core", "playwright", "@playwright/test"]) {
    try {
      require.resolve(name);
      return (await import(name)).chromium;
    } catch {
      // Not installed here. Try the next one.
    }
  }

  throw new Error(
    [
      "No Playwright module found, so the figures cannot be rendered or checked.",
      "",
      "The drawing step does not need this — `node scripts/figures/build.mjs`",
      "writes every SVG with nothing but Node. What needs a browser is the",
      "verification: rasterising, measuring text for collisions, and proving",
      "each self-contained SVG draws itself.",
      "",
      "To run the checks:  npm i -D playwright && npx playwright install chromium",
      `Or point at an existing install with ${MODULE_ENV} and ${BROWSER_ENV}.`,
    ].join("\n"),
  );
}

/** A headless Chromium, or a readable explanation of why not.
 *
 *  `--no-sandbox` is passed only when a browser path is given explicitly,
 *  which in practice means a container running as root. A developer machine
 *  keeps its sandbox: turning it off everywhere to satisfy one environment is
 *  how a convenience becomes a default nobody remembers choosing. */
export async function launchBrowser() {
  const chromium = await loadChromium();
  const executablePath = process.env[BROWSER_ENV];

  return chromium.launch(
    executablePath ? { executablePath, args: ["--no-sandbox"] } : {},
  );
}
