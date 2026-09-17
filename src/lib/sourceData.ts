import type { Locale } from "@/i18n/routing";
import { tightenDeep } from "./typography";

// The working behind every headline figure on this site, published.
//
// IN src/lib AND NOT IN THE CMS, deliberately, and this is the one page where
// that is a matter of integrity rather than convenience. The project's standing
// rule is that a figure may not change in copy/jurisdictions.ts without
// archive/figures-verification-2026-08-23.md changing in the same commit. A
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
// the working lived in archive/figures-verification-2026-08-23.md, in git, which
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
  /** The anchor this instrument answers to, unique within its section, so the
   *  page address of one act is `/sources#gr-l5038-art-100a` and an article can
   *  cite the norm rather than the page.
   *
   *  HAND-WRITTEN AND NEVER DERIVED FROM `citation`, which is the whole point.
   *  A slug computed from the citation text would change the day a citation is
   *  corrected — and citations here get corrected; that is what the page is
   *  for. Every link that had been made to the old anchor would then land at
   *  the top of a 64-entry page with no indication of what it had been pointing
   *  at, which is a worse failure than a stale citation, because it is silent.
   *  So the id is a literal, and the rule is: an id may be added, and may not
   *  be changed. If an instrument is replaced by another, the new one gets a
   *  new id and the old row stays with its verdict set to `withdrawn`.
   *
   *  Only unique WITHIN a section: Act XXI of 2025 is cited under both `mt` and
   *  `citizenship`, and forcing it to two different ids would say the two
   *  sections were citing two different acts. */
  id: string;
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

const CHECKED_2026_09_05: Record<Locale, string> = {
  en: "5 September 2026",
  ru: "5 сентября 2026 года",
  pl: "5 września 2026",
};

const CHECKED_2026_09_07: Record<Locale, string> = {
  en: "7 September 2026",
  ru: "7 сентября 2026 года",
  pl: "7 września 2026",
};

// 13 September 2026 carries no row of its own, and that is the point of having
// two dates at the foot. Nothing was re-read that day; what happened is that
// the D7 working, verified on 28 August and left in docs/ for a fortnight,
// finally reached this page. The rows keep the date the statutes were read.
// REVISED_ON moves, because a reader who was here last week is owed the fact
// that the page changed.
const CHECKED_2026_09_13: Record<Locale, string> = {
  en: "13 September 2026",
  ru: "13 сентября 2026 года",
  pl: "13 września 2026",
};

// The Polish legalisation section was read on this day.
const CHECKED_2026_09_14: Record<Locale, string> = {
  en: "14 September 2026",
  ru: "14 сентября 2026 года",
  pl: "14 września 2026",
};

// Part 4 of the Polish working: status services, where summonses arrive, work
// while waiting. It corrected the site's own entry of the same morning, which
// said summonses come through MOS.
const CHECKED_2026_09_15: Record<Locale, string> = {
  en: "15 September 2026",
  ru: "15 сентября 2026 года",
  pl: "15 września 2026",
};

/** Every date on which any row of this page was read against its source. A
 *  claim's `checked` key indexes this. */
export const CHECK_DATES: Record<string, Record<Locale, string>> = {
  "2026-08-23": CHECKED_2026_08_23,
  "2026-08-25": CHECKED_2026_08_25,
  "2026-08-28": CHECKED_2026_08_28,
  "2026-08-30": CHECKED_2026_08_30,
  "2026-09-01": CHECKED_2026_09_01,
  "2026-09-05": CHECKED_2026_09_05,
  "2026-09-07": CHECKED_2026_09_07,
  "2026-09-13": CHECKED_2026_09_13,
  "2026-09-14": CHECKED_2026_09_14,
  "2026-09-15": CHECKED_2026_09_15,
};

/** The date that governs every row not carrying its own. */
export const CHECKED_ON: Record<Locale, string> = CHECKED_2026_08_23;

// TWO DATES AT THE FOOT, NOT ONE, AND THEY ANSWER DIFFERENT QUESTIONS.
//
// Until now this page ended with a single line: "checked on 23 August 2026".
// That line was doing two jobs at once and doing the second one badly. A reader
// asking "is this current?" wants to know when somebody last opened the law.
// A reader who was here last week wants to know whether the page has changed
// since. One date cannot answer both, and when they diverge the single date
// answers the wrong one: on 5 September four instruments and two claims were
// added to this page while thirty-one rows had not been re-read since
// 23 August. A page stamped "5 September" would have implied thirty-one fresh
// checks that did not happen; a page stamped "23 August" would have hidden two
// corrections of the site's own worst errors.
//
// So: CHECKED_ON is about the LAW — the baseline date a row was read against
// its source, overridden per row by `checked`. REVISED_ON is about the PAGE —
// the day its own text last changed, for any reason including a rewritten
// caveat or a new source with no new claim.
//
// THE RULE FOR BUMPING THEM, and it matters that they move independently:
// re-reading a source and finding it unchanged moves that row's `checked` and
// nothing else. Editing wording moves REVISED_ON and nothing else. Only actual
// re-verification may move a check date — which is the discipline the whole
// page exists to demonstrate, and the exact discipline the "last updated"
// stamps this page audits other sites for are failing.
export const REVISED_ON: Record<Locale, string> = CHECKED_2026_09_15;

/** The ISO form of REVISED_ON, for the page's `dateModified`. Kept beside it so
 *  the two cannot drift; the rendered strings are hand-written because Intl
 *  abbreviates the Russian. */
