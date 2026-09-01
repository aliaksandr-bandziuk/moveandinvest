import type { Locale } from "./jurisdictions";

// The HEAD of /changes, in three languages. Ordinary page copy, editable in
// Studio like every other page's head.
//
// What is NOT here is the log itself — the rule changes and their instruments
// live in src/lib/changeData.ts, in code, for the reason that file states: a
// row may not exist without the act beside it, and a Studio field is exactly
// how a row without one would get added.
//
// THE HEADLINE NAMES ITS SUBJECT AND ITS SCOPE, and it took two passes to get
// there. It first read "What changed in the rules, when, and by which act" —
// which announces the three columns of the table below it and names the rules
// of nothing. Rules of what? Traffic? Then "…in five countries", which is the
// same failure one level in: which five? The site knows and the heading did
// not say, so neither a reader arriving cold nor a crawler could tell.
//
// An H1 is read in a search result, in a share card and in a machine's answer,
// which is to say almost always without the page underneath it. A heading that
// needs the page to be understood is a section heading promoted by mistake.
// It now names the subject and all five jurisdictions, and "by which act" —
// the page's actual argument — moves to the deck and the meta title, where an
// argument belongs and where there is room for it.
//
// THIS IS THE ONE PLACE IN COPY THAT SPELLS THE FIVE OUT, and that is a real
// cost worth stating rather than hiding. Every other page takes jurisdiction
// names from the registry so that two pages cannot disagree about what a
// country is called; this heading cannot, because a headline assembled from a
// CMS query at render time is not a headline anybody can edit. So adding a
// sixth jurisdiction, or renaming one, means editing here too.
//
// AND ONE HONEST TENSION: Cyprus and Malta are named in the heading and have no
// rows in the log. They are named because the heading describes the site's
// scope, and the page states plainly, under the table, that those two have no
// rows because nobody has checked them yet. The alternative — naming only the
// three with rows — would make the page look narrower than the site and would
// need rewriting every time coverage grew.
//
// MALTA JOINED THE LOG ON 1 SEPTEMBER 2026 with four rows, which is why the
// deck counts twenty-two rather than eighteen and why only Cyprus is now named
// as unchecked. The count is written out in words in three languages and has to
// be edited here when rows are added — a real cost, accepted because a deck
// that says "a log of changes" and nothing else is a deck that has stopped
// making a claim.
//
// THE DECK LEADS WITH THE ROWS THAT HAVE NO INSTRUMENT, and that is the whole
// editorial decision on this page. Two of the changes logged here were never
// published as an act by anybody — Dubai's two of 2026 — and one more, the
// Greek suspension for Russian and Belarusian citizens, has existed since 2022
// with no law, no ministerial decision and no gazette reference. A log that
// buried those and led with "Portugal doubled its naturalisation period" would
// be a news page. Leading with them is what makes it an argument.

export interface ChangesPageCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  /** Above the log: how to read a row. Two sentences, not a legend. */
  howToRead: string;
  seo: { metaTitle: string; metaDescription: string };
}

export const CHANGES_PAGE_COPY: Record<Locale, ChangesPageCopy> = {
  en: {
    eyebrow: "Rule changes",
    heading:
      "Changes to residency and tax rules: Portugal, Greece, Malta, the UAE, Cyprus",
    intro:
      "Twenty-two changes to residency and tax rules in the five jurisdictions this site compares, each with the day it took effect and the instrument that made it. Three of them have no instrument at all: Dubai altered two rules in 2026 that thousands of people are now applying under, and Greece has suspended new applications from Russian and Belarusian citizens since 2022 — none of the three has ever been published as a law, a decision or a gazette reference, and we walked the registers to establish it rather than assuming it.",
    howToRead:
      "Each row is one change: the date it took effect, what it did, and the act that did it — or, where none exists, that none exists. The last column is the one no competitor publishes: which figure on this site moved with the change, and when it was read again. Cyprus has no rows, and that means nobody has checked it yet rather than that nothing happened. Malta got its first four on 1 September 2026.",
    seo: {
      metaTitle: "Residency and tax rule changes, with the act — moveandinvest",
      metaDescription:
        "A dated log of residency and tax rule changes in Portugal, Greece, Malta, the UAE and Cyprus, each with its instrument — and three that were never published as an instrument at all.",
    },
  },
  ru: {
    eyebrow: "Изменения правил",
    heading:
      "Изменения правил ВНЖ и налогов: Португалия, Греция, Мальта, ОАЭ, Кипр",
    intro:
      "Двадцать два изменения в правилах проживания и налогообложения в пяти юрисдикциях, которые сравнивает этот сайт, — с днём вступления в силу и с актом, который это сделал. У трёх акта нет вовсе: Дубай изменил в 2026 году два правила, по которым сейчас подают тысячи людей, а Греция с 2022 года не принимает новые заявления от граждан России и Беларуси — и ни одно из трёх никогда не публиковалось ни законом, ни решением, ни номером газеты. Мы прошли реестры и установили это, а не предположили.",
    howToRead:
      "Каждая строка — одно изменение: дата вступления в силу, что оно сделало, и акт, который это сделал, — либо, если акта нет, что его нет. Последняя колонка — та, которой не публикует ни один конкурент: какая цифра на этом сайте сдвинулась вместе с изменением и когда её перечитали. У Кипра строк нет, и это значит, что его пока никто не проверял, а не что там ничего не происходило. У Мальты первые четыре появились 1 сентября 2026 года.",
    seo: {
      metaTitle: "Изменения правил ВНЖ и налогов — moveandinvest",
      metaDescription:
        "Датированная хроника изменений в правилах проживания и налогов по Португалии, Греции, Мальте, ОАЭ и Кипру, каждое со своим актом — и три, которые актом не публиковались вовсе.",
    },
  },
  pl: {
    eyebrow: "Zmiany przepisów",
    heading:
      "Zmiany przepisów pobytowych i podatkowych: Portugalia, Grecja, Malta, ZEA, Cypr",
    intro:
      "Dwadzieścia dwie zmiany w przepisach pobytowych i podatkowych w pięciu jurysdykcjach, które porównuje ta strona — każda z dniem wejścia w życie i aktem, który jej dokonał. Trzy nie mają aktu w ogóle: Dubaj zmienił w 2026 roku dwie zasady, na podstawie których wnioski składają teraz tysiące osób, a Grecja od 2022 roku nie przyjmuje nowych wniosków od obywateli Rosji i Białorusi — i żadna z tych trzech nigdy nie została opublikowana jako ustawa, decyzja ani sygnatura dziennika. Przeszliśmy rejestry i to ustaliliśmy, a nie założyliśmy.",
    howToRead:
      "Każdy wiersz to jedna zmiana: data wejścia w życie, co zrobiła i akt, który jej dokonał — albo, gdy aktu nie ma, że go nie ma. Ostatnia kolumna jest tą, której nie publikuje żaden konkurent: która liczba na tej stronie przesunęła się wraz ze zmianą i kiedy ją ponownie odczytano. Cypr nie ma wierszy, a to znaczy, że nikt go jeszcze nie sprawdzał, a nie że nic się tam nie działo. Malta dostała pierwsze cztery 1 września 2026.",
    seo: {
      metaTitle: "Zmiany przepisów pobytowych i podatkowych — moveandinvest",
      metaDescription:
        "Datowana kronika zmian w przepisach pobytowych i podatkowych w Portugalii, Grecji, na Malcie, w ZEA i na Cyprze, każda ze swoim aktem — i trzy, których aktem nigdy nie opublikowano.",
    },
  },
};
