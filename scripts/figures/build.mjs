// Draws every figure in Guides & Research, in every language, from one source.
//
// ONE GENERATOR RATHER THAN NINE FILES, and the reason is the one this project
// keeps rediscovering: a figure is a claim, and a claim duplicated across three
// languages drifts. The numbers below are written once and every language gets
// the same ones; only the words differ. A Russian chart cannot come to say
// €35,000 while the English one says €34,000, because there is one array.
//
// THE COLOUR RULE IS THE SITE'S, NOT MINE. src/styles/_tokens.scss records that
// five categorical hues cannot be told apart under colour-vision deficiency at
// one lightness — a directed search over OKLCH hue sets could not clear the CVD
// threshold for any five, best result 4.5 against a floor of 8. So on this site
// colour says exactly one thing: covered or not. The figures here hold the same
// line. Identity is carried by the label and by position; colour carries status
// and magnitude only, and every status also carries a word.
//
// Output is SVG. Rendering to PNG happens in render.mjs, because Sanity plus
// next/image is a safer pair with a raster than with an SVG that would need
// dangerouslyAllowSVG turned on for the whole site.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../../public/figures");

// --- Tokens, copied from src/styles/_tokens.scss ----------------------------
// Copied rather than imported: this script runs outside the Next build and the
// tokens live in SCSS. Any change there has to be mirrored here, which is why
// the list is short and why each value carries the contrast figure the
// stylesheet records for it.
const C = {
  bg: "#ffffff",
  text: "#0e1420", // 18.43:1 on white
  muted: "#5a6478", // 5.95:1 on white
  hairline: "#dce0e7",
  line: "#b9c0cc",
  accent: "#7a2230", // 10.00:1 on white
  onAccent: "#ffffff",
  pending: "#6b7484", // declared but not established
  dark: "#0b0f16",
};

const FONT_BODY = "Inter, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// EVERY TYPE SIZE IN THIS FILE, MULTIPLIED BY ONE NUMBER.
//
// The figures are drawn on a 1200px canvas and displayed in a 906px column, so
// everything in them renders at 75% of the size it is written at: a 12px
// footnote reaches the reader as 9px. On the published page that came out as
// labels nobody could read, which is a diagram that has stopped being a
// diagram.
//
// Raising the sizes rather than widening the picture, because the picture
// cannot get wider: the column is what it is, and breaking the figure out to
// the full container would run it under the sticky contents list. 1.33 puts the
// smallest label at 16px written, 12px read — the size of a caption, which is
// what it is.
//
// The layouts were tuned to the old sizes, so check.mjs is what says whether
// this fits: it measures every text run against the margins and against every
// other run. The heights below were raised until it passed.
const TYPE = 1.33;
const t = (size) => Math.round(size * TYPE);

function text(x, y, content, opts = {}) {
  const {
    size = 15,
    fill = C.text,
    weight = 400,
    family = FONT_BODY,
    anchor = "start",
    tracking = 0,
    upper = false,
  } = opts;
  const scaled = t(size);
  const raw = upper ? String(content).toUpperCase() : String(content);
  // SVG does not wrap. A newline in a label has to become a tspan with its own
  // dy, or it renders as a space and the line runs off the canvas — which is
  // how the Greek zone descriptions escaped their column on the first pass.
  const lines = raw.split("\n");
  const inner =
    lines.length === 1
      ? esc(lines[0])
      : lines
          .map(
            (line, i) =>
              `<tspan x="${x}" dy="${i === 0 ? 0 : Math.round(scaled * 1.45)}">${esc(line)}</tspan>`,
          )
          .join("");
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${scaled}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${tracking ? ` letter-spacing="${(tracking * TYPE).toFixed(2)}"` : ""}>${inner}</text>`;
}

function frame(width, height, title, eyebrow, footnote, body, note) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(title)}">
  <rect width="${width}" height="${height}" fill="${C.bg}"/>
  ${text(48, 62, eyebrow, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true })}
  ${text(48, 112, title, { size: 26, weight: 600 })}
  <line x1="48" y1="144" x2="${width - 48}" y2="144" stroke="${C.hairline}" stroke-width="1"/>
  ${body}
  ${note ? text(48, height - 92, note, { size: 13, fill: C.muted }) : ""}
  <line x1="48" y1="${height - 68}" x2="${width - 48}" y2="${height - 68}" stroke="${C.hairline}" stroke-width="1"/>
  ${text(48, ny(height), footnote, { size: 12, fill: C.muted })}
  ${text(width - 48, ny(height), "moveandinvest.com", { size: 12, fill: C.muted, anchor: "end", family: FONT_MONO })}
</svg>`;
}

