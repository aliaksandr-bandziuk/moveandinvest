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

// --- The Portugal guide's numbers --------------------------------------------

// FOUR ROUTES, AND THE FOURTH IS AN ABSENCE. Drawing the abolished property
// route as a row rather than leaving it out is the whole point: a reader who
// has been reading advertisements is looking for it, and a diagram that simply
// omits it answers a question they did not ask.
const PT_ROUTES = [
  { key: "d7", visa: true, income: true },
  { key: "d8", visa: true, income: false },
  { key: "ari", visa: false, income: true },
  { key: "property", gone: true },
];

// The naturalisation clock either side of 19 May 2026. Bar length is years, so
// the doubling is the picture.
const PT_CLOCK = [
  { key: "before", years: 5 },
  { key: "eu", years: 7 },
  { key: "other", years: 10 },
];

// WHAT THE INSTRUMENT SAYS AGAINST WHAT IS PUBLISHED. Named sites, because an
// audit of other people's figures is only fair if it is specific — and because
// an unnamed "some pages say" is the same rhetorical move this site exists to
// avoid.
const PT_PUBLISHED = [
  { key: "law", ok: true },
  { key: "wise", ok: false },
  { key: "greenback", ok: false },
  { key: "d8", ok: false },
  { key: "ggv", ok: false },
];

// --- The Greece guide's numbers ----------------------------------------------

// FOUR ROWS FOR THREE THRESHOLDS, and the duplication is the finding. Art. 100
// §2 has four points, two of which set €250,000 for different things, and the
// minimum floor area appears in only the first two. A three-row diagram would
// have to merge (c) and (d) and would then have nowhere to put the fact that
// neither of them carries the 120 m² rule that half this market prints as a
// rule of the programme.
const GR_TIERS = [
  { key: "t800", area: true },
  { key: "t400", area: true },
  { key: "t250c", area: false },
  { key: "t250d", area: false },
];

// THE SAME PERMIT, TWICE, DIFFERING ONLY IN WHERE ITS HOLDER SLEEPS. Two tracks
// rather than one, because the point is not a quantity — it is that one input
// produces two outcomes, and a single bar cannot say that.
const GR_PRESENCE = [
  { key: "resident", counts: true },
  { key: "visitor", counts: false },
];

// Bar length is the number of tax years, so 5Γ being half the others is the
// picture. One hue at three steps: this is duration, which is magnitude.
const GR_TAX = [
  { key: "a", years: 15 },
  { key: "b", years: 15 },
  { key: "c", years: 7 },
];

// --- The Greece living guide's numbers ---------------------------------------
// ELSTAT Household Budget Survey 2024, plus two commercial rent datasets. The
// survey is a state instrument; the rent figures are not, and the third figure
// below says so on its face rather than in a footnote, because the whole point
// of drawing them is that they measure different things.

// Shares of the average household budget. The remainder is unlabelled on
// purpose: naming it "other" would imply the survey groups it that way.
const GR_BUDGET = [
  { key: "food", share: 20.7, eur: 356.68 },
  { key: "housing", share: 14.4, eur: 247.51 },
  { key: "transport", share: 13.3, eur: 229.75 },
  { key: "eatingOut", share: 11.8, eur: 203.87 },
  { key: "health", share: 7.8, eur: 134.46 },
];

// Monthly household expenditure by region, against the national average. The
// two extremes and the middle: drawing all thirteen regions would be a chart
// nobody reads to learn that Attica is dear.
const GR_REGIONS = [
  { key: "attica", eur: 2030.27, pct: 117.7 },
  { key: "national", eur: 1724.54, pct: 100 },
  { key: "sterea", eur: 1184.58, pct: 68.7 },
];

// Asking range against the concluded average, per square metre. `ask` is a
// range because listings are a range; `signed` is a point because a lease is.
const GR_RENT = [
  { key: "attica", askLow: 7.5, askHigh: 22.0, signed: 9.2 },
  { key: "thessaloniki", askLow: 4.9, askHigh: 12.0, signed: 7.7 },
];

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

