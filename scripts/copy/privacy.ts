import type { Locale } from "./jurisdictions";

// The privacy policy, in three languages.
//
// It describes what the site DOES, and — for measurement and advertising —
// what it is about to do, with the difference stated in the text rather than
// hidden. That is the whole discipline of this file.
//
// THE STATUS SECTION IS LOAD-BEARING. Section 04 states the date and says
// that nothing in the three sections after it is switched on yet; those three
// then describe cookies, the measurement tools and the transfers in full. Publishing the mechanism before it runs is the honest
// direction to be early in: a reader can find out what will happen before it
// happens instead of after. Publishing it WITHOUT that sentence would be the
// dishonest direction — a site claiming to track when it does not is as
// wrong as one hiding tracking it does.
//
// WHEN THE TOOLS GO IN, TWO THINGS CHANGE HERE AND NOTHING ELSE: the status
// sentence comes out, and `updated` moves. If a tool is added that is not in
// section 05, section 05 changes first — before the tag ships, not after.
//
// TWO SENTENCES IN HERE ARE PROMISES THE CODE HAS TO KEEP:
//
//   * "Session recording is set to mask what you type" — Microsoft Clarity
//     masks input by default, but the setting is a setting. If Clarity ships
//     without masking confirmed, this sentence is a lie about the most
//     sensitive thing on the site: a person typing their budget and their
//     circumstances into a form.
//   * "Nothing you write in the form is sent to an advertising platform" —
//     which means conversion events may carry the FACT of a submission and
//     never its content. No email, no jurisdiction, no budget, no free text.
//
// Everything else below was checked against the code on 23 August 2026:
// fonts are compiled into the build by next/font, so no visitor IP reaches
// fonts.googleapis.com; the route finder's answers live in sessionStorage and
// are never sent anywhere (RouteFinderControl, EnquiryPrefill); and the site
// itself sets no cookie of its own — next-intl runs with localeDetection off
// and the locale switcher is a plain link.

export interface PrivacySection {
  heading: string;
  body: string;
}

export interface PrivacyCopy {
  eyebrow: string;
  heading: string;
  intro: string;
  /** "Last updated" label; the date itself is a separate field in Sanity so
   *  an editor can change it without touching a sentence. */
  updatedLabel: string;
  updated: string;
  sections: PrivacySection[];
  seo: { metaTitle: string; metaDescription: string };
}

// The controller's own details. Moved to src/lib/controller.ts on 24 Aug 2026,
// when /about and the Organization node in the JSON-LD both started naming the
// same entity — two of the three consumers are rendered by the app, which
// cannot import from scripts/. Re-exported here so this file's own sentences
// keep reading the way they always did.
import { CONTROLLER } from "../../src/lib/controller";

export { CONTROLLER };


