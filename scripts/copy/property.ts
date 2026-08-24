import type { Locale } from "./jurisdictions";

// The frame of each property page: slug, title, intro, and the sources line.
// The six sections themselves live in copy/propertyBody.ts, for the same
// reason the jurisdiction bodies live apart from the table figures — a file
// mixing 40 lines of metadata with 3,000 words of prose is a file nobody
// proofreads.
//
// EVERY CLAIM HERE COMES FROM docs/property-verification-2026-08-24.md, and a
// sentence may not change without that document changing in the same commit.
//
// THE INTRO IS NOT A WELCOME. It states the one thing that most changes a
// buyer's plan in this jurisdiction — the border zone in Greece, the 7.5%
// surcharge in Portugal, the letting ban on Malta, the tax consequence of a
// holiday-home permit in Dubai. It is the paragraph an answer engine quotes,
// and a paragraph that opens with "Portugal is a beautiful country" is a
// paragraph nobody quotes.
//
// SLUGS carry the search term in each language, because these pages live at the
// top level alongside the jurisdiction pages and the URL is the only part of a
// result a reader reads before the title. They may never collide with a
// jurisdiction slug — the route logs a collision and serves the jurisdiction
// page, but the correct number of collisions is zero.

export interface PropertyPageSeed {
  /** The `country` document id this page belongs to. */
  country: string;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  intro: Record<Locale, string>;
  sourceNote: Record<Locale, string>;
  metaTitle: Record<Locale, string>;
  metaDescription: Record<Locale, string>;
}

