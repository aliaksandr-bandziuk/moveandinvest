import type { Locale } from "@/i18n/routing";
import { tightenDeep } from "./typography";

// WHAT CHANGED IN THE RULES, WITH THE ACT THAT CHANGED IT.
//
// The last of the three things the footer has promised since launch, and the
// one that took longest because the shape had to be argued rather than
// assumed. Three times it was proposed as an article and three times refused,
// for a reason the Guides & Research section states in its own copy: "Why every
// entry carries a date. Because the answer expires." An entry carries ONE date,
// its publication. A log of rule changes whose newest fact is as old as its
// publication date is the thing this site audits other people for.
//
// So it is a page, and its data lives in code beside src/lib/sourceData.ts, for
// the same reason that file gives: a figure may not move without its evidence
// moving in the same commit, and a Studio field routes straight around that.
//
// WHAT GOES IN, AND THE LINE THAT WAS DRAWN.
//
// This log records what the LAW did. It does not record what this site got
// wrong and corrected — those are on /sources, where each corrected row now
// carries its own re-check date. Two logs, deliberately, because they are two
// different events: "Greece raised a threshold" and "we misread an article" are
// not the same kind of fact, and a reader who cannot tell which one a row is
// describing has been given a worse page rather than a fuller one.
//
// THE THIRD COLUMN IS THE POINT. Every competitor's news page can say that
// Greece raised its thresholds. What none of them says is which of its own
// published figures moved as a result, and on what date it was read again.
// That column is why this page belongs to this site and would not be worth
// building on another.
//
// A CHANGELOG IS A PROMISE OF MAINTENANCE, and an abandoned one is worse than
// none — it is a fresh-looking stamp over a stale fact, which is the exact
// pattern three rows of /sources call out in competitors. So the page states
// its own cadence honestly rather than promising a month it will not keep, and
// it shows two dates that are not the same: REVIEWED_ON, when the whole log was
// last gone through, and UPDATED_ON, when a row last actually changed. A page
// that showed only the second would look abandoned while being current; one
// that showed only the first would look current while being abandoned.

/** ISO date strings, rendered per locale by the page. Stored as ISO because
 *  these rows sort, and three translated strings do not sort. */
export type IsoDate = string;

export interface RuleChange {
  /** The day the change TOOK EFFECT, which is the date a reader plans around —
   *  not the day it was signed and not the day it was reported. Where only a
   *  month is established, the first of that month with `approximate` set. */
  effective: IsoDate;
  /** Set where the day is not established and the date above is a stand-in.
   *  Rendered as "April 2026" rather than "1 April 2026", because a precision
   *  we do not have is a precision we must not print. */
  approximate?: boolean;
  /** A jurisdiction key from the registry: pt | gr | mt | ae | cy. */
  country: string;
  /** What changed, in one sentence. */
  what: Record<Locale, string>;
  /** The instrument, named the way /sources names one: law, article, gazette.
   *  NULL where none could be found — which on this page is a finding rather
   *  than a gap, and is rendered as such. */
  instrument: Record<Locale, string> | null;
  /** Which figure on THIS site moved with it. Absent where none did. */
  moved?: Record<Locale, string>;
  /** The /sources section this row's evidence sits in, for the deep link. */
  section?: string;
}

/** When the whole log was last gone through, row by row. */
export const CHANGES_REVIEWED_ON: IsoDate = "2026-09-01";

/** When a row last actually changed. Deliberately separate from the above: a
 *  quiet month is not an abandoned page, and the reader is entitled to tell
 *  the difference. */
export const CHANGES_UPDATED_ON: IsoDate = "2026-09-01";