// --- Figure 7: which Portuguese routes still exist --------------------------
// A MATRIX, NOT A LIST, because the reader's question has two axes: does this
// route need a visa, and does it test income. The investment permit is the row
// that pays for the picture — no visa, income tested anyway.
function ptRoutes(L) {
  const width = 1200;
  // 700, not 620: the last row's second line sits at y=540 and the note is drawn
  // at height-92, so 620 put the note through it — caught by check.mjs, not by
  // reading the arithmetic.
  const height = 700;
  // 620 and 830, not 700 and 950. At the wider positions the Polish "ustawa nie
  // podaje kwoty" and the Russian "ПРОВЕРКА ДОХОДА" ran past the right margin:
  // the same label is a third longer in Slavic languages than in English, and a
  // column placed to fit the English one is a column that fits only English.
  const xVisa = 620;
  const xIncome = 830;
  let body = "";

  body += text(xVisa, 214, L.ptCols.visa, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xIncome, 214, L.ptCols.income, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="48" y1="232" x2="${width - 48}" y2="232" stroke="${C.hairline}" stroke-width="1"/>`;

  PT_ROUTES.forEach((row, i) => {
    const y = 286 + i * 76;
    const fade = row.gone ? 0.55 : 1;
    body += `<g opacity="${fade}">`;
    body += text(48, y, L.ptRoutes[row.key], { size: 17, weight: 500 });
    body += text(48, y + 26, L.ptRouteNotes[row.key], { size: 13, fill: C.muted });
    if (row.gone) {
      body += text(xVisa, y, L.ptCells.gone, { size: 15, fill: C.muted, family: FONT_MONO });
    } else {
      body += text(xVisa, y, row.visa ? L.ptCells.yes : L.ptCells.no, {
        size: 15, family: FONT_MONO, fill: row.visa ? C.text : C.muted,
      });
      body += text(xIncome, y, row.income ? L.ptCells.tested : L.ptCells.silent, {
        size: 15, family: FONT_MONO, fill: row.income ? C.accent : C.muted,
      });
    }
    body += `</g>`;
    if (i < PT_ROUTES.length - 1) {
      body += `<line x1="48" y1="${y + 44}" x2="${width - 48}" y2="${y + 44}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(width, height, L.figures.ptRoutes.title, L.eyebrow, L.checked(L.dates.portugal), body, L.figures.ptRoutes.note);
}

// --- Figure 8: the naturalisation clock -------------------------------------
// SEQUENTIAL, ONE HUE, DARKEST AT THE LONGEST WAIT. This is magnitude — years —
// so it takes one hue at three steps rather than three colours.
function ptClock(L) {
  const width = 1200;
  // 620 and x0 620: at the previous values the label "EU and Portuguese-speaking
  // country nationals" ran UNDER its own bar, and the note sat 24px below the
  // last row and read as a caption on it. Neither was caught by check.mjs,
  // which measures text against text and against the margins but not against
  // the bars — see the note at the top of that file.
  const height = 620;
  const x0 = 620;
  // 40, so the ten-year bar plus its label ends at about 1136, inside 1152.
  const perYear = 40;
  let body = "";

  PT_CLOCK.forEach((row, i) => {
    const y = 250 + i * 84;
    body += text(48, y, L.ptClock[row.key], { size: 16, weight: 500 });
    body += text(48, y + 26, L.ptClockNotes[row.key], { size: 13, fill: C.muted });
    const w = row.years * perYear;
    const opacity = (0.4 + (0.6 * row.years) / 10).toFixed(2);
    body += `<path d="M${x0} ${y - 14} h${w - 4} a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}" opacity="${opacity}"/>`;
    body += text(x0 + w + 14, y + 5, L.ptYears(row.years), { size: 15, family: FONT_MONO, fill: C.text });
  });

  return frame(width, height, L.figures.ptClock.title, L.eyebrow, L.checked(L.dates.portugal), body, L.figures.ptClock.note);
}

// --- Figure 9: the instrument against what is published ---------------------
// COLOUR CARRIES STATUS AND THE STATUS ALSO CARRIES A WORD, per the rule at the
// top of this file: the statutory row is accent, the published ones are muted,
// and each says in text what it is.
function ptPublished(L) {
  const width = 1200;
  // 760: five rows at 82px put the last second line at 594, and the note is
  // drawn at height-92.
  const height = 760;
  let body = "";

  PT_PUBLISHED.forEach((row, i) => {
    const y = 240 + i * 82;
    const hue = row.ok ? C.accent : C.muted;
    body += `<rect x="48" y="${y - 22}" width="4" height="52" fill="${hue}"/>`;
    body += text(76, y, L.ptPublished[row.key], { size: 16, weight: 500 });
    body += text(76, y + 26, L.ptPublishedNotes[row.key], { size: 13, fill: C.muted });
    body += text(width - 48, y, L.ptPublishedFigures[row.key], {
      size: 16, family: FONT_MONO, fill: row.ok ? C.text : C.muted, anchor: "end",
    });
    if (i < PT_PUBLISHED.length - 1) {
      body += `<line x1="48" y1="${y + 44}" x2="${width - 48}" y2="${y + 44}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(width, height, L.figures.ptPublished.title, L.eyebrow, L.checked(L.dates.portugal), body, L.figures.ptPublished.note);
}

// --- The Emirates guide's numbers --------------------------------------------

// THE CHAIN OF AUTHORITY, AND THE LINK THAT IS MISSING. Three rows have an
// instrument and the fourth has an empty box, which is the whole article: the
// federal threshold is published and checkable, and the two Dubai changes of
// 2026 that thousands are applying under are in no register at all.
const AE_CHAIN = [
  { key: "decree", has: true },
  { key: "regulation", has: true },
  { key: "fee", has: true },
  { key: "dubai2026", has: false },
];

// WHO IS EXEMPT FROM THE 180-DAY RULE, by the words of art. 60 rather than by
// what the market says. Drawn as presence/absence rather than as a quantity:
// the point is that a category either appears in the list or does not.
const AE_ABSENCE = [
  { key: "investor", state: "named" },
  { key: "talent", state: "unnamed" },
  { key: "student", state: "unnamed" },
  { key: "humanitarian", state: "unnamed" },
];

// TWO COLUMNS, NOT A BAR CHART, because the left-hand side has no rate to draw:
// income, gains, inheritance and wealth are untaxed by the absence of a
// charging provision, and drawing them as zero bars would state a rate that no
// instrument sets.
const AE_TAX = [
  { key: "vat", rate: "5%" },
  { key: "transfer", rate: "4%" },
  { key: "housing", rate: "5%", untraced: true },
  { key: "corporate", rate: "9%" },
];

// --- Figure 10: the four points of article 100 §2 ----------------------------
// THE RIGHT-HAND COLUMN IS THE WHOLE REASON THIS EXISTS. Thresholds by zone are
// already drawn in `zones` for the first entry; what is not drawn anywhere, on
// this site or anyone else's, is that the 120 m² minimum lives in §2(a) and
// §2(b) and in neither of the two €250,000 points.
function grTiers(L) {
  const width = 1200;
  // 760: the last row's note wraps to a second line at y=634, and the frame
  // puts its own note at height − 92.
  const height = 760;
  const xLabel = 270;
  let body = "";

  body += text(width - 48, 214, L.grTierCol, {
    size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true, anchor: "end",
  });
  body += `<line x1="48" y1="232" x2="${width - 48}" y2="232" stroke="${C.hairline}" stroke-width="1"/>`;

  GR_TIERS.forEach((row, i) => {
    const y = 280 + i * 100;
    body += text(48, y, L.grTierAmounts[row.key], {
      size: 18, weight: 600, family: FONT_MONO, fill: C.text,
    });
    body += text(xLabel, y, L.grTierLabels[row.key], { size: 16, weight: 500 });
    body += text(xLabel, y + 26, L.grTierNotes[row.key], { size: 13, fill: C.muted });
    body += text(width - 48, y, row.area ? L.grTierArea.yes : L.grTierArea.no, {
      size: 15, family: FONT_MONO, anchor: "end",
      fill: row.area ? C.accent : C.muted,
    });
    if (i < GR_TIERS.length - 1) {
      body += `<line x1="48" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(width, height, L.figures.grTiers.title, L.eyebrow, L.checked(L.dates.greece), body, L.figures.grTiers.note);
}


// --- Malta ------------------------------------------------------------------
// Every line of what one MPRP applicant pays ABOVE the price of the property,
// on each of the two routes. Written once here, in euro, and the words come
// from L — see the note at the top of this file about why a figure's numbers
// may not be duplicated per language.
//
// The two totals are NOT the sum of the rows drawn. Notary and legal fees are
// real, are not a published tariff, and are the difference between €118,250 of
// listed items and the ~€126,000 the guide states. So the rows are drawn, the
// total is drawn, and the gap between them is what the note explains rather
// than something the picture pretends is not there.
const MT_COST = {
  buy: [
    { key: "stamp", value: 18750 },
    { key: "admin", value: 60000 },
    { key: "contribution", value: 37000 },
    { key: "ngo", value: 2000 },
    { key: "card", value: 500 },
  ],
  rent: [
    { key: "rent", value: 14000 },
    { key: "admin", value: 60000 },
    { key: "contribution", value: 37000 },
    { key: "ngo", value: 2000 },
    { key: "card", value: 500 },
  ],
  buyTotal: 126000,
  rentTotal: 113500,
};

// Months of the year each route requires you to be in Malta. Twelve boxes is
// the common unit; `months: null` is the case this whole figure exists for.
const MT_PRESENCE = [
  { key: "mprp", months: null },
  { key: "nomad", months: 5 },
  { key: "naturalisation", months: 12 },
];

// The three gates, each with the instrument that decides it. Drawn as a table
// rather than a flow, because they are not sequential — you can pass any one
// without the others.
const MT_TESTS = ["live", "taxed", "taxedOn"];

// --- Figure 11: the same permit, two outcomes --------------------------------
// THE YEAR NUMBERS ARE DRAWN INSIDE THEIR BLOCKS ON PURPOSE. check.mjs flags a
// label that grows into a bar from outside it; a label centred within one does
// not trip that, which is the distinction that check was narrowed to make.
function grPresence(L) {
  const width = 1200;
  const height = 664;
  const boxW = 120;
  const boxGap = 12;
  const xResult = 730;
  let body = "";

  GR_PRESENCE.forEach((track, i) => {
    const top = 200 + i * 196;
    body += text(48, top, L.grPresence[track.key], { size: 17, weight: 500 });
    body += text(48, top + 26, L.grPresenceNotes[track.key], { size: 13, fill: C.muted });

    const boxTop = top + 50;
    for (let yearIndex = 0; yearIndex < 5; yearIndex += 1) {
      const x = 48 + yearIndex * (boxW + boxGap);
      if (track.counts) {
        body += `<rect x="${x}" y="${boxTop}" width="${boxW}" height="60" fill="${C.accent}"/>`;
      } else {
        body += `<rect x="${x}" y="${boxTop}" width="${boxW}" height="60" fill="${C.bg}" stroke="${C.line}" stroke-width="1" stroke-dasharray="4 4"/>`;
      }
      body += text(x + boxW / 2, boxTop + 38, String(yearIndex + 1), {
        size: 16, family: FONT_MONO, anchor: "middle",
        fill: track.counts ? C.onAccent : C.muted,
      });
    }

    body += text(xResult, boxTop + 22, L.grPresenceResults[track.key], {
      size: 16, weight: 500, fill: track.counts ? C.accent : C.muted,
    });
    body += text(xResult, boxTop + 48, L.grPresenceResultNotes[track.key], {
      size: 13, fill: C.muted,
    });
  });

  return frame(width, height, L.figures.grPresence.title, L.eyebrow, L.checked(L.dates.greece), body, L.figures.grPresence.note);
}

// --- Figure 12: the three special tax regimes --------------------------------
function grTax(L) {
  const width = 1200;
  const height = 664;
  const x0 = 700;
  // 22, so the fifteen-year bar ends at 1030 and its label clears the margin.
  const perYear = 22;
  let body = "";

  GR_TAX.forEach((row, i) => {
    const y = 240 + i * 108;
    body += text(48, y, L.grTax[row.key], { size: 17, weight: 500 });
    body += text(48, y + 26, L.grTaxNotes[row.key], { size: 13, fill: C.muted });
    body += text(48, y + 48, L.grTaxPrior[row.key], { size: 13, fill: C.muted });
    const w = row.years * perYear;
    const opacity = (0.4 + (0.6 * row.years) / 15).toFixed(2);
    body += `<path d="M${x0} ${y - 14} h${w - 4} a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}" opacity="${opacity}"/>`;
    body += text(x0 + w + 14, y + 5, L.ptYears(row.years), { size: 15, family: FONT_MONO, fill: C.text });
  });

  return frame(width, height, L.figures.grTax.title, L.eyebrow, L.checked(L.dates.greece), body, L.figures.grTax.note);
}

// --- Figure 13: the chain of authority, and the missing link -----------------
function aeChain(L) {
  const width = 1200;
  // 760: the last row's second line sits at y=614 and the frame draws its own
  // note at height − 92. At 700 the two overlapped, which check.mjs caught
  // and arithmetic did not.
  const height = 760;
  let body = "";

  body += text(width - 48, 214, L.aeChainCol, {
    size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true, anchor: "end",
  });
  body += `<line x1="48" y1="232" x2="${width - 48}" y2="232" stroke="${C.hairline}" stroke-width="1"/>`;

  AE_CHAIN.forEach((row, i) => {
    const y = 288 + i * 100;
    // The rule of this file: colour carries status and the status also carries
    // a word. The missing row is dashed AND says so in text.
    body += `<rect x="48" y="${y - 26}" width="4" height="56" fill="${row.has ? C.accent : C.line}"/>`;
    body += text(76, y, L.aeChain[row.key], { size: 16, weight: 500, fill: row.has ? C.text : C.muted });
    body += text(76, y + 26, L.aeChainNotes[row.key], { size: 13, fill: C.muted });
    body += text(width - 48, y, row.has ? L.aeChainCells.yes : L.aeChainCells.no, {
      size: 15, family: FONT_MONO, anchor: "end", fill: row.has ? C.text : C.muted,
    });
    if (i < AE_CHAIN.length - 1) {
      body += `<line x1="48" y1="${y + 48}" x2="${width - 48}" y2="${y + 48}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(width, height, L.figures.aeChain.title, L.eyebrow, L.checked(L.dates.uae), body, L.figures.aeChain.note);
}

// --- Figure 14: who art. 60 actually names -----------------------------------
function aeAbsence(L) {
  const width = 1200;
  const height = 620;
  const colW = 258;
  const gap = 20;
  let body = "";

  AE_ABSENCE.forEach((row, i) => {
    const x = 48 + i * (colW + gap);
    const named = row.state === "named";
    body += `<rect x="${x}" y="212" width="${colW}" height="220" fill="${named ? C.accent : C.bg}" stroke="${named ? C.accent : C.line}" stroke-width="1"${named ? "" : ' stroke-dasharray="4 4"'}/>`;
    body += text(x + 20, 252, L.aeAbsence[row.key], {
      size: 16, weight: 500, fill: named ? C.onAccent : C.text,
    });
    body += text(x + 20, 296, L.aeAbsenceNotes[row.key], {
      size: 13, fill: named ? C.onAccent : C.muted,
    });
    body += text(x + 20, 404, named ? L.aeAbsenceCells.named : L.aeAbsenceCells.unnamed, {
      size: 12, weight: 500, tracking: 1.8, upper: true,
      fill: named ? C.onAccent : C.pending,
    });
  });

  return frame(width, height, L.figures.aeAbsence.title, L.eyebrow, L.checked(L.dates.uae), body, L.figures.aeAbsence.note);
}

// --- Figure 15: what an individual actually pays ------------------------------
function aeTax(L) {
  const width = 1200;
  const height = 700;
  let body = "";

  body += text(48, 200, L.aeTaxHeads.none, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(620, 200, L.aeTaxHeads.some, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="48" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  // Left column: the four with no charging provision. No rate is drawn, because
  // no instrument sets one — see the note above AE_TAX.
  L.aeTaxNone.forEach((label, i) => {
    const y = 262 + i * 46;
    body += text(48, y, label, { size: 16, fill: C.muted });
  });
  body += text(48, 262 + L.aeTaxNone.length * 46 + 12, L.aeTaxNoneNote, { size: 13, fill: C.muted });

  AE_TAX.forEach((row, i) => {
    const y = 262 + i * 78;
    body += text(620, y, L.aeTax[row.key], { size: 16, weight: 500 });
    body += text(620, y + 24, L.aeTaxNotes[row.key], {
      size: 13, fill: row.untraced ? C.accent : C.muted,
    });
    body += text(width - 48, y, row.rate, {
      size: 18, weight: 600, family: FONT_MONO, anchor: "end", fill: C.text,
    });
  });

  return frame(width, height, L.figures.aeTax.title, L.eyebrow, L.checked(L.dates.uae), body, L.figures.aeTax.note);
}


// --- Malta 1: every line of the cost, on both routes -------------------------
// TWO COLUMNS AND NOT A STACKED BAR, and the first draft was a stacked bar.
// Five segments of which two are €2,000 and €500 cannot carry a label inside
// them at this width, and check.mjs is right to fail a label that grows out of
// the shape it belongs to. A table states the same five numbers and states them
// legibly, which is the whole job.
function mtCost(L) {
  const width = 1200;
  const height = 700;
  const xRight = 620;
  let body = "";

  body += text(48, 200, L.mtCostHeads.buy, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xRight, 200, L.mtCostHeads.rent, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="48" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  const column = (x, rows, total, totalLabel) => {
    rows.forEach((row, i) => {
      const y = 262 + i * 52;
      body += text(x, y, L.mtCost[row.key], { size: 16 });
      body += text(x + 500, y, L.amount(row.value), {
        size: 17, family: FONT_MONO, anchor: "end", fill: C.text,
      });
    });
    const yTotal = 262 + rows.length * 52 + 22;
    body += `<line x1="${x}" y1="${yTotal - 30}" x2="${x + 500}" y2="${yTotal - 30}" stroke="${C.line}" stroke-width="1"/>`;
    body += text(x, yTotal, totalLabel, { size: 16, weight: 600 });
    body += text(x + 500, yTotal, L.amount(total), {
      size: 19, weight: 600, family: FONT_MONO, anchor: "end", fill: C.accent,
    });
  };

  column(48, MT_COST.buy, MT_COST.buyTotal, L.mtCostTotals.buy);
  column(xRight, MT_COST.rent, MT_COST.rentTotal, L.mtCostTotals.rent);

  return frame(width, height, L.figures.mtCost.title, L.eyebrow, L.checked(L.dates.malta), body, L.figures.mtCost.note);
}

// --- Malta 2: months of the year each route demands --------------------------
// THE ROW THAT IS THE POINT IS THE EMPTY ONE. Twelve dashed boxes and a word,
// because a blank row reads as an oversight and the finding is that Malta
// publishes nothing here. The word is drawn in the accent for the same reason
// every status on this site carries one: colour alone does not survive a
// printout or a colourblind reader.
function mtPresence(L) {
  const width = 1200;
  // 720, not 664. At 664 the third row's boxes ended at y=580 and the frame
  // draws its own note at height − 92 = 572, so the note ran through the last
  // bar. check.mjs caught it; the arithmetic in my head did not.
  const height = 720;
  const boxW = 58;
  const boxGap = 8;
  let body = "";

  MT_PRESENCE.forEach((track, i) => {
    const top = 210 + i * 140;
    body += text(48, top, L.mtPresence[track.key], { size: 17, weight: 500 });
    // THE RESULT IS RIGHT-ALIGNED ON THE LABEL LINE, not in a column beside the
    // boxes. Twelve boxes reach x=832 and the margin is 1152, which left 252px
    // for a phrase that is 274px in Russian and 283px in Polish — so the first
    // draft put two of the three labels off the canvas. Anchoring to the right
    // margin cannot overflow it whatever the language does to the wording.
    body += text(width - 48, top, L.mtPresenceResults[track.key], {
      size: 16, weight: 500, anchor: "end",
      fill: track.months === null ? C.accent : C.text,
    });
    body += text(48, top + 26, L.mtPresenceNotes[track.key], { size: 13, fill: C.muted });

    const boxTop = top + 48;
    for (let m = 0; m < 12; m += 1) {
      const x = 48 + m * (boxW + boxGap);
      const filled = track.months !== null && m < track.months;
      if (filled) {
        body += `<rect x="${x}" y="${boxTop}" width="${boxW}" height="42" fill="${C.accent}"/>`;
      } else {
        body += `<rect x="${x}" y="${boxTop}" width="${boxW}" height="42" fill="${C.bg}" stroke="${C.line}" stroke-width="1" stroke-dasharray="4 4"/>`;
      }
    }
  });

  return frame(width, height, L.figures.mtPresence.title, L.eyebrow, L.checked(L.dates.malta), body, L.figures.mtPresence.note);
}

// --- Malta 3: three gates, three instruments ---------------------------------
function mtTests(L) {
  const width = 1200;
  const height = 620;
  const xInstrument = 700;
  let body = "";

  body += text(48, 200, L.mtTestsHeads.question, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xInstrument, 200, L.mtTestsHeads.decidedBy, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="48" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  MT_TESTS.forEach((key, i) => {
    const y = 268 + i * 108;
    body += text(48, y, L.mtTests[key], { size: 17, weight: 500 });
    body += text(48, y + 26, L.mtTestsNotes[key], { size: 13, fill: C.muted });
    body += text(xInstrument, y, L.mtTestsInstruments[key], {
      size: 15, family: FONT_MONO, fill: C.text,
    });
    if (i < MT_TESTS.length - 1) {
      body += `<line x1="48" y1="${y + 58}" x2="${width - 48}" y2="${y + 58}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(width, height, L.figures.mtTests.title, L.eyebrow, L.checked(L.dates.malta), body, L.figures.mtTests.note);
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
    // --- Malta ---------------------------------------------------------------
    mtCostHeads: { buy: "Маршрут покупки, сверх цены объекта", rent: "Маршрут аренды, первый год" },
    mtCost: {
      stamp: "Гербовый сбор, 5%",
      admin: "Административный сбор",
      contribution: "Государственный взнос",
      ngo: "Пожертвование НКО",
      card: "Карта резидента",
      rent: "Аренда за год",
    },
    mtCostTotals: { buy: "Итого сверх цены", rent: "Итого за первый год" },
    mtPresence: {
      mprp: "Постоянное резидентство",
      nomad: "Кочевой пермит",
      naturalisation: "Натурализация, последний год",
    },
    mtPresenceNotes: {
      mprp: "Около 126 000 € сверх цены объекта",
      nomad: "Порог дохода 42 000 € в год",
      naturalisation: "Плюс четыре года внутри шести до него",
    },
    mtPresenceResults: {
      mprp: "Правило не опубликовано",
      nomad: "5 месяцев из 12",
      naturalisation: "12 месяцев непрерывно",
    },
    mtTestsHeads: { question: "Вопрос", decidedBy: "Чем решается" },
    mtTests: {
      live: "Можно ли вам жить на Мальте",
      taxed: "Облагает ли вас Мальта",
      taxedOn: "С чего именно облагает",
    },
    mtTestsNotes: {
      live: "На это и отвечает сертификат MPRP",
      taxed: "Сертификат к этому отношения не имеет",
      taxedOn: "Всемирный доход либо только переведённое",
    },
    mtTestsInstruments: {
      live: "S.L. 217.26",
      taxed: "Более 183 дней в году",
      taxedOn: "Домицилий и обычное резидентство",
    },
    eyebrow: "Гайды и исследования",
    // A FUNCTION OF THE DATE, not a sentence per figure. Two entries were
    // checked on two different days, and a second copy of this sentence with a
    // different date in it is a sentence that will eventually disagree with
    // itself in one language and not the others.
    checked: (date) => `Все цифры сверены с первоисточником ${date}`,
    dates: { property: "23 августа 2026 года", income: "28 августа 2026 года" , portugal: "28 августа 2026 года", greece: "28 августа 2026 года"  , uae: "30 августа 2026 года", malta: "1 сентября 2026 года" },
    ptCols: { visa: "Нужна виза", income: "Проверка дохода" },
    ptRoutes: {
      d7: "D7, собственный доход",
      d8: "D8, удалённая работа",
      ari: "ВНЖ за инвестиции",
      property: "Покупка недвижимости",
    },
    ptRouteNotes: {
      d7: "Пенсия, аренда, дивиденды, роялти",
      d8: "Подтверждение трудовых отношений",
      ari: "Фонд 500 000 € или другой маршрут",
      property: "Отменена в 2023 году, замены нет",
    },
    ptCells: { yes: "да", no: "нет", tested: "920 € в месяц", silent: "в законе нет суммы", gone: "маршрута нет" },
    ptClock: {
      before: "Подано до 18 мая 2026",
      eu: "Граждане ЕС и португалоязычных стран",
      other: "Все остальные",
    },
    ptClockNotes: {
      before: "Решается по прежней редакции закона",
      eu: "Ст. 6(1)(b) Lei Orgânica 1/2026",
      other: "Ст. 6(1)(b) Lei Orgânica 1/2026",
    },
    ptYears: (n) => slavicYears("год", "года", "лет")(n),
    grTierCol: "Минимальная площадь",
    grTierAmounts: {
      t800: "800 000 €",
      t400: "400 000 €",
      t250c: "250 000 €",
      t250d: "250 000 €",
    },
    grTierLabels: {
      t800: "Аттика, Салоники, Миконос, Тира",
      t400: "Остальная территория Греции",
      t250c: "Перевод помещений в жильё",
      t250d: "Реставрация здания-памятника",
    },
    grTierNotes: {
      t800: "И острова свыше 3 100 жителей — ст. 100 §2(a)",
      t400: "Ст. 100 §2(b)",
      t250c: "Работы завершены до подачи — ст. 100 §2(c)",
      t250d: "Продажа до окончания работ ничтожна — ст. 100 §2(d)",
    },
    grTierArea: { yes: "120 м²", no: "нормы нет" },
    grPresence: {
      resident: "Инвестор, который живёт в Греции",
      visitor: "Инвестор, который приезжает изредка",
    },
    grPresenceNotes: {
      resident: "Отлучки в пределах ст. 144 §3",
      visitor: "Ст. 100 §4: отлучки не мешают продлению",
    },
    grPresenceResults: {
      resident: "Пять зачётных лет",
      visitor: "Ни одного зачётного года",
    },
    grPresenceResultNotes: {
      resident: "Открыт статус долгосрочного резидента",
      visitor: "Виза продлевается бесконечно",
    },
    grTax: {
      a: "5A — 100 000 € в год",
      b: "5B — 7% для иностранных пенсионеров",
      c: "5C — 50% для переезжающих работников",
    },
    grTaxNotes: {
      a: "Весь зарубежный доход. Инвестиция 500 000 € за три года",
      b: "Тоже весь зарубежный доход, а не только пенсия",
      c: "Только доход, возникающий в самой Греции",
    },
    grTaxPrior: {
      a: "Не резидент 7 из 8 лет",
      b: "Не резидент 5 из 6 лет",
      c: "Не резидент 5 из 6 лет",
    },
    aeChainCol: "Опубликован",
    aeChain: {
      decree: "Федеральный декрет-закон 29/2021",
      regulation: "Постановление 65/2022, приложение, ст. 8",
      fee: "Резолюция Исполнительного совета 30/2013",
      dubai2026: "Дубай, изменения 2026 года",
    },
    aeChainNotes: {
      decree: "Порога не устанавливает: делегирует регламенту",
      regulation: "2 000 000 дирхамов, один или несколько объектов",
      fee: "4% и раздел поровну между сторонами",
      dubai2026: "Отмена порога 750 000 и правила 50% предоплаты",
    },
    aeChainCells: { yes: "да", no: "нигде не найден" },
    aeAbsence: {
      investor: "Инвестор",
      talent: "Талант",
      student: "Студент",
      humanitarian: "Гуманитарная работа",
    },
    aeAbsenceNotes: {
      investor: "Пункт 9: «инвесторы\nс действующим\nразрешением»",
      talent: "В перечне\nне назван",
      student: "В перечне\nне назван",
      humanitarian: "В перечне\nне назван",
    },
    aeAbsenceCells: { named: "Освобождён", unnamed: "Только п. 11" },
    aeTaxHeads: { none: "Нормы, устанавливающей налог, нет", some: "А это платить придётся" },
    aeTaxNone: ["Подоходный налог", "Налог на прирост капитала", "Налог на наследство", "Налог на богатство"],
    aeTaxNoneNote: "Не освобождение, а отсутствие нормы:\nосвобождение отменяют поправкой,\nотсутствие — принятием закона.",
    aeTax: {
      vat: "НДС",
      transfer: "Сбор за переход права, Дубай",
      housing: "Сбор муниципалитета Дубая",
      corporate: "Корпоративный налог",
    },
    aeTaxNotes: {
      vat: "Декрет-закон 8/2017, ст. 3",
      transfer: "Резолюция 30/2013, приложение, п. 1",
      housing: "Акт установить не удалось",
      corporate: "Свыше 375 000 дирхамов — решение 116/2022",
    },
    ptPublished: {
      law: "Portaria 1563/2007, ст. 2(2)",
      wise: "Wise",
      greenback: "Greenback Tax Services",
      d8: "Global Citizen Solutions, Taxes for Expats",
      ggv: "Get Golden Visa",
    },
    ptPublishedNotes: {
      law: "Норма: 100% минимальной зарплаты 2026 года",
      wise: "Минимальная зарплата 2023 года, на 17% ниже",
      greenback: "Уровень 2021 года, на 35% ниже",
      d8: "D8: суммы нет ни в одном акте",
      ggv: "Гайд для пенсионеров на 10 000 слов",
    },
    ptPublishedFigures: {
      law: "920 € в месяц",
      wise: "760 € в месяц",
      greenback: "7 200 € в год",
      d8: "3 680 € в месяц",
      ggv: "цифры нет",
    },
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
      mtCost: {
        title: "Сколько стоит ПМЖ Мальты сверх цены объекта",
        note: "Ряды покупки дают 118 250 €; до примерно 126 000 € добавляют нотариус и юрист, у которых тарифа нет.",
      },
      mtPresence: {
        title: "Сколько месяцев в году требует каждый маршрут",
        note: "Пустой ряд — находка, а не пропуск: 1 сентября 2026 года обойдено пять реестров Мальты, правила там нет.",
      },
      mtTests: {
        title: "Три вопроса, которые Мальта решает по-разному",
        note: "Сертификат MPRP отвечает только на первый. Два других решаются без него.",
      },
      ptRoutes: {
        title: "Какие маршруты ВНЖ в Португалии существуют в 2026 году",
        note: "Инвестиционный маршрут снимает визу, но не подтверждение средств: ст. 90-A(1)(a).",
      },
      ptClock: {
        title: "Сколько лет проживания нужно до гражданства Португалии",
        note: "Lei Orgânica 1/2026 действует с 19 мая 2026 года. Дела, поданные до 18 мая включительно, решаются по прежней редакции.",
      },
      ptPublished: {
        title: "Что говорит акт и что публикуют страницы из выдачи",
        note: "Проверено 28 августа 2026 года. У каждой страницы отметка об обновлении свежее её собственной цифры.",
      },
      aeChain: {
        title: "Чем установлен порог золотой визы ОАЭ, а чем — ничем",
        note: "Проверены все 32 акта Дубая за 2026 год, реестр меморандумов и страница законодательства DLD.",
      },
      aeAbsence: {
        title: "Кого статья 60 действительно называет, а кого нет",
        note: "Слов «золотая резиденция» в статье 60 нет вообще. Инвестор проходит как инвестор.",
      },
      aeTax: {
        title: "Что в ОАЭ действительно платит физическое лицо",
        note: "Сбор муниципалитета — единственная цифра, которую не удалось привязать к акту.",
      },
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
      grTiers: {
        title: "Четыре порога золотой визы Греции и их условия",
        note: "Правило «один объект» действует во всех четырёх случаях. Минимальная площадь — только в §2(a) и §2(b).",
      },
      grPresence: {
        title: "Почему годы идут в зачёт одному и не идут другому",
        note: "Ст. 144 §1 требует фактического проживания: отлучки не больше шести месяцев подряд и не больше десяти месяцев за пять лет.",
      },
      grTax: {
        title: "Три налоговых режима Греции: 5A, 5B и 5C",
        note: "Полоса — срок в налоговых годах. 5A начинается с первого года подачи, 5B — со следующего.",
      },
      zones: {
        title: "Пороги золотой визы Греции по зонам",
        note: "Ст. 100 закона 5038/2023 в редакции ст. 64 закона 5100/2024. Действует с 1 сентября 2024 года.",
      },
    },
  },

  en: {
    // --- Malta ---------------------------------------------------------------
    mtCostHeads: { buy: "Purchase route, above the price", rent: "Rental route, first year" },
    mtCost: {
      stamp: "Stamp duty, 5%",
      admin: "Administrative fee",
      contribution: "Government contribution",
      ngo: "Donation to an NGO",
      card: "Residence card",
      rent: "Rent for the year",
    },
    mtCostTotals: { buy: "Total above the price", rent: "Total, first year" },
    mtPresence: {
      mprp: "Permanent residence programme",
      nomad: "Nomad residence permit",
      naturalisation: "Naturalisation, final year",
    },
    mtPresenceNotes: {
      mprp: "About 126,000 € above the price of the property",
      nomad: "Income floor 42,000 € a year",
      naturalisation: "Plus four years inside the six before it",
    },
    mtPresenceResults: {
      mprp: "No published rule",
      nomad: "5 months of 12",
      naturalisation: "12 continuous months",
    },
    mtTestsHeads: { question: "The question", decidedBy: "Decided by" },
    mtTests: {
      live: "Whether you may live in Malta",
      taxed: "Whether Malta taxes you",
      taxedOn: "What Malta taxes you on",
    },
    mtTestsNotes: {
      live: "This is what the MPRP certificate answers",
      taxed: "The certificate has no bearing on it",
      taxedOn: "Worldwide income, or only what is remitted",
    },
    mtTestsInstruments: {
      live: "S.L. 217.26",
      taxed: "More than 183 days in a year",
      taxedOn: "Domicile and ordinary residence",
    },
    eyebrow: "Guides & Research",
    checked: (date) => `Every figure checked against a primary source on ${date}`,
    dates: { property: "23 August 2026", income: "28 August 2026" , portugal: "28 August 2026", greece: "28 August 2026"  , uae: "30 August 2026", malta: "1 September 2026", greeceLiving: "4 September 2026" },
    ptCols: { visa: "Visa needed", income: "Income test" },
    ptRoutes: {
      d7: "D7, own income",
      d8: "D8, remote work",
      ari: "Investment permit",
      property: "Property purchase",
    },
    ptRouteNotes: {
      d7: "Pension, rent, dividends, royalties",
      d8: "Proof of the employment relationship",
      ari: "\u20ac500,000 fund or another qualifying route",
      property: "Abolished in 2023, with no replacement",
    },
    ptCells: { yes: "yes", no: "no", tested: "\u20ac920 a month", silent: "no figure in the law", gone: "route removed" },
    ptClock: {
      before: "Filed up to 18 May 2026",
      eu: "EU and Portuguese-speaking country nationals",
      other: "Everyone else",
    },
    ptClockNotes: {
      before: "Decided under the previous version of the law",
      eu: "Art. 6(1)(b), Lei Org\u00e2nica 1/2026",
      other: "Art. 6(1)(b), Lei Org\u00e2nica 1/2026",
    },
    ptYears: (n) => `${n} ${n === 1 ? "year" : "years"}`,
    grTierCol: "Minimum floor area",
    grTierAmounts: {
      t800: "€800,000",
      t400: "€400,000",
      t250c: "€250,000",
      t250d: "€250,000",
    },
    grTierLabels: {
      t800: "Attica, Thessaloniki, Mykonos, Thira",
      t400: "The rest of the country",
      t250c: "Change of use to residential",
      t250d: "Restoration of a listed building",
    },
    grTierNotes: {
      t800: "And islands above 3,100 inhabitants — art. 100 §2(a)",
      t400: "Art. 100 §2(b)",
      t250c: "Works finished before filing — art. 100 §2(c)",
      t250d: "A sale before the works are done is void — art. 100 §2(d)",
    },
    grTierArea: { yes: "120 m²", no: "none stated" },
    grPresence: {
      resident: "An investor who lives in Greece",
      visitor: "An investor who visits occasionally",
    },
    grPresenceNotes: {
      resident: "Absences within the caps of art. 144 §3",
      visitor: "Art. 100 §4: absences are no obstacle to renewal",
    },
    grPresenceResults: {
      resident: "Five qualifying years",
      visitor: "No qualifying years at all",
    },
    grPresenceResultNotes: {
      resident: "Long-term resident status is open",
      visitor: "The permit renews indefinitely",
    },
    grTax: {
      a: "5A — €100,000 a year",
      b: "5B — 7% for foreign pensioners",
      c: "5C — 50% for relocating employees",
    },
    grTaxNotes: {
      a: "All foreign income. €500,000 invested within three years",
      b: "All foreign income too, not only the pension",
      c: "Only income arising in Greece itself",
    },
    grTaxPrior: {
      a: "Non-resident 7 of the last 8 years",
      b: "Non-resident 5 of the last 6 years",
      c: "Non-resident 5 of the last 6 years",
    },
    aeChainCol: "Published",
    aeChain: {
      decree: "Federal Decree-Law 29/2021",
      regulation: "Cabinet Resolution 65/2022, Annex art. 8",
      fee: "Executive Council Resolution 30/2013",
      dubai2026: "Dubai, the 2026 changes",
    },
    aeChainNotes: {
      decree: "Sets no threshold: delegates to the regulation",
      regulation: "AED 2,000,000, one or more properties",
      fee: "4%, shared equally between the parties",
      dubai2026: "The AED 750,000 floor and the 50% upfront rule, both removed",
    },
    aeChainCells: { yes: "yes", no: "found in no register" },
    aeAbsence: {
      investor: "Investor",
      talent: "Talent",
      student: "Student",
      humanitarian: "Humanitarian work",
    },
    aeAbsenceNotes: {
      investor: "Item 9: \u201cInvestors\nholding valid\nResidence Permits\u201d",
      talent: "Named by\nno item",
      student: "Named by\nno item",
      humanitarian: "Named by\nno item",
    },
    aeAbsenceCells: { named: "Exempt", unnamed: "Item 11 only" },
    aeTaxHeads: { none: "No charging provision exists", some: "And these you do pay" },
    aeTaxNone: ["Personal income tax", "Capital gains tax", "Inheritance tax", "Wealth tax"],
    aeTaxNoneNote: "Not an exemption, an absence:\nan exemption is withdrawn by amending\nan instrument, an absence by enacting one.",
    aeTax: {
      vat: "VAT",
      transfer: "Dubai property transfer fee",
      housing: "Dubai municipality housing fee",
      corporate: "Corporate tax",
    },
    aeTaxNotes: {
      vat: "Federal Decree-Law 8/2017, art. 3",
      transfer: "Resolution 30/2013, schedule item 1",
      housing: "No instrument could be found",
      corporate: "Above AED 375,000 \u2014 Cabinet Decision 116/2022",
    },
    ptPublished: {
      law: "Portaria 1563/2007, art. 2(2)",
      wise: "Wise",
      greenback: "Greenback Tax Services",
      d8: "Global Citizen Solutions, Taxes for Expats",
      ggv: "Get Golden Visa",
    },
    ptPublishedNotes: {
      law: "The instrument: 100% of the 2026 minimum wage",
      wise: "The 2023 minimum wage, about 17% below",
      greenback: "The 2021-era figure, about 35% below",
      d8: "D8: no figure exists in any instrument",
      ggv: "A ten-thousand-word retirement guide",
    },
    ptPublishedFigures: {
      law: "\u20ac920 a month",
      wise: "\u20ac760 a month",
      greenback: "\u20ac7,200 a year",
      d8: "\u20ac3,680 a month",
      ggv: "no figure",
    },
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
    // --- Greece: living ------------------------------------------------------
    perMonth: (v) =>
      `${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
    perSqm: (v) => `${v.toFixed(1)} €/m²`,
    grBudget: {
      food: "Food and non-alcoholic drinks",
      housing: "Housing",
      transport: "Transport",
      eatingOut: "Restaurants, cafés and hotels",
      health: "Health",
    },
    grRegions: {
      attica: "Attica",
      national: "National average",
      sterea: "Sterea Ellada",
    },
    grRent: { attica: "Attica", thessaloniki: "Thessaloniki" },
    grRentLegend: {
      ask: "Asking prices in listings, range",
      signed: "Concluded leases, average",
    },
    figures: {
      grLivingBudget: {
        title: "Where a Greek household's money goes",
        note: "Shares of average monthly expenditure, 1,724.54 € in total. Renting households put 17.1 % of all spending into rent alone.",
      },
      grLivingRegions: {
        title: "The gap between the dearest and the cheapest region",
        note: "Average household expenditure per month. The dearest region costs almost double the cheapest one.",
      },
      grLivingRent: {
        title: "What landlords ask against what tenants signed",
        note: "Per square metre. Listings are Q2 2026; leases cover 124 areas. Both are commercial datasets, not public registers.",
      },

      mtCost: {
        title: "What Maltese permanent residence costs above the property",
        note: "The purchase rows come to 118,250 €; notary and legal fees, which carry no published tariff, take it to about 126,000 €.",
      },
      mtPresence: {
        title: "How many months a year each route demands",
        note: "The empty row is a finding rather than an omission: five Maltese registers were walked on 1 September 2026 and none states a rule.",
      },
      mtTests: {
        title: "Three questions Malta decides in three different ways",
        note: "The MPRP certificate answers only the first. The other two are decided without it.",
      },
      ptRoutes: {
        title: "Which Portuguese residence routes exist in 2026",
        note: "The investment permit waives the visa, not the means-of-subsistence test: art. 90-A(1)(a).",
      },
      ptClock: {
        title: "Years of residence required before Portuguese citizenship",
        note: "Lei Org\u00e2nica 1/2026 is in force from 19 May 2026. Proceedings filed up to and including 18 May are decided under the previous version.",
      },
      ptPublished: {
        title: "What the instrument says against what ranking pages publish",
        note: "Checked on 28 August 2026. Every page carries a last-updated stamp newer than its own figure.",
      },
      aeChain: {
        title: "What sets the golden visa threshold, and what sets nothing",
        note: "All 32 Dubai instruments of 2026 were checked, with the memorandum register and DLD's own page.",
      },
      aeAbsence: {
        title: "Who article 60 actually names, and who it does not",
        note: "The words “Golden Residence” do not appear in article 60 at all. An investor qualifies as an investor.",
      },
      aeTax: {
        title: "What an individual actually pays in the Emirates",
        note: "The municipality fee is the one figure here that could not be traced to an instrument.",
      },
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
      grTiers: {
        title: "The four Greek golden visa thresholds and what attaches to each",
        note: "The single-property rule applies to all four. The minimum floor area appears in §2(a) and §2(b) only.",
      },
      grPresence: {
        title: "Why the years count for one holder and not another",
        note: "Art. 144 §1 requires actual residence: absences under six consecutive months each, and ten months in total across the five years.",
      },
      grTax: {
        title: "The three Greek special tax regimes: 5A, 5B and 5C",
        note: "The bar is the term in tax years. 5A starts in the first year applied for, 5B in the next.",
      },
    },
  },

  pl: {
    // --- Malta ---------------------------------------------------------------
    mtCostHeads: { buy: "Ścieżka zakupu, ponad cenę", rent: "Ścieżka najmu, pierwszy rok" },
    mtCost: {
      stamp: "Opłata skarbowa, 5%",
      admin: "Opłata administracyjna",
      contribution: "Wkład rządowy",
      ngo: "Darowizna na NGO",
      card: "Karta pobytu",
      rent: "Czynsz za rok",
    },
    mtCostTotals: { buy: "Razem ponad cenę", rent: "Razem, pierwszy rok" },
    mtPresence: {
      mprp: "Program stałego pobytu",
      nomad: "Zezwolenie dla nomadów",
      naturalisation: "Naturalizacja, ostatni rok",
    },
    mtPresenceNotes: {
      mprp: "Około 126 000 € ponad cenę nieruchomości",
      nomad: "Próg dochodu 42 000 € rocznie",
      naturalisation: "Plus cztery lata wewnątrz sześciu przed nim",
    },
    mtPresenceResults: {
      mprp: "Brak opublikowanej zasady",
      nomad: "5 miesięcy z 12",
      naturalisation: "12 nieprzerwanych miesięcy",
    },
    mtTestsHeads: { question: "Pytanie", decidedBy: "Rozstrzyga" },
    mtTests: {
      live: "Czy wolno ci mieszkać na Malcie",
      taxed: "Czy Malta cię opodatkuje",
      taxedOn: "Od czego opodatkuje",
    },
    mtTestsNotes: {
      live: "Na to odpowiada certyfikat MPRP",
      taxed: "Certyfikat nie ma z tym związku",
      taxedOn: "Dochód światowy albo tylko transfer",
    },
    mtTestsInstruments: {
      live: "S.L. 217.26",
      taxed: "Ponad 183 dni w roku",
      taxedOn: "Domicyl i zwykła rezydencja",
    },
    eyebrow: "Poradniki i badania",
    checked: (date) => `Każda liczba sprawdzona ze źródłem pierwotnym ${date}`,
    dates: { property: "23 sierpnia 2026 roku", income: "28 sierpnia 2026 roku" , portugal: "28 sierpnia 2026 roku", greece: "28 sierpnia 2026 roku"  , uae: "30 sierpnia 2026 roku", malta: "1 września 2026 roku" },
    ptCols: { visa: "Wiza potrzebna", income: "Badanie dochodu" },
    ptRoutes: {
      d7: "D7, dochód własny",
      d8: "D8, praca zdalna",
      ari: "Pobyt za inwestycję",
      property: "Zakup nieruchomości",
    },
    ptRouteNotes: {
      d7: "Emerytura, najem, dywidendy, tantiemy",
      d8: "Potwierdzenie stosunku pracy",
      ari: "Fundusz 500 000 € lub inna ścieżka",
      property: "Zniesiona w 2023 roku, bez zamiennika",
    },
    ptCells: { yes: "tak", no: "nie", tested: "920 € miesięcznie", silent: "ustawa nie podaje kwoty", gone: "ścieżki nie ma" },
    ptClock: {
      before: "Złożone do 18 maja 2026",
      eu: "Obywatele UE i krajów portugalskojęzycznych",
      other: "Wszyscy pozostali",
    },
    ptClockNotes: {
      before: "Rozpatrywane według poprzedniego brzmienia",
      eu: "Art. 6(1)(b), Lei Orgânica 1/2026",
      other: "Art. 6(1)(b), Lei Orgânica 1/2026",
    },
    ptYears: (n) => slavicYears("rok", "lata", "lat")(n),
    grTierCol: "Minimalna powierzchnia",
    grTierAmounts: {
      t800: "800 000 €",
      t400: "400 000 €",
      t250c: "250 000 €",
      t250d: "250 000 €",
    },
    grTierLabels: {
      t800: "Attyka, Saloniki, Mykonos, Thira",
      t400: "Pozostała część kraju",
      t250c: "Zmiana przeznaczenia na mieszkalne",
      t250d: "Renowacja budynku zabytkowego",
    },
    grTierNotes: {
      t800: "Oraz wyspy powyżej 3 100 mieszkańców — art. 100 §2(a)",
      t400: "Art. 100 §2(b)",
      t250c: "Prace zakończone przed złożeniem — art. 100 §2(c)",
      t250d: "Sprzedaż przed końcem prac jest nieważna — art. 100 §2(d)",
    },
    grTierArea: { yes: "120 m²", no: "brak wymogu" },
    grPresence: {
      resident: "Inwestor, który mieszka w Grecji",
      visitor: "Inwestor, który bywa tam sporadycznie",
    },
    grPresenceNotes: {
      resident: "Nieobecności w granicach art. 144 §3",
      visitor: "Art. 100 §4: nieobecności nie blokują przedłużenia",
    },
    grPresenceResults: {
      resident: "Pięć zaliczonych lat",
      visitor: "Ani jednego zaliczonego roku",
    },
    grPresenceResultNotes: {
      resident: "Status rezydenta długoterminowego otwarty",
      visitor: "Zezwolenie przedłuża się w nieskończoność",
    },
    grTax: {
      a: "5A — 100 000 € rocznie",
      b: "5B — 7% dla zagranicznych emerytów",
      c: "5C — 50% dla przenoszących się pracowników",
    },
    grTaxNotes: {
      a: "Cały dochód zagraniczny. Inwestycja 500 000 € w trzy lata",
      b: "Również cały dochód zagraniczny, nie tylko emerytura",
      c: "Wyłącznie dochód powstający w samej Grecji",
    },
    grTaxPrior: {
      a: "Nierezydent przez 7 z 8 lat",
      b: "Nierezydent przez 5 z 6 lat",
      c: "Nierezydent przez 5 z 6 lat",
    },
    aeChainCol: "Opublikowany",
    aeChain: {
      decree: "Dekret federalny 29/2021",
      regulation: "Uchwa\u0142a 65/2022, za\u0142\u0105cznik, art. 8",
      fee: "Uchwa\u0142a Rady Wykonawczej 30/2013",
      dubai2026: "Dubaj, zmiany z 2026 roku",
    },
    aeChainNotes: {
      decree: "Nie ustala progu: deleguje do rozporz\u0105dzenia",
      regulation: "2 000 000 dirham\u00f3w, jedna lub wi\u0119cej nieruchomo\u015bci",
      fee: "4%, dzielone po r\u00f3wno mi\u0119dzy strony",
      dubai2026: "Zniesienie progu 750 000 i zasady 50% przedp\u0142aty",
    },
    aeChainCells: { yes: "tak", no: "nie ma go w \u017cadnym rejestrze" },
    aeAbsence: {
      investor: "Inwestor",
      talent: "Talent",
      student: "Student",
      humanitarian: "Praca humanitarna",
    },
    aeAbsenceNotes: {
      investor: "Pkt 9: „inwestorzy\nz ważnym\nzezwoleniem”",
      talent: "Nie wymieniony\nw żadnym punkcie",
      student: "Nie wymieniony\nw żadnym punkcie",
      humanitarian: "Nie wymieniona\nw żadnym punkcie",
    },
    aeAbsenceCells: { named: "Zwolniony", unnamed: "Tylko pkt 11" },
    aeTaxHeads: { none: "Brak przepisu nak\u0142adaj\u0105cego podatek", some: "A to trzeba zap\u0142aci\u0107" },
    aeTaxNone: ["Podatek dochodowy", "Podatek od zysk\u00f3w kapita\u0142owych", "Podatek spadkowy", "Podatek od maj\u0105tku"],
    aeTaxNoneNote: "To nie zwolnienie, tylko brak przepisu:\nzwolnienie znosi się nowelizacją,\nbrak trzeba wypełnić ustawą.",
    aeTax: {
      vat: "VAT",
      transfer: "Op\u0142ata od przeniesienia, Dubaj",
      housing: "Op\u0142ata mieszkaniowa gminy Dubaj",
      corporate: "Podatek od os\u00f3b prawnych",
    },
    aeTaxNotes: {
      vat: "Dekret federalny 8/2017, art. 3",
      transfer: "Uchwa\u0142a 30/2013, za\u0142\u0105cznik, poz. 1",
      housing: "Nie uda\u0142o si\u0119 ustali\u0107 aktu",
      corporate: "Powy\u017cej 375 000 dirham\u00f3w \u2014 uchwa\u0142a 116/2022",
    },
    ptPublished: {
      law: "Portaria 1563/2007, art. 2(2)",
      wise: "Wise",
      greenback: "Greenback Tax Services",
      d8: "Global Citizen Solutions, Taxes for Expats",
      ggv: "Get Golden Visa",
    },
    ptPublishedNotes: {
      law: "Akt: 100% płacy minimalnej na 2026 rok",
      wise: "Płaca minimalna z 2023 roku, o 17% niżej",
      greenback: "Wartość z 2021 roku, o 35% niżej",
      d8: "D8: kwoty nie ma w żadnym akcie",
      ggv: "Poradnik emerycki na 10 000 słów",
    },
    ptPublishedFigures: {
      law: "920 € miesięcznie",
      wise: "760 € miesięcznie",
      greenback: "7 200 € rocznie",
      d8: "3 680 € miesięcznie",
      ggv: "brak liczby",
    },
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
      mtCost: {
        title: "Ile kosztuje stały pobyt na Malcie ponad cenę nieruchomości",
        note: "Wiersze zakupu dają 118 250 €; notariusz i prawnik, dla których nie ma taryfy, podnoszą to do około 126 000 €.",
      },
      mtPresence: {
        title: "Ile miesięcy w roku wymaga każda ścieżka",
        note: "Pusty wiersz to ustalenie, a nie przeoczenie: 1 września 2026 obeszliśmy pięć maltańskich rejestrów i żaden nie podaje zasady.",
      },
      mtTests: {
        title: "Trzy pytania, które Malta rozstrzyga inaczej",
        note: "Certyfikat MPRP odpowiada tylko na pierwsze. Dwa pozostałe rozstrzygają się bez niego.",
      },
      ptRoutes: {
        title: "Które ścieżki pobytowe w Portugalii istnieją w 2026 roku",
        note: "Ścieżka inwestycyjna znosi wizę, nie badanie środków utrzymania: art. 90-A(1)(a).",
      },
      ptClock: {
        title: "Ile lat pobytu przed obywatelstwem portugalskim",
        note: "Lei Orgânica 1/2026 obowiązuje od 19 maja 2026. Sprawy złożone do 18 maja włącznie rozpatruje się według poprzedniego brzmienia.",
      },
      ptPublished: {
        title: "Co mówi akt, a co publikują strony z wyników wyszukiwania",
        note: "Sprawdzone 28 sierpnia 2026. Każda strona ma znacznik aktualizacji nowszy niż jej własna liczba.",
      },
      grTiers: {
        title: "Cztery progi greckiej złotej wizy i co się z każdym wiąże",
        note: "Zasada „jedna nieruchomość” obowiązuje we wszystkich czterech przypadkach. Minimalna powierzchnia tylko w §2(a) i §2(b).",
      },
      grPresence: {
        title: "Dlaczego lata liczą się jednemu, a drugiemu nie",
        note: "Art. 144 §1 wymaga faktycznego zamieszkiwania: nieobecności poniżej sześciu miesięcy i najwyżej dziesięć miesięcy przez pięć lat.",
      },
      grTax: {
        title: "Trzy greckie reżimy podatkowe: 5A, 5B i 5C",
        note: "Słupek to okres w latach podatkowych. 5A zaczyna się od pierwszego roku wniosku, 5B od następnego.",
      },
      aeChain: {
        title: "Co ustala pr\u00f3g emirackiej z\u0142otej wizy, a co nie ustala nic",
        note: "Sprawdzono 32 dubajskie akty z 2026 roku, rejestr memorandów i stronę legislacyjną DLD.",
      },
      aeAbsence: {
        title: "Kogo artyku\u0142 60 rzeczywi\u015bcie wymienia, a kogo nie",
        note: "Słowa „złota rezydencja” nie występują w artykule 60 wcale. Inwestor przechodzi jako inwestor.",
      },
      aeTax: {
        title: "Co osoba fizyczna faktycznie p\u0142aci w Emiratach",
        note: "Opłata gminna to jedyna liczba, której nie udało się przypisać do aktu.",
      },
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
// --- Figure: what a Greek household actually spends on ----------------------
// SHARES, NOT EUROS, AS THE BAR. The euro amount sits at the end of each row
// because a reader wants both, but the bar is the share: it is the part of the
// finding that survives inflation and that transfers to a household spending
// more or less than the average.
function grLivingBudget(L) {
  const width = 1200;
  const height = 700;
  const max = 24;
  const x0 = 430;
  const x1 = width - 300;
  const scale = (v) => ((x1 - x0) * v) / max;
  let body = "";

  GR_BUDGET.forEach((row, i) => {
    const y = 232 + i * 74;
    body += text(48, y + 5, L.grBudget[row.key], { size: 16, weight: 500 });
    const w = scale(row.share);
    body += `<path d="M${x0} ${y - 14} h${w - 4} a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}"/>`;
    body += text(x0 + w + 14, y + 5, `${row.share.toFixed(1)} %`, {
      size: 15,
      family: FONT_MONO,
    });
    body += text(width - 48, y + 5, L.perMonth(row.eur), {
      size: 15,
      family: FONT_MONO,
      fill: C.muted,
      anchor: "end",
    });
  });

  return frame(
    width,
    height,
    L.figures.grLivingBudget.title,
    L.eyebrow,
    L.checked(L.dates.greeceLiving),
    body,
    L.figures.grLivingBudget.note,
  );
}

// --- Figure: the regional gap ------------------------------------------------
// THE NATIONAL AVERAGE IS A ROW, NOT A LINE. Drawn as one of the three bars so
// that the two extremes are read against it rather than against the axis: the
// finding is that the cheapest region is a third below the average and the
// dearest a fifth above, not that either is far from zero.
function grLivingRegions(L) {
  const width = 1200;
  const height = 580;
  const max = 2200;
  const x0 = 430;
  const x1 = width - 300;
  const scale = (v) => ((x1 - x0) * v) / max;
  let body = "";

  GR_REGIONS.forEach((row, i) => {
    const y = 240 + i * 84;
    const isAverage = row.key === "national";
    body += text(48, y + 5, L.grRegions[row.key], {
      size: 16,
      weight: isAverage ? 600 : 500,
    });
    const w = scale(row.eur);
    // The average carries the muted fill: colour on this site says status, and
    // the status here is "this is the yardstick", not "this is the winner".
    body += `<path d="M${x0} ${y - 15} h${w - 4} a4 4 0 0 1 4 4 v22 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${isAverage ? C.pending : C.accent}"/>`;
    body += text(x0 + w + 14, y + 5, L.perMonth(row.eur), {
      size: 15,
      family: FONT_MONO,
    });
    body += text(width - 48, y + 5, `${row.pct.toFixed(1)} %`, {
      size: 15,
      family: FONT_MONO,
      fill: C.muted,
      anchor: "end",
    });
  });

  return frame(
    width,
    height,
    L.figures.grLivingRegions.title,
    L.eyebrow,
    L.checked(L.dates.greeceLiving),
    body,
    L.figures.grLivingRegions.note,
  );
}

// --- Figure: asked against signed --------------------------------------------
// A RANGE AND A POINT ON ONE AXIS, WHICH IS THE WHOLE ARGUMENT. Listings are a
// range and a lease is a number, so drawing them in the same shape would be the
// error the figure exists to correct. The point lands near the bottom of the
// range in both cities, and that is the finding.
function grLivingRent(L) {
  const width = 1200;
  const height = 640;
  const max = 24;
  const x0 = 430;
  const x1 = width - 220;
  const scale = (v) => ((x1 - x0) * v) / max;
  let body = "";

  GR_RENT.forEach((row, i) => {
    const y = 258 + i * 132;
    body += text(48, y + 5, L.grRent[row.key], { size: 16, weight: 500 });

    const a = x0 + scale(row.askLow);
    const b = x0 + scale(row.askHigh);
    body += `<rect x="${a}" y="${y - 12}" width="${b - a}" height="24" rx="4" fill="${C.hairline}"/>`;
    // The two ends are anchored OUTWARD, away from the bar. Anchoring them
    // inward puts both labels inside a narrow range and they collide — which is
    // exactly what Thessaloniki, the narrowest range here, did on the first draw.
    body += text(a - 12, y + 6, L.perSqm(row.askLow), {
      size: 13,
      family: FONT_MONO,
      fill: C.muted,
      anchor: "end",
    });
    body += text(b + 12, y + 6, L.perSqm(row.askHigh), {
      size: 13,
      family: FONT_MONO,
      fill: C.muted,
    });

    const p = x0 + scale(row.signed);
    body += `<circle cx="${p}" cy="${y}" r="9" fill="${C.accent}"/>`;
    body += text(p, y - 26, L.perSqm(row.signed), {
      size: 15,
      family: FONT_MONO,
      weight: 600,
      anchor: "middle",
    });
  });

  // The legend has to exist here and nowhere else in this file: every other
  // figure carries one series, and a reader who has never seen a range beside a
  // point will otherwise read the bar as the value.
  const ly = height - 168;
  body += `<rect x="48" y="${ly - 11}" width="20" height="16" rx="3" fill="${C.hairline}"/>`;
  body += text(78, ly + 2, L.grRentLegend.ask, { size: 14, fill: C.muted });
  body += `<circle cx="440" cy="${ly - 3}" r="8" fill="${C.accent}"/>`;
  body += text(460, ly + 2, L.grRentLegend.signed, { size: 14, fill: C.muted });

  return frame(
    width,
    height,
    L.figures.grLivingRent.title,
    L.eyebrow,
    L.checked(L.dates.greeceLiving),
    body,
    L.figures.grLivingRent.note,
  );
}

const PLAN = {
  ru: [
    ["qualifies", qualifies],
    ["cost", cost],
    ["zones", zones],
    ["income-tests", incomeTests],
    ["greece-scale", greeceScale],
    ["data-age", dataAge],
    ["pt-routes", ptRoutes],
    ["pt-clock", ptClock],
    ["pt-published", ptPublished],
    ["gr-tiers", grTiers],
    ["gr-presence", grPresence],
    ["gr-tax", grTax],
    ["ae-chain", aeChain],
    ["ae-absence", aeAbsence],
    ["ae-tax", aeTax],
    ["mt-cost", mtCost],
    ["mt-presence", mtPresence],
    ["mt-tests", mtTests],
  ],
  en: [
    ["qualifies", qualifies],
    ["cost", cost],
    ["zones", zones],
    ["income-tests", incomeTests],
    ["greece-scale", greeceScale],
    ["data-age", dataAge],
    ["pt-routes", ptRoutes],
    ["pt-clock", ptClock],
    ["pt-published", ptPublished],
    ["gr-tiers", grTiers],
    ["gr-presence", grPresence],
    ["gr-tax", grTax],
    ["ae-chain", aeChain],
    ["ae-absence", aeAbsence],
    ["ae-tax", aeTax],
    ["mt-cost", mtCost],
    ["mt-presence", mtPresence],
    ["mt-tests", mtTests],
    // The living guide, 4 September 2026. English only: the entry exists in one
    // language because the demand does.
    ["gr-living-budget", grLivingBudget],
    ["gr-living-regions", grLivingRegions],
    ["gr-living-rent", grLivingRent],
  ],
  pl: [
    ["qualifies", qualifies],
    ["cost", cost],
    ["who", whoNeeds],
    ["income-tests", incomeTests],
    ["greece-scale", greeceScale],
    ["data-age", dataAge],
    ["pt-routes", ptRoutes],
    ["pt-clock", ptClock],
    ["pt-published", ptPublished],
    ["gr-tiers", grTiers],
    ["gr-presence", grPresence],
    ["gr-tax", grTax],
    ["ae-chain", aeChain],
    ["ae-absence", aeAbsence],
    ["ae-tax", aeTax],
    ["mt-cost", mtCost],
    ["mt-presence", mtPresence],
    ["mt-tests", mtTests],
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