export const PROPERTY_PAGES: PropertyPageSeed[] = [
  {
    country: "country-gr",
    slug: {
      en: "property-in-greece",
      ru: "nedvizhimost-v-gretsii",
      pl: "nieruchomosci-w-grecji",
    },
    title: {
      en: "Buying property in Greece: the rules, the costs and the traps",
      ru: "Недвижимость в Греции: правила покупки, расходы и ловушки",
      pl: "Nieruchomości w Grecji: zasady zakupu, koszty i pułapki",
    },
    intro: {
      en: "Two things catch most foreign buyers in Greece, and neither is the price. Santorini, Thira and a dozen other regions are border zones where a buyer from outside the EU needs a committee's permission — and a purchase made without it is void. And a short-term rental registration does not pass with the property: in the frozen districts of central Athens, buying a working holiday let does not buy its registry number.",
      ru: "Иностранного покупателя в Греции подводят обычно не цены, а две другие вещи. Санторини, Тира и ещё десяток регионов — приграничные зоны, где покупателю из страны вне ЕС нужно разрешение комиссии, а сделка без него ничтожна. И номер краткосрочной аренды не переходит вместе с квартирой: в замороженных округах центра Афин, купив работающий Airbnb, вы не покупаете его регистрацию.",
      pl: "Zagranicznego kupującego w Grecji zaskakują zwykle nie ceny, lecz dwie inne rzeczy. Santorini, Thira i kilkanaście innych regionów to strefy przygraniczne, gdzie kupujący spoza UE potrzebuje zgody komisji, a transakcja bez niej jest nieważna. Numer najmu krótkoterminowego nie przechodzi zaś razem z mieszkaniem: w zamrożonych dzielnicach centrum Aten, kupując działający najem, nie kupuje się jego rejestracji.",
    },
    sourceNote: {
      en: "Verified against primary sources on 24 August 2026: Law 1892/1990 arts. 24–26 on border zones; AADE on transfer tax and the short-term rental registry; art. 111 of Law 4446/2016 as codified by AADE; the Property Tax Code, Law 5219/2025, on ENFIA; art. 83 of Law 4495/2017 on the engineer's certificate; art. 100 of Law 5038/2023 as replaced by art. 64 of Law 5100/2024.",
      ru: "Сверено с первоисточниками 24 августа 2026 года: статьи 24–26 Закона 1892/1990 о приграничных зонах; AADE о налоге на переход и реестре краткосрочной аренды; статья 111 Закона 4446/2016 в кодификации AADE; Кодекс налога на имущество, Закон 5219/2025, об ENFIA; статья 83 Закона 4495/2017 о справке инженера; статья 100 Закона 5038/2023 в редакции статьи 64 Закона 5100/2024.",
      pl: "Zweryfikowane ze źródłami pierwotnymi 24 sierpnia 2026: art. 24–26 ustawy 1892/1990 o strefach przygranicznych; AADE o podatku od przeniesienia i rejestrze najmu krótkoterminowego; art. 111 ustawy 4446/2016 w kodyfikacji AADE; Kodeks podatku od nieruchomości, ustawa 5219/2025, o ENFIA; art. 83 ustawy 4495/2017 o zaświadczeniu inżyniera; art. 100 ustawy 5038/2023 w brzmieniu art. 64 ustawy 5100/2024.",
    },
    metaTitle: {
      en: "Buying property in Greece — rules, taxes and costs",
      ru: "Недвижимость в Греции: правила, налоги и расходы",
      pl: "Nieruchomości w Grecji: zasady, podatki i koszty",
    },
    metaDescription: {
      en: "Who may buy and where they may not, what the purchase costs on top of the price, annual taxes, the short-term rental freeze, and how a purchase connects to residency. Sourced and dated.",
      ru: "Кто может купить и где нельзя, во что обходится покупка сверх цены, ежегодные налоги, заморозка краткосрочной аренды и связь покупки с ВНЖ. Со ссылками и датой проверки.",
      pl: "Kto może kupić i gdzie nie wolno, ile zakup kosztuje ponad cenę, podatki roczne, zamrożenie najmu krótkoterminowego i związek zakupu z rezydencją. Ze źródłami i datą.",
    },
  },
  {
    country: "country-pt",
    slug: {
      en: "property-in-portugal",
      ru: "nedvizhimost-v-portugalii",
      pl: "nieruchomosci-w-portugalii",
    },
    title: {
      en: "Buying property in Portugal: the rules, the costs and the new surcharge",
      ru: "Недвижимость в Португалии: правила покупки, расходы и новая надбавка",
      pl: "Nieruchomości w Portugalii: zasady zakupu, koszty i nowa dopłata",
    },
    intro: {
      en: "Since May 2026 a non-resident buying a home in Portugal pays a flat 7.5% transfer tax with no relief of any kind — a rule most guides written before that date do not carry. There are three ways out of it, all of them about what you do after the purchase rather than who you are. And property no longer leads to residency at all: that route was closed in 2023, and the law now bars an investment aimed even indirectly at real estate.",
      ru: "С мая 2026 года нерезидент, покупающий жильё в Португалии, платит единую ставку налога на переход 7,5% — без единой льготы и скидки. Этой нормы нет почти ни в одном гиде, написанном раньше. Выходов из неё три, и все они про то, что вы делаете после покупки, а не про то, кто вы. А к ВНЖ недвижимость больше не ведёт вообще: маршрут закрыт в 2023 году, и закон теперь запрещает вложения в недвижимость даже косвенные.",
      pl: "Od maja 2026 nierezydent kupujący mieszkanie w Portugalii płaci jednolitą stawkę podatku od przeniesienia 7,5% — bez żadnej ulgi. Tej normy nie ma w niemal żadnym przewodniku napisanym wcześniej. Wyjścia są trzy i wszystkie dotyczą tego, co robisz po zakupie, a nie tego, kim jesteś. Do rezydencji nieruchomość zaś już nie prowadzi: ścieżkę zamknięto w 2023 roku, a ustawa zakazuje dziś inwestycji nakierowanych na nieruchomości nawet pośrednio.",
    },
    sourceNote: {
      en: "Verified against primary sources on 24 August 2026: the IMT Code art. 17, including para. 10 added by Decreto-Lei 97/2026 of 20 May 2026; the Stamp Duty general table; the IMI Code arts. 112 and 135-F; the IRS Code art. 72; the Casa Pronta tariff at justica.gov.pt; Decreto-Lei 128/2014 as amended by Decreto-Lei 76/2024 on local accommodation; art. 3 of Lei 23/2007 as amended by Lei 56/2023.",
      ru: "Сверено с первоисточниками 24 августа 2026 года: статья 17 Кодекса IMT, включая пункт 10, добавленный Decreto-Lei 97/2026 от 20 мая 2026; общая таблица гербового сбора; статьи 112 и 135-F Кодекса IMI; статья 72 Кодекса IRS; тариф Casa Pronta на justica.gov.pt; Decreto-Lei 128/2014 в редакции Decreto-Lei 76/2024 о местном размещении; статья 3 Lei 23/2007 в редакции Lei 56/2023.",
      pl: "Zweryfikowane ze źródłami pierwotnymi 24 sierpnia 2026: art. 17 Kodeksu IMT wraz z ust. 10 dodanym przez Decreto-Lei 97/2026 z 20 maja 2026; ogólna tabela opłaty skarbowej; art. 112 i 135-F Kodeksu IMI; art. 72 Kodeksu IRS; taryfa Casa Pronta na justica.gov.pt; Decreto-Lei 128/2014 w brzmieniu Decreto-Lei 76/2024 o zakwaterowaniu lokalnym; art. 3 Lei 23/2007 w brzmieniu Lei 56/2023.",
    },
    metaTitle: {
      en: "Buying property in Portugal — the 7.5% non-resident rate",
      ru: "Недвижимость в Португалии: надбавка 7,5% для нерезидентов",
      pl: "Nieruchomości w Portugalii: dopłata 7,5% dla nierezydentów",
    },
    metaDescription: {
      en: "The 2026 transfer-tax surcharge on non-resident buyers and the three ways out of it, the full cost stack, IMI and AIMI, the local accommodation regime, and why property no longer leads to residency.",
      ru: "Надбавка к налогу на переход для покупателей-нерезидентов 2026 года и три выхода из неё, полный состав расходов, IMI и AIMI, режим краткосрочной аренды и почему недвижимость больше не даёт ВНЖ.",
      pl: "Dopłata do podatku od przeniesienia dla nierezydentów z 2026 roku i trzy wyjścia z niej, pełny stos kosztów, IMI i AIMI, reżim najmu krótkoterminowego oraz dlaczego nieruchomość nie daje już rezydencji.",
    },
  },
  {
    country: "country-mt",
    slug: {
      en: "property-in-malta",
      ru: "nedvizhimost-na-malte",
      pl: "nieruchomosci-na-malcie",
    },
    title: {
      en: "Buying property in Malta: the permit, the 5% and the letting ban",
      ru: "Недвижимость на Мальте: разрешение, 5% и запрет сдавать",
      pl: "Nieruchomości na Malcie: zezwolenie, 5% i zakaz najmu",
    },
    intro: {
      en: "A buyer from outside the EU needs a ministerial permit for almost every purchase on Malta, and that permit carries a condition most people discover too late: the property may be used only as the buyer's own home and may not be let out at all. The same status closes every reduced rate of stamp duty, so a foreign buyer pays a flat 5%. Both rules fall away inside a Special Designated Area — which is why the SDA list matters more here than anywhere else on this site.",
      ru: "Покупателю из страны вне ЕС на Мальте почти на каждую покупку нужно разрешение министра, и в этом разрешении есть условие, о котором узнают слишком поздно: объект можно использовать только как собственное жильё, и сдавать его нельзя вовсе. Тот же статус закрывает все пониженные ставки гербового сбора — иностранец платит ровно 5%. Обе нормы отпадают внутри особой зоны, и поэтому список особых зон здесь важнее, чем где-либо ещё на этом сайте.",
      pl: "Kupujący spoza UE potrzebuje na Malcie zezwolenia ministra na niemal każdy zakup, a to zezwolenie zawiera warunek, o którym większość dowiaduje się za późno: nieruchomość może służyć wyłącznie jako własne mieszkanie kupującego i nie wolno jej wynajmować. Ten sam status zamyka wszystkie obniżone stawki opłaty skarbowej — cudzoziemiec płaci równe 5%. Obie zasady znikają wewnątrz strefy specjalnej, dlatego lista tych stref ma tu większe znaczenie niż gdziekolwiek indziej na tej stronie.",
    },
    sourceNote: {
      en: "Verified against primary sources on 24 August 2026: the Immovable Property (Acquisition by Non-Residents) Act, Cap. 246, arts. 4–7 and its First and Second Schedules; the Duty on Documents and Transfers Act, Cap. 364, art. 32 and S.L. 364.12, 364.17 and 364.19; the Income Tax Act art. 31D and the Commissioner's manual on rental income; the Tourism Accommodation Regulations 2026 (S.L. 409.24, L.N. 92 of 2026); S.L. 217.26 as amended by L.N. 310 of 2024 and L.N. 146 of 2025.",
      ru: "Сверено с первоисточниками 24 августа 2026 года: Закон о приобретении недвижимости нерезидентами, глава 246, статьи 4–7 и первое и второе приложения; Закон о гербовом сборе, глава 364, статья 32 и подзаконные акты 364.12, 364.17 и 364.19; статья 31D Закона о подоходном налоге и руководство комиссара по доходу от аренды; Tourism Accommodation Regulations 2026 (S.L. 409.24, L.N. 92 of 2026); S.L. 217.26 в редакции L.N. 310 of 2024 и L.N. 146 of 2025.",
      pl: "Zweryfikowane ze źródłami pierwotnymi 24 sierpnia 2026: ustawa o nabywaniu nieruchomości przez nierezydentów, rozdz. 246, art. 4–7 oraz załączniki pierwszy i drugi; ustawa o opłacie skarbowej, rozdz. 364, art. 32 i akty wykonawcze 364.12, 364.17 i 364.19; art. 31D ustawy o podatku dochodowym i podręcznik komisarza o dochodach z najmu; Tourism Accommodation Regulations 2026 (S.L. 409.24, L.N. 92 z 2026); S.L. 217.26 w brzmieniu L.N. 310 z 2024 i L.N. 146 z 2025.",
    },
    metaTitle: {
      en: "Buying property in Malta — AIP permit, duty and letting",
      ru: "Недвижимость на Мальте: разрешение AIP, сбор и аренда",
      pl: "Nieruchomości na Malcie: zezwolenie AIP, opłata i najem",
    },
    metaDescription: {
      en: "The AIP permit and what it forbids, the Special Designated Areas where it does not apply, why a foreign buyer pays a flat 5% duty, the 2026 short-let regime, and the MPRP property condition.",
      ru: "Разрешение AIP и что оно запрещает, особые зоны, где оно не нужно, почему иностранец платит ровно 5% сбора, режим краткосрочной аренды 2026 года и требование MPRP к объекту.",
      pl: "Zezwolenie AIP i czego zakazuje, strefy specjalne, gdzie nie obowiązuje, dlaczego cudzoziemiec płaci równe 5% opłaty, reżim najmu krótkoterminowego 2026 i warunek MPRP.",
    },
  },
  {
    country: "country-ae",
    slug: {
      en: "property-in-dubai",
      ru: "nedvizhimost-v-dubae",
      pl: "nieruchomosci-w-dubaju",
    },
    title: {
      en: "Buying property in Dubai: freehold areas, fees and the short-let tax trap",
      ru: "Недвижимость в Дубае: зоны фрихолда, сборы и налоговая ловушка посуточной сдачи",
      pl: "Nieruchomości w Dubaju: strefy freehold, opłaty i podatkowa pułapka najmu krótkoterminowego",
    },
    intro: {
      en: "Dubai is the easiest purchase on this site — no residency permit, no local bank account, the transfer itself takes about 25 minutes, and there is no annual property tax. Two things still catch people. A foreigner may own freehold only in designated areas, and the marketing name of a district is not the test. And letting short-term needs a permit, which turns rental income that was outside corporate tax into business income that is not.",
      ru: "Дубай — самая простая покупка на этом сайте: ни вида на жительство, ни местного счёта не нужно, сама передача занимает около 25 минут, ежегодного налога на недвижимость нет. Две вещи всё же подводят. Иностранец владеет полной собственностью только в отведённых зонах, и маркетинговое название района — не критерий. А для посуточной сдачи нужно разрешение, которое превращает доход, не попадавший под корпоративный налог, в предпринимательский, который под него попадает.",
      pl: "Dubaj to najprostszy zakup na tej stronie: nie trzeba ani pobytu, ani lokalnego konta, samo przeniesienie trwa około 25 minut, nie ma rocznego podatku od nieruchomości. Dwie rzeczy jednak zaskakują. Cudzoziemiec może mieć pełną własność tylko w wyznaczonych strefach, a marketingowa nazwa dzielnicy nie jest kryterium. Najem krótkoterminowy wymaga zaś zezwolenia, które zamienia dochód spoza podatku dochodowego od osób prawnych w dochód gospodarczy, który już mu podlega.",
    },
    sourceNote: {
      en: "Verified against primary sources on 24 August 2026: Dubai Law No. 7 of 2006 art. 4 and Regulation No. 3 of 2006 on areas open to non-UAE nationals; Executive Council Resolution No. 30 of 2013 and the Dubai Land Department's own service pages for fees; Law No. 6 of 2019 on jointly owned property for service charges; the Federal Tax Authority's guide on real estate investment for natural persons; Decree No. 41 of 2013 and Administrative Resolution No. 1 of 2020 on holiday homes; Cabinet Resolution No. 65 of 2022 on the golden residence.",
      ru: "Сверено с первоисточниками 24 августа 2026 года: статья 4 Закона Дубая № 7 от 2006 года и Регламент № 3 от 2006 года о зонах, открытых для неграждан ОАЭ; Резолюция Исполнительного совета № 30 от 2013 года и страницы услуг Земельного департамента Дубая по сборам; Закон № 6 от 2019 года о совместной собственности об эксплуатационных сборах; руководство Федеральной налоговой службы об инвестициях в недвижимость для физических лиц; Декрет № 41 от 2013 года и Административная резолюция № 1 от 2020 года о посуточном жилье; Резолюция Кабинета № 65 от 2022 года о золотом резидентстве.",
      pl: "Zweryfikowane ze źródłami pierwotnymi 24 sierpnia 2026: art. 4 prawa Dubaju nr 7 z 2006 i rozporządzenie nr 3 z 2006 o strefach otwartych dla nie-obywateli ZEA; rezolucja Rady Wykonawczej nr 30 z 2013 oraz strony usług Dubai Land Department o opłatach; prawo nr 6 z 2019 o współwłasności o opłatach eksploatacyjnych; przewodnik Federalnego Urzędu Podatkowego o inwestycjach w nieruchomości dla osób fizycznych; dekret nr 41 z 2013 i rezolucja administracyjna nr 1 z 2020 o najmie wakacyjnym; rezolucja rządu nr 65 z 2022 o złotej rezydencji.",
    },
    metaTitle: {
      en: "Buying property in Dubai — freehold areas, fees, taxes",
      ru: "Недвижимость в Дубае: зоны фрихолда, сборы и налоги",
      pl: "Nieruchomości w Dubaju: strefy freehold, opłaty i podatki",
    },
    metaDescription: {
      en: "Where a foreigner may own freehold, the full fee stack at the Land Department, what a Dubai owner pays every year, the holiday-home permit and its tax consequence, and the AED 2m golden visa.",
      ru: "Где иностранец может владеть полной собственностью, полный состав сборов Земельного департамента, что собственник платит каждый год, разрешение на посуточную сдачу и его налоговое последствие, золотая виза от 2 млн дирхамов.",
      pl: "Gdzie cudzoziemiec może mieć pełną własność, pełny stos opłat Land Department, co właściciel płaci co roku, zezwolenie na najem wakacyjny i jego skutek podatkowy oraz złota wiza od 2 mln dirhamów.",
    },
  },
];
