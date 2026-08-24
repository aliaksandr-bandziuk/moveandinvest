import { blocks, type PortableBlock } from "./portable";
import type { Locale } from "./jurisdictions";

// The prose on each jurisdiction page, in three languages.
//
// EVERY CLAIM HERE COMES FROM docs/figures-verification-2026-08-23.md. Nothing
// was written from memory and nothing was rounded up for rhythm: the dossier
// has the statute, the article and the date behind every sentence below, and
// the same rule that governs the figures governs these paragraphs — a claim
// may not change here without that document changing in the same commit.
//
// WHAT THE BODY IS FOR, given the page already shows the numbers. The facts
// strip answers "how much and how long"; this answers "and what does that
// actually mean", which is the half the category never publishes. Four
// sections, in the same order on every page, because a reader comparing two
// jurisdictions should be able to compare the same paragraph:
//
//   1. who the route suits and who it does not
//   2. what stands behind the headline figure — conditions, exceptions, traps
//   3. what changed and when, with the date
//   4. what happens after the first permit
//
// Section 3 is the one that earns the site its position. Every competitor
// publishes a threshold; almost none says which month it stopped being the
// old one. Five of the six figures on this site were wrong before 23 August
// 2026 precisely because that kind of change goes unrecorded.
//
// Deliberately about 550 words each, not 1,500. Length is not the ranking
// signal it was, and padding a page whose substance is four figures and their
// conditions is how a site that publishes checked numbers starts reading like
// one that publishes filler.

type Bodies = Record<Locale, string>;

