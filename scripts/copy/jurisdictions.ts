// The verified per-jurisdiction facts that the comparison table renders.
//
// Shared by `seed.ts` (writes them into an empty dataset) and `facts.ts`
// (patches them onto documents that are already published), for the same
// reason `copy/home.ts` is shared: when each script kept its own copy, a
// correction landed in one of them only.
//
// Every figure here was checked against a primary source on 23 August 2026.
// The working — statute, ministry tariff or official fee schedule, with its
// date — is in docs/figures-verification-2026-08-23.md. Do not edit a number
// in this file without updating that document in the same commit; a figure
// with no traceable source is exactly what this site exists not to publish.

export type Locale = "en" | "ru" | "pl";

export interface CountryPageSeed {
  country: string;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  intro: Record<Locale, string>;
  route: Record<Locale, string>;
  minimumInvestment: string;
  timeToPermit: Record<Locale, string>;
  taxRegime: Record<Locale, string>;
}

export const COUNTRY_PAGES: CountryPageSeed[] = [
  {
    country: "country-pt",
    slug: { en: "portugal", ru: "portugaliya", pl: "portugalia" },
    title: {
      en: "Moving to Portugal: residency, tax and property",
      ru: "Переезд в Португалию: ВНЖ, налоги и недвижимость",
      pl: "Przeprowadzka do Portugalii: rezydencja, podatki i nieruchomości",
    },
    intro: {
      en: "Portugal grants residency against a qualifying investment, most commonly a fund subscription: property was removed as a route by Lei 56/2023, and the law now bars any investment aimed even indirectly at real estate. It is no longer the fast passport it was — naturalisation took ten years for non-EU nationals in May 2026 — and its strength has moved to the tax side.",
      ru: "Португалия выдаёт ВНЖ за квалифицированные инвестиции — чаще всего через подписку на фонд: недвижимость как маршрут отменена законом 56/2023, а закон теперь запрещает и косвенные вложения в неё. Быстрым путём к паспорту страна быть перестала — с мая 2026 года натурализация занимает десять лет для не-граждан ЕС, — и её сила переместилась в налоговую плоскость.",
      pl: "Portugalia przyznaje rezydencję za kwalifikowaną inwestycję, najczęściej poprzez subskrypcję funduszu: nieruchomości zostały wykreślone jako ścieżka przez Lei 56/2023, a ustawa zakazuje dziś także inwestycji pośrednio nakierowanych na rynek nieruchomości. To już nie jest szybka droga do paszportu — od maja 2026 naturalizacja trwa dziesięć lat dla obywateli spoza UE — a przewaga kraju przeniosła się na podatki.",
    },
    route: { en: "Golden Visa (fund)", ru: "Golden Visa (фонд)", pl: "Golden Visa (fundusz)" },
    minimumInvestment: "€500,000",
    timeToPermit: {
      en: "90 days by law, a year or more in practice",
      ru: "90 дней по закону, год и больше на практике",
      pl: "90 dni według ustawy, rok i więcej w praktyce",
    },
    taxRegime: {
      en: "IFICI, 20% flat for 10 years",
      ru: "IFICI, 20% на 10 лет",
      pl: "IFICI, 20% przez 10 lat",
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
      en: "Greece has the lowest property-based entry threshold in this comparison, and the only one where filing itself confers lawful residence. The threshold is not uniform: since September 2024 it is €800,000 across Attica, Thessaloniki, Mykonos, Santorini and the larger islands, €400,000 elsewhere, and €250,000 only for converting or restoring a specific kind of building.",
      ru: "У Греции самый низкий в этом сравнении порог входа через недвижимость и единственный маршрут, где сама подача даёт законное пребывание. Порог не единый: с сентября 2024 года это €800 000 в Аттике, Салониках, на Миконосе, Санторини и крупных островах, €400 000 в остальной стране и €250 000 только под перевод назначения или реставрацию здания определённого типа.",
      pl: "Grecja ma najniższy w tym porównaniu próg wejścia oparty na nieruchomości i jako jedyna daje legalny pobyt już w chwili złożenia wniosku. Próg nie jest jednolity: od września 2024 to €800 000 w Attyce, Salonikach, na Mykonos, Santorini i większych wyspach, €400 000 w pozostałej części kraju i €250 000 wyłącznie przy zmianie przeznaczenia lub renowacji budynku określonego typu.",
    },
    route: { en: "Golden Visa (property)", ru: "Golden Visa (недвижимость)", pl: "Golden Visa (nieruchomość)" },
    minimumInvestment: "€400,000",
    timeToPermit: {
      en: "Lawful residence on filing, card in months",
      ru: "Законное пребывание с подачи, карта — месяцы",
      pl: "Legalny pobyt od złożenia, karta w miesiącach",
    },
    taxRegime: {
      en: "Non-dom, €100,000 a year, separate €500,000 investment",
      ru: "Non-dom, €100 000 в год, отдельная инвестиция €500 000",
      pl: "Non-dom, €100 000 rocznie, osobna inwestycja €500 000",
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
      en: "Malta is a narrow but expensive route: an English-speaking EU member whose programme is built from a property purchase, a €37,000 government contribution, a €60,000 administrative fee and a donation, all of them compulsory. It is also, since Portugal changed its nationality law, the shortest naturalisation period in this comparison — around five years of genuine residence.",
      ru: "Мальта — узкий, но дорогой маршрут: англоязычная страна ЕС, программа которой собрана из покупки недвижимости, государственного взноса €37 000, административного сбора €60 000 и пожертвования, и всё это обязательно. С тех пор как Португалия изменила закон о гражданстве, это ещё и самый короткий срок натурализации в сравнении — около пяти лет реального проживания.",
      pl: "Malta to wąska, ale kosztowna ścieżka: anglojęzyczny kraj UE, którego program składa się z zakupu nieruchomości, wkładu rządowego €37 000, opłaty administracyjnej €60 000 i darowizny — wszystko obowiązkowe. Od zmiany portugalskiej ustawy o obywatelstwie jest to również najkrótszy okres naturalizacji w tym porównaniu: około pięciu lat rzeczywistego pobytu.",
    },
    route: {
      en: "Permanent residence programme",
      ru: "Программа постоянного резидентства",
      pl: "Program stałej rezydencji",
    },
    minimumInvestment: "€375,000",
    timeToPermit: {
      en: "Not published; 6–12 months in practice",
      ru: "Официально не публикуется; 6–12 месяцев на практике",
      pl: "Nie publikowany; 6–12 miesięcy w praktyce",
    },
    taxRegime: {
      en: "Remittance basis — but the permit gives no tax residence",
      ru: "Remittance basis, но само разрешение резидентства не даёт",
      pl: "Zasada remittance, ale zezwolenie nie daje rezydencji podatkowej",
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
      en: "The fastest route on this list and the only one outside the EU. No personal income tax, a threshold set in dirhams that may be met by one property or several, and a ten-year permit the Land Department turns round in seven to ten working days. There is no path from it to citizenship: naturalisation in the UAE is discretionary and by nomination.",
      ru: "Самый быстрый маршрут в этом списке и единственный за пределами ЕС. Нет налога на доходы физлиц, порог номинирован в дирхамах и может закрываться одним объектом или несколькими, а десятилетнее разрешение земельный департамент оформляет за семь-десять рабочих дней. Пути к гражданству отсюда нет: натурализация в ОАЭ — исключительная и по номинации.",
      pl: "Najszybsza ścieżka na tej liście i jedyna poza UE. Brak podatku dochodowego od osób fizycznych, próg w dirhamach, który można spełnić jedną nieruchomością lub kilkoma, i dziesięcioletnie zezwolenie wydawane przez departament gruntów w siedem–dziesięć dni roboczych. Nie prowadzi do obywatelstwa: naturalizacja w ZEA jest uznaniowa i następuje z nominacji.",
    },
    route: { en: "Golden Visa (property)", ru: "Golden Visa (недвижимость)", pl: "Golden Visa (nieruchomość)" },
    minimumInvestment: "AED 2,000,000",
    timeToPermit: {
      en: "7–10 working days published, 2–4 weeks end to end",
      ru: "7–10 рабочих дней официально, 2–4 недели целиком",
      pl: "7–10 dni roboczych oficjalnie, 2–4 tygodnie łącznie",
    },
    taxRegime: {
      en: "No personal income tax",
      ru: "Нет налога на доходы физических лиц",
      pl: "Brak podatku dochodowego od osób fizycznych",
    },
  },
];

