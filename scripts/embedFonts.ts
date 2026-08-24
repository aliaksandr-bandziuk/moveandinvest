import { readdirSync, readFileSync } from "node:fs";

// Turns the site's own font files into inline @font-face rules.
//
// Extracted from scripts/og.ts on 24 Aug 2026 when a second generator — the
// comparison PDF — needed the same thing. Two copies of this would be two
// places for the family names to drift, and a PDF set in a different weight
// from the OG card is exactly the kind of difference nobody notices until both
// are printed side by side.
//
// It reads the files next/font already downloaded during `npm run build`
// rather than fetching from Google. That is deliberate: a generated image or
// PDF must be set in the SAME file the site serves, and a second download is a
// second chance to get a different one.
//
// A missing file is an error and never a silent fallback. A card or a document
// rendered in the container's default sans is worse than none at all — it
// looks like a different project.

const MEDIA = ".next/static/media";

interface FaceRequest {
  family: string;
  /** Prefixes of the hashed files, one per subset. */
  prefixes: string[];
  weight: number;
}

function face({ family, prefixes, weight }: FaceRequest): string {
  const files = readdirSync(MEDIA);

  return prefixes
    .map((prefix) => {
      const file = files.find((name) => name.startsWith(prefix));
      if (!file) {
        throw new Error(
          `No font file starting with "${prefix}" in ${MEDIA}. Run \`npm run build\` first.`,
        );
      }
      const data = readFileSync(`${MEDIA}/${file}`).toString("base64");
      return `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${data}) format("woff2")}`;
    })
    .join("");
}

/** The three families the site uses, in the weights a generated page needs. */
export function embeddedFontCss(): string {
  return [
    face({
      family: "Spectral",
      prefixes: ["spectral_latin_600", "spectral_latin_ext_600", "spectral_cyrillic_600"],
      weight: 600,
    }),
    face({
      family: "Inter",
      prefixes: ["inter_latin_400", "inter_latin_ext_400", "inter_cyrillic_400"],
      weight: 400,
    }),
    face({
      family: "Inter",
      prefixes: ["inter_latin_600", "inter_latin_ext_600", "inter_cyrillic_600"],
      weight: 600,
    }),
    face({
      family: "JetBrains Mono",
      prefixes: [
        "jetbrains_mono_latin_400",
        "jetbrains_mono_latin_ext_400",
        "jetbrains_mono_cyrillic_400",
      ],
      weight: 400,
    }),
  ].join("");
}
