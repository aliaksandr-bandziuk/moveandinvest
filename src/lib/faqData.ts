import type { Locale } from "@/i18n/routing";
import { tightenDeep } from "./typography";

// The /faq page's questions and answers, in three languages.
//
// IN src/lib AND NOT IN THE CMS, for exactly the reason sourceData.ts gives.
// Most of these answers carry a threshold, a fee or a number of years, and the
// project's standing rule is that such a figure may not move in copy without
// its evidence moving in the same commit. A dataset editable in Studio routes
// straight around that rule: somebody softens "€800,000 across all of Attica"
// into "from €250,000" in a text field, /sources still says the true thing, and
// the site contradicts itself on the one subject it sells itself on. Which is
// not hypothetical — on 25 August 2026 this site was found stating two
// different things about one Greek statute on two different pages.
//
// The page HEAD — eyebrow, heading, deck, SEO — is ordinary page copy and does
// live in Sanity, in scripts/copy/faqPage.ts. Same split as /sources.
//
// --- Three rules for writing an answer here ---------------------------------
//
// LEAD WITH THE ANSWER. Yes, no, or the number, in the first clause. The
// explanation comes second. An answer engine lifts the opening sentence and
// discards the run-up, and a reader on a phone does the same thing with their
// thumb. If the honest answer is "it depends", the same sentence says what on.
//
// EVERY FIGURE CARRIES ITS SECTION IN /sources. `sources` below is a list of
// SourceSection keys, rendered as a link under the answer. An answer with a
// figure and an empty `sources` is a defect — that is the entire difference
// between this page and the fourteen competitor FAQs surveyed on 25 August
// 2026, none of which attached a primary source to a single answer.
//
// WHERE NO PRIMARY SOURCE EXISTS, SAY SO IN THE ANSWER. Not "generally yes",
// not silence — the sentence "no primary source publishes this, so we do not
// state it" is itself the answer, and it is the most valuable kind of answer
// this site can give. Four claims on /sources carry the verdict `unverified`
// for this reason and they are the honest core of question 60.

export interface FaqItem {
  /** Stable key. Also the anchor id, so an answer can be linked to directly. */
  key: string;
  q: Record<Locale, string>;
  a: Record<Locale, string>;
  /** SourceSection keys in sourceData.ts whose rows back the figures in `a`.
   *  Empty ONLY when the answer states no figure at all. */
  sources: string[];
  /** Country ids the answer is specific to. Empty means all five. */
  countries: string[];
  /** True for the handful also published as `faqItem` documents and shown in
   *  the home page's FAQ section. The text lives here and only here; the seed
   *  script reads it from this file. */
  home?: boolean;
}

export interface FaqSection {
  key: string;
  title: Record<Locale, string>;
  /** One sentence under the section heading. Not a summary of the answers —
   *  the reason the section exists. */
  intro: Record<Locale, string>;
  items: FaqItem[];
}

