import { blocks, type PortableContent } from "./portable";
import type { Locale } from "./jurisdictions";

// The head and the editorial block of /blog. The entries themselves are
// `article` documents written in the Studio; nothing here is ever an entry.
//
// NOT ONE FIGURE IN THIS FILE, deliberately. Every threshold, fee and deadline
// on this site can be traced to the instrument that states it, and the
// machinery that enforces that — faqData.ts throwing at import, the article
// schema refusing to publish without a source section — does not reach a page
// header. So the rule here is simpler and stricter: this copy describes how the
// section works and never states anything about the world. The one thing it
// does name is what changed in Greece and Portugal, and both are named without
// numbers, as events rather than as amounts.
//
// THE DECK LEADS WITH THE DIFFERENCE, like /faq's. What a reader can see for
// themselves is that this is a list of articles; what they cannot see is that
// each one names the sources its figures were checked against and carries the
// date it was written, and that nothing gets published here to occupy a search
// term.

export interface BlogPageCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  editorial: PortableContent[];
  empty: string;
  seo: { metaTitle: string; metaDescription: string };
}

const EDITORIAL_EN = `
## What gets published here

Two kinds of thing. Guides that work one decision through end to end — what a route actually costs once the government fees, the lawyer and the purchase taxes are counted, rather than what the advertised threshold says. And research: what changed in a statute, when it changed, and which of the figures elsewhere on this site moved with it.

## Why every entry names its sources

Each one carries a line under its opening paragraph listing the sections of our sources page its figures were checked against. That line is not decoration. A threshold quoted without a statute number is indistinguishable from a threshold somebody remembered wrong, and the difference tends to surface only after it has cost someone money.

## Why every entry carries a date

Because the answer expires. Greece redrew its property thresholds by zone; Portugal removed property as a qualifying route altogether. An undated article about either is worse than no article, because it reads as current and is not. Where an entry has been revised, the date of the revision is shown beside the date it was written.

## What is deliberately not here

No aggregated news. No pieces written to occupy a search term. Nothing at all until there is something worth saying — and if that keeps the list short, the list stays short.
`;

const EDITORIAL_RU = `
## Что здесь публикуется

Две вещи. Гайды, которые доводят одно решение до конца: сколько маршрут стоит на самом деле, когда посчитаны государственные сборы, юрист и налоги на покупку, а не сколько заявлено в рекламном пороге. И исследования: что изменилось в законе, когда изменилось и какие цифры в других разделах сайта сдвинулись вместе с ним.

## Почему у каждой записи названы источники

Под первым абзацем каждой идёт строка с разделами нашей страницы источников, по которым сверены её цифры. Эта строка не украшение. Порог, названный без номера закона, неотличим от порога, который кто-то неверно запомнил, и разница обычно обнаруживается уже после того, как обошлась кому-то в деньги.

## Почему у каждой записи стоит дата

Потому что ответ портится. Греция перекроила пороги по зонам, Португалия вовсе убрала недвижимость из квалифицирующих маршрутов. Статья без даты про любое из этих изменений хуже, чем её отсутствие: она читается как актуальная, не будучи ею. Если запись правили, дата правки стоит рядом с датой написания.

## Чего здесь сознательно нет

Пересказанных новостей. Текстов, написанных под поисковый запрос. И вообще ничего, пока не появится что сказать, — а если из-за этого список короткий, пусть будет короткий.
`;

const EDITORIAL_PL = `
## Co tu publikujemy

Dwie rzeczy. Poradniki, które prowadzą jedną decyzję do końca: ile trasa kosztuje naprawdę, po doliczeniu opłat urzędowych, prawnika i podatków od zakupu, a nie ile mówi reklamowany próg. Oraz badania: co zmieniło się w przepisach, kiedy się zmieniło i które liczby w innych miejscach tego serwisu przesunęły się razem z nimi.

## Dlaczego każdy wpis wskazuje źródła

Pod pierwszym akapitem każdego z nich stoi wiersz z sekcjami naszej strony źródeł, względem których sprawdzono jego liczby. Ten wiersz nie jest ozdobą. Próg podany bez numeru ustawy jest nie do odróżnienia od progu, który ktoś źle zapamiętał, a różnica wychodzi na jaw zwykle dopiero wtedy, gdy kogoś kosztowała pieniądze.

## Dlaczego każdy wpis ma datę

Bo odpowiedź się psuje. Grecja przekroiła progi według stref, Portugalia usunęła nieruchomości z tras kwalifikujących w całości. Artykuł bez daty o którejkolwiek z tych zmian jest gorszy niż jego brak: czyta się jak aktualny, nie będąc nim. Jeśli wpis był poprawiany, data poprawki stoi obok daty napisania.

## Czego tu świadomie nie ma

Przepisanych newsów. Tekstów pisanych pod frazę wyszukiwania. I w ogóle niczego, dopóki nie ma czego powiedzieć — a jeśli przez to lista jest krótka, niech pozostanie krótka.
`;

