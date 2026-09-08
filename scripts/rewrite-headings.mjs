// ПЕРЕПИСЫВАЕТ ЗАГОЛОВКИ ОДИННАДЦАТИ СТРАНИЦ ОТ 7-8 СЕНТЯБРЯ 2026 ГОДА.
//
// ЗАЧЕМ. Проверка живых страниц 8 сентября нашла системный дефект: заголовки
// написаны газетно — как продолжение предыдущего абзаца, а не как самостоятельные
// единицы смысла. Образец, с которого началась проверка: H1 часов натурализации
// «Когда часы действительно позволяют подать» — не сказано, что подать, куда
// подать и какие часы. То же в статьях: «The instrument», «Что именно приняли»,
// «Now the part that no page on that first screen mentions» и чемпион —
// «Before using that as a discount, read the next paragraph», заголовок, который
// буквально требует прочитать соседний абзац, чтобы понять, о чём он.
//
// ПРАВИЛО, ПО КОТОРОМУ ПЕРЕПИСАНО. Мы делаем интернет-ресурс, а не газету.
// Заголовок читают вырванным из страницы: в выдаче, в оглавлении, в блоке
// ссылок, в ответе ИИ-движка. Поэтому каждый H1 и H3 называет предмет и действие
// целиком и несёт ключ страницы. Драматургия допустима сверх этого, а не вместо.
//
// ЧТО ПОЧИНЕНО ЗАОДНО, И ЭТО ХУЖЕ ИСХОДНОЙ ЖАЛОБЫ. Служебные заголовки
// повторялись дословно: «Questions» на пяти страницах, «Frequently asked
// questions» ещё на трёх, «Where this sits in the rest of the site» на всех
// десяти. Десять одинаковых H3 на десяти разных страницах, и ни один не говорит,
// о чём именно вопросы. Теперь каждый назван по предмету своей страницы.
//
// ПОЧЕМУ ЭТО .mjs, А НЕ .ts. Тот же выбор, что у scripts/figures/*.mjs: tsx
// через мост не запускается на win32, а этому скрипту не нужен ни Sanity, ни
// типы репозитория — он читает и пишет файлы. `node` его выполняет как есть.
//
// БЕЗОПАСНОСТЬ. Каждая замена — точное совпадение, и каждая проверяется на
// единственность: если строка не найдена или найдена дважды, файл НЕ пишется
// вовсе. Это не педантизм — при частичном применении получилась бы страница с
// половиной новых заголовков и блоком ключей, описывающим прежние.
//
// ЗАПУСК из корня репозитория:
//
//     node scripts/rewrite-headings.mjs            показать, что изменится
//     node scripts/rewrite-headings.mjs --write    записать

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const WRITE = process.argv.includes("--write");
// --keys-only пересобирает ТОЛЬКО перечни ключей, не трогая заголовки.
const KEYS_ONLY = process.argv.includes("--keys-only");
const DOCS = "docs";
const MESSAGES = "messages";

// Метки блока, перечисляющего ключи в подзаголовках. Перечень ПЕРЕСОБИРАЕТСЯ из
// фактических заголовков — иначе он остался бы описанием прежних, и следующий,
// кто откроет файл, поверил бы ему.
//
// ДВЕ МЕТКИ, И ЭТО ИСПРАВЛЕНИЕ ОШИБКИ ЭТОГО ЖЕ СКРИПТА. Первая редакция знала
// только английскую, поэтому в русском файле заголовки переписались, а перечень
// под ними остался от прежних — ровно то расхождение, ради предотвращения
// которого пересборка и была написана. Русский файл подписывает блок иначе и
// кавычки ставит ёлочкой.
const KEYS_LABELS = [
  { label: "**Keywords placed in subheadings:**", open: '"', close: '"' },
  { label: "**Ключевые слова, вынесенные в подзаголовки:**", open: "«", close: "»" },
];

// --- СТАТЬИ. Ключ — файл в docs/, значение — пары [было, стало]. ------------
// H1 идёт первой строкой файла с одной решёткой, подзаголовки — с тремя.

