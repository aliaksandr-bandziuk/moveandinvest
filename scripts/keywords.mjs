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
import { readArticles } from "./articleTerms.mjs";

// РАЗБОР ЖИВЁТ В articleTerms.mjs, и там же записано, почему он вынесен:
// потребителей у этих блоков стало двое. Здесь остаётся то, ради чего скрипт
// написан, — сравнение страниц между собой, — и обработка претензий разборщика
// как ОШИБОК: пропущенный файл выглядит как чистый прогон, и это единственная
// причина, по которой скрипт вообще существует.
const { pages, problems } = readArticles();
for (const problem of problems) {
  console.error(problem.message);
  process.exitCode = 1;
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
