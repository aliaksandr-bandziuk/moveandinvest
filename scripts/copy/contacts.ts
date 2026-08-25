import type { Locale } from "./jurisdictions";

// The /contacts page, in three languages.
//
// WHY IT EXISTS, since the honest answer is not the usual one. It is NOT here
// because Google requires a page called "Contact" — it does not; the rater
// guidance asks that ownership and contactability be clear, and names the About
// page as the natural home. What is genuinely missing without this page is a
// HUMAN CHANNEL. A law firm that receives a cold email checks whether the thing
// is real, and a form is not that check: a number that is answered and a
// message that gets a reply within the hour are. That audience, not a crawler,
// is what this page is for.
//
// ITS FORM IS NOT THE ENQUIRY FORM, and the copy says so out loud rather than
// leaving a visitor to discover it. An enquiry carries a jurisdiction, a
// budget, a timeline and consent to be passed to one partner — that consent is
// what makes it actionable. A question carries none of those and is answered by
// us and nobody else. Two forms that look alike and behave differently is how a
// reader who wanted an introduction ends up in a mailbox instead, so the deck
// routes them: want a partner, use the enquiry; want an answer, use this.
//
// CHANNELS THAT DO NOT EXIST DO NOT APPEAR. The labels below are written for
// every channel the project may ever have, but src/lib/contactChannels.ts
// decides which of them render. That is the same rule as the portrait on
// /about, and it exists because this site has twice printed a way to reach it
// that reached nobody — see the note in contactChannels.ts.

export interface ContactsCopy {
  eyebrow: string;
  heading: string;
  intro: string;

  /** The channels block. */
  channelsLabel: string;
  emailLabel: string;
  emailNote: string;
  phoneLabel: string;
  phoneNote: string;
  whatsappLabel: string;
  whatsappNote: string;
  bookingLabel: string;
  bookingNote: string;
  bookingCta: string;
  socialsLabel: string;

  /** The question form. */
  formHeading: string;
  formBody: string;
  nameLabel: string;
  emailFieldLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };

  /** Where somebody who wants a partner should go instead. */
  enquiryLead: string;
  enquiryCta: string;

  /** The legal identity block. The values come from CONTROLLER, never from
   *  here — only the label is copy. */
  identityLabel: string;

  seo: { metaTitle: string; metaDescription: string };
}

