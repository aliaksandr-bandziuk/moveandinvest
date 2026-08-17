import { createClient } from "@sanity/client";

// One-shot seed. Run with a TEMPORARY write token:
//
//   npm run seed
//
// Create the token with Editor permission in the Sanity dashboard right
// before running, and delete it immediately after. Do not leave a
// write-capable credential sitting in .env.local.
//
// Idempotent: every document has a deterministic _id and is written with
// createOrReplace, so running it twice produces the same dataset rather
// than duplicates. It will overwrite Studio edits to these documents —
// run it once, then stop using it.
//
// PUBLISH POLICY, deliberate: the three singletons are created PUBLISHED
// (they carry no factual claims — headlines and positioning copy), while
// every jurisdiction page is created as a DRAFT. Those carry investment
// thresholds, permit timelines and tax regimes, and CLAUDE.md's rule is
// that an unsourced number on a page a lawyer may forward to a client is a
// liability. They stay invisible on the site until you have checked each
// figure against a primary source and pressed publish yourself.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary Editor token, run this once, then delete it.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token,
});

type Locale = "en" | "ru" | "pl";
const LOCALES: Locale[] = ["en", "ru", "pl"];

// --- Jurisdictions (language-neutral registry) -------------------------------

const COUNTRIES = [
  { id: "country-pt", name: "Portugal", code: "pt", accentColor: "#2e6f5e", status: "live", order: 10 },
  { id: "country-gr", name: "Greece", code: "gr", accentColor: "#2b5c8a", status: "live", order: 20 },
  { id: "country-mt", name: "Malta", code: "mt", accentColor: "#8c3f5d", status: "live", order: 30 },
  { id: "country-ae", name: "United Arab Emirates", code: "ae", accentColor: "#6b5b2e", status: "live", order: 40 },
  // Deferred on purpose while the parallel Cyprus project still earns —
  // shown in the table as a dimmed row rather than silently omitted.
  { id: "country-cy", name: "Cyprus", code: "cy", accentColor: "#a8641e", status: "planned", order: 50 },
] as const;

// --- Jurisdiction pages ------------------------------------------------------
// Figures below are STARTING POINTS, not verified data. Every one of them
// must be checked against a primary source before publishing — that is what
// the draft status is for.

const UNVERIFIED = {
  en: "Figures compiled 15 August 2026 and NOT yet verified against primary sources. Check before publishing.",
  ru: "Данные собраны 15 августа 2026 года и ЕЩЁ НЕ сверены с первоисточниками. Проверить перед публикацией.",
  pl: "Dane zebrane 15 sierpnia 2026 r. i NIE zweryfikowane ze źródłami pierwotnymi. Sprawdzić przed publikacją.",
};

interface CountryPageSeed {
  country: string;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  intro: Record<Locale, string>;
  route: Record<Locale, string>;
  minimumInvestment: string;
  timeToPermit: Record<Locale, string>;
  taxRegime: Record<Locale, string>;
}

