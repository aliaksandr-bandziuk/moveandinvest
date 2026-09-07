// Пары страниц не должны целиться в один и тот же запрос.
//
// ПОЧЕМУ ЭТО ОТДЕЛЬНЫЙ СКРИПТ, А НЕ РАЗОВАЯ ПРОВЕРКА. Он писался начерно
// дважды, и оба раза молча пропускал файлы: сначала статью, где ключи шли под
// «**Primary:**», потом три статьи, где заголовок блока переведён — «Семантика»,
// «Semantyka», «Ключевые слова». Пропущенный файл выглядит как чистый прогон,
// поэтому здесь любой article-*.md без распознанного блока — ошибка, а не
// предупреждение.
//
// ДВЕ ПРОВЕРКИ, А НЕ ОДНА, и вторая добавлена 6 сентября 2026 после того, как
// первая дала чистый прогон на реальном столкновении. Точное совпадение строк
// ловит только буквальные дубли. Гугл сравнивает не строки, а намерения, и две
// наши страницы разошлись ровно на одно слово:
//
//   income-cost-of-living  →  "portugal d7 visa income requirements"
//   portugal-residency     →  "portugal d7 visa requirements"
//
// Разные строки, один запрос, и в Search Console страница D7 стоит на 58,85 по
// собственному головному термину. Поэтому вторая проверка — на ВЛОЖЕННОСТЬ:
// если множество слов одного термина целиком содержится в другом, страницы
// целятся в одну выдачу. "cost of living greece" ⊂ "cost of living in greece by
// region" — то же самое.
//
// Вложенность — предупреждение, а не ошибка. Она бывает законной: страна-хаб
// вправе упоминать термин, который в деталях держит отдельная статья. Решение
// принимает человек, поэтому скрипт печатает пару и не роняет прогон. Точное
// совпадение по-прежнему ошибка: двух хозяев у одной строки быть не может.
//
// Запуск: node scripts/keywords.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "docs";
const HEADINGS = new Set([
  "keywords",
  "słowa kluczowe",
  "ключевые слова",
  "semantyka",
  "семантика",
]);
// ТОЛЬКО СТРОКИ ПОД ИЗВЕСТНОЙ ПОДПИСЬЮ — И ЭТО ТРЕТЬЯ ИТЕРАЦИЯ РАЗБОРА.
//
// Раньше скрипт брал в блоке ключей всё, что не начинается с «**», «#» или
// «---». 6 сентября 2026 в блок были дописаны абзацы прозы с объяснением, что
// с этой страницы снято и почему, — и парсер разобрал прозу как ключи, по
// запятым. Пар «пересекаются по смыслу» стало больше, и выглядело это как
// содержательная находка, а не как мусор. Ровно тот же класс отказа, что и два
// предыдущих: разбор, который молча берёт лишнее или молча пропускает нужное.
//
// Поэтому теперь ключи берутся ИСКЛЮЧИТЕЛЬНО со строки, идущей сразу за
// известной подписью уровня «**Head terms:**». Проза в блоке безопасна где
// угодно. Файл, не давший ни одного ключа, — ошибка, а не тихий ноль.
const LABELS = new Set([
  "head terms", "mid-tail", "long tail",
  "головные запросы", "средний хвост", "длинный хвост",
  "высокочастотные", "среднечастотные", "низкочастотные (длинный хвост)",
  "zapytania główne", "środni ogon", "długi ogon",
  "wysokoczęstotliwościowe", "średnie",
  "primary", "secondary", "questions targeted",
  "ключи, вынесенные в подзаголовки", "ключевые слова, вынесенные в подзаголовки",
]);