const FAQ_SECTIONS_RAW: FaqSection[] = [
  // === 1. Start here ========================================================
  {
    key: "start",
    title: {
      en: "Start here",
      ru: "С чего начать",
      pl: "Od czego zacząć",
    },
    intro: {
      en: "What the thing actually is, before any number is worth reading.",
      ru: "Что это вообще такое — прежде чем какая-либо цифра станет осмысленной.",
      pl: "Czym to właściwie jest — zanim jakakolwiek liczba nabierze sensu.",
    },
    items: [
      {
        key: "what-is",
        countries: [],
        sources: [],
        q: {
          en: "What is a golden visa, exactly?",
          ru: "Что такое «золотая виза», если по существу?",
          pl: "Czym właściwie jest „złota wiza”?",
        },
        a: {
          en: "A residence permit granted because you placed a defined amount of money in the country — not because you have a job offer there, family there, or protection needs. That is the whole of the idea. It is not a passport and not a travel visa, and none of these five states calls it a golden visa in its own law: Portugal issues an ARI, Greece a residence permit for investment activity, Malta a permanent residence certificate, the UAE a ten-year golden residence. The marketing name is the market's, which is worth knowing before you read anyone else's page about it.",
          ru: "Это вид на жительство, который дают за то, что вы вложили в страну определённую сумму, — а не за приглашение на работу, семью или потребность в защите. В этом вся суть. Это не паспорт и не туристическая виза, и ни одно из пяти государств не называет это «золотой визой» в своём законе: Португалия выдаёт ARI, Греция — разрешение на пребывание для инвестиционной деятельности, Мальта — сертификат постоянного резидентства, ОАЭ — десятилетнее золотое резидентство. Рекламное имя придумал рынок, и это стоит знать до того, как читать чужие страницы об этом.",
          pl: "To zezwolenie na pobyt wydane dlatego, że ulokowałeś w kraju określoną kwotę — a nie dlatego, że masz tam ofertę pracy, rodzinę czy potrzebę ochrony. To cała idea. To nie paszport i nie wiza turystyczna, i żadne z tych pięciu państw nie nazywa tego „złotą wizą” we własnym prawie: Portugalia wydaje ARI, Grecja zezwolenie na pobyt dla działalności inwestycyjnej, Malta certyfikat rezydencji stałej, ZEA dziesięcioletnią złotą rezydencję. Nazwa marketingowa należy do rynku, i warto o tym wiedzieć, zanim przeczyta się cudzą stronę na ten temat.",
        },
      },
      {
        key: "permit-vs-citizenship",
        countries: [],
        sources: ["citizenship"],
        q: {
          en: "Residence permit, permanent residence, citizenship — what is the difference?",
          ru: "ВНЖ, ПМЖ и гражданство — в чём разница?",
          pl: "Zezwolenie na pobyt, rezydencja stała, obywatelstwo — jaka różnica?",
        },
        a: {
          en: "A residence permit lets you live in one country for a fixed term and has to be renewed; lose the ground it rests on and you lose it. Permanent residence removes the renewal but is still a permission the state grants. Citizenship is a passport, a vote, and a status a state cannot casually withdraw. All five routes here begin at the first of the three. Four of them have a path to the third — Portugal, Greece, Malta and Cyprus — and the UAE has none an investor can rely on: naturalisation there is by nomination and at discretion, not something a golden residence earns.",
          ru: "ВНЖ даёт право жить в одной стране ограниченный срок и требует продления; исчезнет основание — исчезнет и статус. ПМЖ снимает продление, но остаётся разрешением, которое даёт государство. Гражданство — это паспорт, голос и статус, который государство не может отобрать походя. Все пять маршрутов начинаются с первого. Путь к третьему есть у четырёх — Португалия, Греция, Мальта, Кипр, — а у ОАЭ его нет в том виде, на который инвестор мог бы рассчитывать: натурализация там идёт по выдвижению и по усмотрению, а не как следствие золотого резидентства.",
          pl: "Zezwolenie na pobyt pozwala mieszkać w jednym kraju przez określony czas i wymaga odnowienia; zniknie podstawa — zniknie status. Rezydencja stała znosi odnawianie, ale wciąż jest zgodą, której udziela państwo. Obywatelstwo to paszport, głos i status, którego państwo nie odbiera mimochodem. Wszystkie pięć ścieżek zaczyna się od pierwszego. Cztery mają drogę do trzeciego — Portugalia, Grecja, Malta i Cypr — a ZEA nie mają żadnej, na której inwestor mógłby polegać: naturalizacja odbywa się tam z nominacji i uznaniowo, a nie jako skutek złotej rezydencji.",
        },
      },
      {
        key: "which-one",
        countries: [],
        sources: ["pt", "citizenship"],
        q: {
          en: "Which of the five is right for me?",
          ru: "Какая из пяти юрисдикций подходит мне?",
          pl: "Która z pięciu jurysdykcji jest dla mnie?",
        },
        a: {
          en: "Nobody can answer that from a table, this site included — but three questions narrow it quickly. If the point is an EU passport, the deciding factor is how many years of real residence you will actually do, because that is what the clock counts and a permit needing a few days a year accrues nothing. If the point is a low price with almost no obligation afterwards, the UAE removes most of what the EU routes ask of you, and removes the passport along with it. If the point is buying property, Portugal is already out: property stopped qualifying there in 2023.",
          ru: "По таблице этого не решить — включая нашу, — но три вопроса сужают выбор быстро. Если цель паспорт ЕС, решает то, сколько лет реального проживания вы готовы прожить: считается именно оно, а статус, требующий нескольких дней в году, сам по себе не копит ничего. Если цель низкая цена и минимум обязательств после, ОАЭ снимают большую часть того, что требуют европейские маршруты, — вместе с паспортом. Если цель купить недвижимость, Португалия отпадает сразу: там недвижимость перестала давать право в 2023 году.",
          pl: "Z tabeli tego nie da się rozstrzygnąć — także z naszej — ale trzy pytania szybko zawężają wybór. Jeśli celem jest paszport UE, decyduje, ile lat faktycznego pobytu naprawdę przeżyjesz: liczy się właśnie to, a status wymagający kilku dni w roku sam z siebie nie nalicza nic. Jeśli celem jest niska cena i minimum zobowiązań później, ZEA zdejmują większość tego, czego wymagają ścieżki unijne — razem z paszportem. Jeśli celem jest zakup nieruchomości, Portugalia odpada od razu: nieruchomości przestały tam kwalifikować w 2023 roku.",
        },
      },
      {
        key: "must-live",
        countries: [],
        sources: ["citizenship"],
        home: true,
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
        key: "work-in-eu",
        countries: [],
        sources: [],
        home: true,
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
    ],
  },

  // === 2. Cheapest, fastest, simplest ======================================
  // The section competitors build their whole FAQ around when they build one
  // at all — and the only one where a comparison site has something an agency
  // structurally cannot say, because an agency sells one of the five.
  {
    key: "compare",
    title: {
      en: "Cheapest, fastest, simplest",
      ru: "Где дешевле, быстрее, проще",
      pl: "Gdzie taniej, szybciej, prościej",
    },
    intro: {
      en: "The questions people actually type. Every figure below links to the statute it came from.",
      ru: "Вопросы, которые действительно набирают. Каждая цифра ниже ведёт к закону, из которого взята.",
      pl: "Pytania, które ludzie naprawdę wpisują. Każda liczba poniżej prowadzi do ustawy, z której pochodzi.",
    },
    items: [
      {
        key: "cheapest-entry",
        countries: [],
        sources: ["pt", "gr", "mt", "ae", "cy"],
        q: {
          en: "Where is the entry threshold lowest?",
          ru: "Где самый низкий порог входа?",
          pl: "Gdzie próg wejścia jest najniższy?",
        },
        a: {
          en: "On the threshold alone, Greece — but only in a narrow case most buyers do not qualify for. Since 1 September 2024 Greece has three tiers: €800,000 across Attica, the Thessaloniki regional unit, Mykonos, Thira and islands above 3,100 people; €400,000 everywhere else; and €250,000 only by exception, for converting premises to residential use, rebuilding an industrial building idle five years, or fully restoring a listed one — with the works finished before you file. Otherwise: Malta €375,000 to buy or €14,000 a year to rent, the UAE AED 2,000,000 (about €490,000 at 4.08), Portugal €500,000 into a fund. For Cyprus we publish no figure: the threshold in its regulation 6(2) could not be established from any primary source.",
          ru: "По одному лишь порогу — Греция, но только в узком случае, под который большинство покупателей не подходит. С 1 сентября 2024 года там три уровня: €800 000 — вся Аттика, номовая единица Салоники, Миконос, Тира и острова с населением свыше 3 100; €400 000 — остальная страна; €250 000 — только как исключение: перевод помещений в жилые, реконструкция промышленного здания, простаивавшего пять лет, или полная реставрация памятника, причём работы должны быть закончены до подачи. В остальном: Мальта — €375 000 на покупку или €14 000 в год на аренду, ОАЭ — AED 2 000 000 (около €490 000 по курсу 4,08), Португалия — €500 000 в фонд. По Кипру мы цифру не публикуем: порог в его регламенте 6(2) не удалось установить ни по одному первоисточнику.",
          pl: "Po samym progu — Grecja, ale wyłącznie w wąskim przypadku, do którego większość kupujących się nie kwalifikuje. Od 1 września 2024 obowiązują tam trzy poziomy: €800 000 — cała Attyka, jednostka regionalna Saloniki, Mykonos, Thira i wyspy powyżej 3 100 mieszkańców; €400 000 — reszta kraju; €250 000 — tylko jako wyjątek: zmiana przeznaczenia lokali na mieszkalne, przebudowa budynku przemysłowego nieużywanego przez pięć lat albo pełna renowacja zabytku, przy czym prace muszą być zakończone przed złożeniem wniosku. Poza tym: Malta €375 000 na zakup albo €14 000 rocznie na najem, ZEA AED 2 000 000 (około €490 000 po kursie 4,08), Portugalia €500 000 w fundusz. Dla Cypru nie publikujemy liczby: progu z jego rozporządzenia 6(2) nie udało się ustalić z żadnego źródła pierwotnego.",
        },
      },
      {
        key: "cheapest-total",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "And where is it cheapest once every fee is counted?",
          ru: "А где дешевле, если считать все сборы?",
          pl: "A gdzie taniej, gdy policzyć wszystkie opłaty?",
        },
        a: {
          en: "The UAE, and the order changes from the previous answer — which is the point of asking both. On top of the investment: the UAE about €31,000, of which roughly €22,000 is officially set — the 4% registration fee from Executive Council Resolution 30 of 2013, the title deed, the trustee, and AED 9,884.75 of golden visa fees — and the rest is the 2% agent commission, which no law or RERA rule sets or caps. Greece about €34,000 at the €400,000 tier and about €67,000 at €800,000. Portugal roughly €30,000–50,000 for one applicant and €65,000–90,000 for a family of three, once a lawyer and fund commissions are in. Malta about €126,000 above the price of the property, which is the highest here by a distance and is mostly the €60,000 administrative fee and the €37,000 contribution.",
          ru: "ОАЭ — и порядок отличается от предыдущего ответа, ради чего оба вопроса и заданы. Сверх самой инвестиции: ОАЭ — около €31 000, из которых примерно €22 000 установлены официально: регистрационные 4% по Резолюции Исполнительного совета № 30 от 2013 года, свидетельство о праве, доверенный центр и AED 9 884,75 сборов за золотую визу. Остальное — комиссия агента 2%, которую ни закон, ни правила RERA не устанавливают и не ограничивают. Греция — около €34 000 на уровне €400 000 и около €67 000 на €800 000. Португалия — примерно €30 000–50 000 на одного и €65 000–90 000 на семью из трёх, вместе с юристом и комиссиями фонда. Мальта — около €126 000 сверх цены объекта, и это с отрывом больше всех: в основном административный сбор €60 000 и взнос €37 000.",
          pl: "ZEA — i kolejność różni się od poprzedniej odpowiedzi, po to oba pytania zadano. Ponad samą inwestycję: ZEA około €31 000, z czego mniej więcej €22 000 jest ustalone urzędowo: 4% opłaty rejestracyjnej z Rezolucji Rady Wykonawczej nr 30 z 2013 roku, akt własności, centrum rejestracyjne i AED 9 884,75 opłat za złotą wizę. Reszta to 2% prowizji pośrednika, której żadne prawo ani przepis RERA nie ustala ani nie ogranicza. Grecja około €34 000 na poziomie €400 000 i około €67 000 na €800 000. Portugalia mniej więcej €30 000–50 000 dla jednej osoby i €65 000–90 000 dla rodziny trzyosobowej, wraz z prawnikiem i prowizjami funduszu. Malta około €126 000 ponad cenę nieruchomości — najwięcej tutaj z dużym marginesem, głównie opłata administracyjna €60 000 i wkład €37 000.",
        },
      },
      {
        key: "fastest",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Where is the permit fastest in practice?",
          ru: "Где быстрее всего получить пермит на практике?",
          pl: "Gdzie zezwolenie jest w praktyce najszybsze?",
        },
        a: {
          en: "The UAE, and not narrowly: title deed to Emirates ID runs about two to four weeks, against published figures of 7–10 working days at the DLD and about 5 at GDRFA. Greece issues no permit on a deadline at all, but a βεβαίωση at filing already confers lawful residence and the permit's rights until a decision — in November 2025 there were 13,499 cases pending, 10,703 of them in Attica. Portugal is the slow one and the gap is not small: the statute allows 90 days, and in practice it runs one to three years, with roughly 30,000 cases pending at AIMA on 4 August 2026. For Malta we state nothing — no primary source publishes a processing time, so the widely quoted “4–6 months” is not something we will repeat.",
          ru: "ОАЭ, и с большим отрывом: от свидетельства о праве до Emirates ID проходит примерно две-четыре недели, при заявленных 7–10 рабочих днях у DLD и около 5 у GDRFA. В Греции срока выдачи в законе нет вовсе, но выдаваемая при подаче βεβαίωση сама по себе даёт законное пребывание и права по разрешению до решения; на ноябрь 2025 года нерассмотренных дел было 13 499, из них 10 703 в Аттике. Португалия — медленная, и разрыв немаленький: закон даёт 90 дней, на практике проходит от года до трёх, а на 4 августа 2026 года у AIMA было около 30 000 нерассмотренных дел. По Мальте мы не говорим ничего: срок рассмотрения не публикует ни один первоисточник, поэтому ходовые «4–6 месяцев» мы повторять не будем.",
          pl: "ZEA, i to z dużą przewagą: od aktu własności do Emirates ID mija około dwóch do czterech tygodni, przy podawanych 7–10 dniach roboczych w DLD i około 5 w GDRFA. Grecja w ogóle nie ma ustawowego terminu wydania, ale wydawana przy złożeniu βεβαίωση sama daje legalny pobyt i prawa z zezwolenia do czasu decyzji; w listopadzie 2025 czekało 13 499 spraw, z czego 10 703 w Attyce. Portugalia jest wolna, a różnica niemała: ustawa daje 90 dni, w praktyce mija rok do trzech, a 4 sierpnia 2026 AIMA miała około 30 000 nierozpatrzonych spraw. O Malcie nie mówimy nic: żadne źródło pierwotne nie publikuje czasu rozpatrywania, więc obiegowych „4–6 miesięcy” nie będziemy powtarzać.",
        },
      },
      {
        // KEY UNCHANGED FROM THE ORIGINAL faqItem. The question moved from the
        // home page's flat list into the comparison section, but its key is the
        // id of three already-published Sanity documents
        // (faqItem-citizenship-years-{en,ru,pl}); renaming it would orphan them
        // and silently drop the answer from the home page.
        key: "citizenship-years",
        countries: [],
        sources: ["citizenship"],
        home: true,
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
        key: "least-obligation",
        countries: [],
        sources: ["ae", "mt"],
        q: {
          en: "Which asks the least of me once I have it?",
          ru: "Где меньше всего требуют после получения?",
          pl: "Która wymaga ode mnie najmniej po uzyskaniu?",
        },
        a: {
          en: "The UAE, on every measure that costs a person time. Golden residence holders are exempt from the 180-day absence rule that ordinarily voids a UAE residence visa — confirmed by both the federal portal and GDRFA — there is no personal income tax, and the permit runs ten years rather than needing renewal every two or five. The trade is that the property may not be disposed of during those ten years, and a lien is registered against it to make sure of it. Malta is at the other end: five years of holding the qualifying property, an agent you are required to use, and an Agency whose decisions are final and cannot be appealed.",
          ru: "ОАЭ — по каждому признаку, который стоит человеку времени. Держатели золотого резидентства освобождены от правила 180 дней, которое иначе аннулирует эмиратский ВНЖ (подтверждают и федеральный портал, и GDRFA), подоходного налога нет, а сам статус даётся на десять лет, а не продлевается каждые два или пять. Плата за это — объектом нельзя распорядиться все десять лет, и на него ставится залог, который это обеспечивает. Мальта на другом конце: пять лет держания объекта, обязательный лицензированный агент и Агентство, решения которого окончательны и обжалованию не подлежат.",
          pl: "ZEA — pod każdym względem, który kosztuje człowieka czas. Posiadacze złotej rezydencji są zwolnieni z zasady 180 dni, która inaczej unieważnia emirackie zezwolenie na pobyt (potwierdzają to portal federalny i GDRFA), nie ma podatku dochodowego, a status wydaje się na dziesięć lat zamiast odnawiania co dwa lub pięć. Ceną jest to, że nieruchomością nie wolno rozporządzać przez całe dziesięć lat, a dla pewności wpisuje się na niej zastaw. Malta jest na drugim końcu: pięć lat utrzymania nieruchomości, obowiązkowy licencjonowany agent i Agencja, której decyzje są ostateczne i nie podlegają zaskarżeniu.",
        },
      },
      {
        key: "which-not",
        countries: [],
        sources: ["mt", "pt", "cy"],
        q: {
          en: "Which of the five would you not recommend?",
          ru: "Какую из пяти вы бы не советовали?",
          pl: "Której z pięciu byś nie polecił?",
        },
        a: {
          en: "We do not sell any of them, so here is the plain version. Cyprus we would not choose today, and we say so by publishing no threshold for it: two of its three checked figures could not be established from any primary source, and a route whose price cannot be verified is a route you cannot compare. Malta is the most expensive by a wide margin and the only one of the five where a refusal cannot be appealed — its own regulation 19(1) says decisions are final. Portugal asks you to accept a wait the statute does not describe: 90 days on paper, one to three years in practice. None of that makes them wrong for a given person; it makes them the three where the brochure and the statute diverge most.",
          ru: "Мы ни одну из них не продаём, поэтому вот прямой ответ. Кипр мы бы сегодня не выбрали — и говорим это тем, что не публикуем по нему порога: две из трёх проверенных цифр не удалось установить ни по одному первоисточнику, а маршрут, цену которого нельзя проверить, нельзя и сравнить. Мальта заметно дороже всех и единственная из пяти, где отказ нельзя обжаловать: её собственный регламент 19(1) объявляет решения окончательными. Португалия просит согласиться на ожидание, которого нет в законе: 90 дней на бумаге и от года до трёх на деле. Ничто из этого не делает их плохими для конкретного человека — это просто три места, где буклет и закон расходятся сильнее всего.",
          pl: "Żadnej z nich nie sprzedajemy, więc odpowiadamy wprost. Cypru dziś byśmy nie wybrali — i mówimy to, nie publikując dla niego progu: dwóch z trzech sprawdzonych liczb nie dało się ustalić z żadnego źródła pierwotnego, a ścieżki, której ceny nie można zweryfikować, nie da się też porównać. Malta jest wyraźnie najdroższa i jako jedyna z piątki nie dopuszcza odwołania od odmowy: jej własne rozporządzenie 19(1) uznaje decyzje za ostateczne. Portugalia prosi o zgodę na oczekiwanie, którego ustawa nie opisuje: 90 dni na papierze, rok do trzech w praktyce. Nic z tego nie czyni ich złymi dla konkretnej osoby — to po prostu trzy miejsca, gdzie broszura i ustawa rozchodzą się najbardziej.",
        },
      },
    ],
  },
  // === 3. Money: thresholds and what it really costs =======================
  {
    key: "money",
    title: {
      en: "Money: thresholds and what it really costs",
      ru: "Деньги: пороги и полная стоимость",
      pl: "Pieniądze: progi i pełny koszt",
    },
    intro: {
      en: "The threshold is the number in the brochure. The other number is the one people are not ready for.",
      ru: "Порог — это цифра из буклета. Вторая цифра — та, к которой обычно не готовы.",
      pl: "Próg to liczba z broszury. Druga liczba to ta, na którą zwykle nikt nie jest gotowy.",
    },
    items: [
      {
        key: "whats-on-top",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "What does “on top” consist of?",
          ru: "Из чего складывается «сверх того»?",
          pl: "Z czego składa się „ponad to”?",
        },
        a: {
          en: "Four things, in falling order of size: a purchase tax where property is involved, the state's own fees, a mandatory contribution where one exists, and professional fees. Greece takes 3.09% transfer tax — 3% plus a 3% municipal surcharge on the tax itself — and charges a €2,000 e-paravolo plus €16 for the card. Malta takes 5% stamp duty and then the largest fixed block on this site: €60,000 administration, €37,000 contribution, €2,000 NGO donation, €500 per card. Portugal charges €842.80 to consider a file, €8,418.90 to issue and €4,210.30 to renew, less 25% filed online. The UAE charges AED 9,884.75 in one window. Only professional fees are negotiable; none of the rest is.",
          ru: "Из четырёх вещей, по убыванию: налог при покупке, если речь о недвижимости, собственные сборы государства, обязательный взнос там, где он есть, и гонорары. Греция берёт 3,09% налога на переход права — 3% плюс муниципальная надбавка 3% на сам налог — и э-параволо €2 000 плюс €16 за карту. Мальта берёт 5% гербового сбора и дальше самый крупный фиксированный блок на этом сайте: €60 000 административный сбор, €37 000 взнос, €2 000 пожертвование НКО, €500 за карту. Португалия — €842,80 за рассмотрение, €8 418,90 за выдачу, €4 210,30 за продление, минус 25% при подаче онлайн. ОАЭ — AED 9 884,75 в одном окне. Договориться можно только о гонорарах, обо всём остальном — нет.",
          pl: "Z czterech rzeczy, malejąco: podatek przy zakupie, jeśli w grę wchodzi nieruchomość, własne opłaty państwa, obowiązkowy wkład tam, gdzie istnieje, i honoraria. Grecja bierze 3,09% podatku od przeniesienia — 3% plus 3% dopłaty gminnej od samego podatku — oraz e-paravolo €2 000 plus €16 za kartę. Malta bierze 5% opłaty skarbowej, a dalej największy stały blok na tej stronie: €60 000 opłaty administracyjnej, €37 000 wkładu, €2 000 darowizny na NGO, €500 za kartę. Portugalia — €842,80 za rozpatrzenie, €8 418,90 za wydanie, €4 210,30 za odnowienie, minus 25% przy złożeniu online. ZEA — AED 9 884,75 w jednym okienku. Negocjowalne są tylko honoraria, reszta nie.",
        },
      },
      {
        key: "lawyer-fees-included",
        countries: [],
        sources: ["pt", "ae"],
        q: {
          en: "Do your figures include lawyers' fees?",
          ru: "Входят ли в ваши цифры гонорары юристов?",
          pl: "Czy wasze liczby obejmują honoraria prawników?",
        },
        a: {
          en: "Only where we say so, and we say so because a fee nobody publishes cannot be checked. Government charges are named exactly, from the tariff. Professional fees are given as a range and marked as a range — Portugal's €30,000–50,000 for a single applicant is mostly lawyer and fund commissions, not state fees, which come to about €13,470 to the first renewal. Where a cost is market practice rather than an official tariff we name it and refuse to add it into a total: Dubai's 4% registration and 2% agent commission are real money and are not confirmed by any official page, so they sit outside the sum rather than inside it.",
          ru: "Только там, где мы это говорим, — и говорим потому, что сбор, который никто не публикует, нельзя проверить. Государственные сборы названы точно, по тарифу. Гонорары даны диапазоном и помечены как диапазон: португальские €30 000–50 000 на одного заявителя — это в основном юрист и комиссии фонда, а не сборы государства, которые до первого продления составляют около €13 470. Там, где расход — рыночная практика, а не официальный тариф, мы его называем и отказываемся класть в сумму: дубайские 4% регистрации и 2% комиссии агента — реальные деньги, но их не подтверждает ни одна официальная страница, поэтому они стоят рядом с итогом, а не внутри него.",
          pl: "Tylko tam, gdzie to mówimy — a mówimy, bo opłaty, której nikt nie publikuje, nie da się sprawdzić. Opłaty państwowe podano dokładnie, z taryfy. Honoraria podano jako przedział i oznaczono jako przedział: portugalskie €30 000–50 000 dla jednego wnioskodawcy to głównie prawnik i prowizje funduszu, a nie opłaty państwa, które do pierwszego odnowienia wynoszą około €13 470. Tam, gdzie koszt jest praktyką rynkową, a nie oficjalną taryfą, nazywamy go i odmawiamy wliczenia do sumy: dubajskie 4% rejestracji i 2% prowizji agenta to realne pieniądze, których nie potwierdza żadna oficjalna strona, więc stoją obok sumy, a nie w niej.",
        },
      },
      {
        key: "per-person-or-family",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Is the threshold per person or per family?",
          ru: "Порог считается на человека или на семью?",
          pl: "Czy próg liczy się na osobę czy na rodzinę?",
        },
        a: {
          en: "The investment is per family — one qualifying investment covers everybody on the application, everywhere here. The fees are not, and that is where a family budget goes wrong. Portugal charges the full €8,418.90 issuing fee for each reunified family member, the same rate as the main applicant, which is why one applicant runs about €13,470 in state fees to the first renewal and a family of three runs about €40,400. Malta charges €7,500 per dependant but exempts the spouse, minor children and an adult child with a disability, so in practice it falls on adult dependent children and on parents or grandparents. The UAE charges AED 5,774.50 per dependant. Greece publishes no family-member fee in its procedural decision at all, so we state none.",
          ru: "Инвестиция считается на семью: одна квалифицирующая инвестиция покрывает всех в заявлении, и так везде. Сборы — нет, и именно здесь семейный бюджет рушится. Португалия берёт полные €8 418,90 за выдачу с каждого воссоединяемого члена семьи, по той же ставке, что и с основного заявителя: поэтому один заявитель до первого продления — около €13 470 сборов, а семья из трёх — около €40 400. Мальта берёт €7 500 за иждивенца, но освобождает супруга, несовершеннолетних детей и взрослого ребёнка с инвалидностью, так что на практике сбор ложится на взрослых детей на иждивении и на родителей с дедами. ОАЭ — AED 5 774,50 за иждивенца. Греция в своём порядке вообще не устанавливает сбора за члена семьи, поэтому цифры мы не называем.",
          pl: "Inwestycja liczy się na rodzinę: jedna kwalifikująca inwestycja obejmuje wszystkich we wniosku, wszędzie tutaj. Opłaty już nie — i właśnie tu rozsypuje się rodzinny budżet. Portugalia pobiera pełne €8 418,90 za wydanie od każdego łączonego członka rodziny, w tej samej stawce co od głównego wnioskodawcy: dlatego jeden wnioskodawca do pierwszego odnowienia to około €13 470 opłat, a rodzina trzyosobowa około €40 400. Malta pobiera €7 500 za osobę zależną, ale zwalnia małżonka, małoletnie dzieci i dorosłe dziecko z niepełnosprawnością, więc w praktyce opłata dotyczy dorosłych dzieci na utrzymaniu oraz rodziców i dziadków. ZEA — AED 5 774,50 za osobę zależną. Grecja w swoim trybie w ogóle nie ustala opłaty za członka rodziny, więc żadnej nie podajemy.",
        },
      },
      {
        key: "money-back",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Can I get the money back, and when?",
          ru: "Можно ли вернуть деньги и когда?",
          pl: "Czy można odzyskać pieniądze i kiedy?",
        },
        a: {
          en: "Some of it, and later than most people assume — but the money and the status are two separate questions and only one of them has a fixed date. Portugal's fund subscription must be held five years and the fund itself decides liquidity. Malta requires the qualifying property for five years, after which any residential property in Malta or Gozo, owned or rented, will do. Greece sets no separate holding term at all: the permit renews only while you still own the property, so the term is however long you want the status. The UAE forbids disposing of the property for the whole ten years and registers a lien to enforce it. What never comes back anywhere: government fees, contributions, transfer taxes and the Maltese donation.",
          ru: "Часть — и позже, чем обычно думают; при этом деньги и статус это два разных вопроса, и фиксированная дата есть только у одного. Португальскую подписку на фонд надо держать пять лет, а ликвидность определяет сам фонд. Мальта требует квалифицирующий объект пять лет, после чего годится любое жильё на Мальте или Гозо, в собственности или в аренде. Греция отдельного срока держания не ставит вовсе: разрешение продлевается, только пока объект ваш, — значит срок равен тому, сколько вам нужен статус. ОАЭ запрещают распоряжаться объектом все десять лет и ставят на него залог. Что не возвращается нигде: государственные сборы, взносы, налоги при покупке и мальтийское пожертвование.",
          pl: "Część — i później, niż się zwykle zakłada; przy czym pieniądze i status to dwie osobne sprawy, a stałą datę ma tylko jedna. Portugalską subskrypcję funduszu trzeba trzymać pięć lat, a płynność ustala sam fundusz. Malta wymaga kwalifikującej nieruchomości przez pięć lat, potem wystarczy dowolne mieszkanie na Malcie lub Gozo, własne albo wynajęte. Grecja w ogóle nie ustala osobnego okresu utrzymania: zezwolenie odnawia się tylko dopóki nieruchomość jest twoja — więc okres równa się temu, jak długo potrzebujesz statusu. ZEA zakazują rozporządzania nieruchomością przez całe dziesięć lat i wpisują na niej zastaw. Czego nie odzyskuje się nigdzie: opłat państwowych, wkładów, podatków od zakupu i maltańskiej darowizny.",
        },
      },
      {
        key: "currency-move",
        countries: ["country-ae"],
        sources: ["ae", "pt"],
        q: {
          en: "What happens to the figures if the exchange rate moves?",
          ru: "Что будет с цифрами, если сдвинется курс?",
          pl: "Co stanie się z liczbami, gdy zmieni się kurs?",
        },
        a: {
          en: "For the UAE the threshold does not move and the euro figure does, because the law is written in dirhams: AED 2,000,000 is the requirement, and the €490,000 beside it on this site is that amount at a rate of 4.08. If the rate moves, the euro number is wrong and the dirham number is not — so treat the dirham as the requirement and the euro as an illustration. The euro thresholds have their own kind of drift: Portugal's state fees are indexed automatically every 1 March under article 3 of the tariff, against the previous year's consumer price index excluding housing. Nobody publishes an announcement when that happens. The figures on this page are the ones in force after the 1 March 2026 step.",
          ru: "У ОАЭ порог не двигается, а двигается цифра в евро, потому что закон написан в дирхамах: требование — AED 2 000 000, а стоящие рядом на этом сайте €490 000 это та же сумма по курсу 4,08. Сдвинется курс — неверной станет цифра в евро, а не в дирхамах, поэтому требованием считайте дирхамы, а евро иллюстрацией. У евровых порогов свой дрейф: португальские государственные сборы индексируются автоматически каждое 1 марта по ст. 3 тарифа, по индексу потребительских цен без жилья за прошлый год. Объявления об этом никто не публикует. Цифры на этой странице — те, что действуют после шага 1 марта 2026 года.",
          pl: "W ZEA próg się nie zmienia, zmienia się liczba w euro, bo ustawa jest napisana w dirhamach: wymogiem jest AED 2 000 000, a stojące obok na tej stronie €490 000 to ta sama kwota po kursie 4,08. Gdy kurs się ruszy, błędna staje się liczba w euro, nie w dirhamach — więc wymogiem są dirhamy, a euro ilustracją. Progi w euro mają własny dryf: portugalskie opłaty państwowe indeksują się automatycznie każdego 1 marca na mocy art. 3 taryfy, według zeszłorocznego indeksu cen konsumenckich bez mieszkania. Nikt tego nie ogłasza. Liczby na tej stronie to te obowiązujące po kroku z 1 marca 2026.",
        },
      },
    ],
  },

  // === 4. Property as a route ==============================================
  {
    key: "property",
    title: {
      en: "Property as a route",
      ru: "Недвижимость как маршрут",
      pl: "Nieruchomość jako ścieżka",
    },
    intro: {
      en: "The route most people arrive expecting — and the one that has narrowed most in three years.",
      ru: "Маршрут, за которым приходит большинство, — и тот, что сузился за три года сильнее всех.",
      pl: "Ścieżka, po którą przychodzi większość — i ta, która przez trzy lata zawęziła się najbardziej.",
    },
    items: [
      {
        key: "no-property",
        countries: ["country-pt"],
        sources: ["pt"],
        home: true,
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
        key: "where-property-works",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Where does property still work as a route?",
          ru: "Где недвижимость всё ещё работает как маршрут?",
          pl: "Gdzie nieruchomość wciąż działa jako ścieżka?",
        },
        a: {
          en: "Greece, Malta, the UAE and Cyprus — not Portugal, and not partly. Article 53 of Lei 56/2023 repealed both Portuguese property options outright, and article 3(5) goes further: it bars any investment aimed at real estate even indirectly, which closes the property-fund workaround people still ask about. Greece requires one single property of at least 120 m² of principal space, and several properties may no longer be added together to reach a threshold — they could before 2024, and guidance written earlier still says so. The UAE is the opposite: one or more properties may be combined to reach AED 2,000,000, confirmed by both the Land Department and GDRFA.",
          ru: "Греция, Мальта, ОАЭ и Кипр — но не Португалия, и не частично. Ст. 53 Lei 56/2023 отменила обе португальские «недвижимые» опции целиком, а ст. 3(5) идёт дальше: она запрещает инвестиции, направленные в недвижимость даже косвенно, — и это закрывает обходной путь через фонд недвижимости, о котором до сих пор спрашивают. Греция требует один объект площадью не менее 120 м² основных помещений, и складывать несколько объектов до порога больше нельзя — можно было до 2024 года, и написанные раньше инструкции до сих пор так и говорят. ОАЭ — наоборот: один или несколько объектов можно складывать до AED 2 000 000, это подтверждают и земельный департамент, и GDRFA.",
          pl: "Grecja, Malta, ZEA i Cypr — ale nie Portugalia, i nie częściowo. Art. 53 Lei 56/2023 uchylił obie portugalskie opcje nieruchomościowe w całości, a art. 3(5) idzie dalej: zakazuje inwestycji skierowanych w nieruchomości choćby pośrednio — co zamyka obejście przez fundusz nieruchomościowy, o które wciąż się pyta. Grecja wymaga jednej nieruchomości o powierzchni głównej co najmniej 120 m², a kilku nieruchomości nie wolno już sumować do progu — było to możliwe przed 2024 rokiem i wcześniejsze poradniki nadal tak twierdzą. ZEA odwrotnie: jedną lub kilka nieruchomości można sumować do AED 2 000 000, potwierdzają to departament gruntów i GDRFA.",
        },
      },
      {
        key: "can-i-let",
        countries: [],
        sources: ["gr", "mt", "ae"],
        q: {
          en: "Can I let the property out?",
          ru: "Можно ли сдавать купленное?",
          pl: "Czy można wynajmować kupioną nieruchomość?",
        },
        a: {
          en: "In Greece, not short-term, and the sanction is heavier than usually reported: article 100 §7A bans sharing-economy letting and sub-letting, and a breach both revokes the permit and carries a €50,000 fine. Long-term letting is not banned there. On Malta the restriction comes from a different instrument — the ministerial permit a non-EU buyer needs for almost every purchase allows the property to be used as the buyer's own home only, so it may not be let at all, and that condition falls away inside a Special Designated Area. For the UAE we state nothing: no authority page addresses letting the qualifying property in either direction, and we will not fill that silence with what portals assume.",
          ru: "В Греции — краткосрочно нельзя, и санкция тяжелее, чем обычно пишут: ст. 100 §7A запрещает сдачу через сервисы совместного потребления и субаренду, а нарушение и отзывает разрешение, и влечёт штраф €50 000. Долгосрочная сдача там не запрещена. На Мальте ограничение идёт из другого акта: разрешение министра, нужное покупателю не из ЕС почти на любую покупку, позволяет использовать объект только как собственное жильё — то есть сдавать нельзя вовсе, и это условие отпадает внутри особой зоны. По ОАЭ мы не говорим ничего: ни одна страница ведомства не касается сдачи квалифицирующего объекта ни в ту, ни в другую сторону, и заполнять это молчание догадками порталов мы не станем.",
          pl: "W Grecji krótkoterminowo nie wolno, a sankcja jest cięższa, niż zwykle się podaje: art. 100 §7A zakazuje najmu w ramach ekonomii współdzielenia i podnajmu, a naruszenie zarówno cofa zezwolenie, jak i niesie karę €50 000. Najem długoterminowy nie jest tam zakazany. Na Malcie ograniczenie pochodzi z innego aktu: zezwolenie ministra, którego kupujący spoza UE potrzebuje na niemal każdy zakup, pozwala używać nieruchomości wyłącznie jako własnego mieszkania — czyli wynajmować nie wolno wcale, a warunek ten znika wewnątrz strefy specjalnej. O ZEA nie mówimy nic: żadna strona urzędu nie odnosi się do najmu kwalifikującej nieruchomości w żadną stronę, a tej ciszy nie wypełnimy założeniami portali.",
        },
      },
      {
        key: "off-plan",
        countries: ["country-ae", "country-gr"],
        sources: ["ae", "gr"],
        q: {
          en: "Can I buy off-plan?",
          ru: "Можно ли купить на стадии котлована?",
          pl: "Czy można kupić na etapie budowy?",
        },
        a: {
          en: "We do not know, and neither does anyone else publishing an answer. This is the clearest example on the site of what our method actually costs. For the UAE we checked the Land Department, GDRFA, the federal identity authority and the federal portal again on 25 August 2026: not one mentions off-plan or under-construction property in either direction. Portals answer this question confidently; no primary source supports either answer, so ours is that no primary source publishes it. For Greece the statute is also silent, but two conditions bear against it — a measurable 120 m² and full ownership with the price paid before filing. That is a question for written confirmation from the Ministry, not for a website.",
          ru: "Мы не знаем — и никто из тех, кто публикует ответ, тоже. Это самый наглядный на сайте пример того, чего наш метод стоит. По ОАЭ мы 25 августа 2026 года заново проверили земельный департамент, GDRFA, федеральное управление по идентификации и федеральный портал: ни один не упоминает объекты на стадии строительства ни за, ни против. Порталы отвечают на этот вопрос уверенно; ни один первоисточник не поддерживает ни один из ответов — поэтому наш ответ в том, что первоисточник этого не публикует. По Греции закон тоже молчит, но два условия работают против: измеримые 120 м² и полная собственность с оплаченной ценой до подачи. Это вопрос для письменного подтверждения министерства, а не для сайта.",
          pl: "Nie wiemy — i nikt, kto publikuje odpowiedź, też nie. To najwyraźniejszy na stronie przykład tego, ile kosztuje nasza metoda. Dla ZEA sprawdziliśmy 25 sierpnia 2026 ponownie departament gruntów, GDRFA, federalny urząd tożsamości i portal federalny: żaden nie wspomina o nieruchomościach w budowie ani za, ani przeciw. Portale odpowiadają na to pytanie pewnie; żadne źródło pierwotne nie wspiera którejkolwiek odpowiedzi — więc nasza brzmi: źródło pierwotne tego nie publikuje. W Grecji ustawa też milczy, ale dwa warunki działają przeciw: mierzalne 120 m² i pełna własność z ceną zapłaconą przed złożeniem wniosku. To pytanie do pisemnego potwierdzenia ministerstwa, nie do strony internetowej.",
        },
      },
      {
        key: "mortgage",
        countries: [],
        sources: ["ae", "gr", "mt"],
        q: {
          en: "Can I buy with a mortgage?",
          ru: "Можно ли купить в ипотеку?",
          pl: "Czy można kupić na kredyt?",
        },
        a: {
          en: "In the UAE yes, explicitly: both the Land Department and GDRFA accept a mortgaged property, with a letter from the bank confirming it does not object and stating the amount paid and the balance. No minimum paid-down share applies on the AED 2,000,000 investor route — that requirement belongs to the separate retirement route. In Greece the statute says less than agencies do: article 100 §5 regulates the channel a payment must take, a bank account or payment provider operating in Greece, and says nothing about where the money comes from or about borrowing. For Malta and Portugal no provision addresses financing at all, so we state nothing rather than infer.",
          ru: "В ОАЭ — да, прямо: и земельный департамент, и GDRFA принимают заложенный объект при письме банка об отсутствии возражений с указанием выплаченной суммы и остатка. Минимальной доли выплаты на инвесторском маршруте AED 2 000 000 нет — это требование относится к отдельному пенсионному маршруту. В Греции закон говорит меньше, чем агентства: ст. 100 §5 регулирует канал платежа — счёт или провайдер, работающие в Греции — и ничего не говорит ни о происхождении денег, ни о займе. По Мальте и Португалии финансирования не касается ни одна норма, поэтому мы ничего не утверждаем, а не достраиваем.",
          pl: "W ZEA tak, wprost: departament gruntów i GDRFA akceptują nieruchomość obciążoną hipoteką, przy piśmie banku o braku sprzeciwu, z podaniem kwoty zapłaconej i salda. Na ścieżce inwestorskiej AED 2 000 000 nie obowiązuje minimalny udział spłaty — ten wymóg należy do osobnej ścieżki emerytalnej. W Grecji ustawa mówi mniej niż agencje: art. 100 §5 reguluje kanał płatności — rachunek lub dostawca działający w Grecji — i nie mówi nic o pochodzeniu pieniędzy ani o pożyczce. Dla Malty i Portugalii żaden przepis nie dotyczy finansowania, więc nic nie twierdzimy, zamiast domyślać się.",
        },
      },
    ],
  },
  // === 5. The other routes =================================================
  {
    key: "routes",
    title: {
      en: "The other routes",
      ru: "Другие маршруты",
      pl: "Inne ścieżki",
    },
    intro: {
      en: "Portugal has five that are not property. Almost nobody writing about Portugal lists more than one.",
      ru: "У Португалии их пять, и ни один не про недвижимость. Почти никто, пишущий о Португалии, не называет больше одного.",
      pl: "Portugalia ma pięć, i żadna nie dotyczy nieruchomości. Prawie nikt piszący o Portugalii nie wymienia więcej niż jednej.",
    },
    items: [
      {
        key: "fund-route",
        countries: ["country-pt"],
        sources: ["pt"],
        q: {
          en: "What is the fund route, and how does it differ from property?",
          ru: "Что такое фондовый маршрут и чем он отличается от недвижимости?",
          pl: "Czym jest ścieżka funduszowa i czym różni się od nieruchomości?",
        },
        a: {
          en: "You subscribe €500,000 to a Portuguese collective investment vehicle that is not a property fund, hold it at least five years, and at least 60% of it must sit in companies seated in Portugal. The differences that matter are three. You own units, not a thing — there is nothing to visit, insure or repair. You cannot decide when to exit; the fund's own terms do, which is why “five years” is a floor and not a plan. And the value can fall, which property can also do but feels different when it is a line on a statement. In exchange there is no transfer tax, no notary and no 120 m² to measure.",
          ru: "Вы подписываетесь на €500 000 в португальском фонде коллективных инвестиций, который не является фондом недвижимости, держите не менее пяти лет, и не менее 60% фонда должно стоять в компаниях с местом нахождения в Португалии. Существенных отличий три. Вы владеете паями, а не вещью — нечего посещать, страховать и чинить. Вы не решаете, когда выйти: это решают условия фонда, поэтому «пять лет» — это нижняя граница, а не план. И стоимость может упасть — недвижимость тоже может, но строчка в выписке ощущается иначе. Взамен нет налога на переход права, нотариуса и 120 м², которые надо мерить.",
          pl: "Subskrybujesz €500 000 w portugalskim funduszu zbiorowego inwestowania, który nie jest funduszem nieruchomości, trzymasz co najmniej pięć lat, a co najmniej 60% funduszu musi stać w spółkach z siedzibą w Portugalii. Istotne różnice są trzy. Posiadasz jednostki, a nie rzecz — nie ma czego odwiedzać, ubezpieczać ani naprawiać. Nie decydujesz, kiedy wyjść: decydują warunki funduszu, dlatego „pięć lat” to dolna granica, a nie plan. I wartość może spaść — nieruchomość też może, ale linijka w wyciągu odczuwa się inaczej. W zamian nie ma podatku od przeniesienia, notariusza ani 120 m² do zmierzenia.",
        },
      },
      {
        key: "other-routes",
        countries: ["country-pt"],
        sources: ["pt"],
        q: {
          en: "What routes exist besides property and funds?",
          ru: "Какие маршруты есть кроме недвижимости и фондов?",
          pl: "Jakie ścieżki istnieją poza nieruchomościami i funduszami?",
        },
        a: {
          en: "In Portugal, four more, and they are the least-written-about part of the whole comparison. Ten jobs created — eight in a low-density area — with no capital threshold at all. €500,000 into research, or €400,000 in a low-density area. €250,000 into cultural heritage, or €220,000 in a low-density area. €500,000 into a company that creates five permanent jobs. The route people still ask for, the €1.5 million capital transfer, no longer exists: it was repealed along with the property options in 2023. The jobs route is the one worth a second look — it is the only entry on this site with no money threshold written into it.",
          ru: "В Португалии их ещё четыре, и это самая незаписанная часть всего сравнения. Десять созданных рабочих мест — восемь в малонаселённом районе — вообще без порога по капиталу. €500 000 в научные исследования, или €400 000 в малонаселённом районе. €250 000 в культурное наследие, или €220 000 в малонаселённом. €500 000 в компанию, создающую пять постоянных рабочих мест. Маршрут, который до сих пор спрашивают, — перевод капитала €1,5 млн — больше не существует: его отменили вместе с недвижимостью в 2023 году. Стоит второго взгляда маршрут через рабочие места: это единственная позиция на сайте, в которой вообще нет денежного порога.",
          pl: "W Portugalii jeszcze cztery, i to najsłabiej opisana część całego porównania. Dziesięć utworzonych miejsc pracy — osiem na obszarze o niskiej gęstości — bez żadnego progu kapitałowego. €500 000 na badania naukowe albo €400 000 na obszarze o niskiej gęstości. €250 000 na dziedzictwo kulturowe albo €220 000 na obszarze o niskiej gęstości. €500 000 w spółkę tworzącą pięć stałych etatów. Ścieżka, o którą wciąż się pyta — transfer kapitału €1,5 mln — już nie istnieje: uchylono ją razem z nieruchomościami w 2023 roku. Drugiego spojrzenia wart jest wariant z miejscami pracy: to jedyna pozycja na tej stronie bez wpisanego progu pieniężnego.",
        },
      },
      {
        key: "deposit-route",
        countries: [],
        sources: ["mt"],
        q: {
          en: "Is a bank deposit enough anywhere?",
          ru: "Достаточно ли где-то просто банковского депозита?",
          pl: "Czy gdzieś wystarczy sam depozyt bankowy?",
        },
        a: {
          en: "No — not in any of the five, as a route in its own right. Portugal's capital-transfer option, the closest thing that ever existed to “park money and get a permit”, was repealed in 2023. What does exist, and gets confused with it, is a wealth test: Malta asks the main applicant to show assets of €500,000 of which €150,000 is financial, or €650,000 of which €75,000 is. That is a condition you satisfy alongside the investment, not instead of it — money you prove you have, not money you hand over.",
          ru: "Нет — ни в одной из пяти как самостоятельный маршрут. Португальский перевод капитала, самое близкое из когда-либо существовавшего к «положить деньги и получить статус», отменён в 2023 году. Что действительно есть и что с этим путают — это имущественный ценз: Мальта требует показать активы на €500 000, из них €150 000 финансовых, либо на €650 000, из них €75 000. Это условие, которое выполняется вместе с инвестицией, а не вместо неё: деньги, наличие которых доказывают, а не деньги, которые отдают.",
          pl: "Nie — w żadnej z pięciu jako samodzielna ścieżka. Portugalski transfer kapitału, najbliższa rzecz, jaka kiedykolwiek istniała wobec „ulokuj pieniądze i dostań status”, uchylono w 2023 roku. Istnieje natomiast — i bywa z tym mylony — próg majątkowy: Malta wymaga wykazania aktywów na €500 000, w tym €150 000 finansowych, albo €650 000, w tym €75 000. To warunek spełniany obok inwestycji, a nie zamiast niej: pieniądze, których posiadanie się dowodzi, a nie pieniądze, które się oddaje.",
        },
      },
      {
        key: "fewest-obligations",
        countries: [],
        sources: ["pt", "ae"],
        q: {
          en: "Which route leaves the fewest obligations afterwards?",
          ru: "У какого маршрута меньше всего обязательств после?",
          pl: "Która ścieżka zostawia najmniej zobowiązań później?",
        },
        a: {
          en: "Portugal's jobs route, on paper, because it has no capital to keep tied up — but it substitutes an obligation that is harder, not easier: ten actual jobs that have to keep existing through every renewal. Of the routes that involve money rather than employment, the UAE's asks least during the ten years and most at the end of them, since the property may not be disposed of at all and a lien is registered to make sure. The honest ranking is not between routes but between kinds of burden: capital locked up, a thing to maintain, or people employed. Pick the one you would not resent in year four.",
          ru: "На бумаге — португальский маршрут через рабочие места, потому что там нет замороженного капитала; но взамен он даёт обязательство не легче, а тяжелее: десять реальных рабочих мест, которые должны существовать к каждому продлению. Из денежных маршрутов эмиратский требует меньше всего в течение десяти лет и больше всего в конце: объектом нельзя распорядиться вовсе, и это обеспечено залогом. Честное сравнение проходит не между маршрутами, а между видами тяжести: замороженные деньги, вещь, которую надо содержать, или люди, которых надо занимать. Выбирайте то, что не станет раздражать на четвёртый год.",
          pl: "Na papierze portugalska ścieżka z miejscami pracy, bo nie ma tam zamrożonego kapitału — ale w zamian daje zobowiązanie nie lżejsze, lecz cięższe: dziesięć realnych etatów, które muszą istnieć przy każdym odnowieniu. Ze ścieżek pieniężnych emiracka wymaga najmniej w ciągu dziesięciu lat i najwięcej na ich końcu: nieruchomością nie wolno rozporządzać wcale, a zapewnia to zastaw. Uczciwe porównanie biegnie nie między ścieżkami, lecz między rodzajami ciężaru: zamrożony kapitał, rzecz do utrzymania albo ludzie do zatrudnienia. Wybierz to, co nie będzie cię drażnić w czwartym roku.",
        },
      },
    ],
  },

  // === 6. Family ===========================================================
  // The section /sources had nothing on until 25 August 2026. Every figure
  // here was read from the statute that day; before it, this site would have
  // had to answer from what agencies say, which is exactly what it exists not
  // to do.
  {
    key: "family",
    title: {
      en: "Family",
      ru: "Семья",
      pl: "Rodzina",
    },
    intro: {
      en: "Where the published rules and the statutes diverge most — particularly on children.",
      ru: "Здесь опубликованные правила расходятся с законом сильнее всего — особенно про детей.",
      pl: "Tu opublikowane zasady rozchodzą się z ustawami najbardziej — zwłaszcza co do dzieci.",
    },
    items: [
      {
        key: "who-counts-family",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Who counts as family?",
          ru: "Кто считается членом семьи?",
          pl: "Kto liczy się jako rodzina?",
        },
        a: {
          en: "A spouse and dependent children everywhere; parents in four of the five, and grandparents in one. Portugal takes the spouse, minor or incapacitated children, adopted minors, adult unmarried dependent children who are studying, direct first-degree ascendants of either spouse if dependent, and minor siblings under guardianship. Greece takes the spouse or civil partner, unmarried children under 21 of either spouse, the direct ascendants of both spouses, and adult children lacking legal capacity. Malta goes furthest: it takes a parent or grandparent of the applicant or the spouse, if principally dependent. The UAE takes spouse, children and parents. Everywhere the dependency has to be shown, not asserted.",
          ru: "Супруг и дети на иждивении — везде; родители — в четырёх из пяти, деды и бабки — в одной. Португалия берёт супруга, несовершеннолетних и недееспособных детей, усыновлённых несовершеннолетних, взрослых неженатых детей на иждивении, которые учатся, прямых восходящих первой степени любого из супругов при иждивении и несовершеннолетних братьев и сестёр под опекой. Греция — супруга или партнёра, неженатых детей до 21 года любого из супругов, прямых восходящих обоих супругов и взрослых детей без дееспособности. Мальта идёт дальше всех: берёт родителя или деда с бабкой заявителя либо супруга, если те на основном иждивении. ОАЭ — супруга, детей и родителей. Везде иждивение надо доказывать, а не заявлять.",
          pl: "Małżonek i dzieci na utrzymaniu — wszędzie; rodzice w czterech z pięciu, dziadkowie w jednej. Portugalia bierze małżonka, dzieci małoletnie lub ubezwłasnowolnione, adoptowanych małoletnich, dorosłe niezamężne dzieci na utrzymaniu, które się uczą, wstępnych pierwszego stopnia któregokolwiek z małżonków przy utrzymaniu oraz małoletnie rodzeństwo pod opieką. Grecja — małżonka lub partnera, niezamężne dzieci poniżej 21 lat któregokolwiek z małżonków, wstępnych obojga małżonków i dorosłe dzieci bez zdolności do czynności prawnych. Malta idzie najdalej: bierze rodzica albo dziadka wnioskodawcy lub małżonka, jeśli są na głównym utrzymaniu. ZEA — małżonka, dzieci i rodziców. Wszędzie utrzymanie trzeba udowodnić, a nie zadeklarować.",
        },
      },
      {
        key: "children-age",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Up to what age do children qualify?",
          ru: "До какого возраста подходят дети?",
          pl: "Do jakiego wieku kwalifikują się dzieci?",
        },
        a: {
          en: "It depends what you mean by an age, and in Portugal the honest answer is that there is not one. Article 99 of the Portuguese act contains no age figure at all — not 18, not 21, not the 26 that agencies routinely publish. The test is unmarried, dependent, and studying. Greece does set a number: under 21. Malta sets none for an adult child either, only that they be unmarried, not economically active and principally dependent. The UAE is the one place with a hard cap and it is asymmetric: sons up to 25, unmarried daughters with no age limit at all.",
          ru: "Зависит от того, что считать возрастом, — и в Португалии честный ответ, что его нет. В ст. 99 португальского закона нет ни одной цифры возраста: ни 18, ни 21, ни тех 26, которые регулярно публикуют агентства. Критерий — не в браке, на иждивении, учится. Греция цифру ставит: до 21 года. Мальта для взрослого ребёнка тоже не ставит — только не в браке, экономически не активен и на основном иждивении. ОАЭ единственные с жёстким потолком, и он несимметричный: сыновья до 25, незамужние дочери без ограничения по возрасту вообще.",
          pl: "Zależy, co uznać za wiek — a w Portugalii uczciwa odpowiedź brzmi, że go nie ma. Art. 99 portugalskiej ustawy nie zawiera żadnej liczby wieku: ani 18, ani 21, ani tych 26, które agencje regularnie publikują. Kryterium to: niezamężny, na utrzymaniu, uczy się. Grecja liczbę stawia: poniżej 21 lat. Malta dla dorosłego dziecka też nie stawia — tylko: nie w związku małżeńskim, nieaktywny zawodowo, na głównym utrzymaniu. ZEA są jedynym miejscem z twardym pułapem, i jest on niesymetryczny: synowie do 25 lat, niezamężne córki bez żadnego limitu wieku.",
        },
      },
      {
        key: "child-ages-out",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "What happens when a child no longer qualifies?",
          ru: "Что происходит, когда ребёнок перестаёт подходить?",
          pl: "Co dzieje się, gdy dziecko przestaje się kwalifikować?",
        },
        a: {
          en: "Greece is the only one of the four that writes it down, and its answer is the most generous: at 21 the child receives an independent three-year permit, renewable once for another three, after which the statute says plainly that no further renewal is allowed and a change of category is needed. Malta removes that person alone — the certificate is returned within a month and reissued corrected, and the rest of the family is untouched — but offers no independent status to the child. Portugal has no rule that turning any age ends anything; what ends is the ground for the next renewal, unless an autonomous title has already accrued. For the UAE, nothing: no authority page states what happens when a sponsored son passes 25, and we will not invent it.",
          ru: "Из четырёх это записано только у Греции, и ответ там самый щедрый: в 21 год ребёнок получает самостоятельный ВНЖ на три года, продлеваемый ещё на три, после чего закон прямо говорит, что дальнейшее продление не допускается и нужно менять категорию. Мальта убирает только этого человека — сертификат сдают в течение месяца и выдают исправленный, остальная семья не затронута, — но самостоятельного статуса ребёнку не даёт. В Португалии нет нормы, по которой достижение какого-либо возраста что-то прекращает; прекращается основание для следующего продления, если к тому времени не возникло самостоятельного титула. По ОАЭ — ничего: ни одна страница ведомства не говорит, что происходит с сыном после 25, и выдумывать мы это не станем.",
          pl: "Z czterech zapisuje to tylko Grecja, i jej odpowiedź jest najhojniejsza: w wieku 21 lat dziecko dostaje samodzielne zezwolenie na trzy lata, odnawialne raz na kolejne trzy, po czym ustawa mówi wprost, że dalsze odnowienie jest niedopuszczalne i trzeba zmienić kategorię. Malta usuwa tylko tę osobę — certyfikat zwraca się w ciągu miesiąca i wydaje poprawiony, reszta rodziny pozostaje nietknięta — ale nie daje dziecku samodzielnego statusu. Portugalia nie ma przepisu, wedle którego ukończenie jakiegokolwiek wieku coś kończy; kończy się podstawa kolejnego odnowienia, o ile nie powstał wcześniej samodzielny tytuł. O ZEA nic: żadna strona urzędu nie mówi, co dzieje się z synem po 25. roku życia, a wymyślać tego nie będziemy.",
        },
      },
      {
        key: "parents-included",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Can I include my parents?",
          ru: "Можно ли включить родителей?",
          pl: "Czy można włączyć rodziców?",
        },
        a: {
          en: "In all four we checked, and in two of them the in-laws too. Greece includes the direct ascendants of both spouses, in the statute's own plural. Malta includes a parent or grandparent of the applicant or the spouse, on proof of principal dependency, and charges €7,500 for each. Portugal includes direct first-degree ascendants of the resident or spouse if dependent, at the full €8,418.90 issuing fee each. The UAE includes parents, and here the authority contradicts the market: the Land Department's own tariff carries a line for a parents' residence permit for ten years at AED 5,774.50 — the same ten-year term as the investor's, not the one-year renewable arrangement usually described.",
          ru: "Во всех четырёх, которые мы проверяли, а в двух — и родителей супруга. Греция включает прямых восходящих обоих супругов, во множественном числе самого закона. Мальта включает родителя или деда с бабкой заявителя либо супруга при доказанном основном иждивении и берёт за каждого €7 500. Португалия включает прямых восходящих первой степени резидента или супруга при иждивении, по полной ставке выдачи €8 418,90 за каждого. ОАЭ включают родителей, и здесь ведомство противоречит рынку: в тарифе самого земельного департамента есть строка «резидентство для родителей на десять лет» за AED 5 774,50 — тот же десятилетний срок, что у инвестора, а не однолетний с продлением, как обычно описывают.",
          pl: "We wszystkich czterech sprawdzonych, a w dwóch także teściów. Grecja obejmuje wstępnych obojga małżonków, w liczbie mnogiej samej ustawy. Malta obejmuje rodzica albo dziadka wnioskodawcy lub małżonka przy udowodnionym głównym utrzymaniu i pobiera za każdego €7 500. Portugalia obejmuje wstępnych pierwszego stopnia rezydenta lub małżonka przy utrzymaniu, po pełnej stawce wydania €8 418,90 za każdego. ZEA obejmują rodziców, i tu urząd przeczy rynkowi: w taryfie samego departamentu gruntów jest pozycja „zezwolenie na pobyt dla rodziców na dziesięć lat” za AED 5 774,50 — ten sam dziesięcioletni okres co u inwestora, a nie roczny z odnawianiem, jak zwykle się opisuje.",
        },
      },
      {
        key: "spouse-invest",
        countries: [],
        sources: ["gr", "mt"],
        q: {
          en: "Does my spouse have to invest too?",
          ru: "Должен ли супруг тоже инвестировать?",
          pl: "Czy małżonek też musi inwestować?",
        },
        a: {
          en: "No, anywhere here. One qualifying investment covers the whole application; the spouse joins as a family member, on a permit that begins and ends with the main applicant's. Greece and Malta say so in structure rather than in a single sentence — family reunification is a separate legal basis attaching to the resident, not a test each person passes. Greece additionally allows spouses to hold the qualifying property jointly, which is an option and not a requirement, and is sometimes reported as though it were the latter. What the spouse does pay is fees: full rate in Portugal, exempt in Malta, AED 5,774.50 in the UAE.",
          ru: "Нет, нигде здесь. Одна квалифицирующая инвестиция покрывает всё заявление; супруг входит как член семьи, и его статус начинается и заканчивается вместе со статусом основного заявителя. Греция и Мальта говорят это устройством, а не одной фразой: воссоединение семьи — отдельное основание, привязанное к резиденту, а не тест, который проходит каждый. Греция дополнительно разрешает супругам держать объект в совместной собственности — это возможность, а не требование, и иногда её подают как второе. За что супруг всё же платит, так это сборы: полная ставка в Португалии, освобождение на Мальте, AED 5 774,50 в ОАЭ.",
          pl: "Nie, nigdzie tutaj. Jedna kwalifikująca inwestycja obejmuje cały wniosek; małżonek dołącza jako członek rodziny, a jego status zaczyna się i kończy razem ze statusem głównego wnioskodawcy. Grecja i Malta mówią to konstrukcją, a nie jednym zdaniem: łączenie rodzin to odrębna podstawa przypisana do rezydenta, a nie test zdawany przez każdego. Grecja dodatkowo pozwala małżonkom trzymać nieruchomość we współwłasności — to możliwość, a nie wymóg, choć bywa podawana jako to drugie. Za co małżonek jednak płaci, to opłaty: pełna stawka w Portugalii, zwolnienie na Malcie, AED 5 774,50 w ZEA.",
        },
      },
    ],
  },
  // === 7. Process and timelines ============================================
  {
    key: "process",
    title: {
      en: "Process and timelines",
      ru: "Процесс и сроки",
      pl: "Proces i terminy",
    },
    intro: {
      en: "Where published timelines and real ones part company, and what happens if the answer is no.",
      ru: "Где заявленные сроки расходятся с реальными и что бывает, если ответ отрицательный.",
      pl: "Gdzie deklarowane terminy rozchodzą się z rzeczywistymi i co się dzieje, gdy odpowiedź brzmi nie.",
    },
    items: [
      {
        key: "why-timelines-differ",
        countries: [],
        sources: ["pt", "gr"],
        q: {
          en: "Why do published timelines differ so much from real ones?",
          ru: "Почему заявленные сроки так расходятся с реальными?",
          pl: "Dlaczego deklarowane terminy tak różnią się od rzeczywistych?",
        },
        a: {
          en: "Because the published number is usually the statutory deadline and the real one is the queue. Portugal is the clearest case on this site: article 82(5) allows 90 days for a decision, and in practice filing to biometrics runs 6–24 months and biometrics to card another 6–18, with roughly 30,000 cases pending at AIMA on 4 August 2026. Both numbers are true and only one describes your year. Greece removes the sting differently — its statute sets no issuing deadline at all, but the confirmation issued when you file already confers lawful residence and the permit's rights until a decision comes, which is why a long Greek wait costs less than a long Portuguese one.",
          ru: "Потому что публикуемая цифра — обычно законный срок, а реальная — очередь. Португалия здесь самый наглядный случай: ст. 82(5) даёт на решение 90 дней, а на практике от подачи до биометрии проходит 6–24 месяца и от биометрии до карты ещё 6–18, при примерно 30 000 нерассмотренных дел у AIMA на 4 августа 2026 года. Обе цифры верны, но год описывает только одна. Греция снимает остроту иначе: срока выдачи в её законе нет вовсе, но выдаваемая при подаче справка уже даёт законное пребывание и права по разрешению до решения — поэтому долгое греческое ожидание стоит меньше, чем долгое португальское.",
          pl: "Bo publikowana liczba to zwykle termin ustawowy, a rzeczywista to kolejka. Portugalia jest tu najwyraźniejszym przypadkiem: art. 82(5) daje na decyzję 90 dni, a w praktyce od złożenia do biometrii mija 6–24 miesiące i od biometrii do karty kolejne 6–18, przy około 30 000 spraw czekających w AIMA na 4 sierpnia 2026. Obie liczby są prawdziwe, ale rok opisuje tylko jedna. Grecja zdejmuje ostrze inaczej: jej ustawa w ogóle nie ustala terminu wydania, ale zaświadczenie wydawane przy złożeniu już daje legalny pobyt i prawa z zezwolenia do czasu decyzji — dlatego długie greckie oczekiwanie kosztuje mniej niż długie portugalskie.",
        },
      },
      {
        key: "how-many-trips",
        countries: [],
        sources: ["gr", "mt", "ae"],
        q: {
          en: "How many times do I have to travel there?",
          ru: "Сколько раз придётся туда съездить?",
          pl: "Ile razy trzeba tam pojechać?",
        },
        a: {
          en: "At least once, everywhere, and the reason is always the same: biometrics cannot be given by proxy. Greece lets a lawyer file before you ever enter the country, on a power of attorney executed at a Greek consulate or abroad with an apostille — but the biometric step still needs you. Malta requires the main applicant and every dependant to travel after the Letter of Final Approval, with infants up to two exempt. The UAE puts the medical examination inside the application itself: its own published steps are attend a service centre, submit and pay, take the medical, receive the permit by email. Portugal we do not state, because the authority's own procedural pages were unreachable when we checked.",
          ru: "Минимум один раз — и причина везде одна: биометрию нельзя сдать по доверенности. Греция позволяет юристу подать заявление ещё до вашего въезда, по доверенности, оформленной в греческом консульстве или за рубежом с апостилем, — но биометрия всё равно требует вас. Мальта требует приезда основного заявителя и каждого иждивенца после письма об окончательном одобрении, младенцы до двух лет освобождены. ОАЭ встраивают медосмотр прямо в подачу: их собственные опубликованные шаги — прийти в сервисный центр, подать и оплатить, пройти медосмотр, получить статус по почте. По Португалии мы ничего не утверждаем: процедурные страницы ведомства были недоступны на момент проверки.",
          pl: "Co najmniej raz — a powód jest wszędzie ten sam: biometrii nie da się złożyć przez pełnomocnika. Grecja pozwala prawnikowi złożyć wniosek jeszcze przed twoim wjazdem, na podstawie pełnomocnictwa sporządzonego w greckim konsulacie albo za granicą z apostille — ale biometria i tak wymaga ciebie. Malta wymaga przyjazdu głównego wnioskodawcy i każdej osoby zależnej po piśmie o ostatecznym zatwierdzeniu, niemowlęta do dwóch lat są zwolnione. ZEA wbudowują badanie lekarskie w samo złożenie: ich opublikowane kroki to przyjść do centrum obsługi, złożyć i zapłacić, przejść badanie, odebrać status mailem. O Portugalii nic nie twierdzimy: strony proceduralne urzędu były niedostępne w chwili sprawdzania.",
        },
      },
      {
        key: "refusal",
        countries: [],
        sources: ["gr", "mt", "pt"],
        q: {
          en: "What happens if I am refused?",
          ru: "Что происходит при отказе?",
          pl: "Co się dzieje przy odmowie?",
        },
        a: {
          en: "It depends where, and the spread is the widest of any question here. Greece has a real appeal: two months from service of the decision, a €50 filing fee, a decision within 30 days. Malta has none at all — regulation 19(1) states that any decision of the Agency is made at its absolute discretion, is final, and is not subject to appeal, and the Agency's own FAQ repeats it in plain words. Portugal requires a refusal to be notified with its grounds and to state the right of judicial challenge and its deadline, but the deadline itself sits in general administrative law rather than in the immigration act, and we have not verified that figure to a primary source, so we do not print one. For the UAE no authority describes a refusal procedure at all — only a general complaints channel.",
          ru: "Зависит от страны, и разброс здесь самый широкий из всех вопросов. У Греции есть настоящее обжалование: два месяца с вручения решения, пошлина €50, решение в 30 дней. У Мальты его нет вовсе — регламент 19(1) говорит, что любое решение Агентства принимается по его абсолютному усмотрению, является окончательным и обжалованию не подлежит, и собственный FAQ Агентства повторяет это прямым текстом. Португалия обязана уведомить об отказе с основаниями и указать право на судебное обжалование и его срок, но сам срок лежит в общем административном праве, а не в законе об иностранцах, и до первоисточника мы его не довели — поэтому цифру не печатаем. По ОАЭ процедуру отказа не описывает ни одно ведомство, есть только общий канал жалоб.",
          pl: "Zależy od kraju, a rozrzut jest tu najszerszy ze wszystkich pytań. Grecja ma prawdziwe odwołanie: dwa miesiące od doręczenia decyzji, opłata €50, rozstrzygnięcie w 30 dni. Malta nie ma go wcale — rozporządzenie 19(1) mówi, że każda decyzja Agencji zapada w jej absolutnym uznaniu, jest ostateczna i nie podlega zaskarżeniu, a własny FAQ Agencji powtarza to wprost. Portugalia musi zawiadomić o odmowie z uzasadnieniem i wskazać prawo do skargi sądowej wraz z terminem, ale sam termin leży w ogólnym prawie administracyjnym, a nie w ustawie o cudzoziemcach, i nie doprowadziliśmy go do źródła pierwotnego — więc liczby nie drukujemy. W ZEA żaden urząd nie opisuje procedury odmowy, jest tylko ogólny kanał skarg.",
        },
      },
      {
        key: "must-use-agent",
        countries: ["country-mt"],
        sources: ["mt"],
        q: {
          en: "Can I apply myself, without an adviser?",
          ru: "Можно ли подать самому, без консультанта?",
          pl: "Czy można złożyć wniosek samemu, bez doradcy?",
        },
        a: {
          en: "On Malta, no — and it is the only one of the five where that is a legal requirement rather than a practical one. Regulation 4(1) states that an individual making any application under the programme shall use the services of an agent, and the agent must be licensed; since the 2025 amendment they are licensed directly by the Agency. Everywhere else the choice is yours, and the practical answer differs from the legal one: a file that sits in a queue for two years is a file somebody has to chase.",
          ru: "На Мальте — нет, и это единственная из пяти, где так велит закон, а не практика. Регламент 4(1) говорит, что подающий любое заявление по программе обязан пользоваться услугами агента, а агент должен быть лицензирован; с поправки 2025 года лицензию выдаёт само Агентство. В остальных выбор ваш, и практический ответ отличается от юридического: дело, которое два года стоит в очереди, — это дело, которое кто-то должен вести.",
          pl: "Na Malcie nie — i jest to jedyna z piątki, gdzie tak stanowi prawo, a nie praktyka. Rozporządzenie 4(1) mówi, że osoba składająca jakikolwiek wniosek w ramach programu ma korzystać z usług agenta, a agent musi być licencjonowany; od nowelizacji z 2025 licencji udziela sama Agencja. W pozostałych wybór należy do ciebie, a odpowiedź praktyczna różni się od prawnej: sprawa stojąca dwa lata w kolejce to sprawa, którą ktoś musi prowadzić.",
        },
      },
    ],
  },

  // === 8. Living there and taxes ===========================================
  {
    key: "tax",
    title: {
      en: "Living there and taxes",
      ru: "Проживание и налоги",
      pl: "Pobyt i podatki",
    },
    intro: {
      en: "Two questions people merge into one, and a relief that does not apply to the permit most readers hold.",
      ru: "Два вопроса, которые обычно сливают в один, и льгота, которая к самому частому здесь статусу не относится.",
      pl: "Dwa pytania, które zwykle zlewa się w jedno, i ulga, która nie dotyczy najczęstszego tu statusu.",
    },
    items: [
      {
        key: "tax-residency",
        countries: [],
        sources: [],
        home: true,
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
        key: "special-regimes",
        countries: [],
        sources: ["pt", "gr", "mt"],
        q: {
          en: "What special tax regimes exist, and do I qualify?",
          ru: "Какие есть спецрежимы и подхожу ли я?",
          pl: "Jakie są specjalne reżimy podatkowe i czy się kwalifikuję?",
        },
        a: {
          en: "Three, and the most advertised one has a condition that removes most readers of this page. Greece's non-dom regime charges €100,000 a year on foreign income plus €20,000 per family member for up to fifteen years — but it requires a €500,000 investment within three years, and the golden visa does not count towards it: the relief attaches to a different permit entirely, the investment-activity permit under the old article 16. Portugal's IFICI gives 20% on Portuguese employment and business income from a qualifying activity for ten years, with registration due by 15 January of the year after residency, and it excludes pensions and blacklisted-jurisdiction income, taxing those at 35%. Malta's is the remittance basis: foreign income is taxed when brought in.",
          ru: "Три — и у самого рекламируемого есть условие, которое отсекает большинство читателей этой страницы. Греческий non-dom берёт €100 000 в год с зарубежного дохода плюс €20 000 за каждого члена семьи, до пятнадцати лет, — но требует инвестицию €500 000 в течение трёх лет, и золотая виза в неё не засчитывается: льгота привязана к совсем другому статусу, разрешению на инвестиционную деятельность по старой ст. 16. Португальский IFICI даёт 20% на португальский трудовой и предпринимательский доход от квалифицированной деятельности на десять лет, с регистрацией до 15 января следующего после резидентства года, и исключает пенсии и доход из «чёрных» юрисдикций, облагая их по 35%. Мальтийский — remittance basis: зарубежный доход облагается при ввозе.",
          pl: "Trzy — a najbardziej reklamowany ma warunek odcinający większość czytelników tej strony. Grecki non-dom pobiera €100 000 rocznie od dochodu zagranicznego plus €20 000 za każdego członka rodziny, do piętnastu lat — ale wymaga inwestycji €500 000 w ciągu trzech lat, a złota wiza się do niej nie zalicza: ulga przypisana jest do zupełnie innego statusu, zezwolenia na działalność inwestycyjną ze starego art. 16. Portugalski IFICI daje 20% od portugalskiego dochodu z pracy i działalności kwalifikowanej przez dziesięć lat, z rejestracją do 15 stycznia roku następującego po uzyskaniu rezydencji, i wyłącza emerytury oraz dochód z jurysdykcji z czarnej listy, opodatkowując je stawką 35%. Maltański to remittance basis: dochód zagraniczny opodatkowany przy wprowadzeniu.",
        },
      },
      {
        key: "uae-taxfree",
        countries: ["country-ae"],
        sources: ["ae"],
        q: {
          en: "Is the UAE really tax-free?",
          ru: "ОАЭ правда без налогов?",
          pl: "Czy ZEA naprawdę są bez podatków?",
        },
        a: {
          en: "There is no personal income tax, which is the part everyone repeats and it is true. What is left out is that this does not make every kind of income untaxed. Letting a property short-term requires a permit, and holding that permit changes the character of the income: rental receipts that sat outside corporate tax become business income that does not. There is also no annual property tax, which is unusual enough to be worth saying, and a 4% registration fee at purchase, which is market fact rather than an official published tariff and which we therefore name without adding to a total.",
          ru: "Подоходного налога нет — это та часть, которую все повторяют, и она верна. Опускают другое: это не делает необлагаемым любой доход. Краткосрочная сдача требует разрешения, а наличие разрешения меняет характер дохода: арендные поступления, стоявшие вне корпоративного налога, становятся предпринимательским доходом, который под него подпадает. Ежегодного налога на недвижимость там тоже нет — это достаточно необычно, чтобы сказать вслух, — а при покупке берут 4% регистрационного сбора, который является рыночным фактом, а не опубликованным официальным тарифом, и потому мы его называем, но в сумму не кладём.",
          pl: "Podatku dochodowego nie ma — to część, którą wszyscy powtarzają, i jest prawdziwa. Pomija się co innego: to nie czyni nieopodatkowanym każdego dochodu. Najem krótkoterminowy wymaga zezwolenia, a posiadanie zezwolenia zmienia charakter dochodu: wpływy z najmu, które stały poza podatkiem korporacyjnym, stają się dochodem z działalności, który mu podlega. Nie ma tam także rocznego podatku od nieruchomości — to na tyle nietypowe, że warto powiedzieć — a przy zakupie pobiera się 4% opłaty rejestracyjnej, będącej faktem rynkowym, a nie opublikowaną taryfą urzędową, więc ją nazywamy, ale nie wliczamy do sumy.",
        },
      },
      {
        key: "home-country-tax",
        countries: [],
        sources: [],
        q: {
          en: "Will my own country still tax me?",
          ru: "Будет ли меня по-прежнему облагать родная страна?",
          pl: "Czy mój własny kraj nadal będzie mnie opodatkowywał?",
        },
        a: {
          en: "Almost certainly, until you stop being its tax resident — and getting a permit elsewhere does not by itself do that. Two countries can both consider you resident in the same year, which is what double-taxation treaties exist to resolve, usually by a sequence of tests: permanent home, then centre of vital interests, then habitual abode, then nationality. Some countries also charge an exit tax on unrealised gains when residence ends. None of this is a reason not to proceed; it is a reason to ask your own accountant before, rather than after. This is one of the few questions on this page where the answer that matters is not in any of the five statutes.",
          ru: "Почти наверняка — пока вы не перестанете быть её налоговым резидентом, а получение статуса в другой стране само по себе этого не делает. Две страны могут одновременно считать вас резидентом в одном и том же году; именно для этого существуют соглашения об избежании двойного налогообложения, и решают они это последовательностью тестов: постоянное жильё, затем центр жизненных интересов, затем обычное местопребывание, затем гражданство. Некоторые страны берут ещё и налог на выход с нереализованного прироста при прекращении резидентства. Ничто из этого не повод не идти — это повод спросить своего бухгалтера до, а не после. Это один из немногих вопросов на странице, ответ на который лежит вне всех пяти законов.",
          pl: "Niemal na pewno — dopóki nie przestaniesz być jego rezydentem podatkowym, a uzyskanie statusu gdzie indziej samo z siebie tego nie robi. Dwa kraje mogą jednocześnie uznawać cię za rezydenta w tym samym roku; po to istnieją umowy o unikaniu podwójnego opodatkowania, które rozstrzygają to sekwencją testów: stałe miejsce zamieszkania, potem ośrodek interesów życiowych, potem zwykłe przebywanie, potem obywatelstwo. Niektóre kraje pobierają też podatek od wyjścia od niezrealizowanych zysków przy zakończeniu rezydencji. Nic z tego nie jest powodem, by nie działać — to powód, by zapytać własnego księgowego przed, a nie po. To jedno z niewielu pytań na tej stronie, którego odpowiedź leży poza wszystkimi pięcioma ustawami.",
        },
      },
    ],
  },
  // === 9. The path to citizenship ==========================================
  {
    key: "citizenship",
    title: {
      en: "The path to citizenship",
      ru: "Путь к гражданству",
      pl: "Droga do obywatelstwa",
    },
    intro: {
      en: "The reason most people are here, and the part that changed most recently.",
      ru: "То, ради чего сюда чаще всего приходят, — и то, что менялось позже всего.",
      pl: "Powód, dla którego większość tu trafia — i część, która zmieniła się najpóźniej.",
    },
    items: [
      {
        key: "counted-years",
        countries: ["country-gr"],
        sources: ["citizenship", "gr"],
        q: {
          en: "Do the golden-visa years count towards citizenship?",
          ru: "Засчитываются ли годы по золотой визе?",
          pl: "Czy lata na złotej wizie liczą się do obywatelstwa?",
        },
        a: {
          en: "In Greece yes, with a wrinkle worth knowing about. The Ministry of the Interior's own codified Citizenship Code lists the investment-activity residence permit among the categories that count as qualifying lawful residence — but the cross-reference still points at article 16 of Law 4251/2014, a law repealed and replaced in 2023. It is a gap in the state's own legislative housekeeping rather than an exclusion on the merits, and it is the kind of thing worth having in writing before relying on it. Everywhere the years counted are years of actual residence, not years of holding a card: a status requiring a few days a year accrues nothing on its own.",
          ru: "В Греции — да, с оговоркой, о которой стоит знать. Сводка Кодекса о гражданстве, изданная самим МВД, перечисляет разрешение на инвестиционную деятельность среди категорий, засчитываемых как законное проживание, — но ссылка по-прежнему указывает на ст. 16 закона 4251/2014, отменённого и заменённого в 2023 году. Это пробел в законодательной уборке самого государства, а не отказ по существу, и это как раз то, что стоит иметь письменно, прежде чем на это опираться. Везде считаются годы фактического проживания, а не годы владения картой: статус, требующий нескольких дней в году, сам по себе не копит ничего.",
          pl: "W Grecji tak, z zastrzeżeniem wartym poznania. Ujednolicony Kodeks Obywatelstwa wydany przez samo MSW wymienia zezwolenie na działalność inwestycyjną wśród kategorii liczonych jako legalny pobyt — ale odesłanie wciąż wskazuje na art. 16 ustawy 4251/2014, uchylonej i zastąpionej w 2023 roku. To luka w porządkach legislacyjnych samego państwa, a nie wykluczenie co do istoty, i właśnie taką rzecz warto mieć na piśmie, zanim się na niej oprze. Wszędzie liczą się lata faktycznego pobytu, a nie lata posiadania karty: status wymagający kilku dni w roku sam z siebie nie nalicza nic.",
        },
      },
      {
        key: "language-requirement",
        countries: [],
        sources: ["citizenship"],
        q: {
          en: "Do I need the language, and at what level?",
          ru: "Нужен ли язык и на каком уровне?",
          pl: "Czy potrzebny jest język i na jakim poziomie?",
        },
        a: {
          en: "Yes everywhere it leads to a passport, and the levels differ more than the marketing suggests. Greece is the hardest: B1 Greek plus history, geography, culture and institutions, in one exam, passed at 70% overall with at least 66% on the language section. Portugal's nationality act asks only for “sufficient knowledge, proven by test or certificate” — the A2 level everyone quotes is not in that act at all but in the implementing decree, and nationals of Portuguese-speaking countries are presumed to satisfy it. Malta asks for adequate knowledge of Maltese or English, with no level named in the statute. That last one is a real advantage and it is rarely presented as one.",
          ru: "Да — везде, где путь ведёт к паспорту, и уровни различаются сильнее, чем следует из рекламы. Тяжелее всего в Греции: B1 по языку плюс история, география, культура и институты, одним экзаменом, с проходным 70% в целом и не менее 66% по языковой части. Португальский закон о гражданстве требует лишь «достаточного знания, подтверждённого тестом или сертификатом» — уровня A2, который все цитируют, в самом законе нет вовсе, он в подзаконном акте, а граждане португалоязычных стран считаются соответствующими. Мальта требует достаточного знания мальтийского или английского, и уровня в законе не названо. Последнее — реальное преимущество, и его почти никогда так не подают.",
          pl: "Tak — wszędzie, gdzie droga prowadzi do paszportu, a poziomy różnią się bardziej, niż wynika z marketingu. Najtrudniej w Grecji: B1 z języka plus historia, geografia, kultura i instytucje, w jednym egzaminie, zdanym na 70% ogółem i co najmniej 66% z części językowej. Portugalska ustawa o obywatelstwie wymaga jedynie „wystarczającej znajomości potwierdzonej testem lub certyfikatem” — poziomu A2, który wszyscy cytują, w samej ustawie nie ma wcale, jest w akcie wykonawczym, a obywatele krajów portugalskojęzycznych są uznawani za spełniających wymóg. Malta wymaga odpowiedniej znajomości maltańskiego lub angielskiego, bez poziomu wskazanego w ustawie. To ostatnie to realna przewaga i rzadko bywa tak przedstawiane.",
        },
      },
      {
        key: "dual-citizenship",
        countries: [],
        sources: ["citizenship"],
        q: {
          en: "Can I keep my current passport?",
          ru: "Можно ли сохранить нынешний паспорт?",
          pl: "Czy można zachować obecny paszport?",
        },
        a: {
          en: "Yes in all four that grant citizenship, though by three different mechanisms. Portugal simply disregards the others: where someone holds two or more nationalities and one is Portuguese, only the Portuguese one has effect under Portuguese law, and no renunciation is asked for. Malta says it outright — it is lawful to be a citizen of Malta and of another country at the same time. Greece is the conditional one: Greek nationality is lost on voluntarily acquiring a foreign one only with ministerial permission, so passive dual nationality triggers no automatic loss. The UAE permits a naturalised citizen to retain the original nationality, on condition of notifying the state. The question that actually decides this is what your own country allows.",
          ru: "Да — во всех четырёх, где гражданство дают, но тремя разными способами. Португалия просто не замечает остальных: если у человека два и более гражданства и одно из них португальское, португальское право учитывает только его, и отказа не требует. Мальта говорит прямо: быть гражданином Мальты и другой страны одновременно законно. Греция — условная: греческое гражданство утрачивается при добровольном приобретении иностранного только с разрешения министра, так что пассивное двойное гражданство автоматической утраты не влечёт. ОАЭ разрешают натурализованному сохранить прежнее гражданство при условии уведомления государства. Вопрос, который на самом деле всё решает, — что разрешает ваша собственная страна.",
          pl: "Tak, we wszystkich czterech przyznających obywatelstwo, choć trzema różnymi mechanizmami. Portugalia po prostu pomija pozostałe: gdy ktoś ma dwa lub więcej obywatelstw i jedno jest portugalskie, prawo portugalskie uwzględnia tylko je i nie żąda zrzeczenia. Malta mówi wprost: bycie obywatelem Malty i innego kraju jednocześnie jest zgodne z prawem. Grecja jest warunkowa: greckie obywatelstwo traci się przy dobrowolnym nabyciu obcego tylko za zgodą ministra, więc bierne podwójne obywatelstwo nie powoduje automatycznej utraty. ZEA pozwalają naturalizowanemu zachować dotychczasowe obywatelstwo pod warunkiem powiadomienia państwa. Pytaniem, które naprawdę o tym rozstrzyga, jest to, na co pozwala twój własny kraj.",
        },
      },
      {
        key: "cbi-available",
        countries: [],
        sources: ["citizenship"],
        q: {
          en: "Is citizenship by investment available in any of these five?",
          ru: "Есть ли здесь где-то гражданство за инвестиции?",
          pl: "Czy w tej piątce jest gdzieś obywatelstwo za inwestycje?",
        },
        a: {
          en: "No. Not any more, and the change is recent enough that it is still being sold. Malta was the one, and Act XXI of 2025 abolished it; what remains there is naturalisation on the basis of merit, which is a different instrument with a different threshold and is not a purchase. Cyprus ended its own scheme earlier. The UAE naturalises by nomination, at discretion, through the courts of the rulers and the cabinet — that is not a route an investor can plan around, whatever the brochure implies. If somebody offers you a passport for money in any of these five today, that is the single most useful signal you will get about them.",
          ru: "Нет. Больше нет — и перемена достаточно свежая, чтобы это всё ещё продавали. Была Мальта, и Act XXI of 2025 это отменил; осталась натурализация за особые заслуги, а это другой инструмент с другим порогом, и это не покупка. Кипр свою схему закрыл раньше. ОАЭ натурализуют по выдвижению и по усмотрению, через суды правителей и кабинет, — на такой маршрут инвестор планов не строит, что бы ни намекал буклет. Если сегодня в этих пяти вам предлагают паспорт за деньги, это самый полезный сигнал об этом человеке, который вы получите.",
          pl: "Nie. Już nie — a zmiana jest na tyle świeża, że wciąż bywa sprzedawana. Była Malta, i Act XXI of 2025 to zniósł; pozostała naturalizacja za szczególne zasługi, a to inny instrument o innym progu i nie jest zakupem. Cypr zamknął swój program wcześniej. ZEA naturalizują z nominacji i uznaniowo, przez sądy władców i gabinet — na takiej ścieżce inwestor nie buduje planów, cokolwiek sugeruje broszura. Jeśli dziś w tej piątce ktoś oferuje paszport za pieniądze, to najbardziej użyteczny sygnał o tej osobie, jaki dostaniesz.",
        },
      },
    ],
  },

  // === 10. Risks ===========================================================
  // The section no competitor writes. Of fourteen FAQ pages surveyed on
  // 25 August 2026, one carried a question about downside and it was framed as
  // reassurance ("is the programme still open?").
  {
    key: "risks",
    title: {
      en: "What can go wrong",
      ru: "Что может пойти не так",
      pl: "Co może pójść nie tak",
    },
    intro: {
      en: "Three programmes changed under people already in the queue, in three years. Here is what that looked like.",
      ru: "За три года три программы изменились под теми, кто уже стоял в очереди. Вот как это выглядело.",
      pl: "W ciągu trzech lat trzy programy zmieniły się pod tymi, którzy już stali w kolejce. Oto jak to wyglądało.",
    },
    items: [
      {
        key: "rules-change",
        countries: ["country-gr", "country-pt"],
        sources: ["pt", "gr"],
        home: true,
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
      {
        key: "has-happened",
        countries: [],
        sources: ["pt", "gr", "mt", "citizenship"],
        q: {
          en: "Has that actually happened?",
          ru: "А такое уже бывало?",
          pl: "Czy to się już zdarzyło?",
        },
        a: {
          en: "Four times in three years, across three of the five — Portugal twice. In 2023 Portugal removed property from its Golden Visa outright and repealed the €1.5 million capital transfer with it. In September 2024 Greece replaced one €250,000 threshold with three tiers reaching €800,000, and stopped allowing several properties to be added together. In 2025 Malta abolished citizenship by investment. In May 2026 Portugal raised the years to citizenship from five to seven or ten, which changed the arithmetic for everybody already holding a permit and counting. None of these were rumours; each is a numbered statute with a gazette date, and each is on our sources page.",
          ru: "Четыре раза за три года, в трёх юрисдикциях из пяти — Португалия дважды. В 2023 году Португалия целиком убрала недвижимость из золотой визы и заодно отменила перевод капитала €1,5 млн. В сентябре 2024 года Греция заменила единый порог €250 000 тремя уровнями до €800 000 и запретила складывать несколько объектов. В 2025 году Мальта отменила гражданство за инвестиции. В мае 2026 года Португалия увеличила срок до гражданства с пяти лет до семи или десяти — и это изменило арифметику всем, кто уже держал статус и считал. Ничто из этого не было слухом: каждое — закон с номером и датой публикации, и каждое есть на нашей странице источников.",
          pl: "Cztery razy w ciągu trzech lat, w trzech z pięciu jurysdykcji — Portugalia dwukrotnie. W 2023 Portugalia całkowicie usunęła nieruchomości ze złotej wizy i przy okazji uchyliła transfer kapitału €1,5 mln. We wrześniu 2024 Grecja zastąpiła jeden próg €250 000 trzema poziomami sięgającymi €800 000 i zakazała sumowania kilku nieruchomości. W 2025 Malta zniosła obywatelstwo za inwestycje. W maju 2026 Portugalia podniosła okres do obywatelstwa z pięciu lat do siedmiu lub dziesięciu — co zmieniło rachunek wszystkim, którzy już mieli status i liczyli. Nic z tego nie było plotką: każde to ustawa z numerem i datą publikacji, i każde jest na naszej stronie źródeł.",
        },
      },
      {
        key: "sell-and-keep",
        countries: [],
        sources: ["pt", "gr", "mt", "ae"],
        q: {
          en: "Can I sell and keep the permit?",
          ru: "Можно ли продать и сохранить статус?",
          pl: "Czy można sprzedać i zachować status?",
        },
        a: {
          en: "Not while you still need the permit, and the mechanisms differ in a way that matters. Greece is explicit: on resale the seller's permit is revoked at the same moment the buyer becomes eligible for one of their own. Portugal is gentler than it is usually described — early divestment is not among the grounds for cancelling a permit at all; what happens is that the next two-yearly renewal fails, because renewal requires proving the investment is still there. Malta allows the qualifying property to be swapped for another with the Agency's consent, but a breach can end the certificate for the applicant and every dependant at once. The UAE simply forbids disposal for ten years and registers a lien so that you cannot.",
          ru: "Пока статус нужен — нет, и механизмы различаются существенно. Греция говорит прямо: при перепродаже разрешение продавца отзывается в тот же момент, когда у покупателя возникает право на своё. Португалия мягче, чем её обычно описывают: досрочный выход вообще не входит в основания аннулирования — просто проваливается ближайшее двухлетнее продление, потому что для продления надо доказать, что инвестиция на месте. Мальта разрешает заменить объект другим с согласия Агентства, но нарушение может прекратить сертификат заявителю и всем иждивенцам разом. ОАЭ просто запрещают распоряжаться десять лет и ставят залог, чтобы вы и не смогли.",
          pl: "Dopóki status jest potrzebny — nie, a mechanizmy różnią się istotnie. Grecja mówi wprost: przy odsprzedaży zezwolenie sprzedającego jest cofane w tej samej chwili, gdy kupujący nabywa prawo do własnego. Portugalia jest łagodniejsza, niż zwykle się ją opisuje: wcześniejsze wyjście w ogóle nie należy do podstaw cofnięcia — po prostu nie udaje się najbliższe dwuletnie odnowienie, bo do odnowienia trzeba wykazać, że inwestycja nadal istnieje. Malta pozwala zamienić nieruchomość na inną za zgodą Agencji, ale naruszenie może zakończyć certyfikat wnioskodawcy i wszystkim osobom zależnym naraz. ZEA po prostu zakazują rozporządzania przez dziesięć lat i wpisują zastaw, żebyś nie mógł.",
        },
      },
      {
        key: "investment-loses-value",
        countries: [],
        sources: ["pt", "gr"],
        q: {
          en: "What if the investment loses value?",
          ru: "Что если инвестиция подешевеет?",
          pl: "Co, jeśli inwestycja straci na wartości?",
        },
        a: {
          en: "The status usually survives; the money does not come back. The thresholds are tested at the moment of investment, not marked to market each year, so a property that has fallen or a fund that has dropped does not by itself cost you the permit — what costs you the permit is not having the asset at all. The real exposure is different and less discussed: you cannot sell into a falling market without losing the status, which is precisely the moment you would want to. That constraint is the price of the route, and it is worth pricing before rather than after. Nobody in this market publishes a guarantee against it, and anyone who implies one is selling.",
          ru: "Статус обычно выживает, деньги — нет. Пороги проверяются в момент инвестиции, а не переоцениваются ежегодно по рынку: подешевевший объект или просевший фонд сами по себе разрешения не стоят — стоит его отсутствие актива как такового. Настоящий риск другой и обсуждается реже: вы не можете продать на падающем рынке, не потеряв статус, — а это ровно тот момент, когда захотелось бы. Это ограничение и есть цена маршрута, и оценивать её стоит до, а не после. Гарантий от этого в этом рынке не публикует никто, а тот, кто на них намекает, продаёт.",
          pl: "Status zwykle przetrwa, pieniądze nie. Progi bada się w momencie inwestycji, a nie wycenia co roku do rynku: przecenona nieruchomość albo osłabiony fundusz same z siebie nie kosztują zezwolenia — kosztuje je brak aktywa w ogóle. Prawdziwe ryzyko jest inne i rzadziej omawiane: nie możesz sprzedać na spadającym rynku bez utraty statusu — a to dokładnie ten moment, w którym byś chciał. To ograniczenie jest ceną ścieżki i warto ją wycenić przed, a nie po. Nikt na tym rynku nie publikuje gwarancji przeciw temu, a kto ją sugeruje, sprzedaje.",
        },
      },
      {
        key: "choosing-adviser",
        countries: [],
        sources: ["mt", "cy"],
        q: {
          en: "How do I tell a serious adviser from a bad one?",
          ru: "Как отличить нормального консультанта от плохого?",
          pl: "Jak odróżnić poważnego doradcę od złego?",
        },
        a: {
          en: "Four tests, and they cost you nothing to run. Ask for the article — a serious adviser names the statute and the paragraph; a bad one names a brochure. Ask what has changed in the last year; anyone still quoting Portugal's five years to citizenship, or a single €250,000 Greek threshold, has not read anything since 2023. Ask what they do not know: a person who has no unverified answers is not being careful, they are guessing confidently. And ask who pays them, and how much, before anything else. On Malta a licensed agent is compulsory by regulation, so at least the licence can be checked; everywhere else nothing stops anyone from calling themselves one.",
          ru: "Четыре проверки, и все бесплатные. Спросите статью: нормальный консультант называет закон и пункт, плохой называет буклет. Спросите, что изменилось за последний год: тот, кто до сих пор говорит про пять лет до португальского гражданства или про единый греческий порог €250 000, не читал ничего с 2023 года. Спросите, чего он не знает: человек, у которого нет непроверенных ответов, не осторожен — он уверенно догадывается. И спросите, кто и сколько ему платит, прежде чем что-либо ещё. На Мальте лицензированный агент обязателен по регламенту, так что там хотя бы лицензию можно проверить; в остальных местах называть себя консультантом не мешает ничто.",
          pl: "Cztery testy, wszystkie darmowe. Poproś o artykuł: poważny doradca nazywa ustawę i ustęp, zły nazywa broszurę. Zapytaj, co zmieniło się w ostatnim roku: kto wciąż mówi o pięciu latach do portugalskiego obywatelstwa albo o jednym greckim progu €250 000, nie czytał niczego od 2023 roku. Zapytaj, czego nie wie: człowiek bez niezweryfikowanych odpowiedzi nie jest ostrożny — on pewnie zgaduje. I zapytaj, kto i ile mu płaci, zanim o cokolwiek innego. Na Malcie licencjonowany agent jest obowiązkowy z mocy rozporządzenia, więc tam da się przynajmniej sprawdzić licencję; gdzie indziej nic nie przeszkadza nikomu tak się nazywać.",
        },
      },
    ],
  },

  // === 11. About this site =================================================
  // The section that exists because the four `unverified` verdicts on
  // /sources need somewhere to be explained rather than buried.
  {
    key: "about-site",
    title: {
      en: "About this site",
      ru: "Про сам сайт",
      pl: "O tej stronie",
    },
    intro: {
      en: "Who is behind the figures, how the money works, and what we refuse to publish.",
      ru: "Кто стоит за цифрами, как устроены деньги и чего мы не публикуем.",
      pl: "Kto stoi za liczbami, jak działają pieniądze i czego nie publikujemy.",
    },
    items: [
      {
        key: "where-figures-from",
        countries: [],
        sources: [],
        q: {
          en: "Where do your figures come from?",
          ru: "Откуда ваши цифры?",
          pl: "Skąd pochodzą wasze liczby?",
        },
        a: {
          en: "From the statute, the ministry tariff or the official fee schedule each one is supposed to rest on, read back one at a time on 23 August 2026, with every citation published on our sources page: law number, article, gazette issue and date. Thirty-three checks. Fourteen came back wrong and were corrected. Four could not be established from any primary source and are therefore published as figures nowhere on this site. Where the only readable copy of a text is a legal database rather than the gazette itself, the source is labelled a reproduction rather than official, because the difference matters on a page whose whole argument is primary sources.",
          ru: "Из закона, тарифа ведомства или официальной таблицы сборов, на которых каждая должна стоять; перечитаны по одной 23 августа 2026 года, и каждая ссылка опубликована на нашей странице источников — номер закона, статья, номер и дата официальной газеты. Тридцать три проверки. Четырнадцать вернулись неверными и были исправлены. Четыре не удалось установить ни по одному первоисточнику — и поэтому они нигде на сайте цифрами не публикуются. Там, где единственный читаемый текст лежит в правовой базе, а не в самой газете, источник помечен как воспроизведение, а не официальный: на странице, весь довод которой — первоисточники, эта разница существенна.",
          pl: "Z ustawy, taryfy ministerialnej albo oficjalnej tabeli opłat, na których każda ma się opierać; odczytane po kolei 23 sierpnia 2026, a każde odesłanie opublikowane na naszej stronie źródeł — numer ustawy, artykuł, numer i data dziennika urzędowego. Trzydzieści trzy sprawdzenia. Czternaście wróciło błędnych i zostało poprawionych. Czterech nie dało się ustalić z żadnego źródła pierwotnego — i dlatego nigdzie na stronie nie publikujemy ich jako liczb. Tam, gdzie jedyny czytelny tekst leży w bazie prawnej, a nie w samym dzienniku, źródło oznaczono jako reprodukcję, a nie oficjalne: na stronie, której cały argument to źródła pierwotne, ta różnica ma znaczenie.",
        },
      },
      {
        key: "how-often-rechecked",
        countries: [],
        sources: [],
        q: {
          en: "How often do you recheck them?",
          ru: "Как часто вы их перепроверяете?",
          pl: "Jak często je sprawdzacie ponownie?",
        },
        a: {
          en: "Not on a schedule, and we would rather say that than claim one. Everything was checked in a single sitting on 23 August 2026, and that date is printed at the top of the sources page precisely so you can judge how stale it is without asking us. Competitors in this market publish methodology sentences — one promises to recheck every programme against its regulator every 30 to 120 days — and there is no way for you to verify any of them. We could write the same sentence in a minute and it would be worth exactly as much. When a rolling recheck exists here, it will be visible as dated entries rather than as a promise.",
          ru: "Не по расписанию — и мы предпочтём сказать это, чем заявить расписание. Всё проверено за один заход 23 августа 2026 года, и эта дата стоит вверху страницы источников именно затем, чтобы вы могли сами судить, насколько она устарела, ни о чём нас не спрашивая. Конкуренты в этом рынке публикуют фразы про методологию — один обещает перепроверять каждую программу по её регулятору каждые 30–120 дней, — и проверить эти обещания вам нечем. Мы можем написать такую же фразу за минуту, и стоить она будет ровно столько же. Когда регулярная перепроверка здесь появится, она будет видна как датированные записи, а не как обещание.",
          pl: "Nie według harmonogramu — i wolimy to powiedzieć, niż deklarować harmonogram. Wszystko sprawdzono za jednym posiedzeniem 23 sierpnia 2026, a data ta stoi u góry strony źródeł właśnie po to, byś sam ocenił, jak bardzo się zestarzała, nie pytając nas. Konkurenci na tym rynku publikują zdania o metodologii — jeden obiecuje sprawdzać każdy program u jego regulatora co 30 do 120 dni — a ty nie masz jak tego zweryfikować. Moglibyśmy napisać takie samo zdanie w minutę i byłoby warte dokładnie tyle samo. Gdy powstanie tu regularne sprawdzanie, będzie widoczne jako datowane wpisy, a nie jako obietnica.",
        },
      },
      {
        key: "how-we-earn",
        countries: [],
        sources: [],
        q: {
          en: "How do you make money?",
          ru: "Как вы зарабатываете?",
          pl: "Jak zarabiacie?",
        },
        a: {
          en: "By passing enquiries to law firms and relocation advisers in these jurisdictions, who pay us for the introduction. That is the whole model, and it has an obvious bias built into it: we earn when you contact somebody, so we have an incentive to make every route look worth pursuing. The defence against that is the one thing we can actually show you — that the figures are checked against the statute and published with their citations, including the fourteen that came back wrong and the four we cannot verify at all. You are entitled to weigh what we say knowing how we are paid, which is why this answer is on the page rather than in a footer.",
          ru: "Передавая обращения юридическим фирмам и консультантам по релокации в этих юрисдикциях, которые платят нам за знакомство. Это вся модель, и в неё встроено очевидное искажение: мы зарабатываем, когда вы с кем-то связываетесь, — значит у нас есть стимул делать привлекательным любой маршрут. Защита от этого одна, и она единственная, что мы можем вам показать: цифры сверены с законом и опубликованы со ссылками, включая те четырнадцать, что оказались неверными, и те четыре, которые мы не можем подтвердить вовсе. Вы вправе взвешивать наши слова, зная, кто нам платит, — поэтому этот ответ стоит на странице, а не в подвале.",
          pl: "Przekazując zapytania kancelariom prawnym i doradcom relokacyjnym w tych jurysdykcjach, którzy płacą nam za przedstawienie. To cały model, i wbudowane jest w niego oczywiste skrzywienie: zarabiamy, gdy się z kimś skontaktujesz — więc mamy bodziec, by każda ścieżka wyglądała na wartą zachodu. Obrona przed tym jest jedna i jest jedyną rzeczą, którą możemy ci pokazać: liczby sprawdzono z ustawą i opublikowano z odesłaniami, łącznie z tymi czternastoma, które okazały się błędne, i tymi czterema, których nie potrafimy potwierdzić wcale. Masz prawo ważyć nasze słowa, wiedząc, kto nam płaci — dlatego ta odpowiedź stoi na stronie, a nie w stopce.",
        },
      },
      {
        key: "do-you-sell",
        countries: [],
        sources: [],
        q: {
          en: "Do you sell any of these programmes yourselves?",
          ru: "Продаёте ли вы сами эти программы?",
          pl: "Czy sami sprzedajecie któryś z tych programów?",
        },
        a: {
          en: "No. We are not a licensed agent anywhere, we do not file applications, we do not sell property, funds or advice, and we hold no mandate from any government or developer. This is the structural reason a comparison here can say things a country-specific agency cannot — that Malta is the most expensive of the five and allows no appeal, that Cyprus we would not choose today, that Portugal's real waiting time bears no relation to its statutory one. An agency that sells one of these five is not free to write that sentence, however honest the people are.",
          ru: "Нет. Мы нигде не лицензированный агент, не подаём заявления, не продаём ни недвижимость, ни фонды, ни консультации и не имеем мандата ни от одного правительства или застройщика. Это и есть структурная причина, по которой сравнение здесь может сказать то, чего не может агентство одной страны: что Мальта самая дорогая из пяти и не допускает обжалования, что Кипр мы бы сегодня не выбрали, что реальный срок ожидания в Португалии не имеет отношения к законному. Агентство, продающее одну из этих пяти, не свободно написать такую фразу, какими бы честными ни были там люди.",
          pl: "Nie. Nigdzie nie jesteśmy licencjonowanym agentem, nie składamy wniosków, nie sprzedajemy nieruchomości, funduszy ani doradztwa i nie mamy mandatu od żadnego rządu ani dewelopera. To strukturalny powód, dla którego porównanie może tu powiedzieć rzeczy, których nie może agencja jednego kraju: że Malta jest najdroższa z piątki i nie dopuszcza odwołania, że Cypru dziś byśmy nie wybrali, że rzeczywisty czas oczekiwania w Portugalii nie ma związku z ustawowym. Agencja sprzedająca jedną z tych pięciu nie ma swobody, by napisać takie zdanie, choćby ludzie tam byli najuczciwsi.",
        },
      },
      {
        key: "what-we-dont-publish",
        countries: [],
        sources: ["mt", "ae", "cy"],
        q: {
          en: "What do you deliberately not publish?",
          ru: "Чего вы намеренно не публикуете?",
          pl: "Czego celowo nie publikujecie?",
        },
        a: {
          en: "Four figures, and naming them is the point of this answer. Malta's processing time — no primary source publishes one, so the widely quoted four to six months appears nowhere on this site. Whether off-plan property qualifies in the UAE — rechecked across four authorities on 25 August 2026, still nothing in either direction. And two Cypriot figures: the threshold in its regulation 6(2) and the reduced VAT rate with its limits. Each of those is a question we get asked and could answer plausibly in one sentence. A plausible answer is what everyone else publishes, and it is indistinguishable from a true one right up until it costs somebody money.",
          ru: "Четыре цифры — и назвать их и есть смысл этого ответа. Срок рассмотрения на Мальте: его не публикует ни один первоисточник, поэтому ходовые «четыре-шесть месяцев» на этом сайте не встречаются нигде. Годится ли в ОАЭ объект на стадии строительства: перепроверено по четырём ведомствам 25 августа 2026 года — по-прежнему ничего ни за, ни против. И две кипрские: порог в регламенте 6(2) и пониженная ставка НДС с её пределами. Каждый из этих вопросов нам задают, и на каждый можно правдоподобно ответить одной фразой. Правдоподобный ответ — это то, что публикуют все остальные, и он неотличим от верного ровно до того момента, когда обойдётся кому-то в деньги.",
          pl: "Czterech liczb — a ich nazwanie jest sensem tej odpowiedzi. Czas rozpatrywania na Malcie: nie publikuje go żadne źródło pierwotne, więc obiegowe „cztery do sześciu miesięcy” nie pojawia się na tej stronie nigdzie. Czy w ZEA kwalifikuje się nieruchomość w budowie: sprawdzone ponownie w czterech urzędach 25 sierpnia 2026 — nadal nic ani za, ani przeciw. I dwie cypryjskie: próg z rozporządzenia 6(2) oraz obniżona stawka VAT wraz z jej limitami. O każde z tych pytań nas pytają i na każde da się prawdopodobnie odpowiedzieć jednym zdaniem. Prawdopodobna odpowiedź to właśnie to, co publikują wszyscy inni, i jest nie do odróżnienia od prawdziwej dokładnie do chwili, gdy kogoś kosztuje pieniądze.",
        },
      },
    ],
  },
];