const COUNTRY_PAGES: CountryPageSeed[] = [
  {
    country: "country-pt",
    slug: { en: "portugal", ru: "portugaliya", pl: "portugalia" },
    title: {
      en: "Moving to Portugal: residency, tax and property",
      ru: "Переезд в Португалию: ВНЖ, налоги и недвижимость",
      pl: "Przeprowadzka do Portugalii: rezydencja, podatki i nieruchomości",
    },
    intro: {
      en: "Portugal grants residency against a qualifying investment, most commonly a fund subscription rather than property. Below: the threshold, the timeline to a first permit, and what the tax position looks like once you are resident.",
      ru: "Португалия выдаёт ВНЖ за квалифицированные инвестиции — чаще всего через подписку на фонд, а не через покупку недвижимости. Ниже: порог входа, срок до первого пермита и налоговая позиция после получения резидентства.",
      pl: "Portugalia przyznaje rezydencję za kwalifikowaną inwestycję, najczęściej poprzez subskrypcję funduszu, a nie zakup nieruchomości. Poniżej: próg wejścia, czas do pierwszego zezwolenia i sytuacja podatkowa po uzyskaniu rezydencji.",
    },
    route: { en: "Golden Visa (fund)", ru: "Golden Visa (фонд)", pl: "Golden Visa (fundusz)" },
    minimumInvestment: "€500,000",
    timeToPermit: { en: "6–9 months", ru: "6–9 месяцев", pl: "6–9 miesięcy" },
    taxRegime: {
      en: "IFICI regime, 20% flat on qualifying income",
      ru: "Режим IFICI, 20% на квалифицированный доход",
      pl: "Reżim IFICI, 20% na kwalifikowany dochód",
    },
  },
  {
    country: "country-gr",
    slug: { en: "greece", ru: "gretsiya", pl: "grecja" },
    title: {
      en: "Moving to Greece: residency, tax and property",
      ru: "Переезд в Грецию: ВНЖ, налоги и недвижимость",
      pl: "Przeprowadzka do Grecji: rezydencja, podatki i nieruchomości",
    },
    intro: {
      en: "Greece has the lowest property-based entry threshold in the EU, and the shortest route to a first permit. The threshold is not uniform: it depends on the region and on the type of property.",
      ru: "У Греции самый низкий в ЕС порог входа через недвижимость и самый короткий путь до первого пермита. Порог не единый: он зависит от региона и от типа объекта.",
      pl: "Grecja ma najniższy w UE próg wejścia oparty na nieruchomości i najkrótszą drogę do pierwszego zezwolenia. Próg nie jest jednolity: zależy od regionu i rodzaju nieruchomości.",
    },
    route: { en: "Golden Visa (property)", ru: "Golden Visa (недвижимость)", pl: "Golden Visa (nieruchomość)" },
    minimumInvestment: "€250,000",
    timeToPermit: { en: "2–4 months", ru: "2–4 месяца", pl: "2–4 miesiące" },
    taxRegime: {
      en: "Non-dom, €100,000 flat annual charge",
      ru: "Non-dom, фиксированный сбор €100,000 в год",
      pl: "Non-dom, ryczałt €100,000 rocznie",
    },
  },
  {
    country: "country-mt",
    slug: { en: "malta", ru: "malta", pl: "malta" },
    title: {
      en: "Moving to Malta: residency, tax and property",
      ru: "Переезд на Мальту: ВНЖ, налоги и недвижимость",
      pl: "Przeprowadzka na Maltę: rezydencja, podatki i nieruchomości",
    },
    intro: {
      en: "Malta is a narrow but expensive route: an English-speaking EU member with a residence programme built around a combination of property, a government contribution and a donation.",
      ru: "Мальта — узкий, но дорогой маршрут: англоязычная страна ЕС с программой резидентства, построенной на комбинации недвижимости, государственного взноса и пожертвования.",
      pl: "Malta to wąska, ale kosztowna ścieżka: anglojęzyczny kraj UE z programem rezydencji opartym na połączeniu nieruchomości, wkładu rządowego i darowizny.",
    },
    route: {
      en: "Permanent residence programme",
      ru: "Программа постоянного резидентства",
      pl: "Program stałej rezydencji",
    },
    minimumInvestment: "€300,000",
    timeToPermit: { en: "4–6 months", ru: "4–6 месяцев", pl: "4–6 miesięcy" },
    taxRegime: {
      en: "Remittance basis for non-domiciled residents",
      ru: "Remittance basis для нерезидентов по домицилю",
      pl: "Zasada remittance dla osób bez domicylu",
    },
  },
  {
    country: "country-ae",
    slug: { en: "uae", ru: "oae", pl: "zea" },
    title: {
      en: "Moving to the UAE: residency, tax and property",
      ru: "Переезд в ОАЭ: резидентство, налоги и недвижимость",
      pl: "Przeprowadzka do ZEA: rezydencja, podatki i nieruchomości",
    },
    intro: {
      en: "The fastest route on this list and the only one outside the EU. No personal income tax, a property threshold denominated in dirhams, and a residence permit issued in weeks rather than months.",
      ru: "Самый быстрый маршрут в этом списке и единственный за пределами ЕС. Нет налога на доходы физлиц, порог по недвижимости номинирован в дирхамах, резидентская виза выдаётся за недели, а не месяцы.",
      pl: "Najszybsza ścieżka na tej liście i jedyna poza UE. Brak podatku dochodowego od osób fizycznych, próg nieruchomościowy w dirhamach, zezwolenie wydawane w tygodniach, nie miesiącach.",
    },
    route: { en: "Golden Visa (property)", ru: "Golden Visa (недвижимость)", pl: "Golden Visa (nieruchomość)" },
    minimumInvestment: "AED 2,000,000",
    timeToPermit: { en: "3–6 weeks", ru: "3–6 недель", pl: "3–6 tygodni" },
    taxRegime: {
      en: "No personal income tax",
      ru: "Нет налога на доходы физических лиц",
      pl: "Brak podatku dochodowego od osób fizycznych",
    },
  },
];

