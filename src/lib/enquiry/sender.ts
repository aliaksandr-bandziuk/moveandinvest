import nodemailer from "nodemailer";
import type {
  EnquiryPayload,
  PartnerEnquiryPayload,
  QuestionPayload,
  SubscribePayload,
} from "@/sanity/enquiries";
import { getSiteUrl } from "@/lib/site";
import { renderEmailHtml, renderEmailText, type EmailContent } from "./mailTemplate";

// Email notification for both forms on the site. Ported from the sibling
// `giuseppeiannone` project's src/lib/contact/sender.ts, which is where the
// shape of this file comes from: one sender with a branch rather than two
// senders, a configuration guard that names what is missing, the internal
// notification first and the visitor's confirmation second in its own
// swallowed try/catch, replyTo pointed at the person who wrote.
//
// THE EMAIL IS THE RECORD, not a notification about one. That is the same
// arrangement as the sibling project, arrived at from the opposite direction:
// there it was always true; here the design first assumed a second, private
// Sanity dataset holding the enquiries, and the project's plan turned out not
// to allow one. So the route now treats the two as interchangeable channels —
// an enquiry survives if EITHER the email left or the document landed — and
// tells the visitor it failed only when both did.
//
// What follows from that: this module still never throws, but its result is
// now read by the route rather than ignored, because when the dataset is
// unconfigured this is the only thing standing between an enquiry and
// oblivion. The confirmation to the reader stays a courtesy in its own
// swallowed try/catch — losing it costs politeness, not the lead.
//
// The other difference is what is NOT here. The sibling guards its endpoint
// with a signed form token, which requires the client to fetch one on mount.
// The enquiry form has to work with JavaScript switched off (CLAUDE.md), so
// that layer would break the mechanism it protects. The honeypot and the
// per-IP limit both survive JS being off, and they are what guards this one.
//
// Nothing in this file logs the visitor's own words — not the situation
// field, not a partner's terms — on any path, including the failure paths.
// Only metadata: which variables are missing, and the error itself.

// Fixed facts about the relay rather than secrets, so they live in code
// rather than in three more environment variables to keep in sync between
// .env.local and the host. Only the mailbox credentials are per-environment.
const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;
const SMTP_SECURE = true;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// From and To are the same mailbox today. ONE constant used for both, not two
// that happen to match: pointing notifications at a different address later
// is an edit here, not a search through the file for every place EMAIL_USER
// was reused as a recipient.
const NOTIFY_RECIPIENT = EMAIL_USER;

const REQUIRED_ENV: Record<string, string | undefined> = { EMAIL_USER, EMAIL_PASSWORD };