export const PRIVACY_COPY: Record<Locale, PrivacyCopy> = {
  en: {
    eyebrow: "Privacy",
    heading: "What we collect, and what we do not",
    intro:
      "This site takes enquiries and passes them to one lawyer or adviser per jurisdiction. That is the only reason it holds anyone's personal data, and this page says exactly what it holds, who else sees it and how to make it go away. It is written to be read rather than to be survived — if something here is unclear, that is a fault worth writing to us about.",
    updatedLabel: "Last updated",
    updated: "24 August 2026",
    sections: [
      {
        heading: "Who is responsible",
        body: `The controller is ${CONTROLLER.name}, ${CONTROLLER.form}, NIP ${CONTROLLER.nip}. Write to ${CONTROLLER.email} about anything on this page — the same address answers enquiries, and a person reads it. If you believe your data has been handled unlawfully you may complain to the Polish supervisory authority, the President of the Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych), ul. Stawki 2, 00-193 Warsaw.`,
      },
      {
        heading: "What we collect",
        body:
          "Only what you type into the enquiry form: your email address, and optionally your name, the jurisdiction you are interested in, a budget range, a timeline, what you are after, and anything you write in your own words. Nothing else about you is collected — there is no account, no profile and no tracking. Our server also records the IP address of a request that trips the form's spam protection or its rate limit, which is the only way to tell an attack from a busy afternoon.",
      },
      {
        heading: "Why, and on what legal basis",
        body:
          "Passing your enquiry to a partner happens on your consent, given by ticking the box on the form, and on nothing else — the box is never pre-ticked and the form does not submit without it (Art. 6(1)(a) GDPR). Replying to you and keeping the form working against spam rest on our legitimate interest in running the site (Art. 6(1)(f)). We do not profile you, and no decision about you is made automatically.",
      },
      {
        heading: "Cookies, and the choice you get",
        body:
          "The site itself sets no cookie. It does not need one: there is no login, no basket and no session — even the language you pick is a plain link rather than something stored on your device. Cookies and similar identifiers appear only with the measurement and advertising tools in the next section, and those load only after you agree. Refusing is one click, the same size as agreeing, and it costs you nothing: every part of this site works identically either way. You can change your mind whenever you like from the same control, and withdrawing is as easy as giving.",
      },
      {
        heading: "Who measures what",
        body:
          "Two tools run, and only after you agree. Google Analytics 4 (Google Ireland Ltd) — how many people arrive and which pages they read; it sets cookies. Microsoft Clarity (Microsoft Ireland Operations Ltd) — heatmaps and session recordings, so we can see where a page confuses people; session recording is set to mask what you type, so the contents of the enquiry form are not recorded. Advertising measurement — a Meta pixel or Google Ads tags — is described here because it is the likeliest addition, and it is NOT in use today: no advertising tag is loaded on this site, with or without your agreement. If that changes, this paragraph changes before the tag ships. Two more tools involve you in nothing at all and therefore ask for nothing: Google Search Console and Bing Webmaster Tools show us how the site appears in search results, set no cookie and never see a visitor.",
      },
      {
        heading: "Data leaving the EEA",
        body:
          "The suppliers above are contracted through their Irish entities, and their parent companies are in the United States. Where data reaches the US it does so under the EU–US Data Privacy Framework, and where a supplier is not certified under it, under the European Commission's standard contractual clauses. This is the honest limit of what we can promise: we choose suppliers who offer those safeguards and we cannot audit what a company the size of Google does with a request from its own government. If that is not acceptable to you, refusing consent keeps every one of them off your device entirely.",
      },
      {
        heading: "Who else sees it",
        body:
          "One partner — the lawyer or adviser who works in the jurisdiction you chose — and only if you ticked the consent box. One partner per jurisdiction: your enquiry is never sent to several firms, never resold and never listed anywhere. Three suppliers process data on our behalf simply to run the site: Vercel Inc. hosts it, Hostinger handles the mailbox your enquiry arrives in, and Sanity serves the images. None of the measurement or advertising tools is ever sent what you wrote.",
      },
      {
        heading: "The change list",
        body:
          "You can leave an email address on its own, without sending an enquiry, to be told when a rule changes. It is a separate purpose with a separate tick-box and separate consent: this address is never used to introduce you to a partner, and the enquiry consent is never read as permission to email you. We keep the address and, if you chose them, the jurisdictions you asked about — nothing else, no name, no page history. It stays until you leave, which takes one word in a reply to any of the emails; there is no confirmation step and nothing to justify. The list lives in the same mailbox as everything else and is not held by an email marketing service.",
      },
      {
        heading: "How long we keep it",
        body:
          "Your enquiry lives in our mailbox until you withdraw your consent or ask us to delete it. One line in reply to the confirmation email is enough, and it is not a support ticket — erasure is a right, not a favour. Once you ask, we delete our copy and ask the partner who received it to do the same.",
      },
      {
        heading: "Your rights",
        body:
          "You can ask for a copy of what we hold, have it corrected, have it deleted, have its use restricted, receive it in a portable form, object to it being processed, and withdraw your consent at any time — withdrawing does not undo what was lawful before it. All of it goes to the same address, and none of it costs anything. You also have the right to complain to the supervisory authority named above.",
      },
      {
        heading: "What we do not do, whatever you agree to",
        body:
          "Nothing you write in the enquiry form is ever sent to an advertising platform. If a tool one day records that an enquiry was submitted, it records that fact and nothing in it — not your email address, not the jurisdiction, not the budget, not a word of what you typed. We do not sell data and have nothing to sell. We build no advertising audience out of enquirers. The fonts are compiled into the site itself, so your browser never contacts Google to fetch them, agreement or not. And the answers you give the route finder stay in your own browser tab: they are never sent to us at all, which is why they are not in any of the sections above.",
      },
      {
        heading: "Changes to this page",
        body:
          "When what we do changes, this page changes first and its date changes with it. A change that affects what we may do with data already collected — a new supplier, a new purpose, anything involving cookies — is asked for again rather than announced.",
      },
    ],
    seo: {
      metaTitle: "Privacy — moveandinvest",
      metaDescription:
        "What moveandinvest collects, why, who else sees it and how to have it deleted — plus what measurement would run, and the choice you get over it.",
    },
  },

  ru: {
    eyebrow: "Конфиденциальность",
    heading: "Что мы собираем и чего не делаем",
    intro:
      "Сайт принимает заявки и передаёт их одному юристу или консультанту на юрисдикцию. Это единственная причина, по которой он вообще хранит чьи-то персональные данные, и на этой странице написано, что именно хранится, кто ещё это видит и как всё удалить. Она написана, чтобы её прочли, а не чтобы её пережили: если что-то здесь непонятно — это наша недоработка, и о ней стоит нам написать.",
    updatedLabel: "Обновлено",
    updated: "24 августа 2026",
    sections: [
      {
        heading: "Кто отвечает",
        body: `Контролёр данных — ${CONTROLLER.name}, ${CONTROLLER.form}, NIP ${CONTROLLER.nip}. По любому вопросу с этой страницы пишите на ${CONTROLLER.email} — на этот же адрес приходят заявки, и читает их человек. Если считаете, что с вашими данными обошлись незаконно, вы вправе пожаловаться в польский надзорный орган: Prezes Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.`,
      },
      {
        heading: "Что мы собираем",
        body:
          "Только то, что вы сами вписали в форму заявки: адрес почты и, по желанию, имя, интересующую юрисдикцию, диапазон бюджета, срок, цели и всё, что вы написали своими словами. Больше о вас не собирается ничего — здесь нет ни аккаунтов, ни профилей, ни слежки. Сервер дополнительно записывает IP-адрес запроса, который сработал на защите от спама или упёрся в ограничение частоты: иначе не отличить атаку от оживлённого дня.",
      },
      {
        heading: "Зачем и на каком основании",
        body:
          "Передача заявки партнёру происходит на основании вашего согласия — той самой галочки в форме, и ни на чём другом. Галочка никогда не проставлена заранее, и без неё форма не отправляется (ст. 6(1)(a) GDPR). Ответ вам и защита формы от спама опираются на наш законный интерес в работе сайта (ст. 6(1)(f)). Мы не строим ваш профиль, и никакое решение о вас не принимается автоматически.",
      },
      {
        heading: "Cookie и выбор, который у вас есть",
        body:
          "Сам сайт не ставит ни одного файла cookie. Ему нечего в них хранить: здесь нет входа в аккаунт, нет корзины и нет сессии — даже выбранный язык это обычная ссылка, а не запись на вашем устройстве. Cookie и похожие идентификаторы появляются только вместе с инструментами измерения и рекламы из следующего раздела, и загружаются они лишь после вашего согласия. Отказ — это один клик такого же размера, как согласие, и он ничего вам не стоит: сайт работает одинаково в обоих случаях. Передумать можно в любой момент через тот же переключатель, и отозвать согласие так же просто, как дать.",
      },
      {
        heading: "Кто и что измеряет",
        body:
          "Работают два инструмента, и только после вашего согласия. Google Analytics 4 (Google Ireland Ltd) — сколько людей приходит и какие страницы читает; ставит cookie. Microsoft Clarity (Microsoft Ireland Operations Ltd) — тепловые карты и записи сессий, чтобы видеть, где страница сбивает с толку; запись сессий настроена так, чтобы маскировать вводимый текст, поэтому содержимое формы заявки не записывается. Рекламное измерение — пиксель Meta или теги Google Ads — описано здесь потому, что это наиболее вероятное добавление, и сегодня оно НЕ используется: ни один рекламный тег на сайте не загружается, ни с вашим согласием, ни без. Если это изменится, этот абзац изменится раньше, чем поедет тег. Ещё два инструмента вас не касаются вовсе и потому ничего не спрашивают: Google Search Console и Bing Webmaster Tools показывают нам, как сайт выглядит в поиске, не ставят cookie и не видят посетителя.",
      },
      {
        heading: "Передача за пределы ЕЭЗ",
        body:
          "Договоры с перечисленными выше подрядчиками заключаются с их ирландскими юрлицами, а материнские компании находятся в США. Там, где данные попадают в США, это происходит в рамках EU–US Data Privacy Framework, а если подрядчик под ним не сертифицирован — на основании стандартных договорных условий Еврокомиссии. Здесь честный предел того, что мы можем обещать: мы выбираем подрядчиков, предлагающих такие гарантии, и не можем проверить, что компания размера Google делает с запросом собственного правительства. Если вас это не устраивает, отказ от согласия оставляет их всех вне вашего устройства полностью.",
      },
      {
        heading: "Кто ещё это видит",
        body:
          "Один партнёр — юрист или консультант, который работает в выбранной вами юрисдикции, — и только если вы поставили галочку согласия. Один партнёр на юрисдикцию: заявка не уходит в несколько фирм, не перепродаётся и нигде не публикуется. Три подрядчика обрабатывают данные по нашему поручению просто для работы сайта: Vercel Inc. его хостит, Hostinger обслуживает почтовый ящик, куда приходит заявка, Sanity отдаёт изображения. Ни одному инструменту измерения или рекламы то, что вы написали, не передаётся никогда.",
      },
      {
        heading: "Список изменений",
        body:
          "Адрес почты можно оставить отдельно, не отправляя заявку, — чтобы получать письмо, когда меняется правило. Это отдельная цель с отдельной галочкой и отдельным согласием: этот адрес никогда не используется, чтобы свести вас с партнёром, а согласие в форме заявки никогда не читается как разрешение писать вам. Мы храним адрес и, если вы их выбрали, юрисдикции, по которым вы просили сообщать, — и больше ничего: ни имени, ни истории страниц. Он хранится, пока вы не уйдёте, а уход — это одно слово в ответ на любое из писем; шага подтверждения нет и обосновывать ничего не нужно. Список лежит в том же почтовом ящике, что и всё остальное, и не находится в сервисе email-рассылок.",
      },
      {
        heading: "Сколько храним",
        body:
          "Заявка лежит в нашем почтовом ящике до тех пор, пока вы не отзовёте согласие или не попросите её удалить. Достаточно одной строки в ответ на письмо-подтверждение, и это не заявка в поддержку: удаление — право, а не одолжение. После вашей просьбы мы удаляем свою копию и просим партнёра, который её получил, сделать то же самое.",
      },
      {
        heading: "Ваши права",
        body:
          "Вы можете запросить копию того, что у нас есть, потребовать исправить, удалить, ограничить обработку, получить данные в переносимом виде, возразить против обработки и в любой момент отозвать согласие — отзыв не отменяет того, что было законным до него. Всё это на тот же адрес и бесплатно. Кроме того, у вас есть право пожаловаться в надзорный орган, названный выше.",
      },
      {
        heading: "Чего мы не делаем, на что бы вы ни согласились",
        body:
          "То, что вы написали в форме заявки, никогда не уходит в рекламную платформу. Если однажды инструмент зафиксирует, что заявка была отправлена, он зафиксирует сам факт и ничего из её содержимого — ни адрес почты, ни юрисдикцию, ни бюджет, ни слова из вашего текста. Данные мы не продаём, и продавать нам нечего. Рекламную аудиторию из тех, кто оставил заявку, мы не собираем. Шрифты вшиты в сам сайт, поэтому браузер не обращается за ними к Google — независимо от вашего согласия. А ответы, которые вы даёте подборщику маршрута, остаются во вкладке вашего браузера: к нам они не уходят вообще, поэтому их и нет ни в одном разделе выше.",
      },
      {
        heading: "Изменения на этой странице",
        body:
          "Когда меняется то, что мы делаем, сначала меняется эта страница, и вместе с ней — дата наверху. Изменение, которое затрагивает уже собранные данные — новый подрядчик, новая цель, что угодно связанное с cookie, — не объявляется, а спрашивается заново.",
      },
    ],
    seo: {
      metaTitle: "Конфиденциальность — moveandinvest",
      metaDescription:
        "Что moveandinvest собирает, зачем, кто ещё это видит и как всё удалить — и какие измерения будут работать, и какой у вас выбор.",
    },
  },

  pl: {
    eyebrow: "Prywatność",
    heading: "Co zbieramy i czego nie robimy",
    intro:
      "Ta strona przyjmuje zgłoszenia i przekazuje je jednemu prawnikowi lub doradcy na jurysdykcję. To jedyny powód, dla którego w ogóle przechowuje czyjekolwiek dane osobowe, a poniżej napisane jest dokładnie co przechowuje, kto jeszcze to widzi i jak to usunąć. Napisaliśmy to tak, żeby dało się przeczytać, a nie przetrwać — jeśli coś jest niejasne, to nasza wina i warto nam o tym napisać.",
    updatedLabel: "Aktualizacja",
    updated: "24 sierpnia 2026",
    sections: [
      {
        heading: "Kto odpowiada",
        body: `Administratorem danych jest ${CONTROLLER.name}, ${CONTROLLER.form}, NIP ${CONTROLLER.nip}. W każdej sprawie z tej strony proszę pisać na ${CONTROLLER.email} — na ten sam adres trafiają zgłoszenia i czyta je człowiek. Jeśli uważasz, że Twoje dane potraktowano niezgodnie z prawem, masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.`,
      },
      {
        heading: "Co zbieramy",
        body:
          "Wyłącznie to, co sam wpiszesz w formularz: adres e-mail oraz opcjonalnie imię, interesującą Cię jurysdykcję, przedział budżetu, termin, cele i wszystko, co napiszesz własnymi słowami. Nic więcej o Tobie nie jest zbierane — nie ma tu kont, profili ani śledzenia. Serwer zapisuje dodatkowo adres IP żądania, które uruchomiło zabezpieczenie przed spamem albo limit częstotliwości: inaczej nie da się odróżnić ataku od ruchliwego dnia.",
      },
      {
        heading: "Po co i na jakiej podstawie",
        body:
          "Przekazanie zgłoszenia partnerowi odbywa się na podstawie Twojej zgody — tego zaznaczenia w formularzu i niczego innego. Pole nigdy nie jest zaznaczone z góry, a bez niego formularz się nie wyśle (art. 6 ust. 1 lit. a RODO). Odpowiedź do Ciebie i ochrona formularza przed spamem opierają się na naszym prawnie uzasadnionym interesie w prowadzeniu strony (art. 6 ust. 1 lit. f). Nie profilujemy Cię i żadna decyzja o Tobie nie zapada automatycznie.",
      },
      {
        heading: "Cookie i wybór, który masz",
        body:
          "Sama strona nie ustawia żadnego pliku cookie. Nie ma czego w nich trzymać: nie ma logowania, koszyka ani sesji — nawet wybrany język to zwykły odnośnik, a nie zapis na Twoim urządzeniu. Cookie i podobne identyfikatory pojawiają się wyłącznie razem z narzędziami pomiarowymi i reklamowymi z następnej sekcji, a te ładują się dopiero po Twojej zgodzie. Odmowa to jedno kliknięcie tej samej wielkości co zgoda i nic Cię nie kosztuje: strona działa tak samo w obu przypadkach. Zdanie można zmienić w każdej chwili tym samym przełącznikiem, a wycofanie zgody jest równie proste jak jej udzielenie.",
      },
      {
        heading: "Kto i co mierzy",
        body:
          "Działają dwa narzędzia i tylko po Twojej zgodzie. Google Analytics 4 (Google Ireland Ltd) — ile osób przychodzi i które strony czyta; ustawia cookie. Microsoft Clarity (Microsoft Ireland Operations Ltd) — mapy ciepła i nagrania sesji, żebyśmy widzieli, gdzie strona wprowadza w błąd; nagrywanie sesji jest ustawione tak, by maskować wpisywany tekst, więc zawartość formularza nie jest nagrywana. Pomiar reklamowy — piksel Meta lub tagi Google Ads — jest tu opisany, bo to najbardziej prawdopodobne rozszerzenie, i dziś NIE jest używany: żaden tag reklamowy nie ładuje się na tej stronie, ani za Twoją zgodą, ani bez niej. Jeśli to się zmieni, ten akapit zmieni się wcześniej niż tag. Dwa kolejne narzędzia w ogóle Cię nie dotyczą i dlatego o nic nie pytają: Google Search Console i Bing Webmaster Tools pokazują nam, jak strona wygląda w wynikach wyszukiwania, nie ustawiają cookie i nie widzą odwiedzającego.",
      },
      {
        heading: "Przekazywanie poza EOG",
        body:
          "Umowy z powyższymi dostawcami zawieramy z ich irlandzkimi podmiotami, a spółki matki mają siedziby w Stanach Zjednoczonych. Tam, gdzie dane trafiają do USA, dzieje się to w ramach EU–US Data Privacy Framework, a jeśli dostawca nie jest w nim certyfikowany — na podstawie standardowych klauzul umownych Komisji Europejskiej. To uczciwa granica tego, co możemy obiecać: wybieramy dostawców oferujących takie zabezpieczenia i nie jesteśmy w stanie skontrolować, co firma wielkości Google robi z żądaniem własnego rządu. Jeśli Ci to nie odpowiada, odmowa zgody trzyma ich wszystkich całkowicie poza Twoim urządzeniem.",
      },
      {
        heading: "Kto jeszcze to widzi",
        body:
          "Jeden partner — prawnik lub doradca pracujący w wybranej przez Ciebie jurysdykcji — i tylko wtedy, gdy zaznaczyłeś zgodę. Jeden partner na jurysdykcję: zgłoszenie nie trafia do kilku firm, nie jest odsprzedawane ani nigdzie publikowane. Trzej dostawcy przetwarzają dane na nasze zlecenie po prostu po to, by strona działała: Vercel Inc. ją hostuje, Hostinger obsługuje skrzynkę, do której trafia zgłoszenie, Sanity serwuje obrazy. Żadnemu narzędziu pomiarowemu ani reklamowemu to, co napisałeś, nie jest przekazywane nigdy.",
      },
      {
        heading: "Lista zmian",
        body:
          "Adres e-mail można zostawić osobno, bez wysyłania zgłoszenia — po to, by dostać wiadomość, gdy zmienia się przepis. To odrębny cel z odrębnym polem wyboru i odrębną zgodą: ten adres nigdy nie służy do skontaktowania Państwa z partnerem, a zgoda w formularzu zgłoszenia nigdy nie jest czytana jako pozwolenie na wysyłanie e-maili. Przechowujemy adres oraz, jeśli zostały wybrane, jurysdykcje, o których prosili Państwo informować — i nic poza tym: ani imienia, ani historii stron. Zostaje do momentu rezygnacji, a rezygnacja to jedno słowo w odpowiedzi na dowolny z listów; nie ma kroku potwierdzenia i niczego nie trzeba uzasadniać. Lista znajduje się w tej samej skrzynce co wszystko inne i nie jest przechowywana w serwisie do wysyłki e-maili.",
      },
      {
        heading: "Jak długo przechowujemy",
        body:
          "Zgłoszenie leży w naszej skrzynce do momentu, w którym cofniesz zgodę albo poprosisz o usunięcie. Wystarczy jedna linijka w odpowiedzi na e-mail potwierdzający i nie jest to zgłoszenie do wsparcia: usunięcie to prawo, nie przysługa. Po Twojej prośbie kasujemy swoją kopię i prosimy partnera, który ją otrzymał, żeby zrobił to samo.",
      },
      {
        heading: "Twoje prawa",
        body:
          "Możesz zażądać kopii tego, co mamy, sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia danych, wnieść sprzeciw wobec przetwarzania i w każdej chwili cofnąć zgodę — cofnięcie nie unieważnia tego, co było zgodne z prawem wcześniej. Wszystko na ten sam adres i bezpłatnie. Masz też prawo wnieść skargę do organu nadzorczego wskazanego wyżej.",
      },
      {
        heading: "Czego nie robimy, na cokolwiek się zgodzisz",
        body:
          "To, co napiszesz w formularzu, nigdy nie trafia do platformy reklamowej. Jeśli kiedyś narzędzie odnotuje, że zgłoszenie zostało wysłane, odnotuje sam fakt i nic z jego treści — ani adresu e-mail, ani jurysdykcji, ani budżetu, ani słowa z tego, co napisałeś. Danych nie sprzedajemy i nie mamy czego sprzedawać. Nie budujemy grupy odbiorców reklam z osób, które wysłały zgłoszenie. Czcionki są wkompilowane w samą stronę, więc przeglądarka nie łączy się po nie z Google — niezależnie od Twojej zgody. A odpowiedzi dla kreatora trasy zostają w karcie Twojej przeglądarki: do nas nie trafiają w ogóle i dlatego nie ma ich w żadnej z sekcji powyżej.",
      },
      {
        heading: "Zmiany na tej stronie",
        body:
          "Kiedy zmienia się to, co robimy, najpierw zmienia się ta strona, a razem z nią data u góry. Zmiana dotykająca danych już zebranych — nowy dostawca, nowy cel, cokolwiek związanego z cookie — nie jest ogłaszana, tylko pytana od nowa.",
      },
    ],
    seo: {
      metaTitle: "Prywatność — moveandinvest",
      metaDescription:
        "Co moveandinvest zbiera, po co, kto jeszcze to widzi i jak to usunąć — oraz jakie pomiary będą działać i jaki masz nad nimi wybór.",
    },
  },
};
