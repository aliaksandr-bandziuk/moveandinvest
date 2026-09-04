// Every string the site renders, for all three locales, in the shape the
// Sanity schema stores it.
//
// ONE COPY, TWO CONSUMERS. `scripts/seed.ts` writes it into an empty dataset;
// `scripts/content.ts` patches it onto documents that are already published.
// Those two used to hold their own copies of the same paragraphs, which is
// how a fix lands in one of them and not the other. If a third consumer ever
// appears, it imports from here too.
//
// This file is DATA, not the source of truth. Once the copy is in Sanity, the
// Studio is where it gets edited; this stays as the reproducible starting
// point for a fresh dataset and for the one-off migration.

export type Locale = "en" | "ru" | "pl";
export const LOCALES: Locale[] = ["en", "ru", "pl"];

export interface HomeCopy {
  hero: {
    eyebrow: string;
    updatedLabel: string;
    heading: string;
    intro: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    contentsLabel: string;
    tableEyebrow: string;
    tableHeading: string;
    tableIntro: string;
    tableDetailLabel: string;
    tableScrollHint: string;
    columns: Record<
      "jurisdiction" | "route" | "minimumInvestment" | "timeToPermit" | "taxRegime",
      string
    >;
    sourcePending: string;
    pendingLabel: string;
    pendingNote: string;
  };
  method: {
    eyebrow: string;
    heading: string;
    intro: string;
    points: { title: string; body: string }[];
  };
  map: Record<"eyebrow" | "heading" | "intro" | "note", string>;
  cost: Record<
    | "eyebrow"
    | "heading"
    | "intro"
    | "advertisedLabel"
    | "extrasLabel"
    | "realLabel"
    | "noteLabel"
    | "note",
    string
  >;
  routeFinder: {
    eyebrow: string;
    heading: string;
    intro: string;
    questions: {
      budget: Record<"legend" | "upTo500" | "upTo800" | "any", string>;
      speed: Record<"legend" | "fast" | "half" | "any", string>;
      priority: Record<"legend" | "passport" | "tax" | "speed", string>;
    };
    placeholder: string;
    ctaLabel: string;
    rows: Record<"advertised" | "extras" | "real" | "permit" | "tax", string>;
    templates: Record<"count" | "compromise" | "cutBudget" | "cutSpeed" | "cutPriority", string>;
    relaxWords: Record<"budget" | "speed" | "priority", string>;
    pending: string;
    unverified: string;
  };
  faq: Record<
    | "eyebrow"
    | "heading"
    | "intro"
    | "allLabel"
    | "filterLegend"
    | "countTemplate"
    | "note",
    string
  >;
  partnerTeaser: {
    eyebrow: string;
    heading: string;
    body: string;
    ctaLabel: string;
    qualifiersLabel: string;
    qualifiers: string[];
  };
  enquiry: {
    eyebrow: string;
    heading: string;
    intro: string;
    fork: Record<
      "chosenLabel" | "chosenBody" | "openLabel" | "openBody" | "undecidedOption" | "otherOption",
      string
    >;
    budget: Record<"label" | "upTo500" | "upTo800" | "over800" | "unknown", string>;
    timeline: Record<"label" | "fast" | "halfYear" | "year" | "browsing", string>;
    goals: Record<
      "label" | "hint" | "residency" | "tax" | "passport" | "business" | "property",
      string
    >;
    contact: Record<
      | "situationLabel"
      | "situationHint"
      | "contactLabel"
      | "nameLabel"
      | "emailLabel"
      | "consentLabel"
      | "honeypotLabel"
      | "submitLabel",
      string
    >;
    fine: string;
    privacyLabel: string;
    result: Record<
      "sentTitle" | "sentBody" | "failedTitle" | "failedBody" | "brokeTitle" | "brokeBody",
      string
    >;
  };
  seo: { metaTitle: string; metaDescription: string };
}


