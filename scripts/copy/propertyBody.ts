import { blocks, type PortableBlock } from "./portable";
import type { Locale } from "./jurisdictions";

// The six sections of each property page, in three languages.
//
// EVERY CLAIM HERE COMES FROM docs/property-verification-2026-08-24.md. That
// dossier carries the statute, the article and the date behind every sentence
// below, and marks its own gaps: where it says NOT CONFIRMED, this file either
// says nothing or says that nobody publishes the answer. A claim may not change
// here without the dossier changing in the same commit.
//
// THE HARDEST DISCIPLINE IN THIS FILE IS THE ABSENCE OF DURATIONS. Every
// competitor publishes "the whole process takes 2–3 months". No Greek or
// Portuguese government body publishes any end-to-end figure at all, and the
// numbers in circulation are consultants' estimates repeated until they sound
// official. Where a duration is published — 35 days for a Maltese permit, 25
// minutes at a Dubai trustee office, 60 days for a Portuguese municipality to
// object — it is here with its source. Where it is not, this file says so.
// "Nobody publishes this" is a more useful sentence to a buyer than a
// confident invention, and it is the only sentence of the two that stays true.
//
// Section order is fixed by the schema and by the message catalogue; the keys
// below are the schema's field names, so the patcher writes them by name and a
// renamed field fails the typecheck rather than silently writing nothing.

type SectionKey =
  | "whoMayBuy"
  | "transactionCosts"
  | "steps"
  | "annualCosts"
  | "shortLet"
  | "residencyLink";

type Sections = Record<SectionKey, string>;

const SECTION_KEYS: SectionKey[] = [
  "whoMayBuy",
  "transactionCosts",
  "steps",
  "annualCosts",
  "shortLet",
  "residencyLink",
];

/** Converts one language's six sections to Portable Text, keyed deterministically
 *  so a re-run produces byte-identical documents. */
function sections(source: Sections, prefix: string): Record<SectionKey, PortableBlock[]> {
  const out = {} as Record<SectionKey, PortableBlock[]>;
  for (const key of SECTION_KEYS) {
    out[key] = blocks(source[key], `${prefix}${key}`);
  }
  return out;
}

// --- Greece ------------------------------------------------------------------