export const BLOG_PAGE_COPY: Record<Locale, BlogPageCopy> = {
  en: {
    eyebrow: "Guides & Research",
    heading: "Worked through, sourced, and dated",
    intro:
      "Guides that follow one decision to the end, and research on what has changed in the rules of the five jurisdictions this site covers. Every entry lists the sections of our sources page its figures were checked against, and carries the date it was written — because a threshold that was right in August may not be in March, and an article that does not say when it was written is asking to be believed on trust.",
    editorial: blocks(EDITORIAL_EN, "blog-en-"),
    empty:
      "Nothing has been published here in English yet. The first three are already named in the footer — rule changes, moving guides and cost of living — and they will appear here as they are written rather than on a schedule.",
    seo: {
      metaTitle: "Guides & Research: residency by investment, sourced — moveandinvest",
      metaDescription:
        "Guides and research on residency by investment in Portugal, Greece, Malta, the UAE and Cyprus. Every entry names the statutes its figures were checked against and carries the date it was written.",
    },
  },

  ru: {
    eyebrow: "Гайды и исследования",
    heading: "Разобрано, со ссылками и с датой",
    intro:
      "Гайды, доводящие одно решение до конца, и исследования того, что изменилось в правилах пяти юрисдикций, которые покрывает этот сайт. У каждой записи перечислены разделы нашей страницы источников, по которым сверены её цифры, и стоит дата написания — потому что порог, верный в августе, может быть неверен в марте, а текст без даты просит верить ему на слово.",
    editorial: blocks(EDITORIAL_RU, "blog-ru-"),
    empty:
      "На русском здесь пока ничего не опубликовано. Первые три темы уже названы в подвале — изменения правил, гайды по переезду и стоимость жизни, — и они появятся здесь по мере написания, а не по расписанию.",
    seo: {
      metaTitle: "Гайды и исследования: ВНЖ за инвестиции со ссылками — moveandinvest",
      metaDescription:
        "Гайды и исследования о ВНЖ за инвестиции в Португалии, Греции, на Мальте, в ОАЭ и на Кипре. У каждой записи названы законы, по которым сверены цифры, и стоит дата написания.",
    },
  },

  pl: {
    eyebrow: "Poradniki i badania",
    heading: "Rozłożone na czynniki, ze źródłami i z datą",
    intro:
      "Poradniki prowadzące jedną decyzję do końca oraz badania nad tym, co zmieniło się w przepisach pięciu jurysdykcji, które obejmuje ten serwis. Każdy wpis wymienia sekcje naszej strony źródeł, względem których sprawdzono jego liczby, i nosi datę napisania — bo próg słuszny w sierpniu może nie być słuszny w marcu, a tekst bez daty prosi, by wierzyć mu na słowo.",
    editorial: blocks(EDITORIAL_PL, "blog-pl-"),
    empty:
      "Po polsku nie opublikowaliśmy tu jeszcze niczego. Pierwsze trzy tematy są już wymienione w stopce — zmiany przepisów, poradniki przeprowadzkowe i koszty życia — i pojawią się tutaj w miarę pisania, a nie według harmonogramu.",
    seo: {
      metaTitle: "Poradniki i badania: rezydencja za inwestycje ze źródłami — moveandinvest",
      metaDescription:
        "Poradniki i badania o rezydencji za inwestycje w Portugalii, Grecji, na Malcie, w ZEA i na Cyprze. Każdy wpis wskazuje przepisy, względem których sprawdzono liczby, i nosi datę napisania.",
    },
  },
};