const pages = [];
for (const file of readdirSync(DIR).sort()) {
  const m = /^article-([a-z]{2})-(.+)\.md$/.exec(file);
  if (!m) continue;
  const [, locale, key] = m;
  const text = readFileSync(join(DIR, file), "utf8");

  let block = null;
  for (const part of text.split("\n## ").slice(1)) {
    const head = part.split("\n", 1)[0].trim().toLowerCase();
    if (HEADINGS.has(head)) block = part.slice(part.indexOf("\n") + 1);
  }
  if (block === null) {
    console.error(`${file}: no keyword block. Add one, or add its heading to HEADINGS.`);
    process.exitCode = 1;
    continue;
  }

  const terms = new Set();
  const lines = block.split("\n");
  for (let n = 0; n < lines.length; n += 1) {
    // Две формы записи, обе живут в docs/ и обе законны:
    //   **Head terms:**              — список на следующей строке
    //   **Primary:** a, b, c         — список на той же строке
    // Мальтийские статьи в ru и pl написаны второй; ловится тем же выражением.
    const label = /^\*\*([^*]+?):?\*\*(.*)$/.exec(lines[n].trim());
    if (!label || !LABELS.has(label[1].trim().toLowerCase())) continue;

    let row = label[2].trim();
    if (!row) {
      let m = n + 1;
      while (m < lines.length && lines[m].trim() === "") m += 1;
      row = (lines[m] ?? "").trim();
      if (row.startsWith("**")) row = "";
    }
    if (!row) continue;

    for (const term of row.split(",")) {
      const k = term.trim().replace(/\.$/, "").toLowerCase();
      if (k) terms.add(k);
    }
  }
  if (terms.size === 0) {
    console.error(
      `${file}: keyword block found but no terms read. Every list must sit on the ` +
        `line after a label like "**Head terms:**" — add the label, or add it to LABELS.`,
    );
    process.exitCode = 1;
    continue;
  }
  pages.push({ locale, key, terms });
}

// Служебные слова выбрасываются перед сравнением множеств: «in», «for», «the»
// и их русские и польские аналоги не несут намерения, и из-за них
// "cost of living greece" и "cost of living in greece" выглядят как разные
// запросы. Список короткий намеренно — чем он длиннее, тем больше законных
// различий он стирает.
const STOP = new Set([
  "a", "an", "the", "in", "on", "at", "for", "to", "of", "and", "or", "vs",
  "w", "we", "na", "do", "dla", "i", "z", "oraz",
  "в", "во", "на", "для", "и", "или", "по", "с", "со",
]);

function words(term) {
  return new Set(
    term
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w && !STOP.has(w)),
  );
}

function subsetOf(a, b) {
  if (a.size === 0 || a.size >= b.size) return false;
  for (const w of a) if (!b.has(w)) return false;
  return true;
}

let clashes = 0;
let overlaps = 0;
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    if (pages[i].locale !== pages[j].locale) continue;

    const shared = [...pages[i].terms].filter((t) => pages[j].terms.has(t));
    if (shared.length > 0) {
      clashes += 1;
      console.error(
        `${pages[i].locale}: ${pages[i].key} <-> ${pages[j].key}\n  ${shared.sort().join("\n  ")}`,
      );
    }

    // Вложенность, в обе стороны, минус то, что уже напечатано как точный дубль.
    const nested = [];
    for (const a of pages[i].terms) {
      const wa = words(a);
      for (const b of pages[j].terms) {
        if (a === b) continue;
        const wb = words(b);
        if (subsetOf(wa, wb)) nested.push(`${a}  ⊂  ${b}`);
        else if (subsetOf(wb, wa)) nested.push(`${b}  ⊂  ${a}`);
      }
    }
    if (nested.length > 0) {
      overlaps += 1;
      console.warn(
        `\n[warn] ${pages[i].locale}: ${pages[i].key} и ${pages[j].key} целятся в одну выдачу\n  ` +
          [...new Set(nested)].sort().join("\n  "),
      );
    }
  }
}

if (clashes > 0) {
  console.error(`\n${clashes} collisions across ${pages.length} articles.`);
  process.exitCode = 1;
} else {
  console.log(
    `keywords: ${pages.length} articles, no page targets another's query exactly` +
      (overlaps > 0 ? `; ${overlaps} pairs overlap by meaning — see the warnings above` : ""),
  );
}