const PT: Bodies = {
  en: `
## Who this route suits

Portugal fits somebody whose money can sit still for five years and who wants
a European tax position rather than a European passport in a hurry. The
qualifying investment is a fund subscription, not a flat: property was removed
as a route in 2023, and the law now bars an investment aimed even indirectly
at real estate — a fund that holds buildings does not qualify.

It does not fit anybody in a hurry. The statute allows ninety days for a
decision and the reality is a year to three, and it does not fit somebody
whose plan was a fast passport: that plan stopped working in May 2026.

## What stands behind the figure

€500,000 buys units in a non-property collective investment fund with a
maturity of at least five years, at least 60% of it invested in companies
seated in Portugal. Four other routes exist and are less used: ten jobs
created (eight in a low-density area), €500,000 into scientific research
(€400,000 in low-density), €250,000 into cultural heritage (€220,000
low-density), or €500,000 into a company that creates five permanent jobs.

The government fees are not small and are per person. From 1 March 2026:
€842.80 to analyse the application, €8,418.90 to grant the permit, €4,210.30
to renew it — and a family member costs the same as the main applicant to
grant. Filing online takes 25% off.

## What changed, and when

Two changes matter and both are recent. Lei 56/2023 removed the real-estate
routes and the plain €1.5m capital transfer. Then Lei Orgânica 1/2026, in
force 19 May 2026, rewrote the nationality law: naturalisation now takes seven
years for EU and Portuguese-speaking nationals and ten for everybody else,
counted from the day the residence permit was issued rather than the day it
was applied for, with an exam on language and on culture and history. It is
not retroactive — applications pending on that date are decided under the old
five-year rule.

## After the first permit

The permit is renewable and requires very little physical presence, which is
what makes it a tax and mobility instrument rather than a move. IFICI is the
tax half: 20% flat on Portuguese employment and self-employment income from a
qualifying activity for ten years, most foreign income exempt, pensions and
income from blacklisted jurisdictions carved out. Registration closes on 15
January of the year after you become resident, and missing it costs the whole
regime.

Sources: art. 3 of Lei 23/2007 as amended by Lei 56/2023; the AIMA fee table
under Portaria 307/2023; art. 58-A of the EBF with Portaria 352/2024/1; Lei
Orgânica 1/2026.
`,
  ru: `
## Кому этот маршрут подходит

Португалия подходит тому, чьи деньги могут пролежать пять лет, и кому нужна
европейская налоговая позиция, а не европейский паспорт побыстрее.
Квалифицированная инвестиция — это подписка на фонд, а не квартира:
недвижимость убрали как маршрут в 2023 году, и закон теперь запрещает
вложения, направленные в неё даже косвенно, — фонд, держащий здания, не
подходит.

Не подходит тем, кто торопится. Закон даёт девяносто дней на решение, а
реальность — от года до трёх. И не подходит тем, у кого в плане был быстрый
паспорт: этот план перестал работать в мае 2026 года.

## Что стоит за цифрой

€500 000 — это паи в фонде коллективных инвестиций, не связанном с
недвижимостью, со сроком не менее пяти лет, у которого не меньше 60% вложено
в компании с местом нахождения в Португалии. Есть ещё четыре маршрута, и ими
пользуются реже: десять созданных рабочих мест (восемь в малонаселённом
районе), €500 000 в научные исследования (€400 000 в малонаселённых),
€250 000 в культурное наследие (€220 000), либо €500 000 в компанию с пятью
постоянными рабочими местами.

Государственные пошлины немаленькие и считаются на человека. С 1 марта 2026
года: €842,80 за рассмотрение, €8 418,90 за выдачу, €4 210,30 за продление —
и член семьи стоит столько же, сколько основной заявитель. Подача онлайн
дешевле на 25%.

## Что изменилось и когда

Важны два изменения, и оба недавние. Lei 56/2023 убрала маршруты через
недвижимость и обычный перевод капитала на €1,5 млн. Затем Lei Orgânica
1/2026, в силе с 19 мая 2026 года, переписала закон о гражданстве:
натурализация теперь занимает семь лет для граждан ЕС и португалоязычных
стран и десять для всех остальных, причём срок считается со дня выдачи вида
на жительство, а не со дня подачи заявления, плюс экзамен по языку и по
культуре и истории. Обратной силы нет: дела, поданные до этой даты, решаются
по прежнему пятилетнему правилу.

## Что после первого пермита

Разрешение продлевается и почти не требует физического присутствия — именно
поэтому это инструмент налогов и мобильности, а не переезда. Налоговая
половина — IFICI: 20% на португальский доход от найма и самозанятости по
квалифицированной деятельности в течение десяти лет, большая часть
зарубежного дохода освобождена, пенсии и доход из «чёрных» юрисдикций
исключены. Регистрация закрывается 15 января года, следующего за годом
получения резидентства, и пропуск этой даты стоит всего режима.

Источники: ст. 3 Lei 23/2007 в редакции Lei 56/2023; таблица пошлин AIMA по
Portaria 307/2023; ст. 58-A EBF с Portaria 352/2024/1; Lei Orgânica 1/2026.
`,
  pl: `
## Dla kogo ta ścieżka

Portugalia pasuje komuś, czyje pieniądze mogą leżeć pięć lat i kto chce
europejskiej pozycji podatkowej, a nie europejskiego paszportu na już.
Kwalifikowana inwestycja to subskrypcja funduszu, nie mieszkanie:
nieruchomości wykreślono jako ścieżkę w 2023 roku, a ustawa zakazuje dziś
inwestycji nakierowanych na nie choćby pośrednio — fundusz trzymający budynki
nie kwalifikuje się.

Nie pasuje tym, którzy się spieszą. Ustawa daje dziewięćdziesiąt dni na
decyzję, a rzeczywistość to rok do trzech. I nie pasuje tym, których planem
był szybki paszport: ten plan przestał działać w maju 2026 roku.

## Co stoi za liczbą

€500 000 to jednostki funduszu inwestycyjnego niezwiązanego z
nieruchomościami, o terminie co najmniej pięciu lat, z co najmniej 60%
ulokowanymi w spółkach z siedzibą w Portugalii. Istnieją jeszcze cztery
ścieżki, rzadziej używane: dziesięć utworzonych miejsc pracy (osiem na
obszarze o niskiej gęstości), €500 000 na badania naukowe (€400 000 na
obszarach o niskiej gęstości), €250 000 na dziedzictwo kulturowe (€220 000)
albo €500 000 w spółkę tworzącą pięć stałych etatów.

Opłaty urzędowe nie są małe i liczone są od osoby. Od 1 marca 2026: €842,80 za
rozpatrzenie, €8 418,90 za wydanie, €4 210,30 za odnowienie — a członek
rodziny kosztuje tyle samo co główny wnioskodawca. Złożenie online jest tańsze
o 25%.

## Co się zmieniło i kiedy

Liczą się dwie zmiany i obie są świeże. Lei 56/2023 usunęła ścieżki przez
nieruchomości i zwykły transfer kapitału €1,5 mln. Następnie Lei Orgânica
1/2026, obowiązująca od 19 maja 2026, przepisała ustawę o obywatelstwie:
naturalizacja trwa teraz siedem lat dla obywateli UE i krajów
portugalskojęzycznych oraz dziesięć dla pozostałych, liczone od dnia wydania
zezwolenia, a nie od dnia złożenia wniosku, plus egzamin z języka oraz z
kultury i historii. Nie działa wstecz: wnioski w toku w tym dniu rozpatruje
się według dawnej zasady pięciu lat.

## Po pierwszym zezwoleniu

Zezwolenie się odnawia i prawie nie wymaga fizycznej obecności — dlatego jest
narzędziem podatkowym i mobilnościowym, a nie przeprowadzką. Podatkowa połowa
to IFICI: 20% od portugalskiego dochodu z pracy i samozatrudnienia w
kwalifikowanej działalności przez dziesięć lat, większość dochodu zagranicznego
zwolniona, emerytury i dochód z jurysdykcji z czarnej listy wyłączone.
Rejestracja zamyka się 15 stycznia roku następującego po uzyskaniu rezydencji,
a jej przegapienie kosztuje cały reżim.

Źródła: art. 3 Lei 23/2007 w brzmieniu Lei 56/2023; tabela opłat AIMA wg
Portaria 307/2023; art. 58-A EBF z Portaria 352/2024/1; Lei Orgânica 1/2026.
`,
};