function missingEnvNames(): string[] {
  return Object.entries(REQUIRED_ENV)
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

export interface SendResult {
  ok: boolean;
  /** Set only when ok is false: "the relay refused" and "it was never set
   *  up" need different responses from whoever reads the log. */
  reason?: "not-configured" | "send-failed";
}

type Locale = "en" | "ru" | "pl";

function isLocale(value: string): value is Locale {
  return value === "en" || value === "ru" || value === "pl";
}

// --- Decoding the stored values ---------------------------------------------
// The form stores machine values ("over800", "half-year") because a label can
// be reworded in Sanity at any time and a stored answer must not change
// meaning when it is. That makes them unreadable in an inbox, so the internal
// notification decodes them here.
//
// Russian, always, whatever locale the visitor used — this email is read by
// one person, and its language is that person's, not the sender's. The
// visitor's own locale is recorded as a line instead, because it is the
// single best clue about which language to reply in.
//
// These maps must stay in step with ALLOWED in src/app/api/enquiry/route.ts.
// A value there with no entry here renders as the raw value rather than
// disappearing — legible enough to notice and fix, and never a silent gap.
// The property brief's third question. Same decode map pattern as the rest:
// the wire value is a stable token, the email says a Russian sentence.
const PURPOSE: Record<string, string> = {
  live: "жить самому",
  let: "сдавать",
  residency: "под ВНЖ",
  unsure: "ещё не решил",
};

const WHERE: Record<string, string> = {
  pt: "Португалия",
  gr: "Греция",
  cy: "Кипр",
  mt: "Мальта",
  ae: "ОАЭ",
  several: "Несколько",
  undecided: "Ещё не определился",
  other: "Страна не из списка",
};

const BUDGET: Record<string, string> = {
  "500": "до €500 000",
  "800": "до €800 000",
  over800: "больше €800 000",
  unknown: "пока не знает",
};

const TIMELINE: Record<string, string> = {
  fast: "за несколько недель",
  "half-year": "до полугода",
  year: "год и больше",
  browsing: "просто смотрит",
};

const GOALS: Record<string, string> = {
  residency: "ВНЖ для семьи",
  tax: "налоговая позиция",
  passport: "паспорт ЕС в перспективе",
  business: "бизнес и банк",
  property: "недвижимость как инвестиция",
};

const ORGANISATION: Record<string, string> = {
  "law-firm": "Юридическая фирма",
  relocation: "Релокационное агентство",
  developer: "Девелопер",
  "estate-agent": "Агентство недвижимости",
};

const LOCALE_LABEL: Record<Locale, string> = {
  en: "английская",
  ru: "русская",
  pl: "польская",
};

function decode(map: Record<string, string>, value: string): string {
  return value ? (map[value] ?? value) : "—";
}

// Written at composition time rather than threaded in as a field: the gap
// between the request arriving and the email being built is well under the
// minute this displays. Europe/Warsaw explicitly, not the server's default —
// a serverless function runs in UTC unless told otherwise, and "submitted at
// 03:14" for a form filled in at five in the morning is a small lie that
// costs you the one thing the line was for.
function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- The internal notifications ---------------------------------------------
// Two blocks, deliberately unequal. The first is the person and their case —
// what gets read first and what a reply is written from. The second is the
// submission's own context, quieter and below, because it describes the
// enquiry rather than the enquirer.
function buildReaderInternal(payload: EnquiryPayload): EmailContent {
  const goals = payload.goals.map((goal) => decode(GOALS, goal)).join(", ");
  const locale = isLocale(payload.locale) ? payload.locale : "en";

  const isBrief = payload.kind === "brief";
  // The short block at the foot of a guide. Carries an address, a sentence and
  // the guide's jurisdiction, and nothing else — so the email must not print
  // rows for a budget and a timeline nobody was asked for.
  const isArticle = payload.kind === "article";

  return {
    // The subject and the heading say which form it came from, because the
    // three need different first moves: an enquiry from the long form is a
    // conversation about a country, a brief is a specific shopping list to
    // hand to one partner, and an enquiry off the foot of a guide is somebody
    // mid-read who has just found the sentence that applies to them — which is
    // the one to answer first, while they are still on the page.
    heading: isBrief
      ? "Бриф по недвижимости"
      : isArticle
        ? "Заявка из гайда"
        : "Новая заявка с сайта",
    openingLine: payload.name
      ? `${payload.name} — ${payload.email}`
      : `Без имени — ${payload.email}`,
    primaryBlock: {
      heading: isBrief ? "Что ищет" : "Случай",
      lines: [
        { label: "Юрисдикция", value: decode(WHERE, payload.where) },
        // Only the brief asks these. Included conditionally rather than shown
        // as "—", so the internal email has no rows that mean nothing.
        ...(isBrief
          ? [
              { label: "Город или район", value: payload.city || "не указан" },
              { label: "Зачем", value: decode(PURPOSE, payload.purpose ?? "") },
            ]
          : []),
        // The short form asks for none of these three, so it prints none of
        // them: a row reading "не указан" for a question nobody was asked is a
        // row that makes the sender look evasive rather than brief.
        ...(isArticle
          ? []
          : [{ label: "Бюджет", value: decode(BUDGET, payload.budget) }]),
        ...(isBrief || isArticle
          ? []
          : [{ label: "Срок", value: decode(TIMELINE, payload.timeline) }]),
        ...(isBrief || isArticle ? [] : [{ label: "Цели", value: goals || "—" }]),
        {
          label: "Своими словами",
          value: payload.situation || "Ничего не написал.",
        },
      ],
    },
    secondaryBlock: {
      heading: "Контекст",
      lines: [
        { label: "Язык страницы", value: LOCALE_LABEL[locale] },
        // WHICH GUIDE IT CAME OFF, and the only place this fact is ever
        // recorded. It is deliberately not sent to analytics — see the note on
        // `source` in src/sanity/enquiries.ts — so if it is not in this email
        // it is nowhere.
        ...(payload.source
          ? [{ label: "Со страницы", value: `/blog/${payload.source}` }]
          : []),
        { label: "Согласие на передачу партнёру", value: payload.consentToShare ? "да" : "нет" },
        { label: "Время", value: formatSubmittedAt(payload.submittedAt) },
      ],
    },
    footNote:
      "Это письмо — сама запись заявки, а не уведомление о ней: приватного датасета " +
      "у проекта нет. Отвечать можно прямо отсюда, адрес человека в Reply-To.",
  };
}

function buildPartnerInternal(payload: PartnerEnquiryPayload): EmailContent {
  return {
    heading: "Ответ партнёра",
    openingLine: payload.name
      ? `${payload.name} — ${payload.email}`
      : `Без имени — ${payload.email}`,
    primaryBlock: {
      heading: "Условия",
      lines: [
        { label: "Юрисдикция", value: decode(WHERE, payload.jurisdiction) },
        { label: "Кто", value: decode(ORGANISATION, payload.organisation) },
        { label: "Что написали", value: payload.terms },
      ],
    },
    secondaryBlock: {
      heading: "Контекст",
      lines: [{ label: "Время", value: formatSubmittedAt(payload.submittedAt) }],
    },
    footNote:
      "Это ответ на исходящее письмо — тот самый вопрос, ради которого рассылка и делалась. " +
      "Отвечать можно прямо отсюда, адрес в Reply-To.",
  };
}

// --- The reader's confirmation ----------------------------------------------
// Short on purpose, and it does not repeat their answers back to them. They
// know what they wrote; the only thing they do not know is what happens next
// and how long it takes. The one promise it makes — a partner in the chosen
// jurisdiction, never resold — is the same promise the page makes, because a
// confirmation that quietly widens the terms is how consent stops meaning
// anything.
function buildReaderConfirmation(payload: EnquiryPayload, locale: Locale): EmailContent {
  const name = payload.name.trim();

  if (locale === "ru") {
    return {
      heading: "Заявка получена",
      openingLine: name ? `${name}, здравствуйте.` : "Здравствуйте.",
      bodyParagraphs: [
        "Пишу подтвердить, что заявка дошла. Её читает человек, автоответчика между нами нет.",
        "Дальше мы передадим её юристу или консультанту, который работает именно в выбранной вами юрисдикции — одному, и только ему. Заявку мы не перепродаём и процента со сделки не берём.",
        "Обычно ответ приходит в течение рабочего дня. Ничего делать в это время не нужно.",
      ],
      footNote:
        "Вы можете в любой момент попросить удалить заявку — ответьте на это письмо одной строкой, и мы её сотрём. " +
        "moveandinvest не является юридической фирмой и не оказывает юридических, налоговых или инвестиционных консультаций.",
    };
  }

  if (locale === "pl") {
    return {
      heading: "Zgłoszenie dotarło",
      openingLine: name ? `Dzień dobry, ${name}.` : "Dzień dobry.",
      bodyParagraphs: [
        "Piszę, żeby potwierdzić, że zgłoszenie dotarło. Czyta je człowiek — między nami nie ma automatu.",
        "Przekażemy je prawnikowi lub doradcy pracującemu dokładnie w wybranej przez Pana/Panią jurysdykcji — jednemu i tylko jemu. Zgłoszeń nie odsprzedajemy i nie bierzemy procentu od transakcji.",
        "Odpowiedź zwykle przychodzi w ciągu jednego dnia roboczego. W międzyczasie nie trzeba nic robić.",
      ],
      footNote:
        "W każdej chwili można poprosić o usunięcie zgłoszenia — wystarczy jedna linijka w odpowiedzi na ten e-mail. " +
        "moveandinvest nie jest kancelarią i nie świadczy porad prawnych, podatkowych ani inwestycyjnych.",
    };
  }

  return {
    heading: "Your enquiry arrived",
    openingLine: name ? `Hello ${name},` : "Hello,",
    bodyParagraphs: [
      "Writing to confirm your enquiry arrived. A person reads these — there is no autoresponder in between.",
      "We will pass it to the lawyer or adviser who works in the jurisdiction you chose — one of them, and only them. We do not resell enquiries and take no percentage of any transaction.",
      "A reply usually comes within one working day. There is nothing you need to do in the meantime.",
    ],
    footNote:
      "You can ask us to delete your enquiry at any time — one line in reply to this email is enough. " +
      "moveandinvest is not a law firm and does not provide legal, tax or investment advice.",
  };
}

const SUBSCRIBE_SUBJECT: Record<Locale, string> = {
  en: "You are on the change list — moveandinvest",
  ru: "Вы в списке изменений — moveandinvest",
  pl: "Jesteś na liście zmian — moveandinvest",
};

const CONFIRMATION_SUBJECT: Record<Locale, string> = {
  en: "Your enquiry arrived — moveandinvest",
  ru: "Заявка получена — moveandinvest",
  pl: "Zgłoszenie dotarło — moveandinvest",
};

// The change list, to us. Two lines and a timestamp — there is nothing else
// to say about it, and padding it with a "context" block would make a
// two-field form look like an enquiry it is not.
function buildSubscribeInternal(payload: SubscribePayload): EmailContent {
  const locale = isLocale(payload.locale) ? payload.locale : "en";
  const picked = payload.jurisdictions.length
    ? payload.jurisdictions.map((code) => decode(WHERE, code)).join(", ")
    : "все пять";

  return {
    heading: "Подписка на изменения",
    openingLine: payload.email,
    primaryBlock: {
      heading: "Подписка",
      lines: [
        { label: "Юрисдикции", value: picked },
        { label: "Язык страницы", value: LOCALE_LABEL[locale] },
        { label: "Время", value: formatSubmittedAt(payload.submittedAt) },
      ],
    },
    footNote:
      "Адрес нужно перенести в список рассылки вручную: своего сервиса рассылки у проекта пока нет, " +
      "и это письмо — единственная запись о подписке.",
  };
}

// What the subscriber gets back, and it is the only email on this site that
// has to survive being read twice: once now, and once in six months when the
// person has forgotten who we are and wants out. So it says what they signed
// up for and how to leave, in the same paragraph, without a tracking link.

// --- The comparison PDF ------------------------------------------------------
// One file per language, generated by `npm run pdf` from the same verified
// figures the site renders. Absolute URL, because a relative href in an email
// resolves against nothing.
//
// Gated behind the address on purpose, and it is worth being clear with
// ourselves about what that does and does not mean: every figure in it is
// already free on the site, unpaywalled, in the same three languages. What the
// PDF adds is the form — four routes on one sheet, printable, the thing you
// forward to whoever is deciding with you. So the exchange is an address for a
// convenience, not an address for a fact, and the confirmation says so rather
// than implying the reader has just unlocked something.
//
// NO PAGE COUNT IN THE LABEL. It said "2 pages" for exactly as long as it took
// to look at the file, and a count maintained by hand in three languages is a
// lie waiting for the next edit. "One sheet" is not a count but the promise
// itself, and scripts/pdf.ts fails the build if the document stops keeping it.
//
// The word "four" IS a hand-maintained count — of CODES in scripts/pdf.ts,
// which prints four of the five jurisdictions. It is repeated here, in
// messages/*.json under `alerts`, and in the PDF's own title (derived there).
// If Cyprus ever gets primary sources, all three move together.
function comparisonLink(locale: Locale): { label: string; href: string } {
  const href = `${getSiteUrl()}/comparison/${locale}.pdf`;

  if (locale === "ru") return { label: "Сравнение четырёх маршрутов — один лист, PDF", href };
  if (locale === "pl") return { label: "Porównanie czterech ścieżek — jedna kartka, PDF", href };
  return { label: "The four routes compared — one printable sheet, PDF", href };
}

function buildSubscribeConfirmation(payload: SubscribePayload, locale: Locale): EmailContent {
  if (locale === "ru") {
    return {
      heading: "Вы в списке",
      openingLine: "Здравствуйте.",
      bodyParagraphs: [
        "Вы попросили сообщать, когда меняется правило. Именно это мы и будем присылать: короткое письмо, когда порог, налог или требование в одной из юрисдикций стало другим — со ссылкой на закон и датой. Не рассылку по расписанию и не новости.",
        "Писем немного по простой причине: правила меняются нечасто. За 2026 год таких изменений набралось меньше десяти на пять стран.",
        "Пока их нет — вот сравнение четырёх маршрутов на одном листе: порог, срок, налоговый режим и полная стоимость первого цикла, с датой проверки каждой цифры. Всё это есть и на сайте бесплатно; в PDF оно просто помещается на два листа и его можно распечатать или переслать.",
        "Ничего, кроме адреса, мы не храним, и никому его не передаём.",
      ],
      link: comparisonLink("ru"),
      footNote:
        "Чтобы отписаться, ответьте на это письмо словом «отписаться» — этого достаточно, подтверждать ничего не нужно. " +
        "moveandinvest не является юридической фирмой и не оказывает юридических, налоговых или инвестиционных консультаций.",
    };
  }

  if (locale === "pl") {
    return {
      heading: "Jesteś na liście",
      openingLine: "Dzień dobry.",
      bodyParagraphs: [
        "Poprosił(a) Pan/Pani o wiadomość, gdy zmienia się przepis. Dokładnie to będziemy wysyłać: krótki e-mail, gdy próg, podatek albo wymóg w jednej z jurysdykcji stanie się inny — z odesłaniem do ustawy i datą. Nie newsletter według harmonogramu i nie wiadomości branżowe.",
        "Listów jest niewiele z prostego powodu: przepisy zmieniają się rzadko. W 2026 roku takich zmian zebrało się mniej niż dziesięć na pięć krajów.",
        "Zanim przyjdzie pierwszy — oto porównanie czterech ścieżek na jednej kartce: próg, termin, reżim podatkowy i pełny koszt pierwszego cyklu, z datą sprawdzenia każdej liczby. Wszystko to jest też na stronie, za darmo; PDF po prostu mieści to na dwóch stronach i daje się wydrukować albo przesłać dalej.",
        "Nie przechowujemy niczego poza adresem i nikomu go nie przekazujemy.",
      ],
      link: comparisonLink("pl"),
      footNote:
        "Aby się wypisać, wystarczy odpowiedzieć na ten e-mail słowem \u201ewypisz\u201d — nic nie trzeba potwierdzać. " +
        "moveandinvest nie jest kancelarią prawną i nie świadczy porad prawnych, podatkowych ani inwestycyjnych.",
    };
  }

  return {
    heading: "You are on the list",
    openingLine: "Hello.",
    bodyParagraphs: [
      "You asked to be told when a rule changes. That is exactly what this is: a short email when a threshold, a tax or a requirement in one of the jurisdictions becomes something else — with the statute and the date. Not a scheduled newsletter, and not industry news.",
      "There will not be many, for a simple reason: rules do not change often. Across 2026 there have been fewer than ten such changes across five countries.",
      "Until the first one arrives, here are the four routes on one sheet: the threshold, the timeline, the tax regime and the full cost of the first cycle, with the date each figure was checked. All of it is on the site too, free; the PDF just fits it onto two pages you can print or forward.",
      "We keep nothing but the address, and pass it to nobody.",
    ],
    link: comparisonLink("en"),
    footNote:
      "To leave, reply to this email with the word \"unsubscribe\" — that is enough, nothing to confirm. " +
      "moveandinvest is not a law firm and does not provide legal, tax or investment advice.",
  };
}

// A question from /contacts, to us.
//
// NO CONFIRMATION GOES BACK, and that is the difference from every other form
// here. An enquiry and a subscription both promise something — a partner, an
// email when a rule changes — so a confirmation is the receipt for a promise.
// A question promises only an answer, and an automatic "we got your question"
// arriving seconds before a human reply is noise at best and, at worst, the
// thing that makes a real reply look automated too.
function buildQuestionInternal(payload: QuestionPayload): EmailContent {
  const locale = isLocale(payload.locale) ? payload.locale : "en";

  return {
    heading: "Вопрос со страницы контактов",
    openingLine: payload.name ? `${payload.name} — ${payload.email}` : `Без имени — ${payload.email}`,
    primaryBlock: {
      heading: "Вопрос",
      lines: [{ label: "Своими словами", value: payload.message }],
    },
    secondaryBlock: {
      heading: "Контекст",
      lines: [
        { label: "Язык страницы", value: LOCALE_LABEL[locale] },
        { label: "Время", value: formatSubmittedAt(payload.submittedAt) },
      ],
    },
    footNote:
      "Это вопрос, а не заявка: юрисдикции, бюджета и согласия на передачу партнёру здесь нет, " +
      "поэтому передавать это письмо никому нельзя — на него отвечаем мы. Адрес в Reply-To.",
  };
}

// --- Sending -----------------------------------------------------------------
function transporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
  });
}