const GR: Record<Locale, Sections> = {
  en: {
    whoMayBuy: `
Greece places no general restriction on ownership by non-EU nationals. It
places a territorial one, and it catches people who have never heard of it.

Articles 24 to 26 of Law 1892/1990 make border zones off limits: any
transaction creating rights over property there in favour of a person whose
nationality or seat is outside the EU or EEA is prohibited. The zones are the
prefectures of the Dodecanese, Evros, Thesprotia, Kastoria, Kilkis, Lesbos,
Xanthi, Preveza, Rodopi, Samos, Florina and Chios, plus the islands of Thira
and Skyros and several former eparchies. Thira is Santorini — a mainstream
holiday-home market sitting inside a defence-driven restriction.

The ban is lifted case by case by a committee at the relevant Decentralized
Administration. It decides by majority, but the Ministry of Defence
representative's vote must be positive. The file includes a criminal record
extract no older than six months, a short CV in Greek, a passport copy, a
birth certificate and a topographic plan locating the property.

No statute, ministerial decision or administration page states a decision
deadline. There is no published processing time to plan against, and this is
the least predictable step a non-EU buyer faces in Greece.

A transaction completed without the permission is absolutely void, and the
parties and the notary carry criminal liability.
`,
    transactionCosts: `
Transfer tax is 3% of the taxable value and the buyer pays it. On top of that
sits a municipal surcharge of 3% — levied on the tax itself, not on the price
— so the real figure is 3.09%.

The first-home exemption exists but requires the buyer to live in Greece
permanently or to intend to settle within two years, so a non-resident foreign
buyer does not reach it.

VAT on new buildings is suspended until 31 December 2026. The developer
charges none, and the sale falls under transfer tax instead. In practice every
residential purchase in 2026 — new build included — is taxed at 3.09%.

The notary's fee is a statutory scale: €20 fixed plus a proportional fee of
0.80% on the first €120,000, 0.70% to €380,000 and 0.65% above it. Two Greek
legal publishers state the first band as 1% rather than 0.80%; the codified
text and the notaries' own copy of the gazette say 0.80%, and the conflict is
unresolved, so budget for the range.

A lawyer is not legally required at the deed. A lawyer is nonetheless the only
party who searches the title, which makes one a practical necessity rather
than a legal one. No statutory rate applies.

Registration at the Cadastre costs 5‰ of the value plus €23, under a fee
schedule that took effect on 13 January 2026. Guidance quoting 0.475% predates
it.

Agent commission is set by custom, not law: roughly 2% plus VAT, charged to
each side separately.

One rule that changes how the money moves: since 11 December 2023 the price
must be paid exclusively through banking channels. A deed recording cash is
void, cannot be registered and has no legal effect, and the fine is 10% of the
cash amount with a €10,000 floor. The prohibition covers preliminary contracts
as well.
`,
    steps: `
A Greek tax number comes first, and it is obtained remotely: the application
runs through myAADE, with identification by video call. A tax representative
is not compulsory. AADE publishes no processing time.

A Greek bank account is not a legal precondition, but the price has to move
through banking channels, and a Greek bank will want the tax number, proof of
address and evidence of the source of funds.

The preliminary contract is usually notarial, and the cash prohibition applies
to it too.

Title is checked at the cadastral office, or at the land registry where
cadastral registration is not complete. The encumbrance certificate produced
there is the same document the Ministry requires for a golden visa
application.

Every transfer needs an engineer's certificate under article 83 of Law
4495/2017 — a declaration that no unauthorised construction exists beyond what
the permit allows. It is valid for two months from signature, and notaries,
lawyers and engineers who omit it face imprisonment and fines of €30,000 to
€100,000. On a purchase that takes longer than two months to close, it is the
document that has to be renewed.

The transfer tax return is filed jointly by buyer and seller before the deed,
electronically, and the tax is payable within three working days of
assessment. The seller must also produce a municipal certificate that the
annual property duty is settled — a routine source of delay on the seller's
side.

No Greek authority publishes an end-to-end duration for any of this. The only
hard timing constraints are the two-month life of the engineer's certificate
and the three working days for the tax, and for a border-zone property, a
committee decision with no deadline at all.
`,
    annualCosts: `
The annual property tax is ENFIA, codified in Law 5219/2025. Liability
attaches to whoever holds the rights on 1 January, and the assessment arrives
electronically without any return being filed.

For buildings the tax is the built area multiplied by a basic rate and by
coefficients for zone price, age, floor and facades. The basic rate runs from
€2.00 per square metre in the lowest zone to €16.20 in the highest.

The separate supplementary tax on individuals no longer exists. It is now a
surcharge inside the main tax: where a person's total property value exceeds
€500,000, the main tax rises by 5%, 10%, 15% or 20% by band. The Ministry of
Finance's English-language page still describes the old structure and is out
of date on this point; the Property Tax Code governs.

From 2026 a 50% reduction applies to a natural person's main residence in
settlements of up to 1,500 inhabitants, where the property is worth no more
than €400,000. Mainland Attica is excluded. It is of little use to a
non-resident, who by definition has no main residence there.

Rental income for individuals runs on a scale introduced by Law 5246/2025: 15%
up to €12,000, 25% to €24,000, 35% to €36,000 and 45% above. The 25% band is
new. The tax year from which it applies is not stated in the source we could
reach, and it is worth confirming before modelling a yield.

The municipal duty is 0.25 to 0.35 per thousand of value, collected through
the electricity bill. A disconnected meter stops the collection but not the
liability, which accrues quietly and surfaces at sale — the seller has to
produce a clearance certificate for the notary.
`,
    shortLet: `
A short-term let in Greece means a furnished property let for less than 60
days with no service beyond bedding.

Every such property must be entered in the registry the tax authority keeps,
and the registry number must appear in a visible position on every platform
listing and in all advertising. A declaration is filed for each stay, by the
20th of the month following departure.

An individual letting one or two properties is taxed on it as income from
immovable property, on the scale above, and may not elect business taxation.
From three properties the activity becomes a business, with 13% VAT.

A climate resilience fee applies to every short-term let regardless of how it
is taxed: €2.00 per day from November to March, €8.00 from April to October.

Two registration freezes are in force. In Athens, first-time registration is
prohibited in the 1st, 2nd and 3rd municipal districts — introduced for 2025
and extended to 31 December 2026. In Thessaloniki the 1st municipal community
is frozen from 1 July to 31 December 2026.

The point that costs buyers the most: a registration does not pass with the
property. A property transferred inside a restricted area is removed from the
registry, and re-registration during the restriction is not permitted. Buying
a working short-let in a frozen district of central Athens does not buy its
number.

The penalty for breaching a freeze is 50% of the income from the letting, with
a €20,000 floor, doubling to the whole of the rents collected and a €40,000
floor on a repeat within the same tax year.

The often-quoted limits of two properties per taxpayer and 90 days a year are
not in force anywhere. The law empowers ministers to impose them in designated
areas; no such decision could be found.
`,
    residencyLink: `
A purchase can still lead to residency in Greece, which distinguishes it from
Portugal. The terms tightened sharply in 2024.

The thresholds are €800,000 in Attica, the regional unit of Thessaloniki,
Mykonos, Thira and islands with more than 3,100 inhabitants; €400,000
everywhere else; and €250,000 for converting a property from another use to
residential, or restoring a listed building. For the conversion route the
change of use must be completed before the application is submitted.

Both main thresholds carry a minimum area of 120 square metres of main spaces.
Storage and parking bought under the same contract count toward the investment
value but not toward the 120 square metres.

The investment must be made in a single property. Several properties may not
be added together to reach a threshold — they could be before 2024, and
guidance written earlier still says so.

Short-term letting of the qualifying property is prohibited outright, and the
sanction is both a €50,000 administrative fine and revocation of the permit.
Long-term letting is not prohibited; the ban is confined to sharing-economy
letting and to sub-letting.

Whether an off-plan property qualifies is genuinely unsettled. Article 100
does not address it, and the two conditions that bear on it — a measurable 120
square metres and full ownership with the price fully paid before the
application — point against it. This is a question for written confirmation
from the Ministry, not for a website.

The fee is €2,000 per applicant plus €16 for the card. No Greek authority
publishes a processing time for the permit.
`,
  },
  ru: {
    whoMayBuy: `
Общего запрета на владение недвижимостью для граждан стран вне ЕС в Греции
нет. Есть территориальный, и именно он подводит тех, кто о нём не слышал.

Статьи 24–26 Закона 1892/1990 закрывают приграничные зоны: любая сделка,
создающая права на недвижимость там в пользу лица с гражданством или местом
нахождения вне ЕС и ЕЭЗ, запрещена. К зонам отнесены номы Додеканес, Эврос,
Теспротия, Кастория, Килкис, Лесбос, Ксанти, Превеза, Родопи, Самос, Флорина и
Хиос, острова Тира и Скирос и несколько бывших епархий. Тира — это Санторини,
то есть массовый рынок вторых домов внутри ограничения, введённого по
соображениям обороны.

Запрет снимается по каждому случаю решением комиссии при децентрализованной
администрации. Решение принимается большинством, но голос представителя
Министерства обороны должен быть положительным. В комплект входят справка о
несудимости не старше шести месяцев, краткая биография на греческом, копия
паспорта, свидетельство о рождении и топографический план с привязкой объекта.

Ни закон, ни министерское решение, ни страница администрации не называют срока
рассмотрения. Планировать не по чему, и это самый непредсказуемый шаг, который
ждёт в Греции покупателя из третьей страны.

Сделка, совершённая без разрешения, абсолютно ничтожна, а стороны и нотариус
несут уголовную ответственность.
`,
    transactionCosts: `
Налог на переход права — 3% от налоговой стоимости, платит покупатель. Сверху
идёт муниципальная надбавка 3%, но начисляется она на сам налог, а не на цену,
поэтому реальная величина — 3,09%.

Льгота на первое жильё существует, но требует постоянного проживания в Греции
или намерения поселиться в течение двух лет, так что нерезиденту она
недоступна.

НДС на новостройки приостановлен до 31 декабря 2026 года. Застройщик его не
начисляет, сделка облагается налогом на переход. На практике в 2026 году любая
покупка жилья, включая новостройку, идёт по 3,09%.

Гонорар нотариуса задан тарифом: фиксированные €20 плюс 0,80% с первых
€120 000, 0,70% до €380 000 и 0,65% сверх того. Два греческих юридических
издательства называют первую полосу не 0,80%, а 1%; кодифицированный текст и
копия официальной публикации, размещённая самой нотариальной палатой, дают
0,80%. Противоречие не разрешено, поэтому закладывать стоит диапазон.

Юрист на сделке по закону не обязателен. При этом проверку титула проводит
именно он, так что это практическая необходимость, а не юридическая.
Тарифной ставки нет.

Регистрация в кадастре стоит 5‰ от стоимости плюс €23 по тарифу, вступившему в
силу 13 января 2026 года. Гиды, называющие 0,475%, написаны раньше.

Комиссия агента задана обычаем, а не законом: около 2% плюс НДС, причём с
каждой стороны отдельно.

И одно правило, которое меняет движение денег: с 11 декабря 2023 года цена
уплачивается исключительно банковскими средствами. Договор, где записаны
наличные, ничтожен, не регистрируется и не порождает последствий, а штраф
составляет 10% от суммы наличных, но не менее €10 000. Запрет распространяется
и на предварительные договоры.
`,
    steps: `
Первым идёт греческий налоговый номер, и получить его можно удалённо:
заявление подаётся через myAADE, опознание — по видеозвонку. Налоговый
представитель не обязателен. Срока рассмотрения налоговая служба не публикует.

Греческий счёт не является юридическим условием покупки, но цена должна пройти
через банк, а греческий банк запросит налоговый номер, подтверждение адреса и
происхождение средств.

Предварительный договор обычно нотариальный, и запрет наличных действует и для
него.

Титул проверяется в кадастровом бюро, а там, где кадастр не завершён, — в
ипотечном. Справка об обременениях, которая при этом получается, — тот же
документ, который министерство требует при заявлении на золотую визу.

Для любой передачи нужна справка инженера по статье 83 Закона 4495/2017 —
подтверждение, что самовольных построек сверх разрешённого нет. Она
действительна два месяца с даты подписания, а нотариусам, юристам и инженерам,
которые её не приложили, грозят лишение свободы и штраф от €30 000 до
€100 000. Если сделка идёт дольше двух месяцев, обновлять придётся именно её.

Декларация по налогу на переход подаётся продавцом и покупателем совместно до
сделки, электронно, а сам налог платится в течение трёх рабочих дней с
начисления. Продавец обязан представить ещё и справку муниципалитета об уплате
ежегодного сбора — обычный источник задержек с его стороны.

Сквозного срока на всё это не публикует ни один греческий орган. Твёрдых
ограничений всего два: два месяца жизни справки инженера и три рабочих дня на
налог, а для приграничного объекта — решение комиссии, у которого срока нет
вовсе.
`,
    annualCosts: `
Ежегодный налог — ENFIA, кодифицированный Законом 5219/2025. Обязанность
возникает у того, кто владеет объектом на 1 января; расчёт приходит
электронно, декларация не подаётся.

Для зданий налог считается как площадь, умноженная на базовую ставку и на
коэффициенты зоны, возраста, этажа и фасадов. Базовая ставка идёт от €2,00 за
квадратный метр в первой зоне до €16,20 в девятой.

Отдельного дополнительного налога для физических лиц больше не существует.
Теперь это надбавка внутри основного: если суммарная стоимость имущества
превышает €500 000, основной налог увеличивается на 5%, 10%, 15% или 20% по
полосам. Англоязычная страница Минфина до сих пор описывает старую конструкцию
и в этой части устарела; действует Кодекс налога на имущество.

С 2026 года действует скидка 50% на основное жильё физического лица в
поселениях до 1 500 жителей при стоимости объекта не выше €400 000.
Материковая Аттика исключена. Нерезиденту это ничего не даёт: основного жилья
там у него по определению нет.

Доход от аренды у физических лиц облагается по шкале, введённой Законом
5246/2025: 15% до €12 000, 25% до €24 000, 35% до €36 000 и 45% свыше. Полоса
25% — новая. Налоговый год, с которого шкала применяется, в доступном нам
источнике не назван, и это стоит уточнить прежде, чем считать доходность.

Муниципальный сбор — от 0,25 до 0,35 промилле стоимости, собирается через счёт
за электричество. Отключённый счётчик останавливает сбор, но не обязанность:
она копится незаметно и всплывает при продаже, потому что продавец обязан
принести нотариусу справку об уплате.
`,
    shortLet: `
Краткосрочной в Греции считается сдача меблированного объекта на срок менее 60
дней без услуг, кроме постельного белья.

Каждый такой объект вносится в реестр налоговой службы, а полученный номер
обязан стоять на видном месте в объявлении на каждой платформе и во всех
рекламных материалах. По каждому заезду подаётся декларация — до 20-го числа
месяца, следующего за выездом гостя.

Физическое лицо с одним или двумя объектами платит с этого как с дохода от
недвижимости по шкале выше и не вправе выбрать предпринимательский режим. С
трёх объектов деятельность становится предпринимательской, добавляется НДС
13%.

Сбор за климатическую устойчивость платится с любой краткосрочной сдачи
независимо от режима: €2,00 в сутки с ноября по март и €8,00 с апреля по
октябрь.

Действуют две заморозки. В Афинах запрещена первичная регистрация объектов в
1-м, 2-м и 3-м муниципальных округах — введена на 2025 год и продлена до 31
декабря 2026 года. В Салониках заморожена 1-я муниципальная община, с 1 июля
по 31 декабря 2026 года.

Самое дорогое, что стоит знать покупателю: регистрация не переходит вместе с
объектом. Объект, переданный другому собственнику внутри зоны ограничения,
исключается из реестра, а перерегистрация в период ограничения не допускается.
Купив работающую посуточную квартиру в замороженном округе центра Афин, вы не
покупаете её номер.

Штраф за нарушение заморозки — 50% дохода от сдачи, минимум €20 000, а при
повторе в том же налоговом году — весь полученный доход, минимум €40 000.

Часто упоминаемые ограничения «два объекта на налоговый номер» и «90 дней в
году» нигде не действуют. Закон лишь даёт министрам право ввести их в
отдельных зонах; ни одного такого решения найти не удалось.
`,
    residencyLink: `
Покупка в Греции по-прежнему может вести к ВНЖ — этим страна отличается от
Португалии. Условия резко ужесточились в 2024 году.

Пороги: €800 000 в Аттике, в номе Салоники, на Миконосе, Тире и островах с
населением свыше 3 100 человек; €400 000 в остальной Греции; €250 000 при
переводе объекта из другого назначения в жилое или при реставрации памятника.
Для маршрута с переводом назначения работы должны быть завершены до подачи
заявления.

Оба главных порога требуют минимум 120 квадратных метров основных помещений.
Кладовка и парковка, купленные тем же договором, засчитываются в сумму
инвестиции, но не в эти 120 метров.

Инвестиция делается в один объект. Складывать несколько объектов до порога
нельзя — до 2024 года было можно, и гиды, написанные раньше, до сих пор
утверждают обратное.

Краткосрочная сдача квалифицирующего объекта запрещена прямо, и санкция
двойная: административный штраф €50 000 и отзыв разрешения. Долгосрочная сдача
не запрещена — запрет ограничен сдачей в рамках экономики совместного
пользования и субарендой.

Подходит ли строящийся объект — вопрос по-настоящему открытый. Статья 100 его
не регулирует, а два условия, которые на него влияют — измеримые 120 метров и
полная собственность с полностью уплаченной ценой до подачи, — работают
против. Это вопрос для письменного подтверждения министерства, а не для сайта.

Сбор — €2 000 с заявителя плюс €16 за карту. Срока рассмотрения не публикует
ни один греческий орган.
`,
  },
  pl: {
    whoMayBuy: `
Grecja nie wprowadza ogólnego zakazu własności dla obywateli spoza UE.
Wprowadza zakaz terytorialny i to on zaskakuje tych, którzy o nim nie
słyszeli.

Artykuły 24–26 ustawy 1892/1990 zamykają strefy przygraniczne: każda
czynność tworząca prawa do nieruchomości tam na rzecz osoby o obywatelstwie
lub siedzibie poza UE i EOG jest zakazana. Do stref należą nomosy Dodekanez,
Ewros, Tesprotia, Kastoria, Kilkis, Lesbos, Ksanti, Preweza, Rodopi, Samos,
Florina i Chios, wyspy Thira i Skyros oraz kilka dawnych eparchii. Thira to
Santorini — masowy rynek drugich domów wewnątrz ograniczenia wprowadzonego ze
względów obronnych.

Zakaz uchyla w każdej sprawie komisja przy administracji zdecentralizowanej.
Decyduje większością, ale głos przedstawiciela Ministerstwa Obrony musi być
pozytywny. Do wniosku dołącza się zaświadczenie o niekaralności nie starsze
niż sześć miesięcy, krótki życiorys po grecku, kopię paszportu, akt urodzenia
i plan topograficzny z lokalizacją nieruchomości.

Ani ustawa, ani rozporządzenie, ani strona administracji nie podają terminu
rozpatrzenia. Nie ma się do czego planować i jest to najmniej przewidywalny
krok, jaki czeka w Grecji kupującego z państwa trzeciego.

Transakcja dokonana bez zgody jest bezwzględnie nieważna, a strony i notariusz
ponoszą odpowiedzialność karną.
`,
    transactionCosts: `
Podatek od przeniesienia wynosi 3% wartości podatkowej i płaci go kupujący. Do
tego dochodzi dopłata gminna 3%, naliczana jednak od samego podatku, a nie od
ceny, więc realna wielkość to 3,09%.

Ulga na pierwsze mieszkanie istnieje, ale wymaga stałego zamieszkania w Grecji
albo zamiaru osiedlenia się w ciągu dwóch lat, więc nierezydent jej nie
osiągnie.

VAT od nowych budynków jest zawieszony do 31 grudnia 2026. Deweloper go nie
nalicza, sprzedaż podlega podatkowi od przeniesienia. W praktyce w 2026 roku
każdy zakup mieszkania, także nowego, obciążony jest stawką 3,09%.

Wynagrodzenie notariusza określa taryfa: stałe €20 plus 0,80% od pierwszych
€120 000, 0,70% do €380 000 i 0,65% powyżej. Dwa greckie wydawnictwa prawnicze
podają pierwszy próg jako 1%, a nie 0,80%; tekst ujednolicony i kopia
publikacji urzędowej udostępniona przez samą izbę notarialną dają 0,80%.
Sprzeczność pozostaje nierozstrzygnięta, więc warto zakładać przedział.

Prawnik przy akcie nie jest ustawowo wymagany. To jednak on bada tytuł
prawny, więc jest to konieczność praktyczna, nie prawna. Stawki taryfowej brak.

Wpis do katastru kosztuje 5‰ wartości plus €23 według taryfy obowiązującej od
13 stycznia 2026. Poradniki podające 0,475% powstały wcześniej.

Prowizję pośrednika ustala zwyczaj, nie ustawa: około 2% plus VAT, przy czym
od każdej ze stron osobno.

I jedna zasada zmieniająca przepływ pieniędzy: od 11 grudnia 2023 cena płatna
jest wyłącznie środkami bankowymi. Akt zapisujący gotówkę jest nieważny, nie
podlega wpisowi i nie wywołuje skutków, a kara wynosi 10% kwoty gotówkowej,
nie mniej niż €10 000. Zakaz obejmuje także umowy przedwstępne.
`,
    steps: `
Najpierw grecki numer podatkowy, i można go uzyskać zdalnie: wniosek idzie
przez myAADE, identyfikacja odbywa się na wideorozmowie. Przedstawiciel
podatkowy nie jest obowiązkowy. Urząd nie publikuje czasu rozpatrzenia.

Grecki rachunek nie jest prawnym warunkiem zakupu, ale cena musi przejść przez
bank, a grecki bank poprosi o numer podatkowy, potwierdzenie adresu i
pochodzenie środków.

Umowa przedwstępna jest zwykle notarialna, a zakaz gotówki dotyczy również jej.

Tytuł bada się w biurze katastralnym, a tam gdzie kataster nie jest ukończony
— w księgach wieczystych. Powstające przy tym zaświadczenie o obciążeniach to
ten sam dokument, którego ministerstwo wymaga przy wniosku o złotą wizę.

Każde przeniesienie wymaga zaświadczenia inżyniera z art. 83 ustawy 4495/2017
— potwierdzenia, że nie ma samowoli budowlanej ponad to, na co zezwala
pozwolenie. Jest ważne dwa miesiące od podpisania, a notariuszom, prawnikom i
inżynierom, którzy go pominą, grozi pozbawienie wolności i kara od €30 000 do
€100 000. Przy transakcji trwającej dłużej niż dwa miesiące to właśnie ten
dokument trzeba odnowić.

Deklarację podatku od przeniesienia składają wspólnie kupujący i sprzedający
przed aktem, elektronicznie, a sam podatek płaci się w ciągu trzech dni
roboczych od wymiaru. Sprzedający musi przedstawić także zaświadczenie gminy o
uregulowaniu opłaty rocznej — typowe źródło opóźnień po jego stronie.

Czasu całościowego nie publikuje żaden grecki organ. Twardych ograniczeń są
dwa: dwumiesięczna ważność zaświadczenia inżyniera i trzy dni robocze na
podatek, a dla nieruchomości w strefie przygranicznej — decyzja komisji, która
nie ma terminu w ogóle.
`,
    annualCosts: `
Podatkiem rocznym jest ENFIA, skodyfikowany ustawą 5219/2025. Obowiązek
powstaje u tego, kto ma prawa na 1 stycznia; wymiar przychodzi elektronicznie,
deklaracji się nie składa.

Dla budynków podatek to powierzchnia pomnożona przez stawkę bazową i przez
współczynniki strefy, wieku, kondygnacji i elewacji. Stawka bazowa biegnie od
€2,00 za metr kwadratowy w pierwszej strefie do €16,20 w dziewiątej.

Odrębny podatek uzupełniający od osób fizycznych już nie istnieje. Jest teraz
dopłatą wewnątrz podatku głównego: gdy łączna wartość majątku przekracza
€500 000, podatek główny rośnie o 5%, 10%, 15% lub 20% według progów.
Anglojęzyczna strona ministerstwa nadal opisuje starą konstrukcję i jest w tym
zakresie nieaktualna; obowiązuje Kodeks podatku od nieruchomości.

Od 2026 obowiązuje ulga 50% na główne mieszkanie osoby fizycznej w
miejscowościach do 1 500 mieszkańców, przy wartości nieruchomości nie wyższej
niż €400 000. Attyka kontynentalna jest wyłączona. Nierezydentowi nic to nie
daje: głównego mieszkania z definicji tam nie ma.

Dochód z najmu osób fizycznych podlega skali wprowadzonej ustawą 5246/2025:
15% do €12 000, 25% do €24 000, 35% do €36 000 i 45% powyżej. Próg 25% jest
nowy. Rok podatkowy, od którego skala obowiązuje, nie jest podany w dostępnym
nam źródle i warto to potwierdzić przed liczeniem rentowności.

Opłata gminna wynosi od 0,25 do 0,35 promila wartości i pobierana jest przez
rachunek za prąd. Odłączony licznik zatrzymuje pobór, ale nie obowiązek: ten
narasta po cichu i ujawnia się przy sprzedaży, bo sprzedający musi przynieść
notariuszowi zaświadczenie o uregulowaniu.
`,
    shortLet: `
Najem krótkoterminowy oznacza w Grecji wynajęcie umeblowanej nieruchomości na
okres krótszy niż 60 dni, bez usług poza pościelą.

Każda taka nieruchomość trafia do rejestru prowadzonego przez urząd skarbowy,
a uzyskany numer musi być widoczny w ogłoszeniu na każdej platformie i we
wszystkich materiałach reklamowych. Za każdy pobyt składa się deklarację — do
20. dnia miesiąca następującego po wyjeździe gościa.

Osoba fizyczna z jedną lub dwiema nieruchomościami płaci jak od dochodu z
nieruchomości według powyższej skali i nie może wybrać opodatkowania
działalności. Od trzech nieruchomości działalność staje się gospodarcza,
dochodzi VAT 13%.

Opłata klimatyczna obciąża każdy najem krótkoterminowy niezależnie od reżimu:
€2,00 dziennie od listopada do marca i €8,00 od kwietnia do października.

Obowiązują dwa zamrożenia. W Atenach zakazana jest pierwsza rejestracja w 1.,
2. i 3. dzielnicy miejskiej — wprowadzona na 2025 rok i przedłużona do 31
grudnia 2026. W Salonikach zamrożona jest 1. wspólnota miejska, od 1 lipca do
31 grudnia 2026.

Rzecz najdroższa dla kupującego: rejestracja nie przechodzi wraz z
nieruchomością. Nieruchomość przeniesiona wewnątrz strefy ograniczenia jest
usuwana z rejestru, a ponowna rejestracja w okresie ograniczenia nie jest
dopuszczalna. Kupując działający najem krótkoterminowy w zamrożonej dzielnicy
centrum Aten, nie kupuje się jego numeru.

Kara za naruszenie zamrożenia to 50% dochodu z najmu, nie mniej niż €20 000, a
przy powtórzeniu w tym samym roku podatkowym — cały uzyskany dochód, nie mniej
niż €40 000.

Często przywoływane limity „dwie nieruchomości na numer podatkowy" i „90 dni w
roku" nigdzie nie obowiązują. Ustawa daje jedynie ministrom prawo wprowadzenia
ich w wyznaczonych strefach; żadnej takiej decyzji nie udało się odnaleźć.
`,
    residencyLink: `
Zakup w Grecji nadal może prowadzić do rezydencji, co odróżnia ją od
Portugalii. Warunki mocno zaostrzono w 2024 roku.

Progi: €800 000 w Attyce, w nomosie Saloniki, na Mykonos, Thirze i wyspach
powyżej 3 100 mieszkańców; €400 000 w pozostałej Grecji; €250 000 przy zmianie
przeznaczenia nieruchomości na mieszkalne albo przy renowacji zabytku. Przy
ścieżce ze zmianą przeznaczenia prace muszą zakończyć się przed złożeniem
wniosku.

Oba główne progi wymagają minimum 120 metrów kwadratowych pomieszczeń
podstawowych. Komórka i miejsce postojowe kupione tą samą umową liczą się do
wartości inwestycji, ale nie do tych 120 metrów.

Inwestycja obejmuje jedną nieruchomość. Sumowanie kilku nieruchomości do progu
jest niedopuszczalne — przed 2024 rokiem było możliwe, a poradniki napisane
wcześniej wciąż twierdzą inaczej.

Najem krótkoterminowy nieruchomości kwalifikującej jest wprost zakazany, a
sankcja jest podwójna: kara administracyjna €50 000 i cofnięcie zezwolenia.
Najem długoterminowy nie jest zakazany — zakaz ogranicza się do najmu w ramach
ekonomii współdzielenia i do podnajmu.

Czy kwalifikuje się nieruchomość w budowie, pozostaje realnie nierozstrzygnięte.
Artykuł 100 tego nie reguluje, a dwa warunki, które tu ważą — mierzalne 120
metrów oraz pełna własność z ceną zapłaconą w całości przed wnioskiem —
przemawiają przeciw. To pytanie do pisemnego potwierdzenia ministerstwa, nie
do strony internetowej.

Opłata wynosi €2 000 od wnioskodawcy plus €16 za kartę. Czasu rozpatrzenia nie
publikuje żaden grecki organ.
`,
  },
};