const GR: Bodies = {
  en: `
## Who this route suits

Greece is the lowest property-based entry in this comparison and the only one
where filing itself gives you something: the receipt issued on submission
confers lawful residence and the rights of the permit while the application is
decided. For somebody who needs to be legally in an EU country soon, that is
worth more than a faster card.

It suits a buyer, not an investor looking for a return: the property may not
be let short-term, and it must be a single property of at least 120 square
metres of main space.

## What stands behind the figure

The threshold is not one number. Since 1 September 2024 it is €800,000 across
the whole of Attica, the regional unit of Thessaloniki, Mykonos, Santorini and
every island with more than 3,100 inhabitants; €400,000 everywhere else; and
€250,000 only as an exception — converting a building's main spaces to
residential, converting an industrial building idle for five years, or fully
restoring a listed building, with the work finished before the application is
filed.

Short-term letting is prohibited outright. The fine is €50,000, and €150,000
where the property is used as a business seat or transferred in breach, with
the permit revoked or not renewed on top.

## What changed, and when

Law 5100/2024 replaced a flat €250,000 with the three tiers above from 1
September 2024, with a transition for contracts completed by the end of that
year. The old figure is still printed across most of this category, and it is
the single most common error about Greece.

The other thing worth knowing changed nothing and is widely misunderstood: the
property permit does not satisfy the €500,000 investment requirement of the
non-dom regime. That waiver applies only to an investment-activity permit
under a different law.

## After the first permit

The card takes months — the backlog stood at 13,499 pending files in November
2025, most of them in Attica — but the receipt covers you meanwhile.
Naturalisation takes seven years of actual lawful residence plus a language,
history and civics exam. The investor permit is a qualifying title for that
clock, but it carries no minimum stay, so holding it without living in Greece
accrues nothing.

The tax option is separate: €100,000 a year flat on foreign income under art.
5A, plus €20,000 per family member, capped at fifteen years and requiring its
own €500,000 investment within three years.

Sources: art. 100 of Law 5038/2023 as amended by art. 64 of Law 5100/2024, and
KYA 214926/2025; art. 5A of Law 4172/2013; the AADE transfer-tax schedule.
`,
  ru: `
## Кому этот маршрут подходит

У Греции самый низкий в этом сравнении порог через недвижимость и
единственный маршрут, где сама подача уже что-то даёт: расписка, выдаваемая
при подаче, даёт законное пребывание и права по разрешению, пока заявление
рассматривается. Тому, кому нужно скоро оказаться в стране ЕС легально, это
дороже, чем быстрая карта.

Подходит покупателю, а не инвестору в доходность: объект нельзя сдавать
посуточно, и он должен быть один и не меньше 120 квадратных метров основных
помещений.

## Что стоит за цифрой

Порог не единая цифра. С 1 сентября 2024 года это €800 000 по всей Аттике, в
номе Салоники, на Миконосе, Санторини и на каждом острове с населением больше
3 100 человек; €400 000 в остальной стране; и €250 000 только как исключение —
перевод основных помещений здания в жилые, реконструкция промышленного здания,
простаивавшего пять лет, или полная реставрация здания-памятника, причём
работы должны быть завершены до подачи заявления.

Краткосрочная сдача запрещена прямо. Штраф €50 000, а при использовании
объекта под офис или передаче в нарушение — €150 000, плюс отзыв разрешения
или отказ в продлении.

## Что изменилось и когда

Закон 5100/2024 заменил единые €250 000 тремя уровнями выше с 1 сентября 2024
года, с переходным периодом для договоров, завершённых до конца того года.
Старая цифра до сих пор напечатана почти по всей нише, и это самая частая
ошибка про Грецию.

Второе, что стоит знать, не менялось и повсеместно понимается неправильно:
разрешение через недвижимость не засчитывает инвестицию €500 000, которую
требует режим non-dom. Это освобождение работает только для разрешения на
инвестиционную деятельность по другому закону.

## Что после первого пермита

Карта занимает месяцы — на ноябрь 2025 года нерассмотренных дел было 13 499,
большая часть в Аттике, — но расписка всё это время закрывает вопрос.
Натурализация требует семи лет фактического законного проживания плюс экзамен
по языку, истории и обществознанию. Инвесторское разрешение засчитывается как
подходящий титул, но минимального пребывания не требует — значит, владеть им,
не живя в Греции, значит не копить ничего.

Налоговый вариант отдельный: €100 000 в год на зарубежный доход по ст. 5A,
плюс €20 000 на члена семьи, максимум пятнадцать лет, и он требует
собственной инвестиции €500 000 в течение трёх лет.

Источники: ст. 100 Закона 5038/2023 в редакции ст. 64 Закона 5100/2024 и KYA
214926/2025; ст. 5A Закона 4172/2013; тарифы AADE по налогу на переход права.
`,
  pl: `
## Dla kogo ta ścieżka

Grecja ma najniższy w tym porównaniu próg oparty na nieruchomości i jako
jedyna daje coś już przy złożeniu wniosku: wydawane wtedy poświadczenie
zapewnia legalny pobyt i prawa z zezwolenia na czas rozpatrywania. Dla kogoś,
kto musi wkrótce legalnie znaleźć się w kraju UE, jest to więcej warte niż
szybsza karta.

Pasuje kupującemu, nie inwestorowi liczącemu na zwrot: nieruchomości nie wolno
wynajmować krótkoterminowo i musi to być jeden lokal o co najmniej 120 metrach
kwadratowych powierzchni głównej.

## Co stoi za liczbą

Próg nie jest jedną liczbą. Od 1 września 2024 to €800 000 w całej Attyce, w
jednostce regionalnej Saloniki, na Mykonos, Santorini i na każdej wyspie
powyżej 3 100 mieszkańców; €400 000 w pozostałej części kraju; i €250 000
wyłącznie jako wyjątek — zmiana przeznaczenia pomieszczeń głównych na
mieszkalne, przebudowa budynku przemysłowego nieużywanego od pięciu lat albo
pełna renowacja budynku zabytkowego, przy czym prace muszą być zakończone
przed złożeniem wniosku.

Najem krótkoterminowy jest wprost zakazany. Kara wynosi €50 000, a €150 000
gdy nieruchomość służy jako siedziba firmy lub zostaje zbyta z naruszeniem —
do tego cofnięcie zezwolenia albo odmowa odnowienia.

## Co się zmieniło i kiedy

Ustawa 5100/2024 zastąpiła jednolite €250 000 trzema powyższymi progami od 1
września 2024, z okresem przejściowym dla umów zamkniętych do końca tego roku.
Stara liczba wciąż widnieje w niemal całej branży i jest najczęstszym błędem o
Grecji.

Druga rzecz warta wiedzy nie zmieniła się i bywa powszechnie mylona:
zezwolenie przez nieruchomość nie zalicza inwestycji €500 000 wymaganej przez
reżim non-dom. To zwolnienie dotyczy wyłącznie zezwolenia na działalność
inwestycyjną z innej ustawy.

## Po pierwszym zezwoleniu

Karta zajmuje miesiące — w listopadzie 2025 czekało 13 499 spraw, większość w
Attyce — ale poświadczenie zabezpiecza cały ten czas. Naturalizacja wymaga
siedmiu lat faktycznego legalnego pobytu plus egzaminu z języka, historii i
wiedzy o społeczeństwie. Zezwolenie inwestorskie jest tytułem kwalifikującym,
ale nie wymaga minimalnego pobytu — posiadanie go bez mieszkania w Grecji nie
nalicza więc niczego.

Opcja podatkowa jest osobna: €100 000 rocznie od dochodu zagranicznego wg art.
5A, plus €20 000 na członka rodziny, maksymalnie piętnaście lat, i wymaga
własnej inwestycji €500 000 w ciągu trzech lat.

Źródła: art. 100 ustawy 5038/2023 w brzmieniu art. 64 ustawy 5100/2024 oraz
KYA 214926/2025; art. 5A ustawy 4172/2013; taryfa AADE podatku od przeniesienia.
`,
};


