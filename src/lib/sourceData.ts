import type { Locale } from "@/i18n/routing";
import { tightenDeep } from "./typography";

// The working behind every headline figure on this site, published.
//
// IN src/lib AND NOT IN THE CMS, deliberately, and this is the one page where
// that is a matter of integrity rather than convenience. The project's standing
// rule is that a figure may not change in copy/jurisdictions.ts without
// docs/figures-verification-2026-08-23.md changing in the same commit. A
// dataset editable in Studio routes straight around that rule: somebody
// corrects a threshold in a text field, the dossier still says the old thing,
// and the page whose whole purpose is provable sourcing quietly stops being
// provable. Code-owned means it can only move in a commit, next to its
// evidence.
//
// The page HEAD — eyebrow, headline, deck, SEO — is ordinary page copy and does
// live in Sanity, in scripts/copy/sourcesPage.ts.
//
// WHY THIS PAGE EXISTS. /about makes a claim: every number carries the law it
// came from and the date it was checked, and where no primary source exists
// nothing is published. Until this file, that claim had no evidence attached —
// the working lived in docs/figures-verification-2026-08-23.md, in git, which
// is to say nowhere a reader can reach. A method described but never shown is
// an assertion.
//
// EVERYTHING HERE IS DERIVED FROM THAT DOSSIER and may not diverge from it. A
// figure corrected in one must be corrected in the other in the same commit —
// the same rule that already governs copy/jurisdictions.ts.
//
// --- Two decisions about what a "source" is ---------------------------------
//
// THE CITATION IS PRIMARY; THE URL IS A CONVENIENCE. Each source carries its
// formal reference — statute number, article, gazette issue and date — and that
// is the thing a reader verifies against. The link is where it can be read
// today. This ordering is not pedantry: it was forced by Greece, whose official
// gazette (Εθνικό Τυπογραφείο, et.gr) publishes only a search form and
// session-token PDF viewer URLs, so no durable official link exists at all. A
// page of URLs would have quietly rotted; a page of citations does not.
//
// EVERY LINK IS LABELLED `official` OR `reproduction`, and this caught a real
// problem in the dossier itself while preparing this page. Three of the Greek
// sources pointed at taxheaven.gr, which reproduces the statute faithfully but
// is a commercial legal database, not the gazette. The dossier's own rule is
// "a link to the law or to the authority's own page". Publishing those as
// primary on the one page whose entire argument is "primary sources only"
// would have undercut the argument. They stay — a reproduction is where you
// can actually read the text — and they are marked for what they are.
//
// WHAT IS DELIBERATELY NOT PUBLISHED: the dossier's closing section, which is
// about what the findings break inside the product — the route finder's first
// budget band answering with emptiness, the speed question no longer
// discriminating. That is our own roadmap, not evidence a reader needs, and a
// sources page padded with it stops being a sources page.

export type Verdict =
  /** The site already said this and the source agrees. */
  | "confirmed"
  /** The site said something else. The figure changed. */
  | "corrected"
  /** The source says something the site did not mention at all. */
  | "added"
  /** No primary source publishes it. Nothing is stated. */
  | "unverified"
  /** The thing itself no longer exists. */
  | "withdrawn";

export interface SourceLink {
  /** The permanent reference: statute, article, gazette, date. Language-neutral
   *  by nature — a law number is the same number in every language, and
   *  translating one is how a citation stops being checkable. */
  citation: string;
  url: string;
  /** `official` — the authority, the ministry or the gazette itself.
   *  `reproduction` — a database that reproduces the official text. */
  kind: "official" | "reproduction";
  /** Why this source is not what one would want. Rendered beside it. */
  caveat?: Record<Locale, string>;
}

export interface Claim {
  /** What the site states, phrased as the thing being checked. */
  subject: Record<Locale, string>;
  verdict: Verdict;
  /** An ISO key into CHECK_DATES, set only where this row was read on a day
   *  other than the page's baseline. Rendered beside the verdict; absent on a
   *  row that has not changed since the page was first published. */
  checked?: keyof typeof CHECK_DATES;
  /** What the source actually says. Short: this is a table cell, not an essay
   *  — the jurisdiction page carries the prose. */
  finding: Record<Locale, string>;
}

export interface SourceSection {
  /** `pt` | `gr` | `mt` | `ae` | `cy` for a jurisdiction, or a bare key for a
   *  cross-cutting section. Also the anchor id, so a jurisdiction page can
   *  deep-link to its own working. */
  key: string;
  /** Set only for a section that is NOT one of the five jurisdictions; the
   *  jurisdictions take their names from COUNTRY_LABELS so the page cannot
   *  disagree with the rest of the site about what a country is called. */
  heading?: Record<Locale, string>;
  claims: Claim[];
  sources: SourceLink[];
  /** One paragraph under the sources, where the sourcing itself needs saying. */
  note?: Record<Locale, string>;
}

// WHEN EACH ROW WAS READ, AND WHY THIS IS NO LONGER ONE DATE.
//
// The note that stood here said the page carried a single date "because they
// were checked in one sitting — a per-row date would imply a rolling process
// this project does not run". That was true on 23 August 2026 and stopped
// being true two days later. Since then the Greek §7A row was corrected on
// 25 August, and the Emirati cost row and the Greek article 5A row on
// 28 August. Each correction was recorded in a code comment, which is to say:
// recorded somewhere the reader cannot see. Meanwhile the line at the foot of
// the page went on saying 23 August.
//
// A page whose entire claim is that its figures are traceable was therefore
// telling readers something slightly false about its own freshness — and it is
// exactly the failure this page audits other people for, since a stale
// "last updated" stamp is the pattern named in three of the entries.
//
// THE SHAPE OF THE FIX: a baseline date for the page, and an override on the
// rows that have one. Not a date on all thirty-three rows, which would put a
// column of identical strings beside every claim and bury the three that
// differ; and not a "last corrected" line per section, which would say that
// something in the section changed without saying which row, so a corrected
// row and an untouched one would still look the same.
//
// Keyed by ISO date so a row names one in a short string rather than carrying
// three translated ones of its own. The strings stay hand-written: Intl
// renders the Russian as "23 августа 2026 г.", and the abbreviation is not what
// the rest of this site says.
const CHECKED_2026_08_23: Record<Locale, string> = {
  en: "23 August 2026",
  ru: "23 августа 2026 года",
  pl: "23 sierpnia 2026",
};

const CHECKED_2026_08_25: Record<Locale, string> = {
  en: "25 August 2026",
  ru: "25 августа 2026 года",
  pl: "25 sierpnia 2026",
};

const CHECKED_2026_08_28: Record<Locale, string> = {
  en: "28 August 2026",
  ru: "28 августа 2026 года",
  pl: "28 sierpnia 2026",
};

const CHECKED_2026_08_30: Record<Locale, string> = {
  en: "30 August 2026",
  ru: "30 августа 2026 года",
  pl: "30 sierpnia 2026",
};

const CHECKED_2026_09_01: Record<Locale, string> = {
  en: "1 September 2026",
  ru: "1 сентября 2026 года",
  pl: "1 września 2026",
};

/** Every date on which any row of this page was read against its source. A
 *  claim's `checked` key indexes this. */
export const CHECK_DATES: Record<string, Record<Locale, string>> = {
  "2026-08-23": CHECKED_2026_08_23,
  "2026-08-25": CHECKED_2026_08_25,
  "2026-08-28": CHECKED_2026_08_28,
  "2026-08-30": CHECKED_2026_08_30,
  "2026-09-01": CHECKED_2026_09_01,
};

/** The date that governs every row not carrying its own. */
export const CHECKED_ON: Record<Locale, string> = CHECKED_2026_08_23;