const ny = (height) => height - 38;

// --- The numbers, written once ----------------------------------------------
// Every figure below traces to a section of /sources. See the article for the
// article numbers; this file only holds what has to be drawn.
const COST = [
  { key: "gr400", value: 34000, tier: "400 000 €" },
  { key: "gr800", value: 67000, tier: "800 000 €" },
  { key: "mtBuy", value: 126000, tier: "375 000 €" },
  { key: "mtRent", value: 113500, tier: "14 000 €/год" },
  { key: "ae", value: 31000, tier: "AED 2 000 000" },
  // A RANGE, NOT A POINT, and drawn as one. Portugal's total depends on the
  // lawyer and the fund's own commissions, and collapsing that to a single bar
  // would state a precision the source does not have.
  { key: "pt", value: 30000, to: 50000, tier: "500 000 €" },
];

const QUALIFY = [
  { key: "gr", state: "yes" },
  { key: "ae", state: "yes" },
  { key: "mt", state: "partly" },
  { key: "pt", state: "no" },
  { key: "cy", state: "unknown" },
];

const ZONES = [
  { key: "z800", amount: "800 000 €", weight: 1 },
  { key: "z400", amount: "400 000 €", weight: 0.5 },
  { key: "z250", amount: "250 000 €", weight: 0.3125 },
];

// --- The second entry's numbers ---------------------------------------------

// EACH ROUTE IN ITS OWN PERIOD, not converted to a common one. Malta's
// threshold is annual and the Emirati one is in dollars; dividing or converting
// them so the bars line up would be this file inventing a figure the instrument
// does not state. So this diagram groups by answer and needs no common scale.
const INCOME_TESTS = {
  none: [{ key: "grGV" }, { key: "mtMPRP" }, { key: "aeGV" }],
  tested: [
    { key: "ptARI" },
    { key: "ptD7" },
    { key: "grFIP" },
    { key: "grDN" },
    { key: "mtNomad" },
    { key: "aeRemote" },
  ],
};

// The one place three Greek figures can honestly be compared: all three are
// monthly euros, and two of them are 2026 values against a 2024 survey, which
// the note says. 1724.54 is carried unrounded — it is the published value.
const GREECE_SCALE = [
  { key: "fip", value: 3500 },
  { key: "spend", value: 1724.54 },
  { key: "wage", value: 920 },
];

// HOW OLD EACH COUNTRY'S LAST PUBLISHED HOUSEHOLD SPENDING SURVEY IS. The bar
// is the gap between its fieldwork and today, because that gap is the quantity
// that makes the four numbers incomparable. The picture is of the problem
// rather than of the data.
const DATA_AGE = [
  { key: "gr", year: 2024 },
  { key: "pt", year: 2023 },
  { key: "mt", year: 2015 },
  { key: "ae", year: 2014 },
];
const TODAY_YEAR = 2026;

// --- Figure 1: what a purchase achieves -------------------------------------
// GROUPED BY ANSWER, NOT LISTED BY COUNTRY, and that is the whole reason this
// is a picture rather than the table already in the article. The table answers
// "what about Malta?" in one row; the reader's actual question is "which of
// these five works?", and grouping answers it without reading five rows.
function qualifies(L) {
  const width = 1200;
  // 530, not 620. The boxes were cut for the fullest column and three of the
  // four hold a single jurisdiction, so the first render was a row of tall
  // empty rectangles. Height now ends where the fullest column's content ends.
  // 596, up from 530. THE COLUMN NOTES NOW WRAP TO TWO LINES — at the larger
  // type "Первоисточник недоступен" ran 23px past the right margin on one line,
  // and the break is written into the copy rather than left to the renderer,
  // which does not wrap SVG text at all.
  // 552: the boxes end at 444 and the frame puts its rule at height − 68. The
  // first pass at 596 left 134px of nothing under them.
  const height = 552;
  const groups = ["yes", "partly", "no", "unknown"];
  const colW = 258;
  const gap = 20;
  let body = "";

  groups.forEach((state, i) => {
    const x = 48 + i * (colW + gap);
    const isYes = state === "yes";
    const stroke = state === "unknown" ? C.line : C.hairline;
    const fill = isYes ? C.accent : C.bg;
    const label = isYes ? C.onAccent : state === "no" ? C.pending : C.text;

    body += `<rect x="${x}" y="172" width="${colW}" height="272" fill="${fill}" stroke="${stroke}" stroke-width="1"${state === "unknown" ? ' stroke-dasharray="4 4"' : ""}/>`;
    body += text(x + 20, 212, L.states[state].label, {
      size: 12,
      weight: 500,
      tracking: 1.8,
      upper: true,
      fill: isYes ? C.onAccent : C.muted,
    });
    body += text(x + 20, 250, L.states[state].note, {
      size: 14,
      fill: isYes ? C.onAccent : C.muted,
    });

    const members = QUALIFY.filter((q) => q.state === state);
    members.forEach((m, j) => {
      const y = 330 + j * 68;
      body += `<line x1="${x + 20}" y1="${y - 26}" x2="${x + colW - 20}" y2="${y - 26}" stroke="${isYes ? "rgba(255,255,255,0.25)" : C.hairline}" stroke-width="1"/>`;
      body += text(x + 20, y, L.countries[m.key], {
        size: 19,
        weight: 500,
        fill: label,
      });
      body += text(x + 20, y + 26, L.thresholds[m.key], {
        size: 13,
        family: FONT_MONO,
        fill: isYes ? "rgba(255,255,255,0.75)" : C.muted,
      });
    });
  });

  return frame(width, height, L.figures.qualifies.title, L.eyebrow, L.checked(L.dates.property), body);
}