async function notify(subject: string, content: EmailContent, replyTo: string): Promise<SendResult> {
  // No development stub. A stub that returns ok without sending lies about
  // success at exactly the moment — setting SMTP up — when that lie costs
  // most. It fails visibly and names which variables are missing. Names
  // only, never values.
  if (missingEnvNames().length > 0) {
    console.error(
      `[enquiry] Not sending — missing ${missingEnvNames().join(", ")}. ` +
        `If the enquiries dataset is unconfigured too, the enquiry now exists ` +
        `nowhere but the log line the route is about to print.`,
    );
    return { ok: false, reason: "not-configured" };
  }

  try {
    await transporter().sendMail({
      from: EMAIL_USER,
      to: NOTIFY_RECIPIENT,
      replyTo,
      subject,
      html: renderEmailHtml(content),
      text: renderEmailText(content),
    });
    return { ok: true };
  } catch (error) {
    console.error(
      "[enquiry] Notification failed:",
      error instanceof Error ? error.message : error,
    );
    return { ok: false, reason: "send-failed" };
  }
}

/**
 * Notifies us about a reader's enquiry, then sends that reader a
 * confirmation. Never throws.
 *
 * The confirmation goes out only once the notification has actually
 * succeeded, and its own failure is logged and swallowed: the notification
 * reaching a human is the point of this function, and the courtesy on top of
 * it must not be able to report the whole thing as failed.
 */
