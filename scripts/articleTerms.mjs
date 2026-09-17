// Один разборщик ключевых блоков в docs/ и archive/article-*.md, на всех потребителей.
//
// ПОЧЕМУ ОН ВЫНЕСЕН ИЗ keywords.mjs. Разбор этих блоков переписывался трижды,
// и каждый раз ошибка была одна и та же по классу: он молча брал лишнее или
// молча пропускал нужное. История записана в keywords.mjs и стоит того, чтобы
// её прочитать. Когда 11 сентября 2026 года понадобился второй потребитель —
// скрипты DataForSEO, которым нужны головные запросы как посевной список, —
// выбор был между вторым разборщиком и общим. Второй разборщик разошёлся бы с
// первым на четвёртой итерации формата, и разошёлся бы тихо: у DataForSEO
// пропущенный файл выглядит как домен, который просто ни по чему не
// ранжируется.
//
// Модуль в .mjs, а не в .ts, потому что потребителей двое и запускаются они
// по-разному: `node scripts/keywords.mjs` и `tsx scripts/dataforseo/*.ts`.
// Проверено: tsx-скрипт импортирует .mjs без оговорок.
//
// ОН НИЧЕГО НЕ ПЕЧАТАЕТ И НИЧЕГО НЕ РОНЯЕТ. Претензии возвращаются списком,
// и каждый потребитель решает сам, ошибка это у него или предупреждение.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// ДВЕ ПАПКИ С 17 СЕНТЯБРЯ 2026: docs/ — то, над чем работаем сейчас,
// archive/ — исходники уже опубликованных статей. Файл, который есть в обеих,
// читается из docs/: туда его кладут обратно, когда правят.
const DIRS = ["docs", "archive"];

const HEADINGS = new Set([
  "keywords",
  "słowa kluczowe",
  "ключевые слова",
  "semantyka",
  "семантика",
]);

const LABELS = new Set([
  "head terms", "mid-tail", "long tail",
  "головные запросы", "средний хвост", "длинный хвост",
  "высокочастотные", "среднечастотные", "низкочастотные (длинный хвост)",
  "zapytania główne", "środni ogon", "długi ogon",
  "wysokoczęstotliwościowe", "średnie",
  "primary", "secondary", "questions targeted",
  "ключи, вынесенные в подзаголовки", "ключевые слова, вынесенные в подзаголовки",
]);

// Подмножество LABELS: то, на что страница претендует в первую очередь. Всё
// остальное — хвост, и в посевной список для анализа выдачи он не идёт: по
// запросу из длинного хвоста в топе стоят случайные домены, и конкуренты,
// посчитанные по такому списку, — тоже случайные.
const HEAD_LABELS = new Set([
  "head terms",
  "головные запросы",
  "высокочастотные",
  "zapytania główne",
  "wysokoczęstotliwościowe",
  "primary",
]);

/**
 * @returns {{
 *   pages: { file: string, locale: string, key: string, terms: Set<string>, head: Set<string> }[],
 *   problems: { file: string, message: string }[],
 * }}
 */
export function readArticles(dirs = DIRS) {
  const pages = [];
  const problems = [];

  const located = new Map();
  for (const dir of [dirs].flat()) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!located.has(file)) located.set(file, dir);
    }
  }

  for (const file of [...located.keys()].sort()) {
    const dir = located.get(file);
    const m = /^article-([a-z]{2})-(.+)\.md$/.exec(file);
    if (!m) continue;
    const [, locale, key] = m;
    const text = readFileSync(join(dir, file), "utf8");

    let block = null;
    for (const part of text.split("\n## ").slice(1)) {
      const head = part.split("\n", 1)[0].trim().toLowerCase();
      if (HEADINGS.has(head)) block = part.slice(part.indexOf("\n") + 1);
    }
    if (block === null) {
      problems.push({
        file,
        message: `${file}: no keyword block. Add one, or add its heading to HEADINGS.`,
      });
      continue;
    }

    const terms = new Set();
    const head = new Set();
    const lines = block.split("\n");
    for (let n = 0; n < lines.length; n += 1) {
      // Две формы записи, обе встречаются в статьях и обе законны:
      //   **Head terms:**              — список на следующей строке
      //   **Primary:** a, b, c         — список на той же строке
      const label = /^\*\*([^*]+?):?\*\*(.*)$/.exec(lines[n].trim());
      if (!label) continue;
      const name = label[1].trim().toLowerCase();
      if (!LABELS.has(name)) continue;

      let row = label[2].trim();
      if (!row) {
        let k = n + 1;
        while (k < lines.length && lines[k].trim() === "") k += 1;
        row = (lines[k] ?? "").trim();
        if (row.startsWith("**")) row = "";
      }
      if (!row) continue;

      for (const term of row.split(",")) {
        const t = term.trim().replace(/\.$/, "").toLowerCase();
        if (!t) continue;
        terms.add(t);
        if (HEAD_LABELS.has(name)) head.add(t);
      }
    }

    if (terms.size === 0) {
      problems.push({
        file,
        message:
          `${file}: keyword block found but no terms read. Every list must sit on the ` +
          `line after a label like "**Head terms:**" — add the label, or add it to LABELS.`,
      });
      continue;
    }

    pages.push({ file, locale, key, terms, head });
  }

  return { pages, problems };
}