const MT: Bodies = {
  en: `
## Who this route suits

Malta is the shortest naturalisation period in this comparison — roughly five
years — and since Portugal moved to seven and ten in May 2026 that is no
longer a close call. It is also the only English-speaking EU member here,
which matters more than it sounds when the paperwork, the schools and the
lawyers are all in one language you already read.

It does not suit anybody comparing headline thresholds. The property is the
smallest part of the bill.

## What stands behind the figure

€375,000 buys the property. On top of it, none of it optional: a €37,000
government contribution, a €60,000 administrative fee for the main applicant,
a €2,000 donation to a registered NGO, 5% stamp duty on the higher of price or
market value, and €500 per residence card. A dependant adds €7,500 — a spouse,
minor children and differently-abled adult children are exempt from it.

Leasing instead of buying is €14,000 a year and no stamp duty, but the
contribution, the administrative fee and the donation are identical, and the
lease has to run five years.

You must also show capital of €500,000 including €150,000 in financial assets,
or €650,000 including €75,000, and hold the property and the assets for five
years from the appointed day.

## What changed, and when

Twice, recently, and both times upward. L.N. 310 of 2024 applied from 1
January 2025; L.N. 146 of 2025 followed on 22 July 2025. Between them the
purchase floor went to €375,000 with the old discount for the south of Malta
and Gozo abolished outright, the contribution became a flat €37,000 for buying
and leasing alike, and the per-dependant contribution was replaced by the
€7,500 fee.

Separately: citizenship by investment is closed. After the Court of Justice of
the European Union ruled against it in April 2025, the scheme was replaced by
naturalisation for merit — science, sport, culture, philanthropy — where
payment alone does not qualify.

## After the first permit

Residency Malta publishes no processing time at all; the regulations allow
eight months after the letter of approval in principle simply to complete the
purchase and the payments, so six to twelve months end to end is the honest
range.

The permit is immigration status and nothing else — it does not make you tax
resident. If you separately become one, Malta taxes a non-domiciled resident
on the remittance basis: foreign income taxed only when brought in, foreign
capital gains never taxed even when brought in, with a €5,000 minimum tax
where unremitted foreign income is €35,000 or more.

Sources: S.L. 217.26 under the Immigration Act as amended by L.N. 310 of 2024
and L.N. 146 of 2025; the MTCA guidance on the remittance basis; CJEU C-181/23.
`,
  ru: `
## Кому этот маршрут подходит

У Мальты самый короткий в этом сравнении срок натурализации — около пяти лет,
— и с тех пор как в мае 2026 года Португалия ушла на семь и десять, это уже
не близкое сравнение. Это ещё и единственная англоязычная страна ЕС в наборе,
что весит больше, чем кажется, когда документы, школы и юристы оказываются на
одном языке, который вы уже читаете.

Не подходит тем, кто сравнивает пороги по заголовкам. Недвижимость здесь —
самая маленькая часть счёта.

## Что стоит за цифрой

€375 000 — это объект. Сверху, и ничего из этого не опционально:
государственный взнос €37 000, административный сбор €60 000 на основного
заявителя, пожертвование зарегистрированной НКО €2 000, гербовый сбор 5% от
большей из цены и рыночной стоимости и €500 за карту резидента. Иждивенец
добавляет €7 500 — супруг, несовершеннолетние дети и совершеннолетние дети с
инвалидностью от него освобождены.

Аренда вместо покупки — €14 000 в год и без гербового сбора, но взнос,
административный сбор и пожертвование те же самые, а договор должен идти пять
лет.

Ещё нужно показать активы: €500 000, из них €150 000 финансовых, либо
€650 000, из них €75 000, — и держать объект и активы пять лет с назначенного
дня.

## Что изменилось и когда

Дважды, недавно, и оба раза вверх. L.N. 310/2024 применяется с 1 января 2025
года, L.N. 146/2025 вышел следом 22 июля 2025 года. За эти два раза порог
покупки поднялся до €375 000, а прежняя скидка для юга Мальты и Гозо была
отменена полностью; взнос стал единым €37 000 и для покупки, и для аренды; а
взнос за иждивенца заменили сбором €7 500.

Отдельно: гражданство за инвестиции закрыто. После решения Суда ЕС против
него в апреле 2025 года схему заменили натурализацией за заслуги — наука,
спорт, культура, благотворительность, — где один платёж не квалифицирует.

## Что после первого пермита

Residency Malta не публикует срок вообще; регламент даёт восемь месяцев после
письма о предварительном одобрении просто на то, чтобы завершить покупку и
платежи, — так что от начала до конца честный диапазон это шесть-двенадцать
месяцев.

Разрешение — это иммиграционный статус и ничего больше: налоговым резидентом
оно не делает. Если вы им станете отдельно, Мальта облагает резидента без
домицилия по принципу remittance: зарубежный доход только при переводе в
страну, зарубежный прирост капитала не облагается даже при переводе, с
минимальным налогом €5 000, если непереведённый зарубежный доход от €35 000.

Источники: S.L. 217.26 к Immigration Act в редакции L.N. 310/2024 и L.N.
146/2025; разъяснения MTCA по remittance basis; решение Суда ЕС C-181/23.
`,
  pl: `
## Dla kogo ta ścieżka

Malta ma najkrótszy w tym porównaniu okres naturalizacji — około pięciu lat — a
odkąd w maju 2026 Portugalia przeszła na siedem i dziesięć, nie jest to już
bliskie porównanie. To także jedyny anglojęzyczny kraj UE w zestawieniu, co
waży więcej, niż brzmi, gdy dokumenty, szkoły i prawnicy są w jednym języku,
który już czytasz.

Nie pasuje tym, którzy porównują progi po nagłówkach. Nieruchomość jest tu
najmniejszą częścią rachunku.

## Co stoi za liczbą

€375 000 to nieruchomość. Do tego, i nic z tego nie jest opcjonalne: wkład
rządowy €37 000, opłata administracyjna €60 000 na głównego wnioskodawcę,
darowizna €2 000 na zarejestrowaną organizację, 5% opłaty skarbowej od wyższej
z ceny i wartości rynkowej oraz €500 za kartę pobytu. Osoba zależna dodaje
€7 500 — małżonek, małoletnie dzieci i dorosłe dzieci z niepełnosprawnością są
z niej zwolnione.

Najem zamiast zakupu to €14 000 rocznie i brak opłaty skarbowej, ale wkład,
opłata administracyjna i darowizna są identyczne, a umowa musi trwać pięć lat.

Trzeba też wykazać majątek: €500 000, w tym €150 000 w aktywach finansowych,
albo €650 000, w tym €75 000 — i utrzymać nieruchomość oraz aktywa przez pięć
lat od wyznaczonego dnia.

## Co się zmieniło i kiedy

Dwa razy, niedawno, i oba razy w górę. L.N. 310 z 2024 obowiązuje od 1 stycznia
2025, L.N. 146 z 2025 wszedł 22 lipca 2025. Przez te dwie zmiany próg zakupu
wzrósł do €375 000, a dawna zniżka dla południa Malty i Gozo została zniesiona
całkowicie; wkład stał się jednolity €37 000 zarówno przy zakupie, jak i
najmie; a wkład za osobę zależną zastąpiła opłata €7 500.

Osobno: obywatelstwo za inwestycje jest zamknięte. Po wyroku Trybunału
Sprawiedliwości UE z kwietnia 2025 schemat zastąpiono naturalizacją za zasługi
— nauka, sport, kultura, filantropia — gdzie sama płatność nie kwalifikuje.

## Po pierwszym zezwoleniu

Residency Malta w ogóle nie publikuje terminu; przepisy dają osiem miesięcy po
liście o wstępnej akceptacji na samo dokończenie zakupu i płatności — uczciwy
przedział od początku do końca to sześć–dwanaście miesięcy.

Zezwolenie to status imigracyjny i nic więcej: nie czyni rezydentem
podatkowym. Jeśli zostaniesz nim osobno, Malta opodatkowuje rezydenta bez
domicylu na zasadzie remittance: dochód zagraniczny tylko po sprowadzeniu,
zagraniczne zyski kapitałowe nigdy, nawet po sprowadzeniu, z podatkiem
minimalnym €5 000, gdy niesprowadzony dochód zagraniczny wynosi €35 000 lub
więcej.

Źródła: S.L. 217.26 do Immigration Act w brzmieniu L.N. 310 z 2024 i L.N. 146 z
2025; wytyczne MTCA o zasadzie remittance; wyrok TSUE C-181/23.
`,
};

