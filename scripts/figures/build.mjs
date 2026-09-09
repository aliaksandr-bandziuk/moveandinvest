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
    // ПЕРЕЧЁРКИВАНИЕ ОТДАЁТСЯ SVG, А НЕ СЧИТАЕТСЯ РУКАМИ. Первая версия
    // португальской схемы рисовала <line> поверх текста, а длину брала как
    // «число знаков × 8.6». В Inter на 17px это занижение примерно втрое на
    // строках с пробелами и знаком евро: «Property purchase» оказалось
    // зачёркнуто по слог «pur». Ширину глифов знает рендерер, и спрашивать
    // надо его.
    decoration = null,
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
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${scaled}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${tracking ? ` letter-spacing="${(tracking * TYPE).toFixed(2)}"` : ""}${decoration ? ` text-decoration="${decoration}"` : ""}>${inner}</text>`;
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
  // D8 БОЛЬШЕ НЕ «БЕЗ ПОРОГА», с 8 сентября 2026. Порог у него есть и он в
  // регламенте, а не в законе: DR 84/2007, ст. 18.º-B(c) и 31.º-A(1)(c) —
  // четыре RMMG по среднему за три месяца. Схема говорила «no figure in the
  // law» в той же строке, где подпись называет четырёхкратность.
  { key: "d8", visa: true, income: "multiple" },
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
// ЧЕТЫРЕ СТРОКИ, А НЕ ПЯТЬ. Строка про D8 («3 680 €, ни в одном акте нет»)
// снята 7 сентября 2026: цифра есть в акте — Decreto Regulamentar 4/2022,
// ст. 18.º-B(c) и 31.º-A(1)(c), четыре RMMG за последние три месяца. Ошибка
// была наша, и держать чужую верную цифру в списке чужих неверных нельзя.
// Схема и без неё про порог D7, а D8 в ней всегда был чужеродным.
const PT_PUBLISHED = [
  { key: "law", ok: true },
  { key: "wise", ok: false },
  { key: "greenback", ok: false },
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

// --- The Portugal "after the permit" guide's numbers -------------------------
// One axis in years, from the grant to naturalisation. The two bands are the
// permit's own terms; the three markers are the thresholds that open on top of
// it. Article 76(1) sits outside the axis on purpose — a status with no expiry
// cannot be drawn on a timeline without implying it ends somewhere.
const PT_AFTER_BANDS = [
  { key: "first", from: 0, to: 2 },
  { key: "renewal", from: 2, to: 5 },
];
const PT_AFTER_MARKS = [
  { key: "permanent", at: 5 },
  { key: "citizenshipEu", at: 7 },
  { key: "citizenship", at: 10 },
];

// The two statuses the market treats as one. Rows are the questions that
// actually separate them; the answer text lives in the locale block.
const PT_STATUSES = ["basis", "years", "purpose", "movement"];

// --- Golden visa: the application -------------------------------------------
// THE LANES ARE ORDERED BY WHEN THE CAPITAL IS COMMITTED, not alphabetically,
// because that ordering is the claim. Portugal and Greece take the money before
// the file exists; Malta screens first and takes it after. `money` names the
// step that is filled, and a lane may have none.
const GV_APPLY_LANES = [
  {
    key: "pt",
    money: "ptTransfer",
    steps: ["ptTransfer", "ptFile", "ptSchedule", "ptDecision", "ptCard"],
  },
  { key: "gr", money: "grBuy", steps: ["grBuy", "grFile", "grDecision", "grPermit"] },
  {
    key: "mt",
    money: "mtCommit",
    steps: ["mtFile", "mtPay1", "mtDiligence", "mtApproval", "mtPay2", "mtCommit"],
  },
  { key: "ae", money: null, steps: ["aeNominate", "aeFile", "aeDecision", "aeResidence"] },
];

// What Malta charges the main applicant, in the order the money leaves. The
// investment is not here: these are the state's own charges, which is the only
// comparison that holds against a Greek permit fee.
const GV_FEES = [
  { key: "submission", value: 15000 },
  { key: "approval", value: 45000 },
  { key: "contribution", value: 37000 },
  { key: "donation", value: 2000 },
];
const GV_GREECE_FEE = 2016;

// --- Golden passport: the naturalisation clocks -----------------------------
// YEARS, NOT MONTHS, and the Maltese row is a range because the statute is one:
// twelve continuous months plus four years inside the six before them is five
// at the floor and can stretch to seven. Drawing it as a single bar at five
// would print a precision Cap. 188 does not have. The Emirates has no bar at
// all — a zero would read as "instant" when the truth is "no route to apply".
const GV_PASSPORT_CLOCKS = [
  { key: "pt", years: 10, mark: 7 },
  { key: "gr", years: 7 },
  { key: "mt", years: 5, to: 7 },
  { key: "ae", years: null },
];
const GV_PASSPORT_MAX = 10;

// The three periods every comparison table merges.
const GV_CLOCK_ROWS = ["counts", "abroad", "gets", "also"];

// --- Malta: the nomad permit -------------------------------------------------
// FOUR BLOCKS AND A WALL. The permit's whole shape is that it ends, and a bar
// chart of "four years" would say the opposite — it would read as a duration
// like any other. The wall is drawn because the finding is the stop.
const MT_NOMAD_YEARS = [
  { key: "y1", taxed: false },
  { key: "y2", taxed: true },
  { key: "y3", taxed: true },
  { key: "y4", taxed: true },
];
const MT_NOMAD_ALLOWED = ["employer", "company", "clients", "family"];
const MT_NOMAD_FORBIDDEN = ["local", "dependants", "permanent", "citizenship"];

// --- Malta: the residence card ----------------------------------------------
// GROUPED BY AMOUNT, NOT LISTED BY BASIS, for the same reason the qualifying
// figure groups by answer: the reader's question is "what will this cost me",
// and fourteen rows of basis-then-fee answers it fourteen times over.
// --- Португалия: переезд ------------------------------------------------------
// СУБРЕГИОНЫ NUTS III И МЕДИАНА ПО СТРАНЕ, без муниципалитета Лиссабон: он
// другая единица наблюдения, и поставить его в тот же ряд значило бы сравнить
// несравнимое. Его значение уходит в примечание.
// --- Греция: два маршрута, которые рынок путает --------------------------------
// ДВЕ КОЛОНКИ, А НЕ ТАБЛИЦА НА ТРИ: сравнивать надо ровно то, что смешивают, —
// инвесторское разрешение статьи 100 и трудовой Tech Visa статьи 79Α. Третий
// столбец увёл бы внимание с того, что это разные главы кодекса.
const GR_PROCESS_ROWS = ["basis", "threshold", "work", "duration", "ends", "onward"];

const PT_MOVE_RENT = [
  { key: "lisboaGrande", value: 14.38 },
  { key: "madeira", value: 11.97 },
  { key: "setubal", value: 11.35 },
  { key: "algarve", value: 10.71 },
  { key: "porto", value: 10.13 },
  { key: "national", value: 9.46, ref: true },
];
const PT_MOVE_RENT_MAX = 16;

// ИНДЕКС, А НЕ ЕВРО. INE публикует разницу в процентах между покупателями с
// домицилием в стране и за рубежом, но не абсолютные цены по каждой группе.
// Рисовать евро значило бы напечатать цифру, которой в источнике нет.
const PT_MOVE_PREMIUM = [
  { key: "lisboa", premium: 49.0 },
  { key: "porto", premium: 35.6 },
];

const MT_CARD_FEES = [
  { key: "f500", lines: 1 },
  { key: "f100", lines: 3 },
  { key: "f50", lines: 3 },
  { key: "free", lines: 3 },
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
      const incomeText =
        row.income === "multiple"
          ? L.ptCells.multiple
          : row.income
            ? L.ptCells.tested
            : L.ptCells.silent;
      body += text(xIncome, y, incomeText, {
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
  // 680: четыре ряда по 82 от y=240 доводят вторую строку последнего до 512,
  // подпись frame идёт на height − 92, то есть на 588. Было 760 под пять рядов;
  // после снятия строки про D8 там осталась дыра в 80px.
  const height = 680;
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
    dates: { property: "23 августа 2026 года", income: "28 августа 2026 года" , portugal: "28 августа 2026 года", greece: "28 августа 2026 года"  , uae: "30 августа 2026 года", malta: "1 сентября 2026 года", greeceLiving: "5 сентября 2026 года", portugalMove: "5 сентября 2026 года", portugalCitizenship: "7 сентября 2026 года", greeceCitizenshipRu: "9 сентября 2026 года", maltaCitizenshipRu: "9 сентября 2026 года" },
    ptCols: { visa: "Нужна виза", income: "Проверка дохода" },
    ptRoutes: {
      d7: "D7, собственный доход",
      d8: "D8 — удалённая работа",
      ari: "ВНЖ за инвестиции",
      property: "Покупка недвижимости",
    },
    ptRouteNotes: {
      d7: "Пенсия, аренда, дивиденды, роялти",
      d8: "Четыре минимальные зарплаты, среднее за три месяца",
      ari: "Фонд 500 000 € или другой маршрут",
      property: "Отменена в 2023 году, замены нет",
    },
    ptCells: { yes: "да", no: "нет", tested: "920 € в месяц", multiple: "4 \u00d7 минималка", silent: "в законе нет суммы", gone: "маршрута нет" },
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
      ggv: "Get Golden Visa",
    },
    ptPublishedNotes: {
      law: "Норма: 100% минимальной зарплаты 2026 года",
      wise: "Минимальная зарплата 2023 года, на 17% ниже",
      greenback: "Уровень 2021 года, на 35% ниже",
      ggv: "Гайд для пенсионеров на 10 000 слов",
    },
    ptPublishedFigures: {
      law: "920 € в месяц",
      wise: "760 € в месяц",
      greenback: "7 200 € в год",
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
    // --- Греция: жизнь и переезд ---------------------------------------------
    perMonth: (v) =>
      `${v.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
    perSqm: (v) => `${v.toFixed(1).replace(".", ",")} €/м²`,
    grBudget: {
      food: "Питание и безалкогольные напитки",
      housing: "Жильё",
      transport: "Транспорт",
      eatingOut: "Рестораны, кафе и гостиницы",
      health: "Здоровье",
    },
    grRegions: {
      attica: "Аттика",
      national: "Среднее по стране",
      sterea: "Стереа-Эллада",
    },
    pct: (v) => `${v.toFixed(1).replace(".", ",")} %`,
    grRent: { attica: "Аттика", thessaloniki: "Салоники" },
    // --- Португалия: переезд -------------------------------------------------
    ptMoveRent: {
      lisboaGrande: "Большой Лиссабон",
      madeira: "Мадейра",
      setubal: "Полуостров Сетубал",
      algarve: "Алгарве",
      porto: "Агломерация Порту",
      national: "Медиана по стране",
    },
    perSqm2: (v) => `${v.toFixed(2).replace(".", ",")} €/м²`,
    ptMoveRentAxis: "Медиана по новым договорам, I квартал 2026 года",
    ptMovePremiumLanes: { lisboa: "Большой Лиссабон", porto: "Агломерация Порту" },
    ptMovePremiumRows: { home: "домицилий в Португалии", abroad: "домицилий за рубежом" },
    ptMovePremiumBase: "100",
    ptMovePremiumValue: (v) => `+${v.toFixed(1).replace(".", ",")} %`,
    grRentLegend: {
      ask: "Объявления, диапазон",
      signed: "Заключённые договоры, среднее",
    },
    // КИРИЛЛИЦА ШИРЕ ЛАТИНИЦЫ при том же числе знаков, поэтому подписи ниже
    // короче английских, а не переведены слово в слово. Потолок подписи ряда от
    // x=300 — около 95 знаков, у английских версий было 90–98.
    mtChainHeads: { when: "Когда", what: "Что сделали" },
    mtChainDates: {
      judgment: "29 апреля 2025",
      act: "24 июля 2025",
      notice: "29 июля 2025",
      page: "И всё же, в 2026",
    },
    mtChainWhat: {
      judgment: "Дело C-181/23, Комиссия против Мальты",
      act: "Акт XXI/2025",
      notice: "L.N. 159/2025 — часть IV удалена",
      page: "Страницы фирм по-прежнему предлагают маршрут",
    },
    // Потолок подписи ряда у английской версии — около 88 знаков; кириллица
    // шире, поэтому здесь короче. Мерено margins.mjs, не прикинуто.
    mtChainNote: {
      judgment: "Суд ЕС, Большая палата. На дело не ссылается почти никто",
      act: "Газета 21 474. Заменена статья 10(9) главы 188",
      notice: "Газета 21 478. S.L. 188.06 переписан под заслуги",
      page: "Три заголовка на первом экране датированы 2026 годом",
    },
    mtRouteHeads: { merit: "Натурализация за заслуги", ordinary: "Обычная натурализация" },
    mtRouteLabels: {
      residence: "Требуется проживание",
      shows: "Заявление должно показать",
      grounds: "Решается по",
      decidedBy: "Надзор",
      fee: "Сбор в самом акте",
    },
    mtRouteMerit: {
      residence: "Не менее восьми месяцев",
      shows: "Жильё и язык",
      grounds: "Шесть названных оснований",
      decidedBy: "Отдельный Регулятор",
      fee: "Не опубликован",
    },
    mtRouteOrdinary: {
      // От colB 780 до правого поля 1152 — 372px, и на 15px кириллицей это
      // около тридцати знаков, а не сорока: строка в 44 знака ушла на 151px.
      // Английская версия здесь длиннее и помещается — латиница уже.
      residence: "12 месяцев + 4 года из 6",
      shows: "Обычные условия главы 188",
      grounds: "Длительности проживания",
      decidedBy: "Обычная процедура",
      fee: "Вне этого регламента",
    },
    grNatTierBars: {
      three: "Три непрерывных года",
      seven: "Семь непрерывных лет",
      twelve: "Двенадцать непрерывных лет",
    },
    grNatTierNotes: {
      three: "Граждане ЕС; супруг грека С РЕБЁНКОМ; опека над ребёнком-греком; апатриды",
      seven: "Все прочие с титулом из закрытого перечня ст. 5(1)(ε) — инвесторский там, подпункт αθ",
      twelve: "Любой другой действующий титул, кроме временных — ст. 5(3)",
    },
    grSplitHeads: { art: "Статья", holds: "Что в ней" },
    grSplitWhat: {
      five: "Формальные условия",
      fiveA: "Существенные условия",
      fiveB: "Основания безопасности",
    },
    grSplitNote: {
      five: "Совершеннолетие, отсутствие приговора за десятилетие, срок проживания, титул",
      fiveA: "Достаточный греческий; история, география, культура; интеграция",
      fiveB: "Оцениваются отдельно от всего перечисленного выше",
    },
    figures: {
      mtChain: {
        title: "Что отменили и чем: четыре даты",
        note: "Девяносто один день от решения суда до опубликованного текста регламента.",
      },
      mtRoutes: {
        title: "Два маршрута, которые остались",
        note: "Гражданства за инвестиции среди них нет: соответствующая часть регламента удалена.",
      },
      grNatTiers: {
        title: "Три срока по одному закону",
        note: "Все три — «συνεχή», непрерывные. Окна для сложения разорванных периодов Кодекс не даёт.",
      },
      grNatSplit: {
        title: "Натурализация — это две статьи, а не одна",
        note: "Экзамен сидит в статье 5Α, и никакого уровня CEFR она не называет.",
      },
      ptMoveRent: {
        title: "Сколько стоит аренда по подписанным договорам",
        note: "Муниципалитет Лиссабон — 17,42 €/м², самая высокая медиана в стране.",
      },
      ptMovePremium: {
        title: "Надбавка покупателя с домицилием за рубежом",
        note: "За единицу принята цена метра у покупателей с налоговым домицилием в Португалии. Четвёртый квартал 2025 года.",
      },
      grLivingBudget: {
        title: "На что уходят деньги греческого домохозяйства",
        note: "Доли среднего месячного расхода, всего 1 724,54 €. За одну аренду арендующие отдают 17,1 % всех трат.",
      },
      grLivingRegions: {
        title: "Самая дорогая область против самой дешёвой",
        note: "Средний расход домохозяйства в месяц. Самая дорогая область обходится почти вдвое дороже самой дешёвой.",
      },
      grLivingRent: {
        title: "Объявления против подписанных договоров",
        note: "За квадратный метр. Объявления — второй квартал 2026 года, договоры — по 124 районам.",
      },
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
        title: "Какие маршруты ВНЖ Португалии остались в 2026",
        note: "Инвестиционный маршрут снимает визу, но не подтверждение средств: ст. 90-A(1)(a).",
      },
      ptClock: {
        title: "Сколько лет до гражданства Португалии",
        note: "Lei Orgânica 1/2026 действует с 19 мая 2026 года. Дела, поданные до 18 мая, решаются по прежней редакции.",
      },
      ptPublished: {
        title: "Что говорит акт и что публикуют страницы",
        note: "Проверено 28 августа 2026 года. У каждой страницы отметка об обновлении свежее её собственной цифры.",
      },
      aeChain: {
        title: "Чем установлен порог золотой визы, а чем — нет",
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
        title: "Что Греция требует подтвердить и сколько тратят",
        note: "Порог и минимальная зарплата — 2026 год; расходы домохозяйства — обследование за 2024 год.",
      },
      dataAge: {
        title: "Насколько устарела статистика расходов",
        note: "Полоса — разрыв между годом наблюдения и сегодняшним днём. Он и делает четыре цифры несопоставимыми.",
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
        note: "Ст. 144 §1 требует фактического проживания: отлучки не более шести месяцев подряд и десяти за пять лет.",
      },
      grTax: {
        title: "Три налоговых режима Греции: 5A, 5B и 5C",
        note: "Полоса — срок в налоговых годах. 5A начинается с первого года подачи, 5B — со следующего.",
      },
      zones: {
        title: "Пороги золотой визы Греции по зонам",
        note: "Ст. 100 закона 5038/2023 в редакции ст. 64 закона 5100/2024. Действует с 1 сентября 2024 года.",
      },
      ptNatClock: {
        title: "Тринадцать лет от того же самого события",
        note: "Три года — верхняя граница ожидания карты. По нижней каждая полоса короче, а разрыв между ними тот же.",
      },
      ptNatLimbs: {
        title: "Что требует статья 6(1) и что в ней новое",
        // Год ушёл из шапки колонки в подпись: «ИЗМЕНЕНИЯ 2026» в капители с
        // трекингом выходило за правое поле на 58 пикселей.
        note: "Статья 6(1) в редакции Lei Orgânica 1/2026. Уровня по общеевропейской шкале закон не называет: A2 — практика.",
      },
    },
    ptNatAxis: "Годы со дня подачи заявления на ВНЖ",
    ptNatLegend: {
      counted: "Очередь засчитана",
      uncounted: "Очередь не засчитана",
      residence: "Срок проживания",
    },
    ptNatBars: {
      old: {
        label: "Дело о гражданстве в производстве на 19 мая 2026",
        note: "Пять лет, и статья 15(4) держит ожидание карты внутри них",
      },
      new7: {
        label: "Подано после 19 мая: ЕС и португалоязычные страны",
        note: "Семь лет, и ожидание внутрь больше не входит",
      },
      new10: {
        label: "Подано после 19 мая: любое другое гражданство",
        note: "Десять лет, и ожидание внутрь больше не входит",
      },
    },
    // ШАПКА НЕСЁТ ГОД, А ЯЧЕЙКИ НЕТ, и это вынужденно: «Расширено в 2026»
    // на 15px × 1.33 от x=980 доходит до 1200 и уходит за правое поле 1152.
    // Русские слова длиннее английских, а колонка ставилась под английские.
    ptNatHeads: { art: "Статья", cond: "Что требует", status: "Изменения" },
    ptNatCond: {
      a: "Совершеннолетие по португальскому праву\nили по праву страны происхождения",
      b: "Семь лет законного проживания для граждан\nЕС и CPLP, десять для всех остальных",
      c: "Достаточное знание языка, а также\nкультуры, истории и символов",
      d: "Достаточное знание прав и обязанностей\nгражданства и устройства государства",
      e: "Торжественная декларация о приверженности\nпринципам правового государства",
    },
    ptNatStatus: {
      same: "Без изменений",
      doubled: "Удвоено",
      widened: "Расширено",
      fresh: "Новое",
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
    dates: { property: "23 August 2026", income: "28 August 2026" , portugal: "28 August 2026", greece: "28 August 2026"  , uae: "30 August 2026", malta: "1 September 2026", greeceLiving: "4 September 2026", portugalAfter: "4 September 2026", greeceProcess: "5 September 2026", goldenVisaApply: "5 September 2026", goldenPassport: "5 September 2026", maltaNomad: "5 September 2026", maltaCard: "5 September 2026", portugalGoldenVisa: "6 September 2026", portugalLiving: "7 September 2026", maltaCitizenship: "7 September 2026", portugalCitizenship: "7 September 2026", portugalNomad: "7 September 2026", maltaLiving: "7 September 2026", greeceCitizenship: "8 September 2026", greeceAmericans: "8 September 2026", portugalAmericans: "8 September 2026", portugalUk: "8 September 2026", uaeUk: "9 September 2026" },
    // ИМЕНА С ПРЕФИКСОМ grNat, А НЕ grTier. `grTierNotes` уже занят схемой
    // порогов золотой визы по зонам, и дубликат ключа в одном объектном
    // литерале в JavaScript не ошибка — побеждает последний. Первая версия
    // напечатала три раза «undefined» на холсте и прошла проверку на поля.
    grUsSteps: {
      signed: "Signed",
      protocol: "Protocol",
      force: "In force",
      since: "Since then",
    },
    grUsDates: {
      signed: "20 February 1950",
      protocol: "20 April 1953",
      force: "1 January 1953",
      since: "no further amendment",
    },
    grUsWhat: {
      signed: "Convention for the avoidance of double taxation on income",
      protocol: "Mutual assistance in collecting taxes, and nothing else",
      force: "Operative from this date; instruments exchanged that December",
      since: "Seventy-six years, through every change in treaty practice",
    },
    grUsHeads: { changes: "Greek residence changes", stays: "Greek residence does not touch" },
    grUsChangesRows: ["tax", "social", "regimes"],
    grUsLeft: {
      tax: "Where income tax is primarily due",
      social: "Which social security system receives contributions",
      regimes: "Whether the Greek special tax regimes are available",
    },
    grUsRight: {
      // От colRight 620 до правого поля 1152 — 532px, на 15px это около
      // пятидесяти знаков, не пятидесяти пяти: строка в 54 знака ушла на 13px,
      // в 55 — на 22px. Первая версия была 68 и ушла на 141px.
      tax: "The annual US return on worldwide income",
      social: "The certificate of coverage, form GR/USA 1",
      regimes: "The saving clause at art. XIV(1), 1950 treaty",
    },
    ptUsClockCols: { before: "File pending on 19 May 2026", after: "Opened after that date" },
    ptUsClockRows: ["rule", "queue", "gaps"],
    ptUsClockLeft: {
      rule: "Article 15(4), as inserted in March 2024",
      queue: "The AIMA wait counts, once the permit is granted",
      gaps: "Interrupted periods sum inside twelve years",
    },
    // Правая колонка от colRight 640 до правого поля 1152 — 512px, на 15px это
    // около сорока восьми знаков. Мерено margins.mjs, не прикинуто.
    ptUsClockRight: {
      rule: "Article 15(1) alone — 15(4) is repealed",
      queue: "An application is not a title or a visa",
      gaps: "Unchanged: still twelve years",
    },
    aeUkTestRows: ["uk", "treaty"],
    aeUkTestName: {
      uk: "1 · The UK statutory residence test",
      treaty: "2 · Article 4 of the UK–UAE convention, 2016",
    },
    aeUkTestWhat: {
      uk: "Have you ceased to be resident in the United Kingdom?",
      treaty: "Does the convention treat you as a resident of the UAE?",
    },
    aeUkTestWho: {
      uk: "Administered by HMRC. Nothing the Emirates do affects it.",
      treaty: "Domicile, habitual abode or centre of vital interests — not nationality.",
    },
    aeUkBreakRows: ["home", "abode", "national", "authorities"],
    aeUkBreakStep: {
      home: "A permanent home available to you",
      abode: "Habitual abode",
      national: "Nationality",
      authorities: "The two tax authorities agree",
    },
    aeUkBreakNote: {
      home: "Available, not lived in. A flat kept empty in Britain is available. If a home is available in both: centre of vital interests",
      abode: "Reached only if the centre of vital interests cannot be determined, or no home is available in either state",
      national: "The passport is the third step of four, not the first",
      authorities: "Only for a national of both states or of neither",
    },
    aeMonths: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    aeMarker: "Strikes on the UAE begin, 28 February 2026",
    aeControl: "Control: «moving to portugal» shows no step in the same months",
    aeAdviceCols: { not: "What the advice does NOT say", does: "What the same page does say" },
    aeAdviceRows: ["level", "strikes", "flights"],
    aeAdviceNot: {
      level: "No advisory against all travel",
      strikes: "No advisory against all but essential travel",
      flights: "No statement that the situation has ended",
    },
    // Правая колонка от colRight 560 до правого поля 1152 — 592px, на 13px это
    // около шестидесяти пяти знаков. Первая редакция стояла на 620/14 и две
    // цитаты из трёх ушли за поле. Мерено margins.mjs, не прикинуто.
    aeAdviceDoes: {
      level: "«strikes and retaliatory attacks by Iran»",
      strikes: "«Do not approach or touch any drone or missile fragments»",
      flights: "«possible flight cancellations, periodic airspace closures»",
    },
    ptUkSteps: ["signedOld", "forceOld", "signedNew", "forceNew"],
    ptUkDates: {
      signedOld: "27 March 1968",
      forceOld: "17 January 1969",
      signedNew: "15 September 2025",
      forceNew: "29 December 2025",
    },
    ptUkWhat: {
      signedOld: "The previous convention signed",
      forceOld: "In force, and it stayed in force",
      signedNew: "Its replacement signed",
      forceNew: "In force — fifty-seven years after the first signature",
    },
    ptUkEffectHead: "And the two countries start on different days",
    ptUkEffectRows: ["pt", "ukWithheld", "ukCorp", "ukIncome"],
    ptUkEffect: {
      pt: "Portugal · 1 January 2026",
      ukWithheld: "UK, withheld taxes · 1 January 2026",
      ukCorp: "UK, corporation tax · 1 April 2026",
      ukIncome: "UK, income and capital gains · 6 April 2026",
    },
    ptUkPensionCols: { old: "1968, article 17(1)", now: "2025, article 17" },
    ptUkPensionRows: ["who", "where", "carve"],
    ptUkPensionLeft: {
      who: "Pensions for past employment, and annuities",
      where: "«taxable only in that State»",
      carve: "Government service excluded in a parenthesis",
    },
    // Правая колонка от colRight 640 до правого поля 1152 — 512px, на 15px это
    // около пятидесяти знаков. Мерено margins.mjs.
    ptUkPensionRight: {
      who: "Pensions and other similar remuneration",
      where: "«taxable only in that State»",
      carve: "Excluded by reference to art. 18(1)",
    },
    ptUsInstrRows: ["act", "treaty", "social"],
    ptUsInstrWhat: {
      act: "Nationality Act, Lei 37/81",
      treaty: "Income tax convention",
      social: "Social security agreement",
    },
    ptUsInstrWhen: {
      act: "amended 19 May 2026",
      treaty: "signed 6 September 1994",
      social: "in force 1 August 1989",
    },
    ptUsInstrDecides: {
      act: "How long until citizenship, and what counts as residence",
      treaty: "Which country taxes what — and the Protocol, para. 1(b), keeps US taxation of US citizens",
      social: "Which system receives contributions. Self-employed resident in Portugal: Portuguese, on form P/USA 1",
    },
    grNatTierBars: {
      three: "Three continuous years",
      seven: "Seven continuous years",
      twelve: "Twelve continuous years",
    },
    grNatTierNotes: {
      three: "EU nationals; spouse of a Greek WITH a child; custody of a Greek child born in Greece; stateless persons",
      seven: "Everybody else holding a title on the closed list of art. 5(1)(ε) — the investor permit is item αθ",
      twelve: "Any other valid residence title, temporary ones excepted — art. 5(3)",
    },
    grSplitHeads: { art: "Article", holds: "What it holds" },
    grSplitWhat: {
      five: "Formal conditions",
      fiveA: "Substantive conditions",
      fiveB: "Security grounds",
    },
    // ПОТОЛОК ПОДПИСИ РЯДА — ОКОЛО 95 ЗНАКОВ: от xBody 300 до правого поля
    // 852px, на 13px × 1.33 это примерно девяносто восемь. Первые версии были
    // 108 и 106 и обе ушли за холст. Поймано отрисовкой.
    grSplitNote: {
      five: "Legal age, no conviction in the last decade, no pending expulsion, the period, the title",
      fiveA: "Sufficient Greek; history, geography, culture and customs; economic and social integration",
      fiveB: "Assessed separately from everything above",
    },
    mtRentBars: {
      register: "Housing Authority register",
      facebook: "Facebook Marketplace",
      agency: "Estate agency listings",
    },
    mtRentNotes: {
      register: "Median rent on a lease newly signed in 2023",
      facebook: "Median asking price, peer-to-peer listings",
      agency: "Median asking price, aggregated agency dataset",
    },
    mtMeasureHeads: { what: "What", cadence: "How often", latest: "Newest published" },
    mtMeasureWhat: {
      hicp: "Consumer prices (HICP)",
      rent: "Registered private leases",
      hbs: "What a household spends",
    },
    mtMeasureCadence: {
      hicp: "Every month",
      rent: "Periodic reports since Jan 2020",
      hbs: "Once a decade, in practice",
    },
    mtMeasureLatest: {
      hicp: "March 2026 — 2.3% a year",
      rent: "Second half of 2023",
      hbs: "2015–2016",
    },
    ptD8Heads: { temp: "Temporary stay", res: "Residence" },
    ptD8Labels: {
      created: "Created by",
      paperwork: "Paperwork rule",
      length: "Length",
      income: "Income test",
      permit: "Leads to a residence permit",
      list: "On the art. 122 conversion list",
      naturalisation: "Counts towards naturalisation",
    },
    ptD8Temp: {
      created: "Art. 54(1)(i)\nof Lei 23/2007",
      paperwork: "Art. 18-B\nof DR 84/2007",
      length: "Under one year",
      income: "Four minimum wages,\nthree-month average",
      permit: "No",
      list: "No",
      naturalisation: "No",
    },
    ptD8Res: {
      created: "Art. 61-B\nof Lei 23/2007",
      paperwork: "Art. 31-A\nof DR 84/2007",
      length: "Leads to a permit",
      income: "The same,\nword for word",
      permit: "Yes",
      list: "Not applicable",
      naturalisation: "Yes, as\nlawful residence",
    },
    ptD8ChainHeads: { when: "When", what: "What happened" },
    ptD8ChainDates: {
      insert: "30 Sep 2022",
      amend: "17 Jan 2024",
      repeal: "4 Jun 2024",
      transitional: "8 Nov 2024",
      newpara: "23 Oct 2025",
      today: "Today",
    },
    ptD8ChainWhat: {
      insert: "The cross-reference is written",
      amend: "The regulation is amended for the last time",
      repeal: "The procedure is repealed",
      transitional: "The transitional rule is widened, not the route",
      newpara: "The paragraph is refilled with something else",
      today: "The cross-reference still stands",
    },
    ptD8ChainNote: {
      insert: "DR 4/2022 inserts art. 31-A. Its n.º 2 sends an applicant without the visa to arts. 88 and 89.",
      amend: "DR 1/2024, the seventh amendment to DR 84/2007. It does not touch art. 31-A.",
      repeal: "DL 37-A/2024, art. 2: arts. 88(2), 88(6), 89(2), 89(4) and 89(5) of Lei 23/2007.",
      transitional: "Lei 40/2024 protects proceedings already begun and people already contributing.",
      newpara: "Lei 61/2025 gives art. 89 a new n.º 4, about certified business incubators.",
      today: "Two years and three months of a regulation naming a procedure that does not exist.",
    },
    ptNatAxis: "Years from the residence application",
    ptNatLegend: {
      counted: "Queue counted",
      uncounted: "Queue not counted",
      residence: "Residence period",
    },
    ptNatBars: {
      old: {
        label: "Nationality file pending on 19 May 2026",
        note: "Five years, and article 15(4) counts the wait for the permit inside them",
      },
      new7: {
        label: "Filed after 19 May: EU and Portuguese-speaking countries",
        note: "Seven years, and the wait is no longer inside them",
      },
      new10: {
        label: "Filed after 19 May: every other nationality",
        note: "Ten years, and the wait is no longer inside them",
      },
    },
    ptNatHeads: { art: "Article", cond: "What it requires", status: "Status" },
    // ПЕРЕНОСЫ ПРОСТАВЛЕНЫ РУКАМИ, И ЭТО НЕ СТИЛЬ. От xBody 210 до колонки
    // статуса 980 ровно 770px, а строка идёт 15px × 1.33 = 20px — это около
    // сорока четырёх знаков. Однострочные подписи первой версии прошли под
    // колонкой статуса насквозь: «and the political organis» ушло за холст,
    // а «Doubled in 2026» легло поверх «everybody else». SVG не переносит
    // сам; перенос — это \n, который text() превращает в tspan.
    ptNatCond: {
      a: "Legal age under Portuguese law\nor under the law of origin",
      b: "Seven years of legal residence for EU and\nCPLP citizens, ten for everybody else",
      c: "Sufficient knowledge of the language, and\nof Portuguese culture, history, symbols",
      d: "Sufficient knowledge of the rights and\nduties of nationality, and of the state",
      e: "A solemn declaration of adherence to the\nprinciples of the democratic rule of law",
    },
    ptNatStatus: {
      same: "Unchanged",
      doubled: "Doubled in 2026",
      widened: "Widened in 2026",
      fresh: "New in 2026",
    },
    mtChainHeads: { when: "When", what: "What was done" },
    mtChainDates: {
      judgment: "29 April 2025",
      act: "24 July 2025",
      notice: "29 July 2025",
      page: "Still, in 2026",
    },
    mtChainWhat: {
      judgment: "Case C-181/23, Commission v Malta",
      act: "Act XXI of 2025",
      notice: "L.N. 159 of 2025 — Part IV deleted",
      page: "The agency's own pages show the old figures",
    },
    mtChainNote: {
      judgment: "Court of Justice, Grand Chamber. Almost no page describing the scheme names it.",
      act: "Gazette 21,474. Substituted article 10(9) of Cap. 188, the enabling provision.",
      notice: "Gazette 21,478. Retitled S.L. 188.06; removed Part IV and two Schedules.",
      page: "600,000 € and 750,000 € under February 2026 timestamps, seen 6 September 2026.",
    },
    mtRouteHeads: { merit: "Naturalisation on merit", ordinary: "Ordinary naturalisation" },
    mtRouteLabels: {
      residence: "Residence required",
      shows: "The application must show",
      grounds: "Decided on",
      decidedBy: "Overseen by",
      fee: "Fee in the instrument",
    },
    mtRouteMerit: {
      residence: "At least eight months",
      shows: "Property and language",
      grounds: "Six named grounds",
      decidedBy: "A separate Office of the Regulator",
      fee: "None published",
    },
    mtRouteOrdinary: {
      residence: "Five years, spread over up to seven",
      shows: "The ordinary conditions of Cap. 188",
      grounds: "Length of residence",
      decidedBy: "The ordinary process",
      fee: "Outside these regulations",
    },
    ptLivingRentAxis: "Median rent per square metre in new leases, Q1 2026. Every area shown is above the national median.",
    ptLivingRentNames: {
      lisbonCity: "Lisbon, municipality",
      greaterLisbon: "Greater Lisbon",
      madeira: "Madeira",
      setubal: "Setúbal Peninsula",
      algarve: "Algarve",
      porto: "Porto Metro Area",
    },
    ptLivingRentAmounts: {
      lisbonCity: "17.42 €",
      greaterLisbon: "14.38 €",
      madeira: "11.97 €",
      setubal: "11.35 €",
      algarve: "10.71 €",
      porto: "10.13 €",
    },
    ptLivingRentNational: "Portugal 9.46 €",
    ptLivingDomicileAxis: "Median price per square metre by the buyer's tax domicile, Q4 2025. Index, not euros.",
    ptLivingDomicileNames: { greaterLisbon: "Greater Lisbon", porto: "Porto Metropolitan Area" },
    ptLivingDomicileAmounts: { greaterLisbon: "149.0", porto: "135.6" },
    ptLivingDomicileBase: "100 — domiciled in Portugal",
    ptGvHeads: { sub: "Subparagraph", ask: "What it asks", status: "Status" },
    ptGvSub: { i: "i", ii: "ii", iii: "iii", iv: "iv", v: "v", vi: "vi", vii: "vii", viii: "viii" },
    ptGvAsk: {
      i: "Capital transfer of 1.5m €",
      ii: "Ten jobs created",
      iii: "Property purchase",
      iv: "Property purchase plus rehabilitation",
      v: "500,000 € into research",
      vi: "250,000 € into cultural heritage",
      vii: "500,000 € into a fund",
      viii: "500,000 € into a company creating five jobs",
    },
    ptGvNote: {
      i: "",
      ii: "Eight in low-density areas. No capital threshold at all",
      iii: "",
      iv: "",
      v: "400,000 € in low-density areas",
      vi: "220,000 € in low-density areas",
      vii: "Not a real-estate fund, five years, 60% seated in Portugal",
      viii: "",
    },
    ptGvStatus: { dead: "Repealed 2023", live: "In force" },
    ptGvFeeAxis: "Fees payable to AIMA, in force from 1 March 2026. Each charge stands on its own; they are not paid at once.",
    ptGvFeeNames: {
      consider: "To consider the application",
      issue: "To issue the permit",
      renew: "To renew it",
      family: "Each family member",
    },
    ptGvFeeAmounts: {
      consider: "842.80 €",
      issue: "8,418.90 €",
      renew: "4,210.30 €",
      family: "8,418.90 €",
    },
    ptGvFeeTotals: {
      one: "One applicant, filing to first renewal: about 13,470 € in fees alone.",
      family: "A family of three: about 40,400 €.",
      online: "Less 25% when the application is filed online.",
    },
    ptCols: { visa: "Visa needed", income: "Income test" },
    ptRoutes: {
      d7: "D7, own income",
      d8: "D8 — remote work",
      ari: "Investment permit",
      property: "Property purchase",
    },
    ptRouteNotes: {
      d7: "Pension, rent, dividends, royalties",
      d8: "Four minimum wages, averaged over three months",
      ari: "\u20ac500,000 fund or another qualifying route",
      property: "Abolished in 2023, with no replacement",
    },
    ptCells: { yes: "yes", no: "no", tested: "\u20ac920 a month", multiple: "4 \u00d7 minimum wage", silent: "no figure in the law", gone: "route removed" },
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
      ggv: "Get Golden Visa",
    },
    ptPublishedNotes: {
      law: "The instrument: 100% of the 2026 minimum wage",
      wise: "The 2023 minimum wage, about 17% below",
      greenback: "The 2021-era figure, about 35% below",
      ggv: "A ten-thousand-word retirement guide",
    },
    ptPublishedFigures: {
      law: "\u20ac920 a month",
      wise: "\u20ac760 a month",
      greenback: "\u20ac7,200 a year",
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
    pct: (v) => `${v.toFixed(1)} %`,
    grRent: { attica: "Attica", thessaloniki: "Thessaloniki" },
    // --- Greece: the two routes the market confuses --------------------------
    grProcessHeads: {
      // Латинская A, не греческая альфа: подмножество Inter не несёт греческих
      // глифов, и embed.mjs справедливо на этом падает. В теле статьи греческая
      // буква остаётся внутри дословной цитаты, где шрифты не урезаны.
      investor: "Art. 100 — property",
      startup: "Art. 100A — startup",
      tech: "Art. 79A — Tech Visa",
    },
    grProcessRows: {
      basis: "What it is granted for",
      threshold: "The threshold",
      work: "Right to work in Greece",
      duration: "How long it runs",
      ends: "What ends it",
      onward: "Where it leads",
    },
    grProcessInvestor: {
      basis: "An investment completed\nbefore filing",
      threshold: "800,000 / 400,000 /\n250,000 € by zone",
      work: "None at all — §9",
      duration: "Five years, renewable",
      ends: "Absence does not — §4",
      onward: "Permanent residence,\nthen citizenship",
    },
    grProcessStartup: {
      basis: "Capital paid into a\nregistered startup",
      threshold: "250,000 €, up to 33 %\nof the company",
      work: "None at all — §9",
      duration: "One year, then two\nat a time",
      ends: "Losing the two jobs or\nthe shares — §2, §10",
      onward: "Renewal while the\ninvestment is held",
    },
    grProcessTech: {
      basis: "A twelve-month contract\nat a registered startup",
      threshold: "Salary at 1.6× the\naverage gross wage",
      work: "Immediate, that one\nemployer only",
      duration: "Twelve months",
      ends: "The job ending, with\nimmediate departure",
      onward: "EU Blue Card, same\nemployer only",
    },
    grRentLegend: {
      ask: "Asking prices in listings, range",
      signed: "Concluded leases, average",
    },
    // --- Portugal: after the permit ------------------------------------------
    ptAfterBands: { first: "First title, 2 years", renewal: "Renewals, 3 years each" },
    ptAfterMarks: {
      permanent: "Permanent residence",
      citizenshipEu: "Citizenship: EU, CPLP",
      citizenship: "Citizenship: others",
    },
    ptAfterAxis: "Years of legal residence",
    ptAfterNoExpiry: "The permanent authorisation itself has no expiry — art. 76(1). Only its card is renewed, every five years.",
    ptStatusHeads: { national: "National permanent", eu: "EU long-term resident" },
    ptStatusRows: {
      basis: "Set by",
      years: "Years required",
      purpose: "What it secures",
      movement: "Other member states",
    },
    ptStatusNational: {
      basis: "Article 80 of Lei 23/2007",
      years: "Five, as temporary resident",
      purpose: "Your position in Portugal",
      movement: "No rights conferred",
    },
    ptStatusEu: {
      basis: "Directive 2003/109/EC",
      years: "Five, lawful residence",
      purpose: "Mobility inside the EU",
      movement: "Subject to their terms",
    },
    // --- Golden visa: the application ----------------------------------------
    gvApplyLanes: { pt: "Portugal", gr: "Greece", mt: "Malta", ae: "UAE" },
    gvApplySteps: {
      ptTransfer: "Transfer\nthe funds",
      ptFile: "File on\nPortal ARI",
      ptSchedule: "AIMA sets the\nappointment",
      ptDecision: "Decision",
      ptCard: "Residence\ncard",
      grBuy: "Complete\nthe purchase",
      grFile: "File on the\nministry portal",
      grDecision: "Decision,\n2 months",
      grPermit: "Permit",
      mtFile: "Licensed agent\nfiles",
      mtPay1: "15,000 €",
      mtDiligence: "Due\ndiligence",
      mtApproval: "Approval",
      mtPay2: "45,000 €",
      mtCommit: "Property and\n37,000 €",
      aeNominate: "Nomination\nrequest",
      aeFile: "Application\non ICP",
      aeDecision: "Decision",
      aeResidence: "Residence,\n5 or 10 years",
    },
    gvApplyLegend: "Filled: the stage at which the capital is committed",
    gvFeeSteps: {
      submission: "On submission",
      approval: "After approval",
      contribution: "Contribution",
      donation: "NGO donation",
    },
    gvFeeAmounts: {
      submission: "15,000 €",
      approval: "+45,000 €",
      contribution: "+37,000 €",
      donation: "+2,000 €",
    },
    gvFeeTotal: (v) => `${v.toLocaleString("en-GB")} € in total`,
    gvFeeGreece: "Greece, in total\n2,016 €",
    gvFeeAxis: "Cumulative state charges, main applicant",
    // --- Golden passport ------------------------------------------------------
    gvPassportLanes: { pt: "Portugal", gr: "Greece", mt: "Malta", ae: "UAE" },
    gvPassportValues: {
      pt: "10 years",
      gr: "7 years",
      mt: "5–7 years",
      ae: "No period published",
    },
    gvPassportMark: "7 for EU and CPLP citizens",
    gvPassportNone: "Nationality is granted on nomination. There is no application.",
    gvPassportAxis: "Years of residence before naturalisation",
    gvClockHeads: {
      permit: "The permit's clock",
      longTerm: "Long-term residence",
      naturalisation: "Naturalisation",
    },
    gvClockRows: {
      counts: "What it counts",
      abroad: "Time spent abroad",
      gets: "What it gets you",
      also: "What else it asks",
    },
    gvClockPermit: {
      counts: "Holding the permit",
      abroad: "In Greece, no obstacle\n(art. 100 §4)",
      gets: "A valid card",
      also: "The programme's\nown terms",
    },
    gvClockLongTerm: {
      counts: "Lawful, uninterrupted\nresidence",
      abroad: "Capped\n(art. 144 §1)",
      gets: "Long-term resident\nstatus",
      also: "Income and, often,\nlanguage",
    },
    // --- Malta: the nomad permit ---------------------------------------------
    mtNomadHeads: { allowed: "Allowed", forbidden: "Not permitted" },
    mtNomadAllowed: {
      employer: "Employment by a\nforeign employer",
      company: "Self-employment through a\ncompany registered abroad",
      clients: "Freelancing for clients\nestablished abroad",
      family: "A spouse and\ndependent children",
    },
    mtNomadForbidden: {
      local: "Any economic activity with\nemployers or companies\nregistered in Malta",
      dependants: "Adding dependants after\napproval, newborns aside",
      permanent: "Any route onward to\npermanent residence",
      citizenship: "Any route onward\nto citizenship",
    },
    mtNomadYears: { y1: "Year 1", y2: "Year 2", y3: "Year 3", y4: "Year 4" },
    // --- Malta: the residence card -------------------------------------------
    mtCardLanes: { first: "First application", renewal: "Renewal" },
    mtCardWait: "8-10 weeks. Interim receipt: no travel, no re-entry",
    mtCardMarks: {
      submit: "Submission",
      approve: "Approval",
      notice: "Notice with PIN,\nby post",
      collect: "Collect in person,\nMsida",
    },
    mtCardWindow: "The only window",
    mtCardRenewMarks: { open: "3 months before", close: "6 weeks before", expiry: "Permit expires" },
    mtCardRenewNote: "Travel is generally possible on a valid passport and the existing card",
    mtCardFeeAmounts: { f500: "€500", f100: "€100", f50: "€50", free: "Free" },
    mtCardFeeBases: {
      f500: "Long-term residence",
      f100: "Economic self-sufficiency\nPosted workers\nPermanent residence scheme, renewals only",
      f50: "Study and post-study; traineeship\nFamily reunification (S.L. 217.06) and the family member policy\nPartner, child or parent of a Maltese citizen; medical, religious, temporary",
      free: "Exempt persons\nVictims of human trafficking\nVolunteers",
    },
    mtNomadFree: "No Maltese\ntax charge",
    mtNomadTaxed: "10% on\nauthorised work",
    mtNomadPresence: "Five months in every twelve, proved by bank statements",
    mtNomadWall: "Four years maximum.\nNo renewal, and no\nonward status.",
    gvClockNaturalisation: {
      counts: "Residence actually spent",
      abroad: "Does not count",
      gets: "A passport",
      also: "Language, history\nand culture exams",
    },
    figures: {
      ptAfterTimeline: {
        title: "From the first permit to a passport",
        note: "Years of legal residence, not calendar years: a permit renewed from abroad advances the bands and none of the markers.",
      },
      ptAfterStatuses: {
        title: "Two statuses the market treats as one",
        note: "Article 80 opens by setting the long-term resident regime aside. The statute keeps them parallel; most guides merge them.",
      },
      mtCardTimeline: {
        title: "Two months you cannot leave, and a six-week window",
        note: "The receipt says on its face that it is not a travel document. The renewal window opens three months out and closes six weeks out.",
      },
      mtCardFees: {
        title: "What the permit costs, by the basis you applied under",
        note: "Under economic self-sufficiency a further €100 at renewal buys a two-year permit instead of a one-year one.",
      },
      mtNomadLimits: {
        title: "What the nomad permit allows, and what it forbids",
        note: "The prohibition on Maltese employers and companies disqualifies rather than inconveniences.",
      },
      mtNomadClock: {
        title: "One year at nothing, three at 10%, then a wall",
        note: "The window runs twelve months from the later of the permit's issue or 1 January 2024.",
      },
      gvApplySequence: {
        title: "Where the money sits when you file",
        note: "The UAE lane is unshaded: its golden residence also turns on profession and talent, so no one stage carries the capital.",
      },
      grProcessCompare: {
        title: "Three Greek routes the market keeps fusing",
        note: "Article 100A was added in December 2024 and article 79A in February 2026. Neither touched article 100.",
      },
      gvPassportClocks: {
        title: "How long each passport actually takes",
        note: "Malta is a range because its statute is one: twelve continuous months plus four years inside the six before them.",
      },
      gvPassportCounts: {
        title: "Three clocks that comparison tables merge",
        note: "A holder can satisfy the first indefinitely, never start the second and never approach the third.",
      },
      mtChain: {
        title: "Ninety-one days from judgment to deletion",
        note: "The last row is not an instrument. It is what a government web page still displayed thirteen months later.",
      },
      mtRoutes: {
        title: "Two routes, and only one of them has a price",
        note: "The merit regulations set no fee: they say fees established by the Agency apply. No figure exists in the instrument.",
      },
      ptLivingRent: {
        title: "What the median lease was signed at",
        note: "Median rent in new residential leases, first quarter of 2026, from 39,395 signed contracts — not from advertisements.",
      },
      ptLivingDomicile: {
        title: "The premium a foreign tax domicile pays",
        note: "An index: 100 is the median paid by buyers domiciled in Portugal. The release publishes the difference, not the two prices.",
      },
      ptGvRoutes: {
        title: "What is left of article 3(1)",
        // ОДНА СТРОКА, И ЭТО ОГРАНИЧЕНИЕ frame, А НЕ СТИЛЬ. Подпись ставится на
        // height − 92, а линейка подвала на height − 68: под неё отведено
        // ровно 24px, то есть одна строка 13px. Двухстрочная подпись
        // (через \n, потому что text() сам не переносит) выглядит в коде
        // безобидно, а на отрисовке её второй ряд перечёркнут линейкой.
        // Поймано отрисовкой 6 сентября 2026 на обеих португальских схемах.
        note: "Article 53 of Lei 56/2023 repealed three subparagraphs at once; article 3(5) closes the fund workaround.",
      },
      ptGvFees: {
        title: "What AIMA charges, and the ratio nobody warns about",
        note: "Legal fees and fund commissions are excluded: those are market prices, not published ones.",
      },
      grUsTreaty: {
        title: "A treaty signed in 1950, amended once",
        note: "Article XIV(1) is the saving clause: each country may tax its own citizens as though the convention had not been made.",
      },
      grUsChanges: {
        title: "What moving to Greece changes for an American",
        note: "The left column is Greek law. The right column is American law, and Greek residence does not reach it.",
      },
      aeUkTests: {
        title: "Two tests, and neither is administered in Dubai",
        note: "The absence of Emirati income tax reaches you only after both are answered.",
      },
      aeUkTiebreak: {
        title: "When both countries claim you: four steps, in order",
        note: "Article 4(3) of the convention signed 12 April 2016, in force 25 December 2016.",
      },
      aeDemand: {
        title: "«moving to dubai from the uk», by month",
        note: "A step rather than a season: 880 in April and unchanged for four months since.",
      },
      aeAdvice: {
        title: "One government page, both halves",
        note: "UK travel advice for the UAE, updated 24 July 2026, read 9 September 2026.",
      },
      ptUkTreaty: {
        title: "One convention replaced, fifty-seven years apart",
        note: "HMRC's own manual carries both, with the note that the previous one applied until the new one took effect.",
      },
      ptUkPensions: {
        title: "The pensions article, before and after",
        note: "Both name the state of residence. The wording was modernised; the rule was not changed.",
      },
      ptUsClock: {
        title: "Ten years, counted two different ways",
        note: "Article 7(2) of Lei Orgânica 1/2026 keeps the previous text for files already pending on 19 May 2026.",
      },
      ptUsInstruments: {
        title: "Three instruments, three dates",
        note: "The saving clause is not in Article 1 of the convention. Article 1 is one sentence about personal scope.",
      },
      grNatTiers: {
        title: "Three periods, one law",
        note: "All three are «συνεχή» — continuous. The Code gives no window inside which broken periods may be added together.",
      },
      grNatSplit: {
        title: "Naturalisation is two articles, not one",
        note: "The examination sits in article 5Α, and it names no CEFR level. The B1 in circulation comes from below the statute.",
      },
      mtRentGap: {
        title: "Three medians for one market, all for 2023",
        // ПОТОЛОК ПОДПИСИ ~125 ЗНАКОВ: 13px × 1.33 = 17.3px на 1104px от
        // левого поля. Первая версия была 147 и обрезалась на «53% of age».
        note: "The sets differ: 44% of registered lets have three or more bedrooms, against 53% of agency listings.",
      },
      mtMeasures: {
        title: "What Malta measures, and how often",
        note: "Prices are counted monthly. Household spending was last counted in 2015–2016; the new count is still being processed.",
      },
      ptD8Variants: {
        title: "One name, two visas, one income test",
        // 134 знака ушли за правое поле на «there are two». Потолок здесь —
        // около 125: 13px × 1.33 = 17.3px на 1104px от левого поля.
        note: "Both variants are called the D8, and the euro figure quoted for them fits both — which is how it hides that there are two.",
      },
      ptD8Chain: {
        title: "A cross-reference to a procedure that was repealed",
        note: "The regulation has not been amended since January 2024. The paragraphs it names were repealed in June 2024.",
      },
      ptNatClock: {
        title: "Thirteen years, from the same starting event",
        // ПОДПИСЬ ОТРЕЗАЛАСЬ СПРАВА. 13px × 1.33 = 17.3px, от 48 до правого
        // поля 1104px — примерно 125 знаков. Первая версия была 137 и ушла
        // за холст на «does not». Поймано отрисовкой.
        note: "Three years is the upper end of the permit wait. At the lower end every bar shortens and the gap does not.",
      },
      ptNatLimbs: {
        // 43 ЗНАКА, НЕ 62. Заголовок идёт 26px × 1.33 = 34.6px, и на холсте
        // 1200 в него влезает около пятидесяти знаков. Первая версия
        // обрезалась на «are n». Поймано отрисовкой.
        title: "What article 6(1) asks, and what is new",
        note: "The statute names no CEFR level in limb (c). A2 is administrative practice, which is a different thing with a different future.",
      },
      gvApplyFees: {
        title: "What the state charges to look at you",
        note: "Malta only, investment excluded. Add 7,500 € per adult dependant other than the spouse, 500 € per card.",
      },

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
        title: "What Maltese residence costs above the property",
        note: "The purchase rows come to 118,250 €; notary and legal fees, which carry no published tariff, take it to about 126,000 €.",
      },
      mtPresence: {
        title: "How many months a year each route demands",
        note: "The empty row is a finding, not an omission: five Maltese registers walked on 1 September 2026, none states a rule.",
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
        title: "Years of residence before Portuguese citizenship",
        note: "Lei Orgânica 1/2026 is in force from 19 May 2026. Files submitted up to 18 May are decided under the old text.",
      },
      ptPublished: {
        title: "The instrument against the ranking pages",
        note: "Checked on 28 August 2026. Every page carries a last-updated stamp newer than its own figure.",
      },
      aeChain: {
        title: "What sets the threshold, and what sets nothing",
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
        title: "What Greece asks you to prove, and what it costs",
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
        title: "Four Greek thresholds, and what attaches to each",
        note: "The single-property rule applies to all four. The minimum floor area appears in §2(a) and §2(b) only.",
      },
      grPresence: {
        title: "Why the years count for one holder and not another",
        note: "Art. 144 §1 requires actual residence: absences under six consecutive months, ten months across the five years.",
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
    pct: (v) => `${v.toFixed(1).replace(".", ",")} %`,
    dates: { property: "23 sierpnia 2026 roku", income: "28 sierpnia 2026 roku" , portugal: "28 sierpnia 2026 roku", greece: "28 sierpnia 2026 roku"  , uae: "30 sierpnia 2026 roku", malta: "1 września 2026 roku" },
    ptCols: { visa: "Wiza potrzebna", income: "Badanie dochodu" },
    ptRoutes: {
      d7: "D7, dochód własny",
      d8: "D8 — praca zdalna",
      ari: "Pobyt za inwestycję",
      property: "Zakup nieruchomości",
    },
    ptRouteNotes: {
      d7: "Emerytura, najem, dywidendy, tantiemy",
      d8: "Czterokrotność płacy minimalnej, średnia z trzech miesięcy",
      ari: "Fundusz 500 000 € lub inna ścieżka",
      property: "Zniesiona w 2023 roku, bez zamiennika",
    },
    ptCells: { yes: "tak", no: "nie", tested: "920 € miesięcznie", multiple: "4 \u00d7 płaca min.", silent: "ustawa nie podaje kwoty", gone: "ścieżki nie ma" },
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
      ggv: "Get Golden Visa",
    },
    ptPublishedNotes: {
      law: "Akt: 100% płacy minimalnej na 2026 rok",
      wise: "Płaca minimalna z 2023 roku, o 17% niżej",
      greenback: "Wartość z 2021 roku, o 35% niżej",
      ggv: "Poradnik emerycki na 10 000 słów",
    },
    ptPublishedFigures: {
      law: "920 € miesięcznie",
      wise: "760 € miesięcznie",
      greenback: "7 200 € rocznie",
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
        title: "Ile kosztuje pobyt na Malcie ponad cenę lokalu",
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
        title: "Które ścieżki pobytowe w Portugalii istnieją",
        note: "Ścieżka inwestycyjna znosi wizę, nie badanie środków utrzymania: art. 90-A(1)(a).",
      },
      ptClock: {
        title: "Ile lat pobytu przed obywatelstwem portugalskim",
        note: "Lei Orgânica 1/2026 obowiązuje od 19 maja 2026. Sprawy złożone do 18 maja rozpatruje dawne brzmienie.",
      },
      ptPublished: {
        title: "Akt kontra strony z wyników wyszukiwania",
        note: "Sprawdzone 28 sierpnia 2026. Każda strona ma znacznik aktualizacji nowszy niż jej własna liczba.",
      },
      grTiers: {
        title: "Cztery progi greckiej złotej wizy i co się z każdym wiąże",
        note: "Zasada „jedna nieruchomość” obowiązuje we wszystkich czterech przypadkach. Minimalna powierzchnia tylko w §2(a) i §2(b).",
      },
      grPresence: {
        title: "Dlaczego lata liczą się jednemu, a drugiemu nie",
        note: "Art. 144 §1 wymaga faktycznego zamieszkiwania: nieobecności poniżej sześciu miesięcy, dziesięć przez pięć lat.",
      },
      grTax: {
        title: "Trzy greckie reżimy podatkowe: 5A, 5B i 5C",
        note: "Słupek to okres w latach podatkowych. 5A zaczyna się od pierwszego roku wniosku, 5B od następnego.",
      },
      aeChain: {
        title: "Co ustala próg złotej wizy, a co nie ustala nic",
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
  // 480 and not 430: the Cyrillic label for food and non-alcoholic beverages is
  // wider than the English one and ran into the bar. Widened for every locale
  // rather than abbreviating one language's category name.
  const x0 = 480;
  const x1 = width - 300;
  const scale = (v) => ((x1 - x0) * v) / max;
  let body = "";

  GR_BUDGET.forEach((row, i) => {
    const y = 232 + i * 74;
    body += text(48, y + 5, L.grBudget[row.key], { size: 16, weight: 500 });
    const w = scale(row.share);
    body += `<path d="M${x0} ${y - 14} h${w - 4} a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${C.accent}"/>`;
    body += text(x0 + w + 14, y + 5, L.pct(row.share), {
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
    body += text(width - 48, y + 5, L.pct(row.pct), {
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

// --- Figure: from the first permit to a passport -----------------------------
// THE AXIS IS YEARS OF LEGAL RESIDENCE, NOT CALENDAR TIME, and the note says so:
// a permit renewed from abroad advances the bands and none of the markers.
function ptAfterTimeline(L) {
  const width = 1200;
  const height = 600;
  const x0 = 96;
  const x1 = width - 96;
  const maxYears = 10;
  const scale = (v) => x0 + ((x1 - x0) * v) / maxYears;
  const y = 300;
  let body = "";

  PT_AFTER_BANDS.forEach((band, i) => {
    const a = scale(band.from);
    const b = scale(band.to);
    body += `<rect x="${a}" y="${y - 22}" width="${b - a}" height="44" rx="4" fill="${i === 0 ? C.accent : C.pending}"/>`;
    body += text((a + b) / 2, y + 6, L.ptAfterBands[band.key], {
      size: 14,
      fill: C.onAccent,
      anchor: "middle",
      weight: 500,
    });
  });

  // Markers sit ABOVE the band with their label above the tick, so that the
  // year scale below stays a clean row of numbers.
  // TWO HEIGHTS, ALTERNATING. Three labels on one line collided on the first
  // draw — "Permanent residence" ran into "Citizenship" — and the rightmost one
  // fell off the canvas. Odd marks sit higher; the last is anchored to its end.
  PT_AFTER_MARKS.forEach((mark, i) => {
    const x = scale(mark.at);
    const lift = i % 2 === 1 ? 44 : 0;
    const last = i === PT_AFTER_MARKS.length - 1;
    body += `<line x1="${x}" y1="${y - 78 - lift}" x2="${x}" y2="${y - 22}" stroke="${C.line}" stroke-width="1"/>`;
    body += `<circle cx="${x}" cy="${y - 78 - lift}" r="7" fill="${C.accent}"/>`;
    body += text(last ? x + 16 : x, y - 96 - lift, L.ptAfterMarks[mark.key], {
      size: 14,
      anchor: last ? "end" : "middle",
      weight: 500,
    });
  });

  for (let v = 0; v <= maxYears; v += 1) {
    body += text(scale(v), y + 52, String(v), {
      size: 13,
      family: FONT_MONO,
      fill: C.muted,
      anchor: "middle",
    });
  }
  body += text(x0, y + 92, L.ptAfterAxis, { size: 13, fill: C.muted });

  // The one fact that does not fit on an axis.
  body += text(x0, y + 136, L.ptAfterNoExpiry, { size: 15, weight: 500 });

  return frame(
    width,
    height,
    L.figures.ptAfterTimeline.title,
    L.eyebrow,
    L.checked(L.dates.portugalAfter),
    body,
    L.figures.ptAfterTimeline.note,
  );
}

// --- Figure: two statuses the market treats as one ---------------------------
// TWO COLUMNS, NO COLOUR DIFFERENCE. Neither status is better; colour on this
// site says covered or not, and both of these are covered. The separation is
// carried by position and by the heading, which is what the statute does too.
function ptAfterStatuses(L) {
  const width = 1200;
  const height = 700;
  const colA = 400;
  const colB = 810;
  let body = "";

  body += text(colA, 216, L.ptStatusHeads.national, { size: 16, weight: 600 });
  body += text(colB, 216, L.ptStatusHeads.eu, { size: 16, weight: 600 });
  body += `<line x1="48" y1="238" x2="${width - 48}" y2="238" stroke="${C.hairline}" stroke-width="1"/>`;

  PT_STATUSES.forEach((key, i) => {
    const y = 286 + i * 76;
    body += text(48, y, L.ptStatusRows[key], { size: 15, weight: 500 });
    body += text(colA, y, L.ptStatusNational[key], { size: 14, fill: C.muted });
    body += text(colB, y, L.ptStatusEu[key], { size: 14, fill: C.muted });
    if (i < PT_STATUSES.length - 1) {
      body += `<line x1="48" y1="${y + 26}" x2="${width - 48}" y2="${y + 26}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width,
    height,
    L.figures.ptAfterStatuses.title,
    L.eyebrow,
    L.checked(L.dates.portugalAfter),
    body,
    L.figures.ptAfterStatuses.note,
  );
}

// --- Figure: the order of operations ----------------------------------------
// A ROW PER JURISDICTION RATHER THAN A SHARED TIMELINE, because the stages do
// not correspond: Malta has a screening step Portugal does not, and Portugal has
// a scheduling step nobody else has. Aligning them on one axis would invent a
// correspondence the procedures do not have. What is comparable is the position
// of one stage inside its own row, and that is what the fill marks.
function gvApplySequence(L) {
  const width = 1240;
  const height = 820;
  const trackX = 258;
  const trackW = width - 48 - trackX;
  let body = "";

  body += text(48, 190, L.gvApplyLegend, { size: 13, fill: C.muted });

  GV_APPLY_LANES.forEach((lane, li) => {
    const y = 268 + li * 128;
    body += text(48, y + 6, L.gvApplyLanes[lane.key], { size: 16, weight: 600 });
    const gap = 12;
    const stepW = (trackW - gap * (lane.steps.length - 1)) / lane.steps.length;
    lane.steps.forEach((step, si) => {
      const x = trackX + si * (stepW + gap);
      const filled = step === lane.money;
      body += `<rect x="${x.toFixed(1)}" y="${y - 34}" width="${stepW.toFixed(1)}" height="68" rx="6" fill="${filled ? C.accent : C.bg}" stroke="${filled ? C.accent : C.line}" stroke-width="1"/>`;
      const label = L.gvApplySteps[step];
      const first = label.includes("\n") ? y - 5 : y + 6;
      body += text(x + stepW / 2, first, label, {
        size: 13,
        anchor: "middle",
        fill: filled ? C.onAccent : C.text,
        weight: filled ? 500 : 400,
      });
      if (si < lane.steps.length - 1) {
        const cx = x + stepW + gap / 2;
        body += `<path d="M ${(cx - 3).toFixed(1)} ${y - 5} L ${(cx + 3).toFixed(1)} ${y} L ${(cx - 3).toFixed(1)} ${y + 5}" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    });
    if (li < GV_APPLY_LANES.length - 1) {
      body += `<line x1="48" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width,
    height,
    L.figures.gvApplySequence.title,
    L.eyebrow,
    L.checked(L.dates.goldenVisaApply),
    body,
    L.figures.gvApplySequence.note,
  );
}

// --- Figure: what processing costs ------------------------------------------
// CUMULATIVE BARS, NOT INCREMENTS, so the height reads as the running total the
// applicant has paid. The Greek fee is drawn as a rule across the whole plot
// rather than as a fifth bar: at 2,016 € against 99,000 € a bar would be two
// pixels tall and would read as an error rather than as the finding.
function gvApplyFees(L) {
  const width = 1200;
  const height = 800;
  const baseline = 616;
  const top = 236;
  const plotX = 300;
  const plotW = width - 48 - plotX;
  const total = GV_FEES.reduce((sum, step) => sum + step.value, 0);
  const scale = (v) => ((baseline - top) * v) / total;
  let body = "";

  body += text(48, 190, L.gvFeeAxis, { size: 13, fill: C.muted });

  const gap = 10;
  const stepW = (plotW - gap * (GV_FEES.length - 1)) / GV_FEES.length;
  let cum = 0;
  GV_FEES.forEach((step, i) => {
    cum += step.value;
    const h = scale(cum);
    const x = plotX + i * (stepW + gap);
    body += `<rect x="${x.toFixed(1)}" y="${(baseline - h).toFixed(1)}" width="${stepW.toFixed(1)}" height="${h.toFixed(1)}" fill="${C.accent}"/>`;
    body += text(x + stepW / 2, baseline - h - 18, L.gvFeeAmounts[step.key], {
      size: 15,
      weight: 600,
      anchor: "middle",
    });
    body += text(x + stepW / 2, baseline + 34, L.gvFeeSteps[step.key], {
      size: 13,
      fill: C.muted,
      anchor: "middle",
    });
  });

  body += text(48, top - 4, L.gvFeeTotal(total), { size: 15, weight: 600 });

  const gy = baseline - scale(GV_GREECE_FEE);
  body += `<line x1="48" y1="${gy.toFixed(1)}" x2="${width - 48}" y2="${gy.toFixed(1)}" stroke="${C.text}" stroke-width="1.5" stroke-dasharray="6 5"/>`;
  body += text(48, gy - 46, L.gvFeeGreece, { size: 13, weight: 500 });

  body += `<line x1="48" y1="${baseline}" x2="${width - 48}" y2="${baseline}" stroke="${C.line}" stroke-width="1"/>`;

  return frame(
    width,
    height,
    L.figures.gvApplyFees.title,
    L.eyebrow,
    L.checked(L.dates.goldenVisaApply),
    body,
    L.figures.gvApplyFees.note,
  );
}

// --- Figure: the naturalisation clocks --------------------------------------
function gvPassportClocks(L) {
  const width = 1200;
  const height = 720;
  const plotX = 300;
  // 210 rather than 100: the value label sits outside the bar, and at ten
  // years the bar reached the margin and pushed "10 years" off the canvas.
  const plotW = width - 210 - plotX;
  const step = plotW / GV_PASSPORT_MAX;
  let body = "";

  body += text(48, 190, L.gvPassportAxis, { size: 13, fill: C.muted });

  for (let year = 0; year <= GV_PASSPORT_MAX; year += 2) {
    const x = plotX + year * step;
    body += `<line x1="${x.toFixed(1)}" y1="228" x2="${x.toFixed(1)}" y2="560" stroke="${C.hairline}" stroke-width="1"/>`;
    body += text(x, 590, String(year), { size: 12, fill: C.muted, anchor: "middle" });
  }

  GV_PASSPORT_CLOCKS.forEach((lane, i) => {
    const y = 268 + i * 74;
    body += text(48, y + 6, L.gvPassportLanes[lane.key], { size: 16, weight: 600 });
    if (lane.years === null) {
      body += text(plotX, y + 6, L.gvPassportNone, { size: 14, fill: C.muted });
      return;
    }
    const w = lane.years * step;
    body += `<rect x="${plotX}" y="${y - 16}" width="${w.toFixed(1)}" height="32" fill="${C.accent}"/>`;
    if (lane.to) {
      const extra = (lane.to - lane.years) * step;
      body += `<rect x="${(plotX + w).toFixed(1)}" y="${y - 16}" width="${extra.toFixed(1)}" height="32" fill="none" stroke="${C.accent}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    }
    const end = plotX + (lane.to ?? lane.years) * step;
    body += text(end + 14, y + 6, L.gvPassportValues[lane.key], { size: 14, weight: 600 });
    if (lane.mark) {
      const mx = plotX + lane.mark * step;
      body += `<line x1="${mx.toFixed(1)}" y1="${y - 26}" x2="${mx.toFixed(1)}" y2="${y + 26}" stroke="${C.onAccent}" stroke-width="2"/>`;
      body += text(mx, y - 38, L.gvPassportMark, { size: 12, fill: C.muted, anchor: "middle" });
    }
  });

  return frame(
    width,
    height,
    L.figures.gvPassportClocks.title,
    L.eyebrow,
    L.checked(L.dates.goldenPassport),
    body,
    L.figures.gvPassportClocks.note,
  );
}

// --- Figure: the three clocks ------------------------------------------------
function gvPassportCounts(L) {
  const width = 1200;
  const colA = 380;
  const colB = 630;
  const colC = 880;
  const height = 760;
  let body = "";

  body += text(colA, 212, L.gvClockHeads.permit, { size: 15, weight: 600 });
  body += text(colB, 212, L.gvClockHeads.longTerm, { size: 15, weight: 600 });
  body += text(colC, 212, L.gvClockHeads.naturalisation, { size: 15, weight: 600 });
  body += `<line x1="48" y1="234" x2="${width - 48}" y2="234" stroke="${C.hairline}" stroke-width="1"/>`;

  GV_CLOCK_ROWS.forEach((key, i) => {
    const y = 288 + i * 96;
    body += text(48, y, L.gvClockRows[key], { size: 15, weight: 500 });
    body += text(colA, y, L.gvClockPermit[key], { size: 13, fill: C.muted });
    body += text(colB, y, L.gvClockLongTerm[key], { size: 13, fill: C.muted });
    body += text(colC, y, L.gvClockNaturalisation[key], { size: 13, fill: C.muted });
    if (i < GV_CLOCK_ROWS.length - 1) {
      body += `<line x1="48" y1="${y + 44}" x2="${width - 48}" y2="${y + 44}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width,
    height,
    L.figures.gvPassportCounts.title,
    L.eyebrow,
    L.checked(L.dates.goldenPassport),
    body,
    L.figures.gvPassportCounts.note,
  );
}

// --- Figure: what the nomad permit allows and forbids ------------------------
function mtNomadLimits(L) {
  const width = 1200;
  const height = 800;
  const colA = 100;
  const colB = 650;
  let body = "";

  body += text(colA, 212, L.mtNomadHeads.allowed, { size: 16, weight: 600 });
  body += text(colB, 212, L.mtNomadHeads.forbidden, { size: 16, weight: 600, fill: C.accent });
  body += `<line x1="48" y1="236" x2="${width - 48}" y2="236" stroke="${C.hairline}" stroke-width="1"/>`;

  const rows = Math.max(MT_NOMAD_ALLOWED.length, MT_NOMAD_FORBIDDEN.length);
  for (let i = 0; i < rows; i += 1) {
    const y = 292 + i * 106;
    const left = MT_NOMAD_ALLOWED[i];
    const right = MT_NOMAD_FORBIDDEN[i];
    if (left) body += text(colA, y, L.mtNomadAllowed[left], { size: 14, fill: C.muted });
    if (right) body += text(colB, y, L.mtNomadForbidden[right], { size: 14, fill: C.muted });
    if (i < rows - 1) {
      body += `<line x1="48" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  }

  return frame(
    width,
    height,
    L.figures.mtNomadLimits.title,
    L.eyebrow,
    L.checked(L.dates.maltaNomad),
    body,
    L.figures.mtNomadLimits.note,
  );
}

// --- Figure: the four-year clock ---------------------------------------------
function mtNomadClock(L) {
  const width = 1200;
  const height = 620;
  const startX = 100;
  const blockW = 180;
  const gap = 10;
  const top = 300;
  const blockH = 90;
  let body = "";

  MT_NOMAD_YEARS.forEach((year, i) => {
    const x = startX + i * (blockW + gap);
    body += text(x + blockW / 2, top - 22, L.mtNomadYears[year.key], {
      size: 13,
      fill: C.muted,
      anchor: "middle",
    });
    body += `<rect x="${x}" y="${top}" width="${blockW}" height="${blockH}" rx="4" fill="${year.taxed ? C.accent : C.bg}" stroke="${C.accent}" stroke-width="${year.taxed ? 0 : 1.5}"${year.taxed ? "" : ' stroke-dasharray="6 4"'}/>`;
    body += text(x + blockW / 2, top + 38, year.taxed ? L.mtNomadTaxed : L.mtNomadFree, {
      size: 14,
      anchor: "middle",
      weight: 500,
      fill: year.taxed ? C.onAccent : C.text,
    });
  });

  const stripEnd = startX + MT_NOMAD_YEARS.length * (blockW + gap) - gap;
  const wallX = stripEnd + 22;
  body += `<line x1="${wallX}" y1="${top - 40}" x2="${wallX}" y2="${top + blockH + 40}" stroke="${C.text}" stroke-width="3"/>`;
  body += text(wallX + 20, top + 14, L.mtNomadWall, { size: 14, weight: 500 });

  body += text(startX, top + blockH + 62, L.mtNomadPresence, { size: 13, fill: C.muted });

  return frame(
    width,
    height,
    L.figures.mtNomadClock.title,
    L.eyebrow,
    L.checked(L.dates.maltaNomad),
    body,
    L.figures.mtNomadClock.note,
  );
}

// --- Figure: the card timeline ----------------------------------------------
function mtCardTimeline(L) {
  const width = 1240;
  const height = 780;
  const left = 260;
  const right = width - 88;
  let body = "";

  // First application
  const yA = 300;
  body += text(48, yA + 6, L.mtCardLanes.first, { size: 16, weight: 600 });
  body += `<line x1="${left}" y1="${yA}" x2="${right}" y2="${yA}" stroke="${C.line}" stroke-width="1"/>`;
  const bandFrom = left + 40;
  const bandTo = left + 520;
  body += `<rect x="${bandFrom}" y="${yA - 22}" width="${bandTo - bandFrom}" height="44" rx="4" fill="${C.accent}"/>`;
  body += text((bandFrom + bandTo) / 2, yA + 6, L.mtCardWait, {
    size: 13,
    anchor: "middle",
    fill: C.onAccent,
    weight: 500,
  });
  const marks = [
    { key: "submit", x: bandFrom, anchor: "middle" },
    { key: "approve", x: bandTo, anchor: "middle" },
    { key: "notice", x: bandTo + 140, anchor: "middle" },
    { key: "collect", x: right, anchor: "end" },
  ];
  marks.forEach((m) => {
    body += `<line x1="${m.x}" y1="${yA - 30}" x2="${m.x}" y2="${yA + 30}" stroke="${C.text}" stroke-width="1.5"/>`;
    body += text(m.x, yA + 58, L.mtCardMarks[m.key], { size: 13, fill: C.muted, anchor: m.anchor });
  });

  // Renewal
  const yB = 520;
  body += text(48, yB + 6, L.mtCardLanes.renewal, { size: 16, weight: 600 });
  body += `<line x1="${left}" y1="${yB}" x2="${right}" y2="${yB}" stroke="${C.line}" stroke-width="1"/>`;
  const winFrom = left + 440;
  const winTo = left + 740;
  body += `<rect x="${winFrom}" y="${yB - 22}" width="${winTo - winFrom}" height="44" rx="4" fill="none" stroke="${C.accent}" stroke-width="1.5"/>`;
  body += text((winFrom + winTo) / 2, yB + 6, L.mtCardWindow, {
    size: 13,
    anchor: "middle",
    weight: 500,
  });
  body += text(winFrom, yB + 58, L.mtCardRenewMarks.open, { size: 13, fill: C.muted, anchor: "middle" });
  body += text(winTo, yB + 58, L.mtCardRenewMarks.close, { size: 13, fill: C.muted, anchor: "middle" });
  body += `<line x1="${right}" y1="${yB - 30}" x2="${right}" y2="${yB + 30}" stroke="${C.text}" stroke-width="2.5"/>`;
  body += text(right, yB - 44, L.mtCardRenewMarks.expiry, { size: 13, fill: C.muted, anchor: "end" });
  body += text(left, yB + 106, L.mtCardRenewNote, { size: 13, fill: C.muted });

  return frame(
    width,
    height,
    L.figures.mtCardTimeline.title,
    L.eyebrow,
    L.checked(L.dates.maltaCard),
    body,
    L.figures.mtCardTimeline.note,
  );
}

// --- Figure: the fees --------------------------------------------------------
function mtCardFees(L) {
  const width = 1200;
  const height = 760;
  const basisX = 260;
  let body = "";
  let y = 250;

  MT_CARD_FEES.forEach((row, i) => {
    body += text(48, y, L.mtCardFeeAmounts[row.key], { size: 22, weight: 600 });
    body += text(basisX, y, L.mtCardFeeBases[row.key], { size: 14, fill: C.muted });
    const bottom = y + (row.lines - 1) * 27;
    if (i < MT_CARD_FEES.length - 1) {
      body += `<line x1="48" y1="${bottom + 28}" x2="${width - 48}" y2="${bottom + 28}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
    y = bottom + 56;
  });

  return frame(
    width,
    height,
    L.figures.mtCardFees.title,
    L.eyebrow,
    L.checked(L.dates.maltaCard),
    body,
    L.figures.mtCardFees.note,
  );
}

// --- Figure: article 100 against article 79Α ---------------------------------
function grProcessCompare(L) {
  const width = 1200;
  const height = 920;
  // Три колонки вместо двух: рынок сливает воедино три разных инструмента, и
  // таблица показывает их по отдельности. Ширины подобраны под самую длинную
  // строку в каждой колонке при 13px, поэтому подписи разбиты вручную.
  const colA = 330;
  const colB = 620;
  const colC = 910;
  let body = "";

  body += text(colA, 216, L.grProcessHeads.investor, { size: 15, weight: 600 });
  // Все три заголовка одного цвета: колонки равноправны, а хронологию — какая
  // норма когда появилась — несёт подпись словами, а не оттенок.
  body += text(colB, 216, L.grProcessHeads.startup, { size: 15, weight: 600 });
  body += text(colC, 216, L.grProcessHeads.tech, { size: 15, weight: 600 });
  body += `<line x1="48" y1="240" x2="${width - 48}" y2="240" stroke="${C.hairline}" stroke-width="1"/>`;

  GR_PROCESS_ROWS.forEach((key, i) => {
    const y = 292 + i * 84;
    body += text(48, y, L.grProcessRows[key], { size: 15, weight: 500 });
    body += text(colA, y, L.grProcessInvestor[key], { size: 13, fill: C.muted });
    body += text(colB, y, L.grProcessStartup[key], { size: 13, fill: C.muted });
    body += text(colC, y, L.grProcessTech[key], { size: 13, fill: C.muted });
    if (i < GR_PROCESS_ROWS.length - 1) {
      body += `<line x1="48" y1="${y + 40}" x2="${width - 48}" y2="${y + 40}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width,
    height,
    L.figures.grProcessCompare.title,
    L.eyebrow,
    L.checked(L.dates.greeceProcess),
    body,
    L.figures.grProcessCompare.note,
  );
}

// --- Figure: аренда по субрегионам -------------------------------------------
function ptMoveRent(L) {
  const width = 1200;
  const height = 800;
  const x0 = 420;
  const x1 = width - 260;
  const scale = (v) => ((x1 - x0) * v) / PT_MOVE_RENT_MAX;
  let body = "";

  body += text(48, 190, L.ptMoveRentAxis, { size: 13, fill: C.muted });

  PT_MOVE_RENT.forEach((row, i) => {
    const y = 262 + i * 66;
    body += text(48, y + 5, L.ptMoveRent[row.key], {
      size: 15,
      weight: row.ref ? 600 : 400,
    });
    const w = scale(row.value);
    body += `<rect x="${x0}" y="${y - 16}" width="${w.toFixed(1)}" height="32" rx="3" fill="${row.ref ? C.pending : C.accent}"/>`;
    body += text(x0 + w + 14, y + 5, L.perSqm2(row.value), {
      size: 15,
      family: FONT_MONO,
      weight: row.ref ? 600 : 400,
    });
  });

  return frame(
    width,
    height,
    L.figures.ptMoveRent.title,
    L.eyebrow,
    L.checked(L.dates.portugalMove),
    body,
    L.figures.ptMoveRent.note,
  );
}

// --- Figure: надбавка для покупателя из-за рубежа -----------------------------
function ptMovePremium(L) {
  const width = 1200;
  const height = 760;
  const x0 = 340;
  const x1 = width - 190;
  const scale = (v) => ((x1 - x0) * v) / 150;
  let body = "";

  PT_MOVE_PREMIUM.forEach((lane, i) => {
    const top = 250 + i * 190;
    body += text(48, top, L.ptMovePremiumLanes[lane.key], { size: 16, weight: 600 });

    const rows = [
      { key: "home", value: 100, ref: true },
      { key: "abroad", value: 100 + lane.premium, ref: false },
    ];
    rows.forEach((row, j) => {
      const y = top + 48 + j * 52;
      body += text(48, y + 5, L.ptMovePremiumRows[row.key], { size: 13, fill: C.muted });
      const w = scale(row.value);
      body += `<rect x="${x0}" y="${y - 15}" width="${w.toFixed(1)}" height="30" rx="3" fill="${row.ref ? C.pending : C.accent}"/>`;
      body += text(x0 + w + 14, y + 5, row.ref ? L.ptMovePremiumBase : L.ptMovePremiumValue(lane.premium), {
        size: 15,
        family: FONT_MONO,
        weight: row.ref ? 400 : 600,
      });
    });

    if (i < PT_MOVE_PREMIUM.length - 1) {
      body += `<line x1="48" y1="${top + 152}" x2="${width - 48}" y2="${top + 152}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width,
    height,
    L.figures.ptMovePremium.title,
    L.eyebrow,
    L.checked(L.dates.portugalMove),
    body,
    L.figures.ptMovePremium.note,
  );
}

// --- Portugal golden visa: what article 3(1) still offers --------------------
// EIGHT ROWS, THREE OF THEM STRUCK OUT, and the strike-through is the point of
// the drawing. Every competing page presents the surviving routes as a list,
// which answers "what can I do" and silently loses "what happened to the thing
// I came here for". A reader arriving from an advertisement for the property
// route needs to find that route on the page and see it crossed out; a list it
// is missing from reads as a list that forgot it.
//
// Colour carries the status and the status also carries a word: the repealed
// rows are accent-coloured AND say "Repealed 2023", the surviving ones are
// plain AND say "In force". Neither alone survives a printout or a colourblind
// reader.
const PT_GV_ROUTES = [
  { key: "i", dead: true },
  { key: "ii", dead: false },
  { key: "iii", dead: true },
  { key: "iv", dead: true },
  { key: "v", dead: false },
  { key: "vi", dead: false },
  { key: "vii", dead: false },
  { key: "viii", dead: false },
];

function ptGvRoutes(L) {
  const width = 1200;
  // 980, НЕ 900. Восемь строк по 74 от 262 доводят последнюю до 780, а frame
  // ставит подпись на height − 92. При 900 подпись легла поверх строки viii —
  // поймано отрисовкой, в коде не видно.
  const height = 980;
  const xSub = 48;
  // 320, НЕ 190: слово SUBPARAGRAPH в капители с трекингом 2.2 занимает 250px и
  // при 190 налезало на заголовок соседней колонки.
  const xAsk = 320;
  const xStatus = 940;
  let body = "";

  body += text(xSub, 200, L.ptGvHeads.sub, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xAsk, 200, L.ptGvHeads.ask, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xStatus, 200, L.ptGvHeads.status, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xSub}" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  PT_GV_ROUTES.forEach((row, i) => {
    const y = 262 + i * 74;
    const fill = row.dead ? C.muted : C.text;

    body += text(xSub, y, L.ptGvSub[row.key], { size: 16, family: FONT_MONO, fill });
    body += text(xAsk, y, L.ptGvAsk[row.key], {
      size: 17,
      weight: 500,
      fill,
      // Третий носитель того же факта, после цвета и слова «Repealed 2023».
      decoration: row.dead ? "line-through" : null,
    });
    if (L.ptGvNote[row.key]) {
      body += text(xAsk, y + 25, L.ptGvNote[row.key], { size: 13, fill: C.muted });
    }
    body += text(xStatus, y, row.dead ? L.ptGvStatus.dead : L.ptGvStatus.live, {
      size: 15,
      weight: row.dead ? 600 : 400,
      fill: row.dead ? C.accent : C.text,
    });

    if (i < PT_GV_ROUTES.length - 1) {
      body += `<line x1="${xSub}" y1="${y + 40}" x2="${width - 48}" y2="${y + 40}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width,
    height,
    L.figures.ptGvRoutes.title,
    L.eyebrow,
    L.checked(L.dates.portugalGoldenVisa),
    body,
    L.figures.ptGvRoutes.note,
  );
}

// --- Portugal golden visa: the fee ladder ------------------------------------
// NOT CUMULATIVE, unlike the Maltese fee figure, and the difference is the
// finding. Malta's fees are a sequence you pay through; these four are separate
// charges whose whole interest is that they differ by an order of magnitude —
// issuing the permit costs ten times considering the application. Stacking them
// would hide exactly the ratio worth seeing, so each stands on its own baseline
// and the totals are said in words underneath.
const PT_GV_FEES = [
  { key: "consider", value: 842.8 },
  { key: "issue", value: 8418.9 },
  { key: "renew", value: 4210.3 },
  { key: "family", value: 8418.9 },
];

function ptGvFees(L) {
  const width = 1200;
  // 900, НЕ 800: три строки итогов под осью и подпись frame на height − 92
  // накладывались друг на друга. Поймано отрисовкой.
  const height = 900;
  const baseline = 604;
  const top = 250;
  const plotX = 120;
  const plotW = width - 48 - plotX;
  const max = Math.max(...PT_GV_FEES.map((f) => f.value));
  const scale = (v) => ((baseline - top) * v) / max;
  let body = "";

  body += text(48, 196, L.ptGvFeeAxis, { size: 13, fill: C.muted });

  const gap = 40;
  const barW = (plotW - gap * (PT_GV_FEES.length - 1)) / PT_GV_FEES.length;
  PT_GV_FEES.forEach((fee, i) => {
    const h = scale(fee.value);
    const x = plotX + i * (barW + gap);
    body += `<rect x="${x.toFixed(1)}" y="${(baseline - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${C.accent}"/>`;
    body += text(x + barW / 2, baseline - h - 18, L.ptGvFeeAmounts[fee.key], {
      size: 17, weight: 600, anchor: "middle",
    });
    body += text(x + barW / 2, baseline + 34, L.ptGvFeeNames[fee.key], {
      size: 14, fill: C.muted, anchor: "middle",
    });
  });

  body += `<line x1="48" y1="${baseline}" x2="${width - 48}" y2="${baseline}" stroke="${C.line}" stroke-width="1"/>`;
  body += text(48, baseline + 96, L.ptGvFeeTotals.one, { size: 16, weight: 600 });
  body += text(48, baseline + 124, L.ptGvFeeTotals.family, { size: 16, weight: 600 });
  body += text(48, baseline + 154, L.ptGvFeeTotals.online, { size: 13, fill: C.muted });

  return frame(
    width,
    height,
    L.figures.ptGvFees.title,
    L.eyebrow,
    L.checked(L.dates.portugalGoldenVisa),
    body,
    L.figures.ptGvFees.note,
  );
}

// --- Portugal: median rent per square metre ---------------------------------
// A REFERENCE LINE, NOT A SEVENTH BAR. The national median is not one more
// place on the list — it is the level the six named areas are all above, and
// the finding of the release is that every one of them cleared it. Drawn as a
// bar it would read as "and also Portugal", which is the one reading that is
// wrong.
const PT_LIVING_RENT = [
  { key: "lisbonCity", value: 17.42 },
  { key: "greaterLisbon", value: 14.38 },
  { key: "madeira", value: 11.97 },
  { key: "setubal", value: 11.35 },
  { key: "algarve", value: 10.71 },
  { key: "porto", value: 10.13 },
];
const PT_LIVING_NATIONAL = 9.46;

function ptLivingRent(L) {
  const width = 1200;
  const height = 800;
  const baseline = 600;
  const top = 250;
  // 210, НЕ 120, и это поле под подпись опорной линии. При 120 подпись шла
  // поверх столбцов: тёмный текст на тёмной заливке, нечитаемо над Мадейрой и
  // Сетубалом. Поймано отрисовкой. Пояснение при этом ушло в строку описания
  // сверху, где место есть, а у линии осталось только число.
  const plotX = 210;
  const plotW = width - 48 - plotX;
  const max = Math.max(...PT_LIVING_RENT.map((r) => r.value));
  const scale = (v) => ((baseline - top) * v) / max;
  let body = "";

  body += text(48, 196, L.ptLivingRentAxis, { size: 13, fill: C.muted });

  const gap = 26;
  const barW = (plotW - gap * (PT_LIVING_RENT.length - 1)) / PT_LIVING_RENT.length;
  PT_LIVING_RENT.forEach((row, i) => {
    const h = scale(row.value);
    const x = plotX + i * (barW + gap);
    body += `<rect x="${x.toFixed(1)}" y="${(baseline - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${C.accent}"/>`;
    body += text(x + barW / 2, baseline - h - 18, L.ptLivingRentAmounts[row.key], {
      size: 16, weight: 600, anchor: "middle",
    });
    body += text(x + barW / 2, baseline + 34, L.ptLivingRentNames[row.key], {
      size: 13, fill: C.muted, anchor: "middle",
    });
  });

  const ny = baseline - scale(PT_LIVING_NATIONAL);
  body += `<line x1="48" y1="${ny.toFixed(1)}" x2="${width - 48}" y2="${ny.toFixed(1)}" stroke="${C.text}" stroke-width="1.5" stroke-dasharray="6 5"/>`;
  body += text(48, ny - 12, L.ptLivingRentNational, { size: 14, weight: 600 });

  body += `<line x1="48" y1="${baseline}" x2="${width - 48}" y2="${baseline}" stroke="${C.line}" stroke-width="1"/>`;

  return frame(
    width, height,
    L.figures.ptLivingRent.title, L.eyebrow,
    L.checked(L.dates.portugalLiving), body,
    L.figures.ptLivingRent.note,
  );
}

// --- Portugal: what a foreign tax domicile pays ------------------------------
// AN INDEX, AND THE FIGURE SAYS SO IN THREE PLACES: the axis line, the baseline
// label and the note. The release publishes the DIFFERENCE between the two
// groups and not the absolute price of either, so a chart in euros would be an
// invention. The baseline at 100 is the domestic buyer, drawn as a solid rule
// rather than a bar because it is the thing being compared against.
const PT_DOMICILE = [
  { key: "greaterLisbon", value: 149.0 },
  { key: "porto", value: 135.6 },
];
const PT_DOMICILE_BASE = 100;

function ptLivingDomicile(L) {
  const width = 1200;
  const height = 760;
  const baseline = 560;
  const top = 260;
  const plotX = 360;
  const plotW = width - 48 - plotX;
  const max = 160;
  const scale = (v) => ((baseline - top) * v) / max;
  let body = "";

  body += text(48, 200, L.ptLivingDomicileAxis, { size: 13, fill: C.muted });

  const gap = 90;
  const barW = (plotW - gap) / 2;
  PT_DOMICILE.forEach((row, i) => {
    const h = scale(row.value);
    const x = plotX + i * (barW + gap);
    body += `<rect x="${x.toFixed(1)}" y="${(baseline - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${C.accent}"/>`;
    body += text(x + barW / 2, baseline - h - 20, L.ptLivingDomicileAmounts[row.key], {
      size: 19, weight: 600, anchor: "middle",
    });
    body += text(x + barW / 2, baseline + 34, L.ptLivingDomicileNames[row.key], {
      size: 14, fill: C.muted, anchor: "middle",
    });
  });

  // Подпись базовой линии держать КОРОТКОЙ: слева от plotX её всего 312px, и
  // длинная строка уезжает поверх первого столбца — тёмным по тёмному. Полное
  // пояснение живёт в подписи кадра, где место есть. Тот же дефект был у
  // опорной линии в ptLivingRent, поймано отрисовкой 7 сентября 2026.
  const by = baseline - scale(PT_DOMICILE_BASE);
  body += `<line x1="48" y1="${by.toFixed(1)}" x2="${width - 48}" y2="${by.toFixed(1)}" stroke="${C.text}" stroke-width="2"/>`;
  body += text(48, by - 14, L.ptLivingDomicileBase, { size: 14, weight: 600 });

  body += `<line x1="48" y1="${baseline}" x2="${width - 48}" y2="${baseline}" stroke="${C.line}" stroke-width="1"/>`;

  return frame(
    width, height,
    L.figures.ptLivingDomicile.title, L.eyebrow,
    L.checked(L.dates.portugalLiving), body,
    L.figures.ptLivingDomicile.note,
  );
}

// --- Malta: the chain from judgment to deletion ------------------------------
// VERTICAL, NOT HORIZONTAL, and that is a decision taken after the Portuguese
// figures. A horizontal timeline puts four dated captions side by side and each
// one has to fit a column about 250px wide; these captions name gazette numbers
// and cannot be shortened without losing the thing that makes them checkable.
// Stacked rows give every caption the full width of the frame.
//
// THE FOURTH ROW IS NOT A STEP. The first three are instruments; the last is
// the state of a government web page thirteen months later. It is set in the
// accent and says so in words, because drawing it as a fourth instrument would
// assert that somebody legislated it.
const MT_CHAIN = [
  { key: "judgment", live: false },
  { key: "act", live: false },
  { key: "notice", live: false },
  { key: "page", live: true },
];

function mtChain(L) {
  const width = 1200;
  // 900, НЕ 820: четыре строки по 132 от y=272 доводят подпись последней до 696,
  // а frame ставит свою на height − 92. При 820 они наложились. Поймано
  // отрисовкой.
  const height = 900;
  const xDate = 48;
  const xBody = 330;
  // ПОДПИСЬ СТРОКИ — ДО ~88 ЗНАКОВ. От xBody до правого поля 822px, и на 13px
  // это примерно восемьдесят восемь знаков. Три из четырёх подписей первой
  // версии уехали за край: считать длину надо здесь, а не надеяться.

  let body = "";

  body += text(xDate, 200, L.mtChainHeads.when, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xBody, 200, L.mtChainHeads.what, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xDate}" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  MT_CHAIN.forEach((row, i) => {
    const y = 272 + i * 132;
    const fill = row.live ? C.accent : C.text;
    body += text(xDate, y, L.mtChainDates[row.key], { size: 17, weight: 600, fill });
    body += text(xBody, y, L.mtChainWhat[row.key], { size: 17, weight: 500, fill });
    body += text(xBody, y + 28, L.mtChainNote[row.key], { size: 13, fill: C.muted });
    if (i < MT_CHAIN.length - 1) {
      body += `<line x1="${xDate}" y1="${y + 78}" x2="${width - 48}" y2="${y + 78}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.mtChain.title, L.eyebrow,
    L.checked(L.dates.maltaCitizenshipRu ?? L.dates.maltaCitizenship), body,
    L.figures.mtChain.note,
  );
}

// --- Malta: merit against ordinary naturalisation ----------------------------
// TWO COLUMNS, and the row that matters is the last one. Everything above it
// invites the reader to compare two routes on their conditions; the fee row
// says that one of them cannot be compared on price at all, because no price is
// published. A table that omitted that row would read as though the merit route
// simply costs more or less.
const MT_ROUTE_ROWS = ["residence", "shows", "grounds", "decidedBy", "fee"];

function mtRoutes(L) {
  const width = 1200;
  // 980, НЕ 860: пять строк по 118 от y=282 доводят последнюю до 754, а frame
  // ставит подпись на height − 92. При 860 они наложились — третий раз за день
  // одна и та же арифметика, поэтому она теперь считается явно:
  // height >= 282 + (rows - 1) * 118 + 62 + 92 + 68.
  const height = 980;
  const xLabel = 48;
  const colA = 400;
  // 780, не 800: самая длинная строка правой колонки при 15px доходила
  // вплотную до правого поля.
  const colB = 780;
  let body = "";

  body += text(colA, 208, L.mtRouteHeads.merit, { size: 15, weight: 600 });
  body += text(colB, 208, L.mtRouteHeads.ordinary, { size: 15, weight: 600 });
  body += `<line x1="${xLabel}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  MT_ROUTE_ROWS.forEach((key, i) => {
    const y = 282 + i * 118;
    const accent = key === "fee";
    body += text(xLabel, y, L.mtRouteLabels[key], { size: 14, fill: C.muted, weight: 500 });
    body += text(colA, y, L.mtRouteMerit[key], { size: 15, weight: accent ? 600 : 400, fill: accent ? C.accent : C.text });
    body += text(colB, y, L.mtRouteOrdinary[key], { size: 15, weight: 400 });
    if (i < MT_ROUTE_ROWS.length - 1) {
      body += `<line x1="${xLabel}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.mtRoutes.title, L.eyebrow,
    L.checked(L.dates.maltaCitizenshipRu ?? L.dates.maltaCitizenship), body,
    L.figures.mtRoutes.note,
  );
}

// --- Britain and the UAE: the two tests, and the tie-breaker -----------------
// TWO ROWS AND THEY ARE NUMBERED, because the argument is a sequence rather than
// a pair: the second test does not arise until the first is answered. An
// unnumbered two-column figure would invite the reader to pick whichever looks
// more favourable, which is exactly the mistake the page exists to prevent.
function aeUkTests(L) {
  const width = 1200;
  // 640: два ряда по 150 от y=250 доводят третью строку последнего до 486,
  // подпись frame на height − 92 = 548.
  const height = 640;
  const xLeft = 48;
  let body = "";

  L.aeUkTestRows.forEach((key, i) => {
    const y = 250 + i * 150;
    body += text(xLeft, y, L.aeUkTestName[key], { size: 17, weight: 600 });
    body += text(xLeft, y + 30, L.aeUkTestWhat[key], { size: 15, fill: C.accent });
    body += text(xLeft, y + 58, L.aeUkTestWho[key], { size: 13, fill: C.muted });
    if (i < L.aeUkTestRows.length - 1) {
      body += `<line x1="${xLeft}" y1="${y + 96}" x2="${width - 48}" y2="${y + 96}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.aeUkTests.title, L.eyebrow,
    L.checked(L.dates.uaeUk), body,
    L.figures.aeUkTests.note,
  );
}

// THE THIRD STEP CARRIES THE ACCENT, and that is the whole figure. Every page in
// this market treats the passport as the thing that settles residence; the
// convention reaches it third, after a home left available in Britain and after
// habitual abode. Accenting the first step instead would have drawn a diagram
// that agrees with the market.
const AE_BREAK_ACCENT = new Set(["national"]);

function aeUkTiebreak(L) {
  const width = 1200;
  // 780: четыре ряда по 120 от y=240 доводят подпись последнего до 626, подпись
  // frame на height − 92 = 688.
  const height = 780;
  const xNum = 48;
  const xBody = 130;
  let body = "";

  L.aeUkBreakRows.forEach((key, i) => {
    const y = 240 + i * 120;
    const accent = AE_BREAK_ACCENT.has(key);
    const fill = accent ? C.accent : C.text;
    body += text(xNum, y, `${i + 1}`, { size: 22, weight: 600, family: FONT_MONO, fill: accent ? C.accent : C.faint ?? C.muted });
    body += text(xBody, y, L.aeUkBreakStep[key], { size: 17, weight: 600, fill });
    body += text(xBody, y + 28, L.aeUkBreakNote[key], { size: 13, fill: C.muted });
    if (i < L.aeUkBreakRows.length - 1) {
      body += `<line x1="${xNum}" y1="${y + 66}" x2="${width - 48}" y2="${y + 66}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.aeUkTiebreak.title, L.eyebrow,
    L.checked(L.dates.uaeUk), body,
    L.figures.aeUkTiebreak.note,
  );
}

// --- Dubai demand, by month -------------------------------------------------
// COLUMNS AND NOT A LINE, because the reader is meant to compare twelve
// discrete monthly figures rather than to read a rate of change — and because a
// line drawn through a step invites the eye to smooth it, which is the one
// reading the figure exists to prevent. The marker sits BETWEEN February and
// March rather than on a column: the strikes began on 28 February, which is the
// boundary rather than either month.
const AE_SERIES = [4400, 3600, 3600, 5400, 3600, 2900, 2400, 1300, 880, 880, 880, 880];

function aeDemand(L) {
  const width = 1200;
  const height = 760;
  const x0 = 96;
  const x1 = width - 64;
  const baseY = 560;
  const topY = 250;
  const MAX = 5400;
  const slot = (x1 - x0) / AE_SERIES.length;
  const barW = slot * 0.62;
  const h = (v) => ((v / MAX) * (baseY - topY));
  let body = "";

  AE_SERIES.forEach((v, i) => {
    const cx = x0 + slot * i + slot / 2;
    const bh = h(v);
    // Столбцы после ступени — акцентные: они и есть сегодняшний уровень.
    const fill = i >= 8 ? C.accent : C.line;
    body += `<rect x="${cx - barW / 2}" y="${baseY - bh}" width="${barW}" height="${bh}" fill="${fill}"/>`;
    body += text(cx, baseY - bh - 12, `${v}`, { size: 12, family: FONT_MONO, fill: i >= 8 ? C.accent : C.muted, anchor: "middle" });
    body += text(cx, baseY + 24, L.aeMonths[i], { size: 12, fill: C.muted, anchor: "middle" });
  });

  body += `<line x1="${x0}" y1="${baseY}" x2="${x1}" y2="${baseY}" stroke="${C.line}" stroke-width="1"/>`;

  // Маркер на границе февраля и марта, а не на столбце.
  const markX = x0 + slot * 7;
  body += `<line x1="${markX}" y1="${topY - 20}" x2="${markX}" y2="${baseY}" stroke="${C.accent}" stroke-width="1" stroke-dasharray="4 4"/>`;
  body += text(markX + 12, topY - 26, L.aeMarker, { size: 13, weight: 600, fill: C.accent });
  body += text(x0, baseY + 62, L.aeControl, { size: 13, fill: C.muted });

  return frame(
    width, height,
    L.figures.aeDemand.title, L.eyebrow,
    L.checked(L.dates.uaeUk), body,
    L.figures.aeDemand.note,
  );
}

// --- The travel advice, both halves -----------------------------------------
// THE LEFT COLUMN IS A LIST OF ABSENCES, which is unusual for a figure and is
// the point: what the FCDO page does NOT say is half of what it says, and an
// absence cannot be quoted. So the left side is our plain statement of what is
// missing and the right side is the page's own words, in quotation marks. The
// two are set in different registers deliberately.
function aeAdvice(L) {
  const width = 1200;
  const height = 760;
  const xLeft = 48;
  // 560, А НЕ 620, и кегль правой колонки 13, а не 14. Там дословные цитаты с
  // правительственной страницы, и сокращать их ради вёрстки нельзя: обрезанная
  // цитата — это уже пересказ. Сдвинули колонку и уменьшили шрифт. От 560 до
  // правого поля 1152 — 592px, на 13px это около шестидесяти пяти знаков.
  const colRight = 560;
  let body = "";

  body += text(xLeft, 208, L.aeAdviceCols.not, { size: 15, weight: 600 });
  body += text(colRight, 208, L.aeAdviceCols.does, { size: 15, weight: 600, fill: C.accent });
  body += `<line x1="${xLeft}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  L.aeAdviceRows.forEach((key, i) => {
    const y = 282 + i * 118;
    body += text(xLeft, y, L.aeAdviceNot[key], { size: 14 });
    body += text(colRight, y, L.aeAdviceDoes[key], { size: 13, fill: C.accent });
    if (i < L.aeAdviceRows.length - 1) {
      body += `<line x1="${xLeft}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.aeAdvice.title, L.eyebrow,
    L.checked(L.dates.uaeUk), body,
    L.figures.aeAdvice.note,
  );
}

// --- Britain and Portugal: a convention replaced, and two start dates --------
// FOUR DATED ROWS AND THEN A BLOCK THAT IS NOT A ROW. The top half is the
// replacement — 1968 signed, 1969 in force, 2025 signed, 2025 in force — and
// the reader is meant to reach the fourth line and notice the gap between the
// first signature and the third.
//
// THE EFFECT DATES ARE SET APART DELIBERATELY, under their own heading. They
// are not another step in the sequence: they are four answers to a different
// question, "from when does this reach me", and folding them into the timeline
// would make eight rows that look like one story and are two.
const PT_UK_ACCENT = new Set(["forceNew"]);

function ptUkTreaty(L) {
  const width = 1200;
  // 1000: четыре ряда по 104 от y=240 доводят подпись последнего до 580, блок
  // дат применения от 640 до 868, подпись frame на height − 92 = 908.
  const height = 1000;
  const xWhen = 48;
  const xBody = 330;
  let body = "";

  L.ptUkSteps.forEach((key, i) => {
    const y = 240 + i * 104;
    const fill = PT_UK_ACCENT.has(key) ? C.accent : C.text;
    body += text(xWhen, y, L.ptUkDates[key], { size: 17, weight: 600, fill });
    body += text(xBody, y, L.ptUkWhat[key], { size: 16, weight: 500, fill });
    if (i < L.ptUkSteps.length - 1) {
      body += `<line x1="${xWhen}" y1="${y + 56}" x2="${width - 48}" y2="${y + 56}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  body += `<line x1="${xWhen}" y1="620" x2="${width - 48}" y2="620" stroke="${C.rule ?? C.hairline}" stroke-width="1"/>`;
  body += text(xWhen, 664, L.ptUkEffectHead, { size: 15, weight: 600, fill: C.accent });
  L.ptUkEffectRows.forEach((key, i) => {
    body += text(xWhen, 706 + i * 42, L.ptUkEffect[key], { size: 15 });
  });

  return frame(
    width, height,
    L.figures.ptUkTreaty.title, L.eyebrow,
    L.checked(L.dates.portugalUk), body,
    L.figures.ptUkTreaty.note,
  );
}

// --- Britain and Portugal: the pensions article, before and after -----------
// TWO COLUMNS THAT AGREE, which is the opposite of what a two-column figure
// usually does and is the entire point. The middle row prints the same six
// words on both sides. A reader who has just learned that a fifty-seven-year-old
// treaty was replaced expects everything under it to have moved; this row is
// the fastest way to show that this did not, and it is faster than the
// paragraph that says so.
function ptUkPensions(L) {
  const width = 1200;
  // 760: три ряда по 118 от y=282 доводят второй ряд последнего до 588, подпись
  // frame на height − 92 = 668. Та же арифметика, что на pt-us-clock.
  const height = 760;
  const xLeft = 48;
  const colRight = 640;
  let body = "";

  body += text(xLeft, 208, L.ptUkPensionCols.old, { size: 15, weight: 600 });
  body += text(colRight, 208, L.ptUkPensionCols.now, { size: 15, weight: 600, fill: C.accent });
  body += `<line x1="${xLeft}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  L.ptUkPensionRows.forEach((key, i) => {
    const y = 282 + i * 118;
    const same = key === "where";
    body += text(xLeft, y, L.ptUkPensionLeft[key], { size: 15, weight: same ? 600 : 400 });
    body += text(colRight, y, L.ptUkPensionRight[key], {
      size: 15,
      weight: same ? 600 : 400,
      fill: C.accent,
    });
    if (i < L.ptUkPensionRows.length - 1) {
      body += `<line x1="${xLeft}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.ptUkPensions.title, L.eyebrow,
    L.checked(L.dates.portugalUk), body,
    L.figures.ptUkPensions.note,
  );
}

// --- Portugal and the US: the same ten years, counted twice ------------------
// TWO COLUMNS SPLIT BY A DATE, not by a country. This is the one figure on the
// site where both halves are the SAME law: article 15 of the Nationality Act
// before and after 19 May 2026. A timeline was the first draft and it was
// wrong — a timeline says "this happened, then that happened", and the reader
// needs "which of these two is me". The third row exists to say that one thing
// did NOT change, because a reader who sees two columns assumes everything in
// them differs.
function ptUsClock(L) {
  const width = 1200;
  // 760: три ряда по 118 от y=282 доводят второй ряд последнего до 588, подпись
  // frame на height − 92 = 668. Та же арифметика, что на gr-us-changes.
  const height = 760;
  const xLeft = 48;
  const colRight = 640;
  let body = "";

  body += text(xLeft, 208, L.ptUsClockCols.before, { size: 15, weight: 600 });
  body += text(colRight, 208, L.ptUsClockCols.after, { size: 15, weight: 600, fill: C.accent });
  body += `<line x1="${xLeft}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  L.ptUsClockRows.forEach((key, i) => {
    const y = 282 + i * 118;
    body += text(xLeft, y, L.ptUsClockLeft[key], { size: 15 });
    body += text(colRight, y, L.ptUsClockRight[key], { size: 15, fill: C.accent });
    if (i < L.ptUsClockRows.length - 1) {
      body += `<line x1="${xLeft}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.ptUsClock.title, L.eyebrow,
    L.checked(L.dates.portugalAmericans), body,
    L.figures.ptUsClock.note,
  );
}

// --- Portugal and the US: which instrument decides what ----------------------
// THREE ROWS, AND THE DATE IS A COLUMN RATHER THAN A DECORATION. The point of
// the figure is that these are three separate instruments made thirty-seven
// years apart, and a fact from one of them answers nothing in the others —
// which is the mistake the market page makes when it treats "moving to
// Portugal" as one subject with one answer.
function ptUsInstruments(L) {
  const width = 1200;
  // 860: три ряда по 152 от y=272 доводят третью строку последнего до 632,
  // подпись frame на height − 92 = 768.
  const height = 860;
  const xLeft = 48;
  let body = "";

  L.ptUsInstrRows.forEach((key, i) => {
    const y = 232 + i * 152;
    body += text(xLeft, y, L.ptUsInstrWhat[key], { size: 17, weight: 600 });
    body += text(xLeft, y + 26, L.ptUsInstrWhen[key], { size: 13, fill: C.accent, weight: 500 });
    body += text(xLeft, y + 58, L.ptUsInstrDecides[key], { size: 14, fill: C.muted });
    if (i < L.ptUsInstrRows.length - 1) {
      body += `<line x1="${xLeft}" y1="${y + 96}" x2="${width - 48}" y2="${y + 96}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.ptUsInstruments.title, L.eyebrow,
    L.checked(L.dates.portugalAmericans), body,
    L.figures.ptUsInstruments.note,
  );
}

// --- Greece and the US: a treaty with a date on it ---------------------------
// FOUR ROWS AND THE LAST ONE HAS NO EVENT, which is the whole figure. Three
// dated steps and then a row that says nothing happened for seventy-six years:
// the reader is meant to reach the bottom and notice the sequence stops. The
// last row carries the accent for the same reason the Maltese chain gives it to
// the agency page still selling a deleted route — it is the live fact, not the
// history.
const GR_US_STEPS = [
  { key: "signed", live: false },
  { key: "protocol", live: false },
  { key: "force", live: false },
  { key: "since", live: true },
];

function grUsTreaty(L) {
  const width = 1200;
  // 900: четыре ряда по 132 от y=272 доводят подпись последнего до 696, подпись
  // frame на height − 92 = 808. Та же арифметика, что на mt-chain.
  const height = 900;
  const xWhen = 48;
  const xBody = 330;
  let body = "";

  body += text(xWhen, 200, L.grUsSteps.signed, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xBody, 200, L.grUsHeads.changes, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xWhen}" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  GR_US_STEPS.forEach((row, i) => {
    const y = 272 + i * 132;
    const fill = row.live ? C.accent : C.text;
    body += text(xWhen, y, L.grUsDates[row.key], { size: 17, weight: 600, fill });
    body += text(xBody, y, L.grUsSteps[row.key], { size: 17, weight: 500, fill });
    body += text(xBody, y + 28, L.grUsWhat[row.key], { size: 13, fill: C.muted });
    if (i < GR_US_STEPS.length - 1) {
      body += `<line x1="${xWhen}" y1="${y + 78}" x2="${width - 48}" y2="${y + 78}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.grUsTreaty.title, L.eyebrow,
    L.checked(L.dates.greeceAmericans), body,
    L.figures.grUsTreaty.note,
  );
}

// --- Greece and the US: what residence moves and what it does not ------------
// TWO COLUMNS BECAUSE THE ARGUMENT IS A BOUNDARY, not a comparison. Everything
// on the left is Greek law and moves when the reader moves; everything on the
// right is American law and does not. A single list would invite the reader to
// average the two halves, which is the error the whole page exists to prevent.
function grUsChanges(L) {
  const width = 1200;
  // 760: три ряда по 118 от y=282 доводят второй ряд последнего до 588, подпись
  // frame на height − 92 = 668.
  const height = 760;
  const xLeft = 48;
  const colRight = 620;
  let body = "";

  body += text(xLeft, 208, L.grUsHeads.changes, { size: 15, weight: 600 });
  body += text(colRight, 208, L.grUsHeads.stays, { size: 15, weight: 600, fill: C.accent });
  body += `<line x1="${xLeft}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  L.grUsChangesRows.forEach((key, i) => {
    const y = 282 + i * 118;
    body += text(xLeft, y, L.grUsLeft[key], { size: 15 });
    body += text(colRight, y, L.grUsRight[key], { size: 15, fill: C.accent });
    if (i < L.grUsChangesRows.length - 1) {
      body += `<line x1="${xLeft}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.grUsChanges.title, L.eyebrow,
    L.checked(L.dates.greeceAmericans), body,
    L.figures.grUsChanges.note,
  );
}

// --- Greece: three naturalisation periods, one law ---------------------------
// LENGTH DOES THE ARGUING. The whole point is that the market prints one number
// where the Code has three, so the three have to be seen as different lengths
// before a word is read. The middle bar carries the accent because it is the
// one the reader most likely arrived believing — and the two either side of it
// are the finding.
const GR_TIERS_NAT = [
  { key: "three", years: 3, accent: false },
  { key: "seven", years: 7, accent: true },
  { key: "twelve", years: 12, accent: false },
];

function grNatTiers(L) {
  const width = 1200;
  // 800: три ряда по 150 от y=250 доводят низ последней полосы до 646, ось на
  // 690, её подписи на 716, подпись frame на height − 92 = 708 — столкнулись бы.
  // Поэтому 860, как на mt-rent-gap, где та же конструкция.
  const height = 860;
  const x0 = 430;
  const x1 = width - 150;
  const MAX = 13;
  const px = (v) => x0 + (v / MAX) * (x1 - x0);

  let body = "";
  GR_TIERS_NAT.forEach((bar, i) => {
    const y = 250 + i * 150;
    const hue = bar.accent ? C.accent : C.line;
    body += text(48, y, L.grNatTierBars[bar.key], { size: 17, weight: 600, fill: bar.accent ? C.accent : C.text });
    body += text(48, y + 26, L.grNatTierNotes[bar.key], { size: 13, fill: C.muted });
    const top = y + 46;
    body += `<rect x="${px(0)}" y="${top}" width="${px(bar.years) - px(0)}" height="40" fill="${hue}"/>`;
    body += text(px(bar.years) + 16, top + 28, `${bar.years}`, {
      size: 19, weight: 600, family: FONT_MONO, fill: bar.accent ? C.accent : C.text,
    });
    if (i < GR_TIERS_NAT.length - 1) {
      body += `<line x1="48" y1="${y + 112}" x2="${width - 48}" y2="${y + 112}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  const axisY = 690;
  body += `<line x1="${px(0)}" y1="${axisY}" x2="${px(MAX)}" y2="${axisY}" stroke="${C.line}" stroke-width="1"/>`;
  for (let v = 0; v <= 12; v += 2) {
    body += `<line x1="${px(v)}" y1="${axisY}" x2="${px(v)}" y2="${axisY + 7}" stroke="${C.line}" stroke-width="1"/>`;
    body += text(px(v), axisY + 26, `${v}`, { size: 13, fill: C.muted, anchor: "middle" });
  }

  return frame(
    width, height,
    L.figures.grNatTiers.title, L.eyebrow,
    L.checked(L.dates.greeceCitizenshipRu ?? L.dates.greeceCitizenship), body,
    L.figures.grNatTiers.note,
  );
}

// --- Greece: the conditions live in two articles -----------------------------
// THREE ROWS AND THE SECOND ONE IS THE FINDING. Every page in this market cites
// "article 5" for the language examination, and the examination is not in
// article 5. Drawing the split is cheaper than arguing it: the reader sees two
// articles where they expected one, and the caption then says which holds what.
const GR_SPLIT = ["five", "fiveA", "fiveB"];

function grNatSplit(L) {
  const width = 1200;
  // 700: три ряда по 118 от y=282 доводят подпись последнего до 528, подпись
  // frame на height − 92 = 608.
  const height = 700;
  const xArt = 48;
  const xBody = 300;
  let body = "";

  body += text(xArt, 208, L.grSplitHeads.art, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xBody, 208, L.grSplitHeads.holds, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xArt}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  GR_SPLIT.forEach((key, i) => {
    const y = 282 + i * 118;
    const accent = key === "fiveA";
    const label = key === "five" ? "5" : key === "fiveA" ? "5Α" : "5Β";
    body += text(xArt, y, label, { size: 20, family: FONT_MONO, weight: 600, fill: accent ? C.accent : C.text });
    body += text(xBody, y, L.grSplitWhat[key], { size: 17, weight: 500, fill: accent ? C.accent : C.text });
    body += text(xBody, y + 28, L.grSplitNote[key], { size: 13, fill: C.muted });
    if (i < GR_SPLIT.length - 1) {
      body += `<line x1="${xArt}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.grNatSplit.title, L.eyebrow,
    L.checked(L.dates.greeceCitizenshipRu ?? L.dates.greeceCitizenship), body,
    L.figures.grNatSplit.note,
  );
}

// --- Malta: the registered rent against the advertised one -------------------
// THE REGISTER BAR CARRIES THE ACCENT AND THE OTHER TWO DO NOT, which is the
// whole argument of the figure: one of these three numbers was signed and two
// were asked for. Drawing all three in one colour would make it a price range;
// drawing the register apart makes it a claim about provenance. The note under
// the bars does the honest work of saying the sets differ in size, so the
// picture cannot be read as a straight 43% discount.
const MT_RENT_BARS = [
  { key: "register", value: 850, signed: true },
  { key: "facebook", value: 1400, signed: false },
  { key: "agency", value: 1500, signed: false },
];

function mtRentGap(L) {
  const width = 1200;
  // 860: три ряда по 150 от y=250 доводят низ последней полосы до 646, ось на
  // 690, подписи делений на 716, подпись frame на height − 92 = 768.
  const height = 860;
  const x0 = 430;
  // 150 под подпись значения в конце полосы: «1 500 €» на 17px это ~90px.
  const x1 = width - 150;
  const MAX = 1600;
  const px = (v) => x0 + (v / MAX) * (x1 - x0);

  let body = "";
  MT_RENT_BARS.forEach((bar, i) => {
    const y = 250 + i * 150;
    body += text(48, y, L.mtRentBars[bar.key], { size: 17, weight: 600, fill: bar.signed ? C.accent : C.text });
    body += text(48, y + 26, L.mtRentNotes[bar.key], { size: 13, fill: C.muted });
    const top = y + 46;
    const h = 40;
    body += `<rect x="${px(0)}" y="${top}" width="${px(bar.value) - px(0)}" height="${h}" fill="${bar.signed ? C.accent : C.line}"/>`;
    body += text(px(bar.value) + 16, top + 28, `${bar.value.toLocaleString("en-GB").replace(/,/g, " ")} €`, {
      size: 19, weight: 600, family: FONT_MONO, fill: bar.signed ? C.accent : C.text,
    });
    if (i < MT_RENT_BARS.length - 1) {
      body += `<line x1="48" y1="${y + 112}" x2="${width - 48}" y2="${y + 112}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  const axisY = 690;
  body += `<line x1="${px(0)}" y1="${axisY}" x2="${px(MAX)}" y2="${axisY}" stroke="${C.line}" stroke-width="1"/>`;
  for (let v = 0; v <= MAX; v += 400) {
    body += `<line x1="${px(v)}" y1="${axisY}" x2="${px(v)}" y2="${axisY + 7}" stroke="${C.line}" stroke-width="1"/>`;
    body += text(px(v), axisY + 26, `${v.toLocaleString("en-GB").replace(/,/g, " ")}`, { size: 13, fill: C.muted, anchor: "middle" });
  }

  return frame(
    width, height,
    L.figures.mtRentGap.title, L.eyebrow,
    L.checked(L.dates.maltaLiving), body,
    L.figures.mtRentGap.note,
  );
}

// --- Malta: the cadence of what is measured ----------------------------------
// A THREE-ROW TABLE AND THE THIRD ROW IS THE FINDING. Rows one and two exist to
// establish that Malta measures carefully, so that row three reads as a gap in
// the calendar rather than as a country without statistics. Ordering them by
// frequency — monthly, periodic, decadal — makes the drop legible without a
// word of commentary.
const MT_MEASURES = ["hicp", "rent", "hbs"];

function mtMeasures(L) {
  const width = 1200;
  // 720: три ряда по 118 от y=282 доводят последний до 518, подпись frame на
  // height − 92 = 628. Формула та же, что на mt-routes.
  const height = 720;
  const xWhat = 48;
  const colCadence = 470;
  const colLatest = 810;
  let body = "";

  body += text(xWhat, 208, L.mtMeasureHeads.what, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(colCadence, 208, L.mtMeasureHeads.cadence, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(colLatest, 208, L.mtMeasureHeads.latest, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xWhat}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  MT_MEASURES.forEach((key, i) => {
    const y = 282 + i * 118;
    const stale = key === "hbs";
    body += text(xWhat, y, L.mtMeasureWhat[key], { size: 16, weight: 500, fill: stale ? C.accent : C.text });
    body += text(colCadence, y, L.mtMeasureCadence[key], { size: 15, fill: stale ? C.accent : C.text });
    body += text(colLatest, y, L.mtMeasureLatest[key], {
      size: 15, family: FONT_MONO, weight: stale ? 600 : 400, fill: stale ? C.accent : C.text,
    });
    if (i < MT_MEASURES.length - 1) {
      body += `<line x1="${xWhat}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.mtMeasures.title, L.eyebrow,
    L.checked(L.dates.maltaLiving), body,
    L.figures.mtMeasures.note,
  );
}

// --- Portugal: the two D8 variants -------------------------------------------
// THE LAST THREE ROWS ARE WHY THIS IS A TABLE AND NOT A PARAGRAPH. The first
// four invite a comparison and produce a shrug: two visas, same money. The
// last three are where the shrug stops — one column is all "No", and one of
// those noes ("on the art. 122 conversion list") is a fact nobody in this
// market has published at all. Ordering them the other way round would have
// buried it under the money.
const PT_D8_ROWS = ["created", "paperwork", "length", "income", "permit", "list", "naturalisation"];

function ptD8Variants(L) {
  const width = 1200;
  // 1060: семь рядов по 100 от y=250 доводят последний до 850, а его вторая
  // строка идёт на +27, то есть на 877. frame ставит подпись на height − 92 =
  // 968. Ряды по 100, а не по 118 как на mt-routes, именно потому что ячейки
  // здесь двухстрочные и 118 дало бы холст под 1200.
  const height = 1060;
  const xLabel = 48;
  // 380 и 780: ячейки переносятся руками примерно по 20 знаков на строку,
  // 15px × 1.33 = 20px, и 400px колонки — это ровно столько.
  const colA = 380;
  const colB = 780;
  let body = "";

  body += text(colA, 208, L.ptD8Heads.temp, { size: 15, weight: 600 });
  body += text(colB, 208, L.ptD8Heads.res, { size: 15, weight: 600, fill: C.accent });
  body += `<line x1="${xLabel}" y1="228" x2="${width - 48}" y2="228" stroke="${C.hairline}" stroke-width="1"/>`;

  PT_D8_ROWS.forEach((key, i) => {
    // 276, А НЕ 250. При 250 между линейкой шапки и первой строкой оставалось
    // 12px, а между рядами — 44, и «Temporary stay» читалось как часть ряда
    // «Created by», а не как заголовок колонки. Поймано отрисовкой.
    const y = 276 + i * 100;
    // Три последних ряда — те, ради которых схема существует.
    const decisive = key === "permit" || key === "list" || key === "naturalisation";
    body += text(xLabel, y, L.ptD8Labels[key], { size: 14, fill: C.muted, weight: 500 });
    body += text(colA, y, L.ptD8Temp[key], {
      size: 15,
      weight: decisive ? 600 : 400,
      fill: decisive ? C.muted : C.text,
    });
    body += text(colB, y, L.ptD8Res[key], {
      size: 15,
      weight: decisive ? 600 : 400,
      fill: decisive ? C.accent : C.text,
    });
    if (i < PT_D8_ROWS.length - 1) {
      body += `<line x1="${xLabel}" y1="${y + 56}" x2="${width - 48}" y2="${y + 56}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.ptD8Variants.title, L.eyebrow,
    L.checked(L.dates.portugalNomad), body,
    L.figures.ptD8Variants.note,
  );
}

// --- Portugal: the dangling cross-reference ----------------------------------
// SIX ROWS AND THE LAST ONE HAS NO DATE, which is the point of drawing it as a
// chain rather than a list of amendments. Five dated steps and then a present
// tense: the reader is meant to notice that the sequence never closes. The last
// row carries the accent for the same reason the Maltese chain gives it to the
// agency page still selling a deleted route — the live defect, not the history.
const PT_D8_CHAIN = [
  { key: "insert", live: false },
  { key: "amend", live: false },
  { key: "repeal", live: false },
  { key: "transitional", live: false },
  { key: "newpara", live: false },
  { key: "today", live: true },
];

function ptD8Chain(L) {
  const width = 1200;
  // 1150, НЕ 1090. При 1090 подпись frame вставала на 998, а подпись
  // последнего ряда — на 960: 38px, и подвал схемы читался как седьмой ряд
  // цепочки. На mt-chain этот зазор 112. Поймано отрисовкой.
  const height = 1150;
  const xDate = 48;
  const xBody = 330;
  // ПОДПИСЬ РЯДА — ДО ~88 ЗНАКОВ, как на mt-chain: от xBody до правого поля
  // 822px, на 13px × 1.33 это примерно восемьдесят восемь.
  let body = "";

  body += text(xDate, 200, L.ptD8ChainHeads.when, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xBody, 200, L.ptD8ChainHeads.what, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xDate}" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  PT_D8_CHAIN.forEach((row, i) => {
    const y = 272 + i * 132;
    const fill = row.live ? C.accent : C.text;
    body += text(xDate, y, L.ptD8ChainDates[row.key], { size: 17, weight: 600, fill });
    body += text(xBody, y, L.ptD8ChainWhat[row.key], { size: 17, weight: 500, fill });
    body += text(xBody, y + 28, L.ptD8ChainNote[row.key], { size: 13, fill: C.muted });
    if (i < PT_D8_CHAIN.length - 1) {
      body += `<line x1="${xDate}" y1="${y + 78}" x2="${width - 48}" y2="${y + 78}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.ptD8Chain.title, L.eyebrow,
    L.checked(L.dates.portugalNomad), body,
    L.figures.ptD8Chain.note,
  );
}

// --- Portugal: the naturalisation clock, drawn from one starting event -------
// THREE BARS ON ONE AXIS, AND THE AXIS IS THE ARGUMENT. Every page in this
// market compares five years against ten, which compares two periods measured
// from two different events — and so understates the change. Article 15(4)
// counted the permit queue inside the old five; its repeal puts the same queue
// outside the new ten. Measured from the day residence was applied for, which
// is the one date the applicant actually remembers, that is five against
// thirteen. Drawing it from the residence title instead would have hidden the
// whole of the second change.
const PT_NAT_BARS = [
  { key: "old", counted: true, years: 5 },
  { key: "new7", counted: false, years: 7 },
  { key: "new10", counted: false, years: 10 },
];
const PT_NAT_QUEUE = 3;

function ptNatClock(L) {
  const width = 1200;
  // 860: три ряда по 130 от y=268 доводят низ последней полосы до 602, ось на
  // 636, её подписи на 660, легенду на 700 — а frame ставит свою подпись на
  // height − 92, то есть на 768. Формула та же, что на mt-routes:
  // height >= (низ последнего ряда) + 62 + 92 + 68.
  const height = 860;
  const x0 = 300;
  // 130, НЕ 60: подпись значения ставится в конце полосы на +14, и при 60
  // «13» упиралось в правое поле. Ширину под неё надо отдать оси.
  const x1 = width - 130;
  const SPAN = 13; // years, the widest bar plus the queue
  const px = (years) => x0 + (years / SPAN) * (x1 - x0);

  let body = "";

  PT_NAT_BARS.forEach((bar, i) => {
    const y = 268 + i * 130;
    body += text(48, y, L.ptNatBars[bar.key].label, { size: 16, weight: 600 });
    body += text(48, y + 24, L.ptNatBars[bar.key].note, { size: 13, fill: C.muted });

    const top = y + 42;
    const h = 34;
    // The queue always occupies the same three years of the axis. What changes
    // is whether it is inside the period, so it is drawn filled when counted
    // and hollow when not — position alone would say nothing.
    if (bar.counted) {
      body += `<rect x="${px(0)}" y="${top}" width="${px(PT_NAT_QUEUE) - px(0)}" height="${h}" fill="${C.accent}"/>`;
      body += `<rect x="${px(PT_NAT_QUEUE)}" y="${top}" width="${px(bar.years) - px(PT_NAT_QUEUE)}" height="${h}" fill="${C.text}"/>`;
      body += text(px(bar.years) + 14, top + 24, `${bar.years}`, { size: 17, weight: 600 });
    } else {
      body += `<rect x="${px(0)}" y="${top}" width="${px(PT_NAT_QUEUE) - px(0)}" height="${h}" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
      body += `<rect x="${px(PT_NAT_QUEUE)}" y="${top}" width="${px(PT_NAT_QUEUE + bar.years) - px(PT_NAT_QUEUE)}" height="${h}" fill="${C.text}"/>`;
      body += text(px(PT_NAT_QUEUE + bar.years) + 14, top + 24, `${PT_NAT_QUEUE + bar.years}`, { size: 17, weight: 600 });
    }
  });

  const axisY = 636;
  body += `<line x1="${px(0)}" y1="${axisY}" x2="${px(SPAN)}" y2="${axisY}" stroke="${C.line}" stroke-width="1"/>`;
  for (let year = 0; year <= 12; year += 2) {
    body += `<line x1="${px(year)}" y1="${axisY}" x2="${px(year)}" y2="${axisY + 7}" stroke="${C.line}" stroke-width="1"/>`;
    body += text(px(year), axisY + 26, `${year}`, { size: 13, fill: C.muted, anchor: "middle" });
  }
  // НАД ОСЬЮ, А НЕ НА СТРОКЕ ДЕЛЕНИЙ. На +26 подпись шла тем же рядом, что и
  // цифры делений, и «0» с «2» легли поверх слов «temporary residence was».
  // Поймано отрисовкой.
  body += text(48, axisY - 12, L.ptNatAxis, { size: 13, fill: C.muted });

  // Legend on one line at 700: the swatches are 16px squares on the text
  // baseline, so they sit from 688 to 704 and clear the frame note at 768.
  const legendY = 700;
  let lx = 48;
  const swatch = (fillAttr, label) => {
    let out = `<rect x="${lx}" y="${legendY - 13}" width="16" height="16" ${fillAttr}/>`;
    out += text(lx + 24, legendY, label, { size: 13, fill: C.muted });
    // 9 НА ЗНАК, А НЕ 8, И ЗАЗОР 52, А НЕ 44. Оценка ставилась по английским
    // подписям; кириллица на 13px × 1.33 идёт примерно по 9px на знак, и на
    // русской версии «Очередь засчитана» подошло к следующему квадрату
    // вплотную. Ширину глифов здесь никто не меряет, поэтому запас берётся с
    // той стороны, где ошибка видна.
    lx += 24 + label.length * 9 + 52;
    return out;
  };
  body += swatch(`fill="${C.accent}"`, L.ptNatLegend.counted);
  body += swatch(`fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="5 4"`, L.ptNatLegend.uncounted);
  body += swatch(`fill="${C.text}"`, L.ptNatLegend.residence);

  return frame(
    width, height,
    L.figures.ptNatClock.title, L.eyebrow,
    L.checked(L.dates.portugalCitizenship), body,
    L.figures.ptNatClock.note,
  );
}

// --- Portugal: the five limbs of article 6(1) --------------------------------
// THE STATUS COLUMN IS THE POINT, and it is why this is a table rather than a
// list. Three of the five limbs are new or widened in 2026, and the market
// reports one of them. A list of conditions would read as a static description
// of a requirement; the column says which of them a reader's own notes from
// last year are now wrong about.
const PT_NAT_LIMBS = [
  { key: "a", status: "same" },
  { key: "b", status: "doubled" },
  { key: "c", status: "widened" },
  { key: "d", status: "fresh" },
  { key: "e", status: "fresh" },
];

function ptNatLimbs(L) {
  const width = 1200;
  // 960: пять рядов по 118 от y=272 доводят подпись последнего до 772, и
  // height >= 772 + 62 + 92 + 68 даёт 994 — но подпись последнего ряда идёт на
  // +28, а не на +62, поэтому запас берётся от неё: 772 + 92 + 68 = 932.
  // 960 оставляет 28px и держит ту же плотность, что на mt-chain.
  const height = 960;
  const xArt = 48;
  const xBody = 210;
  // 950, А НЕ 980. Отрисовка 8 сентября: «Doubled in 2026» от 980 уходило за
  // правое поле на 12px. Опасение, что левее нельзя из-за подписи limb (d),
  // не подтвердилось — подписи переносятся руками по 44 знака и заканчиваются
  // около 630, то есть до колонки статуса больше трёхсот пикселей запаса.
  const xStatus = 950;
  let body = "";

  body += text(xArt, 200, L.ptNatHeads.art, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xBody, 200, L.ptNatHeads.cond, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += text(xStatus, 200, L.ptNatHeads.status, { size: 12, fill: C.muted, weight: 500, tracking: 2.2, upper: true });
  body += `<line x1="${xArt}" y1="218" x2="${width - 48}" y2="218" stroke="${C.hairline}" stroke-width="1"/>`;

  PT_NAT_LIMBS.forEach((row, i) => {
    const y = 272 + i * 118;
    const moved = row.status !== "same";
    body += text(xArt, y, `6(1)(${row.key})`, { size: 16, family: FONT_MONO, fill: moved ? C.text : C.muted });
    body += text(xBody, y, L.ptNatCond[row.key], { size: 15, weight: moved ? 500 : 400, fill: moved ? C.text : C.muted });
    body += text(xStatus, y, L.ptNatStatus[row.status], {
      size: 15,
      weight: moved ? 600 : 400,
      fill: moved ? C.accent : C.muted,
    });
    if (i < PT_NAT_LIMBS.length - 1) {
      body += `<line x1="${xArt}" y1="${y + 62}" x2="${width - 48}" y2="${y + 62}" stroke="${C.hairline}" stroke-width="1"/>`;
    }
  });

  return frame(
    width, height,
    L.figures.ptNatLimbs.title, L.eyebrow,
    L.checked(L.dates.portugalCitizenship), body,
    L.figures.ptNatLimbs.note,
  );
}

const PLAN = {
  ru: [
    // Гражданство Греции по-русски, 9 сентября 2026. Те же две схемы, что у
    // английской C4, но подписи не перевод: кириллица шире при том же числе
    // знаков, и потолки строк здесь другие.
    ["gr-nat-tiers", grNatTiers],
    ["gr-nat-split", grNatSplit],
    // Гражданство Мальты по-русски, 9 сентября 2026. Те же две схемы, что у C3.
    ["mt-chain", mtChain],
    ["mt-routes", mtRoutes],
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
    // Переезд в Грецию, 5 сентября 2026 года.
    ["gr-living-budget", grLivingBudget],
    ["gr-living-regions", grLivingRegions],
    ["gr-living-rent", grLivingRent],
    // Переезд в Португалию, 5 сентября 2026 года.
    ["pt-move-rent", ptMoveRent],
    ["pt-move-premium", ptMovePremium],
    // Гражданство Португалии по-русски, 7 сентября 2026. Кластер
    // `гражданство португалии` — крупнейший португальский в русском.
    ["pt-nat-clock", ptNatClock],
    ["pt-nat-limbs", ptNatLimbs],
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
    // Portugal after the permit, 4 September 2026. English only.
    ["pt-after-timeline", ptAfterTimeline],
    ["pt-after-statuses", ptAfterStatuses],
    // Греческий процесс, 5 сентября 2026 года.
    ["gr-process-compare", grProcessCompare],
    // The application guide, 5 September 2026. English only.
    ["gv-apply-sequence", gvApplySequence],
    ["gv-apply-fees", gvApplyFees],
    // The passport question, 5 September 2026. English only.
    ["gv-passport-clocks", gvPassportClocks],
    ["gv-passport-counts", gvPassportCounts],
    // The Maltese nomad permit, 5 September 2026. English only.
    ["mt-nomad-limits", mtNomadLimits],
    ["mt-nomad-clock", mtNomadClock],
    // The Maltese residence card, 5 September 2026. English only.
    ["mt-card-timeline", mtCardTimeline],
    ["mt-card-fees", mtCardFees],
    // The Portuguese golden visa, 6 September 2026. English only: the cluster
    // is 22,200 searches a month in English against 260 in Russian and 20 in
    // Polish, so the entry exists in one language because the demand does.
    ["pt-gv-routes", ptGvRoutes],
    ["pt-gv-fees", ptGvFees],
    // Жизнь и цены в Португалии, 7 сентября 2026. Английская только: русский
    // спрос выражен словом «переезд», польский держит польская income-статья.
    ["pt-living-rent", ptLivingRent],
    ["pt-living-domicile", ptLivingDomicile],
    // Гражданство Мальты после решения Суда ЕС, 7 сентября 2026. Английская.
    ["mt-chain", mtChain],
    ["mt-routes", mtRoutes],
    // Закон о гражданстве Португалии, 7 сентября 2026. Английская: русский
    // спрос по гражданству Португалии держит portugal-move, и разводить его
    // надо там.
    ["pt-nat-clock", ptNatClock],
    ["pt-nat-limbs", ptNatLimbs],
    // Виза цифрового кочевника D8, 7 сентября 2026. Английская: русский спрос
    // по D8 — 170 запросов, польский ниже порога.
    ["pt-d8-variants", ptD8Variants],
    ["pt-d8-chain", ptD8Chain],
    // Жизнь и цены на Мальте, 7 сентября 2026. Английская: русский мальтийский
    // спрос — это порода собак, польского нет.
    ["mt-rent-gap", mtRentGap],
    ["mt-measures", mtMeasures],
    // Греческое гражданство, 8 сентября 2026. Английская: русский кластер идёт
    // отдельным пунктом F5 и пишется под свой интент.
    ["gr-nat-tiers", grNatTiers],
    ["gr-nat-split", grNatSplit],
    // Греция для американцев, 8 сентября 2026. Английская по определению.
    ["gr-us-treaty", grUsTreaty],
    ["gr-us-changes", grUsChanges],
    // Португалия для американцев, 8 сентября 2026. Английская по определению.
    ["pt-us-clock", ptUsClock],
    ["pt-us-instruments", ptUsInstruments],
    // Португалия для британцев, 8 сентября 2026. Английская по определению.
    ["pt-uk-treaty", ptUkTreaty],
    ["pt-uk-pensions", ptUkPensions],
    // Дубай для британцев, 9 сентября 2026. Две страницы: справочник и
    // датированная находка — схемы у каждой свои.
    ["ae-uk-tests", aeUkTests],
    ["ae-uk-tiebreak", aeUkTiebreak],
    ["ae-demand", aeDemand],
    ["ae-advice", aeAdvice],
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

// НИ ОДНА СХЕМА НЕ ВЫХОДИТ С «undefined» НА ХОЛСТЕ.
//
// Поставлено 8 сентября 2026 после двух случаев подряд. Первый — коллизия
// ключей: `grTierNotes` уже существовал, дубликат в том же литерале молча
// проиграл последнему объявлению. Второй нашёлся тем же грепом и жил дольше:
// PT_ROUTES перечисляет четыре маршрута, а подписи были заведены для трёх, и
// строка D8 печатала «undefined» дважды на трёх ОПУБЛИКОВАННЫХ схемах во всех
// языках.
//
// Проверка на поля этого не ловит: «undefined» — короткое слово, оно никуда не
// вылезает. Ловит только чтение холста глазами или вот эта строка.
function assertNoUndefined(name, svg) {
  if (svg.includes(">undefined<") || svg.includes("undefined")) {
    const where = svg.indexOf("undefined");
    throw new Error(
      `${name}: на холсте напечатано "undefined" (позиция ${where}). ` +
        `Обычно это отсутствующий ключ подписи или коллизия имён в объекте локали.`,
    );
  }
}

let n = 0;
for (const [locale, figures] of Object.entries(PLAN)) {
  for (const [name, draw] of figures) {
    const file = join(OUT, `${name}-${locale}.svg`);
    const svg = draw(L[locale]);
    assertNoUndefined(`${name}-${locale}`, svg);
    writeFileSync(file, svg, "utf8");
    console.log(`  ${name}-${locale}.svg`);
    n += 1;
  }
}
console.log(`${n} figures written to public/figures`);