// --- Figure 2: the cost on top of the threshold -----------------------------
// ONE SERIES, SO NO LEGEND — the title names what the bars are. Direct labels
// on every bar rather than an axis to read against, because there are six of
// them and a gridline lookup for six values is work the picture should have
// done for the reader.
function cost(L) {
  const width = 1200;
  // 684, up from 600: at the larger type the last row's labels sat on the
  // explanatory note under them, and 664 left the note 21px under the last bar
  // — clear of it by the checker's reckoning and too close by eye.
  const height = 684;
  const max = 140000;
  // MEASURED, NOT GUESSED. At x0 = 330 the Russian row label "Греция, уровень
  // 400 000" ran straight through the threshold column beside it — caught by
  // rendering, not by reading. The label column is wider now and the amounts
  // came out of the labels entirely, because the threshold column was already
  // saying them.
  const x0 = 380;
  const x1 = width - 250;
  const scale = (v) => ((x1 - x0) * v) / max;
  let body = "";

  COST.forEach((row, i) => {
    const y = 200 + i * 68;
    body += text(48, y + 5, L.costRows[row.key], { size: 16, weight: 500 });
    body += text(x0 - 20, y + 5, row.tier, {
      size: 13,
      family: FONT_MONO,
      fill: C.muted,
      anchor: "end",
    });

    const w = scale(row.value);
    // 4px rounded end, anchored to the baseline at x0 — the mark spec the rest
    // of the site's charts use.
    body += `<path d="M${x0} ${y - 11} h${w - 4} a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}"/>`;

    if (row.to) {
      const w2 = scale(row.to);
      body += `<path d="M${x0 + w} ${y - 11} h${w2 - w - 4} a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-${w2 - w - 4} z" fill="${C.accent}" opacity="0.28"/>`;
      body += `<line x1="${x0 + w}" y1="${y - 15}" x2="${x0 + w}" y2="${y + 15}" stroke="${C.bg}" stroke-width="2"/>`;
    }

    const end = x0 + scale(row.to ?? row.value);
    body += text(end + 14, y + 5, L.amount(row.to ? [row.value, row.to] : row.value), {
      size: 15,
      family: FONT_MONO,
      fill: C.text,
    });
  });

  return frame(width, height, L.figures.cost.title, L.eyebrow, L.checked(L.dates.property), body, L.figures.cost.note);
}

