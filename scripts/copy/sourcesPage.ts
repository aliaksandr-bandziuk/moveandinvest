import type { Locale } from "./jurisdictions";

// The HEAD of /sources, in three languages. Ordinary page copy, editable in
// Studio like every other page's head.
//
// What is NOT here is the evidence itself — the 33 checks and their citations
// live in src/lib/sourceData.ts, in code, because a figure may not change
// without the dossier changing in the same commit and a CMS field routes around
// that rule. See the note at the top of that file.
//
// THE DECK LEADS WITH THE NUMBER OF CORRECTIONS, and that is the whole editorial
// decision on this page. Fourteen of thirty-three checks came back wrong. The
// instinct is to bury that; it is in fact the single most persuasive sentence
// the project can write, because no competitor publishes one. A comparison that
// has never found itself wrong has never checked.

export interface SourcesPageCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  /** Above the table: how to read a row. Two sentences, not a legend. */
  howToRead: string;
  seo: { metaTitle: string; metaDescription: string };
}

export const SOURCES_PAGE_COPY: Record<Locale, SourcesPageCopy> = {
  en: {
    eyebrow: "The working",
    heading: "Every figure on this site, and where it came from",
    intro:
      "On 23 August 2026 each headline figure here was read back from the statute, the ministry tariff or the official fee schedule it is supposed to rest on. Thirty-three checks. Fourteen came back wrong, four could not be established from any primary source at all, and those four are not published as figures anywhere on this site. Below is all of it, including the parts that do not flatter us.",
    howToRead:
      "Each row is one thing the site states, what the source actually says, and the mark for how the two compared. Citations are given in full — statute, article, gazette and date — because a link can rot and a citation cannot; the link beside it is where the text can be read today, and it says whether it is the authority's own page or a database reproducing it.",
    seo: {
      metaTitle: "Sources: every figure, checked and dated — moveandinvest",
      metaDescription:
        "The full working behind the comparison: 33 checks against statutes and ministry tariffs on 23 August 2026, 14 of which corrected a figure. Citations, links and what could not be verified.",
    },
  },
  ru: {
    eyebrow: "Выкладки",
    heading: "Каждая цифра на этом сайте и откуда она взята",
    intro:
      "23 августа 2026 года каждая заголовочная цифра здесь была перечитана из закона, тарифа ведомства или официальной таблицы сборов, на которых она должна стоять. Тридцать три проверки. Четырнадцать вернулись неверными, четыре не удалось установить ни по одному первоисточнику — и эти четыре нигде на сайте цифрами не публикуются. Ниже всё, включая то, что нас не красит.",
    howToRead:
      "Каждая строка — это то, что утверждает сайт, то, что говорит источник, и пометка о том, как одно сошлось с другим. Ссылка на закон дана полностью — номер, статья, номер и дата официальной газеты, — потому что URL протухает, а такая ссылка нет; адрес рядом — это где текст можно прочитать сегодня, и у него написано, страница это самого ведомства или база, воспроизводящая текст.",
    seo: {
      metaTitle: "Источники: каждая цифра, сверенная и датированная — moveandinvest",
      metaDescription:
        "Полные выкладки за сравнением: 33 сверки с законами и тарифами ведомств 23 августа 2026 года, четырнадцать из которых исправили цифру. Ссылки на законы и то, что подтвердить не удалось.",
    },
  },
  pl: {
    eyebrow: "Wyliczenia",
    heading: "Każda liczba na tej stronie i skąd pochodzi",
    intro:
      "23 sierpnia 2026 każda główna liczba została tu odczytana na nowo z ustawy, taryfy ministerialnej albo oficjalnej tabeli opłat, na których ma się opierać. Trzydzieści trzy sprawdzenia. Czternaście wróciło błędnych, czterech nie udało się ustalić z żadnego źródła pierwotnego — i tych czterech nigdzie na stronie nie publikujemy jako liczb. Poniżej wszystko, łącznie z tym, co nas nie zdobi.",
    howToRead:
      "Każdy wiersz to jedno twierdzenie strony, to, co faktycznie mówi źródło, i oznaczenie, jak jedno wypadło wobec drugiego. Odesłanie do prawa podano w całości — numer, artykuł, numer i data dziennika urzędowego — bo URL się psuje, a takie odesłanie nie; adres obok to miejsce, gdzie tekst można przeczytać dziś, i jest przy nim zaznaczone, czy to strona samego urzędu, czy baza reprodukująca tekst.",
    seo: {
      metaTitle: "Źródła: każda liczba, sprawdzona i z datą — moveandinvest",
      metaDescription:
        "Pełne wyliczenia stojące za porównaniem: 33 sprawdzenia wobec ustaw i taryf ministerialnych 23 sierpnia 2026, z czego czternaście poprawiło liczbę. Odesłania do przepisów i to, czego nie udało się potwierdzić.",
    },
  },
};
