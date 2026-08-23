import nodemailer from "nodemailer";
import type { EnquiryPayload, PartnerEnquiryPayload } from "@/sanity/enquiries";
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

  return {
    heading: "Новая заявка с сайта",
    openingLine: payload.name
      ? `${payload.name} — ${payload.email}`
      : `Без имени — ${payload.email}`,
    primaryBlock: {
      heading: "Случай",
      lines: [
        { label: "Юрисдикция", value: decode(WHERE, payload.where) },
        { label: "Бюджет", value: decode(BUDGET, payload.budget) },
        { label: "Срок", value: decode(TIMELINE, payload.timeline) },
        { label: "Цели", value: goals || "—" },
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

const CONFIRMATION_SUBJECT: Record<Locale, string> = {
  en: "Your enquiry arrived — moveandinvest",
  ru: "Заявка получена — moveandinvest",
  pl: "Zgłoszenie dotarło — moveandinvest",
};

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
  const result = await notify(
    `Заявка с сайта — ${decode(WHERE, payload.where)}`,
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