// Rendered directly under the cost bars and on every jurisdiction page. Its
// job is to state the two conventions without which the figures compare
// nothing: what was checked, and who the number is for.
export const SOURCE_NOTE: Record<Locale, string> = {
  en: "Verified against primary sources on 23 August 2026 — statutes, ministry tariffs and official fee schedules. Figures are for ONE main applicant and cover entry and the first renewal; dependants are priced differently in every jurisdiction and are not included. Amounts in euro; the UAE threshold is AED 2,000,000 converted at 4.288 on the same date.",
  ru: "Сверено с первоисточниками 23 августа 2026 года — законы, тарифы министерств и официальные таблицы сборов. Цифры даны на ОДНОГО основного заявителя и покрывают вход и первое продление; иждивенцы считаются в каждой юрисдикции по-своему и в суммы не входят. Всё в евро; порог ОАЭ — AED 2 000 000 по курсу 4,288 на ту же дату.",
  pl: "Zweryfikowane ze źródłami pierwotnymi 23 sierpnia 2026 — ustawy, taryfy ministerialne i oficjalne tabele opłat. Kwoty dotyczą JEDNEGO głównego wnioskodawcy i obejmują wejście oraz pierwsze odnowienie; osoby zależne są wyceniane inaczej w każdej jurysdykcji i nie są wliczone. Wszystko w euro; próg ZEA to AED 2 000 000 po kursie 4,288 z tego samego dnia.",
};
