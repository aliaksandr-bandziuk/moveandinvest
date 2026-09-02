import { CONTROLLER } from "../../src/lib/controller";

import type { Locale } from "./home";

// The /for-partners copy, all three locales, in the shape partnersPage stores
// it. Same rule as home.ts: one copy, two consumers (seed.ts and content.ts).
//
// NOTHING HERE STATES A PRICE OR A PAYMENT MODEL. See the note at the top of
// src/sanity/schemaTypes/documents/partnersPage.ts — it is not only premature,
// it is wrong for two of the five jurisdictions.

export interface PartnersCopy {
  hero: {
    eyebrow: string;
    heading: string;
    intro: string;
    principles: { title: string; body: string }[];
    ctaLabel: string;
  };
  anatomy: {
    eyebrow: string;
    heading: string;
    intro: string;
    sampleLabel: string;
    sampleTag: string;
    fields: { label: string; sample: string; note: string }[];
    note: string;
  };
  journey: {
    eyebrow: string;
    heading: string;
    intro: string;
    steps: { title: string; body: string }[];
    note: string;
  };
  honesty: {
    eyebrow: string;
    heading: string;
    intro: string;
    notLabel: string;
    notItems: { title: string; body: string }[];
    yesLabel: string;
    yesItems: { title: string; body: string }[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    intro: string;
    questions: string[];
    jurisdictionLabel: string;
    severalLabel: string;
    orgLabel: string;
    /** Four labels, in the order the server's allow-list expects:
     *  law-firm, relocation, developer, estate-agent. */
    orgOptions: string[];
    nameLabel: string;
    emailLabel: string;
    termsLabel: string;
    honeypotLabel: string;
    submitLabel: string;
    fine: string;
    sentTitle: string;
    sentBody: string;
    brokeTitle: string;
    brokeBody: string;
    failedTitle: string;
    failedBody: string;
  };
  seo: { metaTitle: string; metaDescription: string };
}

// Was a partners@ address of its own until 24 Aug 2026. There is one mailbox,
// and a second address printed on a page nobody can answer is worse than no
// address — a firm that replies to it and hears nothing concludes the project
// is not real. See src/lib/controller.ts.
export const CONTACT_EMAIL = CONTROLLER.email;


export const PARTNERS_COPY: Record<Locale, PartnersCopy> = {
  en: {
    hero: {
      eyebrow: "For partners",
      heading: "Enquiries about residency and property in your jurisdiction",
      intro: "moveandinvest is an independent comparison for private individuals: residency by investment, tax regime and buying property in Portugal, Greece, Cyprus, Malta and the UAE. A reader picks a country, states a budget, a timeline and a goal — and leaves their contact details. One partner in that country receives the enquiry.",
      principles: [
      {
        title: "One partner per jurisdiction",
        body: "The enquiry does not go to a second recipient and is never resold.",
      },
      {
        title: "No commission on a closing",
        body: "We take no share of your fee and claim no percentage of the deal.",
      },
      {
        title: "You name the terms",
        body: "There is no price list on this site: we ask the market first and do the arithmetic after.",
      },
      ],
      ctaLabel: "Discuss terms",
    },
    anatomy: {
      eyebrow: "The enquiry",
      heading: "What is inside an enquiry",
      intro: "What follows is a sample, not a real enquiry: the site is launching, and there is nothing to show and no reason to show anyone's data yet. The structure is real, though — these six fields are what arrives in your inbox, in this order, with no processing on our side. We add nothing of our own and cut nothing out; what the person wrote in their own words is what you will read.",
      sampleLabel: "What an enquiry looks like",
      sampleTag: "sample",
      fields: [
      {
        label: "Jurisdiction",
        sample: "Portugal",
        note: "A named country, not «somewhere in Europe». They arrived at it through a table of thresholds and timelines, not through an advertisement.",
      },
      {
        label: "Budget ceiling",
        sample: "up to \u20AC500,000",
        note: "Not «how much are you ready to invest» but an upper limit. The wording is deliberate: it does not nudge anyone towards a larger figure.",
      },
      {
        label: "Timeline",
        sample: "within six months",
        note: "One of four answers, «just looking for now» among them. We do not hide that option: an enquiry six months out, passed on as live, costs you time.",
      },
      {
        label: "Goal",
        sample: "residency for the family \u00B7 property as an investment",
        note: "Several may be ticked: residency for the family, tax position, an EU passport in time, business and banking, property as an investment. The combination is what makes a case concrete.",
      },
      {
        label: "In their own words",
        sample: "\u00ABBelarusian citizenship, family of four, income from the EU. We looked at funds but want to understand what buying property actually gives us.\u00BB",
        note: "Citizenship, family, where the income comes from, what they have already tried. The field is optional — and it is usually the one that decides whether the case is worth your hour.",
      },
      {
        label: "Name and email",
        sample: "They give their name",
        note: "You answer a person by name, someone who was reading about Portugal an hour ago, not «enquiry #1428». A willingness to be named is a filter in itself.",
      },
      ],
      note: "We verify neither the budget, nor the source of funds, nor the readiness to act. This is what a person says about themselves. «Qualified» here means «the questions are answered», not «the facts are confirmed» — verification is yours, and we do not pretend to have done it for you.",
    },
    journey: {
      eyebrow: "The path",
      heading: "How a person gets to an enquiry",
      intro: "An enquiry is the last step of reading, not the first screen with a pop-up form. A reader sees the table of five jurisdictions, goes into one of them, answers three questions in the route finder, and only then reaches the form. Nowhere along that path do we promise anything on your behalf or quote a timeline we have not checked ourselves.",
      steps: [
        {
          title: "Reads the comparison",
          body: "Five jurisdictions in one table: route, entry threshold, time to a first permit, tax regime — each with its source and the date it was checked.",
        },
        {
          title: "Runs the route finder",
          body: "Answers on budget, timeline and priority, and gets the country that meets them. If none does, the site says so and shows what would have to give.",
        },
        {
          title: "Answers four questions",
          body: "And describes the situation in their own words. The route finder's answers are carried into the form, so nothing is asked twice.",
        },
        {
          title: "The enquiry goes to one",
          body: "One partner in that country. Not a second recipient, and never resold.",
        },
      ],
      note: "There is not a single pop-up on this site. The form sits at the bottom of the page, and reaching it is the reader's own decision, not the result of us covering their text.",
    },
    honesty: {
      eyebrow: "Straight",
      heading: "What we do not promise",
      intro: "This is not modesty. You would work all of it out yourself in the second week — better to read it now and decide with your eyes open. The site is new, there is no flow yet, and we will not name a number of enquiries per month because we do not know it. Below is first what will not happen and only then what we do take on: the other order would read as a pitch.",
      notLabel: "We do not promise",
      notItems: [
        {
          title: "Volume",
          body: "The site is launching and there is no traffic yet. We are talking to firms before there is volume on purpose: terms agreed on an empty table are fairer than terms haggled over a full one.",
        },
        {
          title: "Conversion to a client",
          body: "An enquiry is a conversation, not a transaction. What comes of it depends on your reply and your price, and we have no influence over either.",
        },
        {
          title: "Verification",
          body: "Not the budget, not the source of funds, not the identity. We pass on what a person wrote about themselves.",
        },
        {
          title: "Legal judgement",
          body: "We are not lawyers, we do not advise, and we give no opinion on whether a programme fits a case. Nothing on this site is legal or tax advice.",
        },
      ],
      yesLabel: "We do promise",
      yesItems: [
        {
          title: "To one partner",
          body: "An enquiry for a country goes to one partner and is never resold — not to another lawyer, not to a lead exchange, not to anyone.",
        },
        {
          title: "Only with consent",
          body: "We pass it on only if the person ticked the box. Without it, the enquiry stays with us.",
        },
        {
          title: "Deletion on request",
          body: "From our side, and with a request to you to do the same.",
        },
      ],
    },
    contact: {
      eyebrow: "The question",
      heading: "Now our question",
      intro: "There is no price list on this page, deliberately. We do not know what an enquiry like this is worth — there are no public prices in this niche — and we would rather ask than name a figure and then explain where it came from. So the three questions below are about you, not about us: where you work, how many enquiries you can take without dropping the quality of the answer, and on what terms. Every message gets a reply within two working days.",
      questions: [
        "Do you buy inbound enquiries?",
        "What do you pay for a qualified one, if your rules allow paying at all?",
        "On what terms — exclusivity, a window to decline, replacing one that does not stand up?",
      ],
      jurisdictionLabel: "Jurisdiction",
      severalLabel: "Several",
      orgLabel: "Type of organisation",
      orgOptions: ["Law firm", "Relocation agency", "Developer", "Estate agency"],
      nameLabel: "Name",
      emailLabel: "Email",
      termsLabel: "On what terms you work with inbound enquiries",
      honeypotLabel: "Reference (leave empty)",
      submitLabel: "Reply",
      fine: "We answer ourselves, within two working days. Your reply commits you to nothing and is not published. We do not provide legal services and take no part in the relationship between you and a client.",
      sentTitle: "Thank you.",
      sentBody: "We read every reply and answer within two working days, from a person, not a template. If you do not hear back, check the spam folder before assuming we lost it.",
      brokeTitle: "That one is on us.",
      brokeBody: "Your reply did not save, and the fault is at our end rather than in anything you wrote. Try once more in a minute, or write to office@moveandinvest.com — it reaches the same place.",
      failedTitle: "That did not go through.",
      failedBody: "An email address and an answer in the last field are the two things we cannot proceed without. Fill both and try again — nothing else you typed was lost.",
    },
    seo: {
      metaTitle: "For partners — moveandinvest",
      metaDescription: "Enquiries about residency by investment and buying property in Portugal, Greece, Cyprus, Malta and the UAE. One partner per jurisdiction, never resold.",
    },
  },
  ru: {
    hero: {
      eyebrow: "Партнёрам",
      heading: "Заявки на ВНЖ и покупку недвижимости в вашей юрисдикции",
      intro: "moveandinvest — независимое сравнение маршрутов для частных лиц: ВНЖ за инвестиции, налоговый режим и покупка недвижимости в Португалии, Греции, на Кипре, Мальте и в ОАЭ. Читатель выбирает страну, называет бюджет, срок и цель — и оставляет контакт. Эту заявку получает один партнёр в стране.",
      principles: [
      {
        title: "Один партнёр на юрисдикцию",
        body: "Заявка не уходит второму адресату и не перепродаётся.",
      },
      {
        title: "Без комиссии со сделки",
        body: "Мы не участвуем в вашем гонораре и не претендуем на процент.",
      },
      {
        title: "Условия называете вы",
        body: "Прайса на сайте нет: сначала спрашиваем рынок, потом считаем.",
      },
      ],
      ctaLabel: "Обсудить условия",
    },
    anatomy: {
      eyebrow: "Заявка",
      heading: "Что внутри заявки",
      intro: "Ниже — образец, а не реальное обращение: сайт запускается, и показывать чужие данные нам пока не из чего и незачем. Но структура настоящая — ровно эти шесть полей приходят на почту, в этом порядке, без предварительной обработки с нашей стороны. Мы ничего не дописываем от себя и ничего не вырезаем: что человек написал своими словами, то вы и прочитаете.",
      sampleLabel: "Как выглядит заявка",
      sampleTag: "образец",
      fields: [
      {
        label: "Юрисдикция",
        sample: "Португалия",
        note: "Названная страна, а не «куда-нибудь в Европу». Человек дошёл до неё через таблицу с суммами и сроками, а не через рекламу.",
      },
      {
        label: "Потолок бюджета",
        sample: "до \u20AC500 000",
        note: "Не «сколько готовы вложить», а верхняя граница. Формулировка выбрана специально: она не подталкивает называть цифру побольше.",
      },
      {
        label: "Срок",
        sample: "до полугода",
        note: "Один из четырёх ответов, включая «пока просто смотрю». Мы не прячем этот вариант: заявка на полгода вперёд, поданная как горячая, стоит вам времени.",
      },
      {
        label: "Цель",
        sample: "ВНЖ для семьи \u00B7 недвижимость как инвестиция",
        note: "Можно отметить несколько: ВНЖ для семьи, налоговая позиция, паспорт ЕС в перспективе, бизнес и банк, недвижимость как инвестиция. Сочетание и делает случай конкретным.",
      },
      {
        label: "Своими словами",
        sample: "«Гражданство Беларуси, семья из четырёх, доход из ЕС. Смотрели фонды, но хотим понять, что реально даёт покупка жилья.»",
        note: "Гражданство, состав семьи, откуда доход, что уже пробовали. Поле не обязательное — и именно оно чаще всего решает, стоит ли случай вашего часа.",
      },
      {
        label: "Имя и почта",
        sample: "Человек называет себя",
        note: "Вы отвечаете не «заявке №1428», а человеку по имени, который час назад читал про Португалию. Готовность назваться — сама по себе фильтр.",
      },
      ],
      note: "Мы не проверяем ни бюджет, ни источник средств, ни готовность действовать. Это слова человека о себе. «Квалифицированная» здесь значит «на вопросы отвечено», а не «сведения подтверждены» — проверка ваша, и мы не делаем вид, что сделали её за вас.",
    },
    journey: {
      eyebrow: "Путь",
      heading: "Как человек доходит до заявки",
      intro: "Заявка — последний шаг чтения, а не первый экран со всплывающей формой. Человек сначала видит таблицу с пятью юрисдикциями, потом уходит на страницу одной из них, отвечает на три вопроса подбора и только после этого доходит до формы. На всём этом пути нет ни одного места, где мы обещали бы что-то от вашего имени или называли сроки, которых сами не проверяли.",
      steps: [
        {
          title: "Читает сравнение",
          body: "Пять юрисдикций в одной таблице: маршрут, порог входа, срок до первого пермита, налоговый режим — с указанием источника и даты проверки.",
        },
        {
          title: "Проходит подбор",
          body: "Отвечает про бюджет, срок и приоритет и получает страну, которая этим условиям отвечает. Если не отвечает ни одна — сайт так и говорит и показывает, чем придётся поступиться.",
        },
        {
          title: "Отвечает на четыре вопроса",
          body: "И описывает ситуацию словами. Ответы из подбора подставляются в форму сами, чтобы не спрашивать дважды.",
        },
        {
          title: "Заявка уходит одному",
          body: "Одному партнёру в этой стране. Не второму адресату и не на перепродажу.",
        },
      ],
      note: "Всплывающих окон на сайте нет ни одного. Форма стоит внизу страницы, и дойти до неё — решение читателя, а не результат того, что мы перекрыли ему текст.",
    },
    honesty: {
      eyebrow: "Честно",
      heading: "Чего мы не обещаем",
      intro: "Это не скромность. Всё перечисленное вы выясните сами на второй неделе — лучше прочитать сейчас и решать с открытыми глазами. Сайт молодой, потока пока нет, и мы не станем называть число заявок в месяц, потому что его не знаем. Ниже сначала то, чего не будет, и только потом то, что мы действительно берём на себя: в обратном порядке это читалось бы как реклама.",
      notLabel: "Не обещаем",
      notItems: [
        {
          title: "Объёмов",
          body: "Сайт запускается, трафика пока нет. Мы говорим с фирмами до объёма намеренно: условия, согласованные на пустом месте, честнее тех, что выторговываются после.",
        },
        {
          title: "Конверсии в клиента",
          body: "Заявка — это разговор, а не сделка. Что из неё выйдет, зависит от вашего ответа и вашей цены, и на это мы не влияем.",
        },
        {
          title: "Проверки сведений",
          body: "Ни бюджета, ни источника средств, ни личности. Мы передаём то, что человек написал о себе.",
        },
        {
          title: "Юридической оценки",
          body: "Мы не юристы, не консультируем и не даём мнений о применимости той или иной программы. Ни один материал на сайте не является юридической или налоговой консультацией.",
        },
      ],
      yesLabel: "Обещаем",
      yesItems: [
        {
          title: "Одному",
          body: "Заявка по стране уходит одному партнёру и не перепродаётся — ни другому юристу, ни лид-бирже, ни кому-либо ещё.",
        },
        {
          title: "Только с согласия",
          body: "Передаём, только если человек отметил галочку. Без неё заявка остаётся у нас.",
        },
        {
          title: "Удаление по требованию",
          body: "И у нас, и с просьбой к вам сделать то же самое.",
        },
      ],
    },
    contact: {
      eyebrow: "Вопрос",
      heading: "Теперь наш вопрос",
      intro: "Прайса на этой странице нет намеренно. Мы не знаем, сколько стоит такая заявка — публичных цен в этой нише не существует, и мы предпочитаем спросить, а не назначить цифру и потом объяснять, откуда она взялась. Поэтому три вопроса ниже — про вас, а не про нас: где вы работаете, сколько заявок разберёте, не роняя качество ответа, и на каких условиях. Отвечаем на каждое письмо в течение двух рабочих дней.",
      questions: [
        "Покупаете ли вы входящие заявки?",
        "Сколько платите за квалифицированную — если ваши правила вообще позволяют платить?",
        "На каких условиях — эксклюзив, окно на отказ, замена негодной?",
      ],
      jurisdictionLabel: "Юрисдикция",
      severalLabel: "Несколько",
      orgLabel: "Тип организации",
      orgOptions: ["Юридическая фирма", "Агентство по релокации", "Застройщик", "Агентство недвижимости"],
      nameLabel: "Имя",
      emailLabel: "Почта",
      termsLabel: "На каких условиях вы работаете с входящими заявками",
      honeypotLabel: "Референс (оставьте пустым)",
      submitLabel: "Ответить",
      fine: "Отвечаем сами, в течение двух рабочих дней. Ваш ответ не обязывает ни к чему и не публикуется. Мы не оказываем юридических услуг и не участвуем в отношениях между вами и клиентом.",
      sentTitle: "Спасибо.",
      sentBody: "Мы читаем каждый ответ и отвечаем в течение двух рабочих дней, человеком, а не шаблоном. Если ответа нет — загляните в спам, прежде чем решить, что мы потеряли письмо.",
      brokeTitle: "Это уже наша вина.",
      brokeBody: "Ответ не сохранился, и дело в нашей стороне, а не в том, что вы написали. Попробуйте ещё раз через минуту или напишите на office@moveandinvest.com — придёт туда же.",
      failedTitle: "Не отправилось.",
      failedBody: "Почта и ответ в последнем поле — два пункта, без которых мы не можем ничего сделать. Заполните оба и отправьте снова: остальное, что вы написали, никуда не делось.",
    },
    seo: {
      metaTitle: "Партнёрам — moveandinvest",
      metaDescription: "Заявки на ВНЖ за инвестиции и покупку недвижимости в Португалии, Греции, на Кипре, Мальте и в ОАЭ. Один партнёр на юрисдикцию, без перепродажи.",
    },
  },
  pl: {
    hero: {
      eyebrow: "Dla partnerów",
      heading: "Zapytania o rezydencję i nieruchomości w Twojej jurysdykcji",
      intro: "moveandinvest to niezależne porównanie ścieżek dla osób prywatnych: rezydencja za inwestycję, reżim podatkowy i zakup nieruchomości w Portugalii, Grecji, na Cyprze, Malcie i w ZEA. Czytelnik wybiera kraj, podaje budżet, termin i cel — i zostawia kontakt. To zapytanie trafia do jednego partnera w danym kraju.",
      principles: [
      {
        title: "Jeden partner na jurysdykcję",
        body: "Zapytanie nie trafia do drugiego odbiorcy i nigdy nie jest odsprzedawane.",
      },
      {
        title: "Bez prowizji od transakcji",
        body: "Nie uczestniczymy w Twoim honorarium i nie rościmy sobie procentu.",
      },
      {
        title: "Warunki podajesz Ty",
        body: "Na stronie nie ma cennika: najpierw pytamy rynek, potem liczymy.",
      },
      ],
      ctaLabel: "Omówić warunki",
    },
    anatomy: {
      eyebrow: "Zapytanie",
      heading: "Co jest w zapytaniu",
      intro: "Poniżej wzór, a nie prawdziwe zgłoszenie: strona startuje i nie mamy jeszcze czego ani po co pokazywać. Struktura jest jednak prawdziwa — dokładnie te sześć pól trafia na pocztę, w tej kolejności, bez naszej obróbki. Niczego nie dopisujemy od siebie i niczego nie wycinamy: przeczytasz to, co człowiek napisał własnymi słowami.",
      sampleLabel: "Jak wygląda zapytanie",
      sampleTag: "próbka",
      fields: [
      {
        label: "Jurysdykcja",
        sample: "Portugalia",
        note: "Konkretny kraj, a nie «gdzieś w Europie». Czytelnik doszedł do niego przez tabelę z kwotami i terminami, a nie przez reklamę.",
      },
      {
        label: "Pułap budżetu",
        sample: "do \u20AC500 000",
        note: "Nie «ile jesteś gotów zainwestować», lecz górna granica. Sformułowanie jest celowe: nie zachęca do podania wyższej liczby.",
      },
      {
        label: "Termin",
        sample: "do pół roku",
        note: "Jedna z czterech odpowiedzi, w tym «na razie tylko się rozglądam». Nie ukrywamy tej opcji: zapytanie na pół roku naprzód, przekazane jako gorące, kosztuje Twój czas.",
      },
      {
        label: "Cel",
        sample: "rezydencja dla rodziny \u00B7 nieruchomość jako inwestycja",
        note: "Można zaznaczyć kilka: rezydencja dla rodziny, pozycja podatkowa, paszport UE w perspektywie, biznes i bank, nieruchomość jako inwestycja. To zestawienie czyni sprawę konkretną.",
      },
      {
        label: "Własnymi słowami",
        sample: "«Obywatelstwo Białorusi, rodzina czteroosobowa, dochód z UE. Patrzyliśmy na fundusze, ale chcemy zrozumieć, co realnie daje zakup mieszkania.»",
        note: "Obywatelstwo, skład rodziny, skąd dochód, co już próbowali. Pole nieobowiązkowe — i to ono najczęściej decyduje, czy sprawa jest warta Twojej godziny.",
      },
      {
        label: "Imię i e-mail",
        sample: "Człowiek się przedstawia",
        note: "Odpowiadasz nie «zapytaniu nr 1428», lecz osobie z imienia, która godzinę temu czytała o Portugalii. Gotowość, by się przedstawić, sama w sobie jest filtrem.",
      },
      ],
      note: "Nie weryfikujemy ani budżetu, ani źródła środków, ani gotowości do działania. To słowa człowieka o sobie. «Kwalifikowane» znaczy tu «na pytania odpowiedziano», a nie «dane potwierdzono» — weryfikacja należy do Ciebie, a my nie udajemy, że zrobiliśmy ją za Ciebie.",
    },
    journey: {
      eyebrow: "Ścieżka",
      heading: "Jak człowiek dochodzi do zapytania",
      intro: "Zgłoszenie to ostatni krok czytania, a nie pierwszy ekran z wyskakującym formularzem. Czytelnik najpierw widzi tabelę pięciu jurysdykcji, potem wchodzi na stronę jednej z nich, odpowiada na trzy pytania doboru i dopiero wtedy dochodzi do formularza. Na całej tej drodze nie ma miejsca, w którym obiecywalibyśmy coś w twoim imieniu albo podawali terminy, których sami nie sprawdziliśmy.",
      steps: [
        {
          title: "Czyta porównanie",
          body: "Pięć jurysdykcji w jednej tabeli: ścieżka, próg wejścia, czas do pierwszego zezwolenia, reżim podatkowy — ze źródłem i datą weryfikacji.",
        },
        {
          title: "Przechodzi dobór ścieżki",
          body: "Odpowiada o budżecie, terminie i priorytecie i dostaje kraj, który tym warunkom odpowiada. Jeśli nie odpowiada żaden — serwis tak właśnie mówi i pokazuje, z czego trzeba będzie zrezygnować.",
        },
        {
          title: "Odpowiada na cztery pytania",
          body: "I opisuje sytuację własnymi słowami. Odpowiedzi z doboru trafiają do formularza same, żeby nie pytać dwa razy.",
        },
        {
          title: "Zapytanie trafia do jednego",
          body: "Do jednego partnera w tym kraju. Nie do drugiego odbiorcy i nigdy na odsprzedaż.",
        },
      ],
      note: "Na stronie nie ma ani jednego wyskakującego okna. Formularz stoi na dole strony, a dojście do niego to decyzja czytelnika, a nie skutek tego, że zasłoniliśmy mu tekst.",
    },
    honesty: {
      eyebrow: "Wprost",
      heading: "Czego nie obiecujemy",
      intro: "To nie skromność. Wszystko to sam ustalisz w drugim tygodniu — lepiej przeczytać teraz i decydować z otwartymi oczami. Strona jest młoda, ruchu jeszcze nie ma i nie podamy liczby zgłoszeń miesięcznie, bo jej nie znamy. Poniżej najpierw to, czego nie będzie, i dopiero potem to, co naprawdę bierzemy na siebie: odwrotna kolejność czytałaby się jak reklama.",
      notLabel: "Nie obiecujemy",
      notItems: [
        {
          title: "Wolumenu",
          body: "Serwis dopiero startuje i ruchu jeszcze nie ma. Rozmawiamy z kancelariami przed wolumenem celowo: warunki ustalone przy pustym stole są uczciwsze niż wytargowane przy pełnym.",
        },
        {
          title: "Konwersji na klienta",
          body: "Zapytanie to rozmowa, a nie transakcja. Co z niego wyniknie, zależy od Twojej odpowiedzi i Twojej ceny, a na to nie mamy wpływu.",
        },
        {
          title: "Weryfikacji danych",
          body: "Ani budżetu, ani źródła środków, ani tożsamości. Przekazujemy to, co człowiek napisał o sobie.",
        },
        {
          title: "Oceny prawnej",
          body: "Nie jesteśmy prawnikami, nie doradzamy i nie wydajemy opinii o tym, czy dany program pasuje do sprawy. Nic na tej stronie nie jest poradą prawną ani podatkową.",
        },
      ],
      yesLabel: "Obiecujemy",
      yesItems: [
        {
          title: "Jednemu",
          body: "Zapytanie z danego kraju trafia do jednego partnera i nigdy nie jest odsprzedawane — ani innemu prawnikowi, ani giełdzie leadów, ani nikomu.",
        },
        {
          title: "Tylko za zgodą",
          body: "Przekazujemy wyłącznie wtedy, gdy człowiek zaznaczył zgodę. Bez niej zapytanie zostaje u nas.",
        },
        {
          title: "Usunięcie na żądanie",
          body: "U nas, i z prośbą do Ciebie o to samo.",
        },
      ],
    },
    contact: {
      eyebrow: "Pytanie",
      heading: "Teraz nasze pytanie",
      intro: "Cennika na tej stronie nie ma celowo. Nie wiemy, ile warte jest takie zgłoszenie — publicznych cen w tej niszy nie ma — i wolimy zapytać, niż podać liczbę, a potem tłumaczyć, skąd się wzięła. Dlatego trzy pytania poniżej dotyczą ciebie, a nie nas: gdzie pracujesz, ile zgłoszeń obsłużysz bez utraty jakości odpowiedzi i na jakich warunkach. Na każdą wiadomość odpowiadamy w ciągu dwóch dni roboczych.",
      questions: [
        "Czy kupujecie przychodzące zapytania?",
        "Ile płacicie za kwalifikowane — jeśli wasze zasady w ogóle pozwalają płacić?",
        "Na jakich warunkach — wyłączność, okno na odmowę, wymiana nietrafionego?",
      ],
      jurisdictionLabel: "Jurysdykcja",
      severalLabel: "Kilka",
      orgLabel: "Typ organizacji",
      orgOptions: ["Kancelaria prawna", "Agencja relokacyjna", "Deweloper", "Agencja nieruchomości"],
      nameLabel: "Imię",
      emailLabel: "E-mail",
      termsLabel: "Na jakich warunkach pracujecie z przychodzącymi zapytaniami",
      honeypotLabel: "Referencja (zostaw puste)",
      submitLabel: "Odpowiedz",
      fine: "Odpowiadamy sami, w ciągu dwóch dni roboczych. Twoja odpowiedź do niczego nie zobowiązuje i nie jest publikowana. Nie świadczymy usług prawnych i nie uczestniczymy w relacji między Tobą a klientem.",
      sentTitle: "Dziękujemy.",
      sentBody: "Czytamy każdą odpowiedź i odpisujemy w ciągu dwóch dni roboczych, od człowieka, nie z szablonu. Jeśli odpowiedzi nie ma — sprawdź folder spam, zanim uznasz, że zgubiliśmy wiadomość.",
      brokeTitle: "To już nasza wina.",
      brokeBody: "Odpowiedź się nie zapisała i przyczyna jest po naszej stronie, nie w tym, co napisałeś. Spróbuj jeszcze raz za minutę albo napisz na office@moveandinvest.com — trafi w to samo miejsce.",
      failedTitle: "Nie wysłało się.",
      failedBody: "Adres e-mail i odpowiedź w ostatnim polu to dwie rzeczy, bez których nie możemy nic zrobić. Uzupełnij oba i spróbuj ponownie — reszta tego, co wpisałeś, nie przepadła.",
    },
    seo: {
      metaTitle: "Dla partnerów — moveandinvest",
      metaDescription: "Zapytania o rezydencję za inwestycję i zakup nieruchomości w Portugalii, Grecji, na Cyprze, Malcie i w ZEA. Jeden partner na jurysdykcję, bez odsprzedaży.",
    },
  },
};