// Newest first, and the order is ASSERTED below rather than trusted. A row
// added in the wrong place is invisible: the page renders it wherever it sits,
// nothing fails, and the log quietly stops being chronological. The guard costs
// one pass over twenty-two rows at module load.
const RULE_CHANGES_RAW: RuleChange[] = [
  // FIRST BECAUSE IT IS NEWEST, and for no other reason. This is the most
  // consequential row in the log — Portugal went from the fastest passport in
  // this set to among the slowest — and the temptation to promote it out of
  // chronological order is exactly what makes a news page rather than a log.
  {
    effective: "2026-05-19",
    country: "pt",
    what: {
      en: "Portugal doubled its naturalisation period: seven years for citizens of EU member states and Portuguese-speaking countries, ten for everyone else, against five for everybody before. It also added an examination in culture, history and national symbols, and a declaration of adherence to the democratic rule of law. Proceedings already pending on 19 May are decided under the old five-year rule.",
      ru: "Португалия удвоила срок до натурализации: семь лет для граждан государств ЕС и португалоязычных стран, десять для всех остальных — против пяти для всех прежде. Добавлены экзамен по культуре, истории и государственным символам и заявление о приверженности демократическому правовому государству. Дела, находившиеся в производстве на 19 мая, решаются по прежнему пятилетнему правилу.",
      pl: "Portugalia podwoiła okres do naturalizacji: siedem lat dla obywateli państw UE i krajów portugalskojęzycznych, dziesięć dla pozostałych — wobec pięciu dla wszystkich wcześniej. Dodano egzamin z kultury, historii i symboli narodowych oraz oświadczenie o przywiązaniu do demokratycznego państwa prawa. Sprawy w toku na 19 maja rozstrzyga się według dawnej zasady pięciu lat.",
    },
    instrument: {
      en: "Lei Orgânica 1/2026 of 18 May, art. 6(1)(b), in force 19 May 2026; the transitional rule is art. 7(2)",
      ru: "Lei Orgânica 1/2026 от 18 мая, ст. 6(1)(b), действует с 19 мая 2026 года; переходная норма — ст. 7(2)",
      pl: "Lei Orgânica 1/2026 z 18 maja, art. 6(1)(b), obowiązuje od 19 maja 2026; przepis przejściowy to art. 7(2)",
    },
    moved: {
      en: "The whole citizenship section, and the direction of one of this comparison's central findings: Portugal was the fastest route to a passport in this set and is now among the slowest.",
      ru: "Весь раздел про гражданство — и направление одного из центральных выводов этого сравнения: Португалия была самым быстрым маршрутом к паспорту в наборе, а стала одним из самых медленных.",
      pl: "Cała sekcja o obywatelstwie i kierunek jednego z centralnych wniosków tego porównania: Portugalia była najszybszą drogą do paszportu w tym zestawie, a jest teraz jedną z najwolniejszych.",
    },
    section: "citizenship",
  },
  {
    effective: "2026-04-01",
    approximate: true,
    country: "ae",
    what: {
      en: "Dubai removed the AED 750,000 minimum property value for its two-year investor visa. A sole owner now faces no minimum at all; a co-owner's share must reach AED 400,000.",
      ru: "Дубай отменил минимальную стоимость объекта в 750 000 дирхамов для своей двухлетней инвесторской визы. У единственного собственника минимума больше нет вовсе; доля совладельца должна достигать 400 000 дирхамов.",
      pl: "Dubaj zniósł minimalną wartość nieruchomości 750 000 dirhamów dla swojej dwuletniej wizy inwestora. Jedyny właściciel nie ma już żadnego minimum; udział współwłaściciela musi sięgać 400 000 dirhamów.",
    },
    instrument: null,
    moved: {
      en: "Our “AED 750,000” row, corrected on 30 August 2026: the figure was never a golden visa threshold and is now a repealed one.",
      ru: "Наша строка про «AED 750 000», исправленная 30 августа 2026 года: цифра никогда не была порогом золотой визы, а теперь ещё и отменена.",
      pl: "Nasz wiersz o „AED 750 000”, poprawiony 30 sierpnia 2026: kwota nigdy nie była progiem złotej wizy, a teraz jest dodatkowo uchylona.",
    },
    section: "ae",
  },
  {
    effective: "2026-04-01",
    approximate: true,
    country: "gr",
    what: {
      en: "The Greek minimum wage rose from €880 to €920 a month, which moves the income threshold for EU long-term resident status: article 144 §1(a) sets it as the annual earnings of a minimum-wage earner plus 10% for dependants.",
      ru: "Минимальная зарплата в Греции выросла с 880 до 920 евро в месяц, а вместе с ней и порог дохода для статуса долгосрочного резидента ЕС: статья 144 §1(a) задаёт его как годовой заработок при минимальной зарплате плюс 10% на иждивенцев.",
      pl: "Grecka płaca minimalna wzrosła z 880 do 920 euro miesięcznie, a wraz z nią próg dochodowy dla statusu rezydenta długoterminowego UE: art. 144 §1(a) ustala go jako roczne wynagrodzenie osoby zarabiającej płacę minimalną plus 10% na osoby na utrzymaniu.",
    },
    instrument: {
      en: "KYA 8934/2026, ΦΕΚ Β΄ 1759 of 27.03.2026, in force 1 April 2026",
      ru: "KYA 8934/2026, ΦΕΚ Β΄ 1759 от 27.03.2026, действует с 1 апреля 2026 года",
      pl: "KYA 8934/2026, ΦΕΚ Β΄ 1759 z 27.03.2026, obowiązuje od 1 kwietnia 2026",
    },
    moved: {
      en: "The article 144 threshold: €12,880 a year, or €14,168 with any number of dependants. Both are computed on fourteen payments, which is the ministry's own convention rather than a rule of the immigration article.",
      ru: "Порог статьи 144: 12 880 евро в год, или 14 168 с любым числом иждивенцев. Оба посчитаны на четырнадцати выплатах — это конвенция самого министерства, а не норма миграционной статьи.",
      pl: "Próg z art. 144: 12 880 euro rocznie albo 14 168 przy dowolnej liczbie osób na utrzymaniu. Oba policzone na czternastu wypłatach, co jest konwencją samego ministerstwa, a nie normą artykułu migracyjnego.",
    },
    section: "gr",
  },
  {
    effective: "2026-02-20",
    approximate: true,
    country: "ae",
    what: {
      en: "Dubai stopped requiring that half the property's value be paid before a golden visa application. The requirement was never in the federal annex — it was departmental practice, which is why its removal needed no amending instrument.",
      ru: "Дубай перестал требовать, чтобы половина стоимости объекта была оплачена до подачи на золотую визу. Требования не было в федеральном приложении — это была практика ведомств, поэтому его отмена изменяющего акта и не требовала.",
      pl: "Dubaj przestał wymagać zapłaty połowy wartości nieruchomości przed wnioskiem o złotą wizę. Wymogu nigdy nie było w załączniku federalnym — była to praktyka urzędów, dlatego jego zniesienie nie wymagało aktu zmieniającego.",
    },
    instrument: null,
    section: "ae",
  },
  {
    effective: "2026-02-06",
    country: "gr",
    what: {
      en: "Greece amended its Migration Code in three places at once: article 95 now includes an investor's adult children who lack legal capacity, at any age; article 160 accepts twelve consecutive years of lawful residence in place of the B1 Greek certificate; and article 161, the ten-year national permit, was replaced outright.",
      ru: "Греция изменила миграционный кодекс сразу в трёх местах: статья 95 теперь включает совершеннолетних детей инвестора, лишённых дееспособности, в любом возрасте; статья 160 принимает двенадцать непрерывных лет законного проживания вместо сертификата по греческому на уровне B1; а статья 161, десятилетнее национальное разрешение, заменена целиком.",
      pl: "Grecja zmieniła kodeks migracyjny w trzech miejscach naraz: art. 95 obejmuje teraz pełnoletnie dzieci inwestora pozbawione zdolności do czynności prawnych, w każdym wieku; art. 160 przyjmuje dwanaście kolejnych lat legalnego pobytu zamiast certyfikatu z greckiego na poziomie B1; a art. 161, dziesięcioletnie zezwolenie krajowe, zastąpiono w całości.",
    },
    instrument: {
      en: "Law 5275/2026, arts. 29, 37 and 38 — ΦΕΚ Α΄ 17 of 06.02.2026",
      ru: "Закон 5275/2026, ст. 29, 37 и 38 — ΦΕΚ Α΄ 17 от 06.02.2026",
      pl: "Ustawa 5275/2026, art. 29, 37 i 38 — ΦΕΚ Α΄ 17 z 06.02.2026",
    },
    moved: {
      en: "The twelve-year alternative is new to this site and to the market: we found it on no competing page. The family row was rewritten — the amendment adds one point, not the broad expansion several alerts describe.",
      ru: "Двенадцатилетняя альтернатива нова и для сайта, и для рынка: мы не нашли её ни на одной конкурирующей странице. Строка про семью переписана — поправка добавляет один пункт, а не то широкое расширение, о котором пишут несколько обзоров.",
      pl: "Dwunastoletnia alternatywa jest nowa i dla tej strony, i dla rynku: nie znaleźliśmy jej na żadnej konkurencyjnej stronie. Wiersz o rodzinie przepisano — nowelizacja dodaje jeden punkt, a nie szerokie rozszerzenie opisywane w kilku alertach.",
    },
    section: "gr",
  },
  {
    effective: "2026-01-01",
    country: "ae",
    what: {
      en: "The new Russia–UAE double tax treaty began to apply. It replaces the limited 2011 agreement, which reached only sovereign and state financial institutions, and is the first between the two states to cover private individuals and companies. Dividends, interest and royalties at 10%.",
      ru: "Новое соглашение между Россией и ОАЭ об избежании двойного налогообложения начало применяться. Оно заменило ограниченное соглашение 2011 года, которое покрывало только государство и государственные финансовые институты, и стало первым, дотягивающимся до частных лиц и компаний. Дивиденды, проценты и роялти — 10%.",
      pl: "Nowa umowa Rosja–ZEA o unikaniu podwójnego opodatkowania zaczęła obowiązywać. Zastąpiła ograniczoną umowę z 2011 roku, obejmującą wyłącznie państwo i państwowe instytucje finansowe, i jest pierwszą sięgającą osób prywatnych i spółek. Dywidendy, odsetki i należności licencyjne po 10%.",
    },
    instrument: {
      en: "Signed 17.02.2025; Russian ratification by Federal Law 189-FZ of 07.07.2025; in force 18.07.2025; applies from 01.01.2026",
      ru: "Подписано 17.02.2025; ратифицировано Федеральным законом 189-ФЗ от 07.07.2025; в силе с 18.07.2025; применяется с 01.01.2026",
      pl: "Podpisana 17.02.2025; ratyfikacja rosyjska ustawą federalną 189-FZ z 07.07.2025; w mocy od 18.07.2025; stosowana od 01.01.2026",
    },
    section: "ae",
  },
  {
    effective: "2026-01-01",
    country: "pt",
    what: {
      en: "The Portuguese minimum wage rose to €920 a month, and with it every residence income threshold: the D7 scale is 100% of it for the main applicant, 50% for a second adult and 30% per child, and the investment permit is not exempt from the same test.",
      ru: "Минимальная зарплата в Португалии выросла до 920 евро в месяц, а вместе с ней все пороги дохода для проживания: шкала D7 — это 100% от неё на основного заявителя, 50% на второго взрослого и 30% на ребёнка, и инвестиционное разрешение от той же проверки не освобождено.",
      pl: "Portugalska płaca minimalna wzrosła do 920 euro miesięcznie, a wraz z nią każdy próg dochodowy pobytu: skala D7 to 100% dla wnioskodawcy głównego, 50% dla drugiej osoby dorosłej i 30% na dziecko, a zezwolenie inwestycyjne nie jest z tego badania zwolnione.",
    },
    instrument: {
      en: "Decreto-Lei 139/2025 of 29 December, art. 3, in force 1 January 2026; the scale is Portaria 1563/2007, art. 2(2)",
      ru: "Decreto-Lei 139/2025 от 29 декабря, ст. 3, действует с 1 января 2026 года; шкала — Portaria 1563/2007, ст. 2(2)",
      pl: "Decreto-Lei 139/2025 z 29 grudnia, art. 3, obowiązuje od 1 stycznia 2026; skala to Portaria 1563/2007, art. 2(2)",
    },
    moved: {
      en: "€920, €460 and €276 a month. Note the anchor: these are indexed to the minimum wage and not to the IAS, which is €537.13 for 2026 — a difference of €383 a month for anyone reading the wrong instrument.",
      ru: "920, 460 и 276 евро в месяц. Обратите внимание на привязку: они индексируются к минимальной зарплате, а не к IAS, который на 2026 год равен 537,13 евро — разница в 383 евро в месяц для того, кто читает не тот акт.",
      pl: "920, 460 i 276 euro miesięcznie. Uwaga na zakotwiczenie: są indeksowane do płacy minimalnej, a nie do IAS, który na 2026 rok wynosi 537,13 euro — różnica 383 euro miesięcznie dla kogoś czytającego niewłaściwy akt.",
    },
    section: "pt",
  },
  {
    effective: "2025-11-27",
    country: "ae",
    what: {
      en: "The UAE added a two-year multiple-entry visit visa for work missions, inserted into the executive regulation as a new article 19 bis.",
      ru: "ОАЭ добавили двухлетнюю многократную гостевую визу для рабочих миссий, включив её в исполнительный регламент новой статьёй 19-бис.",
      pl: "ZEA dodały dwuletnią wielokrotną wizę wizytową dla misji roboczych, wprowadzoną do rozporządzenia wykonawczego jako nowy art. 19 bis.",
    },
    instrument: {
      en: "Cabinet Resolution 179/2025, amending Cabinet Resolution 65/2022",
      ru: "Постановление Кабинета министров 179/2025, изменяющее Постановление 65/2022",
      pl: "Uchwała Rady Ministrów 179/2025, zmieniająca uchwałę 65/2022",
    },
    section: "ae",
  },
  {
    effective: "2025-10-22",
    country: "pt",
    what: {
      en: "Portugal made family reunification conditional on already holding a residence permit valid for at least two years, and rewrote who counts as family. Dependent minors and incapacitated persons keep their exemption from the wait, as do holders under articles 90, 90-A and 121-A.",
      ru: "Португалия поставила воссоединение семьи в зависимость от того, что разрешение на пребывание уже действует не менее двух лет, и переписала перечень членов семьи. Несовершеннолетние иждивенцы и недееспособные освобождены от ожидания, как и держатели по статьям 90, 90-A и 121-A.",
      pl: "Portugalia uzależniła łączenie rodzin od posiadania zezwolenia na pobyt ważnego co najmniej dwa lata i przepisała, kto liczy się jako rodzina. Małoletni na utrzymaniu i osoby ubezwłasnowolnione zachowują zwolnienie z oczekiwania, podobnie jak posiadacze z art. 90, 90-A i 121-A.",
    },
    instrument: {
      en: "Lei 61/2025 of 22 October, amending arts. 75, 98, 99 and 101 of Lei 23/2007",
      ru: "Lei 61/2025 от 22 октября, изменяющий ст. 75, 98, 99 и 101 Lei 23/2007",
      pl: "Lei 61/2025 z 22 października, zmieniająca art. 75, 98, 99 i 101 Lei 23/2007",
    },
    section: "pt",
  },
  // MALTA'S FIRST FOUR ROWS, added 1 September 2026, and the reason the page no
  // longer lists Malta as unchecked. Three of the four are one story told in
  // three instruments across four days in July 2025 — which is itself the
  // finding: the scheme did not end and get replaced, it was rewritten in
  // place.
  {
    effective: "2025-07-24",
    country: "mt",
    what: {
      en: "Malta closed citizenship by investment and put a merit route in its place — by amending the condemned scheme's own regulations rather than replacing them. S.L. 188.06 had been in force since November 2020 as the rules for the scheme the Court of Justice struck down; it was rewritten into the rules for naturalisation on the basis of merit, which asks for at least eight months of residence and publishes no price.",
      ru: "Мальта закрыла гражданство за инвестиции и поставила на его место маршрут за заслуги — исправив собственный регламент осуждённой схемы, а не заменив его. S.L. 188.06 действовал с ноября 2020 года как правила той самой схемы, которую снёс Суд ЕС; его переписали в правила натурализации за заслуги, где требуется не менее восьми месяцев проживания и не опубликована цена.",
      pl: "Malta zamknęła obywatelstwo za inwestycje i postawiła w jego miejsce ścieżkę za zasługi — nowelizując własne rozporządzenie potępionego programu, a nie zastępując je. S.L. 188.06 obowiązywało od listopada 2020 jako przepisy tego samego programu, który uchylił Trybunał Sprawiedliwości; przepisano je na zasady naturalizacji za zasługi, gdzie wymaga się co najmniej ośmiu miesięcy pobytu i nie publikuje się ceny.",
    },
    instrument: {
      en: "Act XXI of 2025, Government Gazette No. 21,474 of 24 July 2025, with L.N. 159 of 2025 amending S.L. 188.06",
      ru: "Акт XXI от 2025 года, «Правительственная газета» № 21 474 от 24 июля 2025 года, вместе с L.N. 159 от 2025 года, изменяющим S.L. 188.06",
      pl: "Akt XXI z 2025, Dziennik Rządowy nr 21 474 z 24 lipca 2025, wraz z L.N. 159 z 2025 zmieniającym S.L. 188.06",
    },
    moved: {
      en: "The Malta citizenship row, which named the Act but not L.N. 159 of 2025 and listed four of the six categories of merit. Re-read 1 September 2026.",
      ru: "Строка о гражданстве Мальты, где был назван Акт, но не L.N. 159 от 2025 года, и перечислены четыре категории заслуг из шести. Перечитано 1 сентября 2026 года.",
      pl: "Wiersz o obywatelstwie Malty, w którym wymieniono Akt, ale nie L.N. 159 z 2025, i podano cztery z sześciu kategorii zasług. Odczytano ponownie 1 września 2026.",
    },
    section: "citizenship",
  },
  {
    effective: "2025-07-22",
    country: "mt",
    what: {
      en: "Malta restructured what an MPRP applicant pays and, in the same notice, took over the licensing of the agents who sell it. The €60,000 administrative fee became a staged payment, the €37,000 contribution was made identical for buying and for renting, some dependants stopped paying it at all, and agents moved onto a licence issued by the Agency itself at €5,000 a year.",
      ru: "Мальта перестроила то, что платит заявитель по MPRP, и тем же актом забрала себе лицензирование агентов, которые эту программу продают. Административный сбор €60 000 стал поэтапным, взнос €37 000 сделали одинаковым для покупки и аренды, часть иждивенцев перестала его платить вовсе, а агенты перешли на лицензию самого агентства стоимостью €5 000 в год.",
      pl: "Malta przebudowała to, co płaci wnioskodawca MPRP, i tym samym aktem przejęła licencjonowanie agentów, którzy program sprzedają. Opłata administracyjna €60 000 stała się płatnością etapową, wkład €37 000 ujednolicono dla zakupu i najmu, część osób zależnych przestała go płacić w ogóle, a agenci przeszli na licencję samej Agencji za €5 000 rocznie.",
    },
    instrument: {
      en: "L.N. 146 of 2025, amending regs. 3 to 9, 11, 15 and 25 of S.L. 217.26 and inserting regs. 6A, 6B, 6C and 8A",
      ru: "L.N. 146 от 2025 года, изменяющий рег. 3–9, 11, 15 и 25 S.L. 217.26 и вводящий рег. 6A, 6B, 6C и 8A",
      pl: "L.N. 146 z 2025, zmieniający reg. 3–9, 11, 15 i 25 S.L. 217.26 oraz wprowadzający reg. 6A, 6B, 6C i 8A",
    },
    moved: {
      en: "The Malta cost breakdown on this site — roughly €126,000 above the price of the property. Re-read 1 September 2026 and unchanged.",
      ru: "Разбор стоимости по Мальте на этом сайте — около €126 000 сверх цены объекта. Перечитано 1 сентября 2026 года, без изменений.",
      pl: "Rozbicie kosztów Malty na tej stronie — około €126 000 ponad cenę nieruchomości. Odczytano ponownie 1 września 2026 i bez zmian.",
    },
    section: "mt",
  },
  {
    effective: "2025-04-29",
    country: "mt",
    what: {
      en: "The Court of Justice held that Malta's citizenship-by-investment scheme was contrary to EU law. Naturalisation in exchange for payment ended; what took its place three months later is the row above it.",
      ru: "Суд ЕС признал мальтийскую схему гражданства за инвестиции противоречащей праву Союза. Натурализация в обмен на платёж прекратилась; то, что пришло ей на смену через три месяца, — в строке выше.",
      pl: "Trybunał Sprawiedliwości orzekł, że maltański program obywatelstwa za inwestycje jest sprzeczny z prawem UE. Naturalizacja w zamian za płatność się skończyła; to, co zajęło jej miejsce trzy miesiące później, jest w wierszu powyżej.",
    },
    instrument: {
      en: "Court of Justice of the European Union, Case C-181/23, Commission v Malta, judgment of 29 April 2025",
      ru: "Суд Европейского союза, дело C-181/23, Комиссия против Мальты, решение от 29 апреля 2025 года",
      pl: "Trybunał Sprawiedliwości Unii Europejskiej, sprawa C-181/23, Komisja przeciwko Malcie, wyrok z 29 kwietnia 2025",
    },
    moved: {
      en: "The “Malta — citizenship by investment” row, withdrawn.",
      ru: "Строка «Мальта — гражданство за инвестиции», отозвана.",
      pl: "Wiersz „Malta — obywatelstwo za inwestycje”, wycofany.",
    },
    section: "citizenship",
  },
  {
    effective: "2025-03-11",
    country: "pt",
    what: {
      en: "The Portuguese consular fee for a national visa was set at €110.",
      ru: "Консульская пошлина Португалии за национальную визу установлена в 110 евро.",
      pl: "Portugalska opłata konsularna za wizę krajową została ustalona na 110 euro.",
    },
    instrument: {
      en: "Portaria 91/2025/1 of 10 March, amending the consular emoluments table, in force 11 March 2025",
      ru: "Portaria 91/2025/1 от 10 марта, изменяющий таблицу консульских сборов, действует с 11 марта 2025 года",
      pl: "Portaria 91/2025/1 z 10 marca, zmieniająca tabelę opłat konsularnych, obowiązuje od 11 marca 2025",
    },
    section: "pt",
  },
  {
    effective: "2025-01-01",
    country: "mt",
    what: {
      en: "Malta reformed the MPRP property thresholds and abolished the discount for the south of the island and for Gozo: €375,000 to buy anywhere, or €14,000 a year to rent. The €300,000 figure a good part of the market still quotes was the old regional threshold, and there is no regional threshold any more.",
      ru: "Мальта пересмотрела пороги по недвижимости в MPRP и отменила скидку для юга острова и Гозо: €375 000 на покупку где угодно либо €14 000 в год на аренду. Цифра €300 000, которую до сих пор повторяет изрядная часть рынка, — это прежний региональный порог, а региональных порогов больше нет.",
      pl: "Malta zreformowała progi nieruchomościowe w MPRP i zniosła zniżkę dla południa wyspy i Gozo: €375 000 na zakup gdziekolwiek albo €14 000 rocznie na najem. Liczba €300 000, którą wciąż powtarza spora część rynku, to dawny próg regionalny, a progów regionalnych już nie ma.",
    },
    instrument: {
      en: "L.N. 310 of 2024, amending S.L. 217.26, in force 1 January 2025",
      ru: "L.N. 310 от 2024 года, изменяющий S.L. 217.26, действует с 1 января 2025 года",
      pl: "L.N. 310 z 2024, zmieniający S.L. 217.26, obowiązuje od 1 stycznia 2025",
    },
    moved: {
      en: "The “€300,000 threshold” row on this site, corrected. Re-read 1 September 2026 and unchanged.",
      ru: "Строка «Порог €300 000» на этом сайте, исправлена. Перечитано 1 сентября 2026 года, без изменений.",
      pl: "Wiersz „Próg €300 000” na tej stronie, poprawiony. Odczytano ponownie 1 września 2026 i bez zmian.",
    },
    section: "mt",
  },
  {
    effective: "2024-12-23",
    country: "pt",
    what: {
      en: "Portugal replaced the non-habitual resident regime with IFICI: a 20% rate on employment and self-employment income from a listed set of occupations, for ten years. Pensions are outside it and are taxed at 35%, which matters directly to anyone whose D7 income is a pension.",
      ru: "Португалия заменила режим non-habitual resident на IFICI: ставка 20% на трудовой и предпринимательский доход из закрытого перечня занятий, на десять лет. Пенсии вне режима и облагаются по 35% — что напрямую касается всех, чей доход по D7 и есть пенсия.",
      pl: "Portugalia zastąpiła reżim non-habitual resident przez IFICI: stawka 20% od dochodu z pracy i samozatrudnienia w zamkniętym katalogu zawodów, przez dziesięć lat. Emerytury są poza reżimem i opodatkowane 35%, co dotyczy każdego, czyim dochodem na D7 jest emerytura.",
    },
    instrument: {
      en: "Art. 58-A of the Estatuto dos Benefícios Fiscais, regulated by Portaria 352/2024/1 of 23 December; registration by 15 January of the year after residence begins",
      ru: "Ст. 58-A Estatuto dos Benefícios Fiscais, порядок — Portaria 352/2024/1 от 23 декабря; регистрация до 15 января года, следующего за годом получения резидентства",
      pl: "Art. 58-A Estatuto dos Benefícios Fiscais, tryb — Portaria 352/2024/1 z 23 grudnia; rejestracja do 15 stycznia roku po uzyskaniu rezydencji",
    },
    section: "pt",
  },
  {
    effective: "2024-09-17",
    country: "gr",
    what: {
      en: "Greece set the income a financially independent person must prove for the type Ι.8 permit at €3,500 a month, with 20% more for a spouse and 15% for each child. The statute itself, article 163 §8, states no figure at all.",
      ru: "Греция установила доход, который должно подтвердить финансово независимое лицо для разрешения типа Ι.8, в 3 500 евро в месяц, плюс 20% на супруга и 15% на каждого ребёнка. Сам закон, статья 163 §8, суммы не называет вовсе.",
      pl: "Grecja ustaliła dochód, jaki musi wykazać osoba niezależna finansowo dla zezwolenia typu Ι.8, na 3 500 euro miesięcznie, plus 20% na małżonka i 15% na każde dziecko. Sama ustawa, art. 163 §8, nie podaje żadnej kwoty.",
    },
    instrument: {
      en: "KYA 225679/2024, art. 1 §1(ι) — ΦΕΚ Β΄ 5223 of 17.09.2024",
      ru: "KYA 225679/2024, ст. 1 §1(ι) — ΦΕΚ Β΄ 5223 от 17.09.2024",
      pl: "KYA 225679/2024, art. 1 §1(ι) — ΦΕΚ Β΄ 5223 z 17.09.2024",
    },
    moved: {
      en: "€3,500, and the decision number with it. No competing page we checked cites the instrument for this figure at all.",
      ru: "3 500 евро — и номер решения вместе с ними. Ни одна проверенная нами конкурирующая страница акт под эту цифру не приводит вообще.",
      pl: "3 500 euro, a wraz z nimi numer decyzji. Żadna sprawdzona przez nas konkurencyjna strona nie przywołuje aktu dla tej kwoty.",
    },
    section: "gr",
  },
  {
    effective: "2024-09-02",
    country: "ae",
    what: {
      en: "The UAE created the Blue Residence, a ten-year permit for contributors to environmental protection, by inserting article 77 bis into the executive regulation. Its own annex is referenced by that article and is not published on the government portal.",
      ru: "ОАЭ создали Blue Residence — десятилетнее разрешение для тех, кто вносит вклад в охрану окружающей среды, — включив в исполнительный регламент статью 77-бис. Собственное приложение к ней этой статьёй упомянуто, но на правительственном портале не опубликовано.",
      pl: "ZEA utworzyły Blue Residence, dziesięcioletnie zezwolenie dla osób wnoszących wkład w ochronę środowiska, wprowadzając do rozporządzenia wykonawczego art. 77 bis. Jego własny załącznik jest przez ten artykuł przywołany i nie został opublikowany na portalu rządowym.",
    },
    instrument: {
      en: "Cabinet Resolution 95/2024, amending Cabinet Resolution 65/2022",
      ru: "Постановление Кабинета министров 95/2024, изменяющее Постановление 65/2022",
      pl: "Uchwała Rady Ministrów 95/2024, zmieniająca uchwałę 65/2022",
    },
    moved: {
      en: "Nothing of ours, but it is why we can say the amendment log on the UAE legislation portal is incomplete: the portal's entry for this resolution shows only its border-post change and omits article 77 bis, which is visible in the resolution's own text.",
      ru: "Наших цифр — ничего, но именно поэтому мы можем утверждать, что журнал поправок на портале законодательства ОАЭ неполон: запись портала об этом постановлении показывает только изменение по пунктам пропуска и не показывает статью 77-бис, видную в тексте самого постановления.",
      pl: "Nic z naszych liczb, ale właśnie dlatego możemy stwierdzić, że rejestr zmian na portalu legislacyjnym ZEA jest niepełny: wpis portalu o tej uchwale pokazuje wyłącznie zmianę przejść granicznych i pomija art. 77 bis, widoczny w tekście samej uchwały.",
    },
    section: "ae",
  },
  {
    effective: "2024-09-01",
    country: "gr",
    what: {
      en: "Greece replaced one golden visa threshold with four. €800,000 across Attica, the Thessaloniki regional unit, Mykonos, Thira and every island above 3,100 inhabitants; €400,000 elsewhere; and €250,000 twice, for a change of use to residential and for a listed building to be restored.",
      ru: "Греция заменила один порог золотой визы четырьмя. 800 000 евро — вся Аттика, номовая единица Салоники, Миконос, Тира и каждый остров свыше 3 100 жителей; 400 000 — остальная территория; и дважды по 250 000 — за перевод в жильё и за здание-памятник под реставрацию.",
      pl: "Grecja zastąpiła jeden próg złotej wizy czterema. 800 000 euro w całej Attyce, jednostce regionalnej Saloniki, na Mykonos, Thirze i każdej wyspie powyżej 3 100 mieszkańców; 400 000 w pozostałej części; i dwa razy po 250 000, za zmianę przeznaczenia na mieszkalne i za budynek zabytkowy do renowacji.",
    },
    instrument: {
      en: "Art. 100 §2 of Law 5038/2023, as amended by art. 64 of Law 5100/2024",
      ru: "Ст. 100 §2 Закона 5038/2023 в редакции ст. 64 Закона 5100/2024",
      pl: "Art. 100 §2 ustawy 5038/2023 w brzmieniu art. 64 ustawy 5100/2024",
    },
    moved: {
      en: "All four thresholds, and one thing the market prints as a rule of the programme and is not: the 120 m² minimum applies to the first two points and to neither €250,000 route.",
      ru: "Все четыре порога — и одно, что рынок печатает как правило программы, а правилом оно не является: минимум 120 м² относится к первым двум пунктам и ни к одному из вариантов по 250 000.",
      pl: "Wszystkie cztery progi i jedna rzecz, którą rynek drukuje jako regułę programu, a nią nie jest: minimum 120 m² dotyczy dwóch pierwszych punktów i żadnej ze ścieżek po 250 000.",
    },
    section: "gr",
  },
  {
    effective: "2023-06-01",
    country: "ae",
    what: {
      en: "The UAE brought a natural person's business within corporate tax above AED 1,000,000 of annual turnover — and put three sources outside it regardless of amount: wage, personal investment income and real estate investment income. The test for the third is whether the activity requires a licence, not how much it earns.",
      ru: "ОАЭ ввели бизнес физического лица в корпоративный налог свыше 1 000 000 дирхамов годового оборота — и вывели за его пределы три источника независимо от суммы: заработную плату, доход от личных инвестиций и доход от инвестиций в недвижимость. Тест для третьего — требует ли деятельность лицензии, а не сколько она приносит.",
      pl: "ZEA objęły działalność osoby fizycznej podatkiem od osób prawnych powyżej 1 000 000 dirhamów rocznego obrotu — i wyłączyły z niego trzy źródła niezależnie od kwoty: wynagrodzenie, dochód z inwestycji osobistych i dochód z inwestycji w nieruchomości. Testem dla trzeciego jest to, czy działalność wymaga licencji, a nie ile przynosi.",
    },
    instrument: {
      en: "Cabinet Decision 49/2023, art. 2, in force 1 June 2023",
      ru: "Решение Кабинета министров 49/2023, ст. 2, действует с 1 июня 2023 года",
      pl: "Uchwała Rady Ministrów 49/2023, art. 2, obowiązuje od 1 czerwca 2023",
    },
    section: "ae",
  },
  {
    effective: "2023-03-01",
    country: "ae",
    what: {
      en: "The UAE acquired a statutory test for the tax residency of a natural person for the first time: the centre-of-interests test, 183 days, or 90 days combined with a residence permit and either a permanent home or employment or business in the country. Property ownership appears in none of them.",
      ru: "У ОАЭ впервые появился законодательный тест налогового резидентства физического лица: центр интересов, 183 дня либо 90 дней вместе с разрешением на пребывание и либо постоянным жильём, либо работой или бизнесом в стране. Владения недвижимостью нет ни в одном из них.",
      pl: "ZEA po raz pierwszy uzyskały ustawowy test rezydencji podatkowej osoby fizycznej: test ośrodka interesów, 183 dni albo 90 dni wraz z zezwoleniem na pobyt i albo stałym miejscem zamieszkania, albo pracą lub działalnością w kraju. Własność nieruchomości nie występuje w żadnym z nich.",
    },
    instrument: {
      en: "Cabinet Decision 85/2022, art. 4, and Ministerial Decision 27/2023, both in force 1 March 2023",
      ru: "Решение Кабинета министров 85/2022, ст. 4, и Министерское решение 27/2023, оба действуют с 1 марта 2023 года",
      pl: "Uchwała Rady Ministrów 85/2022, art. 4, i decyzja ministerialna 27/2023, obie obowiązują od 1 marca 2023",
    },
    section: "ae",
  },
  {
    effective: "2022-04-01",
    country: "gr",
    what: {
      en: "Greece released renewals and kept new applications suspended for citizens of Russia and Belarus. A month earlier both issuance and renewal had been suspended for Russian citizens. It is not an EU sanction: the underlying instrument is a Commission recommendation, which binds nobody, and no law, ministerial decision or gazette reference for the measure has ever been published.",
      ru: "Греция сняла приостановку с продлений и сохранила её для новых заявлений граждан России и Беларуси. Месяцем ранее для граждан России были приостановлены и выдача, и продление. Это не санкция ЕС: в основании лежит рекомендация Еврокомиссии, которая никого не обязывает, а закона, министерского решения или номера газеты под эту меру не публиковалось никогда.",
      pl: "Grecja zwolniła przedłużenia i utrzymała zawieszenie nowych wniosków obywateli Rosji i Białorusi. Miesiąc wcześniej dla obywateli Rosji zawieszono zarówno wydawanie, jak i przedłużanie. To nie sankcja UE: u podstaw leży zalecenie Komisji, które nikogo nie wiąże, a ustawy, decyzji ministerialnej ani sygnatury dziennika dla tego środka nigdy nie opublikowano.",
    },
    instrument: null,
    moved: {
      en: "The ministry's own figures show the two tracks: 458 investor renewals to Russian citizens in March 2026, about 6% of all renewals, against no appearance at all in the top ten nationalities for initial issuance.",
      ru: "Собственные цифры министерства показывают две дорожки: 458 продлений инвесторских разрешений гражданам России на март 2026 года, около 6% всех продлений, — и полное отсутствие в первой десятке национальностей по первичной выдаче.",
      pl: "Własne dane ministerstwa pokazują dwa tory: 458 przedłużeń zezwoleń inwestorskich dla obywateli Rosji w marcu 2026, około 6% wszystkich przedłużeń, wobec całkowitego braku w pierwszej dziesiątce narodowości przy wydaniu pierwotnym.",
    },
    section: "gr",
  },
  {
    effective: "2016-01-01",
    country: "ae",
    what: {
      en: "The Poland–UAE double tax treaty began to apply a definition of an Emirati resident individual that requires UAE citizenship. A Pole on a golden visa is outside the treaty's personal scope. The 1993 original had the ordinary symmetrical formula and no citizenship element at all — the gate is ten years old, not thirty-three.",
      ru: "Договор Польша–ОАЭ начал применять определение резидента Эмиратов, требующее эмиратского гражданства. Поляк с золотой визой оказывается вне сферы действия договора. В оригинале 1993 года стояла обычная симметричная формула безо всякого гражданства — фильтру десять лет, а не тридцать три.",
      pl: "Umowa Polska–ZEA zaczęła stosować definicję rezydenta Emiratów wymagającą obywatelstwa ZEA. Polak ze złotą wizą znajduje się poza zakresem podmiotowym umowy. Oryginał z 1993 roku miał zwykłą symetryczną formułę i żadnego elementu obywatelstwa — bramka ma dziesięć lat, a nie trzydzieści trzy.",
    },
    instrument: {
      en: "Art. 2 of the Protocol of 11 December 2013, Dz.U. 2015 poz. 312, in force 1 May 2015, applying from 1 January 2016",
      ru: "Ст. 2 Протокола от 11 декабря 2013 года, Dz.U. 2015 poz. 312, в силе с 1 мая 2015 года, применяется с 1 января 2016 года",
      pl: "Art. 2 Protokołu z 11 grudnia 2013 roku, Dz.U. 2015 poz. 312, w mocy od 1 maja 2015, stosowany od 1 stycznia 2016",
    },
    moved: {
      en: "It is the whole frame of the Polish version of the Emirates guide — including the part where the conclusion drawn from it in the Polish market is overstated, and a tax authority interpretation says so.",
      ru: "Это рамка всей польской версии эмиратского гайда — включая ту часть, где вывод, который из этого делают на польском рынке, завышен, и интерпретация налогового органа говорит об этом.",
      pl: "To rama całej polskiej wersji poradnika o Emiratach — łącznie z tą częścią, w której wniosek wyciągany z tego na polskim rynku jest zawyżony, a interpretacja organu podatkowego mówi wprost co innego.",
    },
    section: "ae",
  },
];

for (let i = 1; i < RULE_CHANGES_RAW.length; i += 1) {
  const previous = RULE_CHANGES_RAW[i - 1];
  const current = RULE_CHANGES_RAW[i];
  if (previous && current && previous.effective < current.effective) {
    throw new Error(
      `src/lib/changeData.ts: rows must run newest first. ${current.effective} sits after ${previous.effective}.`,
    );
  }
}

export const RULE_CHANGES: RuleChange[] = tightenDeep(RULE_CHANGES_RAW);

/** Jurisdictions this site covers that have NO row above, and the reason.
 *  Rendered as a sentence under the log rather than left to inference: a reader
 *  who does not find Malta here is entitled to know whether nothing changed or
 *  nobody looked. It is the second. */
export const CHANGES_NOT_COVERED = ["cy"];