const SOURCE_SECTIONS_RAW: SourceSection[] = [
  // --- Portugal -------------------------------------------------------------
  {
    key: "pt",
    claims: [
      {
        subject: {
          en: "The route is a Golden Visa through a fund; property was removed",
          ru: "Маршрут — Golden Visa через фонд, недвижимость исключена",
          pl: "Ścieżka to Golden Visa przez fundusz, nieruchomości wykreślone",
        },
        verdict: "confirmed",
        finding: {
          en: "Lei 56/2023 (“Mais Habitação”), art. 53 repealed subparagraphs i, iii and iv of art. 3(1) of Lei 23/2007 — both property options and the capital transfer. Art. 3(5) bars any investment aimed, even indirectly, at real estate.",
          ru: "Lei 56/2023 «Mais Habitação», ст. 53 отменила подпункты i, iii и iv ст. 3(1) Lei 23/2007 — обе «недвижимые» опции и перевод капитала. Ст. 3(5) запрещает инвестиции, прямо или косвенно направленные в недвижимость.",
          pl: "Lei 56/2023 (\u201eMais Habitação\u201d), art. 53 uchylił podpunkty i, iii oraz iv art. 3(1) Lei 23/2007 — obie opcje nieruchomościowe i transfer kapitału. Art. 3(5) zakazuje inwestycji skierowanych, choćby pośrednio, w nieruchomości.",
        },
      },
      {
        subject: {
          en: "€500,000 threshold",
          ru: "Порог €500 000",
          pl: "Próg €500 000",
        },
        verdict: "confirmed",
        finding: {
          en: "Subparagraph vii: a €500,000 subscription to a fund that is not a property fund, held at least five years, with at least 60% in companies seated in Portugal.",
          ru: "Подпункт vii: подписка на фонд €500 000, фонд не недвижимостный, срок не менее пяти лет, не менее 60% в компаниях с местом нахождения в Португалии.",
          pl: "Podpunkt vii: subskrypcja funduszu za €500 000, fundusz nie nieruchomościowy, okres co najmniej pięć lat, co najmniej 60% w spółkach z siedzibą w Portugalii.",
        },
      },
      {
        subject: {
          en: "The other routes the site did not mention",
          ru: "Другие маршруты, которых на сайте не было",
          pl: "Inne ścieżki, o których strona nie wspominała",
        },
        verdict: "added",
        finding: {
          en: "Ten jobs (eight in low-density areas, no capital threshold); €500,000 into research (€400,000 in low-density areas); €250,000 into cultural heritage (€220,000); €500,000 into a company creating five permanent jobs.",
          ru: "Десять рабочих мест (восемь в малонаселённых районах, без порога по капиталу); €500 000 в научные исследования (€400 000 в малонаселённых); €250 000 в культурное наследие (€220 000); €500 000 в компанию с созданием пяти постоянных мест.",
          pl: "Dziesięć miejsc pracy (osiem na obszarach o niskiej gęstości, bez progu kapitałowego); €500 000 na badania naukowe (€400 000 na obszarach o niskiej gęstości); €250 000 na dziedzictwo kulturowe (€220 000); €500 000 w spółkę tworzącą pięć stałych etatów.",
        },
      },
      {
        subject: {
          en: "The €1.5m capital transfer",
          ru: "Перевод капитала €1,5 млн",
          pl: "Transfer kapitału €1,5 mln",
        },
        verdict: "withdrawn",
        finding: {
          en: "It no longer exists.",
          ru: "Больше не существует.",
          pl: "Już nie istnieje.",
        },
      },
      {
        subject: {
          en: "“6–9 months to the permit”",
          ru: "«6–9 месяцев до пермита»",
          pl: "\u201e6–9 miesięcy do zezwolenia\u201d",
        },
        verdict: "corrected",
        finding: {
          en: "The statute (art. 82(5) of Lei 23/2007) allows 90 days for a decision. In practice it runs one to three years: filing to biometrics 6–24 months, biometrics to card 6–18. AIMA reported roughly 30,000 pending cases on 4 August 2026.",
          ru: "Закон (ст. 82(5) Lei 23/2007) даёт 90 дней на решение. Фактически — от года до трёх: подача → биометрия 6–24 месяца, биометрия → карта 6–18. На 4 августа 2026 года AIMA сообщает о примерно 30 000 нерассмотренных дел.",
          pl: "Ustawa (art. 82(5) Lei 23/2007) daje 90 dni na decyzję. W praktyce trwa to od roku do trzech: złożenie → biometria 6–24 miesiące, biometria → karta 6–18. Na 4 sierpnia 2026 AIMA podaje około 30 000 nierozpatrzonych spraw.",
        },
      },
      {
        subject: {
          en: "IFICI, 20% flat — the site cited the wrong statute",
          ru: "IFICI, 20% — сайт ссылался не на тот закон",
          pl: "IFICI, 20% — strona powoływała się na niewłaściwą ustawę",
        },
        verdict: "corrected",
        finding: {
          en: "The basis is art. 58-A of the EBF (introduced by Lei 82/2023), not the CIRS; the procedure is Portaria 352/2024/1 of 23 December 2024. 20% on Portuguese category A and B income from qualifying activity, for ten years. Registration by 15 January of the year after residency is obtained. Pensions (category H) and income from blacklisted jurisdictions are excluded and taxed at 35%.",
          ru: "Основание — ст. 58-A EBF (введена Lei 82/2023), а не CIRS; порядок — Portaria 352/2024/1 от 23 декабря 2024 года. 20% на португальский доход категорий A и B от квалифицированной деятельности, десять лет. Регистрация — до 15 января года, следующего за годом получения резидентства. Пенсии (категория H) и доход из «чёрных» юрисдикций исключены и облагаются по 35%.",
          pl: "Podstawą jest art. 58-A EBF (wprowadzony przez Lei 82/2023), a nie CIRS; tryb — Portaria 352/2024/1 z 23 grudnia 2024. 20% od portugalskiego dochodu kategorii A i B z kwalifikowanej działalności, przez dziesięć lat. Rejestracja do 15 stycznia roku następującego po uzyskaniu rezydencji. Emerytury (kategoria H) i dochód z jurysdykcji z czarnej listy są wyłączone i opodatkowane stawką 35%.",
        },
      },
      {
        subject: {
          en: "“€62,000 on top” — understated",
          ru: "«Сверх того €62 000» — занижено",
          pl: "\u201ePonad to €62 000\u201d — zaniżone",
        },
        verdict: "corrected",
        finding: {
          en: "AIMA fees from 1 March 2026: €842.80 to consider, €8,418.90 to issue, €4,210.30 to renew, €8,418.90 per family member, less 25% when filed online. One applicant to the first renewal is roughly €13,470 in fees alone; a family of three roughly €40,400. With a lawyer and fund commissions the real range is €30,000–50,000 for one and €65,000–90,000 for a family.",
          ru: "Пошлины AIMA с 1 марта 2026 года: рассмотрение €842,80, выдача €8 418,90, продление €4 210,30, член семьи €8 418,90, скидка 25% при подаче онлайн. Один заявитель до первого продления — около €13 470 только пошлин; семья из трёх — около €40 400. С юристом и комиссиями фонда реально €30–50 тыс. на одного и €65–90 тыс. на семью.",
          pl: "Opłaty AIMA od 1 marca 2026: rozpatrzenie €842,80, wydanie €8 418,90, odnowienie €4 210,30, członek rodziny €8 418,90, zniżka 25% przy złożeniu online. Jeden wnioskodawca do pierwszego odnowienia to około €13 470 samych opłat; rodzina trzyosobowa około €40 400. Z prawnikiem i prowizjami funduszu realnie €30–50 tys. na osobę i €65–90 tys. na rodzinę.",
        },
      },
    ],
    sources: [
      {
        citation: "Lei 56/2023 (“Mais Habitação”), art. 53",
        url: "https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/117906/L%2056%202023%20POR.pdf",
        kind: "reproduction",
        caveat: {
          en: "Hosted by the ILO's NATLEX database, which reproduces the official text.",
          ru: "Размещено в базе NATLEX Международной организации труда, которая воспроизводит официальный текст.",
          pl: "Udostępnione w bazie NATLEX Międzynarodowej Organizacji Pracy, która reprodukuje tekst oficjalny.",
        },
      },
      {
        citation: "AIMA — ARI, subparagraph vii (fund subscription)",
        url: "https://aima.gov.pt/documents/ari-subalinea-7.pdf",
        kind: "official",
      },
      {
        citation:
          "AIMA — ARI, subparagraphs ii, v, vi, viii (the other routes)",
        url: "https://aima.gov.pt/documents/ari-subalinea-2.pdf",
        kind: "official",
      },
      {
        citation: "AIMA — table of fees and charges",
        url: "https://aima.gov.pt/documents/tabela-de-taxas-e-demais-encargos-a-cobrar-pelos-procedimentos-administrativos.pdf",
        kind: "official",
      },
      {
        citation: "Portaria 352/2024/1 of 23 December 2024 (IFICI procedure)",
        url: "https://files.diariodarepublica.pt/1s/2024/12/24800/0004000045.pdf",
        kind: "official",
      },
      {
        citation: "Portal das Finanças — IFICI",
        url: "https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-01018.aspx",
        kind: "official",
      },
    ],
    note: {
      en: "The 2026 fees are the one weak point on this jurisdiction. AIMA's March revision of the fee table does not answer an automated request, so the figures to the cent come from two independent reports of that table rather than from the table itself. Treat them as secondary until the PDF can be read directly.",
      ru: "Пошлины 2026 года — единственное слабое место по этой юрисдикции. Мартовская редакция таблицы сборов AIMA не отвечает на автоматический запрос, поэтому цифры до цента взяты из двух независимых сообщений об этой таблице, а не из неё самой. Считайте их вторичными, пока PDF не удастся прочитать напрямую.",
      pl: "Opłaty z 2026 roku to jedyny słaby punkt tej jurysdykcji. Marcowa wersja tabeli opłat AIMA nie odpowiada na automatyczne zapytanie, więc kwoty co do centa pochodzą z dwóch niezależnych doniesień o tej tabeli, a nie z niej samej. Należy traktować je jako wtórne, dopóki PDF nie da się odczytać bezpośrednio.",
    },
  },

  // --- Greece ---------------------------------------------------------------
  {
    key: "gr",
    claims: [
      {
        subject: {
          en: "The route is a Golden Visa through property",
          ru: "Маршрут — Golden Visa через недвижимость",
          pl: "Ścieżka to Golden Visa przez nieruchomość",
        },
        verdict: "confirmed",
        finding: {
          en: "Art. 100 of Law 5038/2023 as amended by art. 64 of Law 5100/2024; the procedure is KYA 214926/2025.",
          ru: "Ст. 100 Закона 5038/2023 в редакции ст. 64 Закона 5100/2024; порядок — KYA 214926/2025.",
          pl: "Art. 100 ustawy 5038/2023 w brzmieniu art. 64 ustawy 5100/2024; tryb — KYA 214926/2025.",
        },
      },
      {
        subject: {
          en: "“€250,000 threshold”",
          ru: "«Порог €250 000»",
          pl: "\u201ePróg €250 000\u201d",
        },
        verdict: "corrected",
        finding: {
          en: "Since 1 September 2024 there are three tiers. €800,000 across all of Attica, the Thessaloniki regional unit, Mykonos, Thira (Santorini) and islands with populations above 3,100. €400,000 everywhere else. €250,000 only by exception: conversion of premises to residential use, reconstruction of an industrial building idle for five years, or full restoration of a listed building — and the works must be finished before the application is filed.",
          ru: "С 1 сентября 2024 года три уровня. €800 000 — вся Аттика, номовая единица Салоники, Миконос, Тира (Санторини) и острова с населением свыше 3 100 человек. €400 000 — остальная Греция. €250 000 — только как исключение: перевод помещений в жилые, реконструкция промышленного здания, простаивавшего пять лет, или полная реставрация здания-памятника, причём работы должны быть завершены до подачи.",
          pl: "Od 1 września 2024 obowiązują trzy poziomy. €800 000 — cała Attyka, jednostka regionalna Saloniki, Mykonos, Thira (Santorini) i wyspy powyżej 3 100 mieszkańców. €400 000 — reszta kraju. €250 000 — wyłącznie jako wyjątek: zmiana przeznaczenia lokali na mieszkalne, przebudowa budynku przemysłowego nieużywanego przez pięć lat albo pełna renowacja budynku zabytkowego, przy czym prace muszą być zakończone przed złożeniem wniosku.",
        },
      },
      {
        subject: {
          en: "Conditions the site did not mention",
          ru: "Условия, которых на сайте не было",
          pl: "Warunki, o których strona nie wspominała",
        },
        verdict: "added",
        checked: "2026-08-25",
        // CORRECTED ON 25 AUGUST 2026 — and the correction is to THIS page
        // rather than to a jurisdiction page. The row used to read "a €50,000
        // fine, or €150,000 and withdrawal of the permit where the property is
        // used as an office or transferred in breach", which had the tiers the
        // wrong way round on both counts.
        //
        // Read verbatim, art. 100 §7A puts the sanctions in three separate
        // sentences: breach of EITHER prohibition — sharing-economy letting,
        // sub-letting, or use as a company seat — revokes the permit AND
        // carries €50,000; €150,000 attaches to failing the restoration
        // condition of §4, with no revocation stated; and a transfer against
        // §2(δ) carries €150,000 WITH revocation. Revocation was never
        // exclusive to the higher tier, and office use was never in it.
        //
        // WHY THIS ONE MATTERS MORE THAN ITS SIZE. The Greek property page's
        // own prose already said it correctly — "both a €50,000 administrative
        // fine and revocation of the permit" — so the site was stating two
        // different things about one statute on two pages, and the wrong one
        // was on the page whose entire job is being right. That is the exact
        // failure this project had just catalogued in a competitor, whose hub
        // page contradicts its own country page on the citizenship timeline.
        finding: {
          en: "The property must be a single one, at least 120 m² of principal space. Art. 100 §7A: sharing-economy letting, sub-letting and use as a company seat each revoke the permit and carry €50,000. €150,000 is separate — for failing the restoration condition of §4, without revocation, and for a transfer against §2(δ), with it.",
          ru: "Объект должен быть один, минимум 120 м² основных помещений. Ст. 100 §7A: краткосрочная сдача через сервисы, субаренда и использование под офис компании — каждое влечёт отзыв разрешения и штраф €50 000. €150 000 — отдельно: за невыполнение условия о восстановлении по §4, без отзыва, и за передачу вопреки §2(δ), с отзывом.",
          pl: "Nieruchomość musi być jedna, co najmniej 120 m² powierzchni głównej. Art. 100 §7A: najem w ramach ekonomii współdzielenia, podnajem i wykorzystanie jako siedziba spółki — każde powoduje cofnięcie zezwolenia i karę €50 000. €150 000 osobno: za niespełnienie warunku odbudowy z §4, bez cofnięcia, i za przeniesienie wbrew §2(δ), z cofnięciem.",
        },
      },
      {
        subject: {
          en: "“2–4 months to the permit”",
          ru: "«2–4 месяца до пермита»",
          pl: "\u201e2–4 miesiące do zezwolenia\u201d",
        },
        verdict: "corrected",
        finding: {
          en: "The statute sets no issuing deadline. On filing, a βεβαίωση is issued (art. 10 of Law 5038/2023) which by itself confers lawful residence and the rights of the permit until a decision. In November 2025 there were 13,499 pending cases, 10,703 of them in Attica; waits reached 18 months and are now shortening.",
          ru: "Срока выдачи в законе нет. При подаче выдаётся βεβαίωση (ст. 10 Закона 5038/2023) — она сама по себе даёт законное пребывание и права по разрешению до решения. На ноябрь 2025 года — 13 499 нерассмотренных дел, 10 703 из них в Аттике; сроки доходили до 18 месяцев и сейчас сокращаются.",
          pl: "Ustawa nie wyznacza terminu wydania. Przy złożeniu wniosku wydawana jest βεβαίωση (art. 10 ustawy 5038/2023), która sama w sobie daje legalny pobyt i uprawnienia z zezwolenia do czasu decyzji. W listopadzie 2025 czekało 13 499 spraw, z tego 10 703 w Attyce; terminy sięgały 18 miesięcy i obecnie się skracają.",
        },
      },
      {
        subject: {
          en: "Non-dom, €100,000 a year — true, with a trap",
          ru: "Non-dom, €100 000 в год — верно, но с ловушкой",
          pl: "Non-dom, €100 000 rocznie — prawda, ale z pułapką",
        },
        verdict: "added",
        checked: "2026-08-28",
        // CORRECTED ON 28 AUGUST 2026, and the correction is to a sentence this
        // page had been publishing since launch: "the golden visa does not
        // count towards that investment".
        //
        // It does count. Art. 5A §1(b) was read in full and it names the asset
        // classes expressly — «σε ακίνητα ή επιχειρήσεις ή κινητές αξίες ή
        // μετοχές ή μερίδια» — so real estate qualifies, and a property bought
        // for the permit is real estate like any other. What it has to be is
        // worth €500,000, which is the part worth telling a reader: the golden
        // visa's own tiers are €800,000, €400,000 and €250,000, so only the
        // first of the three clears the tax regime's floor on its own.
        //
        // WHAT WAS RIGHT AND IS KEPT, in the second half of the sentence. There
        // IS a waiver of the investment condition, in the fourth sentence of
        // §1: «Δεν απαιτείται να συντρέχει η προϋπόθεση της περ. β', εφόσον
        // πρόκειται για φυσικό πρόσωπο που έχει αποκτήσει και διατηρεί άδεια
        // διαμονής για επενδυτική δραστηριότητα … σύμφωνα με τις διατάξεις του
        // άρθρου 16 του ν. 4251/2014». It names art. 16 and nothing else.
        //
        // And art. 16 was never the golden visa. It was the permit for
        // investment ACTIVITY; the property permit was art. 20 §B. The Athens
        // Bar Association's correspondence table maps art. 16 onto arts. 96, 97
        // and 99 of Law 5038/2023 and art. 20 §B onto art. 100 — so the waiver
        // did not reach a property investor even before the old code was
        // replaced. The distinction the row now draws is between satisfying the
        // condition and being excused from it, which is not the distinction it
        // drew before.
        finding: {
          en: "Art. 5A of Law 4172/2013: €100,000 a year on foreign income, plus €20,000 per family member, an investment of €500,000 within three years, up to fifteen years. §1(b) names real estate among the qualifying assets, so a property does count — but only one worth €500,000, which is neither the €400,000 tier nor the €250,000 exceptions. What the permit does not do is excuse the investment: the waiver in §1 names only the investment-activity permit of art. 16 of Law 4251/2014, whose successors are arts. 96, 97 and 99, and not art. 100.",
          ru: "Ст. 5A Закона 4172/2013: €100 000 в год на зарубежный доход, плюс €20 000 на каждого члена семьи, инвестиция €500 000 в течение трёх лет, максимум пятнадцать лет. §1(b) прямо называет недвижимость среди подходящих активов, так что объект засчитывается — но только на €500 000, а это не уровень €400 000 и не исключения по €250 000. Чего разрешение не даёт, так это освобождения от самой инвестиции: оговорка в §1 названа только для разрешения на инвестиционную деятельность по ст. 16 Закона 4251/2014, преемники которой — ст. 96, 97 и 99, а не ст. 100.",
          pl: "Art. 5A ustawy 4172/2013: €100 000 rocznie od dochodu zagranicznego, plus €20 000 na członka rodziny, inwestycja €500 000 w ciągu trzech lat, maksymalnie piętnaście lat. §1(b) wymienia nieruchomości wśród kwalifikujących się aktywów, więc lokal się zalicza — ale tylko wart €500 000, a to nie jest ani próg €400 000, ani wyjątki po €250 000. Czego zezwolenie nie daje, to zwolnienia z samej inwestycji: wyłączenie w §1 wskazuje wyłącznie zezwolenie na działalność inwestycyjną z art. 16 ustawy 4251/2014, którego następcami są art. 96, 97 i 99, a nie art. 100.",
        },
      },
      {
        subject: {
          en: "“€34,000 on top”",
          ru: "«Сверх того €34 000»",
          pl: "\u201ePonad to €34 000\u201d",
        },
        verdict: "confirmed",
        finding: {
          en: "Correct at the €400,000 tier. Transfer tax 3% plus a 3% municipal surcharge on the tax, so 3.09%. VAT on new build (24%) is suspended to 31 December 2026, so ΦΜΑ is what is actually paid. The fee is a €2,000 e-paravolo for the application plus €16 for the card. KYA sets no family-member fee, so no figure is published for one. At the €800,000 tier the same set comes to roughly €67,000.",
          ru: "Верно для уровня €400 000. Налог на переход права 3% плюс муниципальная надбавка 3% на сам налог, то есть 3,09%. НДС на новостройки (24%) приостановлен до 31 декабря 2026 года, то есть на практике платится ΦΜΑ. Пошлина — э-параволо €2 000 за заявление плюс €16 за печать карты. Сбор за члена семьи KYA не устанавливает, поэтому цифра не публикуется. На уровне €800 000 тот же набор даёт около €67 000.",
          pl: "Prawda dla poziomu €400 000. Podatek od przeniesienia 3% plus dopłata gminna 3% od samego podatku, czyli 3,09%. VAT od nowego budownictwa (24%) jest zawieszony do 31 grudnia 2026, więc w praktyce płaci się ΦΜΑ. Opłata to e-paravolo €2 000 za wniosek plus €16 za kartę. KYA nie ustala opłaty za członka rodziny, więc żadna kwota nie jest publikowana. Na poziomie €800 000 ten sam zestaw daje około €67 000.",
        },
      },
    ],
    sources: [
      {
        citation:
          "Law 5038/2023, art. 100 — ΦΕΚ Α΄ 81/01.04.2023, as amended by art. 64 of Law 5100/2024",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/100",
        kind: "reproduction",
        caveat: {
          en: "A commercial legal database. Greece's official gazette (Εθνικό Τυπογραφείο) publishes only a search form and session-token viewer URLs, so no durable official link exists — the gazette citation beside this is the reference to check.",
          ru: "Коммерческая правовая база. Официальная газета Греции (Εθνικό Τυπογραφείο) публикует только поисковую форму и адреса просмотрщика с сессионным токеном, поэтому устойчивой официальной ссылки не существует — проверять следует по номеру газеты слева.",
          pl: "Komercyjna baza prawna. Grecki dziennik urzędowy (Εθνικό Τυπογραφείο) publikuje wyłącznie formularz wyszukiwania i adresy przeglądarki z tokenem sesji, więc trwały link oficjalny nie istnieje — sprawdzać należy po sygnaturze dziennika obok.",
        },
      },
      {
        citation: "Law 5038/2023, art. 10 (the βεβαίωση)",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/10",
        kind: "reproduction",
      },
      {
        citation: "Law 4172/2013, art. 5A (non-dom)",
        url: "https://www.taxheaven.gr/law/4172/2013/arthro/5%CE%91",
        kind: "reproduction",
      },
      {
        citation: "KYA 214926/2025 (procedure)",
        url: "https://www.e-nomothesia.gr/kat-allodapoi/kya-214926-2025.html",
        kind: "reproduction",
      },
      // ADDED 28 AUGUST 2026 for the Greek relocation guide, which goes past
      // the purchase into the permit, the permanent statuses and the tax
      // regimes. Every one of these was read article by article rather than
      // taken from a summary; where only a summary could be got, the guide
      // says so at the point of use rather than here.
      {
        citation:
          "Law 5038/2023, art. 95 — family members, as amended by art. 29 of Law 5275/2026 (ΦΕΚ Α΄ 17/06.02.2026)",
        url: "https://www.taxheaven.gr/law/5275/2026/arthro/29",
        kind: "reproduction",
      },
      {
        citation:
          "Law 5038/2023, arts. 143–145 — EU long-term resident status (Μ.1)",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/144",
        kind: "reproduction",
      },
      {
        citation:
          "Law 5038/2023, art. 160 — proof of Greek, as amended by art. 37 of Law 5275/2026",
        url: "https://www.taxheaven.gr/law/5275/2026/arthro/37",
        kind: "reproduction",
      },
      {
        citation:
          "Law 5038/2023, art. 161 — the ten-year permit (Μ.2), replaced by art. 38 of Law 5275/2026",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/161",
        kind: "reproduction",
        caveat: {
          en: "The consolidated article was read in full; the replacing provision itself could only be obtained in summary, so the two were compared point by point rather than word for word.",
          ru: "Консолидированная статья прочитана целиком; сама заменяющая норма далась только в пересказе, поэтому две версии сверены по пунктам, а не дословно.",
          pl: "Tekst ujednolicony przeczytano w całości; sam przepis zastępujący udało się uzyskać wyłącznie w streszczeniu, więc obie wersje porównano punkt po punkcie, a nie słowo w słowo.",
        },
      },
      {
        citation:
          "Law 5038/2023, art. 163 §8 — the permit for holders of sufficient resources (type Ι.8)",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/163",
        kind: "reproduction",
      },
      {
        citation:
          "KYA 225679/2024 — the €3,500 a month, ΦΕΚ Β΄ 5223/17.09.2024",
        url: "https://migration.gov.gr/wp-content/uploads/2024/10/3_%CE%9A%CE%A5%CE%91-%CE%95%CF%80%CE%B1%CF%81%CE%BA%CF%8E%CE%BD-%CF%80%CF%8C%CF%81%CF%89%CE%BD.pdf",
        kind: "official",
      },
      {
        citation: "Law 4172/2013, art. 5B — the 7% rate for foreign pensioners",
        url: "https://www.taxheaven.gr/law/4172/2013/arthro/5%CE%92",
        kind: "reproduction",
      },
      {
        citation:
          "Law 4172/2013, art. 5C — the 50% exemption for relocating employees and self-employed",
        url: "https://www.taxheaven.gr/law/4172/2013/arthro/5%CE%93",
        kind: "reproduction",
      },
      {
        citation:
          "AADE — the three regimes of arts. 5A, 5B and 5C, with their implementing decisions",
        url: "https://www.aade.gr/sites/default/files/2023-08/forologika_kinitra_proselkysis_f.katoikiwn.pdf",
        kind: "official",
      },
      {
        citation:
          "Ministry of Migration and Asylum — suspension of investment permits for citizens of the Russian Federation, 28 February 2022",
        url: "https://migration.gov.gr/en/anastoli-ekdosis-i-ananeosis-adeion-diamonis-ependytikoy-skopoy-gia-polites-tis-rosikis-omospondias-mechri-neoteras/",
        kind: "official",
      },
      {
        citation:
          "Ministry of Migration and Asylum — renewals released, new applications still suspended, 1 April 2022",
        url: "https://migration.gov.gr/en/arsi-anastolis-exetasis-kai-ekdosis-ekkremon-aitiseon-ananeosis-kai-ypovolis-aitiseon-ananeosis-titlon-diamonis-politon-tis-rosikis-omospondias-kai-tis-leykorosias-diatireitai-mechri-neote/",
        kind: "official",
        caveat: {
          en: "An announcement rather than a legal instrument. No decision number, no gazette reference: the restriction appears never to have been published as an act, which is itself worth knowing before planning around it.",
          ru: "Объявление, а не правовой акт. Ни номера решения, ни ссылки на газету: ограничение, судя по всему, никогда не публиковалось как акт, и это само по себе стоит знать, прежде чем строить на нём планы.",
          pl: "Komunikat, a nie akt prawny. Bez numeru decyzji i bez sygnatury dziennika: ograniczenie najwyraźniej nigdy nie zostało opublikowane jako akt, co samo w sobie warto wiedzieć, zanim się na nim oprze plany.",
        },
      },
      {
        citation:
          "Council Directive 2003/109/EC, arts. 3(2), 4(1), 14 and 15 — OJ L 16/44 of 23.01.2004",
        url: "https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2004:016:0044:0053:EN:PDF",
        kind: "official",
        caveat: {
          en: "Arts. 4(1) and 14(1) were read verbatim; arts. 5 and 15 came back in summary. The directive matters twice over: art. 143 of the Greek code transposes its art. 3, and its art. 14 is what carries the status to another member state — which the national ten-year permit does not.",
          ru: "Ст. 4(1) и 14(1) прочитаны дословно; ст. 5 и 15 — в пересказе. Директива важна дважды: ст. 143 греческого кодекса переносит её ст. 3, а её ст. 14 — то, что переносит статус в другое государство-член, чего национальное десятилетнее разрешение не даёт.",
          pl: "Art. 4(1) i 14(1) odczytano dosłownie; art. 5 i 15 wróciły w streszczeniu. Dyrektywa jest ważna podwójnie: art. 143 greckiego kodeksu transponuje jej art. 3, a jej art. 14 przenosi status do innego państwa członkowskiego, czego krajowe zezwolenie dziesięcioletnie nie daje.",
        },
      },
      {
        citation:
          "Commission Recommendation C(2022) 2028 final of 28 March 2022 — investor citizenship and residence schemes",
        url: "https://data.consilium.europa.eu/doc/document/ST-7916-2022-INIT/en/pdf",
        kind: "official",
      },
      {
        citation:
          "KYA 8934/2026 — the minimum wage from 1 April 2026, ΦΕΚ Β΄ 1759/27.03.2026",
        url: "https://www.forin.gr/articles/article/89767/kua-8934-2026",
        kind: "reproduction",
      },
      {
        citation: "stegasi.gov.gr — the raised thresholds",
        url: "https://stegasi.gov.gr/programs/afxisi-oriou-elachistis-ependysis-se-akinita-gia-apoktisi-golden-visa/",
        kind: "official",
      },
      {
        citation: "AADE — real estate transfer tax",
        url: "https://www.aade.gr/en/greeks-abroad-non-residents/property-taxation/real-estate-transfer-tax",
        kind: "official",
      },
    ],
    note: {
      en: "The migration ministry's own golden-visa pages were out of date when this was checked: they still cited the repealed art. 20B of Law 4251/2014 and the €250,000 figure. That is why the thresholds here come from stegasi.gov.gr and from the statute, and not from the page a reader would most naturally land on.",
      ru: "Собственные страницы миграционного министерства по золотой визе на момент проверки устарели: они всё ещё ссылались на отменённую ст. 20B Закона 4251/2014 и на €250 000. Поэтому пороги здесь взяты со stegasi.gov.gr и из закона, а не со страницы, на которую читатель попал бы естественнее всего.",
      pl: "Własne strony ministerstwa migracji dotyczące złotej wizy były w chwili sprawdzania nieaktualne: nadal powoływały się na uchylony art. 20B ustawy 4251/2014 i na kwotę €250 000. Dlatego progi pochodzą tutaj ze stegasi.gov.gr i z ustawy, a nie ze strony, na którą czytelnik trafiłby najnaturalniej.",
    },
  },

  // --- Malta ----------------------------------------------------------------
  {
    key: "mt",
    claims: [
      {
        subject: {
          en: "“Permanent residence programme”",
          ru: "«Программа постоянного резидентства»",
          pl: "\u201eProgram stałej rezydencji\u201d",
        },
        verdict: "confirmed",
        finding: {
          en: "Correct in substance. Formally the Malta Permanent Residence Programme (MPRP), S.L. 217.26 under the Immigration Act (Cap. 217).",
          ru: "Верно по сути. Официально — Malta Permanent Residence Programme (MPRP), S.L. 217.26 к Immigration Act (Cap. 217).",
          pl: "Prawda co do istoty. Formalnie Malta Permanent Residence Programme (MPRP), S.L. 217.26 do Immigration Act (Cap. 217).",
        },
      },
      {
        subject: {
          en: "“€300,000 threshold”",
          ru: "«Порог €300 000»",
          pl: "\u201ePróg €300 000\u201d",
        },
        verdict: "corrected",
        checked: "2026-09-01",
        finding: {
          en: "€300,000 was the south-Malta and Gozo threshold before the reform; there is no regional difference any more. Under L.N. 310/2024 from 1 January 2025 and L.N. 146/2025 of 22 July 2025: purchase €375,000 anywhere, or rent €14,000 a year; government contribution €37,000 either way; administrative fee €60,000 for the main applicant; NGO donation €2,000; €7,500 per dependant, with spouse, minor children and adult children with a disability free; card €500 per person. Held for five years. Plus proof of assets: €500,000 of which €150,000 financial, or €650,000 of which €75,000.",
          ru: "€300 000 — это порог для юга Мальты и Гозо до реформы; региональной разницы больше нет. По L.N. 310/2024 с 1 января 2025 года и L.N. 146/2025 от 22 июля 2025 года: покупка €375 000 где угодно либо аренда €14 000 в год; государственный взнос €37 000 в обоих случаях; административный сбор €60 000 на основного заявителя; пожертвование НКО €2 000; €7 500 за иждивенца, при этом супруг, несовершеннолетние дети и совершеннолетние дети с инвалидностью — бесплатно; карта €500 с человека. Держать пять лет. Плюс подтверждение активов: €500 000, из них €150 000 финансовых, либо €650 000, из них €75 000.",
          pl: "€300 000 to był próg dla południa Malty i Gozo przed reformą; różnicy regionalnej już nie ma. Zgodnie z L.N. 310/2024 od 1 stycznia 2025 i L.N. 146/2025 z 22 lipca 2025: zakup €375 000 gdziekolwiek albo najem €14 000 rocznie; wkład rządowy €37 000 w obu przypadkach; opłata administracyjna €60 000 na głównego wnioskodawcę; darowizna na NGO €2 000; €7 500 za osobę zależną, przy czym małżonek, małoletnie dzieci i dorosłe dzieci z niepełnosprawnością bezpłatnie; karta €500 od osoby. Utrzymanie przez pięć lat. Plus potwierdzenie aktywów: €500 000, w tym €150 000 finansowych, albo €650 000, w tym €75 000.",
        },
      },
      {
        subject: {
          en: "“4–6 months to the permit”",
          ru: "«4–6 месяцев до пермита»",
          pl: "\u201e4–6 miesięcy do zezwolenia\u201d",
        },
        verdict: "unverified",
        finding: {
          en: "Residency Malta publishes no processing time at all; the agents' handbook (v4.0, 28 January 2025) speaks only of “reasonable timeframes”. Eight months are allowed to complete the purchase and payments after the letter of approval in principle, so 4–6 months to the card is not realistic; six to twelve months end to end is.",
          ru: "Residency Malta срок не публикует вовсе; справочник агентов (v4.0 от 28 января 2025 года) говорит лишь о «разумных сроках». На завершение покупки и платежей после письма о предварительном одобрении даётся восемь месяцев, так что 4–6 месяцев до карты нереальны; шесть-двенадцать месяцев от начала до конца — да.",
          pl: "Residency Malta w ogóle nie publikuje terminu; podręcznik agentów (v4.0 z 28 stycznia 2025) mówi jedynie o \u201erozsądnych terminach\u201d. Na zakończenie zakupu i płatności po liście o wstępnej akceptacji przewidziano osiem miesięcy, więc 4–6 miesięcy do karty jest nierealne; sześć do dwunastu miesięcy od początku do końca — tak.",
        },
      },
      {
        subject: {
          en: "Remittance basis",
          ru: "Remittance basis",
          pl: "Remittance basis",
        },
        verdict: "added",
        finding: {
          en: "True but incomplete as the site had it. A resident without domicile pays on foreign income only when it is remitted, and foreign capital gains are untaxed even when remitted. There is a €5,000 minimum tax a year where unremitted foreign income is €35,000 or more. The MPRP does not by itself confer tax residence.",
          ru: "Верно, но неполно в прежней формулировке. Резидент без домицилия платит с зарубежного дохода только при переводе в страну, а зарубежный прирост капитала не облагается даже при переводе. Есть минимальный налог €5 000 в год, если непереведённый зарубежный доход составляет €35 000 и больше. Сам по себе MPRP налогового резидентства не даёт.",
          pl: "Prawda, ale niepełna w dotychczasowym brzmieniu. Rezydent bez domicylu płaci od dochodu zagranicznego dopiero przy transferze do kraju, a zagraniczne zyski kapitałowe nie są opodatkowane nawet przy transferze. Istnieje podatek minimalny €5 000 rocznie, gdy nieprzekazany dochód zagraniczny wynosi €35 000 lub więcej. Sam MPRP nie daje rezydencji podatkowej.",
        },
      },
      {
        subject: {
          en: "“€118,000 on top” — understated",
          ru: "«Сверх того €118 000» — занижено",
          pl: "\u201ePonad to €118 000\u201d — zaniżone",
        },
        verdict: "corrected",
        finding: {
          en: "Stamp duty is 5% of the higher of price and market value (1% up front on the promise of sale). Main applicant, purchase route: €375,000 + €18,750 + €60,000 + €37,000 + €2,000 + €500 plus notary and lawyer, roughly €126,000 above the price of the property. Rental route: about €113,500 in the first year without stamp duty, and about €190,000–205,000 across five years of rent.",
          ru: "Гербовый сбор — 5% от большей из цены и рыночной стоимости (1% предварительно при обещании продажи). Основной заявитель, маршрут покупки: €375 000 + €18 750 + €60 000 + €37 000 + €2 000 + €500 плюс нотариус и юрист — около €126 000 сверх стоимости объекта. Маршрут аренды: около €113 500 в первый год без гербового сбора и около €190–205 тыс. за пять лет аренды.",
          pl: "Opłata skarbowa to 5% od wyższej z ceny i wartości rynkowej (1% z góry przy przyrzeczeniu sprzedaży). Główny wnioskodawca, ścieżka zakupu: €375 000 + €18 750 + €60 000 + €37 000 + €2 000 + €500 plus notariusz i prawnik, około €126 000 ponad cenę nieruchomości. Ścieżka najmu: około €113 500 w pierwszym roku bez opłaty skarbowej i około €190–205 tys. przez pięć lat najmu.",
        },
      },
      {
        subject: {
          en: "How long you must actually be in Malta",
          ru: "Сколько на самом деле надо быть на Мальте",
          pl: "Ile naprawdę trzeba przebywać na Malcie",
        },
        verdict: "unverified",
        checked: "2026-09-01",
        finding: {
          en: "Malta publishes no minimum-presence rule for this programme, and that is not the same as there being none. Five places were walked on 1 September 2026: S.L. 217.26 on the legislation portal (served through a viewer, no text), the agency's own consolidated PDF of it (no text layer), the agents' handbook (silent, and it says the legislation prevails), the MPRP FAQ that would have answered it (404 — withdrawn), and the agency's Compliance page (“Nothing Found”). Treat any figure a broker quotes for this as unsourced.",
          ru: "Мальта не публикует правила о минимальном присутствии для этой программы, и это не то же самое, что его нет. 1 сентября 2026 года обойдено пять мест: S.L. 217.26 на портале законодательства (отдаётся через просмотрщик, текста нет), собственный сводный PDF агентства (без текстового слоя), справочник агентов (молчит и сам отсылает к законодательству), FAQ по MPRP, где ответ и был бы (404 — документ убран), и страница Compliance агентства («Nothing Found»). Любую цифру, которую называет здесь брокер, считайте неподтверждённой.",
          pl: "Malta nie publikuje zasady minimalnej obecności dla tego programu, a to nie to samo, co jej brak. 1 września 2026 obeszliśmy pięć miejsc: S.L. 217.26 na portalu legislacyjnym (podawane przez przeglądarkę, bez tekstu), własny skonsolidowany PDF agencji (bez warstwy tekstowej), podręcznik agentów (milczy i sam odsyła do ustawodawstwa), FAQ MPRP, gdzie odpowiedź by była (404 — dokument wycofany), oraz stronę Compliance agencji („Nothing Found”). Każdą liczbę, którą poda tu pośrednik, traktuj jako niepotwierdzoną.",
        },
      },
      {
        subject: {
          en: "What you owe every year after the certificate",
          ru: "Что вы должны каждый год после сертификата",
          pl: "Co jesteś winien co roku po certyfikacie",
        },
        verdict: "added",
        checked: "2026-09-01",
        finding: {
          en: "Not a one-off purchase. The agents' handbook requires, at annual compliance, “proof of property lease, via the presentation of a contract of lease, as well as proof of sickness insurance cover” every year for the first five years, and thereafter whenever the Agency deems it necessary. No brochure we read mentions it.",
          ru: "Это не разовая покупка. Справочник агентов требует при ежегодной проверке «подтверждение аренды недвижимости в виде договора аренды, а также подтверждение медицинского страхования» каждый год первые пять лет, а дальше — когда агентство сочтёт нужным. Ни в одной прочитанной брошюре этого нет.",
          pl: "To nie jednorazowy zakup. Podręcznik agentów wymaga przy corocznej kontroli „dowodu najmu nieruchomości w postaci umowy najmu, a także dowodu ubezpieczenia zdrowotnego” co roku przez pierwsze pięć lat, a potem gdy Agencja uzna to za konieczne. Żadna przeczytana broszura o tym nie wspomina.",
        },
      },
      {
        subject: {
          en: "Residence and tax residence are two different tests",
          ru: "Резидентство и налоговое резидентство — два разных теста",
          pl: "Pobyt i rezydencja podatkowa to dwa różne testy",
        },
        verdict: "added",
        checked: "2026-09-01",
        finding: {
          en: "Three tests, decided separately. Whether you may live in Malta: S.L. 217.26. Whether Malta taxes you: the tax administration's own words, “When an individual is present in Malta for more than 183 days (in any particular year) they will be considered as tax residence in Malta for that year.” What Malta taxes you on: “Those who are considered as ordinary resident and domiciled in Malta are subject to tax on a worldwide basis, whilst those who are either not domiciled or not ordinarily resident in Malta are only taxable on a remittance basis.” The MPRP triggers none of the last two.",
          ru: "Три теста, решаемые порознь. Можно ли вам жить на Мальте — S.L. 217.26. Облагает ли вас Мальта — дословно у налоговой: «Когда человек находится на Мальте более 183 дней (в конкретном году), он считается налоговым резидентом Мальты в этом году». С чего облагает — «Те, кто считается обычным резидентом и домицилированным на Мальте, платят налог со всемирного дохода, а те, кто либо не домицилирован, либо не является обычным резидентом, облагаются только на основе перевода средств». MPRP не запускает ни один из двух последних.",
          pl: "Trzy testy, rozstrzygane osobno. Czy wolno ci mieszkać na Malcie — S.L. 217.26. Czy Malta cię opodatkuje — dosłownie u administracji podatkowej: „Gdy osoba przebywa na Malcie dłużej niż 183 dni (w danym roku), uznaje się ją za rezydenta podatkowego Malty w tym roku”. Od czego opodatkuje — „Osoby uznane za zwykłych rezydentów i domicylowane na Malcie podlegają opodatkowaniu od dochodu światowego, natomiast osoby niedomicylowane lub niebędące zwykłymi rezydentami są opodatkowane wyłącznie na zasadzie transferu”. MPRP nie uruchamia żadnego z dwóch ostatnich.",
        },
      },
      {
        subject: {
          en: "The cheap route is the one that requires you to be there",
          ru: "Присутствия требует как раз дешёвый маршрут",
          pl: "Obecności wymaga właśnie tania ścieżka",
        },
        verdict: "added",
        checked: "2026-09-01",
        finding: {
          en: "The Nomad Residence Permit costs a fraction of the MPRP and is the one with a presence rule: renewal needs “a bank statement showing payment transactions carried out in Malta as proof that they have resided in Malta for a cumulative period of at least five (5) months over the previous twelve (12) months.” Income floor €42,000 a year (€32,400 for applications before 1 April 2024), one year at a time, three renewals, four years maximum, 10% on authorised work under S.L. 123.210. The programme costing about €126,000 above the price of a flat publishes no presence rule at all.",
          ru: "Кочевой пермит стоит долю от MPRP — и именно у него есть правило присутствия: для продления нужна «выписка по счёту с операциями, совершёнными на Мальте, как подтверждение проживания на Мальте в совокупности не менее пяти (5) месяцев за предыдущие двенадцать (12) месяцев». Порог дохода €42 000 в год (€32 400 для заявок до 1 апреля 2024 года), по году за раз, три продления, максимум четыре года, 10% на разрешённую работу по S.L. 123.210. Программа, которая стоит около €126 000 сверх цены квартиры, правила присутствия не публикует вовсе.",
          pl: "Zezwolenie dla nomadów kosztuje ułamek MPRP — i to ono ma zasadę obecności: do przedłużenia potrzebny jest „wyciąg bankowy pokazujący transakcje płatnicze przeprowadzone na Malcie jako dowód, że przebywali na Malcie łącznie co najmniej pięć (5) miesięcy w ciągu poprzednich dwunastu (12) miesięcy”. Próg dochodu €42 000 rocznie (€32 400 dla wniosków sprzed 1 kwietnia 2024), po roku naraz, trzy przedłużenia, maksymalnie cztery lata, 10% od pracy dozwolonej wg S.L. 123.210. Program kosztujący około €126 000 ponad cenę mieszkania nie publikuje żadnej zasady obecności.",
        },
      },
    ],
    sources: [
      {
        citation: "S.L. 217.26, as amended by L.N. 310/2024 and L.N. 146/2025",
        url: "https://residencymalta.gov.mt/wp-content/uploads/2025/08/S.L.217.26-Amended-by-LN-310-of-2024_-LN-146-of-2025.pdf",
        kind: "official",
      },
      {
        citation: "L.N. 146 of 2025",
        url: "https://residencymalta.gov.mt/wp-content/uploads/2025/07/L.N-146-of-2025.pdf",
        kind: "official",
      },
      {
        citation: "Residency Malta — agents' handbook v4.0, 28 January 2025",
        url: "https://residencymalta.gov.mt/wp-content/uploads/2025/02/3926-RM-Amends-to-2253-Agents-Handbook-Final-Jan-25.pdf",
        kind: "official",
      },
      {
        citation: "MTCA — guidelines on the remittance basis",
        url: "https://mtca.gov.mt/docs/default-source/documents/mtca-guidelines-on-the-remittance-under-the-income-tax.pdf",
        kind: "official",
      },
      {
        citation: "MTCA — buying property",
        url: "https://mtca.gov.mt/personal-tax/property-taxes/buying-property",
        kind: "official",
      },
      {
        citation: "Residency Malta — Nomad Residence Permit FAQ v14.1, 17 April 2026",
        url: "https://nomad.residencymalta.gov.mt/new-faqs/",
        kind: "official",
      },
      {
        citation: "MTCA — tax residence",
        url: "https://mtca.gov.mt/personal-tax/individual/tax-residence",
        kind: "official",
      },
      {
        citation: "MTCA — Nomad Residence Permits (Income Tax) Rules, S.L. 123.210, guidelines of 12 March 2026",
        url: "https://mtca.gov.mt/docs/default-source/documents/personal-tax/legal-and-technical/guidelines/nomad-guidelines---12-03-2026.pdf",
        kind: "official",
      },
      {
        citation: "Residency Malta — legal framework, MPRP",
        url: "https://residencymalta.gov.mt/legal-framework-mprp-2/",
        kind: "official",
      },
      {
        citation: "S.L. 217.26 on the legislation portal — consolidated 22 July 2025",
        url: "https://legislation.mt/eli/sl/217.26/eng",
        kind: "official",
      },
    ],
  },

  // --- UAE ------------------------------------------------------------------
  {
    key: "ae",
    claims: [
      {
        subject: {
          en: "Golden Visa through property",
          ru: "Golden Visa через недвижимость",
          pl: "Golden Visa przez nieruchomość",
        },
        verdict: "confirmed",
        finding: {
          en: "DLD, “Request for Golden Visa – Investor”; GDRFA, “Issuing a golden residence permit (investors)”.",
          ru: "DLD, «Request for Golden Visa – Investor»; GDRFA, «Issuing a golden residence permit (investors)».",
          pl: "DLD, \u201eRequest for Golden Visa – Investor\u201d; GDRFA, \u201eIssuing a golden residence permit (investors)\u201d.",
        },
      },
      {
        subject: {
          en: "AED 2,000,000 for ten years",
          ru: "AED 2 000 000 на десять лет",
          pl: "AED 2 000 000 na dziesięć lat",
        },
        verdict: "added",
        finding: {
          en: "Correct, with qualifications the site did not carry. The property need not be a single one: GDRFA says “one or more properties with a value of no less than AED 2,000,000”. A mortgage is allowed with a bank letter of no objection stating the amount paid and the balance. Fractional ownership qualifies if the share itself reaches the threshold.",
          ru: "Верно, но с уточнениями, которых на сайте не было. Объект не обязан быть один: GDRFA говорит «одна или несколько единиц недвижимости общей стоимостью не менее AED 2 000 000». Ипотека допускается при письме банка об отсутствии возражений с указанием выплаченной суммы и остатка. Долевое владение подходит, если сама доля дотягивает до порога.",
          pl: "Prawda, z zastrzeżeniami, których strona nie zawierała. Nieruchomość nie musi być jedna: GDRFA mówi \u201ejedna lub więcej nieruchomości o wartości nie niższej niż AED 2 000 000\u201d. Kredyt hipoteczny jest dopuszczalny przy zaświadczeniu banku o braku sprzeciwu ze wskazaniem kwoty spłaconej i pozostałej. Współwłasność kwalifikuje się, jeśli sam udział sięga progu.",
        },
      },
      {
        subject: {
          en: "Off-plan property",
          ru: "Строящаяся недвижимость",
          pl: "Nieruchomość w budowie",
        },
        checked: "2026-08-30",
        // CORRECTED ON 30 AUGUST 2026, and this row was wrong because it read
        // the wrong permit's page.
        //
        // It used to say that no official page states off-plan qualifies and
        // that GDRFA "expressly requires completed construction". The Annex to
        // Cabinet Resolution 65/2022, art. 8, Second, has a whole limb for it:
        // «buying one or more Real Estate units off the map with a total value
        // of not less than (AED 2,000,000) two million dirhams, on condition
        // that the purchase is made from local companies approved by the
        // Competent Local Authority». "Off the map" is the standard Emirati
        // rendering of off-plan.
        //
        // The "entirely constructed" wording is real, but it sits on GDRFA's
        // page for RENEWING an ordinary property-owner permit — a different
        // permit from the golden residence, whose own GDRFA service page states
        // no completion requirement at all. This row had joined two documents
        // about two products.
        //
        // WHAT IS NEW AND IS NOT A RETRACTION: the federal instrument admits
        // off-plan, and Dubai's own golden visa e-service asks for a title
        // deed, which an off-plan Oqood registration is not. That gap between
        // the federal text and the emirate channel is the finding, and it is
        // not published anywhere else we could see.
        //
        // Verified on 30 August 2026 against all six amendments to Cabinet
        // Resolution 65/2022, read individually: none of them touches the
        // Annex. This is the current consolidated text, not the 2022 original.
        verdict: "corrected",
        finding: {
          en: "The Annex to Cabinet Resolution 65/2022, art. 8, Second, expressly admits off-plan — «one or more Real Estate units off the map» at AED 2,000,000, bought from local companies determined by the Competent Local Authority. The «entirely constructed» requirement is real but belongs to GDRFA's ordinary property-owner permit, not to the golden residence. Dubai's own golden visa e-service still asks for a title deed, which an off-plan Oqood registration is not: the federal text permits what the emirate channel has no document for.",
          ru: "Приложение к Постановлению Кабинета министров 65/2022, ст. 8, раздел второй, прямо допускает строящееся жильё — «один или несколько объектов off the map» на 2 000 000 дирхамов, купленных у местных компаний, определённых компетентным местным органом. Требование «entirely constructed» существует, но относится к обычному разрешению собственника недвижимости в GDRFA, а не к золотой резиденции. При этом дубайский сервис подачи на золотую визу требует свидетельство о праве собственности, которым регистрация Oqood по строящемуся объекту не является: федеральный текст разрешает то, на что у эмиратского канала нет документа.",
          pl: "Załącznik do Uchwały Rady Ministrów 65/2022, art. 8, część druga, wprost dopuszcza nieruchomość w budowie — „jedną lub więcej jednostek off the map\u201d za 2 000 000 dirhamów, kupionych od lokalnych spółek wskazanych przez właściwy organ lokalny. Wymóg „entirely constructed\u201d istnieje, ale dotyczy zwykłego zezwolenia właściciela nieruchomości w GDRFA, a nie złotej rezydencji. Dubajski serwis wniosku o złotą wizę wciąż żąda aktu własności, którym rejestracja Oqood dla budowy nie jest: tekst federalny dopuszcza to, na co kanał emiracki nie ma dokumentu.",
        },
      },
      {
        subject: {
          en: "The AED 750,000 and AED 1,000,000 figures in circulation",
          ru: "Ходящие цифры AED 750 000 и AED 1 000 000",
          pl: "Krążące kwoty AED 750 000 i AED 1 000 000",
        },
        checked: "2026-08-30",
        // EXTENDED ON 30 AUGUST 2026. The row was right and incomplete, which
        // on this page is its own kind of wrong: it said the figure "is not
        // found in any current source" and left a reader to conclude it had
        // been invented. It had not. AED 750,000 was Dubai's floor for a
        // DIFFERENT permit — the two-year property investor visa — and it was
        // removed in April 2026. So a page still selling a golden visa "from
        // AED 750,000" is wrong twice: wrong permit, and a repealed threshold.
        verdict: "corrected",
        finding: {
          en: "AED 750,000 was never a golden visa threshold. It was Dubai's floor for the separate two-year property investor visa, and it was removed in April 2026: a sole owner now faces no minimum value at all, and a co-owner's share must reach AED 400,000. AED 1,000,000 is the retirement golden visa, from age 55, for five years — not a shorter investor route.",
          ru: "AED 750 000 никогда не были порогом золотой визы. Это был дубайский минимум для отдельного разрешения — двухлетней инвесторской визы, — и в апреле 2026 года его отменили: у единственного собственника минимальной стоимости больше нет вовсе, а доля совладельца должна достигать AED 400 000. AED 1 000 000 — это пенсионная золотая виза с 55 лет на пять лет, а не «короткая инвесторская».",
          pl: "AED 750 000 nigdy nie było progiem złotej wizy. Był to dubajski próg odrębnego zezwolenia — dwuletniej wizy inwestora w nieruchomości — i zniesiono go w kwietniu 2026: jedyny właściciel nie ma już żadnej wartości minimalnej, a udział współwłaściciela musi sięgać AED 400 000. AED 1 000 000 to emerytalna złota wiza od 55. roku życia na pięć lat, a nie krótsza ścieżka inwestorska.",
        },
      },
      {
        subject: {
          en: "“3–6 weeks to the permit” — overstated",
          ru: "«3–6 недель до пермита» — завышено",
          pl: "\u201e3–6 tygodni do zezwolenia\u201d — zawyżone",
        },
        verdict: "corrected",
        finding: {
          en: "DLD publishes 7–10 working days, GDRFA about 5 working days, ICP an entry permit in 2 days. In practice, title deed to Emirates ID runs about two to four weeks.",
          ru: "DLD публикует 7–10 рабочих дней, GDRFA — около 5 рабочих дней, ICP — въездное разрешение за 2 дня. Реально от свидетельства о праве до Emirates ID — около двух-четырёх недель.",
          pl: "DLD publikuje 7–10 dni roboczych, GDRFA około 5 dni roboczych, ICP zezwolenie na wjazd w 2 dni. W praktyce od aktu własności do Emirates ID mija około dwóch do czterech tygodni.",
        },
      },
      {
        subject: {
          en: "No personal income tax",
          ru: "Нет НДФЛ",
          pl: "Brak podatku dochodowego od osób fizycznych",
        },
        verdict: "confirmed",
        finding: {
          en: "u.ae, verbatim: “The UAE does not levy income tax on individuals.” The 9% corporate tax and the 15% DMTT do not touch personal income. VAT is 5%.",
          ru: "u.ae дословно: «The UAE does not levy income tax on individuals». Корпоративный налог 9% и DMTT 15% личных доходов не касаются. НДС — 5%.",
          pl: "u.ae dosłownie: \u201eThe UAE does not levy income tax on individuals\u201d. Podatek CIT 9% i DMTT 15% nie dotyczą dochodów osobistych. VAT wynosi 5%.",
        },
      },
      {
        subject: {
          en: "“€490,000 at a rate of 4.08”",
          ru: "«€490 000 при курсе 4,08»",
          pl: "\u201e€490 000 po kursie 4,08\u201d",
        },
        verdict: "corrected",
        finding: {
          en: "The rate on 23 August 2026 was about 4.288 dirham to the euro, so AED 2m is about €466,400. A rate may not be baked into a figure without its date.",
          ru: "Курс на 23 августа 2026 года — около 4,288 дирхама за евро, то есть AED 2 млн ≈ €466 400. Курс нельзя зашивать в число без даты.",
          pl: "Kurs 23 sierpnia 2026 wynosił około 4,288 dirhama za euro, czyli AED 2 mln ≈ €466 400. Kursu nie wolno wpisywać w liczbę bez daty.",
        },
      },
      {
        subject: {
          en: "“€38,000 on top” — overstated",
          ru: "«Сверх того €38 000» — завышено",
          pl: "\u201ePonad to €38 000\u201d — zawyżone",
        },
        verdict: "corrected",
        // The date used to be inside the finding's own first sentence, in all
        // three languages. It is structural now, so the prose drops it and the
        // row carries it beside the verdict like the other two re-checked rows.
        checked: "2026-08-28",
        finding: {
          en: "The previous wording here was wrong twice over. The 4% registration fee is not market practice: Executive Council Resolution 30 of 2013, schedule item 1, sets it as “4% of the value of the sale contract”, which on AED 2,000,000 is AED 80,000. Article 3 of the same resolution splits it equally between buyer and seller “unless agreed otherwise” — the buyer paying all of it is the custom, not the rule. On top of that sit the title deed at AED 250, knowledge and innovation fees of AED 20, and the registration trustee at AED 4,200 including VAT. The golden visa itself is AED 9,884.75 (medical 700, Emirates ID 1,153, residence 2,856.75, DLD 4,020, administrative 1,155), plus AED 5,774.50 per dependant and a one-off AED 318.75 to open the family file. The 2% agent commission is the only component with no official basis at all: DLD’s own FAQ leaves the rate to the agreement and, failing that, to prevailing custom, and no law or RERA rule caps it. Officially set costs come to about €22,000; the €31,000 in the table includes the agent’s 2%, and the second error was saying it did not.",
          ru: "Прежняя формулировка была неверна дважды. Регистрационный сбор 4% — не рыночная практика: он установлен Резолюцией Исполнительного совета № 30 от 2013 года, пункт 1 приложения, как «4% от стоимости договора купли-продажи», то есть AED 80 000 на объект в AED 2 000 000. Статья 3 той же резолюции делит его поровну между покупателем и продавцом, «если не согласовано иное», — то, что платит покупатель целиком, это обычай, а не норма. Сверх того: свидетельство о праве AED 250, сборы за знание и инновации AED 20 и регистрационный доверенный центр AED 4 200 с НДС. Сама золотая виза — AED 9 884,75 (медосмотр 700, Emirates ID 1 153, резидентство 2 856,75, DLD 4 020, административный 1 155), плюс AED 5 774,50 за иждивенца и разовые AED 318,75 за открытие семейного дела. Комиссия агента 2% — единственная часть без какого-либо официального основания: собственный FAQ DLD оставляет ставку договору, а при его молчании — сложившемуся обычаю, и ни закон, ни правила RERA её не ограничивают. Официально установленные расходы дают около €22 000; €31 000 в таблице включают эти 2%, и вторая ошибка была в утверждении, что не включают.",
          pl: "Poprzednie brzmienie było błędne podwójnie. Opłata rejestracyjna 4% nie jest praktyką rynkową: ustanawia ją Rezolucja Rady Wykonawczej nr 30 z 2013 roku, pozycja 1 załącznika, jako „4% wartości umowy sprzedaży”, czyli AED 80 000 przy nieruchomości za AED 2 000 000. Artykuł 3 tej samej rezolucji dzieli ją po połowie między kupującego i sprzedającego, „o ile nie uzgodniono inaczej” — to, że płaci ją w całości kupujący, jest zwyczajem, nie normą. Do tego dochodzą akt własności AED 250, opłaty za wiedzę i innowacje AED 20 oraz centrum rejestracyjne AED 4 200 z VAT. Sama złota wiza to AED 9 884,75 (badanie 700, Emirates ID 1 153, pobyt 2 856,75, DLD 4 020, administracyjna 1 155), plus AED 5 774,50 za osobę zależną i jednorazowe AED 318,75 za otwarcie akt rodziny. Prowizja pośrednika 2% jest jedynym składnikiem bez jakiejkolwiek podstawy urzędowej: własny FAQ DLD pozostawia stawkę umowie, a w jej braku przyjętemu zwyczajowi, i żadne prawo ani przepis RERA jej nie ogranicza. Koszty ustalone urzędowo dają około €22 000; €31 000 w tabeli zawiera te 2%, a drugim błędem było twierdzenie, że ich nie zawiera.",
        },
      },
    ],
    sources: [
      // ADDED 30 AUGUST 2026 for the Emirati relocation guide. The first two
      // are the instruments themselves, and until this date this section had
      // neither of them: every Emirati figure on this site rested on ministry
      // service pages, which is a tier below what the Portuguese and Greek
      // sections stand on. That gap is now closed.
      {
        citation:
          "Federal Decree-Law No. 29 of 2021 on Entry and Residence of Foreigners — Official Gazette 712, in force 26.10.2021",
        url: "https://uaelegislation.gov.ae/en/legislations/1528",
        kind: "official",
        caveat: {
          en: "The decree-law never uses the words \u201cGolden Residence\u201d. Arts. 7(2) and 8(2) delegate every visa and permit type to the Executive Regulation, so a page citing this instrument for the AED 2,000,000 threshold is citing the wrong one.",
          ru: "Сам декрет-закон нигде не употребляет слов «Golden Residence». Статьи 7(2) и 8(2) делегируют все типы виз и разрешений исполнительному регламенту, так что страница, ссылающаяся на этот акт за порогом в 2 000 000 дирхамов, ссылается не туда.",
          pl: "Sam dekret nigdzie nie używa słów „Golden Residence\u201d. Art. 7(2) i 8(2) delegują wszystkie typy wiz i zezwoleń do rozporządzenia wykonawczego, więc strona powołująca się na ten akt dla progu 2 000 000 dirhamów powołuje się na niewłaściwy.",
        },
      },
      {
        citation:
          "Cabinet Resolution No. 65 of 2022, Executive Regulation and its Golden Residence Annex — Official Gazette 731, in force 03.10.2022",
        url: "https://uaelegislation.gov.ae/en/legislations/1601",
        kind: "official",
        caveat: {
          en: "Six amending resolutions were read individually on 30 August 2026 — Nos. 87/2022, 117/2023, 95/2024, 125/2024, 179/2025 and 95/2026. Five add border posts; the other two insert arts. 19 bis and 77 bis. None touches art. 59, art. 60 or the Annex, so the text quoted here is the current one. The portal's own amendment log is incomplete: its entry for 95/2024 omits art. 77 bis.",
          ru: "Шесть изменяющих постановлений прочитаны по отдельности 30 августа 2026 года — № 87/2022, 117/2023, 95/2024, 125/2024, 179/2025 и 95/2026. Пять добавляют пункты пропуска, ещё два вводят статьи 19-бис и 77-бис. Ни одно не касается статьи 59, статьи 60 и приложения, поэтому приведённый текст — действующий. Журнал поправок самого портала неполон: в записи о 95/2024 статья 77-бис не показана.",
          pl: "Sześć uchwał zmieniających przeczytano osobno 30 sierpnia 2026 — nr 87/2022, 117/2023, 95/2024, 125/2024, 179/2025 i 95/2026. Pięć dodaje przejścia graniczne, dwie wprowadzają art. 19 bis i 77 bis. Żadna nie dotyka art. 59, art. 60 ani załącznika, więc cytowany tekst jest aktualny. Własny rejestr zmian portalu jest niepełny: przy 95/2024 pomija art. 77 bis.",
        },
      },
      {
        citation:
          "Cabinet Decision No. 85 of 2022 on Determination of Tax Residency, art. 4 — in force 01.03.2023",
        url: "https://tax.gov.ae/Datafolder/Files/Legislation/Corporate%20Tax/Cabinet%20Decision%2085%20of%202022%20-%20For%20publishing.pdf",
        kind: "official",
      },
      {
        citation:
          "Ministerial Decision No. 27 of 2023, arts. 3 to 6 — how days, homes and employment are counted",
        url: "https://mof.gov.ae/wp-content/uploads/2023/03/Ministerial-Decision-27-of-2023-of-Tax-Residency.pdf",
        kind: "official",
      },
      {
        citation:
          "Cabinet Decision No. 49 of 2023, art. 2 — the AED 1,000,000 turnover test for a natural person, and the licence-based exclusions",
        url: "https://mof.gov.ae/wp-content/uploads/2023/05/Cabinet-Decision-No.-49-of-2023.pdf",
        kind: "official",
      },
      {
        citation:
          "Cabinet Decision No. 116 of 2022, art. 2(1) — the AED 375,000 corporate tax band",
        url: "https://uaelegislation.gov.ae/en/legislations/1614/download",
        kind: "official",
        caveat: {
          en: "The AED 375,000 figure is not in Federal Decree-Law 47 of 2022, which is what almost every page cites for it. The decree-law sets the structure; this decision sets the number.",
          ru: "Цифра 375 000 дирхамов стоит не в Федеральном декрете-законе 47/2022, на который её списывают почти все. Декрет-закон задаёт конструкцию, сумму устанавливает это решение.",
          pl: "Kwota 375 000 dirhamów nie znajduje się w Dekrecie Federalnym 47/2022, na który powołuje się niemal każda strona. Dekret ustala konstrukcję, kwotę ustanawia ta uchwała.",
        },
      },
      {
        citation: "ICP — entry after a long absence, and who is exempt",
        url: "https://icp.gov.ae/en/services-details/?serviceid=68e352d65ae59b00117383fc",
        kind: "official",
      },
      {
        citation: "DLD — Investor Residence application (Taskeen), the two-year permit",
        url: "https://dubailand.gov.ae/en/eservices/request-for-investor-visa/",
        kind: "official",
      },
      {
        citation: "DLD — Request for Golden Visa (Investor)",
        url: "https://dubailand.gov.ae/en/eservices/request-for-golden-visa-investor/",
        kind: "official",
      },
      {
        citation: "DLD — Request for Golden Visa (Retired)",
        url: "https://dubailand.gov.ae/en/eservices/request-for-golden-visa-retired/",
        kind: "official",
      },
      {
        citation: "GDRFA — issuing a golden residence permit (investors)",
        url: "https://www.gdrfad.gov.ae/en/services/8ea80da4-f43e-11eb-0320-0050569629e8",
        kind: "official",
      },
      {
        citation: "ICP — entry permit service",
        url: "https://icp.gov.ae/en/services-details/?serviceid=68e34eea5ae59b00117383d5",
        kind: "official",
      },
      {
        citation: "u.ae — taxation",
        url: "https://u.ae/en/information-and-services/finance-and-investment/taxation",
        kind: "official",
      },
      // ADDED 28 AUGUST 2026, with the correction to the cost finding above.
      // The 4% registration fee had been described here as market practice
      // that no official page confirmed. It is set by a published instrument,
      // and this is that instrument — item 1 of its schedule.
      {
        citation:
          "Executive Council Resolution 30 of 2013 — fees of the Land Department",
        url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html",
        kind: "official",
      },
      {
        citation: "DLD — property sale registration, fees and trustee charges",
        url: "https://dubailand.gov.ae/en/eservices/property-sale-registration/",
        kind: "official",
      },
      // A SOURCE FOR AN ABSENCE, cited like any other claim: this is where DLD
      // says a broker's commission follows the agreement and, failing that,
      // prevailing custom. It is what lets the finding say the 2% rests on
      // nothing official, rather than that we looked and did not find it.
      {
        citation: "DLD — frequently asked questions, broker commission",
        url: "https://dubailand.gov.ae/en/frequently-asked-questions/",
        kind: "official",
      },
    ],
  },

  // --- Naturalisation -------------------------------------------------------
  // The single most consequential finding, and the reason it has its own
  // section rather than a row inside each jurisdiction: it is a comparison
  // that changed direction. Portugal went from the best route in this set to
  // the worst.
  {
    key: "citizenship",
    heading: {
      en: "Naturalisation: the column that had to be rewritten",
      ru: "Натурализация: колонка, которую пришлось переписать",
      pl: "Naturalizacja: kolumna, którą trzeba było napisać od nowa",
    },
    claims: [
      {
        subject: {
          en: "Portugal — “five years to citizenship”",
          ru: "Португалия — «пять лет до гражданства»",
          pl: "Portugalia — \u201epięć lat do obywatelstwa\u201d",
        },
        verdict: "corrected",
        finding: {
          en: "Lei Orgânica 1/2026 (Diário da República, 18 May 2026, in force from 19 May) rewrote art. 6(1)(b) of Lei 37/81: seven years for nationals of Portuguese-speaking countries and of the EU, ten years for everybody else. Plus an examination in the language and in culture, history and state symbols, and a solemn declaration of adherence to the rule of law. It is not retroactive — applications filed before it came into force are decided under the previous text. The period runs from the ISSUE of the residence permit, not from the application.",
          ru: "Lei Orgânica 1/2026 (Diário da República, 18 мая 2026 года, в силе с 19 мая) переписала ст. 6(1)(b) Lei 37/81: семь лет для граждан португалоязычных стран и ЕС, десять лет для всех остальных. Плюс экзамен по языку и по культуре, истории и государственным символам, плюс торжественная декларация о приверженности принципам правового государства. Обратной силы нет: дела, поданные до вступления в силу, решаются по прежней редакции. Срок считается от выдачи вида на жительство, а не от подачи заявления.",
          pl: "Lei Orgânica 1/2026 (Diário da República, 18 maja 2026, w mocy od 19 maja) przepisała art. 6(1)(b) Lei 37/81: siedem lat dla obywateli krajów portugalskojęzycznych i UE, dziesięć lat dla pozostałych. Plus egzamin z języka oraz z kultury, historii i symboli państwowych, plus uroczysta deklaracja przywiązania do zasad państwa prawa. Bez mocy wstecznej: sprawy złożone przed wejściem w życie rozstrzyga się według poprzedniego brzmienia. Okres liczy się od WYDANIA zezwolenia na pobyt, a nie od złożenia wniosku.",
        },
      },
      {
        subject: {
          en: "Greece — does the golden visa count towards citizenship?",
          ru: "Греция — засчитывается ли золотая виза в срок для гражданства?",
          pl: "Grecja — czy złota wiza liczy się do obywatelstwa?",
        },
        verdict: "added",
        finding: {
          en: "Seven years of continuous lawful residence (art. 5(1)(δ) of the Citizenship Code, Law 3284/2004). The investor permit is a qualifying title, but the Code requires ACTUAL residence and the golden visa requires no minimum stay — so holding the permit does not by itself accumulate the period. Plus an examination in language, history and civics.",
          ru: "Семь лет непрерывного законного проживания (ст. 5(1)(δ) Кодекса гражданства, Закон 3284/2004). Инвесторское разрешение — квалифицирующий титул, но кодекс требует фактического проживания, а золотая виза минимального пребывания не требует: само по себе разрешение срок не копит. Плюс экзамен по языку, истории и обществознанию.",
          pl: "Siedem lat nieprzerwanego legalnego pobytu (art. 5(1)(δ) Kodeksu obywatelstwa, ustawa 3284/2004). Zezwolenie inwestorskie jest tytułem kwalifikującym, ale Kodeks wymaga FAKTYCZNEGO pobytu, a złota wiza nie wymaga minimalnego pobytu: samo zezwolenie okresu nie kumuluje. Plus egzamin z języka, historii i wiedzy o społeczeństwie.",
        },
      },
      {
        subject: {
          en: "Malta — citizenship by investment",
          ru: "Мальта — гражданство за инвестиции",
          pl: "Malta — obywatelstwo za inwestycje",
        },
        verdict: "withdrawn",
        checked: "2026-09-01",
        finding: {
          en: "Closed, and not by replacement. After C-181/23 of 29 April 2025, Act XXI of 2025 and L.N. 159 of 2025 AMENDED the condemned scheme's own regulations: S.L. 188.06, in force since 20 November 2020, was rewritten into naturalisation on the basis of merit under art. 10(9) of Cap. 188 — science and research, technology, sport, entrepreneurship including job creation, culture and the arts, philanthropy. At least eight months of residence, and the formal application must also show property and knowledge of the language. No fee is published: “Fees that would be established by the Agency apply.” A separate Office of the Regulator sits under arts. 25, 25A and 25B. Ordinary naturalisation is twelve continuous months immediately before applying plus four years inside the six preceding them — five years at a minimum, spread across up to seven.",
          ru: "Закрыто, и не через замену. После дела C-181/23 от 29 апреля 2025 года Акт XXI/2025 и L.N. 159/2025 ИЗМЕНИЛИ собственный регламент осуждённой схемы: S.L. 188.06, действующий с 20 ноября 2020 года, переписан в натурализацию за заслуги по ст. 10(9) Cap. 188 — наука и исследования, технологии, спорт, предпринимательство включая создание рабочих мест, культура и искусство, благотворительность. Не менее восьми месяцев проживания, а формальная заявка требует ещё недвижимости и знания языка. Цена не опубликована: «применяются сборы, которые установит агентство». Надзор — отдельное Управление регулятора по ст. 25, 25A и 25B. Обычная натурализация — двенадцать непрерывных месяцев непосредственно перед подачей плюс четыре года внутри шести предшествующих: минимум пять лет, растянутые на срок до семи.",
          pl: "Zamknięte, i nie przez zastąpienie. Po sprawie C-181/23 z 29 kwietnia 2025 Akt XXI z 2025 i L.N. 159 z 2025 ZNOWELIZOWAŁY własne rozporządzenie potępionego programu: S.L. 188.06, obowiązujące od 20 listopada 2020, przepisano na naturalizację za zasługi z art. 10(9) Cap. 188 — nauka i badania, technologie, sport, przedsiębiorczość wraz z tworzeniem miejsc pracy, kultura i sztuka, filantropia. Co najmniej osiem miesięcy pobytu, a formalny wniosek wymaga jeszcze nieruchomości i znajomości języka. Cena nie jest publikowana: „stosuje się opłaty ustalone przez Agencję”. Nadzoruje odrębne Biuro Regulatora z art. 25, 25A i 25B. Zwykła naturalizacja to dwanaście nieprzerwanych miesięcy bezpośrednio przed złożeniem wniosku plus cztery lata wewnątrz sześciu poprzedzających: minimum pięć lat, rozłożone nawet na siedem.",
        },
      },
      {
        subject: {
          en: "What this changes about the comparison",
          ru: "Что это меняет в сравнении",
          pl: "Co to zmienia w porównaniu",
        },
        verdict: "corrected",
        finding: {
          en: "Portugal has stopped being the fastest route to a passport in this set. Malta at about five years and Cyprus at four to five for certain categories are now shorter than Portugal's ten for non-EU, non-CPLP nationals. The column is more accurately called “naturalisation by residence is possible” than “route to citizenship” — in all three cases it needs years of real residence and a language examination. In the UAE, naturalisation is exceptional and by nomination; owning property does not start it.",
          ru: "Португалия перестала быть самым быстрым маршрутом к паспорту в этом наборе. Мальта (около пяти лет) и Кипр (четыре-пять лет для отдельных категорий) теперь короче португальских десяти для не-граждан ЕС и не-CPLP. Колонку правильнее называть не «путь к гражданству», а «натурализация по проживанию возможна» — во всех трёх случаях она требует настоящего многолетнего проживания и языкового экзамена. В ОАЭ натурализация исключительная и по номинации; владение недвижимостью её не запускает.",
          pl: "Portugalia przestała być najszybszą drogą do paszportu w tym zestawie. Malta (około pięciu lat) i Cypr (cztery do pięciu lat dla wybranych kategorii) są dziś krótsze niż portugalskie dziesięć lat dla obywateli spoza UE i spoza CPLP. Kolumnę trafniej nazwać \u201enaturalizacja przez pobyt jest możliwa\u201d niż \u201edroga do obywatelstwa\u201d — we wszystkich trzech przypadkach wymaga lat rzeczywistego pobytu i egzaminu językowego. W ZEA naturalizacja jest wyjątkowa i na wniosek nominacyjny; posiadanie nieruchomości jej nie uruchamia.",
        },
      },
    ],
    sources: [
      {
        citation: "Lei Orgânica 1/2026 — Diário da República, 18 May 2026",
        url: "https://files.diariodarepublica.pt/1s/2026/05/09500/0000200020.pdf",
        kind: "official",
      },
      {
        citation: "Presidency of Portugal — promulgation, 3 May 2026",
        url: "https://www.presidencia.pt/atualidade/toda-a-atualidade/2026/05/presidente-da-republica-promulga-decreto-da-assembleia-da-republica/",
        kind: "official",
      },
      {
        citation:
          "Greek Citizenship Code (Law 3284/2004), Ministry of the Interior",
        url: "https://www.ypes.gr/kodikas-ellinikis-ithageneias/",
        kind: "official",
      },
      {
        citation: "Act XXI of 2025 (Malta)",
        url: "https://legislation.mt/eli/act/2025/21/eng",
        kind: "official",
      },
      {
        citation: "S.L. 188.06 — naturalisation on the basis of merit",
        url: "https://komunita.gov.mt/wp-content/uploads/2026/02/Citizenship-by-Naturalisation-on-the-Basis-of-Merit.pdf",
        kind: "official",
      },
      {
        citation: "u.ae — Emirati nationality",
        url: "https://u.ae/en/information-and-services/passports-and-traveling/emirati-nationality",
        kind: "official",
      },
    ],
  },

  // --- Cyprus ---------------------------------------------------------------
  // Everything here is secondary, which is the whole reason Cyprus has no page
  // and stands in the table with dashes. It is published anyway, marked, rather
  // than left out: a reader deciding whether to trust this site is better
  // served by seeing what could NOT be established than by not being told the
  // question was asked.
  {
    key: "cy",
    claims: [
      {
        subject: {
          en: "The €300,000 threshold under regulation 6(2)",
          ru: "Порог €300 000 по правилу 6(2)",
          pl: "Próg €300 000 według przepisu 6(2)",
        },
        verdict: "unverified",
        finding: {
          en: "Secondary sources give €300,000 excluding VAT, with VAT on top; confirmed foreign income of €50,000 a year, plus €15,000 for a spouse and €10,000 for each minor child; medical insurance; annual confirmation that the investment and the insurance are maintained; sale without immediate replacement means withdrawal; police certificates every three years. Criteria as revised on 2 May 2023. None of this could be read from a primary source.",
          ru: "Вторичные источники дают €300 000 без НДС, НДС сверху; подтверждённый доход из-за рубежа €50 000 в год, плюс €15 000 на супруга и €10 000 на каждого несовершеннолетнего ребёнка; медицинская страховка; ежегодное подтверждение сохранения инвестиции и страховки; продажа без немедленной замены — отзыв; справки о несудимости каждые три года. Редакция критериев от 2 мая 2023 года. Ничего из этого не удалось прочитать в первоисточнике.",
          pl: "Źródła wtórne podają €300 000 bez VAT, VAT doliczany osobno; potwierdzony dochód zagraniczny €50 000 rocznie, plus €15 000 na małżonka i €10 000 na każde małoletnie dziecko; ubezpieczenie zdrowotne; coroczne potwierdzenie utrzymania inwestycji i ubezpieczenia; sprzedaż bez natychmiastowego zastąpienia oznacza cofnięcie; zaświadczenia o niekaralności co trzy lata. Kryteria w brzmieniu z 2 maja 2023. Niczego z tego nie udało się odczytać ze źródła pierwotnego.",
        },
      },
      {
        subject: {
          en: "Transfer fees",
          ru: "Сборы за переход права",
          pl: "Opłaty za przeniesienie własności",
        },
        verdict: "corrected",
        finding: {
          en: "Transfer fees are not charged where VAT has been paid — and the 6(2) route requires a first-sale property, which carries VAT. So they come out of any estimate. Where they do apply: 1% up to €85,000, 3% up to €170,000, 5% above.",
          ru: "Сборы за переход права не взимаются, если уплачен НДС, а маршрут 6(2) требует объект первой продажи, то есть с НДС. Значит, из сметы их надо убрать. Там, где они всё же применяются: 1% до €85 000, 3% до €170 000, 5% выше.",
          pl: "Opłat za przeniesienie nie pobiera się, gdy zapłacono VAT — a ścieżka 6(2) wymaga nieruchomości z pierwszej sprzedaży, czyli z VAT-em. Zatem należy je usunąć z kosztorysu. Tam, gdzie jednak obowiązują: 1% do €85 000, 3% do €170 000, 5% powyżej.",
        },
      },
      {
        subject: {
          en: "The reduced VAT rate and its limits",
          ru: "Льготная ставка НДС и её ограничения",
          pl: "Obniżona stawka VAT i jej ograniczenia",
        },
        verdict: "unverified",
        finding: {
          en: "VAT is 19% standard and 5% reduced. The limits on the reduced rate (130 m² / €350,000) could not be confirmed.",
          ru: "НДС — 19% стандартный, 5% льготный. Ограничения льготной ставки (130 м² / €350 000) подтвердить не удалось.",
          pl: "VAT wynosi 19% standardowo i 5% w stawce obniżonej. Ograniczeń stawki obniżonej (130 m² / €350 000) nie udało się potwierdzić.",
        },
      },
    ],
    sources: [],
    note: {
      en: "No source is listed because none could be reached. gov.cy answers 403, the certificate on mip.gov.cy has expired, and the tax department's PDF is closed by robots. That is why Cyprus stands in the comparison table with dashes rather than figures and has no page of its own: a permanent-residency threshold published without being read from the law is exactly the claim that circulates, gets forwarded and cannot be corrected in place. When a primary source becomes reachable, Cyprus gets its figures and its page in the same week.",
      ru: "Ни одного источника не указано, потому что ни один не удалось открыть. gov.cy отвечает 403, у mip.gov.cy истёк сертификат, а PDF налогового ведомства закрыт robots. Поэтому Кипр стоит в таблице сравнения с прочерками вместо цифр и не имеет своей страницы: порог ПМЖ, опубликованный без чтения закона, — ровно то утверждение, которое расходится, пересылается и не отзывается. Как только первоисточник станет доступен, у Кипра появятся и цифры, и страница, в одну и ту же неделю.",
      pl: "Nie wskazano żadnego źródła, ponieważ żadnego nie udało się otworzyć. gov.cy odpowiada 403, certyfikat mip.gov.cy wygasł, a PDF urzędu podatkowego jest zamknięty przez robots. Dlatego Cypr stoi w tabeli porównawczej z myślnikami zamiast liczb i nie ma własnej strony: próg stałego pobytu opublikowany bez przeczytania ustawy to dokładnie takie twierdzenie, które krąży, jest przesyłane dalej i nie daje się odwołać. Gdy źródło pierwotne stanie się dostępne, Cypr dostanie i liczby, i stronę w tym samym tygodniu.",
    },
  },
];

// Published through `tightenDeep` for the same reason COUNTRY_PAGES is: Russian
// and Polish group thousands with a space, and at any width "€220 000" duly
// broke across two lines the first time this page rendered. Applied at the
// export so a future consumer cannot forget it. See src/lib/typography.ts.
export const SOURCE_SECTIONS: SourceSection[] =
  tightenDeep(SOURCE_SECTIONS_RAW);
