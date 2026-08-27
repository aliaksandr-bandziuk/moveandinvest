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

  return frame(width, height, L.figures.qualifies.title, L.eyebrow, L.checked, body);
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

  return frame(width, height, L.figures.cost.title, L.eyebrow, L.checked, body, L.figures.cost.note);
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

  return frame(width, height, L.figures.zones.title, L.eyebrow, L.checked, body, L.figures.zones.note);
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

  return frame(width, height, L.figures.who.title, L.eyebrow, L.checked, body, L.who.note);
}

// --- Strings ----------------------------------------------------------------
const money = (locale) => (v) => {
  const f = (n) => new Intl.NumberFormat(locale === "en" ? "en-GB" : locale).format(n).replace(/ /g, " ");
  return Array.isArray(v) ? `${f(v[0])}–${f(v[1])} €` : `${f(v)} €`;
};

const L = {
  ru: {
    eyebrow: "Гайды и исследования",
    checked: "Все цифры сверены с первоисточником 23 августа 2026 года",
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
    checked: "Every figure checked against a primary source on 23 August 2026",
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
    checked: "Każda liczba sprawdzona ze źródłem pierwotnym 23 sierpnia 2026 roku",
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

const PLAN = {
  ru: [["qualifies", qualifies], ["cost", cost], ["zones", zones]],
  en: [["qualifies", qualifies], ["cost", cost], ["zones", zones]],
  pl: [["qualifies", qualifies], ["cost", cost], ["who", whoNeeds]],
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