// --- Singleton copy ----------------------------------------------------------

const SITE_SETTINGS: Record<Locale, Record<string, string>> = {
  en: {
    tagline: "Relocation and property across five jurisdictions, compared on the same terms.",
    disclaimer:
      "moveandinvest publishes independent comparisons of residency, tax and property rules. It is not a law firm and does not provide legal, tax or investment advice.",
    metaTitle: "moveandinvest — relocation and property, compared",
    metaDescription:
      "Residency routes, tax regimes and property rules in Portugal, Greece, Malta, the UAE and Cyprus — compared side by side and sourced.",
  },
  ru: {
    tagline: "Релокация и недвижимость в пяти юрисдикциях, сравнённые по одним критериям.",
    disclaimer:
      "moveandinvest публикует независимые сравнения правил резидентства, налогов и покупки недвижимости. Проект не является юридической фирмой и не оказывает юридических, налоговых или инвестиционных консультаций.",
    metaTitle: "moveandinvest — релокация и недвижимость в сравнении",
    metaDescription:
      "Маршруты ВНЖ, налоговые режимы и правила покупки недвижимости в Португалии, Греции, на Мальте, в ОАЭ и на Кипре — рядом и со ссылками на источники.",
  },
  pl: {
    tagline: "Relokacja i nieruchomości w pięciu jurysdykcjach, porównane według tych samych kryteriów.",
    disclaimer:
      "moveandinvest publikuje niezależne porównania zasad rezydencji, podatków i nabywania nieruchomości. Nie jest kancelarią prawną i nie świadczy porad prawnych, podatkowych ani inwestycyjnych.",
    metaTitle: "moveandinvest — relokacja i nieruchomości w porównaniu",
    metaDescription:
      "Ścieżki rezydencji, reżimy podatkowe i zasady nabywania nieruchomości w Portugalii, Grecji, na Malcie, w ZEA i na Cyprze — obok siebie i ze źródłami.",
  },
};