// --- Figure 3 (ru, en): the Greek thresholds by zone ------------------------
// SEQUENTIAL, ONE HUE, DARKEST AT THE TOP. This is magnitude, not identity, so
// it takes a single hue at three steps rather than three colours — and the
// steps run with the amount, so the picture reads before the labels do.
function zones(L) {
  const width = 1200;
  // 620, up from 560: the bars are unchanged but the amounts inside them and
  // the descriptions beside them are a third larger, so the rows need the room.
  const height = 620;
  const x0 = 48;
  // THE BARS STOP AT 58% OF THE CANVAS so every description can sit to the
  // right of its own bar, on white. The first draft put the description inside
  // the bar, which broke twice over: on the 250 000 row the text was three
  // times the width of the bar and ran out onto the page, and on the middle row
  // muted grey on a half-opacity oxblood ground was the one contrast pairing
  // this site's tokens exist to prevent.
  const barMax = (width - 96) * 0.58;
  const labelX = x0 + barMax + 28;
  let body = "";

  ZONES.forEach((z, i) => {
    const y = 196 + i * 104;
    const w = barMax * z.weight;
    const opacity = [1, 0.62, 0.34][i];
    body += `<rect x="${x0}" y="${y}" width="${w}" height="72" fill="${C.accent}" opacity="${opacity}"/>`;
    body += text(x0 + 20, y + 46, z.amount, {
      size: 23,
      weight: 600,
      family: FONT_MONO,
      fill: i === 0 ? C.onAccent : C.text,
    });
    body += text(labelX, y + 30, L.zoneLabels[z.key], { size: 14, fill: C.muted });
  });

  return frame(width, height, L.figures.zones.title, L.eyebrow, L.checked(L.dates.property), body, L.figures.zones.note);
}

// --- Figure 3 (pl): who actually needs one of these -------------------------
// POLISH ONLY, and it replaces the zone ladder rather than joining it. A Polish
// reader holds an EU passport, so four of the five programmes give them nothing
// they do not already have; the question the picture has to answer first is not
// "how much" but "does this concern me at all". See the article.
function whoNeeds(L) {
  const width = 1200;
  // 646, and the two answer columns moved left: at the larger type the first
  // column head ran into the second one. It also wraps to two lines now —
  // moving the columns left a second time would have started eating the row
  // labels, which are the longest strings in the figure.
  const height = 632;
  const rows = ["eu", "family", "nonEu"];
  const colX = [48, 560, 916];
  let body = "";

  body += text(colX[1], 176, L.who.colEu, { size: 12, weight: 500, tracking: 1.8, upper: true, fill: C.muted });
  body += text(colX[2], 176, L.who.colAe, { size: 12, weight: 500, tracking: 1.8, upper: true, fill: C.muted });

  rows.forEach((r, i) => {
    const y = 272 + i * 100;
    body += `<line x1="48" y1="${y - 42}" x2="${width - 48}" y2="${y - 42}" stroke="${C.hairline}" stroke-width="1"/>`;
    body += text(colX[0], y, L.who.rows[r], { size: 17, weight: 500 });

    [["eu", colX[1]], ["ae", colX[2]]].forEach(([col, x]) => {
      const needed = L.who.matrix[r][col];
      body += `<rect x="${x}" y="${y - 32}" width="${col === "eu" ? 336 : 236}" height="48" fill="${needed ? C.accent : C.bg}" stroke="${needed ? C.accent : C.line}" stroke-width="1"/>`;
      body += text(x + 16, y + 1, needed ? L.who.needed : L.who.notNeeded, {
        size: 14,
        weight: 500,
        fill: needed ? C.onAccent : C.pending,
      });
    });
  });

  return frame(width, height, L.figures.who.title, L.eyebrow, L.checked(L.dates.property), body, L.who.note);
}

// --- Figure 4: which routes test income -------------------------------------
// TWO COLUMNS, BECAUSE THE CLAIM IS A CONTRAST. The article's table lists nine
// routes in one column and the reader has to hold "none" in mind while scanning
// down; side by side the three routes that ask nothing sit against the six that
// ask, and the point lands before a word is read.
//
// Colour carries status and the status also carries a word, per the rule at the
// top of this file: accent for a route that tests income, muted for one that
// does not, and each column is titled.
function incomeTests(L) {
  const width = 1200;
  // 760, not 700: the sixth row's amount sits at y=624 and the explanatory note
  // is drawn at height-92, so 700 would have put the note through it.
  const height = 760;
  const colX = [48, 636];
  const colW = 516;
  let body = "";

  [
    ["none", INCOME_TESTS.none, C.pending],
    ["tested", INCOME_TESTS.tested, C.accent],
  ].forEach(([group, rows, hue], col) => {
    const x = colX[col];

    body += `<rect x="${x}" y="176" width="${colW}" height="3" fill="${hue}"/>`;
    body += text(x, 216, L.incomeGroups[group], {
      size: 12,
      fill: C.muted,
      weight: 500,
      tracking: 2.2,
      upper: true,
    });

    rows.forEach((row, i) => {
      const y = 268 + i * 66;
      body += text(x, y, L.incomeRows[row.key], { size: 16, weight: 500 });
      body += text(x, y + 26, L.incomeAmounts[row.key], {
        size: 14,
        family: FONT_MONO,
        fill: group === "tested" ? C.text : C.muted,
      });
      if (i < rows.length - 1) {
        body += `<line x1="${x}" y1="${y + 44}" x2="${x + colW}" y2="${y + 44}" stroke="${C.hairline}" stroke-width="1"/>`;
      }
    });
  });

  return frame(
    width,
    height,
    L.figures.incomeTests.title,
    L.eyebrow,
    L.checked(L.dates.income),
    body,
    L.figures.incomeTests.note,
  );
}

