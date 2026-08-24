import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { embeddedFontCss } from "./embedFonts";
import { HOME_COPY, LOCALES, type Locale } from "./copy/home";
import { FACTS } from "./copy/costs";
import { COUNTRY_LABELS, COUNTRY_PAGES, SOURCE_NOTE } from "./copy/jurisdictions";

// Generates the comparison PDF, one per language, into public/comparison/.
//
//   npx tsx scripts/pdf.ts
//
// Prerequisites, both checked and named in the error: `npm run build` (the
// fonts come out of .next/static/media) and `npm i -D playwright`. Same
// arrangement as scripts/og.ts — see scripts/playwright.d.ts.
//
// WHY A GENERATOR AND NOT A DESIGNED FILE. This document carries thresholds,
// taxes and totals, and the site's entire position is that those are checked
// and dated. A PDF made by hand goes stale the first time a rule changes and
// there is nothing to remind anyone that it did. Everything here is imported
// from the same modules the site renders from — copy/costs.ts for the figures,
// copy/jurisdictions.ts for the table, copy/home.ts for the labels — so
// regenerating after `npm run facts` produces a document that agrees with the
// site by construction.
//
// THE DATE IS THE MOST IMPORTANT THING ON PAGE ONE, and it is stated twice: in
// the header and in the source note at the foot. A comparison of investment
// thresholds with no verification date is exactly the artefact this project
// exists to be an alternative to.
//
// WHAT IS DELIBERATELY NOT IN IT: Cyprus figures. The registry lists five
// jurisdictions and this document prints four, with a line saying why. The
// dossier's own conclusion is that Cyprus rests on secondary sources, and a
// PDF is the worst possible place to publish a number that has not been read
// from a primary one — it circulates, it gets forwarded, and it cannot be
// corrected in place.

const CODES = ["pt", "gr", "mt", "ae"] as const;

const DARK = "#0b0f16";
const TEXT = "#0e1420";
const MUTED = "#5a6478";
const HAIRLINE = "#dce0e7";
const ACCENT = "#7a2230";
// No --color-accent-on-dark here, unlike the OG card and the email header.
// This document is printed on white and has no dark plane except the cost
// bars, which carry no text. Copying the constant across "for consistency"
// would have left a lighter oxblood available to whoever edits this next, on a
// page where it fails contrast against paper.