const AE: Bodies = {
  en: `
## Who this route suits

The UAE is the fastest route here by a wide margin and the only one outside
the EU. The Land Department publishes seven to ten working days for the visa
itself, and title deed to Emirates ID realistically runs two to four weeks
rather than the months every European option takes.

It suits somebody whose priority is a tax position and speed. It does not suit
anybody who wants a European passport eventually: naturalisation in the UAE is
discretionary and by nomination, and owning property never triggers it.

## What stands behind the figure

AED 2,000,000, and it does not have to be one property — the immigration
authority accepts one or more units totalling the threshold. A mortgaged
property qualifies with a no-objection letter from the bank stating what has
been paid and what is outstanding. A jointly held share qualifies if the share
itself reaches the threshold.

Off-plan is not claimed here, and the omission is deliberate: no official page
supports it, and the property-owner visa page requires a completed building.

The figure is in dirhams, so it moves. At 4.288 to the euro on 23 August 2026
it is about €466,000 — the same threshold was €490,000 on this site until the
rate was rechecked, which is what a currency conversion does when nobody dates
it.

## What changed, and when

Less than anywhere else in this comparison, which is itself the point: the
threshold and the ten-year term have been stable while three of the four
European routes were rewritten. What did change is the tax landscape around
it — corporate tax at 9% from June 2023 and a 15% domestic minimum top-up for
large multinationals from January 2025 — and neither touches an individual's
salary or investment income.

## After the first permit

Ten years, renewable. There is still no personal income tax; u.ae states it
plainly. VAT is 5%, and the real transaction costs are the Land Department
transfer fee of 4% plus an agency commission of about 2% — both market
practice rather than figures we could confirm from a published tariff, and
flagged as such wherever they appear on this site.

Government fees for the visa itself come to AED 9,884.75: the medical, the
Emirates ID, the residency stamp, the Land Department charge and admin, plus
AED 5,774.50 for each dependant.

Sources: the Dubai Land Department's investor golden visa service; the GDRFA
and ICP golden residency pages; u.ae on taxation.
`,
  ru: `
## Кому этот маршрут подходит

ОАЭ — самый быстрый маршрут здесь с большим отрывом и единственный за
пределами ЕС. Земельный департамент публикует семь-десять рабочих дней на саму
визу, а от свидетельства о праве до Emirates ID реально проходит две-четыре
недели вместо месяцев, которых требует любой европейский вариант.

Подходит тому, у кого в приоритете налоговая позиция и скорость. Не подходит
тем, кто рассчитывает в перспективе на европейский паспорт: натурализация в
ОАЭ исключительная и по номинации, а владение недвижимостью её не запускает.

## Что стоит за цифрой

AED 2 000 000, и это не обязательно один объект — миграционное ведомство
принимает одну или несколько единиц общей стоимостью не ниже порога. Объект в
ипотеке подходит при письме банка об отсутствии возражений с указанием
выплаченной суммы и остатка. Доля в общей собственности подходит, если сама
доля дотягивает до порога.

Про строящуюся недвижимость здесь ничего не утверждается, и это сознательно:
ни одна официальная страница этого не подтверждает, а страница визы
собственника прямо требует завершённого строительства.

Цифра в дирхамах, поэтому она движется. По курсу 4,288 за евро на 23 августа
2026 года это примерно €466 000 — тот же порог на этом сайте был €490 000,
пока курс не пересчитали, и это ровно то, что делает с цифрой конвертация без
даты.

## Что изменилось и когда

Меньше, чем где-либо ещё в этом сравнении, и это само по себе довод: порог и
десятилетний срок стояли на месте, пока три из четырёх европейских маршрутов
переписывали. Менялся налоговый ландшафт вокруг — корпоративный налог 9% с
июня 2023 года и минимальный внутренний налог 15% для крупных международных
групп с января 2025-го, — и ни то, ни другое не касается зарплаты и
инвестиционного дохода физического лица.

## Что после первого пермита

Десять лет, продлевается. Налога на доходы физических лиц по-прежнему нет —
u.ae говорит это прямым текстом. НДС 5%, а реальные расходы по сделке — это
регистрационный сбор земельного департамента 4% и комиссия агента около 2%;
и то и другое рыночная практика, а не цифры, которые мы смогли подтвердить
опубликованным тарифом, и везде на сайте они помечены именно так.

Государственные сборы за саму визу составляют AED 9 884,75: медосмотр,
Emirates ID, резидентский штамп, сбор земельного департамента и
администрирование, плюс AED 5 774,50 за каждого иждивенца.

Источники: услуга инвесторской золотой визы Земельного департамента Дубая;
страницы золотого резидентства GDRFA и ICP; u.ae о налогообложении.
`,
  pl: `
## Dla kogo ta ścieżka

ZEA to najszybsza ścieżka w tym zestawieniu, z dużą przewagą, i jedyna poza
UE. Departament gruntów publikuje siedem–dziesięć dni roboczych na samą wizę, a
od aktu własności do Emirates ID mija realnie dwa–cztery tygodnie zamiast
miesięcy, których wymaga każda opcja europejska.

Pasuje komuś, kogo priorytetem jest pozycja podatkowa i szybkość. Nie pasuje
tym, którzy liczą kiedyś na europejski paszport: naturalizacja w ZEA jest
uznaniowa i następuje z nominacji, a posiadanie nieruchomości nigdy jej nie
uruchamia.

## Co stoi za liczbą

AED 2 000 000, i nie musi to być jedna nieruchomość — urząd przyjmuje jedną lub
kilka jednostek o łącznej wartości nie niższej niż próg. Nieruchomość z
hipoteką kwalifikuje się przy piśmie banku o braku zastrzeżeń, wskazującym
kwotę spłaconą i pozostałą. Udział we współwłasności kwalifikuje się, jeśli sam
udział sięga progu.

O nieruchomościach w budowie nic tu nie twierdzimy i jest to celowe: żadna
oficjalna strona tego nie potwierdza, a strona wizy dla właściciela wprost
wymaga ukończonego budynku.

Liczba jest w dirhamach, więc się porusza. Po kursie 4,288 za euro na 23
sierpnia 2026 to około €466 000 — ten sam próg na tej stronie wynosił €490 000,
zanim przeliczono kurs, i dokładnie to robi z liczbą przewalutowanie bez daty.

## Co się zmieniło i kiedy

Mniej niż gdziekolwiek indziej w tym porównaniu, co samo w sobie jest
argumentem: próg i dziesięcioletni okres stały w miejscu, gdy trzy z czterech
europejskich ścieżek przepisywano. Zmieniał się krajobraz podatkowy wokół —
podatek dochodowy od osób prawnych 9% od czerwca 2023 i minimalny podatek
krajowy 15% dla dużych grup międzynarodowych od stycznia 2025 — i żadne z nich
nie dotyka wynagrodzenia ani dochodu inwestycyjnego osoby fizycznej.

## Po pierwszym zezwoleniu

Dziesięć lat, odnawialne. Podatku dochodowego od osób fizycznych nadal nie ma —
u.ae mówi to wprost. VAT wynosi 5%, a realne koszty transakcji to opłata
rejestracyjna departamentu gruntów 4% i prowizja agencji około 2%; jedno i
drugie to praktyka rynkowa, a nie liczby, które udało się potwierdzić
opublikowaną taryfą, i wszędzie na tej stronie są tak oznaczone.

Opłaty urzędowe za samą wizę wynoszą AED 9 884,75: badanie lekarskie, Emirates
ID, stempel pobytowy, opłata departamentu gruntów i administracja, plus AED
5 774,50 za każdą osobę zależną.

Źródła: usługa inwestorskiej złotej wizy Departamentu Gruntów Dubaju; strony
złotego pobytu GDRFA i ICP; u.ae o opodatkowaniu.
`,
};

export const JURISDICTION_BODY: Record<string, Record<Locale, PortableBlock[]>> = {
  pt: {
    en: blocks(PT.en, "pten"),
    ru: blocks(PT.ru, "ptru"),
    pl: blocks(PT.pl, "ptpl"),
  },
  gr: {
    en: blocks(GR.en, "gren"),
    ru: blocks(GR.ru, "grru"),
    pl: blocks(GR.pl, "grpl"),
  },
  mt: {
    en: blocks(MT.en, "mten"),
    ru: blocks(MT.ru, "mtru"),
    pl: blocks(MT.pl, "mtpl"),
  },
  ae: {
    en: blocks(AE.en, "aeen"),
    ru: blocks(AE.ru, "aeru"),
    pl: blocks(AE.pl, "aepl"),
  },
};