// --- Figure 5: what Greece asks against what Greece costs -------------------
// THREE BARS, ONE SERIES, ONE UNIT. Everything here is euros a month, which is
// the only reason these three may share an axis at all — and the note says that
// two are 2026 legal figures and one is a 2024 survey, because a reader
// comparing them is entitled to know they are not the same kind of number.
function greeceScale(L) {
  const width = 1200;
  const height = 540;
  const max = 3600;
  const x0 = 430;
  const x1 = width - 260;
  const scale = (v) => ((x1 - x0) * v) / max;
  let body = "";

  GREECE_SCALE.forEach((row, i) => {
    const y = 232 + i * 82;
    body += text(48, y + 5, L.greeceRows[row.key], { size: 16, weight: 500 });
    const w = scale(row.value);
    body += `<path d="M${x0} ${y - 14} h${w - 4} a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}"/>`;
    body += text(x0 + w + 14, y + 5, L.amount(row.value), {
      size: 15,
      family: FONT_MONO,
      fill: C.text,
    });
  });

  return frame(
    width,
    height,
    L.figures.greeceScale.title,
    L.eyebrow,
    L.checked(L.dates.income),
    body,
    L.figures.greeceScale.note,
  );
}

// --- Figure 6: how old the official cost figures are ------------------------
// THE BAR IS THE GAP, NOT THE VALUE. Drawing the four countries' household
// spending side by side is exactly the comparison the article refuses to make;
// drawing how far each survey is from today makes the refusal legible in one
// look. Sequential, one hue, darkest where the data is oldest.
function dataAge(L) {
  const width = 1200;
  const height = 560;
  const x0 = 430;
  // 44px a year, not 52: at 52 the twelve-year bar plus its label ran past the
  // right margin. The longest bar now ends at 958 and its label at about 1106,
  // inside the 1152 the frame allows.
  const perYear = 44;
  let body = "";

  DATA_AGE.forEach((row, i) => {
    const y = 224 + i * 64;
    const years = TODAY_YEAR - row.year;
    body += text(48, y + 5, L.countries[row.key], { size: 16, weight: 500 });
    body += text(x0 - 20, y + 5, L.dataVintage[row.key], {
      size: 13,
      family: FONT_MONO,
      fill: C.muted,
      anchor: "end",
    });

    const w = years * perYear;
    // Opacity runs with the gap: the oldest survey is the darkest bar, so the
    // picture reads before the years are counted.
    const opacity = (0.35 + (0.65 * years) / 12).toFixed(2);
    body += `<path d="M${x0} ${y - 11} h${w - 4} a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}" opacity="${opacity}"/>`;
    body += text(x0 + w + 14, y + 5, L.yearsOld(years), {
      size: 14,
      family: FONT_MONO,
      fill: C.text,
    });
  });

  return frame(
    width,
    height,
    L.figures.dataAge.title,
    L.eyebrow,
    L.checked(L.dates.income),
    body,
    L.figures.dataAge.note,
  );
}

// --- Strings ----------------------------------------------------------------
const money = (locale) => (v) => {
  const f = (n) => new Intl.NumberFormat(locale === "en" ? "en-GB" : locale).format(n).replace(/ /g, " ");
  return Array.isArray(v) ? `${f(v[0])}–${f(v[1])} €` : `${f(v)} €`;
};

// SLAVIC PLURALS ARE NOT A SUFFIX. "2 года" but "11 лет", "2 lata" but "12 lat":
// the rule keys off the last two digits, and an English-shaped `n === 1 ? a : b`
// gets three of the four figures in this diagram wrong.
const slavicYears = (one, few, many) => (n) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
};
const ruYears = (n) => `${slavicYears("год", "года", "лет")(n)} назад`;
const plYears = (n) => `${slavicYears("rok", "lata", "lat")(n)} temu`;