const ARTICLES = {
  // ----- 7 сентября --------------------------------------------------------
  "article-en-portugal-living.md": [
    ["### Buying instead of renting: €2,198 a square metre, rising 17.5% a year",
     "### House prices in Portugal: €2,198 a square metre, rising 17.5% a year"],
    ["### The 49% nobody publishes: what a foreign buyer pays per square metre",
     "### Property in Portugal costs a foreign buyer 49% more per square metre"],
    ["### What Portugal costs against the rest of the EU",
     "### The cost of living in Portugal compared with the rest of the EU"],
    ["### The number we will not print, and why",
     "### Household spending in Portugal: the figure this page will not print"],
    ["### What the law says you need: €920 a month",
     "### The income Portuguese law requires for residence: €920 a month"],
    ["### Frequently asked questions",
     "### Frequently asked questions about the cost of living in Portugal"],
    ["### Where this sits in the rest of the site",
     "### More on living, residence and property in Portugal"],
    ["### If you are working out whether the numbers add up",
     "### Work out your own cost of living in Portugal"],
    ["### Sources: where each figure comes from",
     "### Sources for these Portuguese cost-of-living figures"],
  ],
  "article-en-portugal-citizenship.md": [
    ["### The instrument",
     "### Lei Orgânica 1/2026: the instrument that changed Portuguese nationality law"],
    ["### Change one: the period, article 6(1)(b)",
     "### Portuguese citizenship now takes ten years: article 6(1)(b)"],
    ["### Change two: the start date, article 15 — and this is the one nobody has",
     "### When the ten years start: article 15(4) repealed, and nobody else has this"],
    ["### The two changes are one day and two rules, and mixing them produces a wrong answer",
     "### Why mixing the two Portuguese nationality changes gives a wrong answer"],
    ["### What the Constitutional Court did and did not strike down",
     "### What the Portuguese Constitutional Court struck down, and what it left standing"],
    ["### What the reform did not change",
     "### What the 2026 Portuguese nationality reform did not change"],
    ["### How to check this yourself, which takes about four minutes",
     "### How to check Portuguese nationality law yourself in four minutes"],
    ["### Questions",
     "### Frequently asked questions about Portuguese citizenship after Lei Orgânica 1/2026"],
    ["### Where this sits in the rest of the site",
     "### More on Portuguese residence and citizenship"],
  ],
  "article-ru-portugal-citizenship.md": [
    ["### Что именно приняли",
     "### Что приняли: Lei Orgânica 1/2026 и день вступления в силу"],
    ["### Изменение первое: срок",
     "### Первое изменение: гражданство Португалии теперь через десять лет"],
    ["### Изменение второе: точка отсчёта, и вот его нет ни у кого",
     "### Второе изменение: с какого дня идёт срок для гражданства Португалии"],
    ["### Кого защищает переходная норма, а кого нет",
     "### Переходная норма: чьи заявления на гражданство считаются по-старому"],
    ["### Что Конституционный суд отменил, а чего не отменял",
     "### Что Конституционный суд Португалии отменил, а что оставил в силе"],
    ["### Чего реформа не трогала",
     "### Чего реформа гражданства Португалии не изменила"],
    ["### Как проверить это самому, минут за пять",
     "### Как самому проверить закон о гражданстве Португалии за пять минут"],
    ["### Частые вопросы",
     "### Частые вопросы о гражданстве Португалии"],
    ["### Что ещё на сайте относится к делу",
     "### Что ещё на сайте о ВНЖ и гражданстве Португалии"],
  ],
  "article-en-malta-citizenship.md": [
    ["### What happened, in three instruments and ninety-one days",
     "### How Malta citizenship by investment closed: three instruments in ninety-one days"],
    ['### "Suspended" is the wrong word, and the difference is not pedantic',
     "### Malta citizenship by investment is repealed, not suspended"],
    ["### The government's own page still lists the old contributions",
     "### Malta's own government page still lists the repealed contributions"],
    ["### What this page does not cover",
     "### What this page does not cover about Maltese citizenship"],
    ["### Frequently asked questions",
     "### Frequently asked questions about Malta citizenship by investment"],
    ["### Where this sits in the rest of the site",
     "### More on Maltese residence and citizenship"],
    ["### If you were counting on this route",
     "### If you were counting on Malta citizenship by investment"],
    ["### Sources: where each figure comes from",
     "### Sources for these Maltese citizenship figures"],
  ],
  "article-en-malta-living.md": [
    ["### Malta registers its leases, and the register is public",
     "### Rent in Malta: the public lease register says €850, not €1,400"],
    ["### Before using that as a discount, read the next paragraph",
     "### Why the registered Maltese rent is not a discount you can ask for"],
    ["### Now the part that no page on that first screen mentions",
     "### Malta stopped measuring household spending after the 2015–2016 survey"],
    ["### What Malta does measure every month",
     "### What Malta does measure monthly: the harmonised index of consumer prices"],
    ["### What this page will not tell you",
     "### What this page will not tell you about the cost of living in Malta"],
    ["### Questions",
     "### Frequently asked questions about the cost of living in Malta"],
    ["### Where this sits in the rest of the site",
     "### More on living and residence in Malta"],
  ],
  "article-en-portugal-nomad.md": [
    ["### The two visas, in the statute's own words",
     "### The two D8 visas in the statute's own words: article 54(1)(i) and article 61-B"],
    ["### Where the €3,680 comes from, and why it is not really €3,680",
     "### The D8 income requirement: where €3,680 comes from, and why it moves"],
    ["### The part nobody has: the regulation's in-country route was abolished two years ago",
     "### The D8 in-country route points at paragraphs abolished in June 2024"],
    ["### What that means in practice, stated carefully",
     "### What the abolished D8 cross-reference means for an applicant in Portugal"],
    ["### Which of the two you want, and it is usually not close",
     "### Which D8 visa to apply for, and why the choice is usually not close"],
    ["### How to check this page in about six minutes",
     "### How to check the Portuguese D8 rules yourself in six minutes"],
    ["### Questions",
     "### Frequently asked questions about the Portugal D8 digital nomad visa"],
    ["### Where this sits in the rest of the site",
     "### More on Portuguese visas and residence"],
  ],
  // ----- 8 сентября --------------------------------------------------------
  "article-en-greece-citizenship.md": [
    ["### The three periods",
     "### The three Greek naturalisation periods: three, seven and twelve years"],
    ["### The list that decides between seven and twelve",
     "### The closed list in article 5(1)(ε) decides between seven years and twelve"],
    ["### The conditions are in two articles, and the examination is in the second one",
     "### Greek citizenship conditions sit in two articles, and the exam is in article 5A"],
    ["### What the periods are counted from, and the word that does the work",
     "### Greek naturalisation needs continuous residence, with no window for gaps"],
    ["### The historic figure, and why a stale page will quote it",
     "### Why some pages still say ten years for Greek citizenship"],
    ["### Where this text was read, and how current it is",
     "### Where this text of the Greek Citizenship Code was read, and how current it is"],
    ["### Questions",
     "### Frequently asked questions about Greek citizenship"],
    ["### Where this sits in the rest of the site",
     "### More on Greek residence and citizenship"],
  ],
  "article-en-greece-americans.md": [
    ["# Living in Greece as an American: the two instruments nobody on the results page mentions",
     "# Living in Greece as an American: the 1950 tax treaty and the social security agreement"],
    ["### First, the boring part: Greek law has no American category",
     "### Greek immigration law has no American category"],
    ["### The Greek special tax regimes are worth less to an American, and no page says so",
     "### Greek special tax regimes are worth less to an American than to a European"],
    ["### The social security agreement, which is the practical one",
     "### The US–Greece social security agreement and certificate of coverage GR/USA 1"],
    ["### Naturalisation: an American is on seven years, not three",
     "### Greek citizenship for an American takes seven years, not three"],
    ["### What it costs, from Greek statistics rather than from Numbeo",
     "### The cost of living in Greece, from Greek statistics rather than from Numbeo"],
    ["### What this page deliberately does not do",
     "### What this page will not tell an American about Greece"],
    ["### Questions",
     "### Frequently asked questions about living in Greece as an American"],
    ["### Where this sits in the rest of the site",
     "### More on Greek residence, citizenship and costs"],
  ],
  "article-en-portugal-americans.md": [
    ["# Moving to Portugal from the US: the clock starts later than you think, and the sentence you need is not in the treaty",
     "# Moving to Portugal from the US: the ten-year citizenship clock and the treaty's saving clause"],
    ["### Interrupted years, and the window an American gets",
     "### Interrupted residence in Portugal: the twelve-year window for an American"],
    ["### Questions",
     "### Frequently asked questions about moving to Portugal from the US"],
    ["### Where this sits in the rest of the site",
     "### More on Portuguese visas, residence and citizenship"],
  ],
  "article-en-portugal-uk.md": [
    ["# Moving to Portugal from the UK: everyone is still explaining Brexit, and the treaty changed underneath them",
     "# Moving to Portugal from the UK: the 2025 tax treaty that replaced the 1968 one"],
    ["### Questions",
     "### Frequently asked questions about moving to Portugal from the UK"],
    ["### Where this sits in the rest of the site",
     "### More on Portuguese visas, residence and citizenship"],
  ],
};

