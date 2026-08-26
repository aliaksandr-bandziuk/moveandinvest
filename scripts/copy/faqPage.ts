import type { Locale } from "./jurisdictions";

// The /faq page's HEAD, and nothing else.
//
// The fifty-two questions live in src/lib/faqData.ts, in code, for the reason
// that file states at length. What is here is the four lines above the first
// accordion: the eyebrow, the headline, the deck, and the sentence explaining
// what the link under an answer is. Prose about the page rather than claims
// about the world, and a typo in them should not need a deploy.
//
// THE DECK LEADS WITH THE DIFFERENCE, not with a greeting. "Frequently asked
// questions" is what a reader can already see; what they cannot see, and what
// no competitor page offers, is that every figure links to the statute it was
// checked against and that the ones nobody publishes are named rather than
// guessed at. Of fourteen FAQ pages read across this market on 25 August 2026,
// not one attached a source to a single answer.

export interface FaqPageCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  howToRead: string;
  seo: { metaTitle: string; metaDescription: string };
}

export const FAQ_PAGE_COPY: Record<Locale, FaqPageCopy> = {
  en: {
    eyebrow: "Questions",
    heading: "Fifty-two questions, answered from the statute",
    intro:
      "Every answer here that states a figure carries a link to the law, tariff or authority page it was checked against, and the date it was read. Where no primary source publishes something — Malta's processing time, whether off-plan property qualifies in the UAE, two of Cyprus's figures — the answer says so instead of guessing, because a plausible answer is indistinguishable from a true one right up until it costs somebody money. Some of what follows is not flattering to the routes on this site, and some of it is not flattering to us.",
    howToRead:
      "The line under an answer links to the section of our sources page where that figure was checked, with the statute number, the article and the gazette date. An answer with no such line either states no figure, or is about how this site itself works.",
    seo: {
      metaTitle: "FAQ: residency by investment in five jurisdictions — moveandinvest",
      metaDescription:
        "Fifty-two questions on residency by investment in Portugal, Greece, Malta, the UAE and Cyprus. Every figure links to the statute it came from; where no primary source exists, we say so.",
    },
  },
  ru: {
    eyebrow: "Вопросы",
    heading: "Пятьдесят два вопроса, отвеченных по закону",
    intro:
      "Каждый ответ здесь, в котором есть цифра, несёт ссылку на закон, тариф или страницу ведомства, по которым она сверена, и дату прочтения. Там, где первоисточник чего-то не публикует — срок рассмотрения на Мальте, годится ли в ОАЭ объект на стадии строительства, две кипрские цифры, — ответ говорит об этом прямо, а не догадывается: правдоподобный ответ неотличим от верного ровно до того момента, когда обойдётся кому-то в деньги. Кое-что из написанного ниже не красит маршруты с этого сайта, а кое-что не красит нас самих.",
    howToRead:
      "Строка под ответом ведёт в тот раздел нашей страницы источников, где эта цифра сверялась, — с номером закона, статьёй и датой официальной газеты. Если такой строки нет, значит в ответе нет цифры либо он о том, как устроен сам сайт.",
    seo: {
      metaTitle: "FAQ: ВНЖ за инвестиции в пяти юрисдикциях — moveandinvest",
      metaDescription:
        "Пятьдесят два вопроса о ВНЖ за инвестиции в Португалии, Греции, на Мальте, в ОАЭ и на Кипре. Каждая цифра со ссылкой на закон; где первоисточника нет, мы так и пишем.",
    },
  },
  pl: {
    eyebrow: "Pytania",
    heading: "Pięćdziesiąt dwa pytania, odpowiedziane z ustawy",
    intro:
      "Każda odpowiedź, która podaje liczbę, niesie odesłanie do ustawy, taryfy albo strony urzędu, wobec których ją sprawdzono, oraz datę odczytu. Tam, gdzie źródło pierwotne czegoś nie publikuje — czas rozpatrywania na Malcie, czy w ZEA kwalifikuje się nieruchomość w budowie, dwie cypryjskie liczby — odpowiedź mówi to wprost, zamiast zgadywać: prawdopodobna odpowiedź jest nie do odróżnienia od prawdziwej dokładnie do chwili, gdy kogoś kosztuje pieniądze. Część poniższego nie zdobi ścieżek z tej strony, a część nie zdobi nas samych.",
    howToRead:
      "Wiersz pod odpowiedzią prowadzi do tej sekcji naszej strony źródeł, w której daną liczbę sprawdzano — z numerem ustawy, artykułem i datą dziennika urzędowego. Brak takiego wiersza oznacza, że odpowiedź nie podaje liczby albo dotyczy tego, jak działa sama strona.",
    seo: {
      metaTitle: "FAQ: rezydencja za inwestycje w pięciu jurysdykcjach — moveandinvest",
      metaDescription:
        "Pięćdziesiąt dwa pytania o rezydencję za inwestycje w Portugalii, Grecji, na Malcie, w ZEA i na Cyprze. Każda liczba z odesłaniem do ustawy; gdzie nie ma źródła pierwotnego, piszemy to wprost.",
    },
  },
};