const L = {
  ru: {
    eyebrow: "Гайды и исследования",
    // A FUNCTION OF THE DATE, not a sentence per figure. Two entries were
    // checked on two different days, and a second copy of this sentence with a
    // different date in it is a sentence that will eventually disagree with
    // itself in one language and not the others.
    checked: (date) => `Все цифры сверены с первоисточником ${date}`,
    dates: { property: "23 августа 2026 года", income: "28 августа 2026 года" },
    incomeGroups: { none: "Доход не проверяют", tested: "Доход проверяют" },
    incomeRows: {
      grGV: "Греция, ВНЖ за инвестиции",
      mtMPRP: "Мальта, MPRP",
      aeGV: "ОАЭ, золотая виза",
      ptARI: "Португалия, ВНЖ за инвестиции",
      ptD7: "Португалия, виза D7",
      grFIP: "Греция, финансово независимое лицо",
      grDN: "Греция, цифровой кочевник",
      mtNomad: "Мальта, цифровой кочевник",
      aeRemote: "ОАЭ, удалённая работа",
    },
    incomeAmounts: {
      grGV: "только стоимость объекта",
      mtMPRP: "активы, 500 000 €",
      aeGV: "только стоимость объекта",
      ptARI: "920 € в месяц",
      ptD7: "920 € в месяц",
      grFIP: "3 500 € в месяц",
      grDN: "3 500 € в месяц",
      mtNomad: "42 000 € в год",
      aeRemote: "5 000 $ в месяц",
    },
    greeceRows: {
      fip: "Требуется подтвердить",
      spend: "Тратит домохозяйство",
      wage: "Минимальная зарплата",
    },
    dataVintage: { gr: "2024", pt: "2022–2023", mt: "2015", ae: "2014" },
    yearsOld: ruYears,
    amount: money("ru"),
    countries: { gr: "Греция", ae: "ОАЭ", mt: "Мальта", pt: "Португалия", cy: "Кипр" },
    thresholds: {
      gr: "от 250 000 € по зонам",
      ae: "AED 2 000 000",
      mt: "375 000 € + взносы",
      pt: "фонд 500 000 €",
      cy: "не подтверждено",
    },
    states: {
      yes: { label: "Даёт ВНЖ", note: "Покупка\nи есть маршрут" },
      partly: { label: "Частично", note: "Один из пяти\nплатежей" },
      no: { label: "Не даёт", note: "Отменено\nв 2023 году" },
      unknown: { label: "Неизвестно", note: "Первоисточник\nнедоступен" },
    },
    costRows: {
      gr400: "Греция",
      gr800: "Греция",
      mtBuy: "Мальта, покупка",
      mtRent: "Мальта, аренда",
      ae: "ОАЭ",
      pt: "Португалия, фонд",
    },
    zoneLabels: {
      z800: "Аттика, Салоники, Миконос, Тира,\nострова свыше 3 100 человек",
      z400: "Остальная территория Греции",
      z250: "Только перевод в жильё или реставрация,\nработы завершены до подачи",
    },
    figures: {
      incomeTests: {
        title: "Какие маршруты проверяют доход, а какие нет",
        note: "Каждая сумма приведена в том периоде, в каком её устанавливает акт: у Мальты — за год, у ОАЭ — в долларах.",
      },
      greeceScale: {
        title: "Что Греция требует подтвердить и сколько там тратят",
        note: "Порог и минимальная зарплата — 2026 год; расходы домохозяйства — обследование за 2024 год.",
      },
      dataAge: {
        title: "Насколько устарела официальная статистика расходов",
        note: "Полоса — разрыв между годом наблюдения и сегодняшним днём. Именно он делает четыре цифры несопоставимыми.",
      },
      qualifies: { title: "Что даёт покупка недвижимости в пяти юрисдикциях" },
      cost: {
        title: "Сколько нужно сверх порога",
        note: "Португалия — диапазон: итог зависит от юриста и комиссий фонда. Полупрозрачная часть — верхняя граница.",
      },
      zones: {
        title: "Пороги золотой визы Греции по зонам",
        note: "Ст. 100 закона 5038/2023 в редакции ст. 64 закона 5100/2024. Действует с 1 сентября 2024 года.",
      },
    },
  },

  en: {
    eyebrow: "Guides & Research",
    checked: (date) => `Every figure checked against a primary source on ${date}`,
    dates: { property: "23 August 2026", income: "28 August 2026" },
    incomeGroups: { none: "No income test", tested: "Income tested" },
    incomeRows: {
      grGV: "Greece, investment permit",
      mtMPRP: "Malta, MPRP",
      aeGV: "UAE, golden visa",
      ptARI: "Portugal, investment permit",
      ptD7: "Portugal, D7 visa",
      grFIP: "Greece, financially independent",
      grDN: "Greece, digital nomad",
      mtNomad: "Malta, nomad permit",
      aeRemote: "UAE, virtual working",
    },
    incomeAmounts: {
      grGV: "property value only",
      mtMPRP: "assets, \u20ac500,000",
      aeGV: "property value only",
      ptARI: "\u20ac920 a month",
      ptD7: "\u20ac920 a month",
      grFIP: "\u20ac3,500 a month",
      grDN: "\u20ac3,500 a month",
      mtNomad: "\u20ac42,000 a year",
      aeRemote: "USD 5,000 a month",
    },
    greeceRows: {
      fip: "Required to prove",
      spend: "Average household spends",
      wage: "Minimum wage",
    },
    dataVintage: { gr: "2024", pt: "2022\u20132023", mt: "2015", ae: "2014" },
    yearsOld: (n) => `${n} ${n === 1 ? "year" : "years"} ago`,
    amount: money("en"),
    countries: { gr: "Greece", ae: "UAE", mt: "Malta", pt: "Portugal", cy: "Cyprus" },
    thresholds: {
      gr: "from €250,000 by zone",
      ae: "AED 2,000,000",
      mt: "€375,000 plus fees",
      pt: "€500,000 fund",
      cy: "not confirmed",
    },
    states: {
      yes: { label: "Qualifies", note: "Buying is\nthe route" },
      partly: { label: "Partly", note: "One of five\npayments" },
      no: { label: "Does not", note: "Abolished\nin 2023" },
      unknown: { label: "Unknown", note: "Primary source\nunreachable" },
    },
    costRows: {
      gr400: "Greece",
      gr800: "Greece",
      mtBuy: "Malta, purchase",
      mtRent: "Malta, rental",
      ae: "UAE",
      pt: "Portugal, fund",
    },
    zoneLabels: {
      z800: "Attica, Thessaloniki, Mykonos, Thira,\nislands over 3,100 people",
      z400: "The rest of Greece",
      z250: "Conversion or restoration only,\nworks completed before filing",
    },
    figures: {
      incomeTests: {
        title: "Which routes test income and which do not",
        note: "Each amount is stated in the period its instrument uses: Malta's is annual, the Emirati one is in dollars.",
      },
      greeceScale: {
        title: "What Greece asks you to prove against what Greece costs",
        note: "The threshold and the minimum wage are 2026 figures; household spending is the 2024 survey.",
      },
      dataAge: {
        title: "How old the official spending statistics are",
        note: "The bar is the gap between a survey's fieldwork and today. That gap is what makes the four figures incomparable.",
      },
      qualifies: { title: "What buying property achieves in five jurisdictions" },
      cost: {
        title: "What you need on top of the threshold",
        note: "Portugal is a range: the total turns on the lawyer and the fund's commissions. The lighter segment is the upper bound.",
      },
      zones: {
        title: "Greek golden visa thresholds by zone",
        note: "Art. 100 of Law 5038/2023 as amended by art. 64 of Law 5100/2024. In force since 1 September 2024.",
      },
    },
  },

  pl: {
    eyebrow: "Poradniki i badania",
    checked: (date) => `Każda liczba sprawdzona ze źródłem pierwotnym ${date}`,
    dates: { property: "23 sierpnia 2026 roku", income: "28 sierpnia 2026 roku" },
    incomeGroups: { none: "Bez badania dochodu", tested: "Dochód badany" },
    incomeRows: {
      grGV: "Grecja, pobyt za inwestycję",
      mtMPRP: "Malta, MPRP",
      aeGV: "Emiraty, złota wiza",
      ptARI: "Portugalia, pobyt za inwestycję",
      ptD7: "Portugalia, wiza D7",
      grFIP: "Grecja, niezależny finansowo",
      grDN: "Grecja, cyfrowy nomada",
      mtNomad: "Malta, pobyt nomady",
      aeRemote: "Emiraty, praca zdalna",
    },
    incomeAmounts: {
      grGV: "tylko wartość nieruchomości",
      mtMPRP: "majątek, 500 000 €",
      aeGV: "tylko wartość nieruchomości",
      ptARI: "920 € miesięcznie",
      ptD7: "920 € miesięcznie",
      grFIP: "3500 € miesięcznie",
      grDN: "3500 € miesięcznie",
      mtNomad: "42 000 € rocznie",
      aeRemote: "5000 $ miesięcznie",
    },
    greeceRows: {
      fip: "Trzeba udokumentować",
      spend: "Wydaje gospodarstwo",
      wage: "Płaca minimalna",
    },
    dataVintage: { gr: "2024", pt: "2022–2023", mt: "2015", ae: "2014" },
    yearsOld: plYears,
    amount: money("pl"),
    countries: { gr: "Grecja", ae: "ZEA", mt: "Malta", pt: "Portugalia", cy: "Cypr" },
    thresholds: {
      gr: "od 250 000 € wg stref",
      ae: "AED 2 000 000",
      mt: "375 000 € plus opłaty",
      pt: "fundusz 500 000 €",
      cy: "niepotwierdzone",
    },
    states: {
      yes: { label: "Kwalifikuje", note: "Zakup to\ncała trasa" },
      partly: { label: "Częściowo", note: "Jedna z pięciu\npłatności" },
      no: { label: "Nie daje", note: "Zniesione\nw 2023 roku" },
      unknown: { label: "Nieznane", note: "Źródło\nniedostępne" },
    },
    costRows: {
      gr400: "Grecja",
      gr800: "Grecja",
      mtBuy: "Malta, zakup",
      mtRent: "Malta, najem",
      ae: "ZEA",
      pt: "Portugalia, fundusz",
    },
    who: {
      colEu: "Grecja, Malta,\nPortugalia, Cypr",
      colAe: "ZEA",
      rows: {
        eu: "Obywatel Polski lub innej UE",
        family: "Członek rodziny obywatela UE spoza Unii",
        nonEu: "Osoba spoza UE mieszkająca w Polsce",
      },
      matrix: {
        eu: { eu: false, ae: true },
        family: { eu: false, ae: true },
        nonEu: { eu: true, ae: true },
      },
      needed: "Potrzebuje",
      notNeeded: "Nie potrzebuje",
      note: "Obywatel UE ma swobodę przepływu osób. Polska karta pobytu nie daje prawa zamieszkania w innym państwie członkowskim.",
    },
    figures: {
      incomeTests: {
        title: "Które ścieżki badają dochód, a które nie",
        note: "Każda kwota podana w okresie, którego używa jej akt: maltańska jest roczna, emiracka w dolarach.",
      },
      greeceScale: {
        title: "Ile Grecja każe udokumentować, a ile tam się wydaje",
        note: "Próg i płaca minimalna to dane za 2026 rok; wydatki gospodarstwa domowego to badanie za 2024 rok.",
      },
      dataAge: {
        title: "Jak stare są oficjalne statystyki wydatków",
        note: "Słupek to odstęp między rokiem badania a dniem dzisiejszym. To on sprawia, że czterech liczb nie da się porównać.",
      },
      qualifies: { title: "Co daje zakup nieruchomości w pięciu jurysdykcjach" },
      cost: {
        title: "Ile trzeba ponad próg",
        note: "Portugalia to przedział: całość zależy od prawnika i prowizji funduszu. Jaśniejszy segment to górna granica.",
      },
      who: { title: "Komu te programy są rzeczywiście potrzebne" },
    },
  },
};