const HOME: Record<Locale, Record<string, string>> = {
  en: {
    eyebrow: "Independent research",
    heading: "Where to move, and what it actually costs",
    intro:
      "Residency routes, tax regimes and property rules in five jurisdictions — compared on the same four questions, sourced, and dated. No brochures, no brokers.",
    primaryLabel: "Compare jurisdictions",
    secondaryLabel: "For partners",
    comparisonHeading: "Residency by investment, 2026",
    comparisonIntro:
      "One row per jurisdiction, the same four columns for all of them. Where a threshold varies by region or property type, the page for that jurisdiction says so.",
    partnerHeading: "For law firms and relocation advisers",
    partnerBody:
      "An enquiry arrives with the questions on the right already answered, in the sender\u2019s own words. Paid per qualified lead, not as commission on a closing.",
    metaTitle: "Relocation and property in five jurisdictions — moveandinvest",
    metaDescription:
      "Compare residency routes, minimum investment, time to a first permit and tax regimes across Portugal, Greece, Malta, the UAE and Cyprus.",
  },
  ru: {
    eyebrow: "Независимое исследование",
    heading: "Куда переехать и сколько это стоит на самом деле",
    intro:
      "Маршруты резидентства, налоговые режимы и правила покупки недвижимости в пяти юрисдикциях — сравнение по одним и тем же четырём вопросам, со ссылками на источники и датой проверки. Без брошюр и посредников.",
    primaryLabel: "Сравнить юрисдикции",
    secondaryLabel: "Партнёрам",
    comparisonHeading: "Резидентство за инвестиции, 2026",
    comparisonIntro:
      "Одна строка на юрисдикцию, одни и те же четыре колонки для всех. Если порог зависит от региона или типа объекта, об этом сказано на странице юрисдикции.",
    partnerHeading: "Юридическим фирмам и релокационным консультантам",
    partnerBody:
      "Заявка приходит с уже отвеченными вопросами справа — и с тем, что человек написал своими словами. Оплата за квалифицированный лид, а не комиссия со сделки.",
    metaTitle: "Релокация и недвижимость в пяти юрисдикциях — moveandinvest",
    metaDescription:
      "Сравнение маршрутов резидентства, минимальных инвестиций, сроков до первого пермита и налоговых режимов: Португалия, Греция, Мальта, ОАЭ, Кипр.",
  },
  pl: {
    eyebrow: "Niezależne opracowanie",
    heading: "Dokąd się przeprowadzić i ile to naprawdę kosztuje",
    intro:
      "Ścieżki rezydencji, reżimy podatkowe i zasady nabywania nieruchomości w pięciu jurysdykcjach — porównane według tych samych czterech pytań, ze źródłami i datą weryfikacji. Bez broszur i pośredników.",
    primaryLabel: "Porównaj jurysdykcje",
    secondaryLabel: "Dla partnerów",
    comparisonHeading: "Rezydencja za inwestycję, 2026",
    comparisonIntro:
      "Jeden wiersz na jurysdykcję, te same cztery kolumny dla wszystkich. Jeśli próg zależy od regionu lub rodzaju nieruchomości, strona danej jurysdykcji o tym mówi.",
    partnerHeading: "Dla kancelarii i doradców relokacyjnych",
    partnerBody:
      "Zgłoszenie trafia do Państwa z już udzielonymi odpowiedziami na pytania po prawej — i z tym, co osoba napisała własnymi słowami. Płatność za kwalifikowany lead, nie prowizja od transakcji.",
    metaTitle: "Relokacja i nieruchomości w pięciu jurysdykcjach — moveandinvest",
    metaDescription:
      "Porównanie ścieżek rezydencji, minimalnych inwestycji, czasu do pierwszego zezwolenia i reżimów podatkowych: Portugalia, Grecja, Malta, ZEA, Cypr.",
  },
};