export const REVISED_ON_ISO = "2026-09-15";

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
          en: "Art. 82 of Lei 23/2007 allows 60 days to decide a grant and 30 to decide a renewal, with tacit approval on renewal where the delay is not the applicant's. In practice it runs one to three years: filing to biometrics 6–24 months, biometrics to card 6–18. AIMA reported roughly 30,000 pending cases on 4 August 2026.",
          ru: "Ст. 82 Lei 23/2007 даёт 60 дней на решение о выдаче и 30 — на решение о продлении, с молчаливым согласием при продлении, если задержка не по вине заявителя. Фактически — от года до трёх: подача → биометрия 6–24 месяца, биометрия → карта 6–18. На 4 августа 2026 года AIMA сообщает о примерно 30 000 нерассмотренных дел.",
          pl: "Art. 82 Lei 23/2007 daje 60 dni na decyzję o wydaniu i 30 dni na decyzję o przedłużeniu, z milczącą zgodą przy przedłużeniu, gdy zwłoka nie leży po stronie wnioskodawcy. W praktyce trwa to od roku do trzech: złożenie → biometria 6–24 miesiące, biometria → karta 6–18. Na 4 sierpnia 2026 AIMA podaje około 30 000 nierozpatrzonych spraw.",
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
      {
        subject: {
          en: "Can a remote worker already in Portugal convert to a residence permit?",
          ru: "Может ли удалёнщик, уже находящийся в Португалии, перейти на ВНЖ?",
          pl: "Czy pracownik zdalny już w Portugalii może przejść na zezwolenie na pobyt?",
        },
        verdict: "added",
        checked: "2026-09-07",
        finding: {
          en: "Not on the published rules, and the defect is a live one. Art. 31-A(2) of DR 84/2007 — the only in-country route the D8 regime names — sends the applicant to “o procedimento definido no n.º 2 e seguintes dos artigos 88.º e 89.º”. Art. 2 of Decreto-Lei 37-A/2024 repealed arts. 88(2), 88(6) and 89(2), (4) and (5) on 4 June 2024, and the regulation's last amendment is DR 1/2024 of 17 January 2024 — five months earlier. So a regulation in force names a repealed procedure. Nor does art. 122(1) help: its nineteen alíneas include the holder of a temporary-stay visa for research or highly qualified activity, al. q), and not the remote-work one at art. 54(1)(i). Lei 40/2024 preserves the old regime only for proceedings begun before 4 June 2024 and for people already contributing to social security. This is about the published rules, not about AIMA's practice, which we could not reach.",
          ru: "По опубликованным правилам — нет, и дефект действующий. Ст. 31-A(2) DR 84/2007, единственный маршрут внутри страны, который называет режим D8, отсылает заявителя к «o procedimento definido no n.º 2 e seguintes dos artigos 88.º e 89.º». Ст. 2 Decreto-Lei 37-A/2024 отменила ст. 88(2), 88(6) и 89(2), (4) и (5) 4 июня 2024 года, а последняя правка регламента — DR 1/2024 от 17 января 2024 года, пятью месяцами раньше. То есть действующий регламент называет отменённую процедуру. Ст. 122(1) тоже не выручает: среди её девятнадцати пунктов есть держатель визы временного пребывания для исследований или высококвалифицированной деятельности, п. q), и нет держателя визы для удалённой работы по ст. 54(1)(i). Lei 40/2024 сохраняет прежний режим только для дел, начатых до 4 июня 2024 года, и для тех, кто уже платил взносы. Речь об опубликованных правилах, а не о практике AIMA, до которой мы не добрались.",
          pl: "Według opublikowanych przepisów nie, a wada jest aktualna. Art. 31-A(2) DR 84/2007 — jedyna ścieżka wewnątrz kraju, jaką nazywa reżim D8 — odsyła wnioskodawcę do „o procedimento definido no n.º 2 e seguintes dos artigos 88.º e 89.º”. Art. 2 Decreto-Lei 37-A/2024 uchylił art. 88(2), 88(6) oraz 89(2), (4) i (5) 4 czerwca 2024, a ostatnia nowelizacja rozporządzenia to DR 1/2024 z 17 stycznia 2024 — pięć miesięcy wcześniej. Obowiązujące rozporządzenie nazywa zatem uchyloną procedurę. Art. 122(1) też nie ratuje: wśród jego dziewiętnastu punktów jest posiadacz wizy pobytu czasowego dla badań lub działalności wysoko wykwalifikowanej, lit. q), a nie ten od pracy zdalnej z art. 54(1)(i). Lei 40/2024 zachowuje dawny reżim tylko dla spraw wszczętych przed 4 czerwca 2024 i dla osób już odprowadzających składki. Rzecz dotyczy przepisów opublikowanych, nie praktyki AIMA, do której nie dotarliśmy.",
        },
      },
      {
        subject: {
          en: "OUR OWN ERROR — “the D8’s four-times-the-minimum-wage figure is in no instrument”",
          ru: "НАША СОБСТВЕННАЯ ОШИБКА — «четырёхкратности минимальной зарплаты для D8 нет ни в одном акте»",
          pl: "NASZ WŁASNY BŁĄD — \u201eczterokrotności płacy minimalnej dla D8 nie ma w żadnym akcie\u201d",
        },
        verdict: "corrected",
        checked: "2026-09-07",
        finding: {
          en: "We published, in six files, that the widely quoted four-times-the-minimum-wage threshold for the D8 could not be traced to any portaria, decreto or despacho, and named two sites as printing a figure that was not law. It is law. Decreto Regulamentar 4/2022 of 30 September 2022, art. 18-B(c) for the temporary-stay visa and art. 31-A(1)(c) for the residence visa, both require “rendimentos médios mensais … nos últimos três meses de valor mínimo equivalente a quatro remunerações mínimas mensais garantidas”. What was right and stays right: art. 61-B of Lei 23/2007 itself states no figure. We read the statute, found it silent, and did not open the regulation that implements it. The finding that survives is better than the one we lost: the law fixes a MULTIPLIER over a three-month average, not a euro amount — €3,680 at the 2026 RMMG of €920, and a different number every January.",
          ru: "Мы опубликовали в шести файлах, что широко цитируемый порог «четыре минимальные зарплаты» для D8 не прослеживается ни до одной portaria, decreto или despacho, и назвали два сайта как печатающие цифру, которая нормой не является. Она норма. Decreto Regulamentar 4/2022 от 30 сентября 2022 года, ст. 18-B(c) для визы временного пребывания и ст. 31-A(1)(c) для резидентской визы, обе требуют «rendimentos médios mensais … nos últimos três meses de valor mínimo equivalente a quatro remunerações mínimas mensais garantidas». Верным осталось одно: в самой ст. 61-B Lei 23/2007 суммы нет. Мы прочитали закон, увидели молчание и не открыли исполняющий его регламент. Уцелевшая находка лучше потерянной: закон фиксирует КРАТНОСТЬ по среднему за три месяца, а не сумму в евро — 3680 евро при RMMG 2026 года в 920 евро и другое число каждый январь.",
          pl: "Opublikowaliśmy w sześciu plikach, że szeroko cytowany próg \u201eczterokrotność płacy minimalnej\u201d dla D8 nie da się wywieść z żadnej portarii, dekretu ani despacho, i wskazaliśmy dwa serwisy jako drukujące liczbę, która normą nie jest. Jest normą. Decreto Regulamentar 4/2022 z 30 września 2022, art. 18-B(c) dla wizy pobytu czasowego i art. 31-A(1)(c) dla wizy rezydenckiej, oba wymagają \u201erendimentos médios mensais … nos últimos três meses de valor mínimo equivalente a quatro remunerações mínimas mensais garantidas\u201d. Prawdą pozostaje jedno: sam art. 61-B Lei 23/2007 kwoty nie podaje. Przeczytaliśmy ustawę, zobaczyliśmy milczenie i nie otworzyliśmy wykonującego ją rozporządzenia. Ustalenie, które przetrwało, jest lepsze od utraconego: prawo ustala KROTNOŚĆ liczoną ze średniej z trzech miesięcy, a nie kwotę w euro — 3680 euro przy RMMG 920 euro na 2026 rok i inna liczba każdego stycznia.",
        },
      },
      // --- The D7, published 13 September 2026 ---------------------------------
      //
      // Verified on 28 August 2026 and left in docs/ for a fortnight, which is
      // to say nowhere a reader could reach. The page carried thirty-three
      // checks and not one about the route a 4 800-word article on this site
      // is entirely about. The rows below are dated to the day the statutes
      // were read, not to the day they were published here: this is the
      // dossier reaching the page, not a fresh reading of the law.
      {
        subject: {
          en: "What income a D7 applicant must show",
          ru: "Какой доход должен показать заявитель на D7",
          pl: "Jaki dochód musi wykazać wnioskodawca D7",
        },
        verdict: "added",
        checked: "2026-08-28",
        finding: {
          en: "A percentage of the guaranteed minimum monthly wage, not a sum: 100% for the main applicant, 50% for a second adult, 30% for a child under 18 — €920, €460 and €276 at the 2026 RMMG. The scale is art. 2(2) of Portaria 1563/2007 and art. 13 of the same instrument updates it with the wage automatically, so the euro figure changes every January without any rule changing. The 2026 RMMG is set by art. 3 of Decreto-Lei 139/2025. It is indexed to the RMMG and NOT to the IAS (€537.13 in 2026), which is the anchor most often quoted for immigration income tests and is the wrong one; both values are given so the error is checkable.",
          ru: "Процент от гарантированной минимальной месячной зарплаты, а не сумма: 100% на основного заявителя, 50% на второго взрослого, 30% на ребёнка до 18 лет — 920, 460 и 276 евро при RMMG 2026 года. Шкала — ст. 2(2) Portaria 1563/2007, а ст. 13 того же акта обновляет её вслед за зарплатой автоматически, так что сумма в евро меняется каждый январь без изменения нормы. RMMG на 2026 год установлена ст. 3 Decreto-Lei 139/2025. Привязка идёт к RMMG, а НЕ к IAS (537,13 евро в 2026 году), который чаще всего называют якорем миграционных тестов на доход и который здесь не тот; обе величины приведены, чтобы ошибку можно было проверить.",
          pl: "Procent gwarantowanej minimalnej płacy miesięcznej, a nie kwota: 100% na głównego wnioskodawcę, 50% na drugą osobę dorosłą, 30% na dziecko poniżej 18 lat — 920, 460 i 276 euro przy RMMG na 2026 rok. Skalę podaje art. 2(2) Portaria 1563/2007, a art. 13 tego samego aktu aktualizuje ją automatycznie wraz z płacą, więc kwota w euro zmienia się każdego stycznia bez zmiany przepisu. RMMG na 2026 rok ustala art. 3 Decreto-Lei 139/2025. Wskaźnikiem jest RMMG, a NIE IAS (537,13 euro w 2026), najczęściej przywoływany jako podstawa migracyjnych testów dochodu i będący tu niewłaściwym; obie wartości podano, by błąd dało się sprawdzić.",
        },
      },
      {
        subject: {
          en: "There is no article of Lei 23/2007 devoted to the D7",
          ru: "В Lei 23/2007 нет статьи, посвящённой D7",
          pl: "W Lei 23/2007 nie ma artykułu poświęconego D7",
        },
        verdict: "added",
        checked: "2026-08-28",
        finding: {
          en: "The route rests on the general residence visa at art. 58, the general permit conditions at art. 77 and the Portaria 1563/2007 scale. Arts. 59 to 64 cover the SPECIFIC visas — subordinate work, independent work, research, study, student mobility, family reunification — and none of them covers a holder of own income. Art. 58 gives two entries, four months in Portugal and a 60-day statutory decision on the visa. The AIMA appointment is not a separate clock: art. 14 of Decreto Regulamentar 84/2007 puts it inside AIMA's favourable opinion where the applicant states a travel date, and requires it to fall within the visa's own validity. The flat “120 days” published by most guides is not a rule of its own.",
          ru: "Маршрут опирается на общую резидентскую визу по ст. 58, общие условия разрешения по ст. 77 и шкалу Portaria 1563/2007. Ст. 59–64 покрывают СПЕЦИАЛЬНЫЕ визы — наёмный труд, независимый труд, исследования, учёба, студенческая мобильность, воссоединение семьи — и ни одна не покрывает держателя собственного дохода. Ст. 58 даёт два въезда, четыре месяца в Португалии и 60 дней на решение по визе. Запись в AIMA — не отдельный отсчёт: ст. 14 Decreto Regulamentar 84/2007 помещает её внутрь положительного заключения AIMA, если заявитель указал дату поездки, и требует, чтобы она попадала в срок действия самой визы. Плоские «120 дней», которые печатает большинство справок, отдельной нормой не являются.",
          pl: "Ścieżka opiera się na ogólnej wizie rezydenckiej z art. 58, ogólnych warunkach zezwolenia z art. 77 i skali Portaria 1563/2007. Art. 59–64 obejmują wizy SZCZEGÓLNE — praca najemna, praca niezależna, badania, studia, mobilność studencka, łączenie rodzin — i żadna nie obejmuje osoby utrzymującej się z własnego dochodu. Art. 58 daje dwa wjazdy, cztery miesiące w Portugalii i 60 dni na decyzję wizową. Termin w AIMA nie jest osobnym zegarem: art. 14 Decreto Regulamentar 84/2007 umieszcza go w pozytywnej opinii AIMA, gdy wnioskodawca wskaże datę podróży, i wymaga, by mieścił się w okresie ważności samej wizy. Płaskie „120 dni” drukowane przez większość poradników nie są odrębnym przepisem.",
        },
      },
      {
        subject: {
          en: "How long the permit lasts, and what five years buys",
          ru: "Сколько действует разрешение и что даёт пятилетний срок",
          pl: "Jak długo obowiązuje zezwolenie i co daje pięć lat",
        },
        verdict: "added",
        checked: "2026-08-28",
        finding: {
          en: "Two years from the issue of the title, renewable for successive three-year periods, art. 75(1). At five years of temporary residence art. 80(1) opens permanent residence, on four further conditions: no sentence or sentences exceeding one year over those five years, means of subsistence on the same Portaria scale, accommodation, and basic Portuguese. So the income test does not end when the permit becomes permanent. Art. 76(1) gives the permanent permit no expiry; the card is renewed every five years. No CEFR level appears in the statute — art. 80(1)(e) says “Português básico” and nothing more, and the A2 everyone publishes is regulation-level. The current wording of art. 75 was reachable only on a secondary compilation; the primary corroboration that it stands is Lei 61/2025, which re-enacts art. 75 and rewrites only its n.º 2.",
          ru: "Два года с даты выдачи титула, продление последовательными трёхлетними периодами — ст. 75(1). На пяти годах временного проживания ст. 80(1) открывает постоянное, ещё при четырёх условиях: отсутствие приговоров суммарно свыше года за эти пять лет, средства к существованию по той же шкале Portaria, жильё и базовый португальский. То есть тест на доход не заканчивается, когда разрешение становится постоянным. Ст. 76(1) не даёт постоянному разрешению срока годности; карта обновляется каждые пять лет. Уровня CEFR в законе нет: ст. 80(1)(e) говорит «Português básico» и больше ничего, а A2, который печатают все, — уровень подзаконного акта. Действующая редакция ст. 75 была доступна только в стороннем своде; первичное подтверждение того, что она в силе, — Lei 61/2025, которая переиздаёт ст. 75 и переписывает только её п. 2.",
          pl: "Dwa lata od wydania tytułu, odnawialne na kolejne okresy trzyletnie — art. 75(1). Po pięciu latach pobytu czasowego art. 80(1) otwiera pobyt stały, przy czterech dalszych warunkach: brak kar przekraczających łącznie rok w tym pięcioleciu, środki utrzymania według tej samej skali Portaria, zakwaterowanie i podstawowy portugalski. Test dochodowy nie kończy się więc wraz z uzyskaniem stałego zezwolenia. Art. 76(1) nie nadaje stałemu zezwoleniu terminu ważności; karta jest odnawiana co pięć lat. W ustawie nie ma poziomu CEFR: art. 80(1)(e) mówi „Português básico” i nic więcej, a A2 drukowane wszędzie pochodzi z aktu wykonawczego. Aktualne brzmienie art. 75 było dostępne tylko w zbiorze wtórnym; pierwotnym potwierdzeniem jego obowiązywania jest Lei 61/2025, która art. 75 przyjmuje ponownie i przepisuje wyłącznie jego ust. 2.",
        },
      },
      {
        subject: {
          en: "Where a D7 application is actually filed",
          ru: "Куда на самом деле подаётся заявление на D7",
          pl: "Gdzie faktycznie składa się wniosek o D7",
        },
        verdict: "unverified",
        checked: "2026-08-28",
        finding: {
          en: "Not established. Whether the file goes to the consulate directly or through VFS Global is stated only on vistos.mne.gov.pt, the consulate sites and gov.pt, and every mne.gov.pt host failed across this research. The consular fee is €110, the single “national visas” line of Portaria 91/2025/1 amending the emoluments table of Portaria 229/2021 — and a D7-specific line elsewhere in the consolidated table could not be ruled out, because that table on DRE is JavaScript-gated. Every competing page states a filing route flatly. We do not.",
          ru: "Не установлено. Подаётся ли дело прямо в консульство или через VFS Global, сказано только на vistos.mne.gov.pt, на сайтах консульств и на gov.pt, а все узлы mne.gov.pt за время этой работы не открылись. Консульский сбор — 110 евро, единственная строка «Vistos nacionais» в Portaria 91/2025/1, меняющей таблицу сборов Portaria 229/2021; отдельную строку под D7 в сводной таблице исключить не удалось, потому что эта таблица на DRE закрыта JavaScript. Каждая конкурирующая страница называет маршрут подачи прямо. Мы — нет.",
          pl: "Nieustalone. Czy wniosek składa się bezpośrednio w konsulacie, czy przez VFS Global, podają wyłącznie vistos.mne.gov.pt, strony konsulatów i gov.pt, a wszystkie hosty mne.gov.pt były w trakcie tych prac niedostępne. Opłata konsularna wynosi 110 euro — jedyna pozycja „Vistos nacionais” w Portaria 91/2025/1 zmieniającej tabelę opłat Portaria 229/2021; osobnej pozycji dla D7 w tabeli skonsolidowanej nie dało się wykluczyć, bo ta tabela w DRE jest zamknięta JavaScriptem. Każda konkurencyjna strona podaje ścieżkę składania wprost. My nie.",
        },
      },
    ],
    sources: [
      {
        id: "lei-23-2007",
        citation:
          "Lei 23/2007, de 4 de julho — arts. 58 (residence visa), 75 (validity and renewal), 76, 77 (permit conditions) and 80 (permanent residence)",
        url: "https://files.diariodarepublica.pt/1s/2007/07/12700/42904330.pdf",
        kind: "official",
        caveat: {
          en: "The 2007 original, in the gazette's own PDF. The consolidated text on DRE is JavaScript-gated and PGD Lisboa truncates this law around art. 31, so arts. 75 and 77 were read here and corroborated against Lei 61/2025's re-enactment rather than against a current consolidation.",
          ru: "Оригинал 2007 года, в собственном PDF официального вестника. Сводный текст на DRE закрыт JavaScript, а PGD Lisboa обрывает закон около ст. 31, поэтому ст. 75 и 77 прочитаны здесь и сверены с переизданием в Lei 61/2025, а не со сводной редакцией.",
          pl: "Oryginał z 2007 roku, we własnym PDF dziennika urzędowego. Tekst ujednolicony w DRE jest zamknięty JavaScriptem, a PGD Lisboa urywa tę ustawę około art. 31, więc art. 75 i 77 przeczytano tutaj i skonfrontowano z ponownym uchwaleniem w Lei 61/2025, a nie z obowiązującym tekstem jednolitym.",
        },
      },
      {
        id: "portaria-1563-2007",
        citation:
          "Portaria 1563/2007, de 11 de dezembro — art. 2(2), the means-of-subsistence scale, and art. 13, its automatic annual update",
        url: "https://vistos.mne.gov.pt/images/schengen/portaria1563_2007_meios_de_subsist.pdf",
        kind: "official",
        caveat: {
          en: "Presumed in force, not proven. No repealing or replacing instrument was found and the DRE status line could not be read. The positive evidence is Decreto Regulamentar 1/2024, which refers to this portaria in its operative text — a January 2024 regulation would not cross-refer to a repealed one.",
          ru: "Считается действующей, но это не доказано. Отменяющего или заменяющего акта не найдено, строку статуса на DRE прочитать не удалось. Положительное свидетельство — Decreto Regulamentar 1/2024, который ссылается на эту portaria в своей нормативной части: регламент января 2024 года не стал бы ссылаться на отменённую.",
          pl: "Domniemanie obowiązywania, nie dowód. Nie znaleziono aktu uchylającego ani zastępującego, a wiersza statusu w DRE nie dało się odczytać. Dowodem pozytywnym jest Decreto Regulamentar 1/2024, które odsyła do tej portarii w części normatywnej — rozporządzenie ze stycznia 2024 nie odsyłałoby do uchylonej.",
        },
      },
      {
        id: "dl-139-2025",
        citation:
          "Decreto-Lei 139/2025, de 29 de dezembro — art. 3, the guaranteed minimum monthly wage for 2026 (€920.00), effective 1 January 2026 per art. 7",
        url: "https://files.diariodarepublica.pt/1s/2025/12/24900/0001400016.pdf",
        kind: "official",
      },
      {
        id: "portaria-91-2025",
        citation:
          "Portaria 91/2025/1, de 10 de março — amending the consular emoluments table of Portaria 229/2021; the “Vistos nacionais” line, €110",
        url: "https://files.diariodarepublica.pt/1s/2025/03/04800/0000900017.pdf",
        kind: "official",
        caveat: {
          en: "The single “national visas” entry. The consolidated table on DRE is JavaScript-gated, so a D7-specific line elsewhere in it could not be ruled out.",
          ru: "Единственная строка «национальные визы». Сводная таблица на DRE закрыта JavaScript, поэтому отдельную строку под D7 в ней исключить не удалось.",
          pl: "Jedyna pozycja „wizy krajowe”. Tabela skonsolidowana w DRE jest zamknięta JavaScriptem, więc osobnej pozycji dla D7 nie dało się wykluczyć.",
        },
      },
      {
        id: "dr-84-2007-art-14",
        citation:
          "Decreto Regulamentar 84/2007, art. 14 — the AIMA appointment is set inside the favourable opinion and must fall within the residence visa's validity",
        url: "https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=940&tabela=leis",
        kind: "reproduction",
        caveat: {
          en: "PGD Lisboa reproduces the text faithfully but is a legal database, not the gazette. It is cited because it is where this article can actually be read: the consolidated regulation on DRE is JavaScript-gated.",
          ru: "PGD Lisboa воспроизводит текст точно, но это правовая база, а не официальный вестник. Ссылка стоит потому, что именно там эту статью можно прочитать: сводный регламент на DRE закрыт JavaScript.",
          pl: "PGD Lisboa odtwarza tekst wiernie, ale jest bazą prawną, nie dziennikiem urzędowym. Cytowana, bo właśnie tam ten artykuł da się przeczytać: rozporządzenie ujednolicone w DRE jest zamknięte JavaScriptem.",
        },
      },
      {
        // id БЕЗ ПРЕФИКСА СЕКЦИИ: якорь строится как `${section.key}-${id}`,
        // и "pt-dr-4-2022" дал бы /sources#pt-pt-dr-4-2022.
        id: "dr-4-2022",
        citation:
          "Decreto Regulamentar 4/2022, de 30 de setembro — inserting arts. 18.º-B and 31.º-A into Decreto Regulamentar 84/2007 (D8 income threshold and the in-country cross-reference)",
        url: "https://files.dre.pt/1s/2022/09/19000/0002800097.pdf",
        kind: "official",
      },
      {
        id: "dl-37-a-2024",
        citation:
          "Decreto-Lei 37-A/2024, de 3 de junho — art. 2, repealing arts. 88(2), 88(6) and 89(2), (4), (5) of Lei 23/2007",
        url: "https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?artigo_id=3807A0002&nid=3807&tabela=lei_velhas&pagina=1&ficha=1&so_miolo=&nversao=1",
        kind: "reproduction",
        caveat: {
          en: "Read at the Procuradoria-Geral Distrital de Lisboa's legal database, which reproduces the official text; the Diário da República PDF was not reachable when checked.",
          ru: "Прочитано в правовой базе Окружной генеральной прокуратуры Лиссабона, которая воспроизводит официальный текст; PDF Diário da República на момент сверки был недоступен.",
          pl: "Odczytane w bazie prawnej Prokuratury Generalnej Okręgu Lizbona, która reprodukuje tekst oficjalny; PDF Diário da República był w chwili sprawdzenia nieosiągalny.",
        },
      },
      {
        id: "lei-40-2024",
        citation:
          "Lei 40/2024, de 7 de novembro — transitional protection for proceedings begun before 4 June 2024",
        url: "https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=3835&tabela=leis",
        kind: "reproduction",
        caveat: {
          en: "Same database, same caveat.",
          ru: "Та же база, та же оговорка.",
          pl: "Ta sama baza, to samo zastrzeżenie.",
        },
      },
      {
        id: "lei-61-2025",
        citation:
          "Lei 61/2025, de 22 de outubro — art. 89(4) replaced, art. 122(1)(s) added",
        url: "https://files.diariodarepublica.pt/1s/2025/10/20400/0000900017.pdf",
        kind: "official",
      },
      {
        id: "lei-56-2023",
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
        id: "aima-ari-vii",
        citation: "AIMA — ARI, subparagraph vii (fund subscription)",
        url: "https://aima.gov.pt/documents/ari-subalinea-7.pdf",
        kind: "official",
      },
      {
        id: "aima-ari-other",
        citation:
          "AIMA — ARI, subparagraphs ii, v, vi, viii (the other routes)",
        url: "https://aima.gov.pt/documents/ari-subalinea-2.pdf",
        kind: "official",
      },
      {
        id: "aima-fees",
        citation: "AIMA — table of fees and charges",
        url: "https://aima.gov.pt/documents/tabela-de-taxas-e-demais-encargos-a-cobrar-pelos-procedimentos-administrativos.pdf",
        kind: "official",
      },
      {
        id: "portaria-352-2024",
        citation: "Portaria 352/2024/1 of 23 December 2024 (IFICI procedure)",
        url: "https://files.diariodarepublica.pt/1s/2024/12/24800/0004000045.pdf",
        kind: "official",
      },
      {
        id: "financas-ifici",
        citation: "Portal das Finanças — IFICI",
        url: "https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-01018.aspx",
        kind: "official",
      },
      {
        id: "cimt-art-17",
        citation:
          "Código do IMT art. 17 — the rate tables, as amended by Lei 73-A/2025 of 30 December 2025 (mainland)",
        url: "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cimt/Pages/cimt17.aspx",
        kind: "official",
      },
      {
        id: "selo-verba-1-1",
        citation:
          "Tabela Geral do Imposto do Selo, verba 1.1 — 0.8% on the onerous acquisition of immovable property",
        url: "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/selo/Pages/ccod-selo-tabgiselo.aspx",
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
          en: "A second route at €250,000: the startup investor permit",
          ru: "Второй маршрут за €250 000 — разрешение инвестора в стартап",
          pl: "Druga ścieżka za €250 000 — zezwolenie inwestora w startup",
        },
        verdict: "corrected",
        checked: "2026-09-05",
        finding: {
          en: "This site said no €250,000 startup route existed. It does. Art. 100Α of Law 5038/2023, added by art. 44 of Law 5162/2024 (Gazette Α΄ 198 of 5 December 2024), creates permit type Β.6 for €250,000 of share capital in an enterprise on the Elevate Greece registry — no more than 33% of it, two new jobs held for five years, a five-year lock on the shares, a permit issued for one year and renewed two years at a time, and, by §9, no right to work, in the same words the property permit uses. It became usable on 18 November 2025, when KYA 216761/2025 set the file and a €2,500 electronic fee. It is a different instrument from art. 100 at the same headline number and from the art. 79Α Tech Visa. The error came from reading one article instead of the code's table of contents, where art. 100Α stands one line below art. 100.",
          ru: "Сайт утверждал, что маршрута за €250 000 через стартап не существует. Он существует. Статья 100Α Закона 5038/2023, добавленная статьёй 44 Закона 5162/2024 (ФЕК Α΄ 198 от 5 декабря 2024 года), создаёт разрешение типа Β.6 за €250 000 в уставный капитал предприятия из реестра Elevate Greece — не более 33% компании, два новых рабочих места, удерживаемых пять лет, пятилетний запрет на продажу долей, разрешение на год с продлением по два года и, по §9, без права на работу, теми же словами, что и «недвижимое» разрешение. Рабочим маршрут стал 18 ноября 2025 года, когда KYA 216761/2025 определила комплект документов и электронный сбор €2 500. Это другой инструмент, чем статья 100 с той же цифрой на витрине, и чем Tech Visa по статье 79Α. Ошибка возникла из чтения одной статьи вместо оглавления кодекса, где статья 100Α стоит строкой ниже статьи 100.",
          pl: "Ta strona twierdziła, że ścieżka za €250 000 przez startup nie istnieje. Istnieje. Artykuł 100Α ustawy 5038/2023, dodany artykułem 44 ustawy 5162/2024 (Dziennik Α΄ 198 z 5 grudnia 2024), tworzy zezwolenie typu Β.6 za €250 000 kapitału zakładowego w przedsiębiorstwie z rejestru Elevate Greece — nie więcej niż 33% spółki, dwa nowe miejsca pracy utrzymywane przez pięć lat, pięcioletnia blokada udziałów, zezwolenie na rok odnawiane po dwa lata i, zgodnie z §9, bez prawa do pracy, tymi samymi słowami co zezwolenie nieruchomościowe. Użyteczna stała się 18 listopada 2025, gdy KYA 216761/2025 określiła komplet dokumentów i opłatę elektroniczną €2 500. To inny instrument niż artykuł 100 o tej samej liczbie na wystawie i niż Tech Visa z artykułu 79Α. Błąd wziął się z czytania jednego artykułu zamiast spisu treści kodeksu, gdzie artykuł 100Α stoi wiersz niżej niż artykuł 100.",
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
          en: "Art. 100 §10 gives two months from the complete file reaching the issuing authority. On filing, a βεβαίωση is issued (art. 10 of Law 5038/2023) which by itself confers lawful residence and the rights of the permit until a decision. In November 2025 there were 13,499 pending cases, 10,703 of them in Attica; waits reached 18 months and are now shortening.",
          ru: "Ст. 100 §10 даёт два месяца с момента поступления полного досье в орган выдачи. При подаче выдаётся βεβαίωση (ст. 10 Закона 5038/2023) — она сама по себе даёт законное пребывание и права по разрешению до решения. На ноябрь 2025 года — 13 499 нерассмотренных дел, 10 703 из них в Аттике; сроки доходили до 18 месяцев и сейчас сокращаются.",
          pl: "Art. 100 §10 daje dwa miesiące od wpłynięcia kompletnych akt do organu wydającego. Przy złożeniu wniosku wydawana jest βεβαίωση (art. 10 ustawy 5038/2023), która sama w sobie daje legalny pobyt i uprawnienia z zezwolenia do czasu decyzji. W listopadzie 2025 czekało 13 499 spraw, z tego 10 703 w Attyce; terminy sięgały 18 miesięcy i obecnie się skracają.",
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
        id: "l5038-art-100",
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
        id: "l5038-art-10",
        citation: "Law 5038/2023, art. 10 (the βεβαίωση)",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/10",
        kind: "reproduction",
      },
      {
        id: "l5038-art-100a",
        citation:
          "Law 5038/2023, art. 100Α — the startup investor permit (type Β.6), added by art. 44 of Law 5162/2024 (ΦΕΚ Α΄ 198/05.12.2024)",
        url: "https://archive.opengov.gr/minfin/?p=13181",
        kind: "reproduction",
        caveat: {
          en: "The link is the Ministry of National Economy and Finance's own published text of the bill, where the provision is numbered art. 41. The enacted wording in the gazette was not read; the November 2025 joint ministerial decision below legislates against «το άρθρο 100Α του ν. 5038/2023» by name, which is what corroborates it.",
          ru: "По ссылке — опубликованный самим Министерством национальной экономики и финансов текст законопроекта, где норма идёт под номером 41. Принятая редакция в газете не прочитана; совместное министерское решение от ноября 2025 года, ниже, ссылается на «το άρθρο 100Α του ν. 5038/2023» поимённо — этим и подтверждается.",
          pl: "Pod linkiem jest opublikowany przez samo Ministerstwo Gospodarki Narodowej i Finansów tekst projektu, gdzie przepis ma numer 41. Uchwalonego brzmienia w dzienniku nie przeczytano; wspólna decyzja ministerialna z listopada 2025 poniżej powołuje się na «το άρθρο 100Α του ν. 5038/2023» z nazwy, i to ją potwierdza.",
        },
      },
      {
        id: "kya-216761-2025",
        citation:
          "KYA 216761/12.11.2025 — ΦΕΚ Β΄ 6138/18.11.2025, documents for making and holding a startup investment under art. 100Α",
        url: "https://www.forin.gr/articles/article/87754/kua-216761-2025",
        kind: "reproduction",
      },
      {
        id: "l5307-2026",
        citation:
          "Law 5307/2026 — ΦΕΚ Α΄ 90/11.06.2026, the EU Pact implementation law: 265 articles, of which art. 179 alone touches the Migration Code",
        url: "https://www.taxheaven.gr/law/5307/2026",
        kind: "reproduction",
        caveat: {
          en: "Read on 5 September 2026 as a table of contents in full, article by article, to establish what the law does not touch. Art. 179 amends art. 144 on EU long-term resident status, and only in respect of beneficiaries of international protection; its wording was read in the ministry's published bill. Arts. 95, 100, 100Α and 79Α are untouched.",
          ru: "Прочитано 5 сентября 2026 года целиком как оглавление, статья за статьёй, чтобы установить, чего закон не трогает. Статья 179 меняет статью 144 о статусе долгосрочного резидента ЕС и только в части получателей международной защиты; её текст прочитан в опубликованном министерством законопроекте. Статьи 95, 100, 100Α и 79Α не затронуты.",
          pl: "Przeczytane 5 września 2026 w całości jako spis treści, artykuł po artykule, aby ustalić, czego ustawa nie dotyka. Artykuł 179 zmienia artykuł 144 o statusie rezydenta długoterminowego UE i wyłącznie w zakresie beneficjentów ochrony międzynarodowej; jego brzmienie przeczytano w opublikowanym przez ministerstwo projekcie. Artykuły 95, 100, 100Α i 79Α są nietknięte.",
        },
      },
      {
        id: "l4172-art-5a",
        citation: "Law 4172/2013, art. 5A (non-dom)",
        url: "https://www.taxheaven.gr/law/4172/2013/arthro/5%CE%91",
        kind: "reproduction",
      },
      {
        id: "kya-214926-2025",
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
        id: "l5038-art-95",
        citation:
          "Law 5038/2023, art. 95 — family members, as amended by art. 29 of Law 5275/2026 (ΦΕΚ Α΄ 17/06.02.2026)",
        url: "https://www.taxheaven.gr/law/5275/2026/arthro/29",
        kind: "reproduction",
      },
      {
        id: "l5038-arts-143-145",
        citation:
          "Law 5038/2023, arts. 143–145 — EU long-term resident status (Μ.1)",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/144",
        kind: "reproduction",
      },
      {
        id: "l5038-art-160",
        citation:
          "Law 5038/2023, art. 160 — proof of Greek, as amended by art. 37 of Law 5275/2026",
        url: "https://www.taxheaven.gr/law/5275/2026/arthro/37",
        kind: "reproduction",
      },
      {
        id: "l5038-art-161",
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
        id: "l5038-art-163",
        citation:
          "Law 5038/2023, art. 163 §8 — the permit for holders of sufficient resources (type Ι.8)",
        url: "https://www.taxheaven.gr/law/5038/2023/arthro/163",
        kind: "reproduction",
      },
      {
        id: "kya-225679-2024",
        citation:
          "KYA 225679/2024 — the €3,500 a month, ΦΕΚ Β΄ 5223/17.09.2024",
        url: "https://migration.gov.gr/wp-content/uploads/2024/10/3_%CE%9A%CE%A5%CE%91-%CE%95%CF%80%CE%B1%CF%81%CE%BA%CF%8E%CE%BD-%CF%80%CF%8C%CF%81%CF%89%CE%BD.pdf",
        kind: "official",
      },
      {
        id: "l4172-art-5b",
        citation: "Law 4172/2013, art. 5B — the 7% rate for foreign pensioners",
        url: "https://www.taxheaven.gr/law/4172/2013/arthro/5%CE%92",
        kind: "reproduction",
      },
      {
        id: "l4172-art-5c",
        citation:
          "Law 4172/2013, art. 5C — the 50% exemption for relocating employees and self-employed",
        url: "https://www.taxheaven.gr/law/4172/2013/arthro/5%CE%93",
        kind: "reproduction",
      },
      {
        id: "aade-5a-5b-5c",
        citation:
          "AADE — the three regimes of arts. 5A, 5B and 5C, with their implementing decisions",
        url: "https://www.aade.gr/sites/default/files/2023-08/forologika_kinitra_proselkysis_f.katoikiwn.pdf",
        kind: "official",
      },
      {
        id: "suspension-2022-02",
        citation:
          "Ministry of Migration and Asylum — suspension of investment permits for citizens of the Russian Federation, 28 February 2022",
        url: "https://migration.gov.gr/en/anastoli-ekdosis-i-ananeosis-adeion-diamonis-ependytikoy-skopoy-gia-polites-tis-rosikis-omospondias-mechri-neoteras/",
        kind: "official",
      },
      {
        id: "suspension-2022-04",
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
        id: "directive-2003-109",
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
        id: "recommendation-2022-2028",
        citation:
          "Commission Recommendation C(2022) 2028 final of 28 March 2022 — investor citizenship and residence schemes",
        url: "https://data.consilium.europa.eu/doc/document/ST-7916-2022-INIT/en/pdf",
        kind: "official",
      },
      {
        id: "kya-8934-2026",
        citation:
          "KYA 8934/2026 — the minimum wage from 1 April 2026, ΦΕΚ Β΄ 1759/27.03.2026",
        url: "https://www.forin.gr/articles/article/89767/kua-8934-2026",
        kind: "reproduction",
      },
      {
        id: "stegasi",
        citation: "stegasi.gov.gr — the raised thresholds",
        url: "https://stegasi.gov.gr/programs/afxisi-oriou-elachistis-ependysis-se-akinita-gia-apoktisi-golden-visa/",
        kind: "official",
      },
      {
        id: "aade-transfer-tax",
        citation: "AADE — real estate transfer tax",
        url: "https://www.aade.gr/en/greeks-abroad-non-residents/property-taxation/real-estate-transfer-tax",
        kind: "official",
      },
      {
        id: "uk-gr-dtc-1953",
        citation:
          "UK-Greece Double Taxation Convention, signed 25 June 1953, in force 15 January 1954 (SI 1954 No. 142)",
        url: "https://www.gov.uk/government/publications/greece-tax-treaties/1953-uk-greece-double-taxation-convention-in-force",
        kind: "official",
      },
      {
        id: "hmrc-dt8250",
        citation: "HMRC DT8250 — Greece: agreements in force",
        url: "https://www.gov.uk/hmrc-internal-manuals/double-taxation-relief/dt8250",
        kind: "official",
      },
      {
        id: "hmrc-dt8252",
        citation: "HMRC DT8252 — Greece: treaty summary (no dividend Article)",
        url: "https://www.gov.uk/hmrc-internal-manuals/double-taxation-relief/dt8252",
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
          en: "Whether the MPRP regulations state an income requirement",
          ru: "Есть ли в правилах MPRP требование к доходу",
          pl: "Czy przepisy MPRP stawiają wymóg dochodu",
        },
        verdict: "corrected",
        checked: "2026-09-05",
        finding: {
          en: "This site said the regulations name no income requirement at all. They name no FIGURE, which is a different sentence. The word «income» does not appear in S.L. 217.26 — but regulation 15(1)(d) requires the applicant to be «in receipt of stable and regular resources which are sufficient to maintain himself and his dependants without recourse to the social assistance system of Malta». That is a means test, unquantified: no amount, no formula, no wage or poverty line to compute it from. So Malta asks about income and publishes no number, and any page printing a euro «MPRP income requirement» is printing something the law does not contain.",
          ru: "Сайт утверждал, что в правилах вообще нет требования к доходу. Нет ЦИФРЫ — а это другое утверждение. Слово «income» в S.L. 217.26 не встречается, но правило 15(1)(d) требует, чтобы заявитель «располагал стабильными и регулярными средствами, достаточными для содержания себя и иждивенцев без обращения к системе социальной помощи Мальты». Это проверка достаточности средств, и она не оцифрована: ни суммы, ни формулы, ни зарплаты или черты бедности, от которых её можно было бы посчитать. То есть Мальта о доходе спрашивает и числа не публикует, а любая страница с евровым «требованием к доходу MPRP» печатает то, чего в законе нет.",
          pl: "Ta strona twierdziła, że przepisy w ogóle nie stawiają wymogu dochodu. Nie podają LICZBY — a to inne zdanie. Słowo «income» w S.L. 217.26 nie występuje, ale przepis 15(1)(d) wymaga, by wnioskodawca «dysponował stabilnymi i regularnymi środkami wystarczającymi na utrzymanie siebie i osób zależnych bez korzystania z systemu pomocy społecznej Malty». To test wystarczalności środków i nie jest zliczbowany: ani kwoty, ani wzoru, ani płacy czy progu ubóstwa, od których dałoby się go policzyć. Malta więc o dochód pyta i liczby nie publikuje, a każda strona drukująca eurowy «wymóg dochodowy MPRP» drukuje coś, czego w ustawie nie ma.",
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
      {
        subject: {
          en: "What does it cost to live in Malta?",
          ru: "Сколько стоит жить на Мальте?",
          pl: "Ile kosztuje życie na Malcie?",
        },
        verdict: "added",
        checked: "2026-09-07",
        finding: {
          en: "Two answers, and one of them is an absence. RENT is measured well: private residential leases must be registered with the Housing Authority since 1 January 2020, and 60,339 contracts were active at the end of 2023. The Central Bank of Malta put the median rent on a lease NEWLY SIGNED in 2023 at €850 a month, against advertised medians of €1,400 on Facebook Marketplace and €1,500 across aggregated agency listings — but the sets differ, 44% of registered lets having three or more bedrooms against 53% of agency listings, and the register also contains renewals whose rent has not moved. EVERYTHING ELSE is not measured currently: NSO's last completed Household Budget Survey covers 2015–2016. The next was collected from November 2024 to December 2025 and is due to be published before the end of 2026. Prices, as opposed to spending, are monthly: HICP for March 2026 was 2.3% a year, with recreation and culture at 4.6% and restaurants and accommodation at 3.9%.",
          ru: "Два ответа, и один из них — отсутствие. АРЕНДА измеряется хорошо: частные жилые договоры с 1 января 2020 года подлежат регистрации в Housing Authority, на конец 2023 года действующих было 60 339. Центробанк Мальты дал медиану ВНОВЬ ПОДПИСАННОГО в 2023 году договора — €850 в месяц против медиан объявлений €1 400 на Facebook Marketplace и €1 500 по сводным данным агентств. Но наборы разные: у зарегистрированных три и более спальни у 44%, у агентских объявлений — у 53%, и в реестре лежат продления, где ставка не менялась. ВСЁ ОСТАЛЬНОЕ сейчас не измеряется: последнее завершённое обследование бюджетов домохозяйств NSO — за 2015–2016 годы. Следующее собирали с ноября 2024 по декабрь 2025, публикация обещана до конца 2026 года. Цены, в отличие от расходов, считают ежемесячно: HICP за март 2026 — 2,3% годовых, отдых и культура 4,6%, рестораны и размещение 3,9%.",
          pl: "Dwie odpowiedzi, a jedna z nich to brak. CZYNSZ jest mierzony dobrze: prywatne najmy mieszkaniowe od 1 stycznia 2020 podlegają rejestracji w Housing Authority, a na koniec 2023 aktywnych było 60 339 umów. Bank Centralny Malty podał medianę czynszu umowy NOWO PODPISANEJ w 2023: €850 miesięcznie, wobec median ofertowych €1 400 na Facebook Marketplace i €1 500 w zagregowanych danych agencji. Zbiory są jednak różne: wśród zarejestrowanych trzy sypialnie lub więcej ma 44%, wśród ofert agencyjnych 53%, a w rejestrze są też przedłużenia z niezmienioną stawką. CAŁA RESZTA nie jest obecnie mierzona: ostatnie zakończone badanie budżetów gospodarstw domowych NSO obejmuje lata 2015–2016. Kolejne zbierano od listopada 2024 do grudnia 2025, publikacja zapowiedziana przed końcem 2026. Ceny, w odróżnieniu od wydatków, liczy się co miesiąc: HICP za marzec 2026 to 2,3% rocznie, rekreacja i kultura 4,6%, restauracje i zakwaterowanie 3,9%.",
        },
      },
    ],
    sources: [
      {
        id: "ha-rent-report-2023h2",
        citation:
          "Housing Authority (Malta) — Rent Report, 2023 H2 update (register of private residential leases)",
        url: "https://housingauthority.gov.mt/wp-content/uploads/2024/05/Rent-Report-2023-H2-Update-Housing-Authority.pdf",
        kind: "official",
      },
      {
        id: "cbm-wp-4-2025",
        citation:
          "Central Bank of Malta, Working Paper WP/4/2025, S. Spiteri — registered against advertised rents, 2023",
        url: "https://www.centralbankmalta.org/site/Publications/Economic%20Research/2025/WP-04-2025.pdf",
        kind: "official",
      },
      {
        id: "cbm-registered-rents-2022",
        citation:
          "Central Bank of Malta, Research Bulletin 2022, B. Micallef and T. M. Gauci — registered against advertised rents",
        url: "https://www.centralbankmalta.org/site/Reports-Articles/2022/Registered-Rents.pdf",
        kind: "official",
      },
      {
        id: "nso-hbs",
        citation:
          "NSO Malta — Household Budget Survey: last completed 2015–2016, next due before the end of 2026",
        url: "https://nso.gov.mt/the-household-budget-survey-hbs-explained/",
        kind: "official",
      },
      {
        id: "nso-hicp-2026-03",
        citation: "NSO Malta — Harmonised Index of Consumer Prices, March 2026 (released 16 April 2026)",
        url: "https://nso.gov.mt/harmonised-index-of-consumer-prices-hicp-march-2026/",
        kind: "official",
      },
      {
        id: "sl-217-26",
        citation: "S.L. 217.26, as amended by L.N. 310/2024 and L.N. 146/2025",
        url: "https://residencymalta.gov.mt/wp-content/uploads/2025/08/S.L.217.26-Amended-by-LN-310-of-2024_-LN-146-of-2025.pdf",
        kind: "official",
      },
      {
        id: "c-181-23",
        citation:
          "Case C-181/23, Commission v Malta — Court of Justice, Grand Chamber, judgment of 29 April 2025",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A62023CJ0181",
        kind: "official",
      },
      {
        id: "act-xxi-2025",
        citation:
          "Maltese Citizenship (Amendment) Act, Act XXI of 2025 — Government Gazette 21,474 of 24 July 2025, substituting art. 10(9) of Cap. 188",
        url: "https://legislation.mt/eli/act/2025/21/eng",
        kind: "official",
      },
      {
        id: "ln-159-2025",
        citation:
          "L.N. 159 of 2025 — Government Gazette 21,478 of 29 July 2025, retitling S.L. 188.06 as the Granting of Citizenship by Naturalisation on the Basis of Merit Regulations and deleting Part IV with the Second and Third Schedules",
        url: "https://legislation.mt/eli/ln/2025/159/eng",
        kind: "official",
        caveat: {
          en: "Read 5 September 2026 together with the consolidated S.L. 188.06: no contribution, investment, property or fee amount survives anywhere in the regulations. The Community Malta Agency's own services page nonetheless still published the deleted direct-investment route and its figures — €600,000 and €750,000, €700,000 of property or €16,000 of rent, a €10,000 donation — under update stamps as recent as February 2026 and with no notice of closure. The instrument governs; the page is stale.",
          ru: "Прочитано 5 сентября 2026 года вместе со сводным текстом S.L. 188.06: ни одной суммы взноса, инвестиции, недвижимости или сбора в регламенте не осталось. При этом на собственной странице услуг Community Malta Agency по-прежнему опубликован удалённый маршрут за прямую инвестицию с суммами — 600 000 и 750 000 евро, 700 000 евро недвижимости или 16 000 евро аренды, пожертвование 10 000 евро — с отметками обновления вплоть до февраля 2026 года и без уведомления о закрытии. Действует акт; страница устарела.",
          pl: "Przeczytane 5 września 2026 wraz z tekstem ujednoliconym S.L. 188.06: w rozporządzeniu nie pozostała żadna kwota wkładu, inwestycji, nieruchomości ani opłaty. Mimo to własna strona usług Community Malta Agency nadal publikuje usuniętą ścieżkę inwestycji bezpośredniej wraz z kwotami — 600 000 i 750 000 euro, 700 000 euro nieruchomości albo 16 000 euro najmu, darowizna 10 000 euro — ze znacznikami aktualizacji sięgającymi lutego 2026 i bez informacji o zamknięciu. Obowiązuje akt; strona jest nieaktualna.",
        },
      },
      {
        id: "ln-146-2025",
        citation: "L.N. 146 of 2025",
        url: "https://residencymalta.gov.mt/wp-content/uploads/2025/07/L.N-146-of-2025.pdf",
        kind: "official",
      },
      {
        id: "rma-handbook",
        citation: "Residency Malta — agents' handbook v4.0, 28 January 2025",
        url: "https://residencymalta.gov.mt/wp-content/uploads/2025/02/3926-RM-Amends-to-2253-Agents-Handbook-Final-Jan-25.pdf",
        kind: "official",
      },
      {
        id: "mtca-remittance",
        citation: "MTCA — guidelines on the remittance basis",
        url: "https://mtca.gov.mt/docs/default-source/documents/mtca-guidelines-on-the-remittance-under-the-income-tax.pdf",
        kind: "official",
      },
      {
        id: "mtca-property",
        citation: "MTCA — buying property",
        url: "https://mtca.gov.mt/personal-tax/property-taxes/buying-property",
        kind: "official",
      },
      {
        id: "rma-nomad-faq",
        citation: "Residency Malta — Nomad Residence Permit FAQ v14.1, 17 April 2026",
        url: "https://nomad.residencymalta.gov.mt/new-faqs/",
        kind: "official",
      },
      {
        id: "mtca-tax-residence",
        citation: "MTCA — tax residence",
        url: "https://mtca.gov.mt/personal-tax/individual/tax-residence",
        kind: "official",
      },
      {
        id: "sl-123-210",
        citation: "MTCA — Nomad Residence Permits (Income Tax) Rules, S.L. 123.210, guidelines of 12 March 2026",
        url: "https://mtca.gov.mt/docs/default-source/documents/personal-tax/legal-and-technical/guidelines/nomad-guidelines---12-03-2026.pdf",
        kind: "official",
      },
      {
        id: "rma-mprp-framework",
        citation: "Residency Malta — legal framework, MPRP",
        url: "https://residencymalta.gov.mt/legal-framework-mprp-2/",
        kind: "official",
      },
      {
        id: "sl-217-26-consolidated",
        citation: "S.L. 217.26 on the legislation portal — consolidated 22 July 2025",
        url: "https://legislation.mt/eli/sl/217.26/eng",
        kind: "official",
      },
      {
        id: "uk-mt-dtc-1994",
        citation:
          "UK-Malta Double Taxation Convention, signed 12 May 1994, in force 27 March 1995",
        url: "https://www.gov.uk/government/publications/malta-tax-treaties/1994-uk-malta-double-taxation-convention-in-force",
        kind: "official",
      },
      {
        id: "si-1995-763",
        citation:
          "Double Taxation Relief (Taxes on Income) (Malta) Order 1995, SI 1995 No. 763 — schedule text of arts. 4, 18 and 23",
        url: "https://www.legislation.gov.uk/uksi/1995/763/made",
        kind: "official",
      },
      {
        id: "uk-mt-mli-synthesised",
        citation:
          "Synthesised text of the MLI and the 1994 UK-Malta convention — effect from 2020",
        url: "https://www.gov.uk/government/publications/malta-tax-treaties/synthesised-text-of-the-multilateral-instrument-and-the-1994-uk-malta-double-taxation-convention",
        kind: "official",
      },
      {
        id: "hmrc-dt12906",
        citation:
          "HMRC DT12906 — Malta: notes, including the phrase omitted from the published SI text",
        url: "https://www.gov.uk/hmrc-internal-manuals/double-taxation-relief/dt12906",
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
        id: "fdl-29-2021",
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
        id: "cr-65-2022",
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
        id: "cd-85-2022",
        citation:
          "Cabinet Decision No. 85 of 2022 on Determination of Tax Residency, art. 4 — in force 01.03.2023",
        url: "https://tax.gov.ae/Datafolder/Files/Legislation/Corporate%20Tax/Cabinet%20Decision%2085%20of%202022%20-%20For%20publishing.pdf",
        kind: "official",
      },
      {
        id: "md-27-2023",
        citation:
          "Ministerial Decision No. 27 of 2023, arts. 3 to 6 — how days, homes and employment are counted",
        url: "https://mof.gov.ae/wp-content/uploads/2023/03/Ministerial-Decision-27-of-2023-of-Tax-Residency.pdf",
        kind: "official",
      },
      {
        id: "cd-49-2023",
        citation:
          "Cabinet Decision No. 49 of 2023, art. 2 — the AED 1,000,000 turnover test for a natural person, and the licence-based exclusions",
        url: "https://mof.gov.ae/wp-content/uploads/2023/05/Cabinet-Decision-No.-49-of-2023.pdf",
        kind: "official",
      },
      {
        id: "cd-116-2022",
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
        id: "icp-long-absence",
        citation: "ICP — entry after a long absence, and who is exempt",
        url: "https://icp.gov.ae/en/services-details/?serviceid=68e352d65ae59b00117383fc",
        kind: "official",
      },
      {
        id: "dld-taskeen",
        citation: "DLD — Investor Residence application (Taskeen), the two-year permit",
        url: "https://dubailand.gov.ae/en/eservices/request-for-investor-visa/",
        kind: "official",
      },
      {
        id: "dld-golden-investor",
        citation: "DLD — Request for Golden Visa (Investor)",
        url: "https://dubailand.gov.ae/en/eservices/request-for-golden-visa-investor/",
        kind: "official",
      },
      {
        id: "dld-golden-retired",
        citation: "DLD — Request for Golden Visa (Retired)",
        url: "https://dubailand.gov.ae/en/eservices/request-for-golden-visa-retired/",
        kind: "official",
      },
      {
        id: "gdrfa-golden",
        citation: "GDRFA — issuing a golden residence permit (investors)",
        url: "https://www.gdrfad.gov.ae/en/services/8ea80da4-f43e-11eb-0320-0050569629e8",
        kind: "official",
      },
      {
        id: "icp-entry-permit",
        citation: "ICP — entry permit service",
        url: "https://icp.gov.ae/en/services-details/?serviceid=68e34eea5ae59b00117383d5",
        kind: "official",
      },
      {
        id: "uae-taxation",
        citation: "u.ae — taxation",
        url: "https://u.ae/en/information-and-services/finance-and-investment/taxation",
        kind: "official",
      },
      // ADDED 28 AUGUST 2026, with the correction to the cost finding above.
      // The 4% registration fee had been described here as market practice
      // that no official page confirmed. It is set by a published instrument,
      // and this is that instrument — item 1 of its schedule.
      {
        id: "ecr-30-2013",
        citation:
          "Executive Council Resolution 30 of 2013 — fees of the Land Department",
        url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html",
        kind: "official",
      },
      {
        id: "dld-sale-fees",
        citation: "DLD — property sale registration, fees and trustee charges",
        url: "https://dubailand.gov.ae/en/eservices/property-sale-registration/",
        kind: "official",
      },
      // A SOURCE FOR AN ABSENCE, cited like any other claim: this is where DLD
      // says a broker's commission follows the agreement and, failing that,
      // prevailing custom. It is what lets the finding say the 2% rests on
      // nothing official, rather than that we looked and did not find it.
      {
        id: "dld-broker-commission",
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
        checked: "2026-09-07",
        finding: {
          en: "Lei Orgânica 1/2026 (Diário da República, 18 May 2026, in force from 19 May) rewrote art. 6(1)(b) of Lei 37/81: seven years for nationals of Portuguese-speaking countries and of the EU, ten years for everybody else. Plus an examination in the language and in culture, history and state symbols, and a solemn declaration of adherence to the rule of law. It is not retroactive — applications filed before it came into force are decided under the previous text (art. 7(2)). And art. 5 of the same law REPEALS art. 15(4) of Lei 37/81, the paragraph inserted by Lei Orgânica 1/2024 that made time in the residence-permit queue count once the permit was granted. So there are two regimes: a file pending on 19 May 2026 still counts from the date the permit was REQUESTED; after that date what remains is art. 15(1), lawful presence under any title, visa or authorisation — which no longer reaches back over a queue that can run one to three years.",
          ru: "Lei Orgânica 1/2026 (Diário da República, 18 мая 2026 года, в силе с 19 мая) переписала ст. 6(1)(b) Lei 37/81: семь лет для граждан португалоязычных стран и ЕС, десять лет для всех остальных. Плюс экзамен по языку и по культуре, истории и государственным символам, плюс торжественная декларация о приверженности принципам правового государства. Обратной силы нет: дела, поданные до вступления в силу, решаются по прежней редакции (ст. 7(2)). И ст. 5 того же закона ОТМЕНЯЕТ ст. 15(4) Lei 37/81 — пункт, внесённый Lei Orgânica 1/2024, по которому время ожидания вида на жительство засчитывалось задним числом после его выдачи. Отсюда два режима: по делу, поданному до 19 мая 2026 года, срок по-прежнему идёт с даты подачи заявления на ВНЖ; после этой даты остаётся ст. 15(1) — законное присутствие по любому титулу, визе или разрешению, и очередь длиной от года до трёх лет в срок больше не попадает.",
          pl: "Lei Orgânica 1/2026 (Diário da República, 18 maja 2026, w mocy od 19 maja) przepisała art. 6(1)(b) Lei 37/81: siedem lat dla obywateli krajów portugalskojęzycznych i UE, dziesięć lat dla pozostałych. Plus egzamin z języka oraz z kultury, historii i symboli państwowych, plus uroczysta deklaracja przywiązania do zasad państwa prawa. Bez mocy wstecznej: sprawy złożone przed wejściem w życie rozstrzyga się według poprzedniego brzmienia (art. 7(2)). A art. 5 tej samej ustawy UCHYLA art. 15(4) Lei 37/81 — ustęp wprowadzony przez Lei Orgânica 1/2024, dzięki któremu czas oczekiwania na zezwolenie na pobyt liczył się wstecz po jego wydaniu. Stąd dwa reżimy: w sprawie zawisłej 19 maja 2026 okres nadal biegnie od daty ZŁOŻENIA wniosku o pobyt; po tej dacie zostaje art. 15(1), czyli legalna obecność na podstawie dowolnego tytułu, wizy lub zezwolenia — a kolejka trwająca od roku do trzech lat już się nie liczy.",
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
          en: "Three tiers, not one number — read at the Ministry of the Interior's consolidated text on 8 September 2026, and no page in this market prints more than the middle one. THREE continuous years under art. 5(1)(δ) for four categories only: nationals of an EU member state, a spouse of a Greek WITH a child, anyone with parental custody of a Greek-national child born in Greece, and stateless persons. SEVEN continuous years for everybody else holding a title on the exhaustive list of art. 5(1)(ε) — the investor permit is item αθ. TWELVE continuous years under art. 5(3) for a holder of any other valid title, temporary ones excepted. The examination is art. 5Α, not art. 5, and it names no CEFR level. And the Code requires ACTUAL residence while the golden visa requires no minimum stay, so holding the permit does not by itself accumulate the period.",
          ru: "Три яруса, а не одно число — прочитано в сводном тексте министерства внутренних дел 8 сентября 2026 года, и ни одна страница рынка не печатает больше среднего. ТРИ непрерывных года по ст. 5(1)(δ) для четырёх категорий: граждане государств ЕС, супруг грека или гречанки С РЕБЁНКОМ, имеющие родительскую опеку над ребёнком-греком, рождённым в Греции, и апатриды. СЕМЬ непрерывных лет для всех остальных с титулом из закрытого перечня ст. 5(1)(ε) — инвесторское разрешение там под αθ. ДВЕНАДЦАТЬ непрерывных лет по ст. 5(3) при любом другом действующем титуле, кроме временных. Экзамен — это ст. 5Α, а не ст. 5, и уровня по общеевропейской шкале она не называет. И кодекс требует фактического проживания, а золотая виза минимального пребывания не требует: само по себе разрешение срок не копит.",
          pl: "Trzy progi, a nie jedna liczba — odczytane w tekście jednolitym greckiego MSW 8 września 2026, i żadna strona na tym rynku nie drukuje więcej niż środkowy. TRZY nieprzerwane lata z art. 5(1)(δ) dla czterech kategorii: obywatele państw członkowskich UE, małżonek Greka lub Greczynki Z DZIECKIEM, osoby sprawujące pieczę nad dzieckiem o obywatelstwie greckim urodzonym w Grecji oraz bezpaństwowcy. SIEDEM nieprzerwanych lat dla pozostałych z tytułem z zamkniętej listy art. 5(1)(ε) — zezwolenie inwestorskie jest tam pod αθ. DWANAŚCIE nieprzerwanych lat z art. 5(3) przy każdym innym ważnym tytule poza tymczasowymi. Egzamin to art. 5Α, nie art. 5, i nie podaje poziomu CEFR. A Kodeks wymaga FAKTYCZNEGO pobytu, podczas gdy złota wiza nie wymaga minimalnego — samo zezwolenie okresu nie kumuluje.",
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
        id: "lei-organica-1-2026",
        citation: "Lei Orgânica 1/2026 — Diário da República, 18 May 2026",
        url: "https://files.diariodarepublica.pt/1s/2026/05/09500/0000200020.pdf",
        kind: "official",
      },
      {
        id: "lei-organica-1-2024",
        citation:
          "Lei Orgânica 1/2024 — Diário da República, 5 March 2024 (art. 15(4), repealed 19 May 2026)",
        url: "https://files.diariodarepublica.pt/1s/2024/03/04600/0000200019.pdf",
        kind: "official",
      },
      {
        id: "pt-promulgation",
        citation: "Presidency of Portugal — promulgation, 3 May 2026",
        url: "https://www.presidencia.pt/atualidade/toda-a-atualidade/2026/05/presidente-da-republica-promulga-decreto-da-assembleia-da-republica/",
        kind: "official",
      },
      {
        id: "l3284-2004",
        citation:
          "Greek Citizenship Code (Law 3284/2004), Ministry of the Interior",
        url: "https://www.ypes.gr/kodikas-ellinikis-ithageneias/",
        kind: "official",
      },
      {
        id: "act-xxi-2025",
        citation: "Act XXI of 2025 (Malta)",
        url: "https://legislation.mt/eli/act/2025/21/eng",
        kind: "official",
      },
      {
        id: "sl-188-06",
        citation: "S.L. 188.06 — naturalisation on the basis of merit",
        url: "https://komunita.gov.mt/wp-content/uploads/2026/02/Citizenship-by-Naturalisation-on-the-Basis-of-Merit.pdf",
        kind: "official",
      },
      {
        id: "uae-nationality",
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
  // --- Poland: residence for people already living there ---------------------
  //
  // NOT A JURISDICTION OF THE COMPARISON, and the heading and note say so on the
  // page. These rows back a section for readers who already live in Poland and
  // need a karta pobytu, permanent residence or citizenship — decided 14 Sep
  // 2026, see CLAUDE.md. They are here rather than in a file of their own
  // because the rule that every figure on a page stands on this page applies to
  // them exactly as it does to Portugal.
  //
  // Every row was read in the text of the act in Dziennik Ustaw or Monitor
  // Polski, fetched from the Sejm's ELI API, on 14 September 2026. Two official
  // pages are cited as well, and one of them is cited BECAUSE it is wrong: the
  // UdSC page on the suspension of time limits still named 4 March 2026 after
  // the act had moved the date to 2027. The working, including the reading that
  // page misled for half a day, is archive/poland-legalisation-verification-2026-09-14.md.
  {
    key: "pl-legal",
    heading: {
      en: "Poland: residence, property and daily life for people already living there",
      ru: "Польша: пребывание, недвижимость и повседневные дела для тех, кто уже там живёт",
      pl: "Polska: pobyt, nieruchomości i sprawy codzienne osób już tu mieszkających",
    },
    claims: [
      {
        subject: {
          en: "Time limits in residence cases at the voivode are suspended until 4 March 2027",
          ru: "Сроки по делам о пребывании у воеводы приостановлены до 4 марта 2027 года",
          pl: "Terminy w sprawach pobytowych u wojewody są zawieszone do 4 marca 2027",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 100d of the Act of 12 March 2022 on assistance to citizens of Ukraine: time limits for granting, changing and withdrawing temporary residence, permanent residence and EU long-term resident permits in proceedings before the voivode do not start, and those started are suspended. The inactivity rules do not apply, the authority is neither fined nor ordered to pay sums to complainants (ust. 3), and a delay in that period cannot ground any legal remedy for inactivity, protraction or breach of the right to have a case heard without undue delay — not only a ponaglenie (ust. 4). The date was 30 September 2025, moved to 4 March 2026 by Dz.U. 2025 poz. 1301 art. 10 pkt 1, and to 4 March 2027 by Dz.U. 2026 poz. 203 art. 17 pkt 50, in force since 5 March 2026 (art. 54). The article speaks of any foreigner, not only citizens of Ukraine. The UdSC page on this suspension still named 4 March 2026 when read on 14 September 2026.",
          ru: "Ст. 100d закона от 12 марта 2022 года о помощи гражданам Украины: сроки на выдачу, изменение и отзыв разрешений на временное и постоянное пребывание и статуса резидента ЕС в производствах у воеводы не начинаются, а начатые приостанавливаются. Нормы о бездействии не применяются, органу не назначают штраф и не присуждают сумм в пользу жалобщиков (ч. 3), а задержка в этот период не может быть основанием никаких правовых средств против бездействия, затягивания или нарушения права на рассмотрение дела без лишней задержки — не только ponaglenie (ч. 4). Дата была 30 сентября 2025 года, заменена на 4 марта 2026 года законом Dz.U. 2025 poz. 1301, ст. 10 п. 1, и на 4 марта 2027 года законом Dz.U. 2026 poz. 203, ст. 17 п. 50, в силе с 5 марта 2026 года (ст. 54). Статья говорит о любом иностранце, а не только о гражданах Украины. Страница UdSC об этой приостановке на 14 сентября 2026 года всё ещё называла 4 марта 2026 года.",
          pl: "Art. 100d ustawy z 12 marca 2022 o pomocy obywatelom Ukrainy: terminy na udzielenie, zmianę i cofnięcie zezwoleń na pobyt czasowy, stały i rezydenta długoterminowego UE w postępowaniach u wojewody nie rozpoczynają się, a rozpoczęte ulegają zawieszeniu. Przepisów o bezczynności nie stosuje się, organowi nie wymierza się grzywny ani nie zasądza się od niego sum pieniężnych (ust. 3), a zwłoka w tym okresie nie może być podstawą żadnych środków prawnych dotyczących bezczynności, przewlekłości lub naruszenia prawa do rozpoznania sprawy bez zbędnej zwłoki — nie tylko ponaglenia (ust. 4). Data brzmiała 30 września 2025, zmieniona na 4 marca 2026 ustawą Dz.U. 2025 poz. 1301 art. 10 pkt 1 i na 4 marca 2027 ustawą Dz.U. 2026 poz. 203 art. 17 pkt 50, w mocy od 5 marca 2026 (art. 54). Przepis mówi o każdym cudzoziemcu, nie tylko o obywatelach Ukrainy. Strona UdSC o tym zawieszeniu 14 września 2026 wciąż podawała 4 marca 2026.",
        },
      },
      {
        subject: {
          en: "Ponaglenie, the 14-day appeal and the body that hears both",
          ru: "Ponaglenie, 14 дней на жалобу и орган, который их рассматривает",
          pl: "Ponaglenie, 14 dni na odwołanie i organ, który je rozpatruje",
        },
        verdict: "added",
        checked: "2026-09-14",
        finding: {
          en: "Code of Administrative Procedure, consolidated Dz.U. 2025 poz. 1691: a case needing inquiry within a month, a particularly complex one within two (art. 35 § 3); a ponaglenie for inactivity or protraction goes to the higher body through the one conducting the case, and one filed before the time limit expires is left unexamined (art. 37); an unremedied formal defect leaves an application unexamined, on at least 7 days' notice (art. 64 § 2); an appeal lies within 14 days of service (art. 127, 129). The higher body for a voivode in these cases is the head of UdSC, art. 22 ust. 2 of the Act on Foreigners. The special limit for a temporary residence decision is 60 days, art. 112a, counted since 27 April 2026 from a complete application or from the documents the voivode requested.",
          ru: "Кодекс административного производства, сводный текст Dz.U. 2025 poz. 1691: дело, требующее выяснения, — за месяц, особенно сложное — за два (ст. 35 § 3); ponaglenie на бездействие или затягивание подаётся в вышестоящий орган через ведущий дело, а поданное до истечения срока оставляется без рассмотрения (ст. 37); неустранённый формальный недостаток оставляет заявление без рассмотрения, срок на устранение не меньше 7 дней (ст. 64 § 2); жалоба — в течение 14 дней со дня доставки (ст. 127, 129). Вышестоящий орган для воеводы в этих делах — руководитель UdSC, ст. 22 ч. 2 закона об иностранцах. Специальный срок решения о временном пребывании — 60 дней, ст. 112a, с 27 апреля 2026 года считается от полного заявления или от документов, которые затребовал воевода.",
          pl: "Kodeks postępowania administracyjnego, tekst jednolity Dz.U. 2025 poz. 1691: sprawa wymagająca postępowania wyjaśniającego w ciągu miesiąca, szczególnie skomplikowana w ciągu dwóch (art. 35 § 3); ponaglenie na bezczynność lub przewlekłość wnosi się do organu wyższego stopnia za pośrednictwem organu prowadzącego, a wniesione przed upływem terminu pozostawia się bez rozpoznania (art. 37); nieusunięcie braków formalnych w terminie nie krótszym niż 7 dni skutkuje pozostawieniem podania bez rozpoznania (art. 64 § 2); odwołanie w terminie 14 dni od doręczenia (art. 127, 129). Organem wyższego stopnia wobec wojewody jest Szef UdSC, art. 22 ust. 2 ustawy o cudzoziemcach. Termin szczególny dla decyzji o pobycie czasowym to 60 dni, art. 112a, liczony od 27 kwietnia 2026 od kompletnego wniosku lub dokumentów wezwanych przez wojewodę.",
        },
      },
      {
        subject: {
          en: "Stay is lawful while a temporary residence application is pending",
          ru: "Пребывание законно, пока рассматривается заявление о временном пребывании",
          pl: "Pobyt jest legalny w trakcie postępowania o zezwolenie na pobyt czasowy",
        },
        verdict: "added",
        checked: "2026-09-14",
        finding: {
          en: "If the application is filed no later than the last day of lawful stay (art. 105 ust. 1 as amended by Dz.U. 2025 poz. 1794) and has no formal defects or they were remedied in time, stay is lawful from filing until the decision becomes final, which includes an appeal (art. 108 ust. 1 pkt 2). Not while the proceedings are suspended at the party's own request (art. 108 ust. 2). Since 27 April 2026 the passport stamp is replaced by an electronic zaświadczenie with a QR code, delivered through MOS and free of charge (art. 108 ust. 1 pkt 1 and ust. 3–6 as amended). Summonses: personal appearance on at least 7 days' notice (art. 106e), documents on at least 14 (art. 106f).",
          ru: "Если заявление подано не позже последнего дня законного пребывания (ст. 105 ч. 1 в редакции Dz.U. 2025 poz. 1794) и в нём нет формальных недостатков или они устранены в срок, пребывание законно со дня подачи до дня, когда решение станет окончательным, включая обжалование (ст. 108 ч. 1 п. 2). Но не на время приостановки производства по просьбе самой стороны (ст. 108 ч. 2). С 27 апреля 2026 года штамп в паспорте заменён электронным zaświadczenie с QR-кодом, через MOS и бесплатно (ст. 108 ч. 1 п. 1 и ч. 3–6 в новой редакции). Вызовы: личная явка — не раньше чем через 7 дней (ст. 106e), документы — не меньше 14 дней (ст. 106f).",
          pl: "Jeżeli wniosek złożono nie później niż w ostatnim dniu legalnego pobytu (art. 105 ust. 1 w brzmieniu Dz.U. 2025 poz. 1794) i nie zawiera braków formalnych lub uzupełniono je w terminie, pobyt jest legalny od dnia złożenia wniosku do dnia, w którym decyzja stanie się ostateczna, a więc także w toku odwołania (art. 108 ust. 1 pkt 2). Nie w razie zawieszenia postępowania na wniosek strony (art. 108 ust. 2). Od 27 kwietnia 2026 stempel w paszporcie zastępuje elektroniczne zaświadczenie z kodem QR, doręczane przez MOS, bez opłaty (art. 108 ust. 1 pkt 1 i ust. 3–6 w nowym brzmieniu). Wezwania: osobiste stawiennictwo w terminie nie krótszym niż 7 dni (art. 106e), dokumenty — nie krótszym niż 14 dni (art. 106f).",
        },
      },
      // CORRECTED, AND THE ERROR WAS OURS. The first version of the Russian
      // entry on waiting, published on the morning of 15 September 2026, said
      // the voivode sends summonses through MOS and told readers to keep
      // checking MOS. No provision says so, and MOS's own page says the portal
      // does not handle an application after it is filed. The row says what
      // was wrong rather than quietly carrying the right answer.
      {
        subject: {
          en: "Where summonses arrive, and when an uncollected letter counts as delivered",
          ru: "Куда приходят вызовы и когда непринятое письмо считается доставленным",
          pl: "Dokąd trafiają wezwania i kiedy nieodebrane pismo uznaje się za doręczone",
        },
        verdict: "corrected",
        checked: "2026-09-15",
        finding: {
          en: "This row corrects our own entry of 15 September 2026, which said summonses come through MOS. MOS delivers only the zaświadczenie confirming the application (art. 108 ust. 6 of the Act on Foreigners as amended by Dz.U. 2025 poz. 1794), and the official MOS page says the portal does not currently handle the application any further. Summonses are served under the Code: to an electronic delivery address, or failing one by registered post (art. 39 KPA). A letter not collected from the post office counts as delivered on the last day of 14 days' storage (art. 44 § 4 KPA); an electronic one not opened within 14 days counts as delivered the day after (art. 41 ust. 1 pkt 3 and art. 42 ust. 2 of the Act on electronic delivery, Dz.U. 2024 poz. 1045). A change of address must be reported, or delivery to the old one stands (art. 41 KPA). The Mazowiecki voivodeship office sends summonses, fingerprint appointments and the card collection date through e-Doręczenia.",
          ru: "Эта строка поправляет нашу же статью от 15 сентября 2026 года, где было сказано, что вызовы приходят через MOS. Через MOS доставляется только zaświadczenie о подаче (ст. 108 ч. 6 закона об иностранцах в редакции Dz.U. 2025 poz. 1794), а официальная страница MOS пишет, что дальнейшего ведения заявления портал сейчас не обеспечивает. Вызовы доставляются по кодексу: на адрес для электронных доручений, а если его нет — заказным письмом (ст. 39 KPA). Не забранное на почте письмо считается доставленным в последний день 14-дневного хранения (ст. 44 § 4 KPA); электронное, не открытое за 14 дней, — на следующий день после них (ст. 41 ч. 1 п. 3 и ст. 42 ч. 2 закона об электронных доручениях, Dz.U. 2024 poz. 1045). О смене адреса нужно сообщить органу, иначе доставка по старому адресу действительна (ст. 41 KPA). Мазовецкое воеводское управление присылает вызовы, даты явки для отпечатков и дату получения карты через e-Doręczenia.",
          pl: "Ten wiersz poprawia nasz własny wpis z 15 września 2026, według którego wezwania przychodzą przez MOS. Przez MOS doręcza się wyłącznie zaświadczenie o złożeniu wniosku (art. 108 ust. 6 ustawy o cudzoziemcach w brzmieniu Dz.U. 2025 poz. 1794), a oficjalna strona MOS podaje, że portal obecnie nie zapewnia dalszej obsługi wniosku. Wezwania doręcza się według Kodeksu: na adres do doręczeń elektronicznych, a w jego braku przesyłką rejestrowaną (art. 39 KPA). Pismo nieodebrane z placówki pocztowej uznaje się za doręczone z upływem ostatniego dnia 14-dniowego przechowania (art. 44 § 4 KPA); elektroniczne nieodebrane w ciągu 14 dni — w dniu następującym po ich upływie (art. 41 ust. 1 pkt 3 i art. 42 ust. 2 ustawy o doręczeniach elektronicznych, Dz.U. 2024 poz. 1045). Zmianę adresu trzeba zgłosić, inaczej doręczenie pod dotychczasowy adres jest skuteczne (art. 41 KPA). Mazowiecki Urząd Wojewódzki wysyła wezwania, terminy pobrania odcisków i termin odbioru karty przez e-Doręczenia.",
        },
      },
      {
        subject: {
          en: "Working while the application is pending",
          ru: "Работа, пока рассматривается заявление",
          pl: "Praca w trakcie postępowania",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 3 ust. 3 pkt 2 of the Act of 20 March 2025 on the conditions for entrusting work to foreigners, Dz.U. 2025 poz. 621, as amended by art. 11 of Dz.U. 2025 poz. 1794: a foreigner whose stay is lawful under art. 108 ust. 1 pkt 2 of the Act on Foreigners may work on a work permit or a registered declaration if entitled to work in Poland immediately before filing. Art. 3 ust. 1 pkt 18: free access to the labour market continues while waiting if the conditions of pkt 14–17 were met immediately before filing. Cases begun before 27 April 2026 keep the earlier wording, which sets the same condition (art. 12 of the amendment). Lawful stay alone is not a right to work. The rules for UKR status were not examined here.",
          ru: "Ст. 3 ч. 3 п. 2 закона от 20 марта 2025 года об условиях допустимости поручения работы иностранцам, Dz.U. 2025 poz. 621, в редакции ст. 11 Dz.U. 2025 poz. 1794: иностранец, чьё пребывание законно по ст. 108 ч. 1 п. 2 закона об иностранцах, может работать по разрешению на работу или зарегистрированному заявлению о поручении работы, если непосредственно перед подачей заявления имел право работать в Польше. Ст. 3 ч. 1 п. 18: свободный доступ к рынку труда на время ожидания сохраняется, если непосредственно перед подачей выполнялись условия п. 14–17. Для дел, начатых до 27 апреля 2026 года, действует прежняя редакция с тем же условием (ст. 12 поправки). Законность пребывания сама по себе права на работу не даёт. Правила для статуса UKR здесь не рассматривались.",
          pl: "Art. 3 ust. 3 pkt 2 ustawy z 20 marca 2025 o warunkach dopuszczalności powierzania pracy cudzoziemcom, Dz.U. 2025 poz. 621, w brzmieniu art. 11 Dz.U. 2025 poz. 1794: cudzoziemiec przebywający legalnie na podstawie art. 108 ust. 1 pkt 2 ustawy o cudzoziemcach może wykonywać pracę na podstawie zezwolenia na pracę lub oświadczenia wpisanego do ewidencji, jeżeli bezpośrednio przed złożeniem wniosku był uprawniony do pracy w Polsce. Art. 3 ust. 1 pkt 18: swobodny dostęp do rynku pracy trwa w okresie oczekiwania, jeżeli bezpośrednio przed złożeniem wniosku spełniano warunki pkt 14–17. Do spraw wszczętych przed 27 kwietnia 2026 stosuje się dotychczasowe brzmienie z tym samym warunkiem (art. 12 nowelizacji). Sam legalny pobyt nie jest prawem do pracy. Zasad dla statusu UKR tu nie badano.",
        },
      },
      {
        subject: {
          en: "Checking a case's status: which voivode, and which official services exist",
          ru: "Статус дела: какой воевода ведёт и какие есть официальные сервисы",
          pl: "Stan sprawy: który wojewoda i jakie są oficjalne usługi",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "A temporary residence permit is granted by the voivode competent for the foreigner's place of stay (art. 104 ust. 1 as amended by Dz.U. 2025 poz. 1794). Read on the offices' official sites on 15 September 2026: Poznań runs a service taking a case number and an access code the applicant can obtain alone; Opole one for applications filed after 1 January 2024, taking the date of birth and the phone number given to the office; Gdańsk and Wrocław run services on the offices' own domains whose requirements could not be read without JavaScript; the Warsaw office names its inPOL system for tracking status; Kraków's general case search excludes foreigners' cases and refers them to its INFO.OPT line. No status service was found on the official pages for Łódź, Katowice, Szczecin, Lublin or Bydgoszcz. No official glossary of status names was found. A party may inspect the case file (art. 73 KPA).",
          ru: "Разрешение на временное пребывание выдаёт воевода по месту пребывания иностранца (ст. 104 ч. 1 в редакции Dz.U. 2025 poz. 1794). Прочитано на официальных сайтах управлений 15 сентября 2026 года: в Познани сервис принимает номер дела и код доступа, который можно получить самостоятельно; в Ополе — для заявлений, поданных после 1 января 2024 года, по дате рождения и номеру телефона, переданному управлению; у Гданьска и Вроцлава сервисы на доменах самих управлений, их требования без JavaScript прочитать не удалось; варшавское управление называет для статуса свою систему inPOL; общий поиск дел краковского управления дела иностранцев не охватывает и отсылает к линии INFO.OPT. Для Лодзи, Катовице, Щецина, Люблина и Быдгоща сервис на официальных страницах не найден. Официального словаря названий статусов не найдено. Сторона вправе смотреть материалы дела (ст. 73 KPA).",
          pl: "Zezwolenia na pobyt czasowy udziela wojewoda właściwy ze względu na miejsce pobytu cudzoziemca (art. 104 ust. 1 w brzmieniu Dz.U. 2025 poz. 1794). Odczytane na oficjalnych stronach urzędów 15 września 2026: Poznań prowadzi usługę przyjmującą numer sprawy i kod dostępu, który można uzyskać samodzielnie; Opole — dla wniosków złożonych po 1 stycznia 2024, na podstawie daty urodzenia i numeru telefonu przekazanego urzędowi; Gdańsk i Wrocław prowadzą usługi w domenach urzędów, których wymagań nie dało się odczytać bez JavaScriptu; urząd w Warszawie wskazuje do śledzenia statusu system inPOL; ogólna wyszukiwarka spraw urzędu w Krakowie nie obejmuje spraw cudzoziemców i odsyła do infolinii INFO.OPT. Na oficjalnych stronach urzędów w Łodzi, Katowicach, Szczecinie, Lublinie i Bydgoszczy usługi nie znaleziono. Oficjalnego słownika nazw statusów nie znaleziono. Strona ma prawo wglądu w akta (art. 73 KPA).",
        },
      },
      {
        subject: {
          en: "Before a refusal, the voivode must say what is missing",
          ru: "Перед отказом воевода обязан назвать, чего не хватает",
          pl: "Przed odmową wojewoda musi wskazać, czego brakuje",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 10 § 1 KPA: before a decision the party must be able to comment on the evidence gathered. Art. 79a KPA: in a case begun on the party's request, when informing of that, the authority must name the conditions dependent on the party that are not met or not shown and may lead to a decision against the request; within the time set for comments the party may submit further evidence. Art. 10 ust. 1 of the Act on Foreigners: where the foreigner is abroad and has appointed no representative living in Poland, art. 73 § 1 and 1a, 79 and 81 KPA do not apply.",
          ru: "Ст. 10 § 1 KPA: до решения сторона должна иметь возможность высказаться о собранных доказательствах. Ст. 79a KPA: в деле, начатом по заявлению стороны, сообщая об этом, орган обязан назвать зависящие от стороны условия, которые не выполнены или не доказаны и могут привести к решению против заявления; в срок, назначенный для высказывания, сторона может представить дополнительные доказательства. Ст. 10 ч. 1 закона об иностранцах: если иностранец за границей и не назначил представителя, живущего в Польше, ст. 73 § 1 и 1a, 79 и 81 KPA не применяются.",
          pl: "Art. 10 § 1 KPA: przed wydaniem decyzji strona musi mieć możliwość wypowiedzenia się co do zebranych dowodów. Art. 79a KPA: w postępowaniu wszczętym na żądanie strony organ, informując o tym, wskazuje przesłanki zależne od strony, które nie zostały spełnione lub wykazane i mogą skutkować decyzją niezgodną z żądaniem; w wyznaczonym terminie strona może przedłożyć dodatkowe dowody. Art. 10 ust. 1 ustawy o cudzoziemcach: gdy cudzoziemiec przebywa za granicą i nie ustanowił pełnomocnika zamieszkałego w Polsce, art. 73 § 1 i 1a, 79 i 81 KPA nie stosuje się.",
        },
      },
      {
        subject: {
          en: "Appealing a refusal: 14 days, no form, and what the Office for Foreigners may decide",
          ru: "Жалоба на отказ: 14 дней, свободная форма и что может решить Управление по делам иностранцев",
          pl: "Odwołanie od odmowy: 14 dni, bez wzoru i co może orzec Szef Urzędu do Spraw Cudzoziemców",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Code of Administrative Procedure, Dz.U. 2025 poz. 1691. One appeal, to the head of UdSC through the voivode, within 14 days of service (art. 127, 129; art. 22 ust. 2 of the Act on Foreigners). It needs no detailed grounds — it is enough that it shows the party is dissatisfied (art. 128) — but must name the person, the address and the request and be signed (art. 63). The day of service is not counted; a term ending on a Saturday or holiday moves to the next working day; it is kept by posting at a Polish post office of the designated operator or sending to the office's electronic delivery address before it ends (art. 57). A term missed without fault is restored on a request within 7 days of the cause ending, filed together with the appeal (art. 58). Before the term ends and while a timely appeal is pending the decision is not executed (art. 130). The voivode may itself grant the appeal (art. 132). The head of UdSC upholds, reverses and decides, or annuls and remands (art. 138), and may not decide to the appellant's detriment unless the decision flagrantly breaches the law (art. 139); the appeal may be withdrawn (art. 137) or waived, which makes the decision final at once (art. 127a). A refusal to open proceedings is a postanowienie, open to a zażalenie within 7 days (art. 61a, 141). The appeal stage for a temporary permit ends within 90 days, counted from remedied defects (art. 112a ust. 4–5 of the Act on Foreigners). Art. 100d of the Act on assistance to citizens of Ukraine suspends time limits in proceedings conducted by the voivode; its text does not name the appeal stage. MOS, Odwołanie page: the appeal is not filed through MOS but on paper, by post or in person at the voivode's office, or to the voivode's electronic delivery address; later letters go to UdSC; after an upheld refusal a new application within the 30 days to leave is refused.",
          ru: "Кодекс административного производства, Dz.U. 2025 poz. 1691. Одна жалоба — руководителю UdSC через воеводу, в течение 14 дней со дня доставки (ст. 127, 129; ст. 22 ч. 2 закона об иностранцах). Подробного обоснования не требуется — достаточно, чтобы из жалобы было видно, что сторона недовольна (ст. 128), — но нужны лицо, адрес, требование и подпись (ст. 63). День доставки не считается; срок, кончающийся в субботу или праздник, переносится на следующий рабочий день; срок соблюдён, если до его конца письмо сдано в польское отделение назначенного почтового оператора или отправлено на адрес для электронных доручений органа (ст. 57). Пропущенный не по вине срок восстанавливают по просьбе, поданной в течение 7 дней после отпадения причины вместе с самой жалобой (ст. 58). До конца срока и пока рассматривается поданная вовремя жалоба решение не исполняется (ст. 130). Воевода может сам удовлетворить жалобу (ст. 132). Руководитель UdSC оставляет решение в силе, отменяет и решает сам или отменяет и возвращает на новое рассмотрение (ст. 138) и не может ухудшить положение жалобщика, если решение не нарушает закон грубо (ст. 139); жалобу можно отозвать (ст. 137) или отказаться от неё, и тогда решение сразу становится окончательным (ст. 127a). Отказ в возбуждении дела — постановление, на него zażalenie в течение 7 дней (ст. 61a, 141). Жалобу по временному разрешению рассматривают 90 дней, от устранения недостатков (ст. 112a ч. 4–5 закона об иностранцах). Ст. 100d закона о помощи гражданам Украины приостанавливает сроки в производствах, которые ведёт воевода; стадию жалобы её текст не называет. Страница MOS «Odwołanie»: жалоба подаётся не через MOS, а на бумаге — почтой или лично в канцелярию воеводы — или на адрес для электронных доручений воеводы; дальнейшие письма — в UdSC; после оставленного в силе отказа новое заявление в течение 30 дней на выезд не рассматривается.",
          pl: "Kodeks postępowania administracyjnego, Dz.U. 2025 poz. 1691. Jedno odwołanie — do Szefa UdSC za pośrednictwem wojewody, w terminie 14 dni od doręczenia (art. 127, 129; art. 22 ust. 2 ustawy o cudzoziemcach). Nie wymaga szczegółowego uzasadnienia — wystarczy, że wynika z niego niezadowolenie strony (art. 128) — ale musi wskazywać osobę, adres i żądanie oraz być podpisane (art. 63). Dnia doręczenia nie wlicza się; termin kończący się w sobotę lub dzień wolny przesuwa się na następny dzień roboczy; jest zachowany przy nadaniu w polskiej placówce operatora wyznaczonego lub wysłaniu na adres do doręczeń elektronicznych organu przed jego upływem (art. 57). Termin uchybiony bez winy przywraca się na prośbę złożoną w ciągu 7 dni od ustania przyczyny, razem z odwołaniem (art. 58). Przed upływem terminu i w toku odwołania wniesionego w terminie decyzja nie podlega wykonaniu (art. 130). Wojewoda może sam uwzględnić odwołanie (art. 132). Szef UdSC utrzymuje decyzję, uchyla i orzeka co do istoty albo uchyla i przekazuje do ponownego rozpatrzenia (art. 138) i nie może orzec na niekorzyść odwołującego się, chyba że decyzja rażąco narusza prawo (art. 139); odwołanie można cofnąć (art. 137) albo zrzec się go, a wtedy decyzja od razu staje się ostateczna (art. 127a). Odmowa wszczęcia postępowania to postanowienie, na które służy zażalenie w 7 dni (art. 61a, 141). Postępowanie odwoławcze w sprawie pobytu czasowego kończy się w 90 dni, liczonych od uzupełnienia braków (art. 112a ust. 4–5 ustawy o cudzoziemcach). Art. 100d ustawy o pomocy obywatelom Ukrainy zawiesza terminy w postępowaniach prowadzonych przez wojewodę; etapu odwoławczego jego treść nie wymienia. MOS, strona „Odwołanie”: odwołania nie wnosi się przez MOS, lecz na piśmie — pocztą lub w biurze podawczym wojewody — albo na adres do doręczeń elektronicznych wojewody; dalsza korespondencja do UdSC; po utrzymaniu odmowy kolejny wniosek złożony w 30-dniowym terminie na wyjazd nie zostanie rozpatrzony.",
        },
      },
      {
        subject: {
          en: "After a final refusal: 30 days to leave, no new application, and a return decision",
          ru: "После окончательного отказа: 30 дней на выезд, без нового заявления, и решение о возвращении",
          pl: "Po ostatecznej odmowie: 30 dni na wyjazd, bez nowego wniosku i decyzja o zobowiązaniu do powrotu",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, Dz.U. 2025 poz. 1079, art. 299 as amended by Dz.U. 2026 poz. 203 art. 12 pkt 9. A foreigner must leave within 30 days from the day a refusal or discontinuance of a temporary, permanent or EU long-term resident permit, or its withdrawal, became final — or, where the higher body decided, from service of its decision (ust. 6 pkt 1 lit. a); stay in those 30 days is lawful (ust. 7). The obligation does not apply to someone holding another valid document or whose stay is lawful under this or another act (ust. 8), and the 30 days do not apply where return proceedings began before the refusal (ust. 8a). The voivode informs the Border Guard, which establishes whether to issue a return decision (ust. 10–11). An application for a temporary permit by someone under this obligation is refused initiation (art. 99 ust. 1 pkt 9). A return decision follows a stay without a valid visa or permit (art. 302 ust. 1 pkt 1–3), sets a voluntary departure of 8 to 30 days from service (art. 315), extendable to at most a year for family, children's schooling or length of stay (art. 316), and imposes an entry ban for Poland and the Schengen area (art. 318) of 6 months to 3 years in those cases (art. 319 ust. 1 pkt 1), which may be omitted where departure is voluntary and compliance likely (art. 318 ust. 1a) and later withdrawn on request (art. 320). Appeal against it: within 7 days, to the Commander-in-Chief of the Border Guard (art. 321). None is issued to the spouse of a Polish citizen unless the marriage is a sham or security requires (art. 303 ust. 1 pkt 4). Our reading, not a provision: until the refusal is final the stay remains lawful under art. 108 and art. 99 ust. 1 pkt 9 does not yet apply; and a UKR holder's temporary protection is not ended by a refusal (art. 109b of the Act on granting protection ends it on a grant). The Poznań voivodeship glossary says the stay ends on the last day of the 14 days where the appeal was waived; art. 299 ust. 6 counts 30 days from finality.",
          ru: "Закон об иностранцах, Dz.U. 2025 poz. 1079, ст. 299 в редакции Dz.U. 2026 poz. 203, ст. 12 п. 9. Иностранец обязан выехать в течение 30 дней со дня, когда отказ или прекращение дела о временном, постоянном разрешении или статусе резидента ЕС либо его отзыв стали окончательными, — а если решал вышестоящий орган, со дня доставки его решения (ч. 6 п. 1 лит. a); пребывание в эти 30 дней законно (ч. 7). Обязанность не действует, если есть другой действительный документ или пребывание законно по этому или другому закону (ч. 8), а 30 дней не даются, если производство о возвращении началось до отказа (ч. 8a). Воевода сообщает Пограничной страже, и та решает, выносить ли решение о возвращении (ч. 10–11). Заявление о временном разрешении от того, кто обязан выехать, отклоняется без возбуждения дела (ст. 99 ч. 1 п. 9). Решение о возвращении выносят при пребывании без действительной визы или разрешения (ст. 302 ч. 1 п. 1–3); в нём срок добровольного выезда от 8 до 30 дней с доставки (ст. 315), продлеваемый не больше чем до года из-за семьи, учёбы детей или длительности пребывания (ст. 316), и запрет въезда в Польшу и Шенген (ст. 318) — в этих случаях от 6 месяцев до 3 лет (ст. 319 ч. 1 п. 1); от запрета можно отказаться при добровольном выезде и вероятном соблюдении закона (ст. 318 ч. 1a), позже его можно отменить по заявлению (ст. 320). Жалоба на него — в течение 7 дней, Главному коменданту Пограничной стражи (ст. 321). Супругу гражданина Польши его не выносят, если брак не фиктивный и не мешает безопасность (ст. 303 ч. 1 п. 4). Наше прочтение, а не норма: пока отказ не окончательный, пребывание остаётся законным по ст. 108, а ст. 99 ч. 1 п. 9 ещё не действует; и отказ не прекращает временную защиту держателя UKR (ст. 109b закона о защите иностранцев прекращает её при выдаче разрешения). Словарь познанского воеводства пишет, что при отказе от жалобы пребывание кончается в последний день 14 дней; ст. 299 ч. 6 считает 30 дней от окончательности.",
          pl: "Ustawa o cudzoziemcach, Dz.U. 2025 poz. 1079, art. 299 w brzmieniu Dz.U. 2026 poz. 203 art. 12 pkt 9. Cudzoziemiec jest obowiązany opuścić Polskę w terminie 30 dni od dnia, w którym decyzja o odmowie lub umorzeniu postępowania w sprawie pobytu czasowego, stałego lub rezydenta długoterminowego UE albo o cofnięciu zezwolenia stała się ostateczna — a gdy orzekał organ wyższego stopnia, od doręczenia jego decyzji (ust. 6 pkt 1 lit. a); pobyt w tych 30 dniach uważa się za legalny (ust. 7). Obowiązek nie dotyczy posiadacza innego ważnego dokumentu ani osoby, której pobyt jest legalny na podstawie tej lub innej ustawy (ust. 8), a 30 dni nie stosuje się, gdy postępowanie o zobowiązanie do powrotu wszczęto przed odmową (ust. 8a). Wojewoda informuje Straż Graniczną, która ustala przesłanki decyzji o zobowiązaniu do powrotu (ust. 10–11). Wniosek o pobyt czasowy osoby objętej tym obowiązkiem kończy się odmową wszczęcia (art. 99 ust. 1 pkt 9). Decyzję o zobowiązaniu do powrotu wydaje się przy pobycie bez ważnej wizy lub zezwolenia (art. 302 ust. 1 pkt 1–3); określa ona termin dobrowolnego wyjazdu od 8 do 30 dni od doręczenia (art. 315), który można przedłużyć najwyżej do roku ze względu na rodzinę, naukę dzieci lub długość pobytu (art. 316), oraz zakaz wjazdu do Polski i strefy Schengen (art. 318) — w tych przypadkach od 6 miesięcy do 3 lat (art. 319 ust. 1 pkt 1); można od niego odstąpić przy dobrowolnym wyjeździe i wysokim prawdopodobieństwie przestrzegania prawa (art. 318 ust. 1a), a później cofnąć na wniosek (art. 320). Odwołanie od niej — w 7 dni, do Komendanta Głównego Straży Granicznej (art. 321). Nie wydaje się jej małżonkowi obywatela polskiego, chyba że małżeństwo jest fikcyjne lub sprzeciwiają się temu względy bezpieczeństwa (art. 303 ust. 1 pkt 4). Nasze odczytanie, nie przepis: dopóki odmowa nie jest ostateczna, pobyt pozostaje legalny na podstawie art. 108, a art. 99 ust. 1 pkt 9 jeszcze nie działa; odmowa nie kończy też ochrony czasowej posiadacza UKR (art. 109b ustawy o udzielaniu ochrony kończy ją z udzieleniem zezwolenia). Słownik Wielkopolskiego Urzędu Wojewódzkiego podaje, że przy zrzeczeniu się odwołania pobyt kończy się ostatniego dnia 14 dni; art. 299 ust. 6 liczy 30 dni od ostateczności.",
        },
      },
      {
        subject: {
          en: "Staying without a title: a fine, a return decision even on the way out, and assisted return",
          ru: "Пребывание без основания: штраф, решение о возвращении даже при выезде и помощь в возвращении",
          pl: "Pobyt bez tytułu prawnego: grzywna, decyzja o powrocie także przy wyjeździe i pomoc w powrocie",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, Dz.U. 2025 poz. 1079. A foreigner must leave before a visa's period of stay or a temporary permit expires (art. 299 ust. 1, 5). A return decision is issued to someone who stays or stayed in Poland without a valid visa or document where one is required, or who overstayed a visa-free or visa period (art. 302 ust. 1 pkt 1–3) — the past tense is in the text, so it can follow an overstay discovered on departure; it is not issued within the 30 days after a final refusal (ust. 2). Staying without a legal title, not showing a residence document on demand, and not leaving by the date set in a return decision are petty offences punished by a fine under the Code of Petty Offence Procedure (art. 465 ust. 1 pkt 1, 2, 6, ust. 2); the amount was not read. When extending voluntary departure the authority may require reporting, a deposit of at least twice the minimum wage, surrender of the passport or a set address (art. 317). The Commander-in-Chief of the Border Guard organises assisted voluntary return for a person with a return decision that sets a departure date, among others (art. 334); where it is given, the costs of enforced return are not set (art. 336 ust. 1a) and it is a ground to withdraw the entry ban (art. 320 ust. 1 pkt 3). A return decision is enforced by escort to the border if the person does not leave in time or there is a risk of absconding (art. 329). The authority must translate the legal basis, the ruling and the appeal instruction into a language the foreigner understands (art. 327) and inform about NGOs giving legal aid (art. 328).",
          ru: "Закон об иностранцах, Dz.U. 2025 poz. 1079. Иностранец обязан выехать до окончания срока пребывания по визе или срока временного разрешения (ст. 299 ч. 1, 5). Решение о возвращении выносят тому, кто пребывает или пребывал в Польше без действительной визы или документа, если они нужны, либо превысил срок безвиза или визы (ст. 302 ч. 1 п. 1–3) — прошедшее время стоит в тексте, поэтому решение возможно и при превышении, обнаруженном на выезде; в 30 дней после окончательного отказа его не выносят (ч. 2). Пребывание без правового основания, непредъявление документа по требованию и невыезд в срок, назначенный решением о возвращении, — правонарушения, наказуемые штрафом по кодексу производства по делам о правонарушениях (ст. 465 ч. 1 п. 1, 2, 6, ч. 2); размер не читался. Продлевая срок добровольного выезда, орган может обязать являться на отметку, внести залог не меньше двух минимальных зарплат, сдать паспорт или жить по указанному адресу (ст. 317). Главный комендант Пограничной стражи организует помощь в добровольном возвращении, среди прочего, получившему решение о возвращении со сроком выезда (ст. 334); при такой помощи расходы на принудительное возвращение не устанавливаются (ст. 336 ч. 1a), и она — основание отменить запрет въезда (ст. 320 ч. 1 п. 3). Решение исполняют доставкой к границе, если человек не выехал в срок или есть риск побега (ст. 329). Орган обязан перевести правовое основание, резолютивную часть и порядок обжалования на понятный иностранцу язык (ст. 327) и сообщить о НКО, оказывающих правовую помощь (ст. 328).",
          pl: "Ustawa o cudzoziemcach, Dz.U. 2025 poz. 1079. Cudzoziemiec jest obowiązany opuścić Polskę przed upływem okresu pobytu z wizy lub ważności zezwolenia na pobyt czasowy (art. 299 ust. 1, 5). Decyzję o zobowiązaniu do powrotu wydaje się cudzoziemcowi, który przebywa lub przebywał w Polsce bez ważnej wizy lub dokumentu, jeżeli są wymagane, albo przekroczył okres pobytu w ruchu bezwizowym lub z wizy (art. 302 ust. 1 pkt 1–3) — czas przeszły jest w tekście, więc decyzja jest możliwa także przy przekroczeniu ujawnionym przy wyjeździe; nie wydaje się jej w 30 dniach po ostatecznej odmowie (ust. 2). Przebywanie bez tytułu prawnego, nieokazanie dokumentu na żądanie i niewyjechanie w terminie z decyzji o zobowiązaniu do powrotu to wykroczenia zagrożone grzywną, orzekaną według Kodeksu postępowania w sprawach o wykroczenia (art. 465 ust. 1 pkt 1, 2, 6, ust. 2); wysokości nie czytano. Przedłużając termin dobrowolnego wyjazdu, organ może zobowiązać do zgłaszania się, wpłaty zabezpieczenia nie niższego niż dwukrotność minimalnego wynagrodzenia, oddania paszportu do depozytu lub zamieszkiwania w wyznaczonym miejscu (art. 317). Komendant Główny Straży Granicznej organizuje pomoc w dobrowolnym powrocie m.in. cudzoziemcowi z decyzją o zobowiązaniu do powrotu z terminem dobrowolnego wyjazdu (art. 334); przy tej pomocy nie ustala się kosztów przymusowego wykonania (art. 336 ust. 1a), a jest ona podstawą cofnięcia zakazu wjazdu (art. 320 ust. 1 pkt 3). Decyzję wykonuje się przymusowo przez doprowadzenie do granicy, gdy cudzoziemiec nie wyjechał w terminie lub zachodzi ryzyko ucieczki (art. 329). Organ tłumaczy podstawę prawną, rozstrzygnięcie i pouczenie o odwołaniu na język zrozumiały dla cudzoziemca (art. 327) i informuje o organizacjach pozarządowych udzielających pomocy prawnej (art. 328).",
        },
      },
      {
        subject: {
          en: "A court complaint after the Office for Foreigners: 30 days, 300 zł, and it does not suspend",
          ru: "Иск в суд после Управления по делам иностранцев: 30 дней, 300 zł и без приостановки",
          pl: "Skarga do sądu po decyzji Szefa UdSC: 30 dni, 300 zł i bez wstrzymania",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Law on proceedings before administrative courts, consolidated Dz.U. 2026 poz. 143: a complaint only after the remedies before the authority are exhausted (art. 52 § 1), within 30 days of service of the decision (art. 53 § 1), filed through the authority that issued it (art. 54 § 1); filing does not suspend the decision, which the authority may suspend on request (art. 61 § 1–2). Legal aid — exemption from court costs and an appointed advocate or legal adviser — on an application, for a person who shows they cannot bear the costs (art. 243–246). Court fee: 300 zł for complaints in matters of foreigners, passports and visas, § 2 ust. 3 pkt 8 of the Council of Ministers regulation on the court entry fee, consolidated Dz.U. 2021 poz. 535; no amendment after 2017 was found in the ELI register. Our reading, not a provision: a decision of the head of UdSC is final (art. 16 § 1 KPA), so lawful stay under art. 108 of the Act on Foreigners ends with it, and no provision was found that makes a court complaint extend it; the 30 days of art. 299 ust. 6 still run from service.",
          ru: "Закон о производстве в административных судах, сводный текст Dz.U. 2026 poz. 143: иск — только после исчерпания средств обжалования в органе (ст. 52 § 1), в течение 30 дней со дня доставки решения (ст. 53 § 1), подаётся через орган, вынесший решение (ст. 54 § 1); подача иска не приостанавливает решение, орган может приостановить его по заявлению (ст. 61 § 1–2). Правовая помощь — освобождение от судебных расходов и назначенный адвокат или юрисконсульт — по заявлению, если человек покажет, что не может нести расходы (ст. 243–246). Судебный сбор: 300 zł по искам в делах иностранцев, паспортов и виз, § 2 ч. 3 п. 8 распоряжения Совета министров о судебном сборе, сводный текст Dz.U. 2021 poz. 535; поправок после 2017 года в реестре ELI не найдено. Наше прочтение, а не норма: решение руководителя UdSC окончательное (ст. 16 § 1 KPA), поэтому законность пребывания по ст. 108 закона об иностранцах с ним заканчивается, и нормы, которая продлевала бы её на время иска, не найдено; 30 дней ст. 299 ч. 6 всё равно считаются с доставки.",
          pl: "Prawo o postępowaniu przed sądami administracyjnymi, tekst jednolity Dz.U. 2026 poz. 143: skarga dopiero po wyczerpaniu środków zaskarżenia (art. 52 § 1), w terminie 30 dni od doręczenia decyzji (art. 53 § 1), za pośrednictwem organu, który ją wydał (art. 54 § 1); wniesienie skargi nie wstrzymuje wykonania decyzji, organ może je wstrzymać na wniosek (art. 61 § 1–2). Prawo pomocy — zwolnienie od kosztów sądowych i ustanowienie adwokata lub radcy prawnego — na wniosek osoby, która wykaże, że nie jest w stanie ponieść kosztów (art. 243–246). Wpis: 300 zł od skarg w sprawach cudzoziemców, paszportów i wiz, § 2 ust. 3 pkt 8 rozporządzenia Rady Ministrów w sprawie wpisu, tekst jednolity Dz.U. 2021 poz. 535; zmian po 2017 w rejestrze ELI nie znaleziono. Nasze odczytanie, nie przepis: decyzja Szefa UdSC jest ostateczna (art. 16 § 1 KPA), więc legalny pobyt z art. 108 ustawy o cudzoziemcach kończy się wraz z nią, i nie znaleziono przepisu, który przedłużałby go na czas skargi; 30 dni z art. 299 ust. 6 biegnie od doręczenia.",
        },
      },
      {
        subject: {
          en: "Applications only through MOS from 27 April 2026",
          ru: "Заявления только через MOS с 27 апреля 2026 года",
          pl: "Wnioski wyłącznie przez MOS od 27 kwietnia 2026",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Announcement of the Minister of the Interior and Administration of 10 April 2026, Monitor Polski 2026 poz. 370, under art. 17 ust. 1 of the amendment Dz.U. 2025 poz. 1794: the implementation date is 27 April 2026 for, among others, art. 105–106l, 108, 112a in part, 120a ust. 1–3, 202–203i (permanent residence) and 218a–219i (EU long-term resident) of the Act on Foreigners. One exception worth knowing: an application to change a temporary residence and work permit is filed on paper, art. 120a ust. 1 as amended. For a temporary permit, art. 106c–106i as added: an application filed other than through MOS is left unexamined; the employer's or university's attachment is completed by them through a link sent to their e-mail and signed by them; the applicant attaches a photograph and scans of every page of the passport and signs with a qualified signature or a trusted profile; the application counts as filed on the official receipt; the voivode then summons the applicant in person, on at least 7 days' notice, for the passport, fingerprints and signature, and discontinues the case if the applicant does not appear or does not give them.",
          ru: "Сообщение Министра внутренних дел и администрации от 10 апреля 2026 года, Monitor Polski 2026 poz. 370, на основании ст. 17 ч. 1 поправки Dz.U. 2025 poz. 1794: дата внедрения — 27 апреля 2026 года, в том числе для ст. 105–106l, 108, части 112a, 120a ч. 1–3, 202–203i (постоянное пребывание) и 218a–219i (резидент ЕС) закона об иностранцах. Одно исключение стоит знать: заявление об изменении разрешения на временное пребывание и работу подаётся на бумаге, ст. 120a ч. 1 в новой редакции. Для временного разрешения, ст. 106c–106i в новой редакции: заявление, поданное не через MOS, оставляется без рассмотрения; приложение работодателя или вуза заполняют и подписывают они сами по ссылке, пришедшей им на e-mail; заявитель прикладывает фотографию и сканы всех страниц паспорта и подписывает квалифицированной подписью или профилем доверенным; заявление считается поданным с получением официального подтверждения; затем воевода вызывает заявителя лично, не раньше чем через 7 дней, для паспорта, отпечатков и подписи и прекращает дело, если он не явился или их не сдал.",
          pl: "Komunikat Ministra Spraw Wewnętrznych i Administracji z 10 kwietnia 2026, Monitor Polski 2026 poz. 370, na podstawie art. 17 ust. 1 nowelizacji Dz.U. 2025 poz. 1794: dzień wdrożenia to 27 kwietnia 2026, m.in. dla art. 105–106l, 108, części art. 112a, art. 120a ust. 1–3, 202–203i (pobyt stały) i 218a–219i (rezydent długoterminowy UE) ustawy o cudzoziemcach. Jeden wyjątek wart uwagi: wniosek o zmianę zezwolenia na pobyt czasowy i pracę składa się w postaci papierowej, art. 120a ust. 1 w nowym brzmieniu. Dla zezwolenia na pobyt czasowy, art. 106c–106i w nowym brzmieniu: wniosek złożony inaczej niż przez MOS pozostawia się bez rozpoznania; załącznik podmiotu powierzającego pracę lub uczelni wypełniają i podpisują one przez odnośnik wysłany na ich adres e-mail; wnioskodawca dołącza fotografię i odwzorowanie wszystkich stron paszportu oraz podpisuje kwalifikowanym podpisem elektronicznym lub podpisem zaufanym; wniosek uznaje się za złożony z chwilą urzędowego poświadczenia odbioru; następnie wojewoda wzywa do osobistego stawiennictwa w terminie nie krótszym niż 7 dni w celu okazania paszportu, złożenia odcisków i wzoru podpisu, a przy niestawiennictwie lub ich niezłożeniu umarza postępowanie.",
        },
      },
      {
        subject: {
          en: "Documents for a temporary permit: at filing in MOS, at the visit, and on summons",
          ru: "Документы на временное разрешение: при подаче в MOS, на визите и по вызову",
          pl: "Dokumenty do zezwolenia na pobyt czasowy: w MOS, przy stawiennictwie i na wezwanie",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners as amended by Dz.U. 2025 poz. 1794: the application form (art. 106 ust. 1); for residence and work, the Blue Card and a company board member, an attachment completed by the employer with the post, occupation, place, legal basis, working time, pay, duties, period and PKD code, the employer's statement of no convictions and a truth clause (ust. 2); for studies, an attachment completed by the university (ust. 7); a photograph and scans of every page of the passport (art. 106d ust. 1); supporting documents may be attached but need not be (ust. 2); summons in person on at least 7 days' notice (art. 106e) and for documents on at least 14, the voivode weighing the time needed to obtain each (art. 106f). The MOS Dokumenty pages, read for work, a spouse of a Polish citizen, family reunification, a child and studies, sort the same into three stages: sent through MOS; shown at the visit — the original passport, or the case is discontinued; and further documents on the voivode's summons, originals or copies certified by a notary, an advocate or legal adviser acting as attorney, or the office's own clerk against the original. Foreign-language documents need a sworn translation into Polish; documents must be current on the day of the decision. For work, MOS names the employer's attachment (załącznik nr 1), signed by the employer through login.gov.pl, whose conditions must match the contract and be current on the day of the decision, and proof of 440 zł stamp duty and the 100 zł card fee at filing; as evidence, a certificate of employment from a previous Polish employer, proof of health insurance for a contract for a specific work, qualifications for a regulated profession. For a spouse of a Polish citizen: a current marriage certificate, a copy of the spouse's ID or proof of citizenship, and evidence that the marriage is genuine — cohabitation, contact, witnesses, children. For family reunification and a child: a marriage or birth certificate issued no earlier than 3 months before filing, a copy of the sponsor's permit decision, health insurance (a ZUS certificate or a private policy), income (contracts, a ZUS certificate of contribution bases with proof of the right to work, a pension certificate) and accommodation (registration, a lease, another title, or a statement of the person entitled to the flat). For studies: the university's attachment, 340 zł and 100 zł at filing, insurance, proof of fees, and means from a closed list issued no earlier than a month before filing; a citizen of Belarus need not document housing costs. Fees page: stamp duty is paid to the city where the voivode sits, and if unpaid the voivode summons for payment within 7 to 14 days and returns the application; the 100 zł card fee is a condition for issuing the card once the permit is granted.",
          ru: "Закон об иностранцах в редакции Dz.U. 2025 poz. 1794: форма заявления (ст. 106 ч. 1); для пребывания и работы, Голубой карты и члена правления компании — приложение, заполняемое работодателем: должность, профессия, место, правовое основание, объём, зарплата, обязанности, срок, код PKD, заявление работодателя об отсутствии судимостей и оговорка о правдивости (ч. 2); для учёбы — приложение, заполняемое вузом (ч. 7); фотография и сканы всех страниц паспорта (ст. 106d ч. 1); подтверждающие документы можно приложить, но не обязательно (ч. 2); вызов на личную явку — не раньше чем через 7 дней (ст. 106e), за документами — не меньше 14 дней, с учётом времени, нужного на получение документа (ст. 106f). Страницы MOS «Dokumenty», прочитанные для работы, супруга гражданина Польши, воссоединения семьи, ребёнка и учёбы, раскладывают то же на три этапа: отправляется через MOS; показывается на визите — оригинал паспорта, иначе дело прекращают; остальное — по вызову воеводы, в оригинале или в копии, заверенной нотариусом, адвокатом или юрисконсультом-представителем либо сотрудником управления по оригиналу. Документы на иностранном языке — с присяжным переводом на польский; документы должны быть актуальны на день решения. Для работы MOS называет приложение работодателя (załącznik nr 1), подписываемое работодателем через login.gov.pl, условия которого должны совпадать с договором и быть актуальны на день решения, и подтверждения 440 zł гербового сбора и 100 zł за карту при подаче; из доказательств — świadectwo pracy от прежнего польского работодателя, страховку при договоре о выполнении работы (umowa o dzieło), квалификацию для регулируемой профессии. Для супруга гражданина Польши: актуальный акт о браке, копия удостоверения супруга или документа о гражданстве и доказательства фактического брака — совместное проживание, контакты, свидетели, дети. Для воссоединения семьи и ребёнка: акт о браке или рождении, выданный не раньше чем за 3 месяца до подачи, копия решения о разрешении приглашающего, страховка (справка ZUS или частный полис), доход (договоры, справка ZUS о базе взносов с документом о праве на работу, справка о пенсии) и жильё (прописка, договор аренды, иной титул или заявление владельца). Для учёбы: приложение вуза, 340 zł и 100 zł при подаче, страховка, оплата учёбы и средства из закрытого перечня, выданные не раньше чем за месяц до подачи; гражданин Беларуси расходы на жильё подтверждать не обязан. Страница об оплатах: гербовый сбор платят городу по месту воеводы, при неуплате воевода вызывает оплатить за 7–14 дней и возвращает заявление; 100 zł за карту — условие выдачи карты после разрешения.",
          pl: "Ustawa o cudzoziemcach w brzmieniu Dz.U. 2025 poz. 1794: formularz wniosku (art. 106 ust. 1); przy pobycie i pracy, Niebieskiej Karcie i funkcji w zarządzie spółki — załącznik wypełniony przez podmiot powierzający pracę: stanowisko, zawód, miejsce, podstawa prawna, wymiar, wynagrodzenie, obowiązki, okres, PKD, oświadczenie o niekaralności i klauzula prawdziwości (ust. 2); przy studiach — załącznik wypełniony przez uczelnię (ust. 7); fotografia i odwzorowanie wszystkich stron paszportu (art. 106d ust. 1); dokumenty potwierdzające można dołączyć, ale nie trzeba (ust. 2); wezwanie do stawiennictwa w terminie nie krótszym niż 7 dni (art. 106e), do dokumentów — nie krótszym niż 14 dni, z oceną czasu potrzebnego na uzyskanie dokumentu (art. 106f). Strony MOS „Dokumenty”, przeczytane dla pracy, małżonka obywatela RP, połączenia z rodziną, dziecka i studiów, dzielą to na trzy etapy: przesyłane przez MOS; okazywane przy wizycie — oryginał paszportu, inaczej postępowanie zostanie umorzone; pozostałe — na wezwanie wojewody, w oryginale lub kopii poświadczonej przez notariusza, adwokata lub radcę prawnego jako pełnomocnika albo pracownika urzędu na podstawie oryginału. Dokumenty obcojęzyczne z tłumaczeniem przysięgłym na polski; dokumenty muszą być aktualne w dniu wydania decyzji. Dla pracy MOS wymienia załącznik nr 1 podpisywany przez pracodawcę w login.gov.pl, którego warunki muszą być zgodne z umową i aktualne w dniu wydania zezwolenia, oraz dowody 440 zł opłaty skarbowej i 100 zł za kartę przy składaniu; jako dowody — świadectwo pracy od poprzedniego polskiego pracodawcy, ubezpieczenie przy umowie o dzieło, kwalifikacje w zawodzie regulowanym. Dla małżonka obywatela RP: aktualny odpis aktu małżeństwa, kopia dowodu osobistego małżonka lub dokumentu o obywatelstwie i dowody faktycznego charakteru małżeństwa — wspólne zamieszkiwanie, kontakty, świadkowie, dzieci. Dla połączenia z rodziną i dziecka: odpis aktu małżeństwa lub urodzenia wydany nie wcześniej niż 3 miesiące przed złożeniem wniosku, kopia decyzji pobytowej członka rodziny, ubezpieczenie (zaświadczenie z ZUS lub polisa), dochód (umowy, zaświadczenie ZUS o podstawach składek z dokumentem o prawie do pracy, zaświadczenie o emeryturze) i miejsce zamieszkania (zameldowanie, umowa najmu, inna umowa lub oświadczenie osoby uprawnionej do lokalu). Dla studiów: załącznik uczelni, 340 zł i 100 zł przy składaniu, ubezpieczenie, opłata za studia i środki z zamkniętego katalogu, wydane nie wcześniej niż miesiąc przed wnioskiem; obywatel Białorusi nie musi dokumentować kosztów zamieszkania. Strona opłat: opłatę skarbową wpłaca się miastu właściwemu dla siedziby wojewody, a przy braku wpłaty wojewoda wzywa do jej uiszczenia w 7–14 dni i zwraca wniosek; 100 zł za kartę to warunek wydania karty po udzieleniu zezwolenia.",
        },
      },
      {
        subject: {
          en: "The photograph for a karta pobytu",
          ru: "Фотография на карту побыту",
          pl: "Fotografia do karty pobytu",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Wielkopolski voivodeship office in Poznań, glossary: colour, sharp, 35 × 45 mm, taken no earlier than 6 months before filing, from the top of the head to the top of the shoulders with the face taking 70–80%, on a plain light background, looking straight ahead with eyes open and not covered by hair, a natural expression and closed mouth, natural skin colour, eyes and pupils clearly visible, the eye line parallel to the top edge. From 27 April 2026 an electronic application takes a JPG meeting those rules, at least 684 × 883 pixels and at most 2.5 MB, in the proportions of 35 × 45 mm. Four printed photographs are for the paper applications still filed from abroad for family reunification and some other permits. A religious head covering is allowed if the face is fully visible, with a declaration of membership of the religious community. MOS: without head covering or tinted glasses. The regulation that sets the criteria was not read.",
          ru: "Словарь Великопольского воеводского управления в Познани: цветная, резкая, 35 × 45 мм, сделана не раньше чем за 6 месяцев до подачи, от макушки до верха плеч, лицо занимает 70–80%, однотонный светлый фон, взгляд прямо, глаза открыты и не закрыты волосами, естественное выражение и закрытый рот, естественный цвет кожи, глаза и зрачки хорошо видны, линия глаз параллельна верхнему краю. С 27 апреля 2026 года к электронному заявлению прикладывают JPG по этим правилам, не меньше 684 × 883 пикселей и не больше 2,5 МБ, в пропорциях 35 × 45 мм. Четыре бумажные фотографии — для бумажных заявлений, которые ещё подают из-за границы на воссоединение семьи и некоторые другие разрешения. Религиозный головной убор допустим, если лицо полностью видно, с заявлением о принадлежности к религиозной общине. MOS: без головного убора и тёмных очков. Распоряжение, устанавливающее критерии, не читалось.",
          pl: "Słownik Wielkopolskiego Urzędu Wojewódzkiego w Poznaniu: kolorowa, ostra, 35 × 45 mm, wykonana nie wcześniej niż 6 miesięcy przed złożeniem wniosku, od wierzchołka głowy do górnej części barków, twarz zajmuje 70–80%, jednolite jasne tło, wzrok na wprost, oczy otwarte i nieprzesłonięte włosami, naturalny wyraz twarzy i zamknięte usta, naturalny kolor skóry, wyraźnie widoczne oczy i źrenice, linia oczu równoległa do górnej krawędzi. Od 27 kwietnia 2026 do wniosku elektronicznego dołącza się plik JPG spełniający te wymogi, o rozdzielczości co najmniej 684 × 883 piksele i wielkości do 2,5 MB, w proporcjach 35 × 45 mm. Cztery fotografie papierowe — do wniosków papierowych składanych z zagranicy o połączenie z rodziną i niektóre inne zezwolenia. Nakrycie głowy zgodne z wyznaniem jest dopuszczalne, jeśli twarz jest w pełni widoczna, wraz z oświadczeniem o przynależności do wspólnoty wyznaniowej. MOS: bez nakrycia głowy i szkieł zaciemniających. Rozporządzenia określającego kryteria nie czytano.",
        },
      },
      {
        subject: {
          en: "The CUKR card: who may apply, until when, for how long",
          ru: "Карта CUKR: кто может подать, до какого числа, на сколько",
          pl: "Karta CUKR: kto może złożyć wniosek, do kiedy i na jak długo",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 42c of the Act on assistance to citizens of Ukraine: a citizen of Ukraine whose stay is lawful as a temporary protection beneficiary (art. 106 of the Act on granting protection, reference set by Dz.U. 2026 poz. 203 art. 17 pkt 22) with UKR status on 4 June 2025 (date set by Dz.U. 2025 poz. 1301 art. 10 pkt 18), on the day of the application, and continuously for at least 365 days; a child born in Poland whose mother holds the card (art. 42d). The application is electronic only, through the UdSC system, and signed by the applicant with a qualified or trusted signature (art. 42f ust. 5); one filed any other way is left unexamined (ust. 7). It counts as filed only if the PESEL register holds complete passport data and the register holds fingerprints and a signature (art. 42g). Filing ends by law any pending temporary residence case of the same person (art. 42i as amended). The competent voivode is fixed at filing (art. 42o). The card is valid for 3 years from issue (art. 42p); the decision is due within 180 days of a complete application (art. 42l as amended by Dz.U. 2026 poz. 203 art. 17 pkt 27); stay is lawful until the card is collected or a refusal becomes final if the application is filed by 4 March 2027 (art. 42x, date set by art. 17 pkt 31). Start date 4 May 2026: Monitor Polski 2026 poz. 371. The Gdańsk voivodeship FAQ also names certain family members and a personal signature of the applicant, neither of which is in the text of art. 42c or 42f.",
          ru: "Ст. 42c закона о помощи гражданам Украины: гражданин Украины, чьё пребывание законно как получателя временной защиты (ст. 106 закона о защите иностранцев, отсылка установлена Dz.U. 2026 poz. 203, ст. 17 п. 22), со статусом UKR на 4 июня 2025 года (дата установлена законом Dz.U. 2025 poz. 1301, ст. 10 п. 18), на день заявления и непрерывно не менее 365 дней; ребёнок, рождённый в Польше, если карта выдана матери (ст. 42d). Заявление только электронно, через систему UdSC, заявитель подписывает квалифицированной подписью или профилем доверенным (ст. 42f ч. 5); поданное иначе оставляется без рассмотрения (ч. 7). Заявление считается поданным, только если в реестре PESEL полные данные паспорта, а в реестре — отпечатки и подпись (ст. 42g). Подача прекращает с силу закона незаконченное дело того же лица о временном пребывании (ст. 42i в новой редакции). Воевода определяется на момент подачи (ст. 42o). Карта действует 3 года со дня выдачи (ст. 42p); решение — в течение 180 дней от полного заявления (ст. 42l в редакции Dz.U. 2026 poz. 203, ст. 17 п. 27); пребывание законно до получения карты или окончательного отказа, если заявление подано до 4 марта 2027 года (ст. 42x, дата установлена ст. 17 п. 31). Дата начала — 4 мая 2026 года: Monitor Polski 2026 poz. 371. FAQ гданьского воеводства называет ещё некоторых членов семьи и личную подпись самого заявителя — ни того ни другого в тексте ст. 42c и 42f нет.",
          pl: "Art. 42c ustawy o pomocy obywatelom Ukrainy: obywatel Ukrainy przebywający legalnie jako beneficjent ochrony czasowej (art. 106 ustawy o udzielaniu cudzoziemcom ochrony, odesłanie ustalone Dz.U. 2026 poz. 203 art. 17 pkt 22), ze statusem UKR w dniu 4 czerwca 2025 (data ustalona ustawą Dz.U. 2025 poz. 1301 art. 10 pkt 18), w dniu złożenia wniosku i nieprzerwanie przez co najmniej 365 dni; dziecko urodzone w Polsce, jeżeli kartę wydano matce (art. 42d). Wniosek wyłącznie elektronicznie, w systemie Szefa UdSC, podpisany przez wnioskodawcę kwalifikowanym podpisem elektronicznym lub podpisem zaufanym (art. 42f ust. 5); złożony inaczej pozostawia się bez rozpoznania (ust. 7). Uznaje się go za złożony tylko przy kompletnych danych paszportowych w rejestrze PESEL oraz odciskach palców i podpisie w rejestrze (art. 42g). Złożenie wniosku umarza z mocy prawa niezakończone postępowanie tej osoby o pobyt czasowy (art. 42i w nowym brzmieniu). Właściwość wojewody ustala się w chwili złożenia wniosku (art. 42o). Karta jest ważna 3 lata od wydania (art. 42p); decyzja w terminie 180 dni od kompletnego wniosku (art. 42l w brzmieniu Dz.U. 2026 poz. 203 art. 17 pkt 27); pobyt jest legalny do odbioru karty lub ostatecznej odmowy, jeżeli wniosek złożono do 4 marca 2027 (art. 42x, data ustalona art. 17 pkt 31). Data startu 4 maja 2026: Monitor Polski 2026 poz. 371. FAQ Pomorskiego Urzędu Wojewódzkiego wymienia też niektórych członków rodziny i podpis osobisty wnioskodawcy — żadnego z nich nie ma w treści art. 42c ani 42f.",
        },
      },
      {
        subject: {
          en: "The CUKR card after collection, and how the permit is lost",
          ru: "Карта CUKR после получения и как потерять разрешение",
          pl: "Karta CUKR po odbiorze i jak utracić zezwolenie",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 42r: on collecting the card, the right of stay becomes by law a temporary residence permit for the card's validity; a card not collected within 60 days of the notice is cancelled and neither fee is refunded. Art. 42t: the permit is withdrawn if the holder has left Poland for at least 6 months, or on security grounds or an entry in the register of undesirable foreigners. Art. 42u: every change of place of stay is reported to the issuing voivode within 15 working days, or letters in a later case count as delivered to the old address. Art. 42v and 42w: no work permit is needed, and a business may be run on the terms that apply to Polish citizens. Temporary protection ends when a temporary residence permit is granted (art. 109b ust. 1 pkt 4 of the Act on granting protection). From official pages rather than the acts: time on the card counts towards the five years for EU long-term residence from the day of collection and UKR time does not (Gdańsk and Poznań voivodeship offices); the next permit follows the general rules (Gdańsk).",
          ru: "Ст. 42r: с получением карты право пребывания с силу закона становится разрешением на временное пребывание на срок действия карты; карта, не полученная в течение 60 дней от уведомления, аннулируется, и ни плата, ни сбор не возвращаются. Ст. 42t: разрешение отзывают, если держатель покинул Польшу на срок не меньше 6 месяцев, а также по соображениям безопасности или при записи в списке нежелательных иностранцев. Ст. 42u: о каждой смене места пребывания сообщают выдавшему карту воеводе в течение 15 рабочих дней, иначе письма по последующему делу считаются доставленными по старому адресу. Ст. 42v и 42w: разрешение на работу не нужно, бизнес можно вести на условиях граждан Польши. Временная защита прекращается с выдачей разрешения на временное пребывание (ст. 109b ч. 1 п. 4 закона о защите иностранцев). С официальных страниц, а не из актов: время на карте засчитывается в пять лет для статуса резидента ЕС со дня получения, время со статусом UKR — нет (воеводские управления Гданьска и Познани); следующее разрешение — на общих основаниях (Гданьск).",
          pl: "Art. 42r: z dniem odbioru karty uprawnienie do pobytu staje się z mocy prawa zezwoleniem na pobyt czasowy na okres ważności karty; karta nieodebrana w ciągu 60 dni od powiadomienia jest unieważniana, a ani opłata za kartę, ani opłata skarbowa nie podlegają zwrotowi. Art. 42t: zezwolenie cofa się, jeżeli posiadacz opuścił Polskę na okres co najmniej 6 miesięcy, a także ze względów bezpieczeństwa lub przy wpisie do wykazu cudzoziemców niepożądanych. Art. 42u: o każdej zmianie miejsca pobytu zawiadamia się wojewodę, który wydał kartę, w terminie 15 dni roboczych, inaczej pisma w późniejszym postępowaniu uważa się za doręczone pod dotychczasowym adresem. Art. 42v i 42w: zezwolenie na pracę nie jest wymagane, a działalność gospodarczą można prowadzić na zasadach obywateli polskich. Ochrona czasowa wygasa z udzieleniem zezwolenia na pobyt czasowy (art. 109b ust. 1 pkt 4 ustawy o udzielaniu cudzoziemcom ochrony). Ze stron urzędów, nie z ustaw: okres na karcie wlicza się do pięciu lat wymaganych do pobytu rezydenta długoterminowego UE od dnia odbioru, a okres ze statusem UKR — nie (urzędy wojewódzkie w Gdańsku i Poznaniu); kolejne zezwolenie na zasadach ogólnych (Gdańsk).",
        },
      },
      // THE ONE ROW ON THIS PAGE THAT IS A READING OF A CROSS-REFERENCE RATHER
      // THAN OF A DATE PRINTED IN AN ACT, and it says so. Kept because the
      // voivodeship pages still print 4 March 2027 for UKR stay while the act
      // they apply now points at the EU decision, which UdSC reports extended.
      {
        subject: {
          en: "UKR stay: 4 March 2027 or 4 March 2028",
          ru: "Пребывание со статусом UKR: до 4 марта 2027 или до 4 марта 2028 года",
          pl: "Pobyt ze statusem UKR: do 4 marca 2027 czy do 4 marca 2028",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 106 ust. 1 of the Act on granting protection, as worded by Dz.U. 2026 poz. 203 art. 4: a temporary protection beneficiary's stay is lawful from entry until the day the EU Council decision on mass influx remains in force, unless an act provides otherwise; art. 1–4a of the Act on assistance to citizens of Ukraine, which carried the earlier end date, were repealed (art. 17 pkt 1). The UdSC page of 6 August 2026: Council Implementing Decision (EU) 2026/1912 of 30 July 2026, in force from 5 August 2026, extends temporary protection to 4 March 2028, and new grants require fulfilled military obligations in Ukraine, except for those protected on 4 August 2026 who keep protection without a break; the Mazowieckie voivodeship's copy of the same notice gives 31 and 30 July. No other end date for the stay itself was found in the acts read, so by the text lawful UKR stay runs with the decision; this is a reading of the cross-reference, not a date printed in the act. The Gdańsk voivodeship FAQ still names 4 March 2027. The CUKR filing deadline of 4 March 2027 is a separate, express provision (art. 42x) and the EU extension does not move it. EUR-Lex refused automated reads.",
          ru: "Ст. 106 ч. 1 закона о защите иностранцев в редакции Dz.U. 2026 poz. 203, ст. 4: пребывание получателя временной защиты законно со дня въезда до дня, пока действует решение Совета ЕС о массовом притоке, если закон не устанавливает иначе; ст. 1–4a закона о помощи гражданам Украины, где стоял прежний срок, отменены (ст. 17 п. 1). Страница UdSC от 6 августа 2026 года: исполнительное решение Совета (ЕС) 2026/1912 от 30 июля 2026 года, в силе с 5 августа 2026 года, продлевает временную защиту до 4 марта 2028 года, а новым получателям её дают только при выполненных воинских обязанностях в Украине, кроме тех, кто пользовался защитой на 4 августа 2026 года и сохраняет её без перерыва; копия того же сообщения на сайте мазовецкого воеводы называет 31 и 30 июля. Иного срока для самого пребывания в прочитанных актах не найдено, поэтому по тексту законность пребывания UKR идёт вместе с решением; это чтение отсылки, а не дата, напечатанная в законе. FAQ гданьского воеводства всё ещё называет 4 марта 2027 года. Срок подачи на CUKR, 4 марта 2027 года, — отдельная прямая норма (ст. 42x), и продление ЕС его не переносит. EUR-Lex автоматическое чтение не пропустил.",
          pl: "Art. 106 ust. 1 ustawy o udzielaniu cudzoziemcom ochrony w brzmieniu Dz.U. 2026 poz. 203 art. 4: pobyt beneficjenta ochrony czasowej uznaje się za legalny od dnia wjazdu do dnia, w którym decyzja Rady UE o masowym napływie zachowuje moc, chyba że ustawa stanowi inaczej; art. 1–4a ustawy o pomocy obywatelom Ukrainy, gdzie był wcześniejszy termin, uchylono (art. 17 pkt 1). Strona UdSC z 6 sierpnia 2026: decyzja wykonawcza Rady (UE) 2026/1912 z 30 lipca 2026, w mocy od 5 sierpnia 2026, przedłuża ochronę czasową do 4 marca 2028, a nowym beneficjentom przyznaje się ją tylko po wypełnieniu obowiązków wojskowych w Ukrainie, z wyjątkiem osób korzystających z ochrony 4 sierpnia 2026 i zachowujących ją nieprzerwanie; kopia tego komunikatu na stronie Mazowieckiego Urzędu Wojewódzkiego podaje 31 i 30 lipca. W przeczytanych ustawach nie znaleziono innego terminu samego pobytu, więc według tekstu legalny pobyt UKR biegnie razem z decyzją; to odczytanie odesłania, a nie data wydrukowana w ustawie. FAQ Pomorskiego Urzędu Wojewódzkiego wciąż podaje 4 marca 2027. Termin złożenia wniosku o kartę CUKR, 4 marca 2027, to odrębny, wyraźny przepis (art. 42x) i przedłużenie unijne go nie przesuwa. EUR-Lex odrzucił automatyczny odczyt.",
        },
      },
      {
        subject: {
          en: "Leaving Poland while a case is pending, and the 30-day rule",
          ru: "Выезд из Польши во время дела и правило 30 дней",
          pl: "Wyjazd z Polski w trakcie postępowania i reguła 30 dni",
        },
        verdict: "added",
        checked: "2026-09-14",
        finding: {
          en: "The Mazowiecki voivodeship office's official answers (BIP, 14 August 2020): the stamp confirming an application does not entitle the holder to travel; one may leave for the country of origin but may not re-enter Poland on it. That answer concerns the stamp. The zaświadczenie that replaced it on 27 April 2026 lists, under art. 108 ust. 3, the holder's data, the filing and the text on lawful stay, and no right to cross a border — a reading of its content, not an express provision. For temporary protection: it ends if the person has left Poland for more than 30 days, and on the day a temporary or permanent residence or EU long-term resident permit is granted, art. 109b of the Act on granting protection, added by Dz.U. 2026 poz. 203 art. 4 pkt 5.",
          ru: "Официальные ответы Мазовецкого воеводского управления (BIP, 14 августа 2020 года): штамп о подаче заявления не даёт права на поездки; выехать в страну происхождения можно, вернуться в Польшу по нему нельзя. Этот ответ — о штампе. Заменившее его с 27 апреля 2026 года zaświadczenie по ст. 108 ч. 3 содержит данные держателя, факт подачи и текст о законности пребывания и не содержит права пересекать границу — это чтение состава документа, а не прямая норма. Для временной защиты: она прекращается, если человек покинул Польшу больше чем на 30 дней, а также в день выдачи разрешения на временное или постоянное пребывание или статуса резидента ЕС, ст. 109b закона о защите иностранцев, добавленная законом Dz.U. 2026 poz. 203, ст. 4 п. 5.",
          pl: "Oficjalne odpowiedzi Mazowieckiego Urzędu Wojewódzkiego (BIP, 14 sierpnia 2020): stempel potwierdzający złożenie wniosku nie uprawnia do podróżowania; można wyjechać do kraju pochodzenia, ale nie uprawnia do ponownego wjazdu do Polski. Odpowiedź dotyczy stempla. Zaświadczenie, które zastąpiło go 27 kwietnia 2026, zawiera zgodnie z art. 108 ust. 3 dane posiadacza, fakt złożenia wniosku i treść o legalności pobytu, a nie zawiera uprawnienia do przekraczania granicy — to odczytanie treści dokumentu, a nie wyraźny przepis. Ochrona czasowa wygasa, jeżeli cudzoziemiec opuścił Polskę na okres powyżej 30 dni, oraz w dniu udzielenia zezwolenia na pobyt czasowy, stały lub rezydenta długoterminowego UE, art. 109b ustawy o udzielaniu cudzoziemcom ochrony, dodany ustawą Dz.U. 2026 poz. 203 art. 4 pkt 5.",
        },
      },
      {
        subject: {
          en: "Five years in Poland lead to the EU long-term resident permit, not to “permanent residence”",
          ru: "Пять лет в Польше ведут к статусу резидента ЕС, а не к «постоянному пребыванию»",
          pl: "Pięć lat w Polsce prowadzi do zezwolenia rezydenta długoterminowego UE, a nie do „pobytu stałego”",
        },
        verdict: "added",
        checked: "2026-09-14",
        finding: {
          en: "Art. 211 of the Act on Foreigners: EU long-term resident status after 5 years of lawful, continuous stay immediately before the application, with stable and regular income, health insurance and Polish at B1 or a Polish school or degree taught in Polish. Income must exceed the social-assistance threshold for the applicant and each dependant (art. 140 ust. 2, via art. 211 ust. 2) and have been met for the last 3 years; the threshold from 1 January 2025 is 1010 zł for a single-person household and 823 zł per person in a family, Council of Ministers regulation Dz.U. 2024 poz. 1044. The permanent residence permit of art. 195 is granted on specific grounds instead — among them Polish descent, a valid Karta Polaka, three years of marriage to a Polish citizen plus two years of temporary residence on that basis, or five years as a refugee.",
          ru: "Ст. 211 закона об иностранцах: статус резидента ЕС после 5 лет законного непрерывного пребывания непосредственно перед заявлением, при стабильном и регулярном доходе, медицинской страховке и польском на уровне B1 либо польской школе или вузе с польским языком. Доход должен быть выше порога социальной помощи на заявителя и каждого иждивенца (ст. 140 ч. 2, через ст. 211 ч. 2) и соблюдаться последние 3 года; порог с 1 января 2025 года — 1010 zł для одиноко ведущего хозяйство и 823 zł на человека в семье, распоряжение Совета министров Dz.U. 2024 poz. 1044. Разрешение на постоянное пребывание ст. 195 даётся по особым основаниям — среди них польское происхождение, действительная Карта поляка, три года брака с гражданином Польши плюс два года временного пребывания на этом основании, пять лет в статусе беженца.",
          pl: "Art. 211 ustawy o cudzoziemcach: zezwolenie rezydenta długoterminowego UE po 5 latach legalnego i nieprzerwanego pobytu bezpośrednio przed wnioskiem, przy stabilnym i regularnym dochodzie, ubezpieczeniu zdrowotnym i znajomości polskiego na poziomie B1 lub polskiej szkole albo studiach po polsku. Dochód musi przekraczać próg z pomocy społecznej na wnioskodawcę i każdego członka rodziny na utrzymaniu (art. 140 ust. 2 przez art. 211 ust. 2) i być spełniany przez ostatnie 3 lata; próg od 1 stycznia 2025 wynosi 1010 zł dla osoby samotnie gospodarującej i 823 zł na osobę w rodzinie, rozporządzenie Rady Ministrów Dz.U. 2024 poz. 1044. Zezwolenie na pobyt stały z art. 195 udzielane jest z określonych podstaw — m.in. polskie pochodzenie, ważna Karta Polaka, trzy lata małżeństwa z obywatelem polskim i dwa lata pobytu czasowego z tego tytułu, pięć lat ze statusem uchodźcy.",
        },
      },
      {
        subject: {
          en: "Permanent residence and EU long-term resident: filing, breaks, loss and the card",
          ru: "Постоянное пребывание и резидент ЕС: подача, перерывы, потеря и карта",
          pl: "Pobyt stały i rezydent długoterminowy UE: wniosek, przerwy, utrata i karta",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, consolidated Dz.U. 2025 poz. 1079, with the MOS amendment Dz.U. 2025 poz. 1794. Permanent residence (art. 195) is granted on named grounds, among them a child of a Polish citizen or of a permanent or long-term resident, Polish descent, a valid Karta Polaka, 3 years of marriage to a Polish citizen with 2 continuous years on a marriage-based temporary permit immediately before, 4 years on a temporary residence and work permit for a profession desirable for the Polish economy (art. 114 ust. 1a) with stable income, 5 years as a refugee or 10 on tolerated stay. A stay counts as continuous if no break exceeded 6 months and all breaks together 10 months, with exceptions for work for a Polish employer abroad and similar (art. 195 ust. 4, art. 212 ust. 3–4). Applications are filed through MOS only, signed with a qualified or trusted signature (art. 203c–d, 219c–d); a long-term resident applicant shows a current legal title to housing, a loan-for-use agreement counting only from close family (art. 219a). Failing to appear, give fingerprints or a signature, or show the passport ends the case (art. 203i, 219i). The decision is due within 6 months, the appeal within 90 days (art. 210, applied to both by art. 223); at the voivode the time limit is suspended until 4 March 2027 (art. 100d). An application cannot be filed while on temporary protection or studies (art. 213), and permanent residence cannot be sought while holding long-term resident status (art. 196); permanent residence expires when long-term resident status is granted (art. 200). Loss: permanent residence after more than 6 years outside Poland, a sentence of at least 3 years, or divorce within 2 years of a marriage-based grant (art. 199); long-term residence after more than 6 years outside Poland or 12 consecutive months outside the EU (art. 215). The permits are indefinite; the card is valid 10 years for permanent residence and 5 for long-term residence (art. 243). Both give free access to the labour market (Dz.U. 2025 poz. 621, art. 3 ust. 1 pkt 6–7). Whether past UKR time counts towards the five years is not stated in art. 212; the Gdańsk and Poznań voivodeship pages say it does not.",
          ru: "Закон об иностранцах, сводный текст Dz.U. 2025 poz. 1079, с поправкой о MOS Dz.U. 2025 poz. 1794. Постоянное пребывание (ст. 195) дают по перечисленным основаниям, среди них ребёнок гражданина Польши или держателя постоянного разрешения или статуса резидента, польское происхождение, действительная Карта поляка, 3 года брака с гражданином Польши и 2 года непрерывно на временном разрешении по браку непосредственно перед подачей, 4 года на разрешении на пребывание и работу по профессии, желательной для польской экономики (ст. 114 ч. 1a), со стабильным доходом, 5 лет беженцем или 10 на толерируемом пребывании. Пребывание непрерывно, если ни один перерыв не дольше 6 месяцев и все вместе не больше 10, с исключениями для работы у польского работодателя за границей и похожих случаев (ст. 195 ч. 4, ст. 212 ч. 3–4). Заявление — только через MOS, с квалифицированной подписью или профилем доверенным (ст. 203c–d, 219c–d); заявитель на резидента показывает актуальный правовой титул на жильё, договор безвозмездного пользования — только от близких родственников (ст. 219a). Неявка, несданные отпечатки или подпись, непоказанный паспорт — дело прекращают (ст. 203i, 219i). Решение — 6 месяцев, жалоба — 90 дней (ст. 210, для обоих через ст. 223); у воеводы срок приостановлен до 4 марта 2027 года (ст. 100d). Нельзя подать, находясь на временной защите или учёбе (ст. 213), и нельзя просить постоянное, имея статус резидента (ст. 196); постоянное разрешение прекращается при выдаче статуса резидента (ст. 200). Потеря: постоянное — больше 6 лет вне Польши, приговор не меньше 3 лет, развод в течение 2 лет при разрешении по браку (ст. 199); резидент — больше 6 лет вне Польши или 12 месяцев подряд вне ЕС (ст. 215). Разрешения бессрочные; карта — 10 лет для постоянного и 5 для резидента (ст. 243). Оба дают свободный доступ к рынку труда (Dz.U. 2025 poz. 621, ст. 3 ч. 1 п. 6–7). Засчитывается ли в пять лет прошлое время со статусом UKR, ст. 212 не говорит; воеводства Гданьска и Познани пишут, что нет.",
          pl: "Ustawa o cudzoziemcach, tekst jednolity Dz.U. 2025 poz. 1079, z nowelizacją MOS Dz.U. 2025 poz. 1794. Zezwolenia na pobyt stały (art. 195) udziela się z wymienionych podstaw, m.in. dziecku obywatela polskiego lub posiadacza pobytu stałego albo rezydenta, osobie polskiego pochodzenia, posiadaczowi ważnej Karty Polaka, po 3 latach małżeństwa z obywatelem polskim i 2 latach nieprzerwanego pobytu czasowego z tego tytułu bezpośrednio przed wnioskiem, po 4 latach na zezwoleniu na pobyt czasowy i pracę w zawodzie pożądanym dla polskiej gospodarki (art. 114 ust. 1a) ze stabilnym dochodem, po 5 latach ze statusem uchodźcy lub 10 na pobycie tolerowanym. Pobyt jest nieprzerwany, jeżeli żadna przerwa nie przekroczyła 6 miesięcy, a łącznie 10 miesięcy, z wyjątkami m.in. dla pracy u polskiego pracodawcy za granicą (art. 195 ust. 4, art. 212 ust. 3–4). Wniosek wyłącznie przez MOS, z kwalifikowanym podpisem elektronicznym lub podpisem zaufanym (art. 203c–d, 219c–d); wnioskodawca o pobyt rezydenta przedstawia aktualny tytuł prawny do lokalu, a umowa użyczenia liczy się tylko od bliskiej rodziny (art. 219a). Niestawiennictwo, niezłożenie odcisków lub podpisu, nieokazanie paszportu — umorzenie postępowania (art. 203i, 219i). Decyzja w 6 miesięcy, odwołanie w 90 dni (art. 210, dla obu przez art. 223); u wojewody termin zawieszony do 4 marca 2027 (art. 100d). Nie można złożyć wniosku, przebywając na ochronie czasowej lub studiach (art. 213), ani ubiegać się o pobyt stały, mając status rezydenta (art. 196); pobyt stały wygasa z udzieleniem zezwolenia rezydenta (art. 200). Utrata: pobyt stały — ponad 6 lat poza Polską, skazanie na co najmniej 3 lata, rozwód w ciągu 2 lat przy zezwoleniu z tytułu małżeństwa (art. 199); rezydent — ponad 6 lat poza Polską lub 12 kolejnych miesięcy poza UE (art. 215). Zezwolenia są bezterminowe; karta ważna 10 lat dla pobytu stałego i 5 dla rezydenta (art. 243). Oba dają swobodny dostęp do rynku pracy (Dz.U. 2025 poz. 621, art. 3 ust. 1 pkt 6–7). Czy do pięciu lat wlicza się dawny okres ze statusem UKR, art. 212 nie mówi; strony urzędów w Gdańsku i Poznaniu podają, że nie.",
        },
      },
      {
        subject: {
          en: "Citizenship: three years now, and what the ten-year bills would change",
          ru: "Гражданство: сейчас три года, и что изменили бы проекты о десяти годах",
          pl: "Obywatelstwo: dziś trzy lata i co zmieniłyby projekty o dziesięciu latach",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 30 ust. 1 pkt 1 of the Act on Polish Citizenship, consolidated Dz.U. 2025 poz. 1611: recognition after 3 years of continuous stay on a permanent residence or EU long-term resident permit, with stable income and a legal title to housing; 2 years with 3 years of marriage to a Polish citizen or statelessness (pkt 2); 1 year on permanent residence obtained through Polish descent or a Karta Polaka (pkt 7). Polish at B1 by official certificate or a school in Poland (ust. 2). Sejm data: the deputies' bill, print 1888, raising 3 years to 10 and lengthening the other periods of art. 30 as well, was rejected at first reading on 9 January 2026, 240 to 200. Two bills raising pkt 1 from 3 years to 10 are still open, both keeping proceedings already begun under the current text in their art. 2: the deputies' print 1273, submitted 5 May 2025, referred to committee on 10 June 2025, with a government position of 21 August 2025 whose content is a scan that was not read; and the President's print 1759, submitted 29 September 2025, referred to committee on 4 November 2025. Neither had moved by 15 September 2026. The fee for the decision is 1000 zł, stamp duty act Dz.U. 2025 poz. 1154, annex item 26.",
          ru: "Ст. 30 ч. 1 п. 1 закона о польском гражданстве, сводный текст Dz.U. 2025 poz. 1611: признание после 3 лет непрерывного пребывания на постоянном разрешении или статусе резидента ЕС, при стабильном доходе и праве на жильё; 2 года — при трёх годах брака с гражданином Польши или без гражданства (п. 2); 1 год — на постоянном разрешении, полученном из-за польского происхождения или Карты поляка (п. 7). Польский на уровне B1 по официальному сертификату или школа в Польше (ч. 2). Данные Сейма: депутатский проект, друк 1888, поднимавший срок с 3 до 10 лет и удлинявший остальные сроки ст. 30, отклонён в первом чтении 9 января 2026 года, 240 против 200. Открыты два проекта, поднимающие п. 1 с 3 лет до 10, оба в своей ст. 2 сохраняют прежний текст для уже начатых дел: депутатский друк 1273, внесён 5 мая 2025 года, направлен в комиссию 10 июня 2025 года, позиция правительства от 21 августа 2025 года — скан, содержание не прочитано; и президентский друк 1759, внесён 29 сентября 2025 года, направлен в комиссию 4 ноября 2025 года. На 15 сентября 2026 года ни один не сдвинулся. Сбор за решение — 1000 zł, закон о гербовом сборе Dz.U. 2025 poz. 1154, приложение, п. 26.",
          pl: "Art. 30 ust. 1 pkt 1 ustawy o obywatelstwie polskim, tekst jednolity Dz.U. 2025 poz. 1611: uznanie po 3 latach nieprzerwanego pobytu na podstawie zezwolenia na pobyt stały lub rezydenta długoterminowego UE, przy stabilnym dochodzie i tytule prawnym do lokalu; 2 lata przy trzech latach małżeństwa z obywatelem polskim lub bezpaństwowości (pkt 2); 1 rok na pobycie stałym uzyskanym w związku z polskim pochodzeniem lub Kartą Polaka (pkt 7). Polski na poziomie B1 poświadczony urzędowo lub szkoła w Polsce (ust. 2). Dane Sejmu: poselski projekt, druk 1888, wydłużający okres z 3 do 10 lat oraz pozostałe okresy z art. 30, odrzucony w pierwszym czytaniu 9 stycznia 2026, 240 do 200. Otwarte są dwa projekty podnoszące pkt 1 z 3 do 10 lat, oba w art. 2 zachowują dotychczasowe brzmienie dla postępowań już wszczętych: poselski druk 1273, wniesiony 5 maja 2025, skierowany do komisji 10 czerwca 2025, ze stanowiskiem rządu z 21 sierpnia 2025, którego treść jest skanem i nie została odczytana; oraz prezydencki druk 1759, wniesiony 29 września 2025, skierowany do komisji 4 listopada 2025. Do 15 września 2026 żaden nie ruszył. Opłata za decyzję to 1000 zł, ustawa o opłacie skarbowej Dz.U. 2025 poz. 1154, załącznik, poz. 26.",
        },
      },
      {
        subject: {
          en: "Citizenship: recognition by the voivode or a grant by the President",
          ru: "Гражданство: признание у воеводы или предоставление Президентом",
          pl: "Obywatelstwo: uznanie u wojewody czy nadanie przez Prezydenta",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Polish Citizenship, consolidated Dz.U. 2025 poz. 1611. Recognition (art. 30 ust. 1) also covers 2 years on a permanent or long-term permit for a spouse of a Polish citizen of at least 3 years or a stateless person, 2 years on a permanent permit obtained through refugee status, 10 years of lawful continuous stay with such a permit, income and housing, and 1 year on a permanent permit obtained through Polish descent or a Karta Polaka. Polish is shown by an official B1 certificate or a school certificate from Poland or a Polish-language school abroad (ust. 2–2a); a university degree is not among them. Continuity follows art. 195 ust. 4 of the Act on Foreigners (ust. 3). The application goes to the voivode of the place of residence (art. 34, 36); the decision is due within 6 months of filing (art. 10 ust. 3a, in force since 1 August 2025), with the interior minister as the higher authority (ust. 4); art. 100d of the Act on assistance to citizens of Ukraine does not list citizenship cases. Recognition of parents covers minors in their care, a child over 16 consenting (art. 7–8). The President may grant citizenship with no statutory conditions (art. 18), on an application filed through a voivode or consul (art. 21), by a decision to which the Code of Administrative Procedure and judicial review do not apply (art. 10 ust. 1); citizenship is acquired on the day of the decision (art. 26). An application to the President ends a pending recognition case (art. 23), and a recognition application filed while a presidential case is pending is itself discontinued (art. 35 ust. 1). A Polish citizen holding another citizenship has the same rights and duties and cannot invoke the other citizenship before Polish authorities (art. 3). Stamp duty: 1000 zł for a recognition decision, 277 zł for confirming citizenship, 1669 zł for filing an application to the President (annex, items 26, 27, 27a).",
          ru: "Закон о польском гражданстве, сводный текст Dz.U. 2025 poz. 1611. Признание (ст. 30 ч. 1) охватывает ещё 2 года на постоянном разрешении или резиденте ЕС для супруга гражданина Польши в браке не меньше 3 лет или лица без гражданства, 2 года на постоянном разрешении, полученном из-за статуса беженца, 10 лет законного непрерывного пребывания с таким разрешением, доходом и жильём и 1 год на постоянном разрешении, полученном из-за польского происхождения или Карты поляка. Польский подтверждают официальным сертификатом B1 или аттестатом школы в Польше либо школы с польским языком за границей (ч. 2–2a); диплома вуза в перечне нет. Непрерывность — по ст. 195 ч. 4 закона об иностранцах (ч. 3). Заявление подаётся воеводе по месту жительства (ст. 34, 36); решение — в течение 6 месяцев от подачи (ст. 10 ч. 3a, с 1 августа 2025 года), вышестоящий орган — министр внутренних дел (ч. 4); ст. 100d закона о помощи гражданам Украины дела о гражданстве не перечисляет. Признание родителей распространяется на несовершеннолетних под их властью, ребёнок старше 16 лет даёт согласие (ст. 7–8). Президент может предоставить гражданство без условий, установленных законом (ст. 18), по заявлению через воеводу или консула (ст. 21), решением, к которому не применяются кодекс административного производства и судебный контроль (ст. 10 ч. 1); гражданство возникает в день решения (ст. 26). Заявление Президенту прекращает идущее дело о признании (ст. 23), а заявление о признании, поданное при идущем деле у Президента, само прекращается (ст. 35 ч. 1). Гражданин Польши с другим гражданством имеет те же права и обязанности и не может ссылаться на другое гражданство перед польскими властями (ст. 3). Гербовый сбор: 1000 zł за решение о признании, 277 zł за подтверждение гражданства, 1669 zł за подачу заявления Президенту (приложение, п. 26, 27, 27a).",
          pl: "Ustawa o obywatelstwie polskim, tekst jednolity Dz.U. 2025 poz. 1611. Uznanie (art. 30 ust. 1) obejmuje też 2 lata na pobycie stałym lub rezydenta dla małżonka obywatela polskiego od co najmniej 3 lat albo bezpaństwowca, 2 lata na pobycie stałym uzyskanym w związku ze statusem uchodźcy, 10 lat legalnego nieprzerwanego pobytu z takim zezwoleniem, dochodem i lokalem oraz 1 rok na pobycie stałym uzyskanym w związku z polskim pochodzeniem lub Kartą Polaka. Znajomość polskiego potwierdza urzędowe poświadczenie B1 albo świadectwo szkoły w Polsce lub szkoły z polskim językiem wykładowym za granicą (ust. 2–2a); dyplomu uczelni w tym wykazie nie ma. Nieprzerwaność według art. 195 ust. 4 ustawy o cudzoziemcach (ust. 3). Wniosek składa się do wojewody właściwego ze względu na miejsce zamieszkania (art. 34, 36); decyzja w terminie 6 miesięcy od wpływu (art. 10 ust. 3a, od 1 sierpnia 2025), organem wyższego stopnia jest minister spraw wewnętrznych (ust. 4); art. 100d ustawy o pomocy obywatelom Ukrainy nie wymienia spraw obywatelskich. Uznanie rodziców obejmuje małoletnich pod ich władzą, dziecko powyżej 16 lat wyraża zgodę (art. 7–8). Prezydent może nadać obywatelstwo bez ustawowych warunków (art. 18), na wniosek złożony za pośrednictwem wojewody lub konsula (art. 21), postanowieniem, do którego nie stosuje się KPA ani kontroli sądowej (art. 10 ust. 1); obywatelstwo nabywa się w dniu postanowienia (art. 26). Wniosek do Prezydenta umarza toczące się postępowanie o uznanie (art. 23), a wniosek o uznanie złożony w toku postępowania u Prezydenta sam podlega umorzeniu (art. 35 ust. 1). Obywatel polski mający inne obywatelstwo ma te same prawa i obowiązki i nie może powoływać się na nie wobec władz polskich (art. 3). Opłata skarbowa: 1000 zł za decyzję o uznaniu, 277 zł za potwierdzenie obywatelstwa, 1669 zł za złożenie wniosku do Prezydenta (załącznik, poz. 26, 27, 27a).",
        },
      },
      {
        subject: {
          en: "Buying property in Poland as a foreigner: when the MSWiA permit is required",
          ru: "Покупка недвижимости в Польше иностранцем: когда нужно разрешение MSWiA",
          pl: "Nabycie nieruchomości w Polsce przez cudzoziemca: kiedy potrzebne jest zezwolenie MSWiA",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "Act of 24 March 1920 on the acquisition of real estate by foreigners, consolidated Dz.U. 2017 poz. 2278. Acquisition by a foreigner needs a permit, issued by the minister of the interior unless the minister of defence objects — and for agricultural land also the minister of rural development — the objection being made within 14 days of the request, extendable to 2 months (art. 1 ust. 1–1a). A foreigner is a natural person without Polish citizenship, a legal person seated abroad, such persons' partnership seated abroad, and a company seated in Poland controlled directly or indirectly by them — control being over 50% of votes or a dominant position (art. 1 ust. 2–3). Acquisition means ownership or perpetual usufruct, on any legal event (ust. 4). A permit is issued if the purchase threatens neither defence, state security nor public order, and the buyer shows ties with Poland: Polish nationality or origin, marriage to a Polish citizen, a temporary residence permit (except those under art. 176 and 181 ust. 1 of the Act on Foreigners), a permanent or EU long-term resident permit, membership of the management body of such a company, or running a business or a farm in Poland (art. 1a ust. 1–2). Property bought for the buyer's own living needs may not exceed 0.5 ha (ust. 5). The permit names the buyer, the seller and the object, may set special conditions (art. 2 ust. 2, art. 3 ust. 1) and is valid two years (art. 3 ust. 2); in a special economic zone the decision is due within a month (art. 3a); a foreigner may first obtain a promesa, valid a year, during which a permit cannot be refused unless the facts change (art. 3d). Acquiring shares that make a property-owning Polish company controlled needs the same permit (art. 3e). Without the permit no notarial act and no land register entry may be made (art. 5), and an acquisition against the act is invalid, the nullity declared by a court also on the demand of the mayor, the starosta, the marshal, the voivode or the minister (art. 6). Stamp duty is 1,570 zł, annex part III item 8 of the stamp duty act, Dz.U. 2025 poz. 1154.",
          ru: "Закон от 24 марта 1920 года о приобретении недвижимости иностранцами, сводный текст Dz.U. 2017 poz. 2278. Приобретение иностранцем требует разрешения, которое выдаёт министр внутренних дел, если не возразит министр обороны, а для сельхозземли — ещё и министр сельского развития; возражение заявляется в течение 14 дней со дня обращения, срок может быть продлён до 2 месяцев (ст. 1 ч. 1–1a). Иностранец — физическое лицо без польского гражданства, юридическое лицо с местом нахождения за границей, товарищество таких лиц за границей и компания с местом нахождения в Польше, контролируемая ими прямо или косвенно; контроль — больше 50% голосов или доминирующее положение (ст. 1 ч. 2–3). Приобретением считается получение права собственности или права бессрочного пользования по любому правовому событию (ч. 4). Разрешение выдают, если покупка не угрожает обороноспособности, безопасности государства и общественному порядку, а покупатель докажет связи с Польшей: польская национальность или происхождение, брак с гражданином Польши, разрешение на временное пребывание (кроме ст. 176 и 181 ч. 1 закона об иностранцах), постоянное разрешение или статус резидента ЕС, членство в органе управления такой компании, ведение в Польше бизнеса или сельского хозяйства (ст. 1a ч. 1–2). Недвижимость для собственных жизненных потребностей — не больше 0,5 га (ч. 5). В разрешении указывают покупателя, продавца и предмет, могут поставить специальные условия (ст. 2 ч. 2, ст. 3 ч. 1); оно действует два года (ст. 3 ч. 2); в специальной экономической зоне решение выносят в течение месяца (ст. 3a); можно сначала получить promesa — обещание разрешения на год, в течение которого в разрешении не могут отказать, если не изменились обстоятельства (ст. 3d). Покупка долей, после которой владеющая недвижимостью польская компания становится контролируемой, требует такого же разрешения (ст. 3e). Без разрешения нотариус не совершит сделку и запись в земельной книге не сделают (ст. 5), а покупка вопреки закону недействительна; недействительность устанавливает суд, в том числе по требованию войта, старосты, маршала воеводства, воеводы или министра (ст. 6). Гербовый сбор — 1570 zł, приложение, часть III п. 8 закона о гербовом сборе, Dz.U. 2025 poz. 1154.",
          pl: "Ustawa z 24 marca 1920 r. o nabywaniu nieruchomości przez cudzoziemców, tekst jednolity Dz.U. 2017 poz. 2278. Nabycie przez cudzoziemca wymaga zezwolenia ministra właściwego do spraw wewnętrznych, jeżeli sprzeciwu nie wniesie Minister Obrony Narodowej, a przy nieruchomościach rolnych także minister właściwy do spraw rozwoju wsi; sprzeciw w terminie 14 dni od doręczenia wystąpienia, z możliwością przedłużenia do 2 miesięcy (art. 1 ust. 1–1a). Cudzoziemcem jest osoba fizyczna bez obywatelstwa polskiego, osoba prawna z siedzibą za granicą, spółka takich osób za granicą oraz spółka z siedzibą w Polsce kontrolowana bezpośrednio lub pośrednio przez nie — kontrola to powyżej 50% głosów lub pozycja dominująca (art. 1 ust. 2–3). Nabyciem jest nabycie własności lub użytkowania wieczystego na podstawie każdego zdarzenia prawnego (ust. 4). Zezwolenie wydaje się, jeżeli nabycie nie zagraża obronności, bezpieczeństwu państwa ani porządkowi publicznemu, a cudzoziemiec wykaże więzi z Polską: narodowość lub pochodzenie polskie, małżeństwo z obywatelem RP, zezwolenie na pobyt czasowy (poza art. 176 i 181 ust. 1 ustawy o cudzoziemcach), pobyt stały lub rezydenta długoterminowego UE, członkostwo w organie zarządzającym takiej spółki, wykonywanie działalności gospodarczej lub rolniczej w Polsce (art. 1a ust. 1–2). Powierzchnia na potrzeby życiowe nie może przekroczyć 0,5 ha (ust. 5). Zezwolenie wskazuje nabywcę, zbywcę i przedmiot, może określać warunki specjalne (art. 2 ust. 2, art. 3 ust. 1) i jest ważne dwa lata (art. 3 ust. 2); w specjalnej strefie ekonomicznej decyzja w miesiąc (art. 3a); możliwa jest promesa ważna rok, w czasie której nie można odmówić zezwolenia, chyba że zmienił się stan faktyczny (art. 3d). Nabycie udziałów, w wyniku którego spółka będąca właścicielem nieruchomości staje się kontrolowana, wymaga zezwolenia (art. 3e). Bez zezwolenia nie dokonuje się czynności prawnych ani wpisów (art. 5), a nabycie wbrew ustawie jest nieważne; o nieważności orzeka sąd, także na żądanie wójta, starosty, marszałka, wojewody lub ministra (art. 6). Opłata skarbowa 1570 zł, załącznik część III poz. 8 ustawy o opłacie skarbowej, Dz.U. 2025 poz. 1154.",
        },
      },
      {
        subject: {
          en: "When a foreigner needs no permit — and the border zone where the exemptions stop",
          ru: "Когда разрешение не нужно — и приграничная зона, где освобождения не действуют",
          pl: "Kiedy cudzoziemiec nie potrzebuje zezwolenia — i strefa nadgraniczna, w której zwolnienia nie działają",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "Art. 8 ust. 1 of the Act of 1920: no permit is needed to buy a self-contained residential unit within the meaning of the Act on the ownership of premises, or a self-contained garage unit serving the buyer's housing needs; by a foreigner who has lived in Poland at least 5 years since being granted a permanent or EU long-term resident permit; by the spouse of a Polish citizen living in Poland at least 2 years since such a permit, where the property becomes marital joint property; by a person who on the day of purchase would inherit from the seller under statute, where the seller has owned it at least 5 years; by a Poland-seated controlled company for its statutory purposes, undeveloped land up to 0.4 ha in total in urban areas; and in two banking cases. Buying a second home — property for housing or recreation that will not be the buyer's permanent home — is outside the flat exemption (art. 1 ust. 5). Citizens and businesses of the EEA and Switzerland need no permit, with transitional exceptions for agricultural and forest land for 12 years and for a second home for 5 years from Poland's accession on 1 May 2004 (art. 8 ust. 2, 2a); both periods have run out by our count, so the exemption is now unconditional — a computation, not a sentence in the act. ⚠ The exemptions of ust. 1 do not apply to property in the border zone, nor to farm land over 1 ha (art. 8 ust. 3) — so even a flat there needs a permit. The border zone is the whole area of the communes adjoining the state border or the sea shore, and where that is narrower than 15 km, the neighbouring communes as well; the minister publishes the list (art. 12 of the Act on the protection of the state border, consolidated Dz.U. 2026 poz. 919). Inheritance under statute needs no permit; an heir under a will who does not obtain a permit within two years of the succession opening loses the property to the statutory heirs (art. 7 ust. 2–3). The minister keeps a register of what was bought with and without a permit (art. 8 ust. 4) and reports to the Sejm each year by 31 March (art. 4). A notary sends the deed to the minister within 7 days (art. 8a ust. 1); from three months after 18 August 2026 — 19 November 2026 by our count — the amendment Dz.U. 2026 poz. 1099 has the notary place those documents in the notarial repository instead and charge the parties a fee for it, the amount to be set by regulation.",
          ru: "Ст. 8 ч. 1 закона 1920 года: разрешение не нужно для покупки самостоятельного жилого помещения в понимании закона о собственности на помещения и самостоятельного гаражного помещения, связанного с жилищными потребностями; иностранцу, прожившему в Польше не меньше 5 лет со дня выдачи ему постоянного разрешения или статуса резидента ЕС; супругу гражданина Польши, живущему в Польше не меньше 2 лет со дня такого разрешения, если недвижимость станет совместной собственностью супругов; тому, кто на день покупки наследовал бы продавцу по закону, если продавец владеет ею не меньше 5 лет; контролируемой компании с местом нахождения в Польше — для уставных целей, незастроенная земля до 0,4 га суммарно в городах; и в двух банковских случаях. Покупка второго дома — недвижимости под жильё или отдых, которая не станет постоянным местом жительства, — под освобождение для квартиры не подпадает (ст. 1 ч. 5). Гражданам и предпринимателям ЕЭП и Швейцарии разрешение не нужно, с переходными исключениями для сельскохозяйственной и лесной земли на 12 лет и для второго дома на 5 лет со дня вступления Польши в ЕС 1 мая 2004 года (ст. 8 ч. 2, 2a); по нашему счёту оба срока истекли, поэтому освобождение сейчас безусловное — это расчёт, а не фраза из закона. ⚠ Освобождения части 1 не действуют для недвижимости в приграничной зоне и для сельхозземли больше 1 га (ст. 8 ч. 3) — то есть там даже на квартиру нужно разрешение. Приграничная зона — вся территория гмин, прилегающих к государственной границе или морскому берегу, а если так она уже 15 км, то и соседних гмин; перечень объявляет министр (ст. 12 закона об охране государственной границы, сводный текст Dz.U. 2026 poz. 919). Наследование по закону разрешения не требует; наследник по завещанию, не получивший разрешения в течение двух лет со дня открытия наследства, теряет недвижимость в пользу наследников по закону (ст. 7 ч. 2–3). Министр ведёт реестр купленного с разрешением и без него (ст. 8 ч. 4) и ежегодно до 31 марта отчитывается перед Сеймом (ст. 4). Нотариус направляет акт министру за 7 дней (ст. 8a ч. 1); через три месяца после 18 августа 2026 года — по нашему счёту с 19 ноября 2026 года — по поправке Dz.U. 2026 poz. 1099 нотариус вместо этого помещает документы в нотариальный репозиторий и берёт за это со сторон плату, размер которой установит распоряжение.",
          pl: "Art. 8 ust. 1 ustawy z 1920 r.: zezwolenia nie wymaga nabycie samodzielnego lokalu mieszkalnego w rozumieniu ustawy o własności lokali ani samodzielnego lokalu garażowego związanego z potrzebami mieszkaniowymi; nabycie przez cudzoziemca mieszkającego w Polsce co najmniej 5 lat od udzielenia mu pobytu stałego lub rezydenta długoterminowego UE; przez małżonka obywatela polskiego mieszkającego w Polsce co najmniej 2 lata od takiego zezwolenia, jeżeli nieruchomość wejdzie do wspólności ustawowej; przez osobę uprawnioną w dniu nabycia do dziedziczenia ustawowego po zbywcy, gdy zbywca jest właścicielem co najmniej 5 lat; przez spółkę kontrolowaną z siedzibą w Polsce na cele statutowe — nieruchomości niezabudowane do 0,4 ha łącznie na obszarze miast; oraz w dwóch przypadkach bankowych. Nabycie drugiego domu — nieruchomości pod zabudowę mieszkaniową lub cele rekreacyjno-wypoczynkowe, która nie będzie stałym miejscem zamieszkania — nie korzysta ze zwolnienia dla lokalu (art. 1 ust. 5). Obywatele i przedsiębiorcy EOG i Szwajcarii nie potrzebują zezwolenia, z przejściowymi wyjątkami dla nieruchomości rolnych i leśnych przez 12 lat i dla drugiego domu przez 5 lat od przystąpienia Polski do UE 1 maja 2004 (art. 8 ust. 2, 2a); według naszego wyliczenia oba okresy upłynęły, więc zwolnienie jest dziś bezwarunkowe — to wyliczenie, nie zdanie ustawy. ⚠ Zwolnień z ust. 1 nie stosuje się do nieruchomości w strefie nadgranicznej ani do gruntów rolnych powyżej 1 ha (art. 8 ust. 3) — tam zezwolenia wymaga nawet lokal. Strefa nadgraniczna obejmuje cały obszar gmin przyległych do granicy państwowej lub brzegu morskiego, a gdy jest węższa niż 15 km — także gmin sąsiednich; wykaz ogłasza minister (art. 12 ustawy o ochronie granicy państwowej, tekst jednolity Dz.U. 2026 poz. 919). Dziedziczenie ustawowe nie wymaga zezwolenia; spadkobierca testamentowy, który nie uzyska zezwolenia w ciągu dwóch lat od otwarcia spadku, traci nieruchomość na rzecz spadkobierców ustawowych (art. 7 ust. 2–3). Minister prowadzi rejestr nabyć z zezwoleniem i bez (art. 8 ust. 4) i co roku do 31 marca składa Sejmowi sprawozdanie (art. 4). Notariusz przesyła wypis ministrowi w 7 dni (art. 8a ust. 1); po upływie trzech miesięcy od 18 sierpnia 2026 — według naszego wyliczenia od 19 listopada 2026 — nowelizacja Dz.U. 2026 poz. 1099 nakazuje notariuszowi umieszczać te dokumenty w Repozytorium i pobierać za to opłatę od stron, w wysokości określonej rozporządzeniem.",
        },
      },
      {
        subject: {
          en: "What a purchase costs: transaction tax, the notary's tariff and the land-register fees",
          ru: "Во что обходится покупка: налог на сделку, такса нотариуса и сборы земельной книги",
          pl: "Ile kosztuje zakup: podatek od czynności, taksa notarialna i opłaty wieczystoksięgowe",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "PCC act, consolidated Dz.U. 2026 poz. 191: a sale of real estate, perpetual usufruct or a cooperative ownership right is taxed at 2%, other property rights at 1%, a mortgage securing an unfixed sum at 19 zł and otherwise at 0.1% (art. 7 ust. 1 pkt 1 and 7); the buyer owes it (art. 4 pkt 1) on the market value, not the price written down (art. 6 ust. 1 pkt 1 and ust. 2), and where the authority's expert puts that value more than 33% above the declared one, the buyer pays for the opinion (ust. 3–4). A rate of 20% applies where the transaction is first disclosed during an audit or proceedings (art. 7 ust. 5). The tax is declared and paid within 14 days, except where a payer collects it — and for a notarial deed the notary is that payer and must not perform the act before the tax is paid (art. 10 ust. 1, 2, 3). A transaction taxed under VAT is outside PCC, and so is one where a party is VAT-exempt — but sales of real estate, perpetual usufruct and cooperative rights are carved back out of that second limb and stay taxed (art. 2 pkt 4). Exempt: a first home, where the buyer is a natural person who held no such right before, unless an inherited share of at most 50% (art. 9 pkt 17); and farmland creating or enlarging a farm of 11 to 300 ha kept five years, as de minimis aid (art. 9 pkt 2). A sixth and each further flat bought from one seller in one development, VAT-taxed, is at 6% (art. 7a). VAT act, consolidated Dz.U. 2025 poz. 775: the standard rate is 23% and the reduced 8% while defence spending exceeds 3% of GDP (art. 146ef ust. 1 pkt 1–2); the 8% covers housing under the social housing programme, from which houses over 300 m² and flats over 150 m² are excluded, the excess area being taxed at the standard rate (art. 41 ust. 12, 12a–12c). Notarial tariff, Dz.U. 2024 poz. 1566: maximum 1,010 zł + 0.4% above 60,000 zł up to 1,000,000 zł; 4,770 zł + 0.2% above 1,000,000; 6,770 zł + 0.25% above 2,000,000, capped at 10,000 zł (§ 3). A sale of a residential unit or of a house with its land takes half that (§ 6 pkt 18–19), a mortgage deed securing a housing loan a quarter (§ 7 ust. 1 pkt 1); copies of the deed are 6 zł a started page (§ 12). These are maxima, and they are net of VAT — the regulation says nothing about VAT. Court fees, costs act consolidated Dz.U. 2025 poz. 1228: 200 zł to enter ownership, perpetual usufruct or a limited property right, proportional for a share but not under 100 zł, 150 zł where the title is inheritance, division of an estate or of joint property, or farmland up to 5 ha; 100 zł to open a land register, to join, to split, to correct section I-O or to enter a warning; half the entry fee to delete one (art. 42–46).",
          ru: "Закон о PCC, сводный текст Dz.U. 2026 poz. 191: продажа недвижимости, права бессрочного пользования и кооперативного права собственности облагается по ставке 2%, другие имущественные права — 1%, ипотека на неопределённую сумму — 19 zł, в остальном — 0,1% (ст. 7 ч. 1 п. 1 и 7); платит покупатель (ст. 4 п. 1) с рыночной стоимости, а не с написанной в договоре цены (ст. 6 ч. 1 п. 1 и ч. 2), и если оценка эксперта налогового органа превысит заявленную больше чем на 33%, экспертизу оплачивает налогоплательщик (ч. 3–4). Ставка 20% применяется, если о сделке стало известно только в ходе проверки или производства (ст. 7 ч. 5). Налог декларируют и платят в течение 14 дней, кроме случаев, когда его взимает плательщик-посредник, — а при нотариальном акте таким посредником является нотариус, и он не совершит действие, пока налог не уплачен (ст. 10 ч. 1, 2, 3). Сделка, облагаемая НДС, под PCC не подпадает, как и сделка, где сторона освобождена от НДС, — но продажа недвижимости, права бессрочного пользования и кооперативных прав из этого второго случая изъята и облагается (ст. 2 п. 4). Освобождены: первое жильё, если покупатель — физическое лицо, у которого раньше не было такого права, кроме унаследованной доли не больше 50% (ст. 9 п. 17); и сельхозземля, создающая или увеличивающая хозяйство от 11 до 300 га, которое ведут пять лет, как помощь de minimis (ст. 9 п. 2). Шестая и каждая следующая квартира, купленная у одного продавца в одной застройке и облагаемая НДС, — 6% (ст. 7a). Закон о НДС, сводный текст Dz.U. 2025 poz. 775: основная ставка 23%, пониженная 8%, пока расходы на оборону превышают 3% ВВП (ст. 146ef ч. 1 п. 1–2); 8% охватывает жильё по социальной жилищной программе, из которой исключены дома больше 300 м² и квартиры больше 150 м², а превышение облагается основной ставкой (ст. 41 ч. 12, 12a–12c). Нотариальный тариф, Dz.U. 2024 poz. 1566: максимум 1010 zł + 0,4% свыше 60 000 zł до 1 000 000 zł; 4770 zł + 0,2% свыше 1 000 000; 6770 zł + 0,25% свыше 2 000 000, но не больше 10 000 zł (§ 3). Продажа жилого помещения и дома с участком — половина этого (§ 6 п. 18–19), акт об ипотеке под жилищный кредит — четверть (§ 7 ч. 1 п. 1); выписки из акта — 6 zł за начатую страницу (§ 12). Это максимумы, и они без НДС — о налоге распоряжение не говорит ничего. Судебные сборы, закон о судебных издержках, сводный текст Dz.U. 2025 poz. 1228: 200 zł за запись права собственности, бессрочного пользования или ограниченного вещного права, пропорционально для доли, но не меньше 100 zł, 150 zł, если основание — наследство, раздел наследства или раздел общего имущества супругов, либо сельхозучасток до 5 га; 100 zł за заведение земельной книги, объединение, отделение, исправление раздела I-O и запись предупреждения; половина сбора за запись — за её вычёркивание (ст. 42–46).",
          pl: "Ustawa o PCC, tekst jednolity Dz.U. 2026 poz. 191: sprzedaż nieruchomości, użytkowania wieczystego i spółdzielczego własnościowego prawa do lokalu jest opodatkowana stawką 2%, inne prawa majątkowe 1%, hipoteka na kwotę nieustaloną 19 zł, poza tym 0,1% (art. 7 ust. 1 pkt 1 i 7); podatek ciąży na kupującym (art. 4 pkt 1) i liczy się od wartości rynkowej, a nie od ceny wpisanej do umowy (art. 6 ust. 1 pkt 1 i ust. 2); gdy wartość ustalona z opinią biegłego różni się o więcej niż 33% od podanej, koszty opinii ponosi podatnik (ust. 3–4). Stawka 20% dotyczy czynności ujawnionej dopiero w toku kontroli lub postępowania (art. 7 ust. 5). Podatek deklaruje się i płaci w 14 dni, z wyłączeniem przypadków poboru przez płatnika — a przy akcie notarialnym płatnikiem jest notariusz, który uzależnia dokonanie czynności od zapłaty (art. 10 ust. 1, 2, 3). Czynność opodatkowana VAT nie podlega PCC, podobnie jak czynność, przy której strona jest z VAT zwolniona — ale umowy sprzedaży nieruchomości, użytkowania wieczystego i praw spółdzielczych wyłączono z tego drugiego członu i pozostają opodatkowane (art. 2 pkt 4). Zwolnione: pierwsze mieszkanie, gdy kupującym jest osoba fizyczna, której wcześniej takie prawo nie przysługiwało, chyba że udział odziedziczony nie przekraczał 50% (art. 9 pkt 17); oraz grunty tworzące lub powiększające gospodarstwo rolne od 11 do 300 ha prowadzone przez 5 lat, jako pomoc de minimis (art. 9 pkt 2). Szósty i każdy kolejny lokal kupiony od tego samego sprzedawcy w jednej inwestycji, opodatkowany VAT — 6% (art. 7a). Ustawa o VAT, tekst jednolity Dz.U. 2025 poz. 775: stawka podstawowa 23%, obniżona 8%, dopóki wydatki obronne przekraczają 3% PKB (art. 146ef ust. 1 pkt 1–2); 8% obejmuje budownictwo objęte społecznym programem mieszkaniowym, z którego wyłączono domy powyżej 300 m² i lokale powyżej 150 m², a nadwyżkę powierzchni opodatkowano stawką podstawową (art. 41 ust. 12, 12a–12c). Taksa notarialna, Dz.U. 2024 poz. 1566: maksymalnie 1010 zł + 0,4% od nadwyżki powyżej 60 000 zł do 1 000 000 zł; 4770 zł + 0,2% powyżej 1 000 000; 6770 zł + 0,25% powyżej 2 000 000, nie więcej niż 10 000 zł (§ 3). Sprzedaż lokalu mieszkalnego oraz domu z gruntem to połowa (§ 6 pkt 18–19), akt ustanawiający hipotekę pod kredyt mieszkaniowy jedna czwarta (§ 7 ust. 1 pkt 1); wypisy 6 zł za każdą rozpoczętą stronę (§ 12). To stawki maksymalne i netto — rozporządzenie o VAT nie mówi nic. Opłaty sądowe, ustawa o kosztach sądowych, tekst jednolity Dz.U. 2025 poz. 1228: 200 zł od wniosku o wpis własności, użytkowania wieczystego lub ograniczonego prawa rzeczowego, proporcjonalnie przy udziale, nie mniej niż 100 zł, 150 zł przy dziedziczeniu, dziale spadku, podziale majątku wspólnego i nieruchomości rolnej do 5 ha; 100 zł za założenie księgi, połączenie, odłączenie, sprostowanie działu I-O i wpis ostrzeżenia; połowa opłaty za wykreślenie (art. 42–46).",
        },
      },
      {
        subject: {
          en: "Checking a property before buying: what the land register does and does not protect",
          ru: "Проверка недвижимости до покупки: от чего земельная книга защищает, а от чего нет",
          pl: "Sprawdzenie nieruchomości przed zakupem: przed czym księga wieczysta chroni, a przed czym nie",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "Land register and mortgage act, consolidated Dz.U. 2026 poz. 1066. Land registers are public and nobody may plead ignorance of an entry, or of an application noted in one (art. 2). A right shown in the register is presumed to match the real legal state, and a deleted one is presumed not to exist (art. 3). Where the register and the real state differ, the register decides in favour of a person who acquired ownership or another property right from the person entered — the public-faith warranty, art. 5 — which does NOT cover a gift or an acquirer in bad faith, and bad faith includes anyone who could easily have found out (art. 6); it does not work against rights encumbering the property by operation of law, a life estate, administratively imposed easements, a necessary-way easement or a transmission easement (art. 7); and it is excluded altogether by a note of a pending application, complaint, appeal or cassation, or by a warning of inconsistency (art. 8) — so a note in the register is the thing to read before a deposit is paid. A register has four sections: I the property's designation and rights attached to ownership, II ownership and perpetual usufruct, III limited property rights other than mortgages, restrictions on disposal and other rights and claims, IV mortgages (art. 25). The Central Land Register Information issues copies, extracts and closure certificates, which have the force of documents issued by a court, including where the applicant downloads and prints them himself, provided they carry the features allowing verification against the central database (art. 36⁴ ust. 2–4, and art. 3 of Dz.U. 2026 poz. 119 for documents downloaded before 31 March 2026). Anyone who knows the number of a register may view it online free of charge (ust. 6) — but a printout of what the viewing mode displays has no such force (ust. 7). Fees for copies are set by regulation of the justice minister (art. 36⁵), which was not read.",
          ru: "Закон о земельных книгах и ипотеке, сводный текст Dz.U. 2026 poz. 1066. Земельные книги открыты, и никто не может ссылаться на незнание записи или отмеченного в книге заявления (ст. 2). Право, видное из книги, предполагается соответствующим действительному правовому положению, а вычеркнутое — несуществующим (ст. 3). При расхождении книги и действительности содержание книги решает в пользу того, кто приобрёл собственность или иное вещное право от лица, записанного в ней, — гарантия публичной достоверности, ст. 5, — которая НЕ покрывает безвозмездное распоряжение и приобретателя недобросовестного, а недобросовестен и тот, кто мог легко об этом узнать (ст. 6); она не действует против прав, обременяющих недвижимость в силу закона, права пожизненного содержания, сервитутов, установленных решением органа, сервитута необходимой дороги и сервитута передачи (ст. 7); и она исключается полностью отметкой о поданном заявлении, жалобе, апелляции или кассации либо предупреждением о несоответствии (ст. 8) — то есть отметку в книге читают до задатка. Книга состоит из четырёх разделов: I — обозначение недвижимости и права, связанные с собственностью, II — собственность и бессрочное пользование, III — ограниченные вещные права, кроме ипотек, ограничения в распоряжении, иные права и притязания, IV — ипотеки (ст. 25). Центральная информация земельных книг выдаёт выписки, извлечения и справки о закрытии, имеющие силу документов, выданных судом, в том числе когда заявитель скачивает и печатает их сам, если на них есть признаки, позволяющие сверить их с центральной базой (ст. 36⁴ ч. 2–4, и ст. 3 Dz.U. 2026 poz. 119 для скачанных до 31 марта 2026 года). Всякий, кто знает номер книги, может бесплатно просмотреть её через интернет (ч. 6), но распечатка режима просмотра такой силы не имеет (ч. 7). Размер платы за выписки устанавливает распоряжение министра юстиции (ст. 36⁵), которое не читалось.",
          pl: "Ustawa o księgach wieczystych i hipotece, tekst jednolity Dz.U. 2026 poz. 1066. Księgi są jawne i nie można zasłaniać się nieznajomością wpisów ani wniosków, o których uczyniono wzmiankę (art. 2). Domniemywa się, że prawo jawne z księgi jest wpisane zgodnie z rzeczywistym stanem prawnym, a prawo wykreślone nie istnieje (art. 3). Przy niezgodności treść księgi rozstrzyga na korzyść tego, kto nabył własność lub inne prawo rzeczowe od osoby uprawnionej według księgi — rękojmia wiary publicznej, art. 5 — która NIE chroni rozporządzeń nieodpłatnych ani nabywcy w złej wierze, a w złej wierze jest też ten, kto z łatwością mógł się dowiedzieć (art. 6); nie działa przeciwko prawom obciążającym nieruchomość z mocy ustawy, prawu dożywocia, służebnościom ustanowionym decyzją organu, służebności drogi koniecznej i służebności przesyłu (art. 7); wyłącza ją wzmianka o wniosku, skardze, apelacji lub skardze kasacyjnej albo ostrzeżenie o niezgodności (art. 8) — wzmiankę czyta się więc przed zadatkiem. Księga ma cztery działy: I oznaczenie nieruchomości i prawa związane z własnością, II własność i użytkowanie wieczyste, III ograniczone prawa rzeczowe poza hipotekami, ograniczenia w rozporządzaniu oraz inne prawa i roszczenia, IV hipoteki (art. 25). Centralna Informacja wydaje odpisy, wyciągi i zaświadczenia o zamknięciu mające moc dokumentów wydawanych przez sąd, także gdy wnioskodawca pobiera i drukuje je samodzielnie, jeżeli mają cechy pozwalające na weryfikację z centralną bazą (art. 36⁴ ust. 2–4 oraz art. 3 Dz.U. 2026 poz. 119 dla dokumentów pobranych przed 31 marca 2026). Każdy, kto zna numer księgi, może ją bezpłatnie przeglądać przez internet (ust. 6), ale wydruk z trybu przeglądania takiej mocy nie ma (ust. 7). Wysokość opłat za odpisy określa rozporządzenie Ministra Sprawiedliwości (art. 36⁵), którego nie czytano.",
        },
      },
      {
        subject: {
          en: "Agricultural land: the second act that applies on top of the 1920 one",
          ru: "Сельхозземля: второй закон, который применяется поверх закона 1920 года",
          pl: "Grunty rolne: druga ustawa stosowana obok ustawy z 1920 r.",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "Act on shaping the agricultural system, consolidated Dz.U. 2026 poz. 941. The buyer of agricultural land may only be an individual farmer, and the holding may not exceed 300 ha of farmland (art. 2a ust. 1–2) — but that restriction does not apply to a plot smaller than 1 ha, nor to acquisition by inheritance or a specific bequest, nor to a close relative of the seller (art. 2a ust. 3 pkt 1 and 1a, 2). Anyone else needs the consent of KOWR's Director General, given by administrative decision on the application of the seller, who must show the land could not be sold to an individual farmer, or of a person intending to create a family farm who holds agricultural qualifications, undertakes to farm it and to live for 5 years in the commune (art. 2a ust. 4); the consent is valid a year (art. 2ba). The buyer must farm the property personally for 5 years and may not sell it or hand over possession within that time without KOWR's consent (art. 2b ust. 1–3), which does not apply to a plot under 1 ha inside a town's administrative limits, to inheritance, or to a close relative (ust. 4). The act does not apply at all where the farmland is under 0.3 ha (art. 1a pkt 1 lit. b), and 'agricultural property' excludes land designated in the local spatial plan for non-agricultural purposes (art. 2 pkt 1) — so the plan, not the land's present use, decides. On a sale, the tenant has a statutory right of pre-emption where the lease is written, has a certain date and has run three years and the land joins his family farm, and failing that KOWR has it; the notary notifies those entitled (art. 3). An acquisition contrary to the act is invalid, expressly including one made without notifying the person entitled to pre-emption or without KOWR's consent, or on untrue statements or forged documents, and KOWR may itself sue for the nullity (art. 9 ust. 1–2). Art. 1a ust. 6 of the 1920 act states expressly that a foreigner's acquisition of agricultural land happens ADDITIONALLY under this act — the two apply together, not one instead of the other.",
          ru: "Закон о формировании аграрного строя, сводный текст Dz.U. 2026 poz. 941. Покупателем сельхозучастка может быть только индивидуальный фермер, а хозяйство не может превышать 300 га сельхозугодий (ст. 2a ч. 1–2), но это ограничение не применяется к участку меньше 1 га, к приобретению по наследству и завещательному отказу и к близкому родственнику продавца (ст. 2a ч. 3 п. 1 и 1a, 2). Всем остальным нужно согласие генерального директора KOWR, даваемое административным решением по заявлению продавца, доказавшего, что продать землю индивидуальному фермеру не удалось, либо по заявлению человека, намеренного создать семейное хозяйство, у которого есть сельскохозяйственная квалификация и который обязуется вести хозяйство и 5 лет жить в этой гмине (ст. 2a ч. 4); согласие действует год (ст. 2ba). Покупатель обязан лично вести хозяйство 5 лет и не может продать участок или передать владение в этот срок без согласия KOWR (ст. 2b ч. 1–3); это не касается участка меньше 1 га в границах города, наследства и близкого родственника (ч. 4). Закон вообще не применяется, если сельхозугодья меньше 0,3 га (ст. 1a п. 1 лит. b), а «сельскохозяйственной недвижимостью» не считается земля, отведённая в местном плане застройки под несельскохозяйственные цели (ст. 2 п. 1), — то есть решает план, а не нынешнее использование. При продаже преимущественное право покупки принадлежит арендатору, если договор аренды письменный, имеет достоверную дату, исполнялся три года и участок входит в его семейное хозяйство, а при его отсутствии — KOWR; уведомляет управомоченных нотариус (ст. 3). Приобретение вопреки закону недействительно, в том числе прямо — без уведомления управомоченного на преимущественную покупку, без согласия KOWR, а также на основании ложных заявлений или подложных документов; иск о недействительности может подать и сам KOWR (ст. 9 ч. 1–2). Ст. 1a ч. 6 закона 1920 года прямо сохраняет действие этого закона.",
          pl: "Ustawa o kształtowaniu ustroju rolnego, tekst jednolity Dz.U. 2026 poz. 941. Nabywcą nieruchomości rolnej może być wyłącznie rolnik indywidualny, a powierzchnia gospodarstwa nie może przekroczyć 300 ha użytków rolnych (art. 2a ust. 1–2), lecz ograniczenia nie stosuje się do nieruchomości o powierzchni mniejszej niż 1 ha, do nabycia w wyniku dziedziczenia i zapisu windykacyjnego ani do osoby bliskiej zbywcy (art. 2a ust. 3 pkt 1 i 1a, 2). Pozostali potrzebują zgody Dyrektora Generalnego KOWR wyrażanej decyzją administracyjną na wniosek zbywcy, który wykaże brak możliwości sprzedaży rolnikowi indywidualnemu, albo osoby zamierzającej utworzyć gospodarstwo rodzinne, mającej kwalifikacje rolnicze i zobowiązującej się prowadzić działalność rolniczą oraz mieszkać 5 lat w gminie (art. 2a ust. 4); zgoda jest ważna rok (art. 2ba). Nabywca musi osobiście prowadzić gospodarstwo przez 5 lat i w tym czasie nie może nieruchomości zbyć ani oddać w posiadanie bez zgody KOWR (art. 2b ust. 1–3), czego nie stosuje się do nieruchomości poniżej 1 ha położonej w granicach administracyjnych miasta, do dziedziczenia ani do osoby bliskiej (ust. 4). Ustawy w ogóle nie stosuje się, gdy powierzchnia użytków rolnych jest mniejsza niż 0,3 ha (art. 1a pkt 1 lit. b), a nieruchomością rolną nie są grunty przeznaczone w planie miejscowym na cele inne niż rolne (art. 2 pkt 1) — decyduje plan, nie faktyczne użytkowanie. Przy sprzedaży prawo pierwokupu ma dzierżawca, jeżeli umowa jest pisemna, ma datę pewną, była wykonywana 3 lata, a nieruchomość wchodzi w skład jego gospodarstwa rodzinnego, a w razie jego braku — KOWR; uprawnionych zawiadamia notariusz (art. 3). Nabycie niezgodne z ustawą jest nieważne, w szczególności bez zawiadomienia uprawnionego do pierwokupu, bez zgody KOWR oraz w oparciu o nieprawdziwe oświadczenia lub fałszywe dokumenty, a z powództwem o nieważność może wystąpić sam KOWR (art. 9 ust. 1–2). Art. 1a ust. 6 ustawy z 1920 r. wprost zachowuje stosowanie tej ustawy.",
        },
      },
      {
        subject: {
          en: "Driving in Poland on a foreign licence, and the six months it lasts",
          ru: "Езда в Польше по иностранным правам и её шесть месяцев",
          pl: "Jazda w Polsce na zagranicznym prawie jazdy i jej sześć miesięcy",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "Act of 5 January 2011 on drivers, consolidated Dz.U. 2025 poz. 1226. A national or international licence issued abroad under the Geneva Convention of 1949 or the Vienna Convention of 1968 proves the entitlement to drive in Poland for 6 months from the day the permanent or temporary stay began (art. 5 ust. 4); the act does not define that day. A valid national licence issued by an EU, EEA or Swiss authority is recognised without a time limit (art. 5 ust. 6), and is not valid at all if it was retained or the entitlement withdrawn in any of those states (art. 4 ust. 3). An international licence is valid only together with the national one (art. 5 ust. 3), so it does not extend the six months. A driver may hold only one valid licence (art. 4 ust. 2), and no Polish licence is issued to a person holding another document proving entitlement (art. 12 ust. 1 pkt 4). Driving a motor vehicle without entitlement is arrest, restriction of liberty or a fine of not less than 1,500 zł, and a driving ban IS imposed rather than being available (art. 94 § 1 and § 3 of the Petty Offences Code, consolidated Dz.U. 2025 poz. 734); driving with the entitlement but without the documents on you is up to 250 zł or a reprimand (art. 95 § 1). A Polish licence runs 15 years for AM, A1, A2, A, B1, B, B+E and T, or less if the medical certificate says so, and 5 years for C and D categories, no longer than the medical and psychological certificates (art. 13 ust. 1).",
          ru: "Закон от 5 января 2011 года о лицах, управляющих транспортными средствами, сводный текст Dz.U. 2025 poz. 1226. Национальное или международное удостоверение, выданное за границей по женевской конвенции 1949 года или венской конвенции 1968 года, подтверждает право управления в Польше в течение 6 месяцев со дня начала постоянного или временного пребывания (ст. 5 ч. 4); что это за день, закон не определяет. Действительное национальное удостоверение государства ЕС, ЕЭП или Швейцарии признаётся без ограничения срока (ст. 5 ч. 6) и не признаётся вовсе, если в одном из этих государств оно было изъято или право управления отозвано (ст. 4 ч. 3). Международное удостоверение действительно только вместе с национальным (ст. 5 ч. 3), то есть шесть месяцев не продлевает. Водитель может иметь только одно действительное удостоверение (ст. 4 ч. 2), а польские права не выдают тому, у кого есть другой документ, подтверждающий право управления (ст. 12 ч. 1 п. 4). Управление механическим транспортным средством без права управления — арест, ограничение свободы или штраф не ниже 1500 zł, причём запрет на управление назначается, а не может быть назначен (ст. 94 § 1 и § 3 кодекса о проступках, сводный текст Dz.U. 2025 poz. 734); управление при наличии права, но без документов при себе — до 250 zł или предупреждение (ст. 95 § 1). Польские права действуют 15 лет для категорий AM, A1, A2, A, B1, B, B+E и T или меньше, если так следует из медицинского заключения, и 5 лет для категорий C и D, но не дольше срока медицинского и психологического заключений (ст. 13 ч. 1).",
          pl: "Ustawa z 5 stycznia 2011 r. o kierujących pojazdami, tekst jednolity Dz.U. 2025 poz. 1226. Krajowe lub międzynarodowe prawo jazdy wydane za granicą zgodnie z konwencją genewską z 1949 r. lub wiedeńską z 1968 r. stwierdza uprawnienie do kierowania na terytorium RP przez 6 miesięcy od dnia rozpoczęcia stałego lub czasowego pobytu (art. 5 ust. 4); ustawa nie definiuje tego dnia. Ważne krajowe prawo jazdy państwa UE, EOG lub Szwajcarii jest uznawane bezterminowo (art. 5 ust. 6) i nie jest uznawane wcale, jeżeli w którymkolwiek z tych państw zostało zatrzymane albo cofnięto uprawnienie (art. 4 ust. 3). Międzynarodowe prawo jazdy jest ważne wyłącznie łącznie z krajowym (art. 5 ust. 3), więc nie przedłuża sześciu miesięcy. Kierowca może mieć tylko jedno ważne prawo jazdy (art. 4 ust. 2), a prawa jazdy nie wydaje się osobie posiadającej inny dokument stwierdzający uprawnienie (art. 12 ust. 1 pkt 4). Prowadzenie pojazdu mechanicznego bez uprawnienia to areszt, ograniczenie wolności albo grzywna nie niższa niż 1500 zł, a zakaz prowadzenia pojazdów orzeka się, a nie można orzec (art. 94 § 1 i § 3 Kodeksu wykroczeń, tekst jednolity Dz.U. 2025 poz. 734); prowadzenie bez wymaganych dokumentów przy sobie to grzywna do 250 zł albo nagana (art. 95 § 1). Polskie prawo jazdy wydaje się na 15 lat dla kategorii AM, A1, A2, A, B1, B, B+E i T, krócej jeżeli tak wynika z orzeczenia lekarskiego, oraz na 5 lat dla kategorii C i D, nie dłużej niż okres orzeczeń (art. 13 ust. 1).",
        },
      },
      {
        subject: {
          en: "Exchanging a foreign driving licence: the exam condition, rewritten on 17 December 2025",
          ru: "Обмен иностранных водительских прав: условие об экзамене, переписанное 17 декабря 2025 года",
          pl: "Wymiana zagranicznego prawa jazdy: warunek egzaminu, zmieniony 17 grudnia 2025",
        },
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "Art. 14 of the act on drivers. A holder of a VALID national licence issued abroad may, on application and for the fee, receive a Polish licence of the corresponding category after surrendering the foreign document. ⚠ The exam condition was rewritten by art. 4 pkt 8 of the Act of 17 October 2025, Dz.U. 2025 poz. 1676, in force 14 days after publication on 2 December 2025 — 17 December 2025 by our count. It used to bite where the foreign licence was 'not defined in the road traffic conventions referred to in art. 4 ust. 1 pkt 2 lit. a and b' — Geneva or Vienna. It now bites where the licence 'does not conform to the model and the scope of data required by the road traffic convention referred to in art. 4 ust. 1 pkt 2 lit. b' — Vienna alone. So the test moved from the issuing STATE to the DOCUMENT, and the Geneva Convention dropped out of it; where it bites, the applicant must pass the theory part of the state exam and produce a certified translation. It never applies to a licence issued by an EU, EEA or Swiss authority. The same amendment added ust. 1a: an EXPIRED foreign national licence is now exchanged under ust. 1 where the holder meets the residence condition of art. 11 ust. 1 pkt 5, the issuing state's authority confirms the data in the original, and the applicant produces the documents that allow the validity to be extended — previously that route existed only for EU, EEA and Swiss licences (ust. 2a). Ust. 2e: a foreign licence is NOT exchanged where its data cannot be confirmed, or where information arrives that the entitlement was withdrawn. For EU, EEA and Swiss licences confirmation runs solely over the European Driving Licence Network (ust. 2d). Art. 14 ust. 3–4 allow different terms for the citizens of particular states on a reciprocal basis, by regulation; no such regulation was read.",
          ru: "Ст. 14 закона о лицах, управляющих транспортными средствами. Владелец ДЕЙСТВИТЕЛЬНОГО национального удостоверения, выданного за границей, может по заявлению и за плату получить польские права соответствующей категории после возврата иностранного документа. ⚠ Условие об экзамене переписано ст. 4 п. 8 закона от 17 октября 2025 года, Dz.U. 2025 poz. 1676, вступившим в силу через 14 дней после публикации 2 декабря 2025 года — по нашему счёту 17 декабря 2025 года. Раньше оно применялось, если иностранные права «не определены в конвенциях о дорожном движении, о которых говорится в ст. 4 ч. 1 п. 2 лит. a и b», то есть женевской или венской. Теперь — если права «не соответствуют образцу и объёму данных, требуемым конвенцией о дорожном движении, о которой говорится в ст. 4 ч. 1 п. 2 лит. b», то есть одной только венской. Проверка сместилась со СТРАНЫ выдачи на сам ДОКУМЕНТ, а женевская конвенция из условия выпала; там, где оно применяется, нужно сдать теоретическую часть государственного экзамена и представить заверенный перевод. К удостоверениям, выданным в государстве ЕС, ЕЭП или Швейцарии, условие не применяется никогда. Та же поправка добавила ч. 1a: ПРОСРОЧЕННОЕ иностранное национальное удостоверение теперь обменивается по правилам ч. 1, если владелец отвечает условию о месте жительства ст. 11 ч. 1 п. 5, орган страны выдачи подтвердил данные оригинала, а заявитель представил документы, позволяющие продлить срок действия; прежде такой путь существовал только для прав ЕС, ЕЭП и Швейцарии (ч. 2a). Ч. 2e: иностранные права НЕ подлежат обмену, если содержащиеся в них данные невозможно подтвердить или получена информация, что право управления было отозвано. Для прав ЕС, ЕЭП и Швейцарии подтверждение идёт исключительно через европейскую сеть водительских удостоверений (ч. 2d). Ст. 14 ч. 3–4 позволяют установить распоряжением иные условия для граждан отдельных государств на началах взаимности; такое распоряжение не читалось.",
          pl: "Art. 14 ustawy o kierujących pojazdami. Osoba posiadająca WAŻNE krajowe prawo jazdy wydane za granicą może na wniosek i za opłatą otrzymać polskie prawo jazdy odpowiedniej kategorii po zwrocie zagranicznego dokumentu. ⚠ Warunek egzaminu zmieniono art. 4 pkt 8 ustawy z 17 października 2025 r., Dz.U. 2025 poz. 1676, który wszedł w życie po upływie 14 dni od ogłoszenia 2 grudnia 2025 — według naszego wyliczenia 17 grudnia 2025. Dotychczas dotyczył prawa jazdy, które „nie jest określone w konwencjach o ruchu drogowym, o których mowa w art. 4 ust. 1 pkt 2 lit. a i b” — genewskiej lub wiedeńskiej. Obecnie dotyczy prawa jazdy, które „nie jest zgodne ze wzorem i zakresem danych wymaganych w konwencji o ruchu drogowym, o której mowa w art. 4 ust. 1 pkt 2 lit. b” — wyłącznie wiedeńskiej. Badanie przesunęło się z PAŃSTWA wydania na sam DOKUMENT, a konwencja genewska z warunku wypadła; gdzie warunek działa, trzeba zdać część teoretyczną egzaminu państwowego i przedstawić uwierzytelnione tłumaczenie. Do prawa jazdy wydanego w państwie UE, EOG lub Szwajcarii warunek nie ma zastosowania. Ta sama nowelizacja dodała ust. 1a: zagraniczne krajowe prawo jazdy, którego termin ważności UPŁYNĄŁ, podlega wymianie na zasadach ust. 1, jeżeli posiadacz spełnia warunek miejsca zamieszkania z art. 11 ust. 1 pkt 5, organ państwa wydania potwierdzi dane oryginału, a wnioskodawca dostarczy dokumenty umożliwiające przedłużenie terminu ważności; wcześniej taka droga istniała tylko dla praw jazdy UE, EOG i Szwajcarii (ust. 2a). Ust. 2e: wymianie NIE podlega zagraniczne prawo jazdy przy braku możliwości potwierdzenia danych albo po uzyskaniu informacji o cofnięciu uprawnień. Dla praw jazdy UE, EOG i Szwajcarii potwierdzenie następuje wyłącznie przez Europejską Sieć Praw Jazdy (ust. 2d). Art. 14 ust. 3–4 pozwalają określić rozporządzeniem odmienne warunki dla obywateli niektórych państw na zasadach wzajemności; takiego rozporządzenia nie czytano.",
        },
      },
      {
        subject: {
          en: "What a licence exchange costs, what documents it takes and how long it runs",
          ru: "Во что обходится обмен прав, какие документы нужны и сколько он идёт",
          pl: "Ile kosztuje wymiana prawa jazdy, jakie dokumenty i ile trwa",
        },
        // "added", not "corrected": this site never published 100.50 zł. The
        // verdict column describes what a check did to OUR figure, and turning
        // it into a scoreboard against other people's pages would make the
        // nineteen corrections on this page mean two different things.
        verdict: "added",
        checked: "2026-09-16",
        finding: {
          en: "The fee for issuing a driving licence is 100 zł, an international licence 35 zł and a tram permit 30 zł — § 1 of the Minister of Infrastructure's regulation of 9 July 2025, Dz.U. 2025 poz. 953, in force 14 days after publication on 17 July 2025, 1 August 2025 by our count. ⚠ CORRECTED against the figure in general circulation: it is 100 zł and not 100.50 zł. The old amount was 100 zł plus a 0.50 zł records fee; the 2013 regulation that carried it lapsed under art. 68 of the mObywatel act, and the new one has no records fee. Russian-language pages ranking for this query still print 100.50 zł. The licence is issued by the starosta by administrative decision, on application and for that fee (art. 10 ust. 1 of the act). Documents for exchanging a licence issued by an EU state or a party to the conventions, § 14 ust. 1 pkt 5 of the regulation of 5 August 2025, Dz.U. 2025 poz. 1073: the application, proof of the fee, a photograph, and a copy of the licence with a translation by a sworn translator or a Polish consul, the copy bound into the translation — no translation is required for a licence issued to the model in annex 1 to directive 2006/126/EC or annexes 1 and 1a to directive 91/439/EEC. The photograph is colour, 35 × 45 mm, on a plain light background, the face filling 70–80% of the frame, frontal, no headwear or dark glasses, taken no earlier than 6 months before the application (§ 5 ust. 1 pkt 3). A licence not conforming to the Vienna convention additionally needs a copy plus translation (§ 5 ust. 6, as amended by Dz.U. 2026 poz. 1162 in force 3 September 2026, which also moved the residence declaration to the new art. 11 ust. 1a pkt 2 from the same date — art. 4 pkt 7 of Dz.U. 2025 poz. 1676, 9 months after publication). The residence condition itself is 185 days in each calendar year on personal and professional ties, or the intention of permanent residence on personal ties alone (art. 11 ust. 1 pkt 5), declared under criminal liability for a false statement, art. 233 § 6 of the Criminal Code. gov.pl's own page gives the practical timings — up to 9 working days from the office receiving confirmation of the data and of the payment, with the confirmation itself taking up to several weeks — names the starostwo, the city hall or, in Warsaw, the district office as the place to file, says a licence is not issued until the foreign one is returned, and adds a medical certificate for an expired licence plus a psychological one for C and D categories. The Code of Administrative Procedure gives a month for a case requiring investigation and two for a particularly complex one (art. 35 § 3), with a ponaglenie against delay (art. 37).",
          ru: "Сбор за выдачу водительского удостоверения — 100 zł, международного — 35 zł, разрешения на управление трамваем — 30 zł: § 1 распоряжения министра инфраструктуры от 9 июля 2025 года, Dz.U. 2025 poz. 953, вступившего в силу через 14 дней после публикации 17 июля 2025 года, по нашему счёту с 1 августа 2025 года. ⚠ ИСПРАВЛЕНО против цифры, которая ходит повсеместно: 100 zł, а не 100,50 zł. Прежняя сумма складывалась из 100 zł и 0,50 zł учётного сбора; распоряжение 2013 года, которое её несло, утратило силу по ст. 68 закона о приложении mObywatel, а в новом учётного сбора нет. Русскоязычные страницы, стоящие в выдаче по этому запросу, до сих пор печатают 100,50 zł. Права выдаёт староста административным решением, по заявлению и за эту плату (ст. 10 ч. 1 закона). Документы для обмена удостоверения, выданного государством ЕС или участником конвенций, § 14 ч. 1 п. 5 распоряжения от 5 августа 2025 года, Dz.U. 2025 poz. 1073: заявление, подтверждение оплаты, фотография и копия удостоверения с переводом присяжного переводчика или консула РП, причём копия подшивается к переводу; перевод не требуется для удостоверения, выданного по образцу приложения 1 к директиве 2006/126/WE и приложений 1 и 1a к директиве 91/439/EWG. Фотография цветная, 35 × 45 мм, на однородном светлом фоне, лицо занимает 70–80% кадра, фронтально, без головного убора и тёмных очков, сделана не раньше чем за 6 месяцев до подачи (§ 5 ч. 1 п. 3). Для удостоверения, не соответствующего венской конвенции, дополнительно нужны копия и перевод (§ 5 ч. 6 в редакции Dz.U. 2026 poz. 1162, действующей с 3 сентября 2026 года; та же поправка перенесла декларацию о месте жительства в новую ст. 11 ч. 1a п. 2 с той же даты — ст. 4 п. 7 закона Dz.U. 2025 poz. 1676, через 9 месяцев после публикации). Само условие о месте жительства — 185 дней в каждом календарном году по личным и профессиональным связям либо намерение постоянного проживания по одним личным связям (ст. 11 ч. 1 п. 5), декларируется под уголовной ответственностью за ложное заявление, ст. 233 § 6 уголовного кодекса. Страница gov.pl даёт практические сроки — до 9 рабочих дней с момента, когда управление получит подтверждение данных и оплаты, причём само подтверждение занимает до нескольких недель, — называет местом подачи старостат, мэрию или, в Варшаве, управу района, говорит, что без возврата иностранного документа права не выдадут, и добавляет медицинское заключение при просроченных правах и психологическое для категорий C и D. Кодекс административного производства даёт месяц на дело, требующее выяснения, и два на особо сложное (ст. 35 § 3), с ponaglenie на бездействие (ст. 37).",
          pl: "Opłata za wydanie prawa jazdy wynosi 100 zł, międzynarodowego prawa jazdy 35 zł, pozwolenia na kierowanie tramwajem 30 zł — § 1 rozporządzenia Ministra Infrastruktury z 9 lipca 2025 r., Dz.U. 2025 poz. 953, w życie po upływie 14 dni od ogłoszenia 17 lipca 2025, według naszego wyliczenia 1 sierpnia 2025. ⚠ POPRAWIONE wobec liczby powszechnie powtarzanej: 100 zł, a nie 100,50 zł. Dawna kwota to 100 zł plus 0,50 zł opłaty ewidencyjnej; rozporządzenie z 2013 r., które ją niosło, utraciło moc na podstawie art. 68 ustawy o aplikacji mObywatel, a nowe opłaty ewidencyjnej nie zawiera. Rosyjskojęzyczne strony z czołówki wyników nadal podają 100,50 zł. Prawo jazdy wydaje starosta w drodze decyzji administracyjnej, na wniosek i za tę opłatę (art. 10 ust. 1 ustawy). Dokumenty przy wymianie prawa jazdy wydanego przez państwo UE lub stronę konwencji, § 14 ust. 1 pkt 5 rozporządzenia z 5 sierpnia 2025 r., Dz.U. 2025 poz. 1073: wniosek, dowód uiszczenia opłaty, fotografia oraz kopia posiadanego prawa jazdy z tłumaczeniem tłumacza przysięgłego lub konsula RP, z kopią trwale dołączoną do tłumaczenia; tłumaczenia nie wymaga prawo jazdy wydane zgodnie ze wzorem z załącznika 1 do dyrektywy 2006/126/WE oraz załączników 1 i 1a do dyrektywy 91/439/EWG. Fotografia kolorowa, 35 × 45 mm, na jednolitym jasnym tle, twarz zajmuje 70–80% zdjęcia, pozycja frontalna, bez nakrycia głowy i ciemnych okularów, wykonana nie wcześniej niż 6 miesięcy przed złożeniem wniosku (§ 5 ust. 1 pkt 3). Prawo jazdy niezgodne z konwencją wiedeńską wymaga dodatkowo kopii z tłumaczeniem (§ 5 ust. 6 w brzmieniu Dz.U. 2026 poz. 1162, obowiązującym od 3 września 2026; ta sama nowelizacja przeniosła oświadczenie o miejscu zamieszkania do nowego art. 11 ust. 1a pkt 2 od tej samej daty — art. 4 pkt 7 ustawy Dz.U. 2025 poz. 1676, po 9 miesiącach od ogłoszenia). Sam warunek to 185 dni w każdym roku kalendarzowym ze względu na więzi osobiste i zawodowe albo zamiar stałego pobytu wyłącznie ze względu na więzi osobiste (art. 11 ust. 1 pkt 5), składany pod rygorem odpowiedzialności karnej za fałszywe oświadczenie, art. 233 § 6 Kodeksu karnego. Strona gov.pl podaje praktyczne terminy — do 9 dni roboczych od otrzymania przez urząd potwierdzenia danych i opłaty, przy czym samo potwierdzenie trwa nawet kilka tygodni — wskazuje starostwo, urząd miasta albo w Warszawie urząd dzielnicy jako miejsce złożenia, stwierdza, że bez zwrotu zagranicznego dokumentu prawa jazdy się nie otrzyma, i dodaje orzeczenie lekarskie przy prawie jazdy nieważnym oraz psychologiczne dla kategorii C i D. KPA daje miesiąc na sprawę wymagającą postępowania wyjaśniającego i dwa na szczególnie skomplikowaną (art. 35 § 3), z ponagleniem na bezczynność (art. 37).",
        },
      },
      {
        subject: {
          en: "Stamp duty on residence permits",
          ru: "Гербовый сбор за разрешения на пребывание",
          pl: "Opłata skarbowa od zezwoleń pobytowych",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Stamp duty act, consolidated Dz.U. 2025 poz. 1154 (11 August 2025), annex part III: temporary residence 340 zł (item 2), exempt for permits under art. 160 pkt 4–6, 176 and 186 ust. 1 pkt 8–9 of the Act on Foreigners and for a temporary protection beneficiary; residence and work under art. 114 ust. 1 and 1a, the EU Blue Card under art. 127, and art. 137a, 139a and 139o, 440 zł (item 2b); a change of a residence and work permit under art. 120 ust. 1, 220 zł (item 2d); permanent residence 640 zł, with exemptions including a Karta Polaka holder intending to settle; EU long-term resident 640 zł. The duty paid is not refunded when the voivode refuses a temporary, permanent or EU long-term resident permit or a change of a residence and work permit, or discontinues the case: art. 113c, 120c, 207b and 223a of the Act on Foreigners, added by Dz.U. 2026 poz. 203 art. 12, applied to duty paid for applications filed from 5 March 2026 (art. 29 of that act). Later amendments to the stamp duty act itself were not found in the 2025 and 2026 acts read for this section, and were not searched for separately.",
          ru: "Закон о гербовом сборе, сводный текст Dz.U. 2025 poz. 1154 (11 августа 2025 года), приложение, часть III: временное пребывание — 340 zł (п. 2), с освобождением для разрешений по ст. 160 п. 4–6, 176 и 186 ч. 1 п. 8–9 закона об иностранцах и для пользующегося временной защитой; пребывание и работа по ст. 114 ч. 1 и 1a, Голубая карта ЕС по ст. 127, а также ст. 137a, 139a и 139o — 440 zł (п. 2b); изменение разрешения на пребывание и работу по ст. 120 ч. 1 — 220 zł (п. 2d); постоянное пребывание — 640 zł, с освобождениями, среди них держатель Карты поляка, намеренный поселиться; статус резидента ЕС — 640 zł. Уплаченный сбор не возвращается, если воевода отказал во временном, постоянном разрешении, статусе резидента ЕС или изменении разрешения на пребывание и работу либо прекратил дело: ст. 113c, 120c, 207b и 223a закона об иностранцах, добавленные Dz.U. 2026 poz. 203, ст. 12, — для сбора по заявлениям, поданным с 5 марта 2026 года (ст. 29 того же закона). Более поздних поправок к самому закону о гербовом сборе в актах 2025 и 2026 годов, прочитанных для этой секции, не найдено, отдельно они не искались.",
          pl: "Ustawa o opłacie skarbowej, tekst jednolity Dz.U. 2025 poz. 1154 (11 sierpnia 2025), załącznik, część III: pobyt czasowy 340 zł (poz. 2), ze zwolnieniem dla zezwoleń z art. 160 pkt 4–6, 176 i 186 ust. 1 pkt 8–9 ustawy o cudzoziemcach oraz dla cudzoziemca korzystającego z ochrony czasowej; pobyt i praca z art. 114 ust. 1 i 1a, Niebieska Karta UE z art. 127 oraz art. 137a, 139a i 139o — 440 zł (poz. 2b); zmiana zezwolenia na pobyt czasowy i pracę z art. 120 ust. 1 — 220 zł (poz. 2d); pobyt stały 640 zł, ze zwolnieniami, m.in. dla posiadacza Karty Polaka zamierzającego osiedlić się na stałe; rezydent długoterminowy UE 640 zł. Uiszczona opłata nie podlega zwrotowi, gdy wojewoda odmawia zezwolenia na pobyt czasowy, stały, rezydenta długoterminowego UE lub zmiany zezwolenia na pobyt czasowy i pracę albo umarza postępowanie: art. 113c, 120c, 207b i 223a ustawy o cudzoziemcach, dodane Dz.U. 2026 poz. 203 art. 12, stosowane do opłaty uiszczonej w związku z wnioskiem złożonym od 5 marca 2026 (art. 29 tej ustawy). Późniejszych zmian samej ustawy o opłacie skarbowej nie znaleziono w aktach z 2025 i 2026 czytanych dla tej sekcji i nie szukano ich osobno.",
        },
      },
      {
        subject: {
          en: "Temporary residence: the grounds, the conditions of each, and the card",
          ru: "Временное пребывание: основания, условия каждого и карта",
          pl: "Pobyt czasowy: podstawy, warunki każdej z nich i karta",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, Dz.U. 2025 poz. 1079. A permit is granted for the time the purpose needs, at most 3 years (art. 98 ust. 2), by the voivode of the place of stay, on an application filed no later than the last day of lawful stay (art. 104, 105 as amended by Dz.U. 2025 poz. 1794). Proceedings are refused to a foreigner who on filing holds a permanent or EU long-term resident permit, stays on temporary protection, or is outside Poland, among others (art. 99 ust. 1); the permit is refused if filed or stayed unlawfully, or with tax arrears (art. 100 ust. 1 pkt 6, 9), and withdrawn when the purpose ends or its conditions stop being met (art. 101). Work, art. 114: health insurance; a job not on the restricted list; pay not lower than comparable workers' and, whatever the working time, not below the minimum wage — 4806 zł from 1 January 2026, Dz.U. 2025 poz. 1242. EU Blue Card, art. 127: a contract for at least 6 months and higher professional qualifications. Business, art. 142: insurance, stable and regular income, a place to live, and a business that earned at least 12 times the voivodeship's average monthly wage in the previous tax year or employed 2 full-time staff for a year, or shows the means to do so. Studies, art. 144. Spouse of a Polish citizen, art. 158: a marriage recognised in Polish law, with no income or insurance condition in the article. Family reunification, art. 159: the sponsor holds, among others, a permanent or EU long-term resident permit, protection, a Blue Card, or has lived in Poland 2 years on consecutive temporary permits with the last for at least a year; insurance, income above the social assistance threshold (art. 163 via art. 140 ust. 2) and a place to live. Other circumstances, art. 186–188: among them a graduate of a Polish university looking for work or starting a business, an EU long-term resident of another member state, and, at the voivode's discretion, family life under the ECHR for a foreigner staying unlawfully (art. 187 pkt 6). The card is valid for the permit's term (art. 243 ust. 1 pkt 1) and with a travel document entitles its holder to cross the border repeatedly without a visa (art. 242). The Podlaskie voivodeship office adds that a holder may travel in other Schengen states for up to 90 days in any 180, with a valid travel document and means of subsistence; the rule itself is EU law, which was not read.",
          ru: "Закон об иностранцах, Dz.U. 2025 poz. 1079. Разрешение выдаётся на время, нужное для цели, но не больше 3 лет (ст. 98 ч. 2), воеводой по месту пребывания, по заявлению, поданному не позже последнего дня законного пребывания (ст. 104, 105 в редакции Dz.U. 2025 poz. 1794). В возбуждении дела отказывают, если на день подачи у иностранца, среди прочего, есть постоянное разрешение или статус резидента ЕС, он на временной защите или за пределами Польши (ст. 99 ч. 1); в разрешении — если заявление подано или человек находится в Польше незаконно или есть налоговая задолженность (ст. 100 ч. 1 п. 6, 9); разрешение отзывают, когда цель прекратилась или условия перестали выполняться (ст. 101). Работа, ст. 114: медицинская страховка; профессия не из ограничительного перечня; зарплата не ниже, чем у сравнимых работников, и при любой ставке не ниже минимальной — 4806 zł с 1 января 2026 года, Dz.U. 2025 poz. 1242. Голубая карта ЕС, ст. 127: договор не меньше чем на 6 месяцев и высшая профессиональная квалификация. Бизнес, ст. 142: страховка, стабильный и регулярный доход, место жительства и фирма, которая в прошлом налоговом году заработала не меньше 12 средних месячных зарплат воеводства или год держала 2 сотрудников на полной ставке, либо показывает средства, чтобы этого достичь. Учёба, ст. 144. Супруг гражданина Польши, ст. 158: брак, признаваемый польским правом; условий дохода и страховки в статье нет. Воссоединение семьи, ст. 159: у приглашающего, среди прочего, постоянное разрешение, статус резидента ЕС, защита, Голубая карта или 2 года в Польше на последовательных временных разрешениях, последнее не меньше чем на год; страховка, доход выше порога социальной помощи (ст. 163 через ст. 140 ч. 2) и место жительства. Другие обстоятельства, ст. 186–188: среди них выпускник польского вуза, ищущий работу или открывающий бизнес, резидент ЕС другого государства и, на усмотрение воеводы, семейная жизнь по ЕКПЧ у находящегося в Польше незаконно (ст. 187 п. 6). Карта действует на срок разрешения (ст. 243 ч. 1 п. 1) и вместе с паспортом даёт право многократно пересекать границу без визы (ст. 242). Подляское воеводское управление добавляет, что с ней можно ездить по другим странам Шенгена до 90 дней в любые 180 при действительном паспорте и средствах к существованию; само правило — право ЕС, которое не читалось.",
          pl: "Ustawa o cudzoziemcach, Dz.U. 2025 poz. 1079. Zezwolenia udziela się na okres niezbędny do realizacji celu, nie dłuższy niż 3 lata (art. 98 ust. 2), wojewoda właściwy ze względu na miejsce pobytu, na wniosek złożony nie później niż w ostatnim dniu legalnego pobytu (art. 104, 105 w brzmieniu Dz.U. 2025 poz. 1794). Odmawia się wszczęcia postępowania, gdy w dniu złożenia wniosku cudzoziemiec m.in. ma zezwolenie na pobyt stały lub rezydenta długoterminowego UE, korzysta z ochrony czasowej lub przebywa poza Polską (art. 99 ust. 1); odmawia się zezwolenia przy wniosku złożonym lub pobycie nielegalnym albo zaległościach podatkowych (art. 100 ust. 1 pkt 6, 9); cofa się je, gdy ustał cel lub przestano spełniać wymogi (art. 101). Praca, art. 114: ubezpieczenie zdrowotne; zawód spoza listy ograniczeń; wynagrodzenie nie niższe niż pracowników porównywalnych i, niezależnie od wymiaru czasu pracy, nie niższe niż minimalne — 4806 zł od 1 stycznia 2026, Dz.U. 2025 poz. 1242. Niebieska Karta UE, art. 127: umowa na co najmniej 6 miesięcy i wyższe kwalifikacje zawodowe. Działalność gospodarcza, art. 142: ubezpieczenie, stabilny i regularny dochód, miejsce zamieszkania i podmiot, który w poprzednim roku podatkowym osiągnął dochód co najmniej 12-krotności przeciętnego wynagrodzenia w województwie albo przez rok zatrudniał 2 pracowników na pełny etat, lub wykaże środki, by to osiągnąć. Studia, art. 144. Członek rodziny obywatela RP, art. 158: małżeństwo uznawane przez prawo polskie, bez warunku dochodu i ubezpieczenia w tym przepisie. Połączenie z rodziną, art. 159: członek rodziny m.in. z pobytem stałym, rezydenta długoterminowego UE, ochroną, Niebieską Kartą albo 2 latami w Polsce na kolejnych zezwoleniach na pobyt czasowy, ostatnim na co najmniej rok; ubezpieczenie, dochód powyżej progu pomocy społecznej (art. 163 przez art. 140 ust. 2) i miejsce zamieszkania. Inne okoliczności, art. 186–188: m.in. absolwent polskiej uczelni szukający pracy lub zakładający działalność, rezydent długoterminowy UE innego państwa oraz, według uznania wojewody, życie rodzinne w rozumieniu EKPC cudzoziemca przebywającego nielegalnie (art. 187 pkt 6). Karta jest ważna przez okres zezwolenia (art. 243 ust. 1 pkt 1) i wraz z dokumentem podróży uprawnia do wielokrotnego przekraczania granicy bez wizy (art. 242). Podlaski Urząd Wojewódzki dodaje, że z kartą można podróżować po innych państwach Schengen do 90 dni w każdym okresie 180 dni przy ważnym dokumencie podróży i środkach utrzymania; sama reguła to prawo UE, którego nie czytano.",
        },
      },
      {
        subject: {
          en: "Losing the job on a residence and work permit, and changing employer",
          ru: "Потеря работы на разрешении на пребывание и работу и смена работодателя",
          pl: "Utrata pracy na zezwoleniu na pobyt czasowy i pracę oraz zmiana pracodawcy",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, Dz.U. 2025 poz. 1079. The decision names the employer, the position, the lowest pay, the working time and the type of contract (art. 118 ust. 1). No change is needed when the employer's seat, name or form changes, the workplace passes to another employer, hours rise with pay in proportion, a job title changes without new duties, or a civil contract becomes an employment contract; the employer notifies the voivode within 15 working days (art. 119). Any other change of employer or of those conditions needs a change of the permit, applied for at any time; its validity cannot be changed (art. 120), and the application is on paper (art. 120a ust. 1 as amended by Dz.U. 2025 poz. 1794). A lost job is reported to the voivode within 15 working days, which a change application filed in that time also satisfies (art. 121). Withdrawal for the purpose ending does not apply for 30 days from losing the job if that was reported, and only once per permit where all employers are lost (art. 123 ust. 1–2); for work in an occupation desired by the economy (art. 114 ust. 1a), up to 3 months without work, at most twice (ust. 3). The permit is withdrawn if the position changed or pay was lowered without a change of the permit, or the employer stopped operating (art. 122). Any temporary permit holder reports to the voivode within 15 working days that the reason for the permit has ceased (art. 113); failing that, a next permit applied for within a year of the last one's expiry or withdrawal may be refused (art. 100 ust. 2).",
          ru: "Закон об иностранцах, Dz.U. 2025 poz. 1079. В решении указаны работодатель, должность, минимальная зарплата, объём рабочего времени и вид договора (ст. 118 ч. 1). Изменение не нужно, если у работодателя сменились адрес, название или форма, предприятие перешло к другому работодателю, выросли часы с пропорциональной зарплатой, сменилось название должности без новых обязанностей или гражданский договор заменён трудовым; работодатель сообщает воеводе в течение 15 рабочих дней (ст. 119). Любая другая смена работодателя или этих условий требует изменения разрешения, подать можно в любое время, срок действия не меняется (ст. 120), заявление — на бумаге (ст. 120a ч. 1 в редакции Dz.U. 2025 poz. 1794). О потере работы сообщают воеводе в течение 15 рабочих дней; поданное в этот срок заявление об изменении тоже засчитывается (ст. 121). Отзыв из-за прекращения цели не применяется 30 дней с потери работы, если о ней сообщили, и только один раз за разрешение при потере работы у всех работодателей (ст. 123 ч. 1–2); при работе по профессии, желательной для экономики (ст. 114 ч. 1a), — до 3 месяцев без работы, не больше двух раз (ч. 3). Разрешение отзывают, если должность изменилась или зарплату снизили без изменения разрешения либо работодатель прекратил деятельность (ст. 122). Любой держатель временного разрешения сообщает воеводе в течение 15 рабочих дней, что причина разрешения отпала (ст. 113); если нет, в следующем разрешении, поданном в течение года после окончания или отзыва прежнего, могут отказать (ст. 100 ч. 2).",
          pl: "Ustawa o cudzoziemcach, Dz.U. 2025 poz. 1079. W decyzji wskazuje się podmiot powierzający pracę, stanowisko, najniższe wynagrodzenie, wymiar czasu pracy i rodzaj umowy (art. 118 ust. 1). Zmiana nie jest wymagana przy zmianie siedziby, nazwy lub formy prawnej podmiotu, przejściu zakładu pracy, zwiększeniu wymiaru czasu pracy z proporcjonalnym wynagrodzeniem, zmianie nazwy stanowiska bez zmiany obowiązków lub zastąpieniu umowy cywilnoprawnej umową o pracę; podmiot zawiadamia wojewodę w terminie 15 dni roboczych (art. 119). Każda inna zmiana podmiotu lub tych warunków wymaga zmiany zezwolenia, o którą można wystąpić w każdym czasie, bez zmiany okresu ważności (art. 120), wnioskiem w postaci papierowej (art. 120a ust. 1 w brzmieniu Dz.U. 2025 poz. 1794). O utracie pracy zawiadamia się wojewodę w terminie 15 dni roboczych, a wniosek o zmianę złożony w tym terminie również spełnia ten obowiązek (art. 121). Cofnięcia z powodu ustania celu nie stosuje się przez 30 dni od utraty pracy, jeżeli ją zgłoszono, i przy utracie pracy u wszystkich podmiotów tylko raz w okresie ważności (art. 123 ust. 1–2); przy pracy w zawodzie pożądanym (art. 114 ust. 1a) — do 3 miesięcy bez pracy, nie więcej niż 2 razy (ust. 3). Zezwolenie cofa się, gdy zmieniono stanowisko lub obniżono wynagrodzenie bez zmiany zezwolenia albo podmiot nie prowadzi działalności (art. 122). Każdy posiadacz zezwolenia na pobyt czasowy zawiadamia wojewodę w terminie 15 dni roboczych o ustaniu przyczyny udzielenia zezwolenia (art. 113); w razie niewykonania można odmówić kolejnego zezwolenia, o które wystąpiono przed upływem roku od upływu ważności lub cofnięcia poprzedniego (art. 100 ust. 2).",
        },
      },
      {
        subject: {
          en: "Changing a residence and work permit: paper, 220 zł, suspended time limits, and no return decision meanwhile",
          ru: "Изменение разрешения на пребывание и работу: бумага, 220 zł, приостановленные сроки и без решения о возвращении",
          pl: "Zmiana zezwolenia na pobyt czasowy i pracę: papier, 220 zł, zawieszone terminy i bez decyzji o powrocie",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, Dz.U. 2025 poz. 1079 as amended. A change is decided by the voivode of the current place of stay, at any time, for another employer or user employer, for work exempt from the work permit, or for other conditions of art. 118 ust. 1 pkt 2–5; the permit's validity cannot change (art. 120 ust. 1–3). It is refused for missing insurance, a job on the restricted list, pay below comparable workers' or below the minimum wage, an employer barred under art. 117, a period of work shorter than the permit's remaining validity, or an unreported job loss (ust. 4), and may be refused if the employer does not operate or lacks means (ust. 5). Only the foreigner is a party (ust. 7). The application is on paper with the employer's attachment (art. 120a ust. 1–2 as amended by Dz.U. 2025 poz. 1794); the 60-day and 90-day limits of art. 112a apply (art. 120a ust. 3), but art. 100d ust. 1 pkt 2 of the Act on assistance to citizens of Ukraine suspends time limits for changing a residence and work permit before the voivode until 4 March 2027. The duty for a refused or discontinued change is not refunded (art. 120c, for applications from 5 March 2026). While a change applied for under art. 120 is pending, no return decision is issued on the ground of stay without a valid visa or document (art. 303 ust. 2). An employer named in the permit reports the foreigner's loss of work to the voivode within 15 days (art. 121 ust. 4). MOS page Zmiana zezwolenia: currently not filed through MOS; a paper form, attachment no. 1 completed by the employer, 220 zł, a copy of the decision being changed, a certificate of employment when changing employer, insurance for a contract for a specific work, qualifications for a regulated profession. Our reading, not a provision: a foreigner on a temporary permit or waiting under art. 108 may work on a work permit or a registered declaration held for that work (art. 3 ust. 3 pkt 2–3 of the Act on entrusting work to foreigners), which does not by itself cure a residence permit whose purpose has ended.",
          ru: "Закон об иностранцах, Dz.U. 2025 poz. 1079 с поправками. Изменение решает воевода по текущему месту пребывания, в любое время: на другого работодателя или пользователя труда, на работу без разрешения на работу или на другие условия ст. 118 ч. 1 п. 2–5; срок действия разрешения не меняется (ст. 120 ч. 1–3). Отказывают при отсутствии страховки, профессии из ограничительного перечня, зарплате ниже сравнимых работников или минимальной, работодателе с запретом по ст. 117, периоде работы короче оставшегося срока разрешения или несообщённой потере работы (ч. 4); могут отказать, если работодатель не ведёт деятельность или не имеет средств (ч. 5). Сторона — только иностранец (ч. 7). Заявление — на бумаге с приложением работодателя (ст. 120a ч. 1–2 в редакции Dz.U. 2025 poz. 1794); применяются сроки 60 и 90 дней ст. 112a (ст. 120a ч. 3), но ст. 100d ч. 1 п. 2 закона о помощи гражданам Украины приостанавливает сроки на изменение разрешения на пребывание и работу у воеводы до 4 марта 2027 года. Сбор за отказ или прекращение дела об изменении не возвращают (ст. 120c, по заявлениям с 5 марта 2026 года). Пока идёт дело об изменении по ст. 120, решение о возвращении за пребывание без действительной визы или документа не выносят (ст. 303 ч. 2). Работодатель, указанный в разрешении, сообщает воеводе о потере работы иностранцем в течение 15 дней (ст. 121 ч. 4). Страница MOS «Zmiana zezwolenia»: сейчас не через MOS; бумажная форма, приложение № 1 от работодателя, 220 zł, копия изменяемого решения, świadectwo pracy при смене работодателя, страховка при договоре на результат, квалификация для регулируемой профессии. Наше прочтение, а не норма: иностранец на временном разрешении или в ожидании по ст. 108 может работать по разрешению на работу или зарегистрированному заявлению о поручении работы на эту работу (ст. 3 ч. 3 п. 2–3 закона о поручении работы иностранцам), но это само по себе не исправляет разрешение на пребывание, чья цель отпала.",
          pl: "Ustawa o cudzoziemcach, Dz.U. 2025 poz. 1079 ze zmianami. Zmianę orzeka wojewoda właściwy dla aktualnego miejsca pobytu, w każdym czasie: na inny podmiot powierzający pracę lub pracodawcę użytkownika, na pracę w warunkach zwolnienia z zezwolenia na pracę albo na inne warunki z art. 118 ust. 1 pkt 2–5; okres ważności nie podlega zmianie (art. 120 ust. 1–3). Odmawia się przy braku ubezpieczenia, zawodzie z listy ograniczeń, wynagrodzeniu niższym niż porównywalne lub minimalne, podmiocie objętym art. 117, okresie pracy krótszym niż pozostała ważność zezwolenia lub niezgłoszonej utracie pracy (ust. 4); można odmówić, gdy podmiot nie prowadzi działalności lub nie ma środków (ust. 5). Stroną jest wyłącznie cudzoziemiec (ust. 7). Wniosek papierowy z załącznikiem podmiotu (art. 120a ust. 1–2 w brzmieniu Dz.U. 2025 poz. 1794); stosuje się terminy 60 i 90 dni z art. 112a (art. 120a ust. 3), lecz art. 100d ust. 1 pkt 2 ustawy o pomocy obywatelom Ukrainy zawiesza terminy zmiany zezwolenia na pobyt czasowy i pracę u wojewody do 4 marca 2027. Opłata za odmowę lub umorzenie zmiany nie podlega zwrotowi (art. 120c, dla wniosków od 5 marca 2026). W toku postępowania o zmianę z art. 120 nie wydaje się decyzji o zobowiązaniu do powrotu z powodu pobytu bez ważnej wizy lub dokumentu (art. 303 ust. 2). Podmiot wymieniony w zezwoleniu zawiadamia wojewodę o utracie pracy przez cudzoziemca w terminie 15 dni (art. 121 ust. 4). Strona MOS „Zmiana zezwolenia”: obecnie nie przez MOS; formularz papierowy, załącznik nr 1 wypełniony przez pracodawcę, 220 zł, kopia zmienianej decyzji, świadectwo pracy przy zmianie pracodawcy, ubezpieczenie przy umowie o dzieło, kwalifikacje w zawodzie regulowanym. Nasze odczytanie, nie przepis: cudzoziemiec na zezwoleniu na pobyt czasowy lub oczekujący na podstawie art. 108 może pracować na podstawie zezwolenia na pracę lub oświadczenia wpisanego do ewidencji na tę pracę (art. 3 ust. 3 pkt 2–3 ustawy o powierzaniu pracy cudzoziemcom), co samo nie naprawia zezwolenia pobytowego, którego cel ustał.",
        },
      },
      {
        subject: {
          en: "No “extension”: the next permit, the next card, and exchanging a card",
          ru: "«Продления» нет: следующее разрешение, следующая карта и замена карты",
          pl: "Nie ma „przedłużenia”: kolejne zezwolenie, kolejna karta i wymiana karty",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act on Foreigners, Dz.U. 2025 poz. 1079 as amended. A temporary permit lasts at most 3 years (art. 98 ust. 2) and is not extended: a new permit is applied for no later than the last day of lawful stay (art. 105), the current one expiring by law on the day the next is granted (art. 102); no earliest filing date was found in the act. Permanent and EU long-term resident permits are indefinite; their cards last 10 and 5 years, and each next card again 10 and 5 (art. 243). An application for a next card is filed at least 30 days before the card expires (art. 230 ust. 2); an exchange within 14 days of its grounds (ust. 1), which are a change of data on the card, a changed appearance, loss or damage (art. 241) — and the card carries the address of registered residence (art. 244 ust. 1 pkt 3). The voivode of the place of stay exchanges it (art. 245 ust. 3), taking fingerprints, without which proceedings are refused (art. 246–247); the holder collects it in person with a valid passport (art. 248 as amended by Dz.U. 2025 poz. 1794). A loss is reported within 3 days, for a free certificate valid until exchange and at most 2 months (art. 232); a culpable loss raises the fee up to 300% (art. 238). Evading exchange and not reporting a loss within 3 days are petty offences punished by a fine (art. 465 ust. 1 pkt 4–5). Mazowiecki voivodeship page on exchange: filed in person on paper, 100 zł (50 zł reduced for students, pupils, children under 16 and hardship), 200 and 300 zł for a first and second culpable loss, about 30 days from a complete file. MOS, residence and work: applications to continue work for the same employer on unchanged pay and hours are handled second in order of priority.",
          ru: "Закон об иностранцах, Dz.U. 2025 poz. 1079 с поправками. Временное разрешение — не больше 3 лет (ст. 98 ч. 2) и не продлевается: новое подают не позже последнего дня законного пребывания (ст. 105), а текущее прекращается с силу закона в день выдачи следующего (ст. 102); самого раннего срока подачи в законе не найдено. Постоянное разрешение и статус резидента ЕС бессрочные; их карты действуют 10 и 5 лет, и каждая следующая — снова 10 и 5 (ст. 243). Заявление о следующей карте подают не позже чем за 30 дней до окончания карты (ст. 230 ч. 2); о замене — в течение 14 дней после основания (ч. 1): изменение данных в карте, внешности, утрата или повреждение (ст. 241), а в карте указан адрес прописки (ст. 244 ч. 1 п. 3). Меняет воевода по месту пребывания (ст. 245 ч. 3), с отпечатками, без которых в возбуждении дела отказывают (ст. 246–247); получают лично с действительным паспортом (ст. 248 в редакции Dz.U. 2025 poz. 1794). Об утрате сообщают за 3 дня и получают бесплатную справку, действующую до замены, но не больше 2 месяцев (ст. 232); при утрате по вине плата повышается до 300% (ст. 238). Уклонение от замены и несообщение об утрате за 3 дня — правонарушения со штрафом (ст. 465 ч. 1 п. 4–5). Страница Мазовецкого воеводства о замене: лично на бумаге, 100 zł (50 zł льготно для студентов, учеников, детей до 16 лет и в трудном положении), 200 и 300 zł при первой и повторной утрате по вине, около 30 дней от полного пакета. MOS, пребывание и работа: заявления о продолжении работы у того же работодателя при той же зарплате и объёме рассматриваются вторыми по очереди.",
          pl: "Ustawa o cudzoziemcach, Dz.U. 2025 poz. 1079 ze zmianami. Zezwolenie na pobyt czasowy trwa najwyżej 3 lata (art. 98 ust. 2) i nie jest przedłużane: wniosek o kolejne składa się nie później niż ostatniego dnia legalnego pobytu (art. 105), a dotychczasowe wygasa z mocy prawa z dniem uzyskania kolejnego (art. 102); najwcześniejszego terminu złożenia w ustawie nie znaleziono. Zezwolenia na pobyt stały i rezydenta długoterminowego UE są bezterminowe; karty ważne 10 i 5 lat, każda kolejna również 10 i 5 (art. 243). Wniosek o wydanie kolejnej karty składa się co najmniej 30 dni przed upływem ważności (art. 230 ust. 2); o wymianę — w 14 dni od przesłanek (ust. 1): zmiana danych w karcie, wizerunku, utrata lub uszkodzenie (art. 241), a w karcie jest adres zameldowania (art. 244 ust. 1 pkt 3). Wymienia wojewoda właściwy dla miejsca pobytu (art. 245 ust. 3), pobierając odciski, bez których odmawia się wszczęcia (art. 246–247); odbiór osobisty z ważnym paszportem (art. 248 w brzmieniu Dz.U. 2025 poz. 1794). Utratę zgłasza się w 3 dni, otrzymując bezpłatne zaświadczenie ważne do wymiany, najwyżej 2 miesiące (art. 232); przy zawinionej utracie opłata rośnie do 300% (art. 238). Uchylanie się od wymiany i niezgłoszenie utraty w 3 dni to wykroczenia zagrożone grzywną (art. 465 ust. 1 pkt 4–5). Strona Mazowieckiego Urzędu Wojewódzkiego o wymianie: osobiście na papierze, 100 zł (50 zł ulgowo dla studentów, uczniów, dzieci do 16 lat i w trudnej sytuacji), 200 i 300 zł przy pierwszej i kolejnej zawinionej utracie, około 30 dni od kompletu dokumentów. MOS, pobyt i praca: wnioski o kontynuację pracy u tego samego pracodawcy przy niezmienionym wynagrodzeniu i wymiarze są rozpatrywane w drugiej kolejności.",
        },
      },
      {
        subject: {
          en: "Which temporary permits carry free access to the labour market",
          ru: "Какие временные разрешения дают свободный доступ к рынку труда",
          pl: "Które zezwolenia na pobyt czasowy dają swobodny dostęp do rynku pracy",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Act of 20 March 2025 on the conditions for entrusting work to foreigners, Dz.U. 2025 poz. 621, art. 3 ust. 1: free access for holders of a temporary permit granted for studies (art. 144), research (151, 151b), after divorce or widowhood from a Polish citizen or the death of a parent (158 ust. 2 pkt 1–2), for victims of trafficking (176) and under art. 186 ust. 1 pkt 3, 4 and 7–9 (pkt 14); for the spouse of a Polish citizen or of a free-access holder with a permit granted for the marriage (pkt 15); for their descendants under 21 or dependent (pkt 16); and for family reunification under art. 159 ust. 1 and 161b (pkt 17). Art. 3 ust. 2 pkt 1: a residence and work permit (114, 126, 127, 137a, 139a, 139o, 142 ust. 3) allows work within its terms. Art. 3 ust. 5: a foreigner lawfully staying on a temporary permit (other than art. 181) needs no work permit if holding a valid Karta Polaka, a Polish secondary school certificate with Polish vocational qualifications, a degree from a university seated in Poland, a Polish doctorate, or a place at a Polish doctoral school. For such a foreigner a residence and work permit does not name the employer and states instead the ground of exemption (art. 114 ust. 4, 118 ust. 3–4 of the Act on Foreigners). A temporary permit for business under art. 142 ust. 1 is not in the art. 3 ust. 1 list.",
          ru: "Закон от 20 марта 2025 года об условиях допустимости поручения работы иностранцам, Dz.U. 2025 poz. 621, ст. 3 ч. 1: свободный доступ у держателей временного разрешения, выданного на учёбу (ст. 144), для научной работы (151, 151b), после развода или вдовства с гражданином Польши или смерти родителя (158 ч. 2 п. 1–2), жертвам торговли людьми (176) и по ст. 186 ч. 1 п. 3, 4 и 7–9 (п. 14); у супруга гражданина Польши или держателя свободного доступа с разрешением, выданным в связи с браком (п. 15); у их потомков до 21 года или на иждивении (п. 16); при воссоединении семьи по ст. 159 ч. 1 и 161b (п. 17). Ст. 3 ч. 2 п. 1: разрешение на пребывание и работу (114, 126, 127, 137a, 139a, 139o, 142 ч. 3) позволяет работать в его пределах. Ст. 3 ч. 5: иностранец, законно находящийся на временном разрешении (кроме ст. 181), работает без разрешения на работу, если у него действительная Карта поляка, аттестат польской средней школы с польскими документами о квалификации, диплом вуза в Польше, польская степень доктора или место в польской докторской школе. Для такого иностранца разрешение на пребывание и работу не называет работодателя, а указывает основание освобождения (ст. 114 ч. 4, 118 ч. 3–4 закона об иностранцах). Временного разрешения на бизнес по ст. 142 ч. 1 в перечне ст. 3 ч. 1 нет.",
          pl: "Ustawa z 20 marca 2025 o warunkach dopuszczalności powierzania pracy cudzoziemcom, Dz.U. 2025 poz. 621, art. 3 ust. 1: swobodny dostęp mają posiadacze zezwolenia na pobyt czasowy udzielonego w celu studiów (art. 144), badań naukowych (151, 151b), po rozwodzie lub owdowieniu z obywatelem RP albo śmierci rodzica (158 ust. 2 pkt 1–2), ofiarom handlu ludźmi (176) i na podstawie art. 186 ust. 1 pkt 3, 4 i 7–9 (pkt 14); małżonek obywatela polskiego lub osoby ze swobodnym dostępem z zezwoleniem udzielonym w związku z małżeństwem (pkt 15); ich zstępni do 21 lat lub na utrzymaniu (pkt 16); połączenie z rodziną z art. 159 ust. 1 i 161b (pkt 17). Art. 3 ust. 2 pkt 1: zezwolenie na pobyt czasowy i pracę (114, 126, 127, 137a, 139a, 139o, 142 ust. 3) pozwala pracować w jego granicach. Art. 3 ust. 5: cudzoziemiec przebywający legalnie na zezwoleniu na pobyt czasowy (innym niż z art. 181) pracuje bez zezwolenia na pracę, jeżeli ma ważną Kartę Polaka, świadectwo polskiej szkoły ponadpodstawowej z polskimi dokumentami kwalifikacji, dyplom uczelni z siedzibą w Polsce, polski stopień doktora lub jest doktorantem polskiej szkoły doktorskiej. Takiemu cudzoziemcowi zezwolenie na pobyt czasowy i pracę nie wskazuje podmiotu, lecz podstawę zwolnienia (art. 114 ust. 4, 118 ust. 3–4 ustawy o cudzoziemcach). Zezwolenia na pobyt czasowy w celu działalności gospodarczej z art. 142 ust. 1 nie ma w wykazie art. 3 ust. 1.",
        },
      },
      {
        subject: {
          en: "Citizens of Ukraine: visas, temporary permits, cards and visa-free stays extended by law to 4 March 2027",
          ru: "Граждане Украины: визы, временные разрешения, карты и безвиз продлены законом до 4 марта 2027 года",
          pl: "Obywatele Ukrainy: wizy, zezwolenia na pobyt czasowy, karty i ruch bezwizowy przedłużone ustawą do 4 marca 2027",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 42 of the Act on assistance to citizens of Ukraine, Dz.U. 2025 poz. 337, with the date moved from 30 September 2025 to 4 March 2026 by Dz.U. 2025 poz. 1301 art. 10 pkt 1 and to 4 March 2027 by Dz.U. 2026 poz. 203 art. 17 pkt 20 lit. b, in force 5 March 2026. For a citizen of Ukraine, where the last day falls on or after 24 February 2022: the period of stay and validity of a national visa (ust. 3a), the validity of a temporary residence permit (ust. 5a), and the validity of a residence card, a Polish identity document for a foreigner and a tolerated stay document (ust. 8) are extended by law to 4 March 2027; stay on a Polish or another Schengen state's visa, another Schengen residence document, or visa-free is lawful until then (ust. 11). The extension is not a ground to issue or exchange the documents (ust. 9), and a card or national visa in its extended period does not entitle its holder to cross the border (ust. 3a, 10). Ust. 1–3, 5–7 and 12–19 were repealed by art. 17 pkt 20 lit. a and c–f. Wielkopolski voivodeship office, updated 4 May 2026: no formalities and no exchange are needed.",
          ru: "Ст. 42 закона о помощи гражданам Украины, Dz.U. 2025 poz. 337; дата перенесена с 30 сентября 2025 года на 4 марта 2026 года законом Dz.U. 2025 poz. 1301, ст. 10 п. 1, и на 4 марта 2027 года законом Dz.U. 2026 poz. 203, ст. 17 п. 20 лит. b, в силе с 5 марта 2026 года. Для гражданина Украины, если последний день приходится на 24 февраля 2022 года или позже: срок пребывания и действия национальной визы (ч. 3a), срок действия временного разрешения (ч. 5a), срок действия карты побыту, польского удостоверения личности иностранца и документа о толерируемом пребывании (ч. 8) продлены с силу закона до 4 марта 2027 года; пребывание по польской или другой шенгенской визе, иному шенгенскому документу или безвизу законно до этой даты (ч. 11). Продление не основание выдавать или менять документы (ч. 9), а карта или национальная виза в продлённый период не дают права пересекать границу (ч. 3a, 10). Части 1–3, 5–7 и 12–19 отменены ст. 17 п. 20 лит. a и c–f. Великопольское воеводское управление, обновлено 4 мая 2026 года: оформлять и менять ничего не нужно.",
          pl: "Art. 42 ustawy o pomocy obywatelom Ukrainy, Dz.U. 2025 poz. 337; data zmieniona z 30 września 2025 na 4 marca 2026 przez Dz.U. 2025 poz. 1301 art. 10 pkt 1 i na 4 marca 2027 przez Dz.U. 2026 poz. 203 art. 17 pkt 20 lit. b, w mocy od 5 marca 2026. Dla obywatela Ukrainy, gdy ostatni dzień przypada od 24 lutego 2022: okres pobytu i ważności wizy krajowej (ust. 3a), okres ważności zezwolenia na pobyt czasowy (ust. 5a) oraz ważność karty pobytu, polskiego dokumentu tożsamości cudzoziemca i dokumentu „zgoda na pobyt tolerowany” (ust. 8) ulegają przedłużeniu z mocy prawa do 4 marca 2027; pobyt na podstawie polskiej lub innej wizy Schengen, innego dokumentu pobytowego Schengen lub w ruchu bezwizowym uznaje się za legalny do tej daty (ust. 11). Przedłużenie nie stanowi podstawy do wydania ani wymiany dokumentów (ust. 9), a karta pobytu i wiza krajowa w okresie przedłużenia nie uprawniają do przekraczania granicy (ust. 3a, 10). Ust. 1–3, 5–7 i 12–19 uchylono art. 17 pkt 20 lit. a i c–f. Wielkopolski Urząd Wojewódzki, aktualizacja 4 maja 2026: nie trzeba załatwiać formalności ani wymieniać dokumentów.",
        },
      },
      {
        subject: {
          en: "UKR status and a temporary residence permit: five grounds only",
          ru: "Статус UKR и разрешение на временное пребывание: только пять оснований",
          pl: "Status UKR a zezwolenie na pobyt czasowy: tylko pięć podstaw",
        },
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 45 ust. 1 of Dz.U. 2026 poz. 203, in force 5 March 2026: for a foreigner lawfully staying as a temporary protection beneficiary with UKR status, art. 99 ust. 1 pkt 4 of the Act on Foreigners — refusal to open proceedings for someone on temporary protection — does not apply to an application for residence and work (art. 114 ust. 1), the EU Blue Card (127), business (142 ust. 1 or 3), family member of a Polish citizen (158 ust. 1) or family reunification (159 ust. 1); for reunification with a temporary permit holder the sponsor's two-year minimum does not apply (ust. 2). Fingerprints are taken from the PESEL register where held, or after the grant where they are not (ust. 3, 6); the rules on presenting a passport, giving fingerprints on filing and the personal summons (art. 106a ust. 1, 106b ust. 1, 106e ust. 1) do not apply, the voivode may call for a passport or its copy in justified cases, and the signature is given on the form or on the voivode's device (ust. 5). The same list stood in art. 42 ust. 13 of the Act on assistance to citizens of Ukraine, repealed by art. 17 pkt 20 lit. f of the same act. For other grounds, such as studies or other circumstances, no exception was found, so art. 99 ust. 1 pkt 4 applies; that is a reading of the two provisions together. Temporary protection ends on the day a temporary residence permit is granted (art. 109b ust. 1 pkt 4 of the Act on granting protection).",
          ru: "Ст. 45 ч. 1 закона Dz.U. 2026 poz. 203, в силе с 5 марта 2026 года: к иностранцу, законно находящемуся в Польше как получатель временной защиты со статусом UKR, ст. 99 ч. 1 п. 4 закона об иностранцах — отказ в возбуждении дела тому, кто на временной защите, — не применяется, если он подаёт на пребывание и работу (ст. 114 ч. 1), Голубую карту ЕС (127), бизнес (142 ч. 1 или 3), как член семьи гражданина Польши (158 ч. 1) или на воссоединение семьи (159 ч. 1); при воссоединении с держателем временного разрешения двухлетний минимум приглашающего не применяется (ч. 2). Отпечатки берутся из реестра PESEL, если они там есть, иначе — после выдачи разрешения (ч. 3, 6); нормы о предъявлении паспорта, отпечатках при подаче и вызове на личную явку (ст. 106a ч. 1, 106b ч. 1, 106e ч. 1) не применяются, паспорт или его копию воевода может потребовать в обоснованных случаях, а подпись даётся на бланке или на устройстве воеводы (ч. 5). Тот же перечень стоял в ст. 42 ч. 13 закона о помощи гражданам Украины, отменённой ст. 17 п. 20 лит. f того же закона. Для других оснований, например учёбы или других обстоятельств, исключения не найдено, поэтому действует ст. 99 ч. 1 п. 4; это чтение двух норм вместе. Временная защита прекращается в день выдачи разрешения на временное пребывание (ст. 109b ч. 1 п. 4 закона о защите иностранцев).",
          pl: "Art. 45 ust. 1 ustawy Dz.U. 2026 poz. 203, w mocy od 5 marca 2026: do cudzoziemca przebywającego legalnie jako beneficjent ochrony czasowej ze statusem UKR nie stosuje się art. 99 ust. 1 pkt 4 ustawy o cudzoziemcach — odmowy wszczęcia postępowania wobec korzystającego z ochrony czasowej — jeżeli ubiega się o zezwolenie na pobyt czasowy i pracę (art. 114 ust. 1), Niebieską Kartę UE (127), działalność gospodarczą (142 ust. 1 lub 3), dla członka rodziny obywatela RP (158 ust. 1) lub połączenie z rodziną (159 ust. 1); przy połączeniu z posiadaczem zezwolenia na pobyt czasowy nie stosuje się dwuletniego minimum (ust. 2). Odciski palców pobiera się z rejestru PESEL, jeżeli tam są, a w przeciwnym razie po udzieleniu zezwolenia (ust. 3, 6); przepisów o okazaniu paszportu, odciskach przy wniosku i wezwaniu do osobistego stawiennictwa (art. 106a ust. 1, 106b ust. 1, 106e ust. 1) nie stosuje się, wojewoda może w uzasadnionych przypadkach wezwać do okazania paszportu lub jego kopii, a wzór podpisu składa się na formularzu lub na urządzeniu wojewody (ust. 5). Ten sam wykaz był w art. 42 ust. 13 ustawy o pomocy obywatelom Ukrainy, uchylonym przez art. 17 pkt 20 lit. f tej samej ustawy. Dla innych podstaw, np. studiów lub innych okoliczności, wyjątku nie znaleziono, więc stosuje się art. 99 ust. 1 pkt 4; to odczytanie obu przepisów łącznie. Ochrona czasowa wygasa z dniem udzielenia zezwolenia na pobyt czasowy (art. 109b ust. 1 pkt 4 ustawy o udzielaniu cudzoziemcom ochrony).",
        },
      },
      {
        subject: {
          en: "“Nine to fourteen months in Mazowieckie”",
          ru: "«Девять–четырнадцать месяцев в Мазовецком»",
          pl: "„Dziewięć–czternaście miesięcy na Mazowszu”",
        },
        verdict: "unverified",
        checked: "2026-09-14",
        finding: {
          en: "The figure circulates in consultancy blogs. No current official average processing time by voivodeship was found. What official sources publish is historical: the Supreme Audit Office's inspection of five voivodeship offices for 2021–2023 found 60% of cases handled in breach of the rules and a longest case of about 2,700 days; the Ombudsman's letter of 29 December 2020 gave up to 363 days in Pomorskie and 397 in Dolnośląskie for 2019. Neither is a 2026 figure, so none is printed as one.",
          ru: "Цифра ходит по блогам консалтинговых фирм. Официальных текущих средних сроков по воеводствам не найдено. Официальные источники публикуют исторические данные: проверка NIK пяти воеводских управлений за 2021–2023 годы — 60% дел с нарушениями и самое долгое дело около 2700 дней; письмо Уполномоченного по правам человека от 29 декабря 2020 года — до 363 дней в Поморском и 397 в Нижнесилезском за 2019 год. Ни то ни другое не цифра 2026 года, и как таковая ни одна не публикуется.",
          pl: "Liczba krąży po blogach firm doradczych. Aktualnych oficjalnych średnich czasów rozpatrywania według województw nie znaleziono. Źródła oficjalne publikują dane historyczne: kontrola NIK w pięciu urzędach wojewódzkich za lata 2021–2023 wykazała 60% spraw z naruszeniem przepisów i najdłuższą sprawę około 2700 dni; pismo RPO z 29 grudnia 2020 podawało do 363 dni w pomorskim i 397 w dolnośląskim za 2019. Żadna z tych liczb nie dotyczy 2026 i żadna nie jest tak publikowana.",
        },
      },
      {
        subject: {
          en: "The fee for a CUKR permit",
          ru: "Сбор за разрешение при CUKR",
          pl: "Opłata za zezwolenie przy karcie CUKR",
        },
        // WAS "unverified" UNTIL 15 SEPTEMBER 2026, and the reason it moved is
        // in the finding: the special provisions of the Ukrainian act were read
        // and they make the fee a condition of the card, which the general
        // exemption in the stamp duty annex does not undo in practice.
        verdict: "added",
        checked: "2026-09-15",
        finding: {
          en: "Art. 42s ust. 1–2 of the Act on assistance to citizens of Ukraine levies the stamp duty for a CUKR permit at the rate in part III item 2 of the stamp duty annex, 340 zł, due on filing; art. 42f ust. 3 makes proof of both payments a required attachment, and art. 42e ust. 1 pkt 5–6 makes non-payment of either a ground for refusal. Neither is refunded if the case ends without a card (art. 42s ust. 3, art. 42r ust. 2). The annex to the stamp duty act, Dz.U. 2025 poz. 1154, does list an exemption for a permit granted to a foreigner benefiting from temporary protection; the UdSC procedure page and the Gdańsk voivodeship FAQ both state that both fees are mandatory and no exemption applies. The card fee of 100 zł is set by a regulation under art. 239 of the Act on Foreigners, which was not read; the amount is as UdSC and the voivodeship publish it.",
          ru: "Ст. 42s ч. 1–2 закона о помощи гражданам Украины устанавливает гербовый сбор за разрешение при CUKR по ставке части III п. 2 приложения к закону о гербовом сборе — 340 zł, обязанность возникает при подаче; ст. 42f ч. 3 делает подтверждения обеих оплат обязательными приложениями, а ст. 42e ч. 1 п. 5–6 — неуплату любой из них основанием отказа. Если дело кончилось без карты, ни то ни другое не возвращается (ст. 42s ч. 3, ст. 42r ч. 2). В приложении к закону о гербовом сборе, Dz.U. 2025 poz. 1154, есть освобождение для разрешения, выдаваемого пользующемуся временной защитой; страница процедуры UdSC и FAQ гданьского воеводства обе пишут, что оба платежа обязательны и освобождения нет. Плата за карту, 100 zł, установлена распоряжением по ст. 239 закона об иностранцах, которое не читалось; сумма — как её публикуют UdSC и воеводство.",
          pl: "Art. 42s ust. 1–2 ustawy o pomocy obywatelom Ukrainy nakłada opłatę skarbową za zezwolenie przy karcie CUKR w wysokości z części III ust. 2 załącznika do ustawy o opłacie skarbowej — 340 zł, z obowiązkiem powstającym przy złożeniu wniosku; art. 42f ust. 3 czyni potwierdzenia obu wpłat obowiązkowymi załącznikami, a art. 42e ust. 1 pkt 5–6 nieuiszczenie którejkolwiek podstawą odmowy. Żadna nie podlega zwrotowi, gdy postępowanie kończy się bez karty (art. 42s ust. 3, art. 42r ust. 2). Załącznik do ustawy o opłacie skarbowej, Dz.U. 2025 poz. 1154, przewiduje zwolnienie dla zezwolenia udzielanego cudzoziemcowi korzystającemu z ochrony czasowej; strona procedury UdSC i FAQ Pomorskiego Urzędu Wojewódzkiego podają, że obie opłaty są obowiązkowe i zwolnienie nie ma zastosowania. Opłata za kartę, 100 zł, wynika z rozporządzenia wydanego na podstawie art. 239 ustawy o cudzoziemcach, którego nie czytano; kwota jak w publikacji UdSC i urzędu.",
        },
      },
    ],
    sources: [
      {
        id: "cudzoziemcy",
        citation:
          "Ustawa z dnia 12 grudnia 2013 r. o cudzoziemcach, tekst jednolity Dz.U. 2025 poz. 1079 — art. 10, 22, 98–105, 108, 112a, 114, 118–123, 127, 140, 142, 144, 158, 159, 163, 186–188, 195–219, 242, 229–251, 299, 302, 303, 315–321, 327–329, 334, 336, 465",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001079",
        kind: "official",
        caveat: {
          en: "The consolidated text of July 2025 predates two amendments, Dz.U. 2025 poz. 1794 and Dz.U. 2026 poz. 203. Every provision cited here was checked against both.",
          ru: "Сводный текст июля 2025 года старше двух поправок, Dz.U. 2025 poz. 1794 и Dz.U. 2026 poz. 203. Каждая названная здесь норма сверена с обеими.",
          pl: "Tekst jednolity z lipca 2025 poprzedza dwie nowelizacje, Dz.U. 2025 poz. 1794 i Dz.U. 2026 poz. 203. Każdy przywołany tu przepis sprawdzono z obiema.",
        },
      },
      {
        id: "nowelizacja-mos",
        citation:
          "Ustawa z dnia 21 listopada 2025 r. o zmianie ustawy o cudzoziemcach oraz niektórych innych ustaw, Dz.U. 2025 poz. 1794 — art. 1 pkt 9 (art. 99), 10 (art. 104), 11–12 (art. 105–106l, w tym 106 ust. 1–7, 106d–106f), 14–15 (art. 108, 112a), 17 (art. 120a), 23 (art. 144), 44–49 (art. 228–248), 28–37 (art. 196, 202–203i, 206, 210, 213, 218a–219i), art. 11, 12, 17, 19",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001794",
        kind: "official",
      },
      {
        id: "komunikat-mos",
        citation:
          "Komunikat Ministra Spraw Wewnętrznych i Administracji z dnia 10 kwietnia 2026 r., Monitor Polski 2026 poz. 370 — dzień wdrożenia MOS: 27 kwietnia 2026",
        url: "https://api.sejm.gov.pl/eli/acts/MP/2026/370/text.pdf",
        kind: "official",
      },
      {
        id: "kpa",
        citation:
          "Kodeks postępowania administracyjnego, tekst jednolity Dz.U. 2025 poz. 1691 — art. 10, 16, 35, 36, 37, 39, 41, 44, 57, 58, 61a, 63, 64, 73, 79a, 127–130, 132, 137–139, 141",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001691",
        kind: "official",
      },
      {
        id: "praca-cudzoziemcow",
        citation:
          "Ustawa z dnia 20 marca 2025 r. o warunkach dopuszczalności powierzania pracy cudzoziemcom na terytorium Rzeczypospolitej Polskiej, Dz.U. 2025 poz. 621 — art. 3 ust. 1 pkt 6, 7, 12, 14–18, ust. 2 pkt 1, ust. 3 pkt 2 i ust. 5",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000621",
        kind: "official",
        caveat: {
          en: "Both provisions cited were rewritten by art. 11 of Dz.U. 2025 poz. 1794, in force from 27 April 2026; the condition quoted is the same in both wordings.",
          ru: "Обе нормы переписаны ст. 11 Dz.U. 2025 poz. 1794, в силе с 27 апреля 2026 года; приведённое условие одинаково в обеих редакциях.",
          pl: "Oba przepisy otrzymały nowe brzmienie art. 11 Dz.U. 2025 poz. 1794, obowiązujące od 27 kwietnia 2026; przytoczony warunek jest taki sam w obu brzmieniach.",
        },
      },
      {
        id: "doreczenia",
        citation:
          "Ustawa z dnia 18 listopada 2020 r. o doręczeniach elektronicznych, tekst jednolity Dz.U. 2024 poz. 1045 — art. 41, 42",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001045",
        kind: "official",
        caveat: {
          en: "Consolidated text of June 2024; later amendments were not searched for.",
          ru: "Сводный текст июня 2024 года; более поздние поправки не искались.",
          pl: "Tekst jednolity z czerwca 2024; późniejszych zmian nie szukano.",
        },
      },
      {
        id: "mos-jak-zaczac",
        citation:
          "Urząd do Spraw Cudzoziemców, Moduł Obsługi Spraw — „Jak zacząć?”: MOS nie zapewnia obecnie dalszej elektronicznej obsługi wniosku",
        url: "https://mos.cudzoziemcy.gov.pl/jak-zaczac/",
        kind: "official",
      },
      {
        id: "muw-wsc",
        citation:
          "Mazowiecki Urząd Wojewódzki, Wydział Spraw Cudzoziemców — strona główna (systemy MOS, e-Doręczenia, inPOL) i komunikat „Załóż konto do e-Doręczeń”",
        url: "https://migrant.wsc.mazowieckie.pl/pl/komunikaty/zaloz-konto-do-e-doreczen-niezbedne-do-doreczania-pism-i-komunikacji-z-nami",
        kind: "official",
        caveat: {
          en: "inpol.mazowieckie.pl itself answered automated reads with a block; what it asks for was not read.",
          ru: "Сам inpol.mazowieckie.pl ответил автоматическому чтению блокировкой; что он запрашивает, не прочитано.",
          pl: "Sam inpol.mazowieckie.pl odpowiedział na automatyczny odczyt blokadą; nie odczytano, czego wymaga.",
        },
      },
      {
        id: "wuw-stan-sprawy",
        citation: "Wielkopolski Urząd Wojewódzki w Poznaniu — Cudzoziemcy: sprawdź stan sprawy",
        url: "https://www.poznan.uw.gov.pl/cudzoziemcy-stan/",
        kind: "official",
      },
      {
        id: "ouw-stan-sprawy",
        citation: "Opolski Urząd Wojewódzki w Opolu, Migrant OUW — stan sprawy (wnioski złożone po 1 stycznia 2024)",
        url: "https://stansprawy.e-wojewoda.pl/",
        kind: "official",
      },
      {
        id: "puw-stan-sprawy",
        citation: "Pomorski Urząd Wojewódzki w Gdańsku, Wydział Spraw Cudzoziemców — „Sprawdź stan sprawy”",
        url: "https://klient.gdansk.uw.gov.pl/",
        kind: "official",
        caveat: {
          en: "Linked from the office's foreigners' site; the service works only with JavaScript and its requirements were not read.",
          ru: "Ссылка с сайта отдела по делам иностранцев; сервис работает только с JavaScript, его требования не прочитаны.",
          pl: "Odnośnik ze strony wydziału spraw cudzoziemców; usługa działa tylko z JavaScriptem, jej wymagań nie odczytano.",
        },
      },
      {
        id: "duw-przybysz",
        citation: "Dolnośląski Urząd Wojewódzki we Wrocławiu — Przybysz, portal informacji o sprawie",
        url: "https://pio-przybysz.duw.pl/",
        kind: "official",
        caveat: {
          en: "On the office's own domain; works only with JavaScript, and its requirements were not read.",
          ru: "На собственном домене управления; работает только с JavaScript, требования не прочитаны.",
          pl: "W domenie urzędu; działa tylko z JavaScriptem, wymagań nie odczytano.",
        },
      },
      {
        id: "muw-krakow-stan-sprawy",
        citation: "Małopolski Urząd Wojewódzki w Krakowie — sprawdź stan sprawy (nie obejmuje spraw cudzoziemców; infolinia INFO.OPT)",
        url: "https://www.malopolska.uw.gov.pl/default.aspx?page=StanSprawy",
        kind: "official",
      },
      {
        id: "pomoc-ukraina",
        citation:
          "Ustawa z dnia 12 marca 2022 r. o pomocy obywatelom Ukrainy w związku z konfliktem zbrojnym na terytorium tego państwa, tekst jednolity Dz.U. 2025 poz. 337 — art. 42 ust. 3a, 5a, 8–11, 13, 42c–42w, 100d",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000337",
        kind: "official",
      },
      {
        id: "ustawa-2025-1301",
        citation:
          "Ustawa z dnia 12 września 2025 r. o zmianie niektórych ustaw w celu weryfikacji prawa do świadczeń na rzecz rodziny dla cudzoziemców…, Dz.U. 2025 poz. 1301 — art. 10 pkt 1, 18, 19",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001301",
        kind: "official",
      },
      {
        id: "ustawa-2026-203",
        citation:
          "Ustawa z dnia 23 stycznia 2026 r. o wygaszeniu rozwiązań wynikających z ustawy o pomocy obywatelom Ukrainy…, Dz.U. 2026 poz. 203 — art. 4 (art. 106, 109a, 109b ustawy o udzielaniu cudzoziemcom ochrony), art. 12 pkt 5–9 (art. 113c, 120c, 207b, 223a, 299 ustawy o cudzoziemcach), art. 17 pkt 1, 20, 22–31, 50, art. 29, 45, 54",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20260000203",
        kind: "official",
      },
      {
        id: "puw-cukr-faq",
        citation: "Pomorski Urząd Wojewódzki w Gdańsku, Wydział Spraw Cudzoziemców — Karta pobytu CUKR: pytania i odpowiedzi",
        url: "https://wsc.gdansk.uw.gov.pl/pl/cukr-faq",
        kind: "official",
        caveat: {
          en: "An official page ranks below the act. This one agrees with it on most points and departs from it on three: it still names 4 March 2027 for UKR stay, and it adds family members and a personal signature that art. 42c and 42f do not name.",
          ru: "Официальная страница стоит ниже текста закона. Эта совпадает с ним в большинстве пунктов и расходится в трёх: всё ещё называет 4 марта 2027 года для пребывания UKR и добавляет членов семьи и личную подпись, которых нет в ст. 42c и 42f.",
          pl: "Strona urzędu stoi niżej niż tekst ustawy. Ta zgadza się z nią w większości punktów i rozchodzi w trzech: wciąż podaje 4 marca 2027 dla pobytu UKR oraz dodaje członków rodziny i podpis osobisty, których nie wymieniają art. 42c i 42f.",
        },
      },
      {
        id: "wuw-cukr",
        citation: "Wielkopolski Urząd Wojewódzki w Poznaniu — „Masz PESEL UKR? Wybierz kartę pobytu CUKR zamiast standardowego pobytu czasowego”",
        url: "https://migrant.poznan.uw.gov.pl/pl/komunikaty/masz-pesel-ukr-wybierz-karte-pobytu-cukr-zamiast-standardowego-pobytu-czasowego",
        kind: "official",
      },
      {
        id: "udsc-2028",
        citation: "Urząd do Spraw Cudzoziemców — Przedłużenie ochrony czasowej do 4 marca 2028 r. (6 sierpnia 2026), decyzja wykonawcza Rady (UE) 2026/1912",
        url: "https://www.gov.pl/web/udsc/przedluzenie-ochrony-czasowej-do-4-marca-2028-r",
        kind: "official",
        caveat: {
          en: "The Council decision itself was not read: EUR-Lex refused automated reads. The Mazowieckie voivodeship copy of this notice gives different dates for the military-obligation rule.",
          ru: "Само решение Совета не прочитано: EUR-Lex отказал автоматическому чтению. Копия этого сообщения на сайте мазовецкого воеводы называет другие даты правила о воинской обязанности.",
          pl: "Samej decyzji Rady nie przeczytano: EUR-Lex odrzucił automatyczny odczyt. Kopia tego komunikatu na stronie Mazowieckiego Urzędu Wojewódzkiego podaje inne daty reguły o obowiązkach wojskowych.",
        },
      },
      {
        id: "komunikat-cukr",
        citation:
          "Komunikat Ministra Spraw Wewnętrznych i Administracji z dnia 10 kwietnia 2026 r., Monitor Polski 2026 poz. 371 — dzień wdrożenia art. 42c–42w: 4 maja 2026",
        url: "https://api.sejm.gov.pl/eli/acts/MP/2026/371/text.pdf",
        kind: "official",
      },
      {
        id: "obywatelstwo",
        citation:
          "Ustawa z dnia 2 kwietnia 2009 r. o obywatelstwie polskim, tekst jednolity Dz.U. 2025 poz. 1611 — art. 3, 4, 7–10, 18–36",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001611",
        kind: "official",
      },
      {
        id: "druk-1759",
        citation:
          "Sejm RP, X kadencja — druk nr 1759, prezydencki projekt ustawy o zmianie ustawy o obywatelstwie polskim; przebieg procesu",
        url: "https://api.sejm.gov.pl/sejm/term10/processes/1759",
        kind: "official",
        caveat: {
          en: "sejm.gov.pl answers automated reads with a captcha; the Sejm's own API was used instead.",
          ru: "sejm.gov.pl отвечает автоматическому чтению капчей; использован собственный API Сейма.",
          pl: "sejm.gov.pl odpowiada na automatyczne odczyty captchą; użyto własnego API Sejmu.",
        },
      },
      {
        id: "druk-1273",
        citation:
          "Sejm RP, X kadencja — druk nr 1273, poselski projekt ustawy o zmianie ustawy o obywatelstwie polskim; stanowisko Rządu z 21 sierpnia 2025 (druk 1273-s)",
        url: "https://api.sejm.gov.pl/sejm/term10/processes/1273",
        kind: "official",
        caveat: {
          en: "The government's position is a scanned document with no text layer; its content was not read.",
          ru: "Позиция правительства — скан без текстового слоя; её содержание не прочитано.",
          pl: "Stanowisko Rządu to skan bez warstwy tekstowej; jego treści nie odczytano.",
        },
      },
      {
        id: "druk-1888",
        citation:
          "Sejm RP, X kadencja — druk nr 1888, poselski projekt ustawy o zmianie ustawy o obywatelstwie polskim; odrzucony w pierwszym czytaniu 9 stycznia 2026",
        url: "https://api.sejm.gov.pl/sejm/term10/processes/1888",
        kind: "official",
      },
      {
        id: "oplata-skarbowa",
        citation:
          "Ustawa z dnia 16 listopada 2006 r. o opłacie skarbowej, tekst jednolity Dz.U. 2025 poz. 1154 — załącznik, część I poz. 26, 27 i 27a, część III poz. 2, 2b, 2d, 3, 4 i 8",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001154",
        kind: "official",
      },
      {
        id: "kryteria-dochodowe",
        citation:
          "Rozporządzenie Rady Ministrów z dnia 12 lipca 2024 r. w sprawie zweryfikowanych kryteriów dochodowych oraz kwot świadczeń pieniężnych z pomocy społecznej, Dz.U. 2024 poz. 1044",
        url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001044",
        kind: "official",
      },
      {
        id: "ppsa",
        citation:
          "Ustawa z dnia 30 sierpnia 2002 r. – Prawo o postępowaniu przed sądami administracyjnymi, tekst jednolity Dz.U. 2026 poz. 143 — art. 52, 53, 54, 61, 243–246",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2026/143/text.pdf",
        kind: "official",
      },
      {
        id: "wpis-sadowy",
        citation:
          "Rozporządzenie Rady Ministrów z dnia 16 grudnia 2003 r. w sprawie wysokości oraz szczegółowych zasad pobierania wpisu w postępowaniu przed sądami administracyjnymi, tekst jednolity Dz.U. 2021 poz. 535 — § 2 ust. 3 pkt 8: 300 zł",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2021/535/text.pdf",
        kind: "official",
      },
      {
        id: "mos-praca-dokumenty",
        citation:
          "Urząd do Spraw Cudzoziemców, Moduł Obsługi Spraw — zezwolenie jednolite na pobyt czasowy i pracę: „Dokumenty”, „Wypełnienie i złożenie wniosku”, „Opłaty”",
        url: "https://mos.cudzoziemcy.gov.pl/kategorie-informacji/mozliwosci-legalizacji/spoza-ue-kontynuacja-pobytu/zezwolenie-czasowy/praca/zezwolenie-jednolite/dokumenty/",
        kind: "official",
        caveat: {
          en: "An official page ranks below the act. The act names no document list for the stage of summons; these pages give examples, not a closed list.",
          ru: "Официальная страница стоит ниже текста закона. Закон не содержит перечня документов для этапа вызова; эти страницы дают примеры, а не закрытый список.",
          pl: "Strona urzędu stoi niżej niż tekst ustawy. Ustawa nie zawiera wykazu dokumentów na etap wezwania; strony podają przykłady, a nie zamknięty katalog.",
        },
      },
      {
        id: "nieruchomosci-cudzoziemcy",
        citation:
          "Ustawa z dnia 24 marca 1920 r. o nabywaniu nieruchomości przez cudzoziemców, tekst jednolity Dz.U. 2017 poz. 2278 — art. 1, 1a, 2, 3, 3a, 3d, 3e, 5, 6, 7, 8, 8a",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2017/2278/text.pdf",
        kind: "official",
        caveat: {
          en: "Consolidated text of 2017; the only later amendment found in the ELI register is Dz.U. 2026 poz. 1099, cited beside it, which does not touch who needs a permit.",
          ru: "Сводный текст 2017 года; единственная более поздняя поправка в реестре ELI — Dz.U. 2026 poz. 1099, приведённая рядом, и она не меняет того, кому нужно разрешение.",
          pl: "Tekst jednolity z 2017; jedyna późniejsza nowelizacja znaleziona w rejestrze ELI to Dz.U. 2026 poz. 1099 przywołana obok, która nie zmienia kręgu osób potrzebujących zezwolenia.",
        },
      },
      {
        id: "nowelizacja-2026-1099",
        citation:
          "Ustawa z dnia 17 lipca 2026 r. o zmianie ustawy o nabywaniu nieruchomości przez cudzoziemców oraz ustawy – Prawo o notariacie, Dz.U. 2026 poz. 1099 — art. 1 pkt 3 (art. 8a ust. 1a–1d), art. 5: wejście w życie po 3 miesiącach od ogłoszenia 18 sierpnia 2026",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2026/1099/text.pdf",
        kind: "official",
      },
      {
        id: "kierujacy-pojazdami",
        citation:
          "Ustawa z dnia 5 stycznia 2011 r. o kierujących pojazdami, tekst jednolity Dz.U. 2025 poz. 1226 — art. 4, 5, 10, 11, 12, 13, 14",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/1226/text.pdf",
        kind: "official",
        caveat: {
          en: "The consolidated text is of 5 September 2025 and therefore predates the amendments read beside it: art. 14 changed on 17 December 2025 and art. 11 on 3 September 2026, both by Dz.U. 2025 poz. 1676.",
          ru: "Сводный текст от 5 сентября 2025 года и потому не содержит поправок, прочитанных рядом: ст. 14 изменена 17 декабря 2025 года, ст. 11 — 3 сентября 2026 года, обе законом Dz.U. 2025 poz. 1676.",
          pl: "Tekst jednolity z 5 września 2025 r. nie obejmuje nowelizacji czytanych obok: art. 14 zmieniono 17 grudnia 2025, a art. 11 — 3 września 2026, oba ustawą Dz.U. 2025 poz. 1676.",
        },
      },
      {
        id: "nowelizacja-2025-1676",
        citation:
          "Ustawa z dnia 17 października 2025 r. o zmianie ustawy – Prawo o ruchu drogowym oraz niektórych innych ustaw, Dz.U. 2025 poz. 1676 — art. 4 pkt 7 i 8 (art. 11 i 14 ustawy o kierujących pojazdami), art. 22 (wejście w życie: 14 dni i 9 miesięcy od ogłoszenia 2 grudnia 2025)",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/1676/text.pdf",
        kind: "official",
      },
      {
        id: "wydawanie-prawa-jazdy",
        citation:
          "Rozporządzenie Ministra Infrastruktury z dnia 5 sierpnia 2025 r. w sprawie wydawania dokumentów stwierdzających uprawnienia do kierowania pojazdami, Dz.U. 2025 poz. 1073 — § 5 ust. 1 pkt 3 i ust. 6, § 14 ust. 1 pkt 5 i 6; zmiana Dz.U. 2026 poz. 1162 (w życie 3 września 2026)",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/1073/text.pdf",
        kind: "official",
      },
      {
        id: "oplata-prawo-jazdy",
        citation:
          "Rozporządzenie Ministra Infrastruktury z dnia 9 lipca 2025 r. w sprawie wysokości opłat za wydanie dokumentów stwierdzających uprawnienia do kierowania pojazdami, Dz.U. 2025 poz. 953 — § 1: 100 zł, 35 zł, 30 zł",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/953/text.pdf",
        kind: "official",
      },
      {
        id: "kodeks-wykroczen",
        citation:
          "Ustawa z dnia 20 maja 1971 r. – Kodeks wykroczeń, tekst jednolity Dz.U. 2025 poz. 734 — art. 94 § 1 i § 3, art. 95 § 1",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/734/text.pdf",
        kind: "official",
      },
      {
        id: "govpl-prawo-jazdy",
        citation:
          "gov.pl — „Wymień zagraniczne prawo jazdy na polskie”: co przygotować, gdzie złożyć, ile zapłacić (100 zł), ile czekać (do 9 dni roboczych od potwierdzenia danych i opłaty)",
        url: "https://www.gov.pl/web/gov/wymien-zagraniczne-prawo-jazdy-na-polskie",
        kind: "official",
        caveat: {
          en: "An official page ranks below the act, and this one's legal-basis box is stale: it cites the act as Dz.U. 2023 poz. 622 and the 2016 regulation replaced by Dz.U. 2025 poz. 1073. Its fee is current; its document list asks for proof of registered address, where the act asks for a declaration of residence.",
          ru: "Официальная страница стоит ниже текста закона, и её правовая справка устарела: закон указан как Dz.U. 2023 poz. 622, а распоряжение — версии 2016 года, заменённой Dz.U. 2025 poz. 1073. Сумма сбора актуальна; в перечне документов она просит подтверждение адреса прописки там, где закон требует декларацию о месте жительства.",
          pl: "Strona urzędowa stoi niżej niż ustawa, a jej podstawa prawna jest nieaktualna: wskazuje ustawę jako Dz.U. 2023 poz. 622 i rozporządzenie z 2016 r. zastąpione przez Dz.U. 2025 poz. 1073. Opłata jest aktualna; wykaz dokumentów żąda potwierdzenia adresu zameldowania tam, gdzie ustawa wymaga oświadczenia o miejscu zamieszkania.",
        },
      },
      {
        id: "pcc",
        citation:
          "Ustawa z dnia 9 września 2000 r. o podatku od czynności cywilnoprawnych, tekst jednolity Dz.U. 2026 poz. 191 — art. 2 pkt 4, art. 4 pkt 1, art. 6 ust. 1–4, art. 7 ust. 1 pkt 1 i 7 oraz ust. 5, art. 7a, art. 9 pkt 2 i 17, art. 10 ust. 1–3",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2026/191/text.pdf",
        kind: "official",
      },
      {
        id: "vat",
        citation:
          "Ustawa z dnia 11 marca 2004 r. o podatku od towarów i usług, tekst jednolity Dz.U. 2025 poz. 775 — art. 41 ust. 12, 12a–12c, art. 146ef ust. 1 pkt 1–2",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/775/text.pdf",
        kind: "official",
      },
      {
        id: "taksa-notarialna",
        citation:
          "Rozporządzenie Ministra Sprawiedliwości z dnia 28 czerwca 2004 r. w sprawie maksymalnych stawek taksy notarialnej, tekst jednolity Dz.U. 2024 poz. 1566 — § 2–4, § 6 pkt 18–19, § 7 ust. 1 pkt 1, § 12",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2024/1566/text.pdf",
        kind: "official",
        caveat: {
          en: "The regulation sets MAXIMUM rates and says nothing about VAT; what a notary actually charges is agreed, and the invoice adds tax on top.",
          ru: "Распоряжение устанавливает МАКСИМАЛЬНЫЕ ставки и ничего не говорит о НДС; реальную таксу согласуют, а в счёте налог добавляется сверху.",
          pl: "Rozporządzenie określa stawki MAKSYMALNE i nie mówi nic o VAT; faktyczną taksę się uzgadnia, a faktura dolicza podatek.",
        },
      },
      {
        id: "koszty-sadowe",
        citation:
          "Ustawa z dnia 28 lipca 2005 r. o kosztach sądowych w sprawach cywilnych, tekst jednolity Dz.U. 2025 poz. 1228 — art. 42–48 (sprawy z zakresu prawa o księgach wieczystych)",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/1228/text.pdf",
        kind: "official",
      },
      {
        id: "ksiegi-wieczyste",
        citation:
          "Ustawa z dnia 6 lipca 1982 r. o księgach wieczystych i hipotece, tekst jednolity Dz.U. 2026 poz. 1066 — art. 1–8, 25, 36⁴ ust. 2–7, 36⁵",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2026/1066/text.pdf",
        kind: "official",
        caveat: {
          en: "The fee for a copy is set by a separate regulation of the justice minister under art. 36⁵, which was not read; online viewing, which is what a buyer does first, is free under the act itself.",
          ru: "Плату за выписку устанавливает отдельное распоряжение министра юстиции по ст. 36⁵, которое не читалось; просмотр через интернет, с которого покупатель и начинает, бесплатен по самому закону.",
          pl: "Opłatę za odpis określa odrębne rozporządzenie Ministra Sprawiedliwości na podstawie art. 36⁵, którego nie czytano; przeglądanie przez internet, od którego kupujący zaczyna, jest bezpłatne z mocy samej ustawy.",
        },
      },
      {
        id: "ustroj-rolny",
        citation:
          "Ustawa z dnia 11 kwietnia 2003 r. o kształtowaniu ustroju rolnego, tekst jednolity Dz.U. 2026 poz. 941 — art. 1a, 2 pkt 1–2, 2a, 2b, 2ba, 3, 9",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2026/941/text.pdf",
        kind: "official",
      },
      {
        id: "granica-panstwowa",
        citation:
          "Ustawa z dnia 12 października 1990 r. o ochronie granicy państwowej, tekst jednolity Dz.U. 2026 poz. 919 — art. 8, 9, 12 (strefa nadgraniczna)",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2026/919/text.pdf",
        kind: "official",
      },
      {
        id: "wuw-przedluzenie-ua",
        citation: "Wielkopolski Urząd Wojewódzki w Poznaniu — „Przedłużenie ważności dokumentów i legalności pobytu” (obywatele Ukrainy), aktualizacja 4 maja 2026",
        url: "https://migrant.poznan.uw.gov.pl/pl/procedury/przedluzenie-waznosci-dokumentow-i-legalnosci-pobytu",
        kind: "official",
      },
      {
        id: "mos-zmiana-zezwolenia",
        citation:
          "Urząd do Spraw Cudzoziemców, Moduł Obsługi Spraw — zezwolenie jednolite na pobyt czasowy i pracę: „Zmiana zezwolenia” i „Postępowanie w sprawie”",
        url: "https://mos.cudzoziemcy.gov.pl/kategorie-informacji/mozliwosci-legalizacji/spoza-ue-kontynuacja-pobytu/zezwolenie-czasowy/praca/zezwolenie-jednolite/zmiana-zezwolenia/",
        kind: "official",
      },
      {
        id: "muw-wymiana-karty",
        citation: "Mazowiecki Urząd Wojewódzki, Wydział Spraw Cudzoziemców — „Wymiana karty pobytu”",
        url: "https://migrant.wsc.mazowieckie.pl/pl/procedury/wymiana-karty-pobytu",
        kind: "official",
        caveat: {
          en: "Not dated; it still names the inPOL form and two printed photographs. Card exchange was not moved to MOS by Dz.U. 2025 poz. 1794, which amended art. 229–248 in other respects.",
          ru: "Без даты; всё ещё называет форму inPOL и две бумажные фотографии. Замену карты поправка Dz.U. 2025 poz. 1794 в MOS не переносила, изменив ст. 229–248 в другом.",
          pl: "Bez daty; wciąż wskazuje formularz inPOL i dwie fotografie. Wymiany karty ustawa Dz.U. 2025 poz. 1794 nie przeniosła do MOS, zmieniając art. 229–248 w innym zakresie.",
        },
      },
      {
        id: "mos-rodzina-dokumenty",
        citation:
          "Urząd do Spraw Cudzoziemców, Moduł Obsługi Spraw — pobyt z rodziną, „Dokumenty”: małżonek obywatela RP, małżonek cudzoziemca, dziecko lub pasierb cudzoziemca, dziecko cudzoziemca urodzone w Polsce",
        url: "https://mos.cudzoziemcy.gov.pl/kategorie-informacji/mozliwosci-legalizacji/spoza-ue-kontynuacja-pobytu/zezwolenie-czasowy/pobyt-z-rodzina/malzonek-spoza-ue/dokumenty/",
        kind: "official",
      },
      {
        id: "mos-studia-dokumenty",
        citation: "Urząd do Spraw Cudzoziemców, Moduł Obsługi Spraw — zezwolenie na pobyt czasowy w celu studiów: „Dokumenty”",
        url: "https://mos.cudzoziemcy.gov.pl/kategorie-informacji/mozliwosci-legalizacji/spoza-ue-kontynuacja-pobytu/zezwolenie-czasowy/studia/zezwolenie-studia/dokumenty/",
        kind: "official",
      },
      {
        id: "wuw-fotografia",
        citation: "Wielkopolski Urząd Wojewódzki w Poznaniu, słownik pojęć — „Fotografie/zdjęcie biometryczne/fotografia cyfrowa”",
        url: "https://migrant.poznan.uw.gov.pl/pl/slownik-pojec/fotografiezdjecie-biometrycznefotografia-cyfrowa",
        kind: "official",
        caveat: {
          en: "Not dated, and names no provision. The link to the photograph criteria on MOS was broken when read.",
          ru: "Без даты и без ссылки на норму. Ссылка на критерии фото в MOS при чтении не работала.",
          pl: "Bez daty i bez wskazania przepisu. Odnośnik do kryteriów fotografii w MOS w chwili odczytu nie działał.",
        },
      },
      {
        id: "mos-odwolanie",
        citation: "Urząd do Spraw Cudzoziemców, Moduł Obsługi Spraw — „Odwołanie” (zezwolenie na pobyt czasowy)",
        url: "https://mos.cudzoziemcy.gov.pl/kategorie-informacji/mozliwosci-legalizacji/spoza-ue-kontynuacja-pobytu/zezwolenie-czasowy/praca/niebieska-karta/odwolanie/",
        kind: "official",
        caveat: {
          en: "An official page ranks below the act. This one agrees with art. 112a, 129 KPA and art. 299 on every point checked.",
          ru: "Официальная страница стоит ниже текста закона. Эта совпадает со ст. 112a, 129 KPA и 299 во всех проверенных пунктах.",
          pl: "Strona urzędu stoi niżej niż tekst ustawy. Ta zgadza się z art. 112a, 129 KPA i 299 we wszystkich sprawdzonych punktach.",
        },
      },
      {
        id: "placa-minimalna-2026",
        citation:
          "Rozporządzenie Rady Ministrów z dnia 11 września 2025 r. w sprawie wysokości minimalnego wynagrodzenia za pracę oraz wysokości minimalnej stawki godzinowej w 2026 r., Dz.U. 2025 poz. 1242 — 4806 zł od 1 stycznia 2026",
        url: "https://api.sejm.gov.pl/eli/acts/DU/2025/1242/text.pdf",
        kind: "official",
      },
      {
        id: "puw-podlaski-podroze",
        citation: "Podlaski Urząd Wojewódzki w Białymstoku — Podróżowanie na podstawie karty pobytu",
        url: "https://www.gov.pl/web/uw-podlaski/podrozowanie-na-podstawie-karty-pobytu",
        kind: "official",
        caveat: {
          en: "An official page ranks below the act. It names no provision and carries no date; the 90-in-180 rule it states comes from EU law, which was not read.",
          ru: "Официальная страница стоит ниже текста закона. Она не называет нормы и не датирована; правило 90 из 180 дней, о котором она пишет, — из права ЕС, которое не читалось.",
          pl: "Strona urzędu stoi niżej niż tekst ustawy. Nie wskazuje przepisu i nie ma daty; opisana reguła 90 dni w okresie 180 wynika z prawa UE, którego nie czytano.",
        },
      },
      {
        id: "udsc-cukr",
        citation: "Urząd do Spraw Cudzoziemców — procedura wydania karty pobytu CUKR",
        url: "https://www.gov.pl/web/udsc/CUKR-procedura",
        kind: "official",
        caveat: {
          en: "An official page ranks below the act. This one agrees with it on every condition and date checked.",
          ru: "Официальная страница стоит ниже текста закона. Эта совпадает с ним по всем проверенным условиям и датам.",
          pl: "Strona urzędu stoi niżej niż tekst ustawy. Ta zgadza się z nią we wszystkich sprawdzonych warunkach i datach.",
        },
      },
      {
        id: "udsc-zawieszenie",
        citation: "Urząd do Spraw Cudzoziemców — zawieszenie biegu terminów załatwiania spraw cudzoziemskich (6 października 2025)",
        url: "https://www.gov.pl/web/udsc/zawieszenie-biegu-terminow-zalatwiania-spraw-cudzoziemskich",
        kind: "official",
        caveat: {
          en: "Cited because it is out of date. It names 4 March 2026, correct when written; Dz.U. 2026 poz. 203 has since moved the date to 4 March 2027.",
          ru: "Приведена потому, что устарела. Называет 4 марта 2026 года, что было верно на момент написания; закон Dz.U. 2026 poz. 203 с тех пор перенёс дату на 4 марта 2027 года.",
          pl: "Przywołana, bo jest nieaktualna. Podaje 4 marca 2026, co było prawdą w chwili publikacji; ustawa Dz.U. 2026 poz. 203 przesunęła tę datę na 4 marca 2027.",
        },
      },
      {
        id: "muw-podroze",
        citation: "Mazowiecki Urząd Wojewódzki, BIP — pytania i odpowiedzi, praca i pobyt (14 sierpnia 2020)",
        url: "https://bip.mazowieckie.pl/artykul/358-25668-pytania-i-odpowiedzi-praca-i-pobyt",
        kind: "official",
        caveat: {
          en: "Written about the passport stamp, before MOS replaced it with a zaświadczenie on 27 April 2026.",
          ru: "Написано о штампе в паспорте, до того как с 27 апреля 2026 года MOS заменил его на zaświadczenie.",
          pl: "Dotyczy stempla w paszporcie, sprzed zastąpienia go zaświadczeniem w MOS 27 kwietnia 2026.",
        },
      },
      {
        id: "nik-cudzoziemcy",
        citation: "Najwyższa Izba Kontroli — obsługa cudzoziemców w urzędach wojewódzkich, kontrola za lata 2021–2023",
        url: "https://www.nik.gov.pl/aktualnosci/obsluga-paszportowa-cudzoziemcow-wroclaw.html",
        kind: "official",
      },
      {
        id: "rpo-2020",
        citation: "Rzecznik Praw Obywatelskich — pismo do Prezesa Rady Ministrów w sprawie przewlekłości procedur wobec cudzoziemców, 29 grudnia 2020",
        url: "https://bip.brpo.gov.pl/pl/content/rpo-do-premiera-o-przewleklosci-procedur-wobec-cudzoziemcow",
        kind: "official",
      },
    ],
    note: {
      en: "Poland is not one of the five jurisdictions in the comparison. This section backs pages for people who already live in Poland and need a residence permit or citizenship, which is a different question from where to move. Four of the rules above carry an expiry: the suspension of time limits and the CUKR filing deadline both run to 4 March 2027, the income threshold is reviewed every three years, and the minimum wage is set anew for each year. The rows will be re-read before those dates.",
      ru: "Польша не входит в пять юрисдикций сравнения. Эта секция подкрепляет страницы для тех, кто уже живёт в Польше и оформляет разрешение на пребывание или гражданство, — это другой вопрос, чем выбор страны для переезда. У четырёх норм выше есть срок: приостановка сроков и срок подачи на CUKR действуют до 4 марта 2027 года, порог дохода пересматривается раз в три года, а минимальная зарплата устанавливается на каждый год заново. Строки будут перечитаны до этих дат.",
      pl: "Polska nie należy do pięciu jurysdykcji porównania. Ta sekcja stoi za stronami dla osób, które już mieszkają w Polsce i starają się o zezwolenie pobytowe lub obywatelstwo — to inne pytanie niż wybór kraju przeprowadzki. Cztery z powyższych reguł mają termin: zawieszenie terminów i termin składania wniosków o kartę CUKR biegną do 4 marca 2027, próg dochodowy jest weryfikowany co trzy lata, a płacę minimalną ustala się na każdy rok od nowa. Wiersze zostaną przeczytane ponownie przed tymi datami.",
    },
  },
];

// Published through `tightenDeep` for the same reason COUNTRY_PAGES is: Russian
// and Polish group thousands with a space, and at any width "€220 000" duly
// broke across two lines the first time this page rendered. Applied at the
// export so a future consumer cannot forget it. See src/lib/typography.ts.
export const SOURCE_SECTIONS: SourceSection[] =
  tightenDeep(SOURCE_SECTIONS_RAW);

// THE ANCHORS ARE A PUBLIC INTERFACE, SO THEY ARE CHECKED AT BUILD TIME. Two
// sources in one section sharing an id would produce two elements with the same
// DOM id: the browser would jump to the first, silently, and the second act
// would be uncitable. Nothing about the rendered page would look wrong. A throw
// at module load fails `next build` instead, which is the only moment anyone is
// looking.
for (const section of SOURCE_SECTIONS) {
  const seen = new Set<string>();
  for (const source of section.sources) {
    if (!source.id) {
      throw new Error(
        `sourceData: source "${source.citation}" in section "${section.key}" has no id. ` +
          `Every instrument needs one — it is the anchor an article links to.`,
      );
    }
    if (seen.has(source.id)) {
      throw new Error(
        `sourceData: duplicate source id "${source.id}" in section "${section.key}". ` +
          `Ids must be unique within a section; give the newer instrument its own.`,
      );
    }
    seen.add(source.id);
  }
}
