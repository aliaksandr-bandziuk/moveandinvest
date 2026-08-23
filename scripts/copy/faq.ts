// The FAQ answers, shared by `seed.ts` and `facts.ts` for the same reason the
// jurisdiction figures are: several of these answers carry years and
// thresholds, and once a document is published, `seed` — which runs once on an
// empty dataset — can no longer reach it.
//
// The citizenship answer in particular is the single most quotable claim on
// the site: it is exactly the shape an answer engine lifts whole. It was
// wrong until 23 August 2026, when Portugal turned out to have moved from
// five years to seven or ten in May of that year.
//
// `countries` is the list of jurisdiction ids a question is specific to.
// Empty means it applies to all five — the common case, and the reason the
// filter chips only appear for jurisdictions that have a question of their
// own.

import type { Locale } from "./jurisdictions";

export interface FaqSeed {
  key: string;
  countries: string[];
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

export const FAQ_ITEMS: FaqSeed[] = [
  {
    key: "no-property",
    countries: ["country-pt"],
    q: {
      en: "Can I get residency without buying property?",
      ru: "Можно ли получить ВНЖ, не покупая недвижимость?",
      pl: "Czy można uzyskać rezydencję bez zakupu nieruchomości?",
    },
    a: {
      en: "Yes, in four of the five. Portugal removed property from its Golden Visa in 2023 altogether — what is left is funds and job creation. Greece, Cyprus and Malta allow alternative routes, but their thresholds are usually higher.",
      ru: "Да, в четырёх юрисдикциях из пяти. Португалия в 2023 году вообще убрала недвижимость из золотой визы — остались фонды и создание рабочих мест. Греция, Кипр и Мальта допускают альтернативные маршруты, но пороги по ним обычно выше.",
      pl: "Tak, w czterech z pięciu. Portugalia w 2023 roku całkowicie usunęła nieruchomości ze złotej wizy — zostały fundusze i tworzenie miejsc pracy. Grecja, Cypr i Malta dopuszczają alternatywne ścieżki, ale ich progi są zwykle wyższe.",
    },
  },
  {
    key: "work-in-eu",
    countries: [],
    q: {
      en: "Does the permit let me work anywhere in the EU?",
      ru: "Даёт ли ВНЖ право работать в ЕС?",
      pl: "Czy zezwolenie pozwala pracować w całej UE?",
    },
    a: {
      en: "No. An investment residence permit lets you live in the issuing country and travel freely in Schengen, but it carries no right to work in other EU states. Working in the issuing country itself is usually allowed; the conditions differ.",
      ru: "Нет. ВНЖ по инвестициям даёт право жить в выдавшей стране и свободно ездить по Шенгену, но не даёт права работать в других странах ЕС. Работать в самой стране обычно можно, условия отличаются.",
      pl: "Nie. Zezwolenie inwestycyjne pozwala mieszkać w kraju, który je wydał, i swobodnie podróżować po Schengen, ale nie daje prawa do pracy w innych państwach UE. Praca w samym kraju wydania jest zwykle możliwa, warunki się różnią.",
    },
  },
  {
    key: "citizenship-years",
    countries: [],
    q: {
      en: "After how many years can I apply for citizenship?",
      ru: "Через сколько лет можно подавать на гражданство?",
      pl: "Po ilu latach można ubiegać się o obywatelstwo?",
    },
    a: {
      en: "Malta about five years by naturalisation, Greece seven, Cyprus eight, Portugal seven for EU and Portuguese-speaking nationals and ten for everyone else — that last figure changed in May 2026 and used to be five. The UAE has no citizenship route here at all. Everywhere the clock counts years of actual legal residence, not years of holding the status, so a permit that requires a few days a year accrues nothing on its own.",
      ru: "Мальта — около 5 лет по натурализации, Греция — 7, Кипр — 8, Португалия — 7 для граждан ЕС и португалоязычных стран и 10 для всех остальных; последняя цифра изменилась в мае 2026 года, до этого было 5. У ОАЭ гражданства по этому маршруту нет вообще. Везде считается срок фактического законного проживания, а не срок владения статусом: разрешение, требующее несколько дней в году, само по себе ничего не копит.",
      pl: "Malta około 5 lat przez naturalizację, Grecja 7, Cypr 8, Portugalia 7 dla obywateli UE i krajów portugalskojęzycznych oraz 10 dla pozostałych — ta ostatnia liczba zmieniła się w maju 2026 roku, wcześniej wynosiła 5. ZEA nie mają tu żadnej ścieżki do obywatelstwa. Wszędzie liczy się okres faktycznego legalnego pobytu, a nie posiadania statusu: zezwolenie wymagające kilku dni w roku samo z siebie nic nie nalicza.",
    },
  },
  {
    key: "must-live",
    countries: [],
    q: {
      en: "Do I have to live there to keep the status?",
      ru: "Нужно ли жить в стране, чтобы сохранить статус?",
      pl: "Czy trzeba tam mieszkać, aby zachować status?",
    },
    a: {
      en: "To keep the permit, almost nowhere: a few days a year is usually enough. For citizenship, yes — actual residence is required, and this is where expectations diverge most often.",
      ru: "Для сохранения ВНЖ — почти нигде: обычно достаточно нескольких дней в год. Для гражданства — да, требуется фактическое проживание, и именно на этом расходятся ожидания чаще всего.",
      pl: "Aby zachować zezwolenie — prawie nigdzie: zwykle wystarczy kilka dni w roku. Dla obywatelstwa — tak, wymagany jest faktyczny pobyt, i właśnie tu oczekiwania najczęściej się rozmijają.",
    },
  },
  {
    key: "tax-residency",
    countries: [],
    q: {
      en: "Does buying property make me a tax resident?",
      ru: "Покупка недвижимости делает меня налоговым резидентом?",
      pl: "Czy zakup nieruchomości czyni mnie rezydentem podatkowym?",
    },
    a: {
      en: "No. Tax residence is decided by days of presence and centre of vital interests, not by ownership. Buying a house and remaining a tax resident of your own country is an ordinary situation.",
      ru: "Нет. Налоговое резидентство определяется днями присутствия и центром жизненных интересов, а не собственностью. Купить дом и остаться налоговым резидентом своей страны — обычная ситуация.",
      pl: "Nie. Rezydencję podatkową wyznaczają dni obecności i ośrodek interesów życiowych, a nie własność. Kupno domu i pozostanie rezydentem podatkowym własnego kraju to zwyczajna sytuacja.",
    },
  },
  {
    key: "rules-change",
    countries: ["country-gr", "country-pt"],
    q: {
      en: "What if the rules change after I apply?",
      ru: "Что будет, если правила изменятся после подачи?",
      pl: "Co, jeśli przepisy zmienią się po złożeniu wniosku?",
    },
    a: {
      en: "Applications are normally assessed under the rules in force on the filing date, but there is no guarantee: Portugal and Greece have both changed terms with a short transition. That is the main argument against a long gap between deciding and filing.",
      ru: "Обычно заявку рассматривают по правилам на дату подачи, но гарантии нет: Португалия и Греция меняли условия с коротким переходным периодом. Это главный аргумент не затягивать между решением и подачей.",
      pl: "Wnioski ocenia się zwykle według przepisów obowiązujących w dniu złożenia, ale gwarancji nie ma: Portugalia i Grecja zmieniały warunki z krótkim okresem przejściowym. To główny argument, by nie zwlekać między decyzją a złożeniem.",
    },
  },
];