// The title used to be the typed words "Five jurisdictions, compared" while
// the document printed four, which is precisely the failure this project
// exists to be an alternative to — and it survived a full read of the RU file
// because the number was in a place nobody thinks to check. So the count is
// now DERIVED from CODES and can never disagree with the table again.
//
// Deriving it needs two things a template string cannot do: the numeral as a
// word, and the noun in the right plural form. Russian and Polish both change
// the noun between four and five (юрисдикции → юрисдикций, jurysdykcje →
// jurysdykcji), so "5 jurisdictions" with a digit would dodge the grammar and
// look like a spreadsheet. Intl.PluralRules knows the categories; only the
// words are ours.
const NUMERALS: Record<Locale, Record<number, string>> = {
  en: { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five" },
  ru: { 1: "Одна", 2: "Две", 3: "Три", 4: "Четыре", 5: "Пять" },
  pl: { 1: "Jedna", 2: "Dwie", 3: "Trzy", 4: "Cztery", 5: "Pięć" },
};

const JURISDICTION_NOUN: Record<Locale, Record<string, string>> = {
  en: { one: "jurisdiction", other: "jurisdictions" },
  ru: { one: "юрисдикция", few: "юрисдикции", many: "юрисдикций", other: "юрисдикции" },
  pl: { one: "jurysdykcja", few: "jurysdykcje", many: "jurysdykcji", other: "jurysdykcji" },
};

const TITLE_FRAME: Record<Locale, (count: string) => string> = {
  en: (count) => `${count}, compared`,
  ru: (count) => `${count} в сравнении`,
  pl: (count) => `${count} w porównaniu`,
};

function title(locale: Locale, n: number): string {
  const category = new Intl.PluralRules(locale === "en" ? "en-GB" : locale).select(n);
  const noun = JURISDICTION_NOUN[locale][category] ?? JURISDICTION_NOUN[locale].other ?? "";
  const numeral = NUMERALS[locale][n] ?? String(n);
  return TITLE_FRAME[locale](`${numeral} ${noun}`);
}

interface Strings {
  subtitle: string;
  tableHeading: string;
  costHeading: string;
  costIntro: string;
  basis: string;
  cyprus: string;
  footer: string;
}

// The few strings this document needs that no existing module has. Everything
// else — column headers, cost labels, the source note — is imported, so a
// wording change on the site reaches the PDF on the next run.
const STRINGS: Record<Locale, Strings> = {
  en: {
    subtitle: "Residency routes, entry thresholds and what they really cost",
    tableHeading: "The four questions, asked of each",
    costHeading: "What it really costs in the first year",
    costIntro:
      "The threshold is the investment alone. Transfer taxes, professional and government fees and the first renewal are not optional — everyone pays them, every time.",
    basis: "One main applicant, no dependants. Entry and the first renewal.",
    cyprus:
      "Cyprus is in our table on the site and is not in this document: its figures rest on secondary sources, and a PDF is the wrong place to publish a number nobody has read from a statute.",
    footer: "moveandinvest.com — independent, sourced and dated. Not legal, tax or investment advice.",
  },
  ru: {
    subtitle: "Маршруты резидентства, пороги входа и сколько это стоит на самом деле",
    tableHeading: "Четыре вопроса, заданные каждой",
    costHeading: "Сколько стоит первый год на самом деле",
    costIntro:
      "Порог — это только сама инвестиция. Налоги на переход, гонорары и государственные сборы, а также первое продление не опциональны: их платят все и каждый раз.",
    basis: "Один основной заявитель, без иждивенцев. Вход и первое продление.",
    cyprus:
      "Кипр есть в таблице на сайте и нет в этом документе: его цифры опираются на вторичные источники, а PDF — неподходящее место для числа, которое никто не прочитал в законе.",
    footer:
      "moveandinvest.com — независимо, со ссылками и датой. Не является юридической, налоговой или инвестиционной консультацией.",
  },
  pl: {
    subtitle: "Ścieżki rezydencji, progi wejścia i ile naprawdę kosztują",
    tableHeading: "Cztery pytania zadane każdej",
    costHeading: "Ile naprawdę kosztuje pierwszy rok",
    costIntro:
      "Próg to sama inwestycja. Podatki od przeniesienia, honoraria i opłaty urzędowe oraz pierwsze odnowienie nie są opcjonalne — płacą je wszyscy i za każdym razem.",
    basis: "Jeden główny wnioskodawca, bez osób zależnych. Wejście i pierwsze odnowienie.",
    cyprus:
      "Cypr jest w tabeli na stronie i nie ma go w tym dokumencie: jego liczby opierają się na źródłach wtórnych, a PDF to złe miejsce na liczbę, której nikt nie przeczytał w ustawie.",
    footer:
      "moveandinvest.com — niezależnie, ze źródłami i datą. Nie stanowi porady prawnej, podatkowej ani inwestycyjnej.",
  },
};

// Euro, grouped the way each language groups thousands. Intl does this
// correctly and by hand nobody does — Russian and Polish use a space, English
// a comma, and the space has to be non-breaking or the number wraps.
function euro(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function document(locale: Locale): string {
  const strings = STRINGS[locale];
  const home = HOME_COPY[locale];
  const columns = home.hero.columns;
  const cost = home.cost;

  const rows = CODES.map((code) => {
    const page = COUNTRY_PAGES.find((entry) => entry.country === `country-${code}`);
    const label = COUNTRY_LABELS[code]?.[locale] ?? code.toUpperCase();
    if (!page) return "";
    return `<tr>
      <th scope="row">${escapeHtml(label)}</th>
      <td>${escapeHtml(page.route[locale])}</td>
      <td class="fig">${escapeHtml(page.minimumInvestment)}</td>
      <td>${escapeHtml(page.timeToPermit[locale])}</td>
      <td>${escapeHtml(page.taxRegime[locale])}</td>
    </tr>`;
  }).join("");

  // The bars are drawn from the real ratio rather than a fixed width, because
  // the whole point of the section is that the invisible half differs wildly:
  // Malta's extras are a third of its threshold, the UAE's are a fifteenth.
  const widest = Math.max(...CODES.map((code) => {
    const fact = FACTS.find((entry) => entry.code === code);
    return fact ? fact.advertised + fact.extras : 0;
  }));

  const bars = CODES.map((code) => {
    const fact = FACTS.find((entry) => entry.code === code);
    const label = COUNTRY_LABELS[code]?.[locale] ?? code.toUpperCase();
    if (!fact) return "";
    const total = fact.advertised + fact.extras;
    const scale = (value: number) => `${((value / widest) * 100).toFixed(2)}%`;
    return `<div class="bar">
      <p class="barName">${escapeHtml(label)}</p>
      <div class="track">
        <span class="advertised" style="width:${scale(fact.advertised)}"></span><span class="extras" style="width:${scale(fact.extras)}"></span>
      </div>
      <p class="barFigures">
        <span>${escapeHtml(cost.advertisedLabel)} ${euro(fact.advertised, locale)}</span>
        <span>${escapeHtml(cost.extrasLabel)} ${euro(fact.extras, locale)}</span>
        <strong>${escapeHtml(cost.realLabel)} ${euro(total, locale)}</strong>
      </p>
    </div>`;
  }).join("");

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
    ${embeddedFontCss()}
    @page { size: A4; margin: 16mm 14mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, sans-serif; color: ${TEXT}; font-size: 9pt; line-height: 1.45; }

    .head { display: flex; align-items: baseline; gap: 10pt; border-bottom: 1pt solid ${TEXT}; padding-bottom: 6pt; }
    .wordmark { font-family: Spectral, serif; font-weight: 600; font-size: 13pt; }
    .amp { color: ${ACCENT}; }
    .updated { margin-left: auto; font-family: "JetBrains Mono", monospace; font-size: 7.5pt; letter-spacing: 0.06em; text-transform: uppercase; color: ${MUTED}; }

    h1 { font-family: Spectral, serif; font-weight: 600; font-size: 19pt; line-height: 1.1; letter-spacing: -0.01em; margin-top: 11pt; }
    .subtitle { margin-top: 5pt; font-size: 10pt; color: ${MUTED}; max-width: 42em; }
    .basis { margin-top: 7pt; font-family: "JetBrains Mono", monospace; font-size: 7.5pt; letter-spacing: 0.04em; color: ${MUTED}; }

    h2 { font-family: Spectral, serif; font-weight: 600; font-size: 12.5pt; margin-top: 13pt; }
    .lede { margin-top: 4pt; color: ${MUTED}; max-width: 44em; }

    table { width: 100%; border-collapse: collapse; margin-top: 8pt; }
    th, td { text-align: left; vertical-align: top; padding: 5pt 8pt 5pt 0; border-bottom: 0.5pt solid ${HAIRLINE}; }
    thead th { font-family: "JetBrains Mono", monospace; font-size: 7pt; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; border-bottom: 1pt solid ${TEXT}; }
    tbody th { font-weight: 600; white-space: nowrap; }
    .fig { font-family: "JetBrains Mono", monospace; font-variant-numeric: tabular-nums; white-space: nowrap; }

    .bar { margin-top: 9pt; break-inside: avoid; }
    .barName { font-weight: 600; }
    .track { display: flex; height: 8pt; margin-top: 3pt; background: #f2f4f7; }
    .advertised { background: ${DARK}; }
    .extras { background: ${ACCENT}; }
    .barFigures { display: flex; gap: 14pt; margin-top: 3pt; font-family: "JetBrains Mono", monospace; font-variant-numeric: tabular-nums; font-size: 8pt; color: ${MUTED}; }
    .barFigures strong { color: ${TEXT}; }

    .note { margin-top: 12pt; padding-top: 7pt; border-top: 0.5pt solid ${HAIRLINE}; font-size: 8pt; color: ${MUTED}; }
    .note + .note { margin-top: 6pt; border-top: 0; padding-top: 0; }
    .foot { margin-top: 10pt; padding-top: 6pt; border-top: 1pt solid ${TEXT}; font-family: "JetBrains Mono", monospace; font-size: 7pt; letter-spacing: 0.05em; color: ${MUTED}; }
  </style></head><body>
    <div class="head">
      <span class="wordmark">move<span class="amp">&amp;</span>invest</span>
      <span class="updated">${escapeHtml(home.hero.eyebrow)}</span>
    </div>

    <h1>${escapeHtml(title(locale, CODES.length))}</h1>
    <p class="subtitle">${escapeHtml(strings.subtitle)}</p>
    <p class="basis">${escapeHtml(strings.basis)}</p>

    <h2>${escapeHtml(strings.tableHeading)}</h2>
    <table>
      <thead><tr>
        <th scope="col">${escapeHtml(columns.jurisdiction)}</th>
        <th scope="col">${escapeHtml(columns.route)}</th>
        <th scope="col">${escapeHtml(columns.minimumInvestment)}</th>
        <th scope="col">${escapeHtml(columns.timeToPermit)}</th>
        <th scope="col">${escapeHtml(columns.taxRegime)}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <h2>${escapeHtml(strings.costHeading)}</h2>
    <p class="lede">${escapeHtml(strings.costIntro)}</p>
    ${bars}

    <p class="note">${escapeHtml(SOURCE_NOTE[locale])}</p>
    <p class="note">${escapeHtml(strings.cyprus)}</p>
    <p class="foot">${escapeHtml(strings.footer)}</p>
  </body></html>`;
}

// ONE SHEET IS A PROMISE, NOT A PREFERENCE. The signup copy and the
// confirmation email both say "on one printable sheet" / «на одном листе», and
// the first version of this file quietly spilled three lines onto a second
// page in every language — a broken promise nobody would ever have reported,
// because a PDF that opens is a PDF that looks fine.
//
// So the page count is measured rather than assumed. Chromium writes an
// uncompressed page tree, so `/Count N` beside `/Type /Pages` is the real
// number of sheets. A miss returns null and is reported as UNCHECKED rather
// than passed: a check that cannot find its subject and prints nothing is
// worse than no check, because it reads as one that succeeded.
function pageCount(pdf: Buffer): number | null {
  const match = /\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/.exec(pdf.toString("latin1"));
  return match?.[1] === undefined ? null : Number(match[1]);
}

async function run() {
  mkdirSync("public/comparison", { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const page = await browser.newPage();
  const overlong: string[] = [];

  for (const locale of LOCALES) {
    await page.setContent(document(locale), { waitUntil: "load" });
    // Inline base64 fonts are still decoded asynchronously; a PDF taken before
    // that lands is set in the fallback.
    await page.evaluate(() => window.document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    const path = `public/comparison/${locale}.pdf`;
    writeFileSync(path, pdf);

    const pages = pageCount(pdf);
    const sheets = pages === null ? "page count UNCHECKED" : `${pages} page(s)`;
    console.log(`${path} — ${Math.round(pdf.length / 1024)} KB, ${sheets}`);
    if (pages !== null && pages > 1) overlong.push(`${locale} (${pages})`);
  }

  await browser.close();

  // Written after every file, not on the first failure: whoever added the row
  // wants to know it broke all three languages, not just the first one
  // alphabetically. The files stay on disk so the overflow can be looked at.
  if (overlong.length > 0) {
    throw new Error(
      `The comparison must fit one A4 sheet and does not: ${overlong.join(", ")}. ` +
        `The copy in messages/*.json and the confirmation email both promise one ` +
        `sheet — either trim this document or change both promises.`,
    );
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