export const CONTACTS_COPY: Record<Locale, ContactsCopy> = {
  en: {
    eyebrow: "Contact",
    heading: "How to reach a person here",
    intro:
      "One mailbox, and a phone that is answered. If you want to be introduced to a lawyer or an adviser in one of these jurisdictions, the enquiry form is the faster route — it asks the four things any of them will ask you first, and it goes to one partner rather than into a queue. For anything else, including whether a figure on this site is wrong, use whichever of these suits you.",

    channelsLabel: "Direct",
    emailLabel: "Email",
    emailNote: "Read by a person. A reply usually comes the same working day.",
    phoneLabel: "Phone",
    phoneNote: "Central European time, working hours. If it rings out, write instead — it gets answered.",
    whatsappLabel: "WhatsApp",
    whatsappNote: "The same number. Often the fastest of these.",
    bookingLabel: "A call",
    bookingNote: "Twenty minutes, no charge, and nothing is sold on it.",
    bookingCta: "Pick a time",
    socialsLabel: "Elsewhere",

    formHeading: "Ask a question",
    formBody:
      "This form is for questions about the site, its figures and how it works — not for an introduction to a partner. It goes to the same mailbox and is answered by the same person; nothing written here is passed to anybody.",
    nameLabel: "Name",
    emailFieldLabel: "Email",
    emailPlaceholder: "you@example.com",
    messageLabel: "Your question",
    messagePlaceholder: "",
    honeypotLabel: "Leave this field empty",
    submitLabel: "Send",
    fine: "We keep what you write only as long as answering it takes.",
    privacyLabel: "How we handle your data",
    sent: {
      title: "It arrived.",
      body: "A person reads these. A reply usually comes within one working day.",
    },
    error: {
      title: "That did not go through.",
      body: "An email address and a question are the two things we cannot proceed without.",
    },
    broke: {
      title: "That is on us.",
      body: "The message did not reach us — the fault is at our end. Write to {email} directly and it will.",
    },

    enquiryLead: "Looking to be introduced to a lawyer or an adviser?",
    enquiryCta: "Use the enquiry form",

    identityLabel: "Who you are writing to",

    seo: {
      metaTitle: "Contact moveandinvest: email, phone and a call",
      metaDescription:
        "How to reach a person at moveandinvest: one mailbox that is read, a phone that is answered, and a form for questions about the figures. Legal identity and registered details included.",
    },
  },

  ru: {
    eyebrow: "Контакты",
    heading: "Как здесь связаться с человеком",
    intro:
      "Один почтовый ящик и телефон, на который отвечают. Если вам нужно знакомство с юристом или консультантом в одной из юрисдикций — быстрее через форму заявки: она спрашивает те четыре вещи, о которых любой из них спросит вас первым делом, и уходит одному партнёру, а не в очередь. По всему остальному, включая «у вас тут цифра неверная», — любым из способов ниже.",

    channelsLabel: "Напрямую",
    emailLabel: "Почта",
    emailNote: "Читает человек. Ответ обычно в тот же рабочий день.",
    phoneLabel: "Телефон",
    phoneNote: "Центральноевропейское время, рабочие часы. Если не дозвонились — напишите, на письмо ответим точно.",
    whatsappLabel: "WhatsApp",
    whatsappNote: "Тот же номер. Часто самый быстрый способ из этих.",
    bookingLabel: "Разговор",
    bookingNote: "Двадцать минут, бесплатно, и ничего на нём не продают.",
    bookingCta: "Выбрать время",
    socialsLabel: "Ещё",

    formHeading: "Задать вопрос",
    formBody:
      "Эта форма — для вопросов о сайте, его цифрах и о том, как всё устроено, а не для знакомства с партнёром. Она уходит в тот же ящик и отвечает на неё тот же человек; ничто написанное здесь никому не передаётся.",
    nameLabel: "Имя",
    emailFieldLabel: "Почта",
    emailPlaceholder: "you@example.com",
    messageLabel: "Ваш вопрос",
    messagePlaceholder: "",
    honeypotLabel: "Оставьте это поле пустым",
    submitLabel: "Отправить",
    fine: "Написанное храним ровно столько, сколько нужно, чтобы ответить.",
    privacyLabel: "Как мы обращаемся с данными",
    sent: {
      title: "Дошло.",
      body: "Это читает человек. Ответ обычно в течение рабочего дня.",
    },
    error: {
      title: "Не отправилось.",
      body: "Адрес почты и сам вопрос — без них никак.",
    },
    broke: {
      title: "Это на нашей стороне.",
      body: "Сообщение до нас не дошло, и дело не в том, что вы написали. Напишите напрямую на {email} — так дойдёт.",
    },

    enquiryLead: "Нужно знакомство с юристом или консультантом?",
    enquiryCta: "Через форму заявки",

    identityLabel: "Кому вы пишете",

    seo: {
      metaTitle: "Контакты moveandinvest: почта, телефон и разговор",
      metaDescription:
        "Как связаться с человеком в moveandinvest: почтовый ящик, который читают, телефон, на который отвечают, и форма для вопросов по цифрам. С юридическими реквизитами.",
    },
  },

  pl: {
    eyebrow: "Kontakt",
    heading: "Jak skontaktować się tu z człowiekiem",
    intro:
      "Jedna skrzynka i telefon, który jest odbierany. Jeśli szuka Pan/Pani kontaktu z prawnikiem albo doradcą w jednej z jurysdykcji — szybciej przez formularz zgłoszenia: pyta o te cztery rzeczy, o które każdy z nich zapyta najpierw, i trafia do jednego partnera, a nie do kolejki. We wszystkim pozostałym, łącznie z „macie tu błędną liczbę”, proszę wybrać dowolny ze sposobów poniżej.",

    channelsLabel: "Bezpośrednio",
    emailLabel: "E-mail",
    emailNote: "Czyta człowiek. Odpowiedź zwykle tego samego dnia roboczego.",
    phoneLabel: "Telefon",
    phoneNote: "Czas środkowoeuropejski, godziny pracy. Jeśli nikt nie odbierze — proszę napisać, na e-mail odpowiemy na pewno.",
    whatsappLabel: "WhatsApp",
    whatsappNote: "Ten sam numer. Często najszybszy z tych sposobów.",
    bookingLabel: "Rozmowa",
    bookingNote: "Dwadzieścia minut, bezpłatnie, i nic się na niej nie sprzedaje.",
    bookingCta: "Wybierz termin",
    socialsLabel: "Gdzie indziej",

    formHeading: "Zadaj pytanie",
    formBody:
      "Ten formularz służy do pytań o stronę, jej liczby i o to, jak wszystko działa — nie do kontaktu z partnerem. Trafia do tej samej skrzynki i odpowiada na niego ta sama osoba; nic z tego, co tu napisane, nie jest nikomu przekazywane.",
    nameLabel: "Imię",
    emailFieldLabel: "E-mail",
    emailPlaceholder: "ty@przyklad.pl",
    messageLabel: "Pytanie",
    messagePlaceholder: "",
    honeypotLabel: "Zostaw to pole puste",
    submitLabel: "Wyślij",
    fine: "To, co Pan/Pani napisze, przechowujemy dokładnie tak długo, jak trwa udzielenie odpowiedzi.",
    privacyLabel: "Jak obchodzimy się z danymi",
    sent: {
      title: "Dotarło.",
      body: "Czyta to człowiek. Odpowiedź zwykle w ciągu jednego dnia roboczego.",
    },
    error: {
      title: "Nie wysłało się.",
      body: "Adres e-mail i samo pytanie — bez tych dwóch się nie da.",
    },
    broke: {
      title: "To po naszej stronie.",
      body: "Wiadomość do nas nie dotarła i nie chodzi o to, co Pan/Pani napisał(a). Proszę napisać bezpośrednio na {email} — tak dotrze.",
    },

    enquiryLead: "Szuka Pan/Pani kontaktu z prawnikiem albo doradcą?",
    enquiryCta: "Przez formularz zgłoszenia",

    identityLabel: "Do kogo Pan/Pani pisze",

    seo: {
      metaTitle: "Kontakt moveandinvest: e-mail, telefon i rozmowa",
      metaDescription:
        "Jak skontaktować się z człowiekiem w moveandinvest: skrzynka, którą się czyta, telefon, który jest odbierany, i formularz pytań o liczby. Z danymi rejestrowymi.",
    },
  },
};