// --- Portugal ----------------------------------------------------------------

const PT: Record<Locale, Sections> = {
  en: {
    whoMayBuy: `
Portugal restricts nobody. There is no nationality condition on buying a home,
no regional carve-out we could find for Madeira or the Azores, and no permit
to obtain.

What changed is the price of being a non-resident rather than the right to
buy. A 2023 proposal to bar foreigners from purchasing went nowhere — the
European Commission said an outright prohibition would not be permissible —
and what arrived instead, in May 2026, was a tax. It is in the next section,
and it is the single most important thing on this page.

One consequence worth stating plainly: the difference Portuguese law now draws
is between residents and non-residents, not between Portuguese and foreign
buyers. A foreign national who is tax-resident in Portugal is on the resident
side of it.
`,
    transactionCosts: `
Since May 2026 a non-resident buying a home in Portugal pays transfer tax at a
flat 7.5%, with no exemption or reduction of any kind. Decreto-Lei 97/2026
added it as paragraph 10 of article 17 of the IMT Code. Most guidance written
before that date does not carry it.

There are three ways out, and all of them are about what happens after the
purchase. The buyer was already tax-resident in Portugal; or becomes
tax-resident within two years of the purchase; or lets the property
long-term within six months at a rent no higher than the moderate ceiling —
€2,300 a month in 2026 — for at least 36 months out of the first five years. A
buyer who later satisfies one of these may reclaim the difference, within six
months of meeting the condition.

For a resident buyer the ordinary scale still applies: nothing to €106,346 on
a permanent home, then 2%, 5%, 7% and 8% by band, a flat 6% from around
€660,000 and a flat 7.5% above €1,150,853. A second home starts at 1% instead
of zero.

A buyer domiciled in a blacklisted jurisdiction pays 10%, and that rate
overrides the 7.5%.

Stamp duty on the purchase is 0.8%. A mortgage of five years or more adds
0.6% of the loan.

Casa Pronta, the one-stop counter, charges €375 for a single registration act
and €700 where there are several — a purchase plus a bank mortgage, typically
— with €50 for each additional property. A registry certificate costs €15
online and is valid six months.

Lawyers' fees are not tariffed. Agency commission is not fixed by law either:
the usual 5% plus VAT, paid by the seller, is market practice, and the
regulator's own page sets neither the rate nor who pays.
`,
    steps: `
The tax number comes first, and one widely repeated claim about it is wrong. A
non-resident living outside the EU or EEA does not have to appoint a fiscal
representative: enrolling in the tax authority's electronic notifications
serves instead. The obligation is to be reachable, not to be represented. For
residents of the EU, Norway, Iceland or Liechtenstein both are optional.

No law requires a Portuguese bank account to buy, though one is practical for
paying the tax and the utilities.

The promise of purchase and sale is the binding step, and the deposit is where
the risk sits: a defaulting buyer forfeits it, a defaulting seller returns it
doubled. The customary 10% is practice, not law — the parties set it freely.

Due diligence rests on two documents: the permanent registry certificate,
which shows title and encumbrances, and the tax register entry for the
property.

Casa Pronta consolidates the deed, the tax payment and the registration into
one appointment at one counter.

No Portuguese government source publishes a duration for any of this — not for
the tax number, not for opening an account, not for the interval between
promise and deed, not for registration. Any timeline you have been quoted is
somebody's estimate.
`,
    annualCosts: `
The annual tax is IMI: 0.3% to 0.45% of the rateable value for urban
property, up to 0.5% in exceptional cases. Each municipality sets its own rate
within that range every year and may vary it by parish, so the figure is a
local one. Where a property has stood vacant for more than a year or is in
ruins, the rate is tripled.

Above IMI sits AIMI, on the portfolio rather than the property: the first
€600,000 per individual is deducted — €1,200,000 for a couple filing jointly —
and the excess is taxed at 0.7%, rising to 1% on the slice between €1m and
€2m and 1.5% above that. It is assessed in June and paid in September, and a
non-resident with a €700,000 apartment pays it exactly as a resident would.

Rental income for a non-resident is taxed at a flat 25%. Long contracts reduce
it: five to ten years brings it to 15%, ten to twenty years to 10%, twenty
years or more to 5%. From 2026 a separate 10% rate applies to contracts at or
below the moderate-rent ceiling, in force until the end of 2029; how it
interacts with the duration-based reductions is not settled in the sources we
could reach.

One asymmetry matters here. A resident of another EU or EEA state may elect to
be taxed at the progressive resident rates instead of the flat 25%. A resident
of a country outside the EU and EEA has no such option.

Condominium charges are set by each building's own assembly and no government
source publishes typical figures.
`,
    shortLet: `
Local accommodation — alojamento local — went through three years of churn and
came out the other side more permissive than the headlines suggest.

New registrations are open nationally. The suspension introduced by the 2023
housing law was repealed by Decreto-Lei 76/2024, in force since 1 November
2024, along with the extraordinary levy on apartments in local accommodation
and the five-year expiry of registrations. What replaced the expiry is
insurance: mandatory civil liability cover is tracked in the national
register, and a lapse cancels the registration.

Registration is a prior notice through the single electronic counter. The
municipality has 60 working days to object, or 90 in a containment zone;
silence means the registration stands. Platforms must display the registration
number.

A condominium can no longer cancel a registration on its own. Since 2024 it
may only pass a reasoned resolution, approved by more than half the building's
permilagem and based on proven disturbance, and then ask the municipality to
consider cancellation.

The live constraint is municipal. Municipalities may declare containment
zones, and a July 2026 decree gave those with more than a thousand
registrations until 31 December 2026 to decide whether to regulate — with the
power to suspend new registrations once while they draft the rules. Lisbon and
Porto both restrict parts of their centres, and several other cities have
followed. Which parish a property sits in decides the answer, so that is the
thing to check before committing, not a national summary.
`,
    residencyLink: `
This is the section where Portugal differs from every other jurisdiction on
this site: buying property here confers no immigration status at all.

The residence-by-investment route through real estate was removed in 2023, and
the law went further than deleting it. Article 3(5) of the immigration act now
provides that a qualifying investment may not be directed at real estate
"directly or indirectly" — which closes the fund holding buildings as well as
the flat. The provision survived a further amendment in October 2025.

What remains are five routes, none of them property: creating at least ten
jobs; €500,000 into scientific research; €250,000 into cultural heritage;
€500,000 into a qualifying non-property fund; or €500,000 into a company that
creates five permanent jobs.

The route most buyers are actually thinking of is the D7, and it turns on
income, not on assets. The official page for it does not list property
ownership among its criteria, and does not mention proof of accommodation at
all. The euro threshold is not stated on any government page we could reach;
the figures in circulation come from consultancies.

So a purchased home may be the address on an application. We found no
government source stating that owning one strengthens it.
`,
  },
  ru: {
    whoMayBuy: `
Португалия не ограничивает никого. Условия по гражданству при покупке жилья
нет, регионального исключения для Мадейры и Азорских островов найти не
удалось, разрешения получать не нужно.

Изменилась не возможность купить, а цена статуса нерезидента. Предложение 2023
года запретить покупку иностранцам ничем не кончилось — Еврокомиссия заявила,
что прямой запрет был бы недопустим, — и вместо него в мае 2026 года появился
налог. Он в следующем разделе, и это самое важное на этой странице.

Одно следствие стоит назвать прямо: португальское право теперь различает
резидентов и нерезидентов, а не португальцев и иностранцев. Иностранец,
который является налоговым резидентом Португалии, находится на резидентской
стороне этой границы.
`,
    transactionCosts: `
С мая 2026 года нерезидент, покупающий жильё в Португалии, платит налог на
переход по единой ставке 7,5% — без единого освобождения и без единой скидки.
Норма добавлена Decreto-Lei 97/2026 как пункт 10 статьи 17 Кодекса IMT.
Большинство гидов, написанных раньше, её не содержит.

Выходов три, и все они про то, что происходит после покупки. Покупатель уже
был налоговым резидентом Португалии; либо становится им в течение двух лет с
даты покупки; либо в течение шести месяцев сдаёт объект в долгосрочную аренду
по ставке не выше «умеренного» потолка — €2 300 в месяц в 2026 году — и держит
его сданным не менее 36 месяцев из первых пяти лет. Тот, кто выполнил условие
позже, вправе вернуть разницу в течение шести месяцев с момента выполнения.

Для покупателя-резидента действует обычная шкала: ноль до €106 346 по
постоянному жилью, далее 2%, 5%, 7% и 8% по полосам, единая ставка 6% примерно
с €660 000 и единая 7,5% свыше €1 150 853. Для второго жилья первая полоса не
нулевая, а 1%.

Покупатель из юрисдикции, включённой в чёрный список, платит 10%, и эта ставка
перекрывает 7,5%.

Гербовый сбор при покупке — 0,8%. Ипотека на пять лет и дольше добавляет 0,6%
от суммы кредита.

Единое окно Casa Pronta берёт €375 за один регистрационный акт и €700, если
актов несколько — обычно это покупка плюс банковская ипотека, — плюс €50 за
каждый дополнительный объект. Выписка из реестра стоит €15 онлайн и действует
шесть месяцев.

Гонорар юриста тарифом не установлен. Комиссия агентства законом тоже не
задана: привычные 5% плюс НДС, которые платит продавец, — рыночная практика, а
страница регулятора не устанавливает ни ставки, ни плательщика.
`,
    steps: `
Первым идёт налоговый номер, и одно распространённое утверждение о нём неверно.
Нерезидент, живущий вне ЕС и ЕЭЗ, не обязан назначать налогового
представителя: вместо этого достаточно подключиться к электронным уведомлениям
налоговой службы. Обязанность — быть доступным, а не быть представленным. Для
резидентов ЕС, Норвегии, Исландии и Лихтенштейна оба варианта необязательны.

Португальский счёт для покупки законом не требуется, хотя практически удобен
для уплаты налога и коммунальных.

Предварительный договор — связывающий шаг, и риск сосредоточен в задатке:
отказавшийся покупатель его теряет, отказавшийся продавец возвращает вдвойне.
Привычные 10% — практика, а не закон, стороны определяют размер свободно.

Проверка опирается на два документа: постоянную выписку из реестра, где видны
титул и обременения, и запись об объекте в налоговом реестре.

Casa Pronta сводит сделку, уплату налога и регистрацию в одну встречу в одном
окне.

Ни один государственный источник Португалии не публикует сроков — ни на
налоговый номер, ни на открытие счёта, ни на промежуток между предварительным
договором и сделкой, ни на регистрацию. Любой названный вам срок — чья-то
оценка.
`,
    annualCosts: `
Ежегодный налог — IMI: от 0,3% до 0,45% кадастровой стоимости по городской
недвижимости, в исключительных случаях до 0,5%. Ставку каждый муниципалитет
устанавливает сам в этих пределах ежегодно и может дифференцировать по
приходам, так что величина местная. Если объект простаивает больше года или
находится в разрушенном состоянии, ставка утраивается.

Над IMI надстроен AIMI — налог на портфель, а не на объект: €600 000 на
человека вычитается, для супругов при совместном декларировании €1 200 000, а
превышение облагается по 0,7%, далее 1% на часть от €1 млн до €2 млн и 1,5%
свыше. Начисляется в июне, платится в сентябре, и нерезидент с квартирой за
€700 000 платит его ровно так же, как резидент.

Доход от аренды у нерезидента облагается по единой ставке 25%. Длинные
договоры её снижают: от пяти до десяти лет — до 15%, от десяти до двадцати —
до 10%, от двадцати лет — до 5%. С 2026 года действует отдельная ставка 10%
для договоров в пределах умеренной аренды, до конца 2029 года; как она
сочетается со скидками за длительность, в доступных источниках не разъяснено.

Одна асимметрия здесь важна. Резидент другой страны ЕС или ЕЭЗ вправе выбрать
прогрессивную резидентскую шкалу вместо единых 25%. У резидента страны вне ЕС
и ЕЭЗ такого выбора нет.

Взносы кондоминиума устанавливает собрание конкретного дома, и типовых цифр
государство не публикует.
`,
    shortLet: `
Режим краткосрочной аренды — alojamento local — прошёл через три года
метаний и вышел более мягким, чем можно подумать по заголовкам.

Новые регистрации по стране открыты. Приостановку, введённую жилищным законом
2023 года, отменил Decreto-Lei 76/2024, действующий с 1 ноября 2024 года,
вместе с чрезвычайным взносом с квартир в краткосрочной аренде и пятилетним
сроком действия регистрации. Вместо срока действия пришло страхование:
обязательное страхование ответственности отслеживается в национальном реестре,
и его прекращение аннулирует регистрацию.

Регистрация оформляется предварительным уведомлением через единое электронное
окно. У муниципалитета есть 60 рабочих дней на возражение, в зоне сдерживания
— 90; молчание означает, что регистрация состоялась. Платформы обязаны
показывать регистрационный номер.

Кондоминиум больше не может отменить регистрацию сам. С 2024 года он вправе
лишь принять мотивированное решение более чем половиной долей здания, опираясь
на доказанное нарушение покоя, и просить муниципалитет рассмотреть
аннулирование.

Действующее ограничение — муниципальное. Муниципалитеты вправе объявлять зоны
сдерживания, а декрет от июля 2026 года дал тем из них, где больше тысячи
регистраций, срок до 31 декабря 2026 года, чтобы решить, вводить ли
регулирование, и право однократно приостановить новые регистрации на время
подготовки правил. Лиссабон и Порту ограничивают части своих центров, за ними
пошли ещё несколько городов. Ответ определяется тем, в каком приходе стоит
объект, поэтому проверять нужно именно приход, а не общенациональную сводку.
`,
    residencyLink: `
Именно в этом разделе Португалия отличается от всех остальных юрисдикций
сайта: покупка недвижимости здесь не даёт никакого иммиграционного статуса.

Маршрут резидентства за инвестиции через недвижимость отменён в 2023 году, и
закон пошёл дальше простого удаления. Пункт 5 статьи 3 иммиграционного закона
теперь устанавливает, что квалифицированная инвестиция не может быть
направлена на недвижимость «прямо или косвенно» — а это закрывает и фонд,
владеющий зданиями, а не только квартиру. Норма пережила очередную поправку в
октябре 2025 года.

Остались пять маршрутов, и ни один из них не про недвижимость: создание не
менее десяти рабочих мест; €500 000 в научные исследования; €250 000 в
культурное наследие; €500 000 в квалифицированный фонд без недвижимости;
€500 000 в компанию, создающую пять постоянных рабочих мест.

Маршрут, о котором на самом деле думает большинство покупателей, — D7, и он
опирается на доход, а не на активы. На официальной странице владение
недвижимостью не значится среди критериев, и подтверждение жилья там не
упоминается вовсе. Порог дохода в евро ни на одной доступной нам
государственной странице не назван; цифры, которые ходят по рынку, идут от
консультантов.

То есть купленное жильё может быть адресом в заявлении. Государственного
источника, который утверждал бы, что владение его усиливает, мы не нашли.
`,
  },
  pl: {
    whoMayBuy: `
Portugalia nie ogranicza nikogo. Nie ma warunku obywatelstwa przy zakupie
mieszkania, nie udało się znaleźć wyłączenia regionalnego dla Madery ani
Azorów, nie trzeba uzyskiwać zezwolenia.

Zmieniła się nie możliwość zakupu, lecz cena statusu nierezydenta. Propozycja
z 2023 roku, by zakazać zakupów cudzoziemcom, spełzła na niczym — Komisja
Europejska stwierdziła, że wprost zakaz byłby niedopuszczalny — a w maju 2026
pojawił się zamiast niego podatek. Jest w następnej sekcji i to najważniejsza
rzecz na tej stronie.

Jeden wniosek wart wprost powiedzenia: prawo portugalskie odróżnia dziś
rezydentów od nierezydentów, a nie Portugalczyków od cudzoziemców.
Cudzoziemiec będący portugalskim rezydentem podatkowym jest po stronie
rezydenta.
`,
    transactionCosts: `
Od maja 2026 nierezydent kupujący mieszkanie w Portugalii płaci podatek od
przeniesienia według jednolitej stawki 7,5% — bez żadnego zwolnienia i bez
żadnej obniżki. Normę dodał Decreto-Lei 97/2026 jako ust. 10 art. 17 Kodeksu
IMT. Większość poradników napisanych wcześniej jej nie zawiera.

Wyjścia są trzy i wszystkie dotyczą tego, co dzieje się po zakupie. Kupujący
był już portugalskim rezydentem podatkowym; albo staje się nim w ciągu dwóch
lat od zakupu; albo w ciągu sześciu miesięcy wynajmuje nieruchomość
długoterminowo po czynszu nie wyższym niż pułap „umiarkowany" — €2 300
miesięcznie w 2026 — i utrzymuje najem przez co najmniej 36 miesięcy z
pierwszych pięciu lat. Kto spełni warunek później, może odzyskać różnicę w
ciągu sześciu miesięcy od jego spełnienia.

Dla kupującego-rezydenta obowiązuje zwykła skala: zero do €106 346 przy
mieszkaniu stałym, dalej 2%, 5%, 7% i 8% według progów, jednolite 6% mniej
więcej od €660 000 i jednolite 7,5% powyżej €1 150 853. Przy drugim mieszkaniu
pierwszy próg nie jest zerowy, lecz wynosi 1%.

Kupujący z jurysdykcji z czarnej listy płaci 10%, a ta stawka wypiera 7,5%.

Opłata skarbowa przy zakupie to 0,8%. Kredyt na pięć lat i dłużej dokłada 0,6%
kwoty kredytu.

Jedno okienko Casa Pronta pobiera €375 za jeden akt wpisu i €700, gdy aktów
jest kilka — zwykle zakup plus kredyt bankowy — oraz €50 za każdą kolejną
nieruchomość. Odpis z rejestru kosztuje €15 online i jest ważny sześć miesięcy.

Wynagrodzenie prawnika nie jest taryfowane. Prowizji agencji ustawa też nie
ustala: zwyczajowe 5% plus VAT płacone przez sprzedającego to praktyka
rynkowa, a strona regulatora nie określa ani stawki, ani płatnika.
`,
    steps: `
Najpierw numer podatkowy, i jedno powszechne twierdzenie na jego temat jest
błędne. Nierezydent mieszkający poza UE i EOG nie musi ustanawiać
przedstawiciela podatkowego: wystarczy przystąpić do elektronicznych
powiadomień urzędu skarbowego. Obowiązkiem jest być osiągalnym, a nie być
reprezentowanym. Dla rezydentów UE, Norwegii, Islandii i Liechtensteinu oba
warianty są nieobowiązkowe.

Portugalskiego rachunku ustawa do zakupu nie wymaga, choć praktycznie przydaje
się do zapłaty podatku i mediów.

Umowa przedwstępna jest krokiem wiążącym, a ryzyko skupia się w zadatku:
kupujący, który się wycofa, traci go, sprzedający zwraca w podwójnej
wysokości. Zwyczajowe 10% to praktyka, nie ustawa — strony ustalają wysokość
swobodnie.

Weryfikacja opiera się na dwóch dokumentach: stałym odpisie z rejestru,
pokazującym tytuł i obciążenia, oraz wpisie nieruchomości w rejestrze
podatkowym.

Casa Pronta łączy akt, zapłatę podatku i wpis w jednym spotkaniu w jednym
okienku.

Żadne portugalskie źródło rządowe nie publikuje terminów — ani na numer
podatkowy, ani na otwarcie rachunku, ani na odstęp między umową przedwstępną a
aktem, ani na wpis. Każdy podany termin jest czyimś szacunkiem.
`,
    annualCosts: `
Podatkiem rocznym jest IMI: od 0,3% do 0,45% wartości katastralnej dla
nieruchomości miejskich, w wyjątkowych przypadkach do 0,5%. Stawkę każda gmina
ustala sama w tych granicach co roku i może różnicować ją według parafii, więc
wielkość jest lokalna. Gdy nieruchomość stoi pusta dłużej niż rok albo jest w
ruinie, stawka jest potrajana.

Nad IMI nadbudowany jest AIMI — podatek od portfela, nie od nieruchomości:
€600 000 na osobę podlega odliczeniu, dla małżonków rozliczających się wspólnie
€1 200 000, a nadwyżka opodatkowana jest stawką 0,7%, dalej 1% od części od
€1 mln do €2 mln i 1,5% powyżej. Wymierzany w czerwcu, płatny we wrześniu, a
nierezydent z mieszkaniem za €700 000 płaci go dokładnie tak jak rezydent.

Dochód z najmu u nierezydenta opodatkowany jest jednolitą stawką 25%. Długie
umowy ją obniżają: od pięciu do dziesięciu lat — do 15%, od dziesięciu do
dwudziestu — do 10%, od dwudziestu lat — do 5%. Od 2026 obowiązuje odrębna
stawka 10% dla umów mieszczących się w czynszu umiarkowanym, do końca 2029
roku; jak łączy się z obniżkami za długość, w dostępnych źródłach nie
wyjaśniono.

Jedna asymetria ma tu znaczenie. Rezydent innego państwa UE lub EOG może
wybrać progresywną skalę rezydenta zamiast jednolitych 25%. Rezydent państwa
spoza UE i EOG takiego wyboru nie ma.

Opłaty wspólnoty ustala zebranie konkretnego budynku, a państwo nie publikuje
typowych kwot.
`,
    shortLet: `
Reżim najmu krótkoterminowego — alojamento local — przeszedł trzy lata
zwrotów i wyszedł z nich łagodniejszy, niż sugerują nagłówki.

Nowe rejestracje w skali kraju są otwarte. Zawieszenie wprowadzone ustawą
mieszkaniową z 2023 roku uchylił Decreto-Lei 76/2024, obowiązujący od 1
listopada 2024, wraz z nadzwyczajną daniną od mieszkań w najmie
krótkoterminowym i pięcioletnim okresem ważności rejestracji. Zamiast terminu
ważności przyszło ubezpieczenie: obowiązkowe OC jest śledzone w rejestrze
krajowym, a jego wygaśnięcie unieważnia rejestrację.

Rejestracja to zgłoszenie uprzednie przez jedno okienko elektroniczne. Gmina
ma 60 dni roboczych na sprzeciw, w strefie ograniczenia 90; milczenie oznacza,
że rejestracja jest skuteczna. Platformy muszą pokazywać numer rejestracyjny.

Wspólnota nie może już samodzielnie unieważnić rejestracji. Od 2024 może
jedynie podjąć uzasadnioną uchwałę większością udziałów budynku, opartą na
udowodnionym zakłócaniu spokoju, i wystąpić do gminy o rozważenie
unieważnienia.

Realne ograniczenie jest gminne. Gminy mogą ogłaszać strefy ograniczenia, a
dekret z lipca 2026 dał tym z ponad tysiącem rejestracji czas do 31 grudnia
2026 na decyzję, czy wprowadzać regulację, oraz prawo jednorazowego zawieszenia
nowych rejestracji na czas przygotowania przepisów. Lizbona i Porto
ograniczają części swoich centrów, poszło za nimi kilka innych miast.
Odpowiedź zależy od tego, w której parafii stoi nieruchomość, więc sprawdzać
trzeba parafię, a nie podsumowanie krajowe.
`,
    residencyLink: `
Właśnie w tej sekcji Portugalia różni się od wszystkich pozostałych
jurysdykcji na tej stronie: zakup nieruchomości nie daje tu żadnego statusu
imigracyjnego.

Ścieżkę rezydencji za inwestycję przez nieruchomości usunięto w 2023 roku, a
ustawa poszła dalej niż samo skreślenie. Ust. 5 art. 3 ustawy imigracyjnej
stanowi dziś, że inwestycja kwalifikowana nie może być nakierowana na
nieruchomości „bezpośrednio ani pośrednio" — co zamyka także fundusz posiadający
budynki, nie tylko mieszkanie. Przepis przetrwał kolejną nowelizację w
październiku 2025.

Pozostało pięć ścieżek i żadna nie dotyczy nieruchomości: utworzenie co
najmniej dziesięciu miejsc pracy; €500 000 na badania naukowe; €250 000 na
dziedzictwo kulturowe; €500 000 do kwalifikowanego funduszu bez nieruchomości;
€500 000 w spółkę tworzącą pięć stałych miejsc pracy.

Ścieżka, o której naprawdę myśli większość kupujących, to D7, a opiera się ona
na dochodzie, nie na majątku. Oficjalna strona nie wymienia własności
nieruchomości wśród kryteriów i nie wspomina o potwierdzeniu zakwaterowania w
ogóle. Progu dochodowego w euro nie podaje żadna dostępna nam strona rządowa;
liczby krążące po rynku pochodzą od doradców.

Kupione mieszkanie może więc być adresem we wniosku. Źródła rządowego, które
twierdziłoby, że własność go wzmacnia, nie znaleźliśmy.
`,
  },
};