// --- ЧАСЫ НАТУРАЛИЗАЦИИ ----------------------------------------------------
// Заголовки этой страницы живут в каталоге сообщений, а не в статье. colWhere и
// colEarliest — тоже заголовки: это шапка таблицы, и «Где» с «Раньше всего
// можно подать» не говорят ни где, ни что подать.

const CLOCK = {
  en: {
    metaTitle: "Naturalisation clock: when can you apply for citizenship?",
    heading: "Naturalisation clock: when you can apply for citizenship in four countries",
    colWhere: "Country",
    colEarliest: "Earliest you can apply for citizenship",
    colRule: "The provision this rests on",
    noRoute: "No citizenship application exists",
  },
  ru: {
    metaTitle: "Часы натурализации: когда можно подавать на гражданство",
    heading: "Часы натурализации: когда можно подавать на гражданство в четырёх странах",
    colWhere: "Страна",
    colEarliest: "Раньше всего можно подать на гражданство",
    colRule: "На какой норме это стоит",
    noRoute: "Заявления на гражданство не существует",
  },
  pl: {
    metaTitle: "Zegar naturalizacji: kiedy można złożyć wniosek o obywatelstwo",
    heading: "Zegar naturalizacji: kiedy można złożyć wniosek o obywatelstwo w czterech krajach",
    colWhere: "Kraj",
    colEarliest: "Najwcześniej można złożyć wniosek o obywatelstwo",
    colRule: "Na jakiej normie to stoi",
    noRoute: "Wniosek o obywatelstwo nie istnieje",
  },
};