export async function sendEnquiryEmails(payload: EnquiryPayload): Promise<SendResult> {
  const label =
    payload.kind === "brief"
      ? "Бриф"
      : payload.kind === "article"
        ? "Заявка из гайда"
        : "Заявка с сайта";
  // WHAT GOES AFTER THE DASH. Normally the jurisdiction, which is what a
  // subject line is for — you can triage a mailbox on it. A guide covering
  // several countries sends no jurisdiction at all, and "Заявка из гайда — —"
  // is a subject that triages nothing, so the guide's own slug stands in.
  const about =
    payload.where || !payload.source
      ? decode(WHERE, payload.where)
      : payload.source;

  const result = await notify(
    `${label} — ${about}`,
    buildReaderInternal(payload),
    payload.email,
  );

  if (!result.ok) return result;

  try {
    const locale = isLocale(payload.locale) ? payload.locale : "en";
    const content = buildReaderConfirmation(payload, locale);
    await transporter().sendMail({
      from: EMAIL_USER,
      to: payload.email,
      subject: CONFIRMATION_SUBJECT[locale],
      html: renderEmailHtml(content),
      text: renderEmailText(content),
    });
  } catch (error) {
    console.error(
      "[enquiry] Confirmation to the reader failed (the notification was delivered):",
      error instanceof Error ? error.message : error,
    );
  }

  return result;
}