// --- Malta -------------------------------------------------------------------

const MT: Record<Locale, Sections> = {
  en: {
    whoMayBuy: `
Malta starts from a prohibition. Under Chapter 246 a non-resident may not
acquire immovable property at all, and an acquisition made in breach of it is
"null and void and without effect for all purposes of law". Everything a
foreign buyer does here happens inside an exception.

The exception is the AIP permit, granted by the minister. A buyer from outside
the EU needs one for every acquisition except by inheritance or inside a
Special Designated Area. It costs €233 regardless of the property's value, and
the tax authority commits to issuing it within 35 days of a complete
application. Minimum values apply: €174,274 for a flat or maisonette and
€300,619 for anything else, both index-linked and revised annually.

Three conditions attach, and the second is the one people discover late. The
property may be used solely as the residence of the buyer and their family and
for no other purpose — so it may not be let out at all, and the penalty runs
to €23,000 or double the market value, whichever is greater, with a daily
charge after a 180-day grace period. The purchase must complete within six
months of the permit. And a non-resident may hold only one property.

All of that falls away inside a Special Designated Area, where no permit is
needed and there is no limit on the number of properties. There are 27 of
them, among them Portomaso and its extensions, Tigné Point and Manoel Island,
Fort Cambridge, SmartCity, Fort Chambray and Kempinski Residences on Gozo,
Madliena Village, Mistra Heights, Tas-Sellum, Verdala Terraces, Trident Park
and Eden Place, added in January 2026. The list is extended by legal notice
from time to time, so it is worth reading the current schedule rather than an
article about it.
`,
    transactionCosts: `
Duty on documents is 5% of the consideration or the value, whichever is
higher. One fifth of it — 1% of the value — is paid on registering the promise
of sale, and the remaining 4% falls due on the final deed. The notary must
register the promise within 21 days of signature.

Now the part that decides a foreign buyer's arithmetic: none of Malta's
reduced rates are available to them. The 3.5% rate on the first €200,000 for a
sole ordinary residence carries an express proviso excluding anyone who would
have required a ministerial permit had the property not been in a Special
Designated Area. The test is counterfactual, so buying inside an SDA does not
rescue it. The first-time-buyer exemption is keyed to that same provision and
falls with it, and the €750,000 relief for vacant property, urban conservation
areas and traditional features carries a parallel exclusion of its own.

The Gozo reduced rate and the old urban conservation rate have both expired,
in January 2024 and January 2022.

So a buyer who needs a permit pays a flat 5%, and the only foreign buyers who
reach a lower rate are EU nationals resident on Malta for five years or more.

Notarial fees are not published in a form we could retrieve — the statutory
tariff schedule was not available. In practice the market quotes 1% to 2.5%
plus searches and registration, and an architect's inspection. Agency
commission of 5% plus VAT is paid by the seller by custom; no legal source
fixes either the rate or the payer.
`,
    steps: `
The promise of sale — the konvenju — is the binding step. It is registered
with the tax authority within 21 days, with the 1% provisional duty paid at
that point, and a copy of it accompanies the AIP application.

The Civil Code sets no default duration: the promise binds for the period the
parties agree. Three to six months is the market norm rather than a rule, and
no government source states a deposit percentage — the customary 10% is
practice.

The notary carries out the title searches. Where a permit is needed, the
application runs in parallel with the konvenju period, so the konvenju term,
not the permit, is normally the binding constraint: 35 days of committed
processing sits comfortably inside three months. The permit's own deadline is
at the other end — the acquisition must be effected within six months of its
issue.

At the final deed the permit is attached and the balance of the duty is paid.
A certified copy of the deed has to reach the commissioner within three months
of publication.
`,
    annualCosts: `
Malta levies no annual property tax. That is a conclusion from the revenue
authority's own index of property taxes, every item on which is
transaction-based, rather than a statement the government publishes — no
country publishes what it does not charge.

What can be recurring is ground rent, and it depends on the title. Under
freehold nothing is owed. Under emphyteusis the holder pays an annual ċens to
the direct owner; perpetual ċens runs indefinitely, temporary ċens for a fixed
term after which the property reverts unless the rent is redeemed. Redeeming
it does not require an AIP permit — that is an express exception in the Act.
Typical amounts and the redemption multiplier are not published.

Rental income has an optional final withholding tax of 15%. It is charged on
the gross rent with no deductions, no set-off and no refund, it is available
to non-residents, and it is elected year by year on a return due by 30 April.

Two limits on it are worth knowing. It does not reach short lets: the revenue
authority treats long lets as investment income and short lets as trading
income, taxed under the ordinary rules. And it is not available where the
tenant is a related party.

The alternative is to declare net income and pay at the non-resident rates,
where 35% begins at €7,801 — which is why the flat 15% almost always wins on a
long let. Income never declared and later found is taxed at 35% with penalties
and interest.
`,
    shortLet: `
Read the previous sections first: if the property was bought on an AIP permit,
it may not be let at all, and nothing in this section applies to it. Short
letting is realistically open only to a foreign owner who bought inside a
Special Designated Area or who did not need a permit.

For everyone else the framework was rewritten in 2026. The Tourism
Accommodation Regulations 2026, published in June, consolidated five earlier
instruments into one, with parts phased in over up to two years. Private
accommodation now falls into two categories: short-let rented accommodation,
and resident-host accommodation where the host lives in the property.

The applicant must be the proprietor in title — owner, authorised agent,
lessee or another lawful holder — must be a fit and proper person with a clean
police conduct certificate, and must name a person reachable around the clock.
Nothing in the regulations conditions this on residence or nationality.

The operating rules are specific: at most two people per approved bedroom and
ten per unit; no single booking longer than 90 consecutive days; no bedrooms
below ground; an external sign with the licence number and a 24-hour contact;
notice to the condominium administrator; a waste management plan. New
properties need bedrooms of at least 9 square metres and air conditioning;
existing ones have until 15 June 2028 to fit it.

The authority has 60 days to determine an application, suspended while
documents are outstanding, and a new licensing system opened on 19 August
2026. The licence fee in euro is not published on any page we could reach —
both official pages defer to a subsidiary instrument that would not open.

Operating without a licence disqualifies both the applicant and the property
for three years: the property itself cannot be licensed during that period.

Since 1 July 2026 an eco-contribution of €1.50 per night applies to each guest
aged 18 or over, capped at €22.50 per person per visit.
`,
    residencyLink: `
Malta's residence programme is not really a property play, and the numbers say
so: €375,000 for a qualifying purchase against €60,000 of administrative fee
and a €37,000 contribution. The property is a condition, not the investment.

The alternative to buying is renting: a qualifying lease of at least €14,000 a
year. The contribution is now the same either way, which removed the old
premium on renting.

The property — or the lease — must be held for five years from the appointed
day, and the obligation does not end there: the beneficiary must continue to
maintain a residential property on Malta afterwards.

The regional discount is gone. Lower thresholds for the south of Malta and for
Gozo were deleted with effect from 1 January 2025, and the definition of
"south of Malta" was removed from the regulations altogether. Guidance quoting
€300,000 for Gozo describes a regime that no longer exists.

One interaction no official source addresses: an applicant buying at €375,000
outside a Special Designated Area is still a non-resident who needs an AIP
permit, and the permit's conditions — own residence only, no letting, one
property — bind independently of the residence programme. The two regimes are
written as if the other did not exist.
`,
  },
  ru: {
    whoMayBuy: `
Мальта начинает с запрета. По главе 246 нерезидент вообще не может
приобретать недвижимость, а приобретение в нарушение этого «ничтожно и не имеет
силы для всех целей права». Всё, что делает здесь иностранный покупатель,
происходит внутри исключения.

Исключение — разрешение AIP, которое выдаёт министр. Покупателю из страны вне
ЕС оно нужно на каждое приобретение, кроме наследования и покупки в особой
зоне. Стоит оно €233 независимо от стоимости объекта, и налоговая служба
обязуется выдать его в течение 35 дней при полном комплекте документов.
Действуют минимальные цены: €174 274 за квартиру или мезонет и €300 619 за
всё остальное; обе величины привязаны к индексу и ежегодно пересматриваются.

Условий три, и о втором узнают поздно. Объект можно использовать
исключительно как жильё покупателя и его семьи и ни для чего другого — то есть
сдавать его нельзя вовсе, а санкция доходит до €23 000 либо двойной рыночной
стоимости, что больше, плюс ежедневный платёж после 180 дней отсрочки. Покупка
должна состояться в течение шести месяцев с выдачи разрешения. И нерезидент
может держать только один объект.

Всё это отпадает внутри особой зоны, где разрешение не нужно, а число объектов
не ограничено. Таких зон 27, среди них Portomaso и его расширения, Tigné Point
и Manoel Island, Fort Cambridge, SmartCity, Fort Chambray и Kempinski
Residences на Гозо, Madliena Village, Mistra Heights, Tas-Sellum, Verdala
Terraces, Trident Park и Eden Place, добавленная в январе 2026 года. Список
время от времени расширяется правовым уведомлением, поэтому читать стоит
действующее приложение к закону, а не статью о нём.
`,
    transactionCosts: `
Гербовый сбор — 5% от цены или стоимости, что выше. Пятая его часть, то есть 1%
от стоимости, платится при регистрации предварительного договора, остальные 4%
— на финальном акте. Нотариус обязан зарегистрировать предварительный договор в
течение 21 дня с подписания.

И теперь то, что определяет всю арифметику иностранца: ни одна из мальтийских
пониженных ставок ему недоступна. Ставка 3,5% на первые €200 000 для
единственного обычного жилья содержит прямую оговорку, исключающую любого, кому
потребовалось бы разрешение министра, не находись объект в особой зоне.
Критерий контрфактический, поэтому покупка в особой зоне не спасает.
Освобождение для покупателя первого жилья привязано к той же норме и падает
вместе с ней, а льгота на €750 000 по пустующим объектам, зонам охраны
застройки и традиционным элементам содержит собственное параллельное
исключение.

Скидка по Гозо и прежняя ставка в зонах охраны застройки истекли — в январе
2024 и в январе 2022 года.

То есть покупатель, которому нужно разрешение, платит ровно 5%, а из
иностранцев на пониженную ставку выходят только граждане ЕС, прожившие на
Мальте пять лет и дольше.

Нотариальный тариф получить в доступном виде не удалось — приложение к закону
не открывается. На рынке называют от 1% до 2,5% плюс поиски и регистрацию и
осмотр архитектора. Комиссия агентства в 5% плюс НДС по обычаю платится
продавцом; ни ставку, ни плательщика не задаёт ни один правовой источник.
`,
    steps: `
Предварительный договор — konvenju — связывающий шаг. Он регистрируется в
налоговой службе в течение 21 дня, тогда же платится 1% предварительного
сбора, и его копия прикладывается к заявлению на разрешение.

Гражданский кодекс срока действия не задаёт: договор связывает на тот срок, о
котором договорились стороны. Три-шесть месяцев — рыночная норма, а не
правило, и размер задатка не называет ни один государственный источник:
привычные 10% — практика.

Проверку титула проводит нотариус. Там, где нужно разрешение, заявление идёт
параллельно сроку konvenju, поэтому ограничителем обычно служит сам konvenju, а
не разрешение: 35 дней заявленной обработки спокойно помещаются в три месяца.
Собственный срок разрешения — с другой стороны: покупка должна состояться в
течение шести месяцев с его выдачи.

На финальном акте разрешение прикладывается, остаток сбора уплачивается.
Заверенная копия акта должна попасть к комиссару в течение трёх месяцев с
публикации.
`,
    annualCosts: `
Ежегодного налога на недвижимость на Мальте нет. Это вывод из перечня
имущественных налогов самой налоговой службы, где все позиции транзакционные,
а не заявление государства: ни одна страна не публикует того, чего не берёт.

Регулярным платежом может быть земельная рента, и зависит это от вида титула.
При полной собственности не должно ничего. При эмфитевзисе держатель платит
ежегодный ċens прямому собственнику; вечный ċens идёт бессрочно, временный — до
конца срока, после которого объект возвращается, если рента не выкуплена. Выкуп
ренты разрешения AIP не требует — это прямое изъятие в законе. Типовые размеры
и множитель выкупа не публикуются.

Для дохода от аренды есть необязательный окончательный налог 15%. Он берётся с
валовой платы, без вычетов, зачётов и возврата, доступен нерезидентам и
выбирается ежегодно декларацией со сроком до 30 апреля.

Два ограничения стоит знать. Он не распространяется на короткую сдачу:
налоговая служба считает долгую аренду инвестиционным доходом, а короткую —
торговым, облагаемым по обычным правилам. И он недоступен, если арендатор —
связанное лицо.

Альтернатива — декларировать чистый доход и платить по ставкам для
нерезидентов, где 35% начинаются уже с €7 801; именно поэтому единые 15% почти
всегда выгоднее на долгой сдаче. Незадекларированный и позднее обнаруженный
доход облагается по 35% со штрафами и процентами.
`,
    shortLet: `
Сначала прочитайте предыдущие разделы: если объект куплен по разрешению AIP,
сдавать его нельзя вовсе, и ничто в этом разделе к нему не относится. Короткая
сдача реально доступна иностранцу только при покупке в особой зоне либо когда
разрешение не требовалось.

Для всех остальных рамка переписана в 2026 году. Tourism Accommodation
Regulations 2026, опубликованные в июне, свели пять прежних актов в один, часть
положений вводится поэтапно до двух лет. Частное размещение теперь делится на
две категории: краткосрочная сдача и размещение у проживающего хозяина.

Заявитель должен быть правообладателем — собственником, уполномоченным агентом,
арендатором или иным законным держателем прав, — быть добропорядочным лицом со
справкой о несудимости и назвать человека, доступного круглосуточно. Ни
резидентства, ни гражданства регламент не требует.

Правила эксплуатации конкретные: не более двух человек на утверждённую спальню
и десяти на объект; ни одно бронирование не длиннее 90 суток подряд; спален
ниже уровня земли быть не должно; наружная табличка с номером лицензии и
круглосуточным контактом; уведомление управляющего кондоминиума; план
обращения с отходами. Новым объектам нужны спальни от 9 квадратных метров и
кондиционирование; у существующих есть срок до 15 июня 2028 года.

На рассмотрение заявления у органа 60 дней, приостанавливаемых на время
запросов, а новая система приёма заявлений открылась 19 августа 2026 года.
Размер лицензионного сбора в евро не опубликован ни на одной доступной нам
странице: обе официальные отсылают к подзаконному акту, который не
открывается.

Работа без лицензии дисквалифицирует и заявителя, и объект на три года: сам
объект в этот период лицензию получить не может.

С 1 июля 2026 года действует эко-сбор €1,50 за ночь с каждого гостя от 18 лет,
не более €22,50 с человека за визит.
`,
    residencyLink: `
Программа резидентства Мальты — на самом деле не про недвижимость, и цифры об
этом говорят: €375 000 за квалифицирующую покупку против €60 000
административного сбора и взноса €37 000. Объект здесь условие, а не
инвестиция.

Альтернатива покупке — аренда: квалифицирующий договор не менее чем на €14 000
в год. Взнос теперь одинаковый в обоих случаях, и прежняя надбавка за аренду
исчезла.

Объект — или договор аренды — нужно держать пять лет с назначенного дня, и
обязанность на этом не заканчивается: бенефициар должен и дальше поддерживать
жильё на Мальте.

Региональной скидки больше нет. Пониженные пороги для юга Мальты и для Гозо
удалены с 1 января 2025 года, а само определение «юг Мальты» из регламента
убрано. Гиды, называющие €300 000 для Гозо, описывают режим, которого не
существует.

Одно взаимодействие ни один официальный источник не разбирает: заявитель,
покупающий за €375 000 вне особой зоны, остаётся нерезидентом, которому нужно
разрешение AIP, и условия разрешения — только собственное жильё, сдавать
нельзя, один объект — действуют независимо от программы резидентства. Два
режима написаны так, будто другого не существует.
`,
  },
  pl: {
    whoMayBuy: `
Malta zaczyna od zakazu. Zgodnie z rozdziałem 246 nierezydent w ogóle nie może
nabywać nieruchomości, a nabycie dokonane wbrew temu jest „nieważne i
bezskuteczne dla wszystkich celów prawa". Wszystko, co robi tu cudzoziemiec,
dzieje się wewnątrz wyjątku.

Wyjątkiem jest zezwolenie AIP wydawane przez ministra. Kupujący spoza UE
potrzebuje go na każde nabycie poza dziedziczeniem i zakupem w strefie
specjalnej. Kosztuje €233 niezależnie od wartości nieruchomości, a urząd
zobowiązuje się wydać je w ciągu 35 dni przy kompletnym wniosku. Obowiązują
ceny minimalne: €174 274 za mieszkanie lub maisonette i €300 619 za wszystko
inne; obie kwoty są indeksowane i corocznie aktualizowane.

Warunki są trzy, a o drugim ludzie dowiadują się późno. Nieruchomość może
służyć wyłącznie jako mieszkanie kupującego i jego rodziny i do niczego innego
— czyli nie wolno jej wynajmować, a sankcja sięga €23 000 albo podwójnej
wartości rynkowej, zależnie co większe, plus opłata dzienna po 180 dniach
karencji. Zakup musi dojść do skutku w ciągu sześciu miesięcy od wydania
zezwolenia. A nierezydent może mieć tylko jedną nieruchomość.

Wszystko to znika wewnątrz strefy specjalnej, gdzie zezwolenie nie jest
potrzebne, a liczba nieruchomości nieograniczona. Stref jest 27, wśród nich
Portomaso i jego rozszerzenia, Tigné Point i Manoel Island, Fort Cambridge,
SmartCity, Fort Chambray i Kempinski Residences na Gozo, Madliena Village,
Mistra Heights, Tas-Sellum, Verdala Terraces, Trident Park oraz Eden Place
dodana w styczniu 2026. Lista bywa rozszerzana rozporządzeniem, więc warto
czytać obowiązujący załącznik do ustawy, a nie artykuł o nim.
`,
    transactionCosts: `
Opłata skarbowa wynosi 5% ceny albo wartości, zależnie co wyższe. Jedna piąta,
czyli 1% wartości, płatna jest przy rejestracji umowy przedwstępnej, pozostałe
4% przy akcie końcowym. Notariusz musi zarejestrować umowę przedwstępną w
ciągu 21 dni od podpisania.

I teraz to, co przesądza arytmetykę cudzoziemca: żadna z maltańskich obniżonych
stawek nie jest dla niego dostępna. Stawka 3,5% od pierwszych €200 000 dla
jedynego zwykłego mieszkania zawiera wyraźne zastrzeżenie wyłączające każdego,
kto potrzebowałby zezwolenia ministra, gdyby nieruchomość nie leżała w strefie
specjalnej. Kryterium jest kontrfaktyczne, więc zakup w strefie specjalnej nie
ratuje sytuacji. Zwolnienie dla kupującego pierwsze mieszkanie jest powiązane z
tym samym przepisem i upada razem z nim, a ulga €750 000 dla pustostanów, stref
ochrony zabudowy i elementów tradycyjnych zawiera własne, równoległe
wyłączenie.

Obniżka dla Gozo i dawna stawka w strefach ochrony zabudowy wygasły — w
styczniu 2024 i w styczniu 2022.

Kupujący, który potrzebuje zezwolenia, płaci więc równe 5%, a z cudzoziemców na
niższą stawkę wychodzą tylko obywatele UE mieszkający na Malcie od pięciu lat.

Taryfy notarialnej nie udało się pozyskać — załącznik do ustawy się nie
otwiera. Rynek podaje od 1% do 2,5% plus wyszukiwania i wpisy oraz oględziny
architekta. Prowizję agencji 5% plus VAT zwyczajowo płaci sprzedający; ani
stawki, ani płatnika nie ustala żadne źródło prawne.
`,
    steps: `
Umowa przedwstępna — konvenju — jest krokiem wiążącym. Rejestruje się ją w
urzędzie skarbowym w ciągu 21 dni, wtedy płaci się 1% opłaty wstępnej, a jej
kopia trafia do wniosku o zezwolenie.

Kodeks cywilny nie ustala okresu domyślnego: umowa wiąże na czas uzgodniony
przez strony. Trzy do sześciu miesięcy to norma rynkowa, nie przepis, a
wysokości zadatku nie podaje żadne źródło rządowe — zwyczajowe 10% to praktyka.

Badanie tytułu przeprowadza notariusz. Tam, gdzie potrzebne jest zezwolenie,
wniosek biegnie równolegle do okresu konvenju, więc ogranicza zwykle sam
konvenju, a nie zezwolenie: 35 dni deklarowanego rozpatrzenia mieści się
spokojnie w trzech miesiącach. Własny termin zezwolenia jest po drugiej
stronie — zakup musi dojść do skutku w ciągu sześciu miesięcy od jego wydania.

Przy akcie końcowym dołącza się zezwolenie i płaci resztę opłaty. Uwierzytelniona
kopia aktu musi trafić do komisarza w ciągu trzech miesięcy od publikacji.
`,
    annualCosts: `
Malta nie pobiera rocznego podatku od nieruchomości. To wniosek z wykazu
podatków od nieruchomości prowadzonego przez sam urząd skarbowy, gdzie każda
pozycja jest transakcyjna, a nie oświadczenie państwa: żaden kraj nie publikuje
tego, czego nie pobiera.

Płatnością cykliczną bywa czynsz gruntowy i zależy to od rodzaju tytułu. Przy
pełnej własności nie należy się nic. Przy emfiteuzie posiadacz płaci roczny
ċens właścicielowi bezpośredniemu; ċens wieczysty biegnie bezterminowo,
czasowy do końca okresu, po którym nieruchomość wraca, o ile czynszu nie
wykupiono. Wykup nie wymaga zezwolenia AIP — to wyraźny wyjątek w ustawie.
Typowych kwot i mnożnika wykupu się nie publikuje.

Dla dochodu z najmu istnieje opcjonalny podatek ostateczny 15%. Pobierany jest
od czynszu brutto, bez odliczeń, potrąceń i zwrotów, dostępny dla
nierezydentów i wybierany corocznie deklaracją do 30 kwietnia.

Warto znać dwa ograniczenia. Nie obejmuje najmu krótkoterminowego: urząd
traktuje najem długi jako dochód inwestycyjny, a krótki jako dochód z
działalności, opodatkowany na zasadach ogólnych. I nie jest dostępny, gdy
najemcą jest podmiot powiązany.

Alternatywą jest deklarowanie dochodu netto i stawki dla nierezydentów, gdzie
35% zaczyna się już od €7 801 — dlatego jednolite 15% niemal zawsze wygrywa
przy najmie długim. Dochód niezadeklarowany i później wykryty opodatkowany
jest stawką 35% z karami i odsetkami.
`,
    shortLet: `
Najpierw poprzednie sekcje: jeśli nieruchomość kupiono na zezwoleniu AIP, nie
wolno jej wynajmować w ogóle i nic z tej sekcji jej nie dotyczy. Najem krótki
jest realnie dostępny cudzoziemcowi tylko przy zakupie w strefie specjalnej
albo gdy zezwolenie nie było potrzebne.

Dla pozostałych ramy przepisano w 2026 roku. Tourism Accommodation Regulations
2026, opublikowane w czerwcu, scaliły pięć wcześniejszych aktów w jeden, część
przepisów wchodzi etapami przez dwa lata. Zakwaterowanie prywatne dzieli się
teraz na dwie kategorie: najem krótkoterminowy oraz zakwaterowanie u
mieszkającego gospodarza.

Wnioskodawcą musi być uprawniony z tytułu — właściciel, upoważniony agent,
najemca lub inny legalny posiadacz praw — musi być osobą właściwą z
zaświadczeniem o niekaralności i wskazać osobę osiągalną całą dobę. Regulamin
nie stawia warunku rezydencji ani obywatelstwa.

Zasady eksploatacji są konkretne: najwyżej dwie osoby na zatwierdzoną sypialnię
i dziesięć na lokal; żadna rezerwacja dłuższa niż 90 kolejnych dni; bez
sypialni poniżej poziomu gruntu; zewnętrzna tabliczka z numerem licencji i
kontaktem całodobowym; zawiadomienie zarządcy wspólnoty; plan gospodarki
odpadami. Nowe nieruchomości wymagają sypialni od 9 metrów kwadratowych i
klimatyzacji; istniejące mają czas do 15 czerwca 2028.

Organ ma 60 dni na rozpatrzenie wniosku, zawieszane na czas uzupełnień, a nowy
system przyjmowania wniosków ruszył 19 sierpnia 2026. Wysokości opłaty
licencyjnej w euro nie podaje żadna dostępna nam strona: obie oficjalne
odsyłają do aktu wykonawczego, który się nie otwiera.

Działalność bez licencji dyskwalifikuje i wnioskodawcę, i nieruchomość na trzy
lata: sama nieruchomość nie może w tym czasie uzyskać licencji.

Od 1 lipca 2026 obowiązuje eko-opłata €1,50 za noc od każdego gościa powyżej
18 lat, nie więcej niż €22,50 od osoby za pobyt.
`,
    residencyLink: `
Maltański program rezydencji tak naprawdę nie dotyczy nieruchomości, a liczby
to potwierdzają: €375 000 za kwalifikujący zakup wobec €60 000 opłaty
administracyjnej i €37 000 wkładu. Nieruchomość jest tu warunkiem, nie
inwestycją.

Alternatywą dla zakupu jest najem: kwalifikująca umowa na co najmniej €14 000
rocznie. Wkład jest teraz taki sam w obu wariantach, dawna dopłata za najem
zniknęła.

Nieruchomość — albo umowę najmu — trzeba utrzymać przez pięć lat od dnia
wyznaczonego, a obowiązek na tym się nie kończy: beneficjent musi nadal
utrzymywać mieszkanie na Malcie.

Obniżki regionalnej już nie ma. Niższe progi dla południa Malty i dla Gozo
usunięto ze skutkiem od 1 stycznia 2025, a samą definicję „południa Malty"
wykreślono z rozporządzenia. Poradniki podające €300 000 dla Gozo opisują
reżim, który nie istnieje.

Jednego powiązania nie omawia żadne oficjalne źródło: wnioskodawca kupujący za
€375 000 poza strefą specjalną pozostaje nierezydentem potrzebującym zezwolenia
AIP, a warunki zezwolenia — wyłącznie własne mieszkanie, zakaz najmu, jedna
nieruchomość — obowiązują niezależnie od programu rezydencji. Oba reżimy
napisano tak, jakby drugi nie istniał.
`,
  },
};