// --- Emit -------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });

// TWO ENTRIES' FIGURES, ONE GENERATOR. The list is per language rather than per
// entry because that is what the filename carries; which entry a figure belongs
// to is recorded in scripts/articles.ts, where the marker order lives.
const PLAN = {
  ru: [
    ["qualifies", qualifies],
    ["cost", cost],
    ["zones", zones],
    ["income-tests", incomeTests],
    ["greece-scale", greeceScale],
    ["data-age", dataAge],
  ],
  en: [
    ["qualifies", qualifies],
    ["cost", cost],
    ["zones", zones],
    ["income-tests", incomeTests],
    ["greece-scale", greeceScale],
    ["data-age", dataAge],
  ],
  pl: [
    ["qualifies", qualifies],
    ["cost", cost],
    ["who", whoNeeds],
    ["income-tests", incomeTests],
    ["greece-scale", greeceScale],
    ["data-age", dataAge],
  ],
};

let n = 0;
for (const [locale, figures] of Object.entries(PLAN)) {
  for (const [name, draw] of figures) {
    const file = join(OUT, `${name}-${locale}.svg`);
    writeFileSync(file, draw(L[locale]), "utf8");
    console.log(`  ${name}-${locale}.svg`);
    n += 1;
  }
}
console.log(`${n} figures written to public/figures`);