// --- The one invariant this page sells --------------------------------------
// An answer that states a figure and points at no section of /sources is the
// exact defect this whole page exists to be the opposite of. Checking that by
// eye does not scale past a dozen answers, so it is checked at import time and
// it THROWS: a build that fails is cheaper than a page that quietly stops
// being sourced.
//
// THE ONE EXEMPTION, and it is a real distinction rather than a convenience.
// Answers in the "about this site" section carry figures about the method
// itself — thirty-three checks, fourteen wrong, four unverified. Those are
// verified by counting the sources page, not by reading a statute, so pointing
// them at a jurisdiction section would be a false citation. They are listed by
// key, so adding an exemption stays a deliberate act rather than a side effect.
const SELF_REFERENTIAL = new Set(["where-figures-from", "how-often-rechecked"]);

function assertEveryFigureIsSourced(items: FaqItem[]): void {
  const unsourced = items.filter(
    (item) =>
      item.sources.length === 0 &&
      !SELF_REFERENTIAL.has(item.key) &&
      // Any digit in any language. Deliberately blunt: a false positive costs
      // one line in SELF_REFERENTIAL, a false negative costs the argument.
      (/\d/.test(item.a.en) || /\d/.test(item.a.ru) || /\d/.test(item.a.pl)),
  );

  if (unsourced.length > 0) {
    throw new Error(
      "[moveandinvest] FAQ answers state a figure with no /sources section " +
        `behind it: ${unsourced.map((item) => item.key).join(", ")}. Add the ` +
        "SourceSection key(s) to `sources` — or, if the figure is about this " +
        "site's own method rather than about a jurisdiction, add the key to " +
        "SELF_REFERENTIAL and say why.",
    );
  }
}

/** Every section, with numbers typographically tightened at export — the same
 *  treatment sourceData.ts gets, and for the same reason: a normal space inside
 *  "€500 000" breaks across lines and turns one figure into two. */
export const FAQ_SECTIONS: FaqSection[] = tightenDeep(FAQ_SECTIONS_RAW);

/** Flat view, for the JSON-LD builder and for the seed script. */
export const FAQ_ALL: FaqItem[] = FAQ_SECTIONS.flatMap(
  (section) => section.items,
);

assertEveryFigureIsSourced(FAQ_ALL);

/** The subset the home page's own FAQ section publishes. The text is not
 *  duplicated anywhere — scripts/copy/faq.ts reads it from here. */
export const FAQ_HOME: FaqItem[] = FAQ_ALL.filter((item) => item.home === true);