/**
 * Notifies us about a new subscriber, then confirms to them. Never throws.
 *
 * Same order and the same swallow as the enquiry: the notification is the
 * point, the courtesy on top of it must not be able to report the whole thing
 * as failed. Here it matters more than usual — a subscriber whose confirmation
 * bounced is still subscribed, and the alternative would be dropping them for
 * an error on our side.
 */
export async function sendSubscribeEmails(payload: SubscribePayload): Promise<SendResult> {
  const result = await notify(
    "Подписка на изменения",
    buildSubscribeInternal(payload),
    payload.email,
  );

  if (!result.ok) return result;

  try {
    const locale = isLocale(payload.locale) ? payload.locale : "en";
    const content = buildSubscribeConfirmation(payload, locale);
    await transporter().sendMail({
      from: EMAIL_USER,
      to: payload.email,
      subject: SUBSCRIBE_SUBJECT[locale],
      html: renderEmailHtml(content),
      text: renderEmailText(content),
    });
  } catch (error) {
    console.error(
      "[enquiry] Subscribe confirmation failed (we have the address):",
      error instanceof Error ? error.message : error,
    );
  }

  return result;
}

/**
 * Notifies us about a partner's reply. Never throws.
 *
 * No confirmation back: a firm writing about its own commercial terms is
 * having a conversation, and an automatic "we got it" in the middle of one
 * reads as a machine, not a counterparty.
 */
export async function sendPartnerEmails(payload: PartnerEnquiryPayload): Promise<SendResult> {
  return notify(
    `Ответ партнёра — ${decode(WHERE, payload.jurisdiction)}`,
    buildPartnerInternal(payload),
    payload.email,
  );
}

/**
 * Notifies us about a question from /contacts. Never throws.
 *
 * No confirmation to the sender — see buildQuestionInternal.
 */
export async function sendQuestionEmail(payload: QuestionPayload): Promise<SendResult> {
  return notify("Вопрос со страницы контактов", buildQuestionInternal(payload), payload.email);
}