const PARTNERS: Record<Locale, Record<string, string>> = {
  en: {
    eyebrow: "Partnership",
    heading: "Qualified enquiries, not raw form fills",
    intro:
      "moveandinvest is an independent comparison site for people planning a move to Portugal, Greece, Malta, the UAE or Cyprus. Readers who are ready to act answer a short set of questions, in their own words, before we pass anything on. We are building the audience now and are talking to firms early — we would rather agree terms before there is volume than after.",
    qualificationHeading: "What every enquiry has already answered",
    q1: "Which jurisdiction",
    n1: "A named jurisdiction, not a general enquiry about moving abroad.",
    q2: "What budget",
    n2: "A stated range, checked against that jurisdiction's own entry threshold.",
    q3: "What timeline",
    n3: "When they intend to act, so a six-month enquiry is not sold as a live one.",
    ctaLabel: "Request terms",
    metaTitle: "For partners — moveandinvest",
    metaDescription:
      "Work with moveandinvest: qualified relocation and residency enquiries in Portugal, Greece, Malta, the UAE and Cyprus, paid per lead.",
  },
  ru: {
    eyebrow: "Партнёрство",
    heading: "Квалифицированные заявки, а не сырые формы",
    intro:
      "moveandinvest — независимый сравнительный проект для тех, кто планирует переезд в Португалию, Грецию, на Мальту, в ОАЭ или на Кипр. Читатели, готовые действовать, отвечают на несколько вопросов и описывают свою ситуацию словами до того, как мы передадим заявку. Аудиторию мы собираем сейчас и говорим с фирмами заранее: условия лучше согласовать до объёма, а не после.",
    qualificationHeading: "На что заявка уже ответила",
    q1: "Какая юрисдикция",
    n1: "Названная страна, а не общий запрос про переезд за границу.",
    q2: "Какой бюджет",
    n2: "Заявленный диапазон, сверенный с порогом входа этой юрисдикции.",
    q3: "Какой срок",
    n3: "Когда человек намерен действовать, чтобы заявка на полгода вперёд не продавалась как горячая.",
    ctaLabel: "Запросить условия",
    metaTitle: "Партнёрам — moveandinvest",
    metaDescription:
      "Сотрудничество с moveandinvest: квалифицированные заявки по релокации и резидентству в Португалии, Греции, на Мальте, в ОАЭ и на Кипре, оплата за лид.",
  },
  pl: {
    eyebrow: "Współpraca",
    heading: "Kwalifikowane zapytania, nie surowe formularze",
    intro:
      "moveandinvest to niezależny serwis porównawczy dla osób planujących przeprowadzkę do Portugalii, Grecji, na Maltę, do ZEA lub na Cypr. Czytelnicy gotowi do działania odpowiadają na kilka pytań i opisują swoją sytuację własnymi słowami, zanim cokolwiek przekażemy. Audytorium budujemy teraz i rozmawiamy z kancelariami wcześnie — wolimy ustalić warunki przed wolumenem niż po nim.",
    qualificationHeading: "Na co zapytanie już odpowiedziało",
    q1: "Która jurysdykcja",
    n1: "Konkretny kraj, a nie ogólne pytanie o wyjazd za granicę.",
    q2: "Jaki budżet",
    n2: "Podany przedział, zestawiony z progiem wejścia danej jurysdykcji.",
    q3: "Jaki termin",
    n3: "Kiedy zamierza działać, żeby zapytanie na pół roku naprzód nie było sprzedawane jako gorące.",
    ctaLabel: "Zapytaj o warunki",
    metaTitle: "Dla partnerów — moveandinvest",
    metaDescription:
      "Współpraca z moveandinvest: kwalifikowane zapytania o relokację i rezydencję w Portugalii, Grecji, na Malcie, w ZEA i na Cyprze, płatne za lead.",
  },
};


const METHOD: Record<Locale, { heading: string; intro: string; points: { title: string; body: string }[] }> = {
  en: {
    heading: "How the comparison is built",
    intro: "Four questions, one method, applied identically to five jurisdictions.",
    points: [
      { title: "Four questions, not forty", body: "Route, threshold, time to a first permit, tax regime. They are the only four that change a decision; everything else is detail that belongs on the jurisdiction's own page." },
      { title: "Primary sources only", body: "Government texts and official fee schedules, never agency brochures. Every page names its source and the date it was checked." },
      { title: "Re-checked when the rules move", body: "Not on a calendar. Thresholds in this category change several times a year, and a table dated last spring is worse than no table." },
      { title: "Paid per qualified enquiry", body: "Never as commission on a sale. We do not sell property, and no developer can buy a better position in the table." },
    ],
  },
  ru: {
    heading: "Как устроено сравнение",
    intro: "Четыре вопроса, один метод, одинаково применённый к пяти юрисдикциям.",
    points: [
      { title: "Четыре вопроса, а не сорок", body: "Маршрут, порог входа, срок до первого пермита, налоговый режим. Только эти четыре меняют решение; остальное — детали, и им место на странице самой юрисдикции." },
      { title: "Только первоисточники", body: "Тексты законов и официальные тарифы, а не брошюры агентств. На каждой странице указан источник и дата, когда цифру проверяли." },
      { title: "Пересматриваем, когда меняется правило", body: "А не по календарю. Пороги в этой нише меняются по нескольку раз в год, и таблица с прошлогодней датой хуже, чем её отсутствие." },
      { title: "Платят за квалифицированную заявку", body: "Не комиссию со сделки. Мы не продаём недвижимость, и ни один застройщик не может купить себе место повыше в таблице." },
    ],
  },
  pl: {
    heading: "Jak zbudowane jest porównanie",
    intro: "Cztery pytania, jedna metoda, zastosowana identycznie do pięciu jurysdykcji.",
    points: [
      { title: "Cztery pytania, nie czterdzieści", body: "Ścieżka, próg wejścia, czas do pierwszego zezwolenia, reżim podatkowy. Tylko te cztery zmieniają decyzję; reszta to szczegóły, których miejsce jest na stronie danej jurysdykcji." },
      { title: "Wyłącznie źródła pierwotne", body: "Teksty ustaw i oficjalne taryfy, nigdy broszury agencji. Każda strona podaje swoje źródło i datę weryfikacji." },
      { title: "Aktualizacja, gdy zmienia się przepis", body: "Nie według kalendarza. Progi w tej kategorii zmieniają się kilka razy w roku, a tabela z zeszłoroczną datą jest gorsza niż jej brak." },
      { title: "Płatność za kwalifikowane zapytanie", body: "Nigdy prowizja od sprzedaży. Nie sprzedajemy nieruchomości i żaden deweloper nie kupi sobie lepszej pozycji w tabeli." },
    ],
  },
};