// --- UAE (Dubai) -------------------------------------------------------------

const AE: Record<Locale, Sections> = {
  en: {
    whoMayBuy: `
A foreigner may own property in Dubai outright, but only in areas the Ruler
has designated. Dubai Law No. 7 of 2006 draws the line between UAE and GCC
nationals, who may own anywhere, and everyone else, who may hold freehold
without any time limit — or a usufruct or lease of up to 99 years — in
designated areas only. No particular nationality is excluded.

The designated areas are set by a 2006 regulation that lists them by cadastral
plot number, not by the names used in marketing, and the list has been
extended by later decisions. We could not find a single consolidated official
list current as of August 2026, and the reliable answer for a specific
property is the Land Department's own property status enquiry. Treat a
brochure's claim that a district is freehold as a starting point for that
check, not as the answer.

The zone map does move. In January 2025 the Land Department opened freehold
conversion to 457 previously leasehold plots on Sheikh Zayed Road and in Al
Jaddaf, at a conversion charge of 30% of the valuation.

A foreign company may not own Dubai property directly; it holds through a
subsidiary in a free zone. There is no age limit on ownership.

Abu Dhabi is a different regime and the words do not mean the same thing.
There a foreigner may own apartments and floors but not land, in nine
investment zones, and what the official portal describes is a 99-year
ownership deed over the unit rather than the perpetual freehold Dubai grants.
`,
    transactionCosts: `
The registration fee is 4% of the contract value, and the law splits it
equally between seller and buyer unless they agree otherwise. The Land
Department's own page states it as 2% each. That the buyer customarily pays
the whole 4% is market convention operating through the "unless agreed
otherwise" clause — worth budgeting for, and negotiable in principle.

The administrative fees are small and fixed: AED 250 for the title deed, AED
250 for villas and apartments, AED 225 for the municipality map, plus AED 10
each for the knowledge and innovation fees.

The registration trustee office charges AED 4,000 plus VAT where the value is
AED 500,000 or more, and AED 2,000 plus VAT below that — AED 4,200 and AED
2,100 with the 5% VAT included.

A mortgage adds 0.25% of the loan for registration, AED 250 for the deed, and
a trustee fee of AED 4,000 plus VAT, rising to AED 5,000 on an off-plan unit.

The developer's no-objection certificate is required for a transfer in a
freehold area. The only official figure for it is AED 500, and in practice the
large developers charge considerably more, sometimes with a refundable service
charge deposit. Ask the specific developer rather than budgeting from the
published number.

The Land Department does not fix agency commission: it is what the agreement
says, or the prevailing custom where the agreement is silent. The familiar 2%
plus VAT is that custom, not a rule. The Department's own advice is narrower
and more useful — do not deal with a broker who is not registered with the
regulator.

No VAT is charged on the price of a home: residential property is exempt, and
the first supply within three years of completion is zero-rated. VAT appears
only on the services — the trustee fee, the commission, the conveyancing.
`,
    steps: `
The contract is the Land Department's standard Form F, created by the broker
in the Department's own system. Before signing, the Department advises legal
due diligence and, on a completed property, an inspection.

Where there is no owners association, a no-objection certificate from the
developer is required.

There is one hard deadline and it is generous: a transaction must be
registered within 60 days of the date the contract was signed.

Physical presence is not required. The owner attends the registrar in person
or through a representative acting under a notarised power of attorney.

The transfer itself is fast. The Land Department publishes a service time of
25 minutes at a registration trustee office, 15 to 20 minutes where a mortgage
is being released, and 20 to 25 minutes to register a mortgage. The title deed
is issued at that appointment: the transfer and the deed are one event, not
two steps.

What actually sets the calendar is the developer's no-objection certificate
and, if the purchase is financed, the bank's offer. No official source
publishes an end-to-end duration, and the 60-day registration deadline is the
only published limit.

Neither a residency permit nor a UAE bank account is needed to buy. The
required-documents list expressly provides for a valid passport in place of an
Emirates ID for non-resident foreigners. In practice the price moves by
manager's cheque drawn on a local bank, which a conveyancer can arrange; a
mortgage is the case where a personal account becomes necessary.

Buying off-plan adds its own checks, and the Land Department publishes them:
is the project registered with the regulator, is there an escrow account and
who is the escrow agent, what is the percentage of completion, is the
developer registered, does it hold the permit to sell off-plan.
`,
    annualCosts: `
There is no annual property tax on individuals in the UAE. No official page
states that as a proposition — governments do not publish what they do not
levy — but the federal tax authority administers only VAT, excise and
corporate tax, and Dubai's fee schedule contains transaction fees and nothing
recurring.

The housing fee is 5% of the annual rent, divided across twelve monthly
instalments and collected on the utility bill. Whether an owner living in
their own property pays it is the one thing in this section we could not
settle: neither the utility's bill explanation nor the government portal
addresses owner-occupiers, and the municipality's own fee portal is closed to
automated access. It is material — 5% of an imputed market rent, every year —
so confirm it directly before modelling.

Service charges are the real recurring cost, and the law puts a floor under
how they are set. An owner owes their share to the management entity and may
not withhold charges approved by the regulator, but the management entity may
not levy anything without that approval, following prescribed standards and
audited accounts. The money sits in a dedicated account per building.

Approved charges are public: the Land Department publishes a service charge
index, searchable per project, open to anyone regardless of residency. Check
the figure for the specific building before buying — this is the number that
varies most and the one a brochure is least likely to mention. Arrears follow
the property, so confirm the seller is paid up, and an owner who lets remains
liable if the tenant does not pay.

The utility deposit is AED 2,000 for an apartment and AED 4,000 for a villa,
refunded to an owner only on sale, with a one-off activation charge of about
AED 155.

Rental income of an individual is outside corporate tax. The tax authority
treats letting personally owned property as real estate investment, excludes
the gross income from corporate tax, and excludes it from the turnover test as
well — so it cannot push an individual over the registration threshold. There
is no personal income tax. The exception is the subject of the next section.
`,
    shortLet: `
An individual owner may operate a holiday home in Dubai directly. The tourism
department runs two applicant categories — owners registering their own units,
and company operators — and only the second needs a trade licence. A tenant,
not only an owner, may apply, which is the legal basis of the sublet market.

A permit is valid for one year and renewable on the same conditions.

The fees do not reconcile. The 2014 statutory schedule sets AED 300 per
bedroom, capped at AED 1,200 per property per year. The department's current
operational schedule shows an initial permit of AED 1,570 plus AED 370 per
unit. The two are not the same instrument and the department's own arithmetic
does not add up either, so treat its figures as the working ones and confirm
before budgeting.

The tourism dirham is charged per room per night: AED 15 for a luxury holiday
home, AED 10 for a standard one. The regulation sets no cap on the number of
nights, despite a widely quoted 30-night limit that does not appear in it.

Documents include the owner's passport or ID, the title deed, an authorisation
on the department's form, and a utility bill for the unit no less than three
months old. A comprehensive insurance policy from a locally licensed insurer
is an ongoing obligation, as is supplying guest data.

Operating without a licence carries AED 5,000, false information AED 5,000,
and operating during a suspension AED 20,000, with repeat violations within a
year doubling up to AED 100,000.

Can the building stop you? The tourism department issues a permit without the
building's consent, and the jointly-owned property law does not address short
letting directly. But an owner lets subject to the community's constitutional
documents, and occupants must comply with the master community declaration and
the building management regulation. A declaration can therefore restrict or
prohibit holiday-home use, and a permit does not override it. Read the
declaration for the specific project before buying with short letting in mind.

And the cost nobody mentions: a permit makes the activity licensed, which
takes it outside the real estate investment exclusion. Income that was outside
corporate tax becomes business income that is not, with registration required
once business turnover passes AED 1,000,000 in a calendar year and 9% applying
above AED 375,000 of taxable income.
`,
    residencyLink: `
Property is a live route to residency here, and the terms are the most
permissive on this site.

The threshold is AED 2,000,000, and several properties may be combined to
reach it — the resolution says "one or more real estate with a total value of
not less than" that figure, and both the Land Department and the immigration
authority repeat it. Where ownership is a share, the share itself must reach
AED 2,000,000.

The permit runs for ten years and is renewable. Two official pages still say
five years for property investors, which is residue from the pre-2022 regime;
the governing resolution, the immigration authority's service page and the
Land Department's fee schedule all say ten.

A mortgage is permitted, provided the loan is from a local bank on the
approved list — a deliberate contrast with the non-property investment routes,
where the capital may not be borrowed. But Dubai's implementation is stricter
than the federal rule: the Land Department asks for a bank letter showing AED
2,000,000 actually paid, which is equity rather than value. Verify this for a
financed purchase before relying on it.

A lien is registered on the property to keep ownership continuous for the
life of the permit. Selling the qualifying property and keeping the visa is
not possible.

Off-plan is where the sources diverge. Federal law expressly allows it —
buying off plan to a total of AED 2,000,000 from developers approved by the
competent local authority. Dubai's documents pull the other way: the Land
Department requires a title deed, which an off-plan unit does not have until
handover, and the immigration authority's separate property-owner visa
requires the property to be entirely constructed and habitable. Three official
Dubai sources point in different directions. Confirm with the Land Department
before relying on off-plan for a visa.

Comprehensive health insurance is required throughout. The government fees
come to AED 9,884.75 for the investor — medical, Emirates ID, residency
confirmation, Land Department and administrative — with AED 5,774.50 for each
sponsored family member.
`,
  },
  ru: {
    whoMayBuy: `
Иностранец может владеть недвижимостью в Дубае полностью, но только в зонах,
которые определил правитель. Закон Дубая № 7 от 2006 года проводит границу
между гражданами ОАЭ и стран Залива, которые владеют где угодно, и всеми
остальными, которые получают полную собственность без ограничения по сроку —
либо узуфрукт или аренду до 99 лет — исключительно в отведённых зонах.
Отдельные национальности не исключены.

Зоны заданы регламентом 2006 года, где они перечислены кадастровыми номерами
участков, а не маркетинговыми названиями, и с тех пор список расширялся
последующими решениями. Единого сводного официального перечня, актуального на
август 2026 года, найти не удалось, и надёжный ответ по конкретному объекту
даёт сервис проверки статуса объекта у Земельного департамента. Утверждение
брошюры, что район относится к фрихолду, — повод для такой проверки, а не сам
ответ.

Карта зон меняется. В январе 2025 года департамент открыл конверсию в полную
собственность для 457 ранее арендных участков на шейх-Зайед-роуд и в
Аль-Джаддаф, с платой 30% от оценки.

Иностранная компания напрямую владеть недвижимостью в Дубае не может — только
через дочернюю структуру в свободной зоне. Возрастных ограничений нет.

Абу-Даби — другой режим, и слова там значат другое. Иностранец владеет
квартирами и этажами, но не землёй, в девяти инвестиционных зонах, и то, что
описывает официальный портал, — это документ о собственности на 99 лет на
единицу жилья, а не бессрочная полная собственность, которую даёт Дубай.
`,
    transactionCosts: `
Регистрационный сбор — 4% от стоимости договора, и закон делит его поровну
между продавцом и покупателем, если стороны не договорились иначе. Земельный
департамент на своей странице пишет прямо: по 2% с каждого. То, что покупатель
обычно платит все 4%, — рыночный обычай, работающий через оговорку «если не
договорились иначе»: закладывать стоит, торговаться можно.

Административные сборы небольшие и фиксированные: 250 дирхамов за свидетельство
о собственности, 250 за администрирование по виллам и квартирам, 225 за единую
карту муниципалитета плюс по 10 за сборы знаний и инноваций.

Офис-регистратор берёт 4 000 дирхамов плюс НДС при стоимости от 500 000 и
2 000 плюс НДС ниже — то есть 4 200 и 2 100 с учётом НДС 5%.

Ипотека добавляет 0,25% от суммы кредита за регистрацию, 250 дирхамов за
свидетельство и сбор регистратора 4 000 плюс НДС, а по строящемуся объекту
5 000.

Для передачи в зоне фрихолда нужен сертификат об отсутствии возражений от
застройщика. Единственная официальная цифра по нему — 500 дирхамов, а на
практике крупные застройщики берут заметно больше, иногда с возвратным
депозитом по эксплуатационным сборам. Спрашивать нужно конкретного застройщика,
а не считать по опубликованной величине.

Комиссию агента департамент не устанавливает: она такая, как записано в
соглашении, а при молчании соглашения — по обычаю. Привычные 2% плюс НДС — это
и есть обычай, а не норма. Собственный совет департамента уже конкретнее: не
иметь дела с брокером, не зарегистрированным у регулятора.

НДС на саму цену жилья не начисляется: жилая недвижимость освобождена, а первая
поставка в течение трёх лет после ввода облагается по нулевой ставке. НДС
появляется только на услугах — сбор регистратора, комиссия, сопровождение.
`,
    steps: `
Договор — стандартная Form F Земельного департамента, создаётся брокером в
системе самого департамента. До подписания департамент советует юридическую
проверку, а по готовому объекту — осмотр.

Там, где нет ассоциации собственников, нужен сертификат об отсутствии
возражений от застройщика.

Жёсткий срок здесь один, и он щедрый: сделку нужно зарегистрировать в течение
60 дней с даты подписания договора.

Личное присутствие не требуется. Собственник является к регистратору сам либо
через представителя по нотариальной доверенности.

Сама передача быстрая. Департамент публикует время обслуживания: 25 минут в
офисе регистратора, 15–20 минут при снятии залога, 20–25 минут на регистрацию
ипотеки. Свидетельство выдаётся на той же встрече — передача и документ
представляют собой одно событие, а не два шага.

Календарь на деле определяют сертификат застройщика и, при ипотеке, одобрение
банка. Сквозного срока не публикует ни один официальный источник, и
единственный опубликованный предел — те самые 60 дней на регистрацию.

Ни вида на жительство, ни счёта в банке ОАЭ для покупки не нужно. В перечне
документов прямо предусмотрен действующий паспорт вместо Emirates ID для
иностранцев-нерезидентов. На практике цена уходит менеджерским чеком местного
банка, который оформляет сопровождающий; счёт становится необходим при ипотеке.

Покупка строящегося добавляет собственные проверки, и департамент их
публикует: зарегистрирован ли проект у регулятора, есть ли эскроу-счёт и кто
агент, каков процент готовности, зарегистрирован ли застройщик, есть ли у него
разрешение продавать на этапе строительства.
`,
    annualCosts: `
Ежегодного налога на недвижимость для физических лиц в ОАЭ нет. Ни одна
официальная страница этого не утверждает — государства не публикуют того, чего
не берут, — но федеральная налоговая служба администрирует только НДС, акциз и
корпоративный налог, а тариф Дубая содержит транзакционные сборы и ничего
регулярного.

Жилищный сбор — 5% годовой арендной платы, разбитые на двенадцать месячных
частей и собираемые через счёт за коммунальные услуги. Платит ли его
собственник, живущий в своей квартире, — единственное, что в этом разделе
установить не удалось: ни разъяснение счёта коммунальной компании, ни
государственный портал про собственников не пишут, а портал муниципалитета
закрыт для автоматического доступа. Сумма существенная — 5% от вменённой
рыночной аренды ежегодно, — поэтому уточнять стоит напрямую, прежде чем
считать.

Настоящий регулярный расход — эксплуатационные сборы, и закон подводит под их
установление основание. Собственник должен свою долю управляющей организации и
не вправе не платить утверждённые регулятором сборы, но и управляющая
организация не вправе брать ничего без такого утверждения, по предписанным
стандартам и с аудированной отчётностью. Деньги лежат на отдельном счёте по
каждому дому.

Утверждённые сборы публичны: департамент ведёт индекс эксплуатационных сборов с
поиском по проекту, открытый всем независимо от резидентства. Смотреть цифру по
конкретному дому нужно до покупки — она разнится сильнее всего, и именно её
брошюра упоминает реже всего. Долги следуют за объектом, так что стоит
убедиться, что продавец рассчитался; сдающий собственник остаётся обязанным,
если не платит арендатор.

Депозит коммунальной компании — 2 000 дирхамов за квартиру и 4 000 за виллу,
собственнику возвращается только при продаже, разовая активация около 155.

Доход от аренды у физического лица вне корпоративного налога. Налоговая служба
считает сдачу лично принадлежащего объекта инвестицией в недвижимость,
исключает валовой доход из корпоративного налога и исключает его же из подсчёта
оборота, так что подвести под порог регистрации он не может. Личного
подоходного налога нет. Исключение — предмет следующего раздела.
`,
    shortLet: `
Собственник-физлицо может держать посуточное жильё в Дубае сам. У департамента
туризма две категории заявителей — владельцы, регистрирующие свои объекты, и
компании-операторы, — и торговая лицензия нужна только второй. Подать может и
арендатор, а не только собственник, и на этом стоит рынок субаренды.

Разрешение действует один год и продлевается на тех же условиях.

Со сборами официальные источники расходятся. Тариф 2014 года устанавливает 300
дирхамов за спальню, но не более 1 200 за объект в год. Действующая схема
департамента показывает первичное разрешение 1 570 дирхамов плюс 370 за
единицу. Это разные инструменты, и арифметика у самого департамента тоже не
сходится, так что его цифры стоит брать как рабочие и уточнять до расчёта.

Туристический дирхам берётся за комнату за ночь: 15 дирхамов с «люксового»
объекта и 10 со «стандартного». Ограничения по числу ночей в резолюции нет,
несмотря на широко цитируемый потолок в 30 ночей, которого там не найти.

Из документов нужны паспорт или удостоверение собственника, свидетельство о
собственности, доверенность на форме департамента и счёт за коммунальные услуги
по объекту не старше трёх месяцев. Постоянные обязанности — полис
всеобъемлющего страхования от местного страховщика и регулярная передача данных
о гостях.

Работа без лицензии — 5 000 дирхамов, ложные сведения — 5 000, работа во время
приостановки — 20 000; повтор в течение года удваивает штраф, потолок 100 000.

Может ли дом вам помешать? Департамент туризма выдаёт разрешение без согласия
здания, а закон о совместной собственности прямо посуточную сдачу не
регулирует. Но собственник сдаёт объект при условии соблюдения учредительных
документов сообщества, а пользователи обязаны соблюдать декларацию сообщества и
правила управления зданием. Значит, декларация может ограничить или запретить
посуточное использование, и разрешение её не перебивает. Читать декларацию
конкретного проекта нужно до покупки, если расчёт строится на посуточной сдаче.

И расход, о котором не говорят: разрешение делает деятельность лицензируемой,
а это выводит её из исключения для инвестиций в недвижимость. Доход, который
был вне корпоративного налога, становится предпринимательским и под него
попадает: регистрация обязательна, когда оборот от деятельности превышает
1 000 000 дирхамов за календарный год, а 9% применяются к налогооблагаемому
доходу свыше 375 000.
`,
    residencyLink: `
Здесь недвижимость — действующий маршрут к резидентству, и условия самые мягкие
на этом сайте.

Порог — 2 000 000 дирхамов, и несколько объектов можно складывать: резолюция
говорит «одна или несколько единиц недвижимости общей стоимостью не менее»
этой величины, и это повторяют и Земельный департамент, и миграционная служба.
Если владение долевое, сама доля должна достигать 2 000 000.

Разрешение выдаётся на десять лет и продлевается. Две официальные страницы
до сих пор пишут о пяти годах для инвесторов в недвижимость — это остаток
режима до 2022 года; действующая резолюция, страница услуги миграционной службы
и тариф Земельного департамента говорят о десяти.

Ипотека допускается при условии, что кредит взят в местном банке из
утверждённого перечня, — намеренный контраст с инвестиционными маршрутами вне
недвижимости, где капитал не может быть заёмным. Но дубайская реализация
строже федеральной нормы: департамент просит письмо банка, подтверждающее
фактически выплаченные 2 000 000, то есть собственные средства, а не стоимость.
При покупке в кредит это стоит проверить заранее.

На объект накладывается обременение, чтобы владение оставалось непрерывным весь
срок действия разрешения. Продать квалифицирующий объект и сохранить визу
нельзя.

Со строящимся объектом источники расходятся. Федеральный закон разрешает его
прямо — покупка на этапе строительства на общую сумму от 2 000 000 у
застройщиков, одобренных компетентным местным органом. Дубайские документы
тянут в другую сторону: Земельный департамент требует свидетельство о
собственности, которого у строящегося объекта до передачи нет, а отдельная виза
собственника жилья у миграционной службы требует, чтобы объект был полностью
построен и пригоден для проживания. Три официальных дубайских источника
указывают в разные стороны. До того как строить визовый расчёт на строящемся
объекте, это нужно подтвердить в департаменте.

Требуется всеобъемлющая медицинская страховка на весь срок. Государственные
сборы для инвестора составляют 9 884,75 дирхама — медосмотр, Emirates ID,
подтверждение резидентства, сборы департамента и административные, — и по
5 774,50 за каждого спонсируемого члена семьи.
`,
  },
  pl: {
    whoMayBuy: `
Cudzoziemiec może mieć w Dubaju pełną własność, ale tylko w strefach
wyznaczonych przez władcę. Prawo Dubaju nr 7 z 2006 dzieli świat na obywateli
ZEA i państw Zatoki, którzy mogą posiadać wszędzie, oraz wszystkich
pozostałych, którzy uzyskują własność bezterminową — albo użytkowanie lub
najem do 99 lat — wyłącznie w strefach wyznaczonych. Żadne konkretne
obywatelstwo nie jest wyłączone.

Strefy określa rozporządzenie z 2006 roku, wyliczające je numerami działek
katastralnych, a nie nazwami marketingowymi, a lista była później rozszerzana.
Jednolitego, aktualnego na sierpień 2026 wykazu urzędowego nie udało się
znaleźć, a wiarygodną odpowiedź dla konkretnej nieruchomości daje usługa
sprawdzenia statusu w Land Department. Zapewnienie broszury, że dzielnica jest
freehold, to powód do takiego sprawdzenia, a nie sama odpowiedź.

Mapa stref się zmienia. W styczniu 2025 departament otworzył konwersję na
własność dla 457 wcześniej dzierżawionych działek przy Sheikh Zayed Road i w
Al Jaddaf, za opłatą 30% wyceny.

Zagraniczna spółka nie może posiadać nieruchomości w Dubaju bezpośrednio —
tylko przez podmiot zależny w strefie wolnocłowej. Ograniczeń wiekowych nie
ma.

Abu Zabi to inny reżim i słowa znaczą tam co innego. Cudzoziemiec ma tam
mieszkania i piętra, ale nie grunt, w dziewięciu strefach inwestycyjnych, a to,
co opisuje portal rządowy, to dokument własności lokalu na 99 lat, a nie
wieczysta własność, jaką daje Dubaj.
`,
    transactionCosts: `
Opłata rejestracyjna wynosi 4% wartości umowy, a ustawa dzieli ją po połowie
między sprzedającego i kupującego, o ile nie umówiono się inaczej. Land
Department pisze wprost: po 2% na stronę. To, że kupujący zwyczajowo płaci
całe 4%, jest konwencją rynkową działającą przez klauzulę „o ile nie umówiono
się inaczej" — warto to zakładać i można o to negocjować.

Opłaty administracyjne są niewielkie i stałe: 250 dirhamów za akt własności,
250 za obsługę willi i mieszkań, 225 za mapę gminną oraz po 10 za opłatę
wiedzy i innowacji.

Biuro rejestrujące pobiera 4 000 dirhamów plus VAT przy wartości od 500 000 i
2 000 plus VAT poniżej — czyli 4 200 i 2 100 z 5-procentowym VAT.

Kredyt dokłada 0,25% kwoty pożyczki za wpis, 250 dirhamów za akt i opłatę
biura 4 000 plus VAT, a przy nieruchomości w budowie 5 000.

Do przeniesienia w strefie freehold potrzebne jest zaświadczenie o braku
sprzeciwu od dewelopera. Jedyna urzędowa kwota to 500 dirhamów, a w praktyce
duzi deweloperzy biorą znacznie więcej, czasem z zwrotnym depozytem na opłaty
eksploatacyjne. Pytać trzeba konkretnego dewelopera, a nie liczyć według liczby
opublikowanej.

Prowizji pośrednika departament nie ustala: jest taka, jak stanowi umowa, a
przy jej milczeniu — zwyczajowa. Znane 2% plus VAT to właśnie zwyczaj, nie
przepis. Własna rada departamentu jest konkretniejsza: nie mieć do czynienia z
pośrednikiem niezarejestrowanym u regulatora.

Od samej ceny mieszkania VAT-u się nie nalicza: nieruchomość mieszkalna jest
zwolniona, a pierwsza dostawa w ciągu trzech lat od oddania objęta stawką
zerową. VAT pojawia się tylko na usługach — opłacie biura, prowizji, obsłudze.
`,
    steps: `
Umowa to standardowa Form F Land Department, tworzona przez pośrednika w
systemie samego departamentu. Przed podpisaniem departament zaleca badanie
prawne, a przy nieruchomości gotowej — oględziny.

Tam, gdzie nie ma wspólnoty właścicieli, potrzebne jest zaświadczenie o braku
sprzeciwu od dewelopera.

Twardy termin jest jeden i jest hojny: transakcję trzeba zarejestrować w ciągu
60 dni od daty podpisania umowy.

Obecność osobista nie jest wymagana. Właściciel stawia się u rejestratora sam
albo przez pełnomocnika działającego na podstawie notarialnego pełnomocnictwa.

Samo przeniesienie jest szybkie. Departament publikuje czas obsługi: 25 minut
w biurze rejestrującym, 15–20 minut przy zwalnianiu hipoteki, 20–25 minut na
wpis hipoteki. Akt własności wydawany jest na tym samym spotkaniu —
przeniesienie i dokument to jedno zdarzenie, nie dwa kroki.

Kalendarz wyznaczają w praktyce zaświadczenie dewelopera i, przy kredycie,
decyzja banku. Czasu całościowego nie publikuje żadne oficjalne źródło, a
jedynym opublikowanym limitem jest owe 60 dni na rejestrację.

Do zakupu nie trzeba ani pobytu, ani rachunku w banku ZEA. W wykazie dokumentów
wprost przewidziano ważny paszport zamiast Emirates ID dla cudzoziemców
nierezydentów. W praktyce cena idzie czekiem menedżerskim lokalnego banku,
który organizuje obsługa; rachunek staje się konieczny przy kredycie.

Zakup w budowie dokłada własne sprawdzenia, a departament je publikuje: czy
projekt jest zarejestrowany u regulatora, czy jest rachunek powierniczy i kto
jest powiernikiem, jaki jest procent zaawansowania, czy deweloper jest
zarejestrowany i czy ma zezwolenie na sprzedaż w budowie.
`,
    annualCosts: `
Rocznego podatku od nieruchomości dla osób fizycznych w ZEA nie ma. Żadna
oficjalna strona tego nie stwierdza — państwa nie publikują tego, czego nie
pobierają — ale federalny urząd podatkowy administruje tylko VAT, akcyzą i
podatkiem dochodowym od osób prawnych, a taryfa Dubaju zawiera opłaty
transakcyjne i nic cyklicznego.

Opłata mieszkaniowa wynosi 5% rocznego czynszu, rozbita na dwanaście rat
miesięcznych i pobierana przez rachunek za media. Czy płaci ją właściciel
mieszkający we własnym lokalu, to jedyna rzecz w tej sekcji, której nie udało
się rozstrzygnąć: ani objaśnienie rachunku, ani portal rządowy o właścicielach
nie piszą, a portal gminy jest zamknięty dla dostępu automatycznego. Kwota jest
istotna — 5% szacowanego czynszu rynkowego, co roku — więc warto potwierdzić ją
bezpośrednio przed liczeniem.

Realnym kosztem cyklicznym są opłaty eksploatacyjne, a ustawa podkłada pod ich
ustalanie fundament. Właściciel jest winien swój udział zarządcy i nie może
wstrzymać opłat zatwierdzonych przez regulatora, ale i zarządca nie może
pobrać niczego bez tego zatwierdzenia, według wyznaczonych standardów i z
audytowanymi rozliczeniami. Pieniądze leżą na osobnym rachunku dla każdego
budynku.

Zatwierdzone opłaty są jawne: departament prowadzi indeks opłat
eksploatacyjnych z wyszukiwaniem po projekcie, otwarty dla wszystkich
niezależnie od rezydencji. Sprawdzić kwotę dla konkretnego budynku trzeba przed
zakupem — to liczba najbardziej zmienna i ta, o której broszura wspomina
najrzadziej. Zaległości idą za nieruchomością, więc warto się upewnić, że
sprzedający uregulował; właściciel wynajmujący pozostaje zobowiązany, gdy nie
płaci najemca.

Kaucja u dostawcy mediów to 2 000 dirhamów za mieszkanie i 4 000 za willę,
właścicielowi zwracana dopiero przy sprzedaży, jednorazowa aktywacja około 155.

Dochód z najmu osoby fizycznej jest poza podatkiem dochodowym od osób prawnych.
Urząd traktuje wynajem nieruchomości posiadanej osobiście jako inwestycję,
wyłącza przychód brutto z podatku i wyłącza go także z liczenia obrotu, więc
nie może on przekroczyć progu rejestracji. Podatku dochodowego od osób
fizycznych nie ma. Wyjątek jest tematem następnej sekcji.
`,
    shortLet: `
Właściciel będący osobą fizyczną może prowadzić najem wakacyjny w Dubaju
samodzielnie. Departament turystyki ma dwie kategorie wnioskodawców —
właścicieli rejestrujących własne lokale oraz operatorów korporacyjnych — i
licencji handlowej wymaga tylko druga. Wniosek może złożyć także najemca, nie
tylko właściciel, i na tym opiera się rynek podnajmu.

Zezwolenie obowiązuje rok i jest odnawialne na tych samych warunkach.

Opłaty się nie zgadzają. Taryfa z 2014 roku ustala 300 dirhamów za sypialnię,
nie więcej niż 1 200 za nieruchomość rocznie. Bieżąca schema departamentu
pokazuje zezwolenie początkowe 1 570 dirhamów plus 370 za lokal. To różne
instrumenty, a arytmetyka samego departamentu też się nie spina, więc jego
liczby warto traktować jako robocze i potwierdzić przed liczeniem.

Dirham turystyczny pobierany jest od pokoju za noc: 15 dirhamów przy obiekcie
„luksusowym" i 10 przy „standardowym". Limitu liczby nocy rozporządzenie nie
zawiera, mimo szeroko cytowanego pułapu 30 nocy, którego tam nie ma.

Z dokumentów potrzebne są paszport lub dowód właściciela, akt własności,
upoważnienie na formularzu departamentu i rachunek za media dla lokalu nie
starszy niż trzy miesiące. Obowiązkami ciągłymi są polis ubezpieczenia od
lokalnego ubezpieczyciela i regularne przekazywanie danych gości.

Działalność bez licencji to 5 000 dirhamów, fałszywe informacje 5 000, praca w
czasie zawieszenia 20 000; powtórzenie w ciągu roku podwaja karę, pułap
100 000.

Czy budynek może przeszkodzić? Departament turystyki wydaje zezwolenie bez
zgody budynku, a ustawa o współwłasności najmu krótkiego wprost nie reguluje.
Ale właściciel wynajmuje pod warunkiem przestrzegania dokumentów ustrojowych
wspólnoty, a użytkownicy muszą stosować się do deklaracji wspólnoty i regulaminu
zarządzania budynkiem. Deklaracja może więc ograniczyć lub zakazać użytku
wakacyjnego, a zezwolenie tego nie przebija. Deklarację konkretnego projektu
trzeba przeczytać przed zakupem, jeśli rachunek opiera się na najmie krótkim.

I koszt, o którym się nie mówi: zezwolenie czyni działalność licencjonowaną, co
wyprowadza ją z wyłączenia dla inwestycji w nieruchomości. Dochód, który był
poza podatkiem dochodowym od osób prawnych, staje się dochodem gospodarczym i
mu podlega: rejestracja jest obowiązkowa, gdy obrót z działalności przekroczy
1 000 000 dirhamów w roku kalendarzowym, a 9% stosuje się do dochodu
podlegającego opodatkowaniu powyżej 375 000.
`,
    residencyLink: `
Tutaj nieruchomość jest żywą ścieżką do rezydencji, a warunki są najłagodniejsze
na tej stronie.

Próg to 2 000 000 dirhamów i można sumować kilka nieruchomości: rezolucja mówi
o „jednej lub kilku nieruchomościach o łącznej wartości nie mniejszej niż" ta
kwota, a powtarzają to i Land Department, i urząd migracyjny. Przy współwłasności
sam udział musi sięgać 2 000 000.

Zezwolenie wydaje się na dziesięć lat i jest odnawialne. Dwie oficjalne strony
wciąż piszą o pięciu latach dla inwestorów w nieruchomości — to pozostałość
reżimu sprzed 2022 roku; obowiązująca rezolucja, strona usługi urzędu
migracyjnego i taryfa Land Department mówią o dziesięciu.

Kredyt jest dopuszczalny pod warunkiem, że pochodzi z lokalnego banku z listy
zatwierdzonej — celowy kontrast wobec ścieżek inwestycyjnych spoza
nieruchomości, gdzie kapitał nie może być pożyczony. Ale wdrożenie dubajskie
jest surowsze od normy federalnej: departament prosi o pismo banku
potwierdzające faktycznie zapłacone 2 000 000, czyli środki własne, a nie
wartość. Przy zakupie na kredyt warto to sprawdzić wcześniej.

Na nieruchomości ustanawia się obciążenie, by własność pozostała ciągła przez
cały okres zezwolenia. Sprzedać nieruchomość kwalifikującą i zachować wizę się
nie da.

Przy nieruchomości w budowie źródła się rozchodzą. Prawo federalne dopuszcza ją
wprost — zakup w budowie na łączną kwotę od 2 000 000 u deweloperów
zatwierdzonych przez właściwy organ lokalny. Dokumenty dubajskie ciągną w drugą
stronę: Land Department wymaga aktu własności, którego nieruchomość w budowie
nie ma do przekazania, a odrębna wiza właściciela nieruchomości w urzędzie
migracyjnym wymaga, by obiekt był w pełni wybudowany i zdatny do zamieszkania.
Trzy oficjalne dubajskie źródła wskazują w różne strony. Zanim oprze się na tym
rachunek wizowy, trzeba to potwierdzić w departamencie.

Wymagane jest pełne ubezpieczenie zdrowotne przez cały okres. Opłaty rządowe
dla inwestora wynoszą 9 884,75 dirhama — badanie lekarskie, Emirates ID,
potwierdzenie rezydencji, opłaty departamentu i administracyjne — oraz po
5 774,50 za każdego sponsorowanego członka rodziny.
`,
  },
};

// The export. Keys are ISO alpha-2, the same key the patcher reads from the
// document id, so a jurisdiction with no entry here simply keeps empty section
// fields and renders no sections.
export const PROPERTY_BODY: Record<string, Record<Locale, Record<SectionKey, PortableBlock[]>>> = {
  gr: {
    en: sections(GR.en, "gren"),
    ru: sections(GR.ru, "grru"),
    pl: sections(GR.pl, "grpl"),
  },
  pt: {
    en: sections(PT.en, "pten"),
    ru: sections(PT.ru, "ptru"),
    pl: sections(PT.pl, "ptpl"),
  },
  mt: {
    en: sections(MT.en, "mten"),
    ru: sections(MT.ru, "mtru"),
    pl: sections(MT.pl, "mtpl"),
  },
  ae: {
    en: sections(AE.en, "aeen"),
    ru: sections(AE.ru, "aeru"),
    pl: sections(AE.pl, "aepl"),
  },
};
