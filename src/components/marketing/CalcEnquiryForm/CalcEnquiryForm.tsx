import { LeadTracking } from "@/components/layout";

import styles from "./CalcEnquiryForm.module.scss";

export interface CalcEnquiryLabels {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  reachLabel: string;
  reachPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  consentLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };
}

interface CalcEnquiryFormProps {
  labels: CalcEnquiryLabels;
  locale: string;
  privacyHref: string;
}

// THE FORM THE CALCULATOR OPENS. Four fields and a checkbox, and it fits in the
// box without scrolling — which is the whole specification.
//
// WHY NOT THE LONG FORM, which is what this replaced after one build. That one
// asks six qualifying questions because what it produces goes to a partner
// unedited, and /for-partners describes those six fields to the firms that
// receive them. This one produces something else: a conversation. The reader
// has just done arithmetic about their own money and wants to know what it
// means for their case; the answer to that is a call or a letter, and the
// questions that make a case qualified get asked in it, by a person, who can
// hear "my wife has a different passport" and know what it changes.
//
// So the ask here is the smallest one that makes a reply possible: who you are,
// where to reach you, and anything you already know is unusual about your case.
// Nothing about budget — the calculator has that to the euro and it rides along
// hidden.
//
// THE CONSENT IS TO BE CONTACTED, and it is not the enquiry form's consent to
// be passed to a firm. Different purpose, different basis, different
// withdrawal; one checkbox covering both is the shape a regulator reads as
// bundled, and it would also be untrue here — nothing is passed anywhere until
// there has been a conversation.
export function CalcEnquiryForm({ labels, locale, privacyHref }: CalcEnquiryFormProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.result} id="calc-sent">
        <p className={styles.resultTitle}>{labels.sent.title}</p>
        <p className={styles.resultBody}>{labels.sent.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="calc-error">
        <p className={styles.resultTitle}>{labels.error.title}</p>
        <p className={styles.resultBody}>{labels.error.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="calc-failed">
        <p className={styles.resultTitle}>{labels.broke.title}</p>
        <p className={styles.resultBody}>{labels.broke.body}</p>
      </div>

      <LeadTracking formId="calc-form" successHash="calc-sent" kind="enquiry" />

      <form id="calc-form" className={styles.form} method="post" action="/api/enquiry">
        <input type="hidden" name="kind" value="calc" />
        <input type="hidden" name="locale" value={locale} />
        {/* THE READER'S OWN FIGURES. Filled by the calculator's control from
            the handover in src/lib/routeAnswers.ts; empty on any other route,
            and the enquiry is delivered either way. The server parses it and
            rebuilds the answer from the cost model rather than trusting it —
            see src/lib/calcSummary.ts. */}
        <input type="hidden" name="calc" data-calc defaultValue="" />

        {/* Honeypot. The name is meaningless on purpose and `readOnly` is the
            layer that does not depend on the name at all — see the longer note
            on the enquiry form, which this copies rather than reinvents. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="calc-q7">{labels.honeypotLabel}</label>
          <input
            type="text"
            id="calc-q7"
            name="q7"
            tabIndex={-1}
            readOnly
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore=""
          />
        </div>

        <div className={styles.duo}>
          <p className={styles.cell}>
            <label className={styles.label} htmlFor="calc-name">
              {labels.nameLabel}
            </label>
            <input
              className={styles.control}
              type="text"
              id="calc-name"
              name="name"
              maxLength={200}
              autoComplete="name"
              placeholder={labels.namePlaceholder}
            />
          </p>
          <p className={styles.cell}>
            <label className={styles.label} htmlFor="calc-email">
              {labels.emailLabel}
            </label>
            <input
              className={styles.control}
              type="email"
              id="calc-email"
              name="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
            />
          </p>
        </div>

        {/* ONE FIELD FOR EVERY OTHER WAY TO REACH SOMEBODY, and free text on
            purpose. A "phone" input asks a reader in Minsk or Dubai to hand
            over the channel they use least; this one takes a number, a
            Telegram handle or nothing at all. It is optional: the address
            above is enough to answer. */}
        <p className={styles.cell}>
          <label className={styles.label} htmlFor="calc-reach">
            {labels.reachLabel}
          </label>
          <input
            className={styles.control}
            type="text"
            id="calc-reach"
            name="reach"
            maxLength={200}
            autoComplete="tel"
            placeholder={labels.reachPlaceholder}
          />
        </p>

        <p className={styles.cell}>
          <label className={styles.label} htmlFor="calc-message">
            {labels.messageLabel}
          </label>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            id="calc-message"
            name="situation"
            rows={3}
            maxLength={4000}
            placeholder={labels.messagePlaceholder}
          />
        </p>

        <label className={styles.consent}>
          <input type="checkbox" name="consentToContact" required />
          <span>{labels.consentLabel}</span>
        </label>

        <div className={styles.actions}>
          <button className={styles.button} type="submit">
            {labels.submitLabel}
          </button>
          {/* The sentence is wrapped rather than left bare beside the link.
              `{text}{" "}<a>` gives the paragraph two text children in a row,
              and this project has already spent an afternoon on the hydration
              error that produces — see the note on the pair of figures in
              CostCalculator.tsx. One element, one space, one element. */}
          <p className={styles.fine}>
            <span>{labels.fine}</span>{" "}
            <a className={styles.fineLink} href={privacyHref}>
              {labels.privacyLabel}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