const CONTACT_EMAIL = "partners@moveandinvest.com";

// --- Document builders -------------------------------------------------------

function seoFor(copy: Record<string, string>) {
  return {
    _type: "seo",
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    noIndex: false,
  };
}

const documents: Record<string, unknown>[] = [];

for (const country of COUNTRIES) {
  documents.push({
    _id: country.id,
    _type: "country",
    name: country.name,
    code: country.code,
    accentColor: country.accentColor,
    status: country.status,
    order: country.order,
  });
}

for (const locale of LOCALES) {
  const settings = SITE_SETTINGS[locale];
  const home = HOME[locale];
  const partners = PARTNERS[locale];

  documents.push({
    _id: `siteSettings-${locale}`,
    _type: "siteSettings",
    language: locale,
    siteName: "moveandinvest",
    tagline: settings.tagline,
    contactEmail: CONTACT_EMAIL,
    disclaimer: settings.disclaimer,
    defaultSeo: seoFor(settings),
  });

  documents.push({
    _id: `homePage-${locale}`,
    _type: "homePage",
    language: locale,
    eyebrow: home.eyebrow,
    heading: home.heading,
    intro: home.intro,
    primaryCta: { _type: "cta", label: home.primaryLabel, href: "#comparison" },
    secondaryCta: { _type: "cta", label: home.secondaryLabel, href: "/for-partners" },
    comparisonHeading: home.comparisonHeading,
    comparisonIntro: home.comparisonIntro,
    methodHeading: METHOD[locale].heading,
    methodIntro: METHOD[locale].intro,
    methodPoints: METHOD[locale].points.map((point, i) => ({
      _key: `m${i + 1}`,
      ...point,
    })),
    partnerTeaserHeading: home.partnerHeading,
    partnerTeaserBody: home.partnerBody,
    seo: seoFor(home),
  });

  documents.push({
    _id: `partnersPage-${locale}`,
    _type: "partnersPage",
    language: locale,
    eyebrow: partners.eyebrow,
    heading: partners.heading,
    intro: partners.intro,
    qualificationHeading: partners.qualificationHeading,
    qualificationSteps: [
      { _key: "jurisdiction", question: partners.q1, note: partners.n1 },
      { _key: "budget", question: partners.q2, note: partners.n2 },
      { _key: "timeline", question: partners.q3, note: partners.n3 },
    ],
    contactEmail: CONTACT_EMAIL,
    ctaLabel: partners.ctaLabel,
    seo: seoFor(partners),
  });
}

// Jurisdiction pages: created as DRAFTS. See the publish policy at the top.
for (const page of COUNTRY_PAGES) {
  for (const locale of LOCALES) {
    const code = page.country.replace("country-", "");
    documents.push({
      _id: `drafts.countryPage-${code}-${locale}`,
      _type: "countryPage",
      language: locale,
      country: { _type: "reference", _ref: page.country },
      title: page.title[locale],
      slug: { _type: "slug", current: page.slug[locale] },
      intro: page.intro[locale],
      route: page.route[locale],
      minimumInvestment: page.minimumInvestment,
      timeToPermit: page.timeToPermit[locale],
      taxRegime: page.taxRegime[locale],
      sourceNote: UNVERIFIED[locale],
      seo: {
        _type: "seo",
        metaTitle: page.title[locale].slice(0, 60),
        metaDescription: page.intro[locale].slice(0, 155),
        noIndex: false,
      },
    });
  }
}


