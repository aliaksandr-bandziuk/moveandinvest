import { Inter, JetBrains_Mono, Spectral } from "next/font/google";

// Three families, all self-hosted by next/font (no runtime request to
// fonts.googleapis.com, no layout-shift flash, no third-party cookie).
//
// Subsets are the whole point of this file. `latin-ext` carries the Polish
// diacritics (ł ą ę ż ś ć ń ó ź); `cyrillic` carries Russian. All three
// families cover all three scripts, which is why this project uses ONE
// display face across every locale instead of a Latin-only "display" font
// with a Cyrillic substitute — a split like that forces a separate type
// scale per locale, since the two faces never share an x-height.
//
// Adding a locale: extend `subsets` here, not the font stack. Adding a
// script that these families do not cover (Greek is covered by Inter and
// JetBrains Mono but NOT by Spectral) is the one case where a per-locale
// display face would be justified — check coverage before promising it.

// Display: headings, the wordmark, section titles. Not a variable font —
// weights must be listed explicitly. 600 is the working display weight;
// 400 is used for the rare large pull-quote, 700 never (Spectral's bold is
// heavier than this direction wants).
export const spectral = Spectral({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600"],
  style: ["normal"],
  display: "swap",
  variable: "--font-spectral",
});

// Body, UI, navigation, form labels. Variable font — no weight array.
export const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

// Figures only: table cells, stat numbers, thresholds, dates. Never body
// copy. Variable font.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

// Applied once, on <html> in src/app/[locale]/layout.tsx. Components read
// the families through --font-display / --font-body / --font-mono in
// _tokens.scss, never through these exports directly.
export const fontVariables = [
  spectral.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
