import type { Locale } from "./jurisdictions";
import { CONTROLLER } from "./privacy";
import { blocks } from "./portable";

// The /about page, in three languages.
//
// WHY IT IS NOT AN "ABOUT US". The site claims independence in the eyebrow of
// every page and, until this file existed, substantiated it nowhere: the legal
// identity lived in exactly one place, the controller section of the privacy
// policy, which is to say behind a page nobody opens voluntarily. A site whose
// product is the traceability of a figure was itself untraceable.
//
// THE H1 NAMES THE PROJECT; THE METHOD IS SECTION 1. The first version got
// this backwards — its H1 read "How a figure gets onto this site", which is
// word for word the heading of the section immediately below it, so the H1 did
// no work of its own. Worse, it answered a question the reader has not asked
// yet: somebody who opens /about is asking who this is, and the method is the
// answer to their SECOND question. Three names for one page (the URL, the
// footer link, the H1) also disagreed, and the JSON-LD says `AboutPage` with
// `mainEntity: Organization` while the strongest on-page signal talked about
// figures.
//
// So the eyebrow carries the page type, the H1 names the project and what it
// is answerable for, and "how a figure gets onto this site" stays where it
// belongs — as the heading of section 1.
//
// The fix is not a biography. There are two kinds of authority available and
// only one of them is honest here. Personal authority — "trust me, I have
// twenty years in this" — cannot be checked and this project does not have it.
// Procedural authority — "do not trust me, here is the statute and the date,
// check it yourself" — can be checked by anyone, which makes it the stronger
// of the two. Every section below is an instance of the second kind.
//
// THE HARDEST SECTION TO KEEP IS THE SECOND. "What is not verified here" is
// the section no competitor has, and it is the reason a reader believes the
// rest of the page. Every future edit will be tempted to soften it, because
// admitting Cyprus is unverified feels like admitting the site is incomplete.
// It is the opposite: a comparison that never says "we do not know" is a
// comparison nobody should trust with a €400,000 decision.
//
// THE THIRD SECTION MAY NOT NAME A PRICE OR A PAYMENT MODEL. That is a
// standing decision recorded in CLAUDE.md — the first outbound wave exists to
// ask the market what it pays, and a page that names a figure destroys the
// question, while a page that names the MODEL does the same thing one level up
// and is additionally wrong for two of the five jurisdictions. What the text
// states instead is BOUNDARIES: what the project does not do. That answers the
// reader's real question — "who is paying you to tell me this" — without
// answering the one that is not the reader's business.
//
// FIGURES CITED HERE COME FROM docs/figures-verification-2026-08-23.md. The
// claim that five of six headline numbers were wrong is checkable against that
// document, section by section, and may not change here without changing
// there.
//
// The correction address is CONTROLLER.email, and by 24 Aug 2026 that is the
// only address the site prints anywhere. It briefly was not: the broken-form
// panels said hello@ and the partners page said partners@, neither of which
// was a mailbox anybody could answer — a firm that replies to an address into
// the void concludes the project is not real. Both now derive from CONTROLLER,
// the catalogues carry an {email} placeholder rather than a typed address, and
// there is no second place left for one to drift into.

export interface AboutCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  method: ReturnType<typeof blocks>;
  unverified: ReturnType<typeof blocks>;
  money: ReturnType<typeof blocks>;
  corrections: ReturnType<typeof blocks>;
  notAdvice: ReturnType<typeof blocks>;
  authorLabel: string;
  authorNote: string;
  portraitAlt: string;
  seo: { metaTitle: string; metaDescription: string };
}

const NAME = CONTROLLER.name;
const EMAIL = CONTROLLER.email;

