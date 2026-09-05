// Пары страниц не должны целиться в один и тот же запрос.
//
// ПОЧЕМУ ЭТО ОТДЕЛЬНЫЙ СКРИПТ, А НЕ РАЗОВАЯ ПРОВЕРКА. Он писался начерно
// дважды, и оба раза молча пропускал файлы: сначала статью, где ключи шли под
// «**Primary:**», потом три статьи, где заголовок блока переведён — «Семантика»,
// «Semantyka», «Ключевые слова». Пропущенный файл выглядит как чистый прогон,
// поэтому здесь любой article-*.md без распознанного блока — ошибка, а не
// предупреждение.
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
// Строка «ключи в подзаголовках» перечисляет заголовки статьи, а не цели.
const TRAILER = /\n\*\*(?:Keywords placed|Ключевые слова в|Słowa kluczowe w)/;

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
  for (const line of block.split(TRAILER)[0].split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("**") || t.startsWith("#") || t.startsWith("---")) continue;
    for (const term of t.split(",")) {
      const k = term.trim().replace(/\.$/, "").toLowerCase();
      if (k) terms.add(k);
    }
  }
  pages.push({ locale, key, terms });
}

let clashes = 0;
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    if (pages[i].locale !== pages[j].locale) continue;
    const shared = [...pages[i].terms].filter((t) => pages[j].terms.has(t));
    if (shared.length === 0) continue;
    clashes += 1;
    console.error(
      `${pages[i].locale}: ${pages[i].key} <-> ${pages[j].key}\n  ${shared.sort().join("\n  ")}`,
    );
  }
}

if (clashes > 0) {
  console.error(`\n${clashes} collisions across ${pages.length} articles.`);
  process.exitCode = 1;
} else {
  console.log(`keywords: ${pages.length} articles, no page targets another's query`);
}
