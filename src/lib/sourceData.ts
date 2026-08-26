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

/** The day every figure below was read from its source. One date for the whole
 *  page, because they were checked in one sitting — a per-row date would imply
 *  a rolling process this project does not run. */
export const CHECKED_ON: Record<Locale, string> = {
  en: "23 August 2026",
  ru: "23 августа 2026 года",
  pl: "23 sierpnia 2026",
};

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
        finding: {
          en: "Art. 5A of Law 4172/2013: €100,000 a year on foreign income, plus €20,000 per family member, an investment of €500,000 within three years, up to fifteen years. The golden visa does not count towards that investment — the relief attaches only to the investment-activity permit under art. 16 of Law 4251/2014.",
          ru: "Ст. 5A Закона 4172/2013: €100 000 в год на зарубежный доход, плюс €20 000 на каждого члена семьи, инвестиция €500 000 в течение трёх лет, максимум пятнадцать лет. Золотая виза эту инвестицию не засчитывает — освобождение работает только для разрешения на инвестиционную деятельность по ст. 16 Закона 4251/2014.",
          pl: "Art. 5A ustawy 4172/2013: €100 000 rocznie od dochodu zagranicznego, plus €20 000 na członka rodziny, inwestycja €500 000 w ciągu trzech lat, maksymalnie piętnaście lat. Złota wiza nie zalicza się do tej inwestycji — ulga dotyczy wyłącznie zezwolenia na działalność inwestycyjną z art. 16 ustawy 4251/2014.",
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
        verdict: "unverified",
        finding: {
          en: "No official page says off-plan property qualifies for the golden visa, and GDRFA's owner-visa page expressly requires completed construction. Nothing is stated on the site.",
          ru: "Ни одна официальная страница не говорит, что строящаяся недвижимость подходит под золотую визу, а страница GDRFA по визе собственника прямо требует завершённого строительства. На сайте ничего не утверждается.",
          pl: "Żadna oficjalna strona nie mówi, że nieruchomość w budowie kwalifikuje się do złotej wizy, a strona GDRFA o wizie właściciela wprost wymaga zakończonej budowy. Na stronie nic się nie twierdzi.",
        },
      },
      {
        subject: {
          en: "The AED 750,000 and AED 1,000,000 figures in circulation",
          ru: "Ходящие цифры AED 750 000 и AED 1 000 000",
          pl: "Krążące kwoty AED 750 000 i AED 1 000 000",
        },
        verdict: "corrected",
        finding: {
          en: "AED 750,000 is not found in any current source. AED 1,000,000 is the retirement golden visa, from age 55, for five years — not a shorter investor route.",
          ru: "AED 750 000 в действующих источниках не находится. AED 1 000 000 — это пенсионная золотая виза с 55 лет на пять лет, а не «короткая инвесторская».",
          pl: "AED 750 000 nie występuje w żadnym aktualnym źródle. AED 1 000 000 to emerytalna złota wiza od 55. roku życia na pięć lat, a nie krótsza ścieżka inwestorska.",
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
        finding: {
          en: "Government fees on the golden visa are AED 9,884.75 (medical 700, Emirates ID 1,153, residence 2,856.75, DLD 4,020, admin 1,155), plus AED 5,774.50 per dependant. The 4% DLD registration fee and the 2% agent commission are market practice and are not confirmed by an official page, so they are named but not totalled. That gives roughly €31,000.",
          ru: "Государственные сборы по золотой визе — AED 9 884,75 (медосмотр 700, Emirates ID 1 153, резидентство 2 856,75, DLD 4 020, административный 1 155), плюс AED 5 774,50 за иждивенца. Регистрационный сбор DLD 4% и комиссия агента 2% — рыночная практика, официальной страницей не подтверждены, поэтому названы, но в сумму не входят. Итого около €31 000.",
          pl: "Opłaty urzędowe przy złotej wizie to AED 9 884,75 (badanie 700, Emirates ID 1 153, rezydencja 2 856,75, DLD 4 020, administracyjna 1 155), plus AED 5 774,50 za osobę zależną. Opłata rejestracyjna DLD 4% i prowizja pośrednika 2% to praktyka rynkowa, niepotwierdzona oficjalną stroną, więc są wymienione, ale nie wliczone. Daje to około €31 000.",
        },
      },
    ],
    sources: [
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
        finding: {
          en: "Closed. After the Court of Justice ruling in C-181/23 of 29 April 2025 the ESDI scheme was replaced by Act XXI of 2025 and the S.L. 188.06 rules: naturalisation for merit in science, sport, culture or philanthropy, with at least eight months of residence — payment alone does not qualify. Ordinary naturalisation is four years out of the last six plus twelve continuous months before applying.",
          ru: "Закрыто. После решения Суда ЕС по делу C-181/23 от 29 апреля 2025 года схема ESDI заменена Актом XXI/2025 и правилами S.L. 188.06: натурализация за заслуги в науке, спорте, культуре и благотворительности, с проживанием не менее восьми месяцев, — платёж сам по себе не квалифицирует. Обычная натурализация — четыре года из последних шести плюс двенадцать непрерывных месяцев перед подачей.",
          pl: "Zamknięte. Po wyroku Trybunału Sprawiedliwości w sprawie C-181/23 z 29 kwietnia 2025 schemat ESDI zastąpiono Aktem XXI z 2025 i przepisami S.L. 188.06: naturalizacja za zasługi w nauce, sporcie, kulturze i filantropii, przy pobycie co najmniej ośmiu miesięcy — sama płatność nie kwalifikuje. Zwykła naturalizacja to cztery lata z ostatnich sześciu plus dwanaście nieprzerwanych miesięcy przed złożeniem wniosku.",
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