export const ABOUT_COPY: Record<Locale, AboutCopy> = {
  en: {
    eyebrow: "The project",
    heading: "What moveandinvest is, and who answers for it",
    intro:
      "This is a comparison of residency routes in five jurisdictions where every number carries the law it came from and the date it was checked. It is not a consultancy and not an agency, and it does not rank anybody. The page below describes how the figures are produced, what has deliberately been left out, and how the project is paid — because a comparison that will not say who pays for it is an advertisement.",
    method: blocks(
      `A number reaches a page here from one kind of place only: the text of the
      statute, a ministry's own tariff, or an official schedule of fees. Not
      from a competitor's article, not from a law firm's blog, not from an
      aggregator. Those sources are not dishonest — they are simply copies, and
      a copy carries an error forward without carrying its date.

      Where no primary source exists, nothing is published. The page says that
      the figure is not published rather than filling the gap with a plausible
      one, and that rule costs the site more than any other rule on this list.

      Every figure carries the date it was checked, and the date is on the page
      next to the number rather than in a footer. A threshold with no date is
      not information; it is a claim about a moment that the reader cannot
      locate.

      ## What that rule caught

      On 23 August 2026 every headline figure on this site was checked against
      its primary source. Five of the six were wrong.

      Greece stood on a threshold that had been superseded in September 2024 by
      law 5100/2024, which replaced one national figure with three regional
      ones. Malta stood on a threshold superseded in January 2025. The UAE
      figure had been converted at a stale dirham rate. And Portugal's
      naturalisation had stopped being five years in May 2026 — it is ten for
      non-EU nationals now, which changes what that route is for rather than
      merely what it costs.

      The point of listing them is not that the site is careful. It is that
      every one of those five numbers was, at the time, being repeated by
      articles and firms across the market. A rule of "take it from a reliable
      source" would have preserved all five errors, because the reliable
      sources were copying each other.`,
      "am",
    ),
    unverified: blocks(
      `## Cyprus

      Cyprus is in the table on this site with dashes rather than figures, and
      it has no page of its own. Its numbers could be found only in secondary
      sources. A permanent-residency threshold published without being read
      from the law is exactly the kind of claim that circulates, gets forwarded
      and cannot be corrected in place — so it is not published here.

      ## Timelines nobody publishes

      Several of these jurisdictions publish no processing time at all. Where
      that is the case the page says so, and says separately what appears to
      happen in practice, marked as practice. An invented duration is the
      easiest claim on this site to disprove and the most tempting one to
      write.

      ## Costs that exist only as market practice

      A lawyer's fee and an agent's commission are real money and are named in
      the breakdown, but they are not in any total, because no authority
      publishes them and a total containing an estimate stops being a total.

      ## What the totals assume

      One main applicant, no dependants; entry plus the first renewal. Family
      pricing cannot share a column: in Portugal a spouse costs what the main
      applicant costs, on Malta a spouse is free. A single family figure would
      be comparing four different things and would look more useful than the
      truth.`,
      "au",
    ),
    money: blocks(
      `The project passes enquiries to lawyers and advisers. One partner per
      jurisdiction, and an enquiry goes to that one and to nobody else.

      What it does not do: resell an enquiry, take a percentage of any
      transaction, sell a position in the table, sell property, or carry
      advertising.

      ## The conflict, said out loud

      There is an obvious interest in your leaving an enquiry, and pretending
      otherwise would be worse than having the interest. Two things hold it in
      check, and both are checkable rather than promised.

      The first is that the same method is applied to all five jurisdictions,
      including the two that cannot ever pay. Paying a lawyer for a referred
      client is prohibited on Malta, where the professional code treats a fixed
      referral fee as touting, and criminal in the UAE under Federal
      Decree-Law 34/2022, which binds the operator of a platform and not only
      the firm. Those two are checked as carefully as the two that can.

      The second is that figures which argue against leaving an enquiry are
      published anyway. That Portugal is no longer a fast route to a passport
      is the single most discouraging fact on this site, and it is in the first
      paragraph of the Portuguese page.`,
      "an",
    ),
    corrections: blocks(
      `Write to ${EMAIL}. A person reads it.

      What happens next is fixed, because the value of a correction lies
      entirely in it being predictable. The figure is checked against its
      primary source. If it is wrong it is changed — together with its
      verification date, which moves in public, so the page shows that it was
      rechecked rather than quietly showing a different number. If the primary
      source says something other than what you say, you get a reply with the
      citation, and you can judge it yourself.

      Nothing on this site is corrected silently.`,
      "ac",
    ),
    notAdvice: blocks(
      `moveandinvest is not a law firm and gives no legal, tax or investment
      advice. Nothing here is a recommendation to choose one jurisdiction over
      another.

      These pages are the starting point of a conversation with a professional,
      not a substitute for one. Every jurisdiction has exceptions, transitional
      rules and case-by-case decisions that no comparison can hold, and the one
      that applies to you is exactly the one a comparison cannot know about.`,
      "ax",
    ),
    authorLabel: "Who checks the figures",
    authorNote:
      "I read the statutes, the ministry tariffs and the fee schedules myself, and I am the one who is wrong when a number here is wrong. Every figure on this site was checked by hand against its source, and the working is kept per jurisdiction with the date attached. If something is out of date, writing to the address above reaches me.",
    portraitAlt: NAME,
    seo: {
      metaTitle: "About moveandinvest: the method, and who answers for it",
      metaDescription:
        "The method behind the comparison: primary sources only, dates on every figure, what is deliberately left unverified, and how the project is paid.",
    },
  },

  ru: {
    eyebrow: "О проекте",
    heading: "Что такое moveandinvest и кто за него отвечает",
    intro:
      "Это сравнение маршрутов резидентства в пяти юрисдикциях, где у каждой цифры есть закон, из которого она взята, и дата, когда её проверяли. Это не консультация и не агентство, и здесь никого не ранжируют. Ниже — как получаются цифры, что сюда намеренно не попало и на чём проект зарабатывает: сравнение, которое не говорит, кто за него платит, — это реклама.",
    method: blocks(
      `Цифра попадает на страницу только из одного рода источников: текста
      закона, собственного тарифа ведомства или официальной таблицы сборов. Не
      из статьи конкурента, не из блога юрфирмы, не из агрегатора. Дело не в
      том, что те источники нечестны, — они копии, а копия переносит ошибку
      дальше, не перенося её дату.

      Там, где первоисточника нет, не публикуется ничего. Страница пишет, что
      цифра не публикуется, вместо того чтобы закрыть пробел правдоподобной, — и
      это правило обходится сайту дороже всех остальных в этом списке.

      У каждой цифры есть дата проверки, и стоит она на странице рядом с самой
      цифрой, а не в подвале. Порог без даты — это не информация, это
      утверждение о моменте, который читатель не может найти.

      ## Что это правило поймало

      23 августа 2026 года все заголовочные цифры сайта были сверены с
      первоисточниками. Пять из шести оказались неверны.

      Греция стояла на пороге, отменённом в сентябре 2024 года законом
      5100/2024, который заменил одну общенациональную цифру тремя
      региональными. Мальта — на пороге, отменённом в январе 2025 года. Цифра
      по ОАЭ была пересчитана по устаревшему курсу дирхама. А португальская
      натурализация перестала быть пятилетней в мае 2026 года: для не-граждан
      ЕС это теперь десять лет, что меняет не стоимость маршрута, а его смысл.

      Смысл этого перечня не в том, что сайт аккуратен. В том, что каждую из
      пяти цифр на тот момент повторяли статьи и фирмы по всему рынку. Правило
      «брать из надёжного источника» сохранило бы все пять ошибок, потому что
      надёжные источники переписывали друг друга.`,
      "am",
    ),
    unverified: blocks(
      `## Кипр

      Кипр стоит в таблице с прочерками вместо цифр, и своей страницы у него
      нет. Его числа удалось найти только во вторичных источниках. Порог ПМЖ,
      опубликованный без чтения закона, — ровно то утверждение, которое потом
      расходится, пересылается и не отзывается. Поэтому здесь его нет.

      ## Сроки, которых никто не публикует

      Часть этих юрисдикций не публикует срок рассмотрения вообще. Там, где это
      так, страница пишет именно это — и отдельно то, что происходит на
      практике, помеченное как практика. Выдуманный срок — самое легко
      опровергаемое утверждение на сайте и самое соблазнительное для написания.

      ## Расходы, существующие только как рыночная практика

      Гонорар юриста и комиссия агента — реальные деньги, они названы в
      разбивке, но не входят ни в одну итоговую сумму: ни одно ведомство их не
      публикует, а сумма, внутри которой есть оценка, перестаёт быть суммой.

      ## На чём построены итоговые суммы

      Один основной заявитель, без иждивенцев; вход и первое продление. Семью
      нельзя свести в ту же колонку: в Португалии супруг стоит столько же,
      сколько основной заявитель, на Мальте — бесплатен. Одна «семейная» цифра
      сравнивала бы четыре разные вещи и выглядела бы полезнее правды.`,
      "au",
    ),
    money: blocks(
      `Проект передаёт заявки юристам и консультантам. Один партнёр на
      юрисдикцию, и заявка уходит ему одному, больше никому.

      Чего проект не делает: не перепродаёт заявку, не берёт процента со
      сделки, не продаёт место в таблице, не продаёт недвижимость и не
      показывает рекламу.

      ## Конфликт, названный вслух

      В том, чтобы вы оставили заявку, есть очевидный интерес, и делать вид,
      что его нет, было бы хуже, чем его иметь. Сдерживают его две вещи, и обе
      можно проверить, а не принять на веру.

      Первая: одна и та же методика применяется ко всем пяти юрисдикциям,
      включая две, которые не могут принести денег никогда. Платить юристу за
      приведённого клиента запрещено на Мальте, где профессиональный кодекс
      считает фиксированное вознаграждение за направление привлечением клиентуры,
      и уголовно наказуемо в ОАЭ по Federal Decree-Law 34/2022, который связывает
      оператора платформы, а не только фирму. Эти две проверены так же
      тщательно, как те две, что приносят.

      Вторая: цифры, говорящие против того, чтобы оставлять заявку,
      публикуются всё равно. То, что Португалия перестала быть быстрым путём к
      паспорту, — самый обескураживающий факт на этом сайте, и он стоит в
      первом абзаце португальской страницы.`,
      "an",
    ),
    corrections: blocks(
      `Пишите на ${EMAIL}. Читает человек.

      Дальше происходит одно и то же, и ценность поправки целиком в этой
      предсказуемости. Цифра сверяется с первоисточником. Если она неверна, её
      меняют — вместе с датой проверки, которая двигается открыто, так что
      страница показывает, что её пересверили, а не тихо показывает другое
      число. Если первоисточник говорит не то, что говорите вы, вы получите
      ответ со ссылкой и сможете судить сами.

      Тихо здесь не исправляется ничего.`,
      "ac",
    ),
    notAdvice: blocks(
      `moveandinvest не является юридической фирмой и не оказывает юридических,
      налоговых или инвестиционных консультаций. Ничто здесь не является
      рекомендацией выбрать одну юрисдикцию вместо другой.

      Эти страницы — начало разговора со специалистом, а не замена ему. В
      каждой юрисдикции есть исключения, переходные положения и решения по
      обстоятельствам, которых не удержит никакое сравнение, — и то, которое
      касается именно вас, как раз то, о котором сравнение знать не может.`,
      "ax",
    ),
    authorLabel: "Кто сверяет цифры",
    authorNote:
      "Законы, тарифы ведомств и таблицы сборов я читаю сам, и когда цифра здесь неверна — неправ я. Каждая цифра на сайте сверена вручную с её источником, а выкладки хранятся по юрисдикциям, с датой. Если что-то устарело, письмо на адрес выше дойдёт до меня.",
    portraitAlt: NAME,
    seo: {
      metaTitle: "О проекте moveandinvest: метод и кто за него отвечает",
      metaDescription:
        "Метод, по которому собрано сравнение: только первоисточники, дата у каждой цифры, что намеренно оставлено непроверенным и на чём зарабатывает проект.",
    },
  },

  pl: {
    eyebrow: "O projekcie",
    heading: "Czym jest moveandinvest i kto za to odpowiada",
    intro:
      "To porównanie ścieżek rezydencji w pięciu jurysdykcjach, w którym każda liczba niesie ustawę, z której pochodzi, i datę sprawdzenia. To nie doradztwo i nie agencja, i nikogo tu się nie rankinguje. Poniżej: jak powstają liczby, czego świadomie tu nie ma i z czego projekt się utrzymuje — porównanie, które nie mówi, kto za nie płaci, jest reklamą.",
    method: blocks(
      `Liczba trafia na stronę wyłącznie z jednego rodzaju źródeł: z tekstu
      ustawy, z własnej taryfy ministerstwa albo z oficjalnej tabeli opłat. Nie
      z artykułu konkurenta, nie z bloga kancelarii, nie z agregatora. Nie
      chodzi o to, że tamte źródła są nieuczciwe — są kopiami, a kopia niesie
      błąd dalej, nie niosąc jego daty.

      Tam, gdzie źródła pierwotnego nie ma, nie publikuje się nic. Strona pisze,
      że liczba nie jest publikowana, zamiast zapełnić lukę liczbą
      prawdopodobną — i ta zasada kosztuje serwis więcej niż którakolwiek inna
      na tej liście.

      Każda liczba niesie datę sprawdzenia, a data stoi na stronie obok samej
      liczby, nie w stopce. Próg bez daty nie jest informacją; jest twierdzeniem
      o momencie, którego czytelnik nie potrafi umiejscowić.

      ## Co ta zasada wychwyciła

      23 sierpnia 2026 wszystkie główne liczby serwisu sprawdzono ze źródłami
      pierwotnymi. Pięć z sześciu było błędnych.

      Grecja stała na progu uchylonym we wrześniu 2024 przez ustawę 5100/2024,
      która zastąpiła jedną liczbę ogólnokrajową trzema regionalnymi. Malta — na
      progu uchylonym w styczniu 2025. Liczba dla ZEA była przeliczona po
      nieaktualnym kursie dirhama. A portugalska naturalizacja przestała być
      pięcioletnia w maju 2026: dla obywateli spoza UE to teraz dziesięć lat, co
      zmienia nie koszt tej ścieżki, lecz jej sens.

      Sens tego wyliczenia nie polega na tym, że serwis jest staranny. Polega na
      tym, że każdą z tych pięciu liczb powtarzały wtedy artykuły i kancelarie w
      całej branży. Zasada „bierz z wiarygodnego źródła" zachowałaby wszystkie
      pięć błędów, bo wiarygodne źródła przepisywały jedno od drugiego.`,
      "am",
    ),
    unverified: blocks(
      `## Cypr

      Cypr stoi w tabeli z myślnikami zamiast liczb i nie ma własnej strony.
      Jego liczby udało się znaleźć tylko w źródłach wtórnych. Próg stałego
      pobytu opublikowany bez przeczytania ustawy to dokładnie takie
      twierdzenie, które potem krąży, jest przesyłane dalej i nie daje się
      odwołać. Dlatego go tu nie ma.

      ## Terminy, których nikt nie publikuje

      Część tych jurysdykcji nie publikuje terminu rozpatrzenia w ogóle. Tam,
      gdzie tak jest, strona pisze właśnie to — i osobno to, co dzieje się w
      praktyce, oznaczone jako praktyka. Wymyślony termin to najłatwiejsze do
      obalenia twierdzenie na tej stronie i najbardziej kuszące do napisania.

      ## Koszty istniejące wyłącznie jako praktyka rynkowa

      Honorarium prawnika i prowizja pośrednika to realne pieniądze, są
      wymienione w rozbiciu, ale nie wchodzą do żadnej sumy: żaden urząd ich nie
      publikuje, a suma zawierająca szacunek przestaje być sumą.

      ## Na czym oparte są sumy

      Jeden główny wnioskodawca, bez osób zależnych; wejście i pierwsze
      odnowienie. Rodziny nie da się zmieścić w tej samej kolumnie: w Portugalii
      małżonek kosztuje tyle co główny wnioskodawca, na Malcie jest bezpłatny.
      Jedna liczba „rodzinna" porównywałaby cztery różne rzeczy i wyglądałaby na
      bardziej użyteczną niż prawda.`,
      "au",
    ),
    money: blocks(
      `Projekt przekazuje zgłoszenia prawnikom i doradcom. Jeden partner na
      jurysdykcję, a zgłoszenie trafia do niego jednego i do nikogo więcej.

      Czego projekt nie robi: nie odsprzedaje zgłoszeń, nie bierze procentu od
      transakcji, nie sprzedaje miejsca w tabeli, nie sprzedaje nieruchomości i
      nie wyświetla reklam.

      ## Konflikt powiedziany wprost

      W tym, żebyś zostawił zgłoszenie, jest oczywisty interes, a udawanie, że
      go nie ma, byłoby gorsze niż samo jego istnienie. Powstrzymują go dwie
      rzeczy i obie da się sprawdzić, a nie tylko przyjąć na wiarę.

      Pierwsza: ta sama metoda stosowana jest do wszystkich pięciu jurysdykcji,
      w tym do dwóch, które nigdy nie mogą przynieść pieniędzy. Płacenie
      prawnikowi za skierowanego klienta jest zakazane na Malcie, gdzie kodeks
      zawodowy traktuje stałe wynagrodzenie za polecenie jako pozyskiwanie
      klienteli, i karalne w ZEA na mocy Federal Decree-Law 34/2022, który wiąże
      operatora platformy, nie tylko kancelarię. Te dwie sprawdzono równie
      starannie jak te, które przynoszą.

      Druga: liczby przemawiające przeciw zostawianiu zgłoszenia publikowane są
      i tak. To, że Portugalia przestała być szybką drogą do paszportu, jest
      najbardziej zniechęcającym faktem na tej stronie i stoi w pierwszym
      akapicie strony portugalskiej.`,
      "an",
    ),
    corrections: blocks(
      `Proszę pisać na ${EMAIL}. Czyta to człowiek.

      Dalej dzieje się zawsze to samo, a wartość sprostowania leży w całości w
      tej przewidywalności. Liczba jest sprawdzana ze źródłem pierwotnym. Jeśli
      jest błędna — zostaje zmieniona, razem z datą sprawdzenia, która przesuwa
      się jawnie, więc strona pokazuje, że liczbę zweryfikowano ponownie, a nie
      po cichu pokazuje inną. Jeśli źródło pierwotne mówi co innego niż Pan/Pani,
      dostaje Pan/Pani odpowiedź z odesłaniem i może ocenić samodzielnie.

      Po cichu nie poprawia się tu niczego.`,
      "ac",
    ),
    notAdvice: blocks(
      `moveandinvest nie jest kancelarią prawną i nie świadczy porad prawnych,
      podatkowych ani inwestycyjnych. Nic tutaj nie jest rekomendacją wyboru
      jednej jurysdykcji zamiast drugiej.

      Te strony są początkiem rozmowy ze specjalistą, a nie jej zastępstwem. W
      każdej jurysdykcji są wyjątki, przepisy przejściowe i rozstrzygnięcia
      zależne od okoliczności, których nie utrzyma żadne porównanie — a to,
      które dotyczy właśnie Pana/Pani, jest dokładnie tym, o którym porównanie
      nie może wiedzieć.`,
      "ax",
    ),
    authorLabel: "Kto sprawdza liczby",
    authorNote:
      "Ustawy, taryfy ministerialne i tabele opłat czytam sam i to ja jestem w błędzie, kiedy liczba tutaj jest błędna. Każda liczba na tej stronie została sprawdzona ręcznie ze swoim źródłem, a wyliczenia trzymane są osobno dla każdej jurysdykcji, z datą. Jeśli coś jest nieaktualne, list na powyższy adres dotrze do mnie.",
    portraitAlt: NAME,
    seo: {
      metaTitle: "O projekcie moveandinvest: metoda i kto za to odpowiada",
      metaDescription:
        "Metoda stojąca za porównaniem: wyłącznie źródła pierwotne, data przy każdej liczbie, co świadomie zostało niesprawdzone i z czego utrzymuje się projekt.",
    },
  },
};