// --- FAQ ---------------------------------------------------------------------
// Created as DRAFTS, same policy as the jurisdiction pages and for the same
// reason: several of these answers contain years and thresholds, and an
// unchecked number in the block an answer engine quotes is worse than no
// block. Promote with `npm run publish -- --type faqItem --all`.
//
// `countries` is the list of jurisdiction ids a question is specific to.
// Empty means it applies to all five — the common case, and the reason the
// filter chips only appear for jurisdictions that have a question of their
// own.

interface FaqSeed {
  key: string;
  countries: string[];
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

const FAQ_ITEMS: FaqSeed[] = [
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
      en: "Portugal five years, Malta five by naturalisation, Greece seven, Cyprus seven. The UAE has no citizenship route here at all. Everywhere the clock counts years of legal residence, not years of holding the status.",
      ru: "Португалия — 5 лет, Мальта — 5 лет по натурализации, Греция — 7 лет, Кипр — 7 лет. У ОАЭ гражданства по этому маршруту нет вообще. Везде считается срок легального проживания, а не срок владения статусом.",
      pl: "Portugalia — 5 lat, Malta — 5 lat przez naturalizację, Grecja — 7 lat, Cypr — 7 lat. ZEA nie mają tu żadnej ścieżki do obywatelstwa. Wszędzie liczy się okres legalnego pobytu, a nie okres posiadania statusu.",
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

for (const [i, item] of FAQ_ITEMS.entries()) {
  for (const locale of LOCALES) {
    documents.push({
      _id: `drafts.faqItem-${item.key}-${locale}`,
      _type: "faqItem",
      language: locale,
      question: item.q[locale],
      answer: item.a[locale],
      order: (i + 1) * 10,
      jurisdictions: item.countries.map((id) => ({
        _key: id,
        _type: "reference",
        _ref: id,
      })),
    });
  }
}

// Translation metadata: what links a document to its counterparts inside
// Studio's own language switcher. Without these each document still has a
// correct `language` field and the site renders fine — the plugin's
// "Translations" panel would just show nothing to jump to.
function translationMetadata(typeId: string, idFor: (locale: Locale) => string) {
  return {
    _id: `translation.metadata.${typeId}`,
    _type: "translation.metadata",
    schemaTypes: [typeId],
    translations: LOCALES.map((locale) => ({
      _key: locale,
      _type: "internationalizedArrayReferenceValue",
      value: { _type: "reference", _ref: idFor(locale) },
    })),
  };
}

for (const typeId of ["siteSettings", "homePage", "partnersPage"]) {
  documents.push(translationMetadata(typeId, (locale) => `${typeId}-${locale}`));
}

// --- Write -------------------------------------------------------------------

async function run() {
  // Re-running this after `npm run publish` must not resurrect a draft next to
  // the published document it came from — that is how an editor ends up with
  // two versions of the same page and no idea which one the site renders. Any
  // jurisdiction page that already exists as published is skipped; its content
  // is yours now, not the seed's.
  const publishedIds = await client.fetch<string[]>(
    `*[_type in ["countryPage", "faqItem"]]._id`,
  );
  const published = new Set(publishedIds);

  const toWrite = documents.filter((doc) => {
    const id = String(doc._id);
    if (!id.startsWith("drafts.")) return true;
    return !published.has(id.replace(/^drafts\./, ""));
  });

  const skipped = documents.length - toWrite.length;

  const transaction = client.transaction();

  for (const doc of toWrite) {
    transaction.createOrReplace(doc as { _id: string; _type: string });
  }

  await transaction.commit();

  const written = toWrite.filter((d) => !String(d._id).startsWith("drafts."));
  const drafts = toWrite.length - written.length;

  console.log(`Seeded ${toWrite.length} documents.`);
  if (skipped > 0) {
    console.log(`  skipped ${skipped} already-published jurisdiction page(s)`);
  }
  console.log(`  published: ${written.length}`);
  console.log(`  drafts (jurisdiction pages, awaiting your fact-check): ${drafts}`);
  console.log("");
  console.log("Now delete the write token you created for this run.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