// ---------------------------------------------------------------------------

const problems = [];
const touched = [];

function countOf(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function rewriteArticle(filename, pairs) {
  const path = join(DOCS, filename);
  if (!existsSync(path)) {
    problems.push(`${filename}: файла нет`);
    return;
  }

  let text = readFileSync(path, "utf8");

  for (const [before] of pairs) {
    const n = countOf(text, before);
    if (n !== 1) {
      problems.push(
        `${filename}: строка встречается ${n} раз, ожидалась одна:\n      ${before.slice(0, 90)}`,
      );
      return;
    }
  }

  for (const [before, after] of pairs) text = text.replace(before, after);

  text = rebuildKeyList(text);

  console.log(`\n${filename}`);
  for (const [before, after] of pairs) {
    console.log(`  − ${before.replace(/^#+ /, "")}`);
    console.log(`  + ${after.replace(/^#+ /, "")}`);
  }
  if (WRITE) writeFileSync(path, text);
  touched.push(filename);
}

// Пересобирает перечень ключей из фактических заголовков файла. ИДЕМПОТЕНТНА:
// ничего не сверяет с прежним состоянием, а строит перечень заново, поэтому её
// можно гонять сколько угодно раз и отдельно от замены заголовков.
function rebuildKeyList(text) {
  const bodyOnly = text.split("## Keywords")[0] ?? text;
  const heads = [...bodyOnly.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
  if (heads.length === 0) return text;

  for (const { label, open, close } of KEYS_LABELS) {
    if (!text.includes(label)) continue;
    const rebuilt = `${label}\n${heads.map((h) => `${open}${h}${close}`).join("; ")}.`;
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(`${escaped}\\n(?:.+\\n)*?(?=\\n)`), `${rebuilt}\n`);
  }
  return text;
}

function rewriteClock() {
  for (const [locale, patch] of Object.entries(CLOCK)) {
    const path = join(MESSAGES, `${locale}.json`);
    if (!existsSync(path)) {
      problems.push(`${path}: файла нет`);
      continue;
    }
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (!data.clock) {
      problems.push(`${path}: нет раздела clock`);
      continue;
    }
    console.log(`\nmessages/${locale}.json · clock`);
    for (const [key, value] of Object.entries(patch)) {
      const before = data.clock[key];
      if (before === undefined) {
        problems.push(`${path}: нет ключа clock.${key}`);
        continue;
      }
      if (before === value) continue;
      console.log(`  − ${key}: ${before}`);
      console.log(`  + ${key}: ${value}`);
      data.clock[key] = value;
    }
    // Тот же вид, что пишет остальной инструментарий: два пробела и перевод
    // строки в конце, иначе каждый прогон даёт шумный дифф на весь файл.
    if (WRITE) writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
    touched.push(`messages/${locale}.json`);
  }
}

console.log("Заголовки одиннадцати страниц от 7–8 сентября 2026 года.");
console.log(`Режим: ${WRITE ? "ЗАПИСЬ" : "показ без записи (--write чтобы применить)"}`);

if (KEYS_ONLY) {
  // Только пересборка перечней, без трогания заголовков. Нужен, когда заголовки
  // уже записаны, а перечень под ними отстал — как случилось с русским файлом.
  for (const filename of Object.keys(ARTICLES)) {
    const path = join(DOCS, filename);
    if (!existsSync(path)) {
      problems.push(`${filename}: файла нет`);
      continue;
    }
    const before = readFileSync(path, "utf8");
    const after = rebuildKeyList(before);
    if (before === after) continue;
    console.log(`\n${filename}: перечень ключей пересобран из ${
      [...(after.split("## Keywords")[0] ?? after).matchAll(/^### (.+)$/gm)].length
    } заголовков`);
    if (WRITE) writeFileSync(path, after);
    touched.push(filename);
  }
} else {
  for (const [filename, pairs] of Object.entries(ARTICLES)) rewriteArticle(filename, pairs);
  rewriteClock();
}

if (problems.length > 0) {
  console.error(`\n${"=".repeat(70)}`);
  console.error("НЕ ПРИМЕНЕНО, и файлы этих страниц не тронуты:");
  for (const line of problems) console.error(`  ! ${line}`);
  console.error(
    "\nСкрипт не пишет файл, в котором хоть одна строка не совпала: страница с" +
      "\nполовиной новых заголовков и блоком ключей от старых хуже, чем нетронутая.",
  );
  process.exit(1);
}

console.log(`\n${"=".repeat(70)}`);
console.log(`Готово. Файлов затронуто: ${touched.length}`);

if (WRITE) {
  console.log(
    "\nТеперь перевыпустить. Часам натурализации нужна только пересборка сайта," +
      "\nстатьи идут через Sanity:\n",
  );
  for (const entry of [
    "portugal-living", "portugal-citizenship", "malta-citizenship",
    "malta-living", "portugal-nomad", "greece-citizenship",
    "greece-americans", "portugal-americans", "portugal-uk",
  ]) {
    console.log(`  npm run articles -- --entry ${entry} --write`);
  }
  console.log(
    '\nСначала прогоните portugal-uk БЕЗ --write: у неё kind: "reference", и сухой' +
      "\nпрогон — это шлюз, проверяющий слаг на столкновение с маршрутами и страницами.",
  );
} else {
  console.log("Ничего не записано. Повторите с --write.");
}