export const HOME_COPY: Record<Locale, HomeCopy> = {
  en: {
    hero: {
      eyebrow: "Independent research",
      updatedLabel: "Updated 15 Aug 2026",
      columns: {
        jurisdiction: "Jurisdiction",
        route: "Route",
        minimumInvestment: "From",
        timeToPermit: "First permit",
        taxRegime: "Tax regime",
      },
      sourcePending: "Sources are added as each jurisdiction page is verified.",
      pendingLabel: "In fact-checking",
      pendingNote: "Every figure is verified against a primary source before it appears here. The table goes live one jurisdiction at a time, as each is confirmed.",
      heading: "Where to move, and what it actually costs",
      intro: "Residency routes, tax regimes and property rules in five jurisdictions — compared on the same four questions, sourced, and dated. No brochures, no brokers.",
      primaryCta: { label: "Compare jurisdictions", href: "#enquiry" },
      secondaryCta: { label: "For partners", href: "/for-partners" },
      contentsLabel: "On this page",
      tableEyebrow: "Comparison",
      tableHeading: "Residency by investment, 2026",
      tableIntro: "One row per jurisdiction and the same four columns for all of them: the route, the entry threshold, the time to a first permit and the tax regime. Where a threshold varies by region or property type, that jurisdiction's own page says so and this table carries the lower bound. Cyprus is listed without figures — we do not publish what we have not checked against a primary source.",
      tableDetailLabel: "Full comparison",
      tableScrollHint: "Two more columns: first permit and tax",
    },
    method: {
      eyebrow: "Method",
      heading: "How the comparison is built",
      intro: "Four questions, one method, applied the same way to five jurisdictions. We take no percentage of any transaction and sell no property, so no developer can buy a better place in the table. The figures come from statutes and official tariffs rather than agency brochures, and they are revised when a rule changes, not on a schedule.",
      points: [
      { title: "Four questions, not forty", body: "Route, threshold, time to a first permit, tax regime. They are the only four that change a decision; everything else is detail that belongs on the jurisdiction's own page." },
      { title: "Primary sources only", body: "Government texts and official fee schedules, never agency brochures. Every page names its source and the date it was checked." },
      { title: "Re-checked when the rules move", body: "Not on a calendar. Thresholds in this category change several times a year, and a table dated last spring is worse than no table." },
      { title: "No commission on a sale", body: "We do not sell property, take no percentage of any transaction, and no developer can buy a better position in this table. The comparison is built the same way whether or not anybody pays us." },
      ],
    },
    map: {
      eyebrow: "Jurisdictions",
      heading: "Five jurisdictions, five different bets",
      intro: "The same four questions for each of them. Which one fits depends less on the entry threshold than on what you are actually buying: time, a passport, or a tax position. Greece is the cheapest to enter and the more expensive to hold; the UAE is the fastest and offers no route to a European passport. Below is one card per jurisdiction, each leading to its own page.",
      note: "Each outline is drawn to the size of its card, so Malta appears as large as Portugal: these are identifying marks, not a map. Boundaries are simplified for legibility and are not a statement about any border.",
    },
    cost: {
      eyebrow: "The real number",
      heading: "The threshold is not the price",
      intro: "Every comparison in this niche publishes the entry threshold. Almost nobody publishes what it costs to get through it: transfer taxes, legal and registration fees, government charges and the first renewal are not optional — everyone pays them, every time. Below, both figures stand side by side, jurisdiction by jurisdiction, and the third is what you will actually spend in the first year.",
      advertisedLabel: "Advertised",
      extrasLabel: "Everything else",
      realLabel: "Real, first year",
      noteLabel: "Sources",
      note: "All figures in euro, converted where a jurisdiction sets its threshold in another currency, and checked against primary sources. A jurisdiction appears here only once both of its figures have been verified.",
    },
    routeFinder: {
      eyebrow: "Find your route",
      heading: "Three questions instead of an hour-long consultation",
      intro: "We ask for no name, no address and nothing about what is in your account. Three questions — the budget ceiling, how soon you need a first permit, and what matters most to you — and the summary rebuilds here: the real first-year cost, the timings and the tax position. Its figures are the ones in the table above, from the same primary sources. Nothing is sent anywhere until you press the button yourself.",
      questions: {
        budget: {
          legend: "Budget ceiling",
          upTo500: "up to €500,000",
          upTo800: "up to €800,000",
          any: "over €800,000",
        },
        speed: {
          legend: "When you need the first permit",
          fast: "within a few weeks",
          half: "within six months",
          any: "a year or more, no rush",
        },
        priority: {
          legend: "What matters most",
          passport: "a path to an EU passport",
          tax: "the tax position",
          speed: "speed and minimal paperwork",
        },
      },
      placeholder: "Answer the questions on the left and the summary assembles here: the real first-year cost, the time to a first permit, and the tax position.",
      ctaLabel: "Get the breakdown",
      rows: {
        advertised: "Advertised",
        extras: "Everything else, first year",
        real: "Real, first year",
        permit: "First permit",
        tax: "Tax",
      },
      templates: {
        count: "{n} of {total} routes fit",
        compromise: "Nothing fits all three — the closest, if you move {relax}",
        cutBudget: "{names}: above your ceiling once the real cost is counted",
        cutSpeed: "{names}: slower than your deadline",
        cutPriority: "{names}: strong on other things",
      },
      relaxWords: {
        budget: "the budget",
        speed: "the deadline",
        priority: "the priority",
      },
      pending: "This jurisdiction's page is still in fact-checking.",
      unverified: "not verified",
    },
    faq: {
      eyebrow: "Common questions",
      heading: "Six questions usually answered evasively",
      intro: "These are the questions this niche usually answers evasively: what the threshold includes, who pays for renewals, whether we take a commission, and why one country is not in the table yet. The answers are short, checked against primary sources, and each carries the date it was verified. None of them is legal advice — rules change, and your case may not reduce to them.",
      allLabel: "All",
      filterLegend: "Filter questions by jurisdiction",
      countTemplate: "Showing {n} of {total} — questions tagged to this jurisdiction only. Select “All” for the general ones.",
      note: "Answers are checked against primary sources and dated. None of them is legal advice — rules change, and your case may not reduce to them.",
    },
    enquiry: {
      eyebrow: "Enquiry",
      heading: "Do you know the country — or not yet?",
      intro: "The form sits at the foot of the page rather than in a pop-up, and that is deliberate: figures first, conversation after. Only one field is required — an address to reply to. The rest is there so we can hand you to a lawyer who works on cases like yours rather than to a call centre: the more specific the case, the shorter the first answer. An enquiry goes only to a partner working in the chosen jurisdiction, and only if the consent box is ticked.",
      fork: {
        chosenLabel: "Country chosen",
        chosenBody: "The enquiry goes to the lawyer who handles that jurisdiction.",
        openLabel: "Not yet",
        openBody: "Then we work out the case first and show you what there is to choose between.",
        undecidedOption: "Still deciding",
        otherOption: "A country not listed",
      },
      budget: {
        label: "Budget ceiling",
        upTo500: "up to €500,000",
        upTo800: "up to €800,000",
        over800: "over €800,000",
        unknown: "not sure yet",
      },
      timeline: {
        label: "When",
        fast: "within a few weeks",
        halfYear: "within six months",
        year: "a year or more",
        browsing: "just looking for now",
      },
      goals: {
        label: "What you are actually after",
        hint: "Pick as many as apply — the combination is what makes a case specific.",
        residency: "residency for the family",
        tax: "tax position",
        passport: "an EU passport in time",
        business: "business and banking",
        property: "property as an investment",
      },
      contact: {
        situationLabel: "Your situation",
        situationHint: "Citizenship, family, where the income comes from, what you have already tried — everything that did not fit above.",
        contactLabel: "How to reach you",
        nameLabel: "Name",
        emailLabel: "Email",
        consentLabel: "I agree that my enquiry may be passed to a specialist partner",
        honeypotLabel: "Reference (leave empty)",
        submitLabel: "Send enquiry",
      },
      privacyLabel: "What we do with your data →",
      fine: "We reply within two working days. Enquiries are passed only to partners working in the jurisdiction you selected, and only if you tick the box above. You can ask us to delete your data at any time.",
      result: {
        sentTitle: "Sent.",
        sentBody: "We reply within two working days, from a person, not a template. If you do not hear back, check the spam folder before assuming we lost it.",
        failedTitle: "That did not go through.",
        failedBody: "An email address and the consent box are the two things we cannot proceed without. Fill both and try again — nothing else you typed was lost.",
        brokeTitle: "That one is on us.",
        brokeBody: "Your enquiry did not save, and the fault is at our end rather than in anything you filled in. Nothing you typed was lost — try once more in a minute, or write to office@moveandinvest.com and we will pick it up from there.",
      },
    },
    partnerTeaser: {
      eyebrow: "For partners",
      ctaLabel: "Partner terms",
      qualifiersLabel: "Answered before it reaches you",
      qualifiers: ["Jurisdiction", "Budget", "Timeline", "Goal"],
      heading: "For law firms and relocation advisers",
      body: "An enquiry arrives with its questions already answered — jurisdiction, budget, timing, goal — and with what the person wrote in their own words. Before sending it they went through the four-question comparison and a jurisdiction page, so they are asking already knowing what they are asking about. Paid per qualified lead where your profession permits it, and free where it does not — on Malta, in the UAE and in Portugal a lawyer may not pay for an introduction, and there we ask for nothing. We take no part in your fee either way.",
    },
    seo: {
      metaTitle: "Relocation and property in five jurisdictions — moveandinvest",
      metaDescription: "Compare residency routes, minimum investment, time to a first permit and tax regimes across Portugal, Greece, Malta, the UAE and Cyprus.",
    },
  },
  ru: {
    hero: {
      eyebrow: "Независимое исследование",
      updatedLabel: "Обновлено 15 авг 2026",
      columns: {
        jurisdiction: "Юрисдикция",
        route: "Маршрут",
        minimumInvestment: "От",
        timeToPermit: "Первый пермит",
        taxRegime: "Налоговый режим",
      },
      sourcePending: "Источники добавляются по мере проверки каждой страницы юрисдикции.",
      pendingLabel: "Идёт проверка фактов",
      pendingNote: "Каждая цифра сверяется с первоисточником, прежде чем появится здесь. Таблица выходит по одной юрисдикции, по мере подтверждения.",
      heading: "Куда переехать и сколько это стоит на самом деле",
      intro: "Маршруты резидентства, налоговые режимы и правила покупки недвижимости в пяти юрисдикциях — сравнение по одним и тем же четырём вопросам, со ссылками на источники и датой проверки. Без брошюр и посредников.",
      primaryCta: { label: "Сравнить юрисдикции", href: "#enquiry" },
      secondaryCta: { label: "Партнёрам", href: "/for-partners" },
      contentsLabel: "На этой странице",
      tableEyebrow: "Сравнение",
      tableHeading: "Резидентство за инвестиции, 2026",
      tableIntro: "Одна строка на юрисдикцию, одни и те же четыре колонки для всех: маршрут, порог входа, срок до первого пермита и налоговый режим. Если порог зависит от региона или типа объекта, об этом сказано на странице самой юрисдикции, а здесь стоит нижняя граница. Кипр в таблице есть, но без цифр — мы не публикуем то, чего не сверили с первоисточником.",
      tableDetailLabel: "Полное сравнение",
      tableScrollHint: "Ещё две колонки: пермит и налоги",
    },
    method: {
      eyebrow: "Метод",
      heading: "Как устроено сравнение",
      intro: "Четыре вопроса, один метод, одинаково применённый к пяти юрисдикциям. Мы не берём процент со сделки и не продаём недвижимость, поэтому ни один застройщик не может купить себе место повыше в таблице. Цифры приходят из текстов законов и официальных тарифов, а не из брошюр агентств, и пересматриваются тогда, когда меняется правило, а не по календарю.",
      points: [
      { title: "Четыре вопроса, а не сорок", body: "Маршрут, порог входа, срок до первого пермита, налоговый режим. Только эти четыре меняют решение; остальное — детали, и им место на странице самой юрисдикции." },
      { title: "Только первоисточники", body: "Тексты законов и официальные тарифы, а не брошюры агентств. На каждой странице указан источник и дата, когда цифру проверяли." },
      { title: "Пересматриваем, когда меняется правило", body: "А не по календарю. Пороги в этой нише меняются по нескольку раз в год, и таблица с прошлогодней датой хуже, чем её отсутствие." },
      { title: "Без комиссии со сделки", body: "Мы не продаём недвижимость, не берём процент с транзакции, и ни один застройщик не может купить себе место повыше в этой таблице. Сравнение строится одинаково независимо от того, платит нам кто-нибудь или нет." },
      ],
    },
    map: {
      eyebrow: "Юрисдикции",
      heading: "Пять юрисдикций, пять разных ставок",
      intro: "Одни и те же четыре вопроса для каждой. Какая подходит, зависит не столько от порога входа, сколько от того, что вы на самом деле покупаете: время, паспорт или налоговую позицию. Греция дешевле всех на входе и дороже в удержании; ОАЭ быстрее всех и не дают пути к европейскому паспорту. Ниже — по карточке на юрисдикцию, каждая ведёт на свою страницу.",
      note: "Каждый контур приведён к размеру своей карточки, поэтому Мальта выглядит не меньше Португалии: это опознавательный знак, а не масштаб. Границы упрощены ради читаемости и не являются утверждением о чьих-либо рубежах.",
    },
    cost: {
      eyebrow: "Настоящая цифра",
      heading: "Порог входа — это не цена",
      intro: "Каждое сравнение в этой нише публикует порог входа. Почти никто не публикует, во сколько обходится его пройти: налоги на переход права, юридические и регистрационные сборы, государственные пошлины и первое продление не являются необязательными — их платят все и всегда. Ниже обе цифры стоят рядом, юрисдикция за юрисдикцией, и третьей идёт сумма, которую вы действительно потратите за первый год.",
      advertisedLabel: "Заявлено",
      extrasLabel: "Всё остальное",
      realLabel: "Реально, первый год",
      noteLabel: "Источники",
      note: "Все суммы в евро, с пересчётом там, где порог установлен в другой валюте, и сверены с первоисточниками. Юрисдикция появляется здесь только после проверки обеих цифр.",
    },
    routeFinder: {
      eyebrow: "Подбор маршрута",
      heading: "Три вопроса вместо часовой консультации",
      intro: "Мы не спрашиваем ни имени, ни почты, ни того, сколько у вас на счету. Три вопроса — потолок бюджета, срок до первого пермита и то, что для вас важнее всего, — и сводка пересобирается прямо здесь: реальная стоимость первого года, сроки и налоговая позиция. Цифры в ней те же, что в таблице выше, и взяты из тех же первоисточников. Ничего никуда не отправляется, пока вы сами не нажмёте кнопку.",
      questions: {
        budget: {
          legend: "Потолок бюджета",
          upTo500: "до €500 000",
          upTo800: "до €800 000",
          any: "больше €800 000",
        },
        speed: {
          legend: "Когда нужен первый пермит",
          fast: "за несколько недель",
          half: "до полугода",
          any: "год и больше, не горит",
        },
        priority: {
          legend: "Что важнее всего",
          passport: "путь к паспорту ЕС",
          tax: "налоговая позиция",
          speed: "скорость и минимум бумаг",
        },
      },
      placeholder: "Ответьте на вопросы слева — сводка соберётся здесь: реальная стоимость первого года, срок до первого пермита и налоговая позиция.",
      ctaLabel: "Получить разбор",
      rows: {
        advertised: "Порог",
        extras: "Сверх того, первый год",
        real: "Реально, первый год",
        permit: "Первый пермит",
        tax: "Налоги",
      },
      templates: {
        count: "подходит {n} из {total}",
        compromise: "Под все три условия не подходит никто — ближайший, если сдвинуть {relax}",
        cutBudget: "{names} — выше вашего потолка, если считать реальную стоимость",
        cutSpeed: "{names} — дольше вашего срока",
        cutPriority: "{names} — сильны в другом",
      },
      relaxWords: {
        budget: "бюджет",
        speed: "срок",
        priority: "приоритет",
      },
      pending: "Страница этой юрисдикции ещё на проверке фактов.",
      unverified: "не сверено",
    },
    faq: {
      eyebrow: "Частые вопросы",
      heading: "Шесть вопросов, на которые обычно отвечают уклончиво",
      intro: "Здесь собраны вопросы, на которые в этой нише обычно отвечают уклончиво: что входит в порог, кто платит за продление, берём ли мы комиссию и почему одной страны в таблице пока нет. Ответы короткие, сверены с первоисточниками, и у каждого стоит дата проверки. Ни один из них не является юридической консультацией — правила меняются, а ваш случай может к ним не сводиться.",
      allLabel: "Все",
      filterLegend: "Фильтр вопросов по юрисдикции",
      countTemplate: "Показано {n} из {total} — только вопросы, отмеченные для этой юрисдикции. Общие — на «Все».",
      note: "Ответы сверяются с первоисточниками и датируются. Ни один из них не является юридической консультацией — правила меняются, а ваш случай может к ним не сводиться.",
    },
    enquiry: {
      eyebrow: "Заявка",
      heading: "Знаете страну — или пока нет?",
      intro: "Форма стоит внизу страницы, а не во всплывающем окне, и это осознанно: сначала цифры, потом разговор. Обязательное здесь одно — почта для ответа. Всё остальное нужно затем, чтобы передать вас профильному юристу, а не в общий колл-центр: чем конкретнее случай, тем короче будет первый ответ. Заявку передаём только партнёру, работающему в выбранной юрисдикции, и только если стоит галочка согласия.",
      fork: {
        chosenLabel: "Страна выбрана",
        chosenBody: "Заявка уходит юристу, который ведёт эту юрисдикцию.",
        openLabel: "Ещё нет",
        openBody: "Тогда сначала разберём случай и покажем, из чего вообще выбирать.",
        undecidedOption: "Ещё не определился",
        otherOption: "Другая страна",
      },
      budget: {
        label: "Потолок бюджета",
        upTo500: "до €500 000",
        upTo800: "до €800 000",
        over800: "больше €800 000",
        unknown: "пока не знаю",
      },
      timeline: {
        label: "Когда",
        fast: "за несколько недель",
        halfYear: "до полугода",
        year: "год и больше",
        browsing: "пока просто смотрю",
      },
      goals: {
        label: "Что вам на самом деле нужно",
        hint: "Можно отметить несколько — именно сочетание делает случай конкретным.",
        residency: "ВНЖ для семьи",
        tax: "налоговая позиция",
        passport: "паспорт ЕС в перспективе",
        business: "бизнес и банк",
        property: "недвижимость как инвестиция",
      },
      contact: {
        situationLabel: "Ваша ситуация",
        situationHint: "Гражданство, состав семьи, откуда доход, что уже пробовали — всё, что не влезло в пункты выше.",
        contactLabel: "Как связаться",
        nameLabel: "Имя",
        emailLabel: "Почта",
        consentLabel: "Согласен, чтобы мою заявку передали профильному партнёру",
        honeypotLabel: "Референс (оставьте пустым)",
        submitLabel: "Отправить заявку",
      },
      privacyLabel: "Что мы делаем с вашими данными →",
      fine: "Отвечаем в течение двух рабочих дней. Заявку передаём только партнёрам, работающим в выбранной юрисдикции, и только если отмечена галочка выше. Удалить свои данные можно в любой момент — напишите нам.",
      result: {
        sentTitle: "Отправлено.",
        sentBody: "Ответим в течение двух рабочих дней, человеком, а не шаблоном. Если ответа нет — загляните в спам, прежде чем решить, что мы потеряли письмо.",
        failedTitle: "Не отправилось.",
        failedBody: "Почта и галочка согласия — два пункта, без которых мы не можем ничего сделать. Заполните оба и отправьте снова: остальное, что вы написали, никуда не делось.",
        brokeTitle: "Это уже наша вина.",
        brokeBody: "Заявка не сохранилась, и дело не в том, что вы заполнили, а в нашей стороне. Написанное никуда не делось — попробуйте ещё раз через минуту или напишите на office@moveandinvest.com, дальше разберёмся сами.",
      },
    },
    partnerTeaser: {
      eyebrow: "Партнёрам",
      ctaLabel: "Условия для партнёров",
      qualifiersLabel: "Что заявка отвечает до вас",
      qualifiers: ["Юрисдикция", "Бюджет", "Срок", "Цель"],
      heading: "Юридическим фирмам и релокационным консультантам",
      body: "Заявка приходит с уже отвеченными вопросами — юрисдикция, бюджет, срок, цель — и с тем, что человек написал своими словами. До неё он прошёл сравнение по четырём вопросам и страницу юрисдикции, то есть спрашивает, уже понимая, о чём спрашивает. Оплата за квалифицированный лид там, где это позволяет ваша профессия, и бесплатно там, где не позволяет: на Мальте, в ОАЭ и в Португалии юрист не вправе платить за знакомство, и там мы не просим ничего. В вашем гонораре мы не участвуем в любом случае.",
    },
    seo: {
      metaTitle: "ВНЖ за инвестиции и недвижимость: пять юрисдикций — moveandinvest",
      metaDescription: "Сравнение маршрутов резидентства, минимальных инвестиций, сроков до первого пермита и налоговых режимов: Португалия, Греция, Мальта, ОАЭ, Кипр.",
    },
  },
  pl: {
    hero: {
      eyebrow: "Niezależne opracowanie",
      updatedLabel: "Zaktualizowano 15 sie 2026",
      columns: {
        jurisdiction: "Jurysdykcja",
        route: "Ścieżka",
        minimumInvestment: "Od",
        timeToPermit: "Pierwsze zezwolenie",
        taxRegime: "Reżim podatkowy",
      },
      sourcePending: "Źródła są dodawane w miarę weryfikacji kolejnych stron jurysdykcji.",
      pendingLabel: "W trakcie weryfikacji",
      pendingNote: "Każda liczba jest sprawdzana ze źródłem pierwotnym, zanim się tu pojawi. Tabela pojawia się po jednej jurysdykcji, w miarę potwierdzania.",
      heading: "Dokąd się przeprowadzić i ile to naprawdę kosztuje",
      intro: "Ścieżki rezydencji, reżimy podatkowe i zasady nabywania nieruchomości w pięciu jurysdykcjach — porównane według tych samych czterech pytań, ze źródłami i datą weryfikacji. Bez broszur i pośredników.",
      primaryCta: { label: "Porównaj jurysdykcje", href: "#enquiry" },
      secondaryCta: { label: "Dla partnerów", href: "/for-partners" },
      contentsLabel: "Na tej stronie",
      tableEyebrow: "Porównanie",
      tableHeading: "Rezydencja za inwestycję, 2026",
      tableIntro: "Jeden wiersz na jurysdykcję i te same cztery kolumny dla wszystkich: ścieżka, próg wejścia, czas do pierwszego pozwolenia i reżim podatkowy. Jeśli próg zależy od regionu lub rodzaju nieruchomości, mówi o tym strona danej jurysdykcji, a tutaj podana jest dolna granica. Cypr jest na liście bez liczb — nie publikujemy tego, czego nie potwierdziliśmy u źródła.",
      tableDetailLabel: "Pełne porównanie",
      tableScrollHint: "Jeszcze dwie kolumny: pozwolenie i podatki",
    },
    method: {
      eyebrow: "Metoda",
      heading: "Jak zbudowane jest porównanie",
      intro: "Cztery pytania, jedna metoda, zastosowana tak samo do pięciu jurysdykcji. Nie bierzemy procentu od transakcji i nie sprzedajemy nieruchomości, więc żaden deweloper nie kupi sobie wyższego miejsca w tabeli. Liczby pochodzą z tekstów ustaw i oficjalnych taryf, a nie z broszur agencji, i są aktualizowane wtedy, gdy zmienia się przepis, a nie według kalendarza.",
      points: [
      { title: "Cztery pytania, nie czterdzieści", body: "Ścieżka, próg wejścia, czas do pierwszego zezwolenia, reżim podatkowy. Tylko te cztery zmieniają decyzję; reszta to szczegóły, których miejsce jest na stronie danej jurysdykcji." },
      { title: "Wyłącznie źródła pierwotne", body: "Teksty ustaw i oficjalne taryfy, nigdy broszury agencji. Każda strona podaje swoje źródło i datę weryfikacji." },
      { title: "Aktualizacja, gdy zmienia się przepis", body: "Nie według kalendarza. Progi w tej kategorii zmieniają się kilka razy w roku, a tabela z zeszłoroczną datą jest gorsza niż jej brak." },
      { title: "Bez prowizji od transakcji", body: "Nie sprzedajemy nieruchomości, nie bierzemy procentu od transakcji i żaden deweloper nie kupi sobie lepszej pozycji w tej tabeli. Porównanie powstaje tak samo niezależnie od tego, czy ktoś nam płaci." },
      ],
    },
    map: {
      eyebrow: "Jurysdykcje",
      heading: "Pięć jurysdykcji, pięć różnych zakładów",
      intro: "Te same cztery pytania dla każdej. To, która pasuje, zależy mniej od progu wejścia niż od tego, co naprawdę kupujesz: czas, paszport albo pozycję podatkową. Grecja jest najtańsza na wejściu i droższa w utrzymaniu; ZEA są najszybsze i nie dają drogi do paszportu europejskiego. Poniżej jedna karta na jurysdykcję, każda prowadzi na własną stronę.",
      note: "Każdy kontur dopasowano do rozmiaru swojej karty, więc Malta wygląda na nie mniejszą niż Portugalia: to znak rozpoznawczy, nie mapa. Granice są uproszczone dla czytelności i nie stanowią stanowiska wobec jakiejkolwiek granicy.",
    },
    cost: {
      eyebrow: "Prawdziwa liczba",
      heading: "Próg wejścia to nie cena",
      intro: "Każde porównanie w tej niszy publikuje próg wejścia. Prawie nikt nie publikuje, ile kosztuje jego przejście: podatki od przeniesienia praw, opłaty prawne i rejestracyjne, opłaty urzędowe oraz pierwsze przedłużenie nie są opcjonalne — płacą je wszyscy i zawsze. Poniżej obie liczby stoją obok siebie, jurysdykcja po jurysdykcji, a trzecia to kwota, którą naprawdę wydasz w pierwszym roku.",
      advertisedLabel: "Deklarowane",
      extrasLabel: "Cała reszta",
      realLabel: "Realnie, pierwszy rok",
      noteLabel: "Źródła",
      note: "Wszystkie kwoty w euro, przeliczone tam, gdzie próg ustalono w innej walucie, i zweryfikowane ze źródłami pierwotnymi. Jurysdykcja pojawia się tu dopiero po sprawdzeniu obu liczb.",
    },
    routeFinder: {
      eyebrow: "Dobór ścieżki",
      heading: "Trzy pytania zamiast godzinnej konsultacji",
      intro: "Nie pytamy o imię, o adres ani o to, ile masz na koncie. Trzy pytania — pułap budżetu, termin pierwszego pozwolenia i to, co jest dla ciebie najważniejsze — i podsumowanie składa się właśnie tutaj: rzeczywisty koszt pierwszego roku, terminy i pozycja podatkowa. Liczby są te same co w tabeli powyżej i z tych samych źródeł. Nic nigdzie nie wychodzi, dopóki sam nie naciśniesz przycisku.",
      questions: {
        budget: {
          legend: "Limit budżetu",
          upTo500: "do €500 000",
          upTo800: "do €800 000",
          any: "powyżej €800 000",
        },
        speed: {
          legend: "Kiedy potrzebne pierwsze zezwolenie",
          fast: "w ciągu kilku tygodni",
          half: "do pół roku",
          any: "rok lub więcej, bez pośpiechu",
        },
        priority: {
          legend: "Co jest najważniejsze",
          passport: "droga do paszportu UE",
          tax: "pozycja podatkowa",
          speed: "szybkość i minimum formalności",
        },
      },
      placeholder: "Odpowiedz na pytania po lewej, a podsumowanie złoży się tutaj: rzeczywisty koszt pierwszego roku, czas do pierwszego zezwolenia i pozycja podatkowa.",
      ctaLabel: "Otrzymaj analizę",
      rows: {
        advertised: "Próg",
        extras: "Ponad to, pierwszy rok",
        real: "Realnie, pierwszy rok",
        permit: "Pierwsze zezwolenie",
        tax: "Podatki",
      },
      templates: {
        count: "pasuje {n} z {total}",
        compromise: "Nic nie spełnia wszystkich trzech — najbliższa, jeśli przesuniesz {relax}",
        cutBudget: "{names} — powyżej Twojego limitu, licząc koszt rzeczywisty",
        cutSpeed: "{names} — dłużej niż Twój termin",
        cutPriority: "{names} — mocne w czym innym",
      },
      relaxWords: {
        budget: "budżet",
        speed: "termin",
        priority: "priorytet",
      },
      pending: "Strona tej jurysdykcji jest jeszcze weryfikowana.",
      unverified: "niezweryfikowane",
    },
    faq: {
      eyebrow: "Częste pytania",
      heading: "Sześć pytań, na które zwykle odpowiada się wymijająco",
      intro: "Zebrane tu pytania to te, na które w tej branży zwykle odpowiada się wymijająco: co wchodzi w próg, kto płaci za przedłużenie, czy bierzemy prowizję i dlaczego jednego kraju jeszcze nie ma w tabeli. Odpowiedzi są krótkie, sprawdzone u źródeł, a przy każdej stoi data weryfikacji. Żadna z nich nie jest poradą prawną — przepisy się zmieniają, a twój przypadek może się do nich nie sprowadzać.",
      allLabel: "Wszystkie",
      filterLegend: "Filtruj pytania według jurysdykcji",
      countTemplate: "Pokazano {n} z {total} — tylko pytania oznaczone dla tej jurysdykcji. Ogólne — pod „Wszystkie”.",
      note: "Odpowiedzi są weryfikowane ze źródłami pierwotnymi i datowane. Żadna z nich nie jest poradą prawną — przepisy się zmieniają, a Twoja sprawa może się do nich nie sprowadzać.",
    },
    enquiry: {
      eyebrow: "Zgłoszenie",
      heading: "Znasz kraj — czy jeszcze nie?",
      intro: "Formularz stoi na dole strony, a nie w wyskakującym okienku, i to jest celowe: najpierw liczby, potem rozmowa. Obowiązkowe jest jedno pole — adres do odpowiedzi. Reszta służy temu, żeby przekazać cię prawnikowi od takich spraw, a nie do call center: im konkretniejszy przypadek, tym krótsza pierwsza odpowiedź. Zgłoszenie trafia tylko do partnera pracującego w wybranej jurysdykcji i tylko jeśli zaznaczona jest zgoda.",
      fork: {
        chosenLabel: "Kraj wybrany",
        chosenBody: "Zgłoszenie trafia do prawnika prowadzącego tę jurysdykcję.",
        openLabel: "Jeszcze nie",
        openBody: "Wtedy najpierw przeanalizujemy sprawę i pokażemy, z czego można wybierać.",
        undecidedOption: "Jeszcze nie zdecydowałem",
        otherOption: "Inny kraj",
      },
      budget: {
        label: "Limit budżetu",
        upTo500: "do €500 000",
        upTo800: "do €800 000",
        over800: "powyżej €800 000",
        unknown: "jeszcze nie wiem",
      },
      timeline: {
        label: "Kiedy",
        fast: "w ciągu kilku tygodni",
        halfYear: "do pół roku",
        year: "rok lub więcej",
        browsing: "na razie tylko się rozglądam",
      },
      goals: {
        label: "Czego naprawdę potrzebujesz",
        hint: "Można zaznaczyć kilka — to połączenie czyni sprawę konkretną.",
        residency: "rezydencja dla rodziny",
        tax: "pozycja podatkowa",
        passport: "paszport UE w perspektywie",
        business: "biznes i bankowość",
        property: "nieruchomość jako inwestycja",
      },
      contact: {
        situationLabel: "Twoja sytuacja",
        situationHint: "Obywatelstwo, rodzina, skąd dochód, co już próbowaliście — wszystko, co nie zmieściło się powyżej.",
        contactLabel: "Jak się skontaktować",
        nameLabel: "Imię",
        emailLabel: "E-mail",
        consentLabel: "Zgadzam się, aby moje zgłoszenie przekazano wyspecjalizowanemu partnerowi",
        honeypotLabel: "Referencja (zostaw puste)",
        submitLabel: "Wyślij zgłoszenie",
      },
      privacyLabel: "Co robimy z Twoimi danymi →",
      fine: "Odpowiadamy w ciągu dwóch dni roboczych. Zgłoszenia przekazujemy wyłącznie partnerom działającym w wybranej jurysdykcji i tylko po zaznaczeniu powyższego pola. Usunięcie danych — w dowolnym momencie, wystarczy napisać.",
      result: {
        sentTitle: "Wysłane.",
        sentBody: "Odpowiadamy w ciągu dwóch dni roboczych, od człowieka, nie z szablonu. Jeśli odpowiedzi nie ma — sprawdź folder spam, zanim uznasz, że zgubiliśmy wiadomość.",
        failedTitle: "Nie udało się wysłać.",
        failedBody: "Adres e-mail i zgoda to dwie rzeczy, bez których nic nie zrobimy. Uzupełnij oba i wyślij ponownie — reszta tego, co wpisałeś, nie przepadła.",
        brokeTitle: "To już nasza wina.",
        brokeBody: "Zgłoszenie się nie zapisało i przyczyna jest po naszej stronie, nie w tym, co wpisałeś. Nic nie przepadło — spróbuj jeszcze raz za minutę albo napisz na office@moveandinvest.com, resztą zajmiemy się sami.",
      },
    },
    partnerTeaser: {
      eyebrow: "Dla partnerów",
      ctaLabel: "Warunki dla partnerów",
      qualifiersLabel: "Na co zgłoszenie odpowiada przed Tobą",
      qualifiers: ["Jurysdykcja", "Budżet", "Termin", "Cel"],
      heading: "Dla kancelarii i doradców relokacyjnych",
      body: "Zgłoszenie przychodzi z już odpowiedzianymi pytaniami — jurysdykcja, budżet, termin, cel — i z tym, co człowiek napisał własnymi słowami. Wcześniej przeszedł porównanie według czterech pytań i stronę jurysdykcji, więc pyta, już wiedząc, o co pyta. Płatność za kwalifikowany lead tam, gdzie pozwala na to twój zawód, i bezpłatnie tam, gdzie nie pozwala: na Malcie, w ZEA i w Portugalii prawnik nie może płacić za skierowanie i tam nie prosimy o nic. W twoim honorarium nie uczestniczymy w żadnym wypadku.",
    },
    seo: {
      metaTitle: "Relokacja i nieruchomości w pięciu jurysdykcjach — moveandinvest",
      metaDescription: "Porównanie ścieżek rezydencji, minimalnych inwestycji, czasu do pierwszego zezwolenia i reżimów podatkowych: Portugalia, Grecja, Malta, ZEA, Cypr.",
    },
  },
};
