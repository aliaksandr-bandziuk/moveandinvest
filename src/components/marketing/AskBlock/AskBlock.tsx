import { LeadTracking } from "@/components/layout";

import styles from "./AskBlock.module.scss";

export interface AskBlockLabels {
  heading: string;
  body: string;
  /** "Sent as an enquiry about {country}." Already interpolated by the page —
   *  omitted entirely when the guide covers more than one jurisdiction. */
  about?: string;
  emailLabel: string;
  emailPlaceholder: string;
  situationLabel: string;
  situationPlaceholder: string;
  consentLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  /** The way out for a reader who wants to say more than two fields hold. */
  longFormLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };
}

// The foot of a guide. Two fields, a checkbox, and the thing five long articles
// were missing.
//
// WHAT WAS THERE BEFORE: nothing. Each of the five guides ends with a paragraph
// saying, in prose, that we do not sell property and are not lawyers, and that
// finding a licensed firm is what we do — and then the page stopped. Fifteen
// URLs (five guides, three languages), the ones the whole search strategy is
// aimed at, ended on a promise with no way to take it up but the button in the
// header, which was a full page load to the bottom of the home page.
//
// TWO FIELDS, AND THE COUNT IS THE DESIGN. The long form asks nine things,
// which is right for somebody who came to send an enquiry and wrong for
// somebody who came to read and has been reading for eleven minutes. A budget
// question at the foot of a guide is not a question, it is an exit. So: an
// address to reply to, a sentence about what they are trying to do, and the
// consent box — which is not a field but a legal requirement, because this is
// the same consent the long form takes and it governs the same act.
//
// THE JURISDICTION IS TAKEN FROM THE GUIDE, AND SHOWN. The entry knows which
// countries it is about, so a guide about exactly one of them sends that one
// and prints a line saying so. Sending it silently would have been easier and
// would have meant an email arriving at a partner firm saying "Portugal"
// because of something the reader never said. Where a guide covers several
// jurisdictions — the cost-of-living one does — nothing is sent, and the
// sentence they write carries it instead.
//
// IT POSTS, like every other form here, and works with JavaScript off end to
// end: a real form to the shared route handler, answered with a 303 to a
// fragment, and the three panels below are shown by :target.
export function AskBlock({
  labels,
  locale,
  slug,
  countryCode,
  privacyHref,
  longFormHref,
}: {
  labels: AskBlockLabels;
  locale: string;
  /** The guide's own slug. Comes back here after submission — see `safeReturnTo`
   *  in the route handler for why it is validated rather than trusted. */
  slug: string;
  /** ISO alpha-2, only when the guide is about exactly one jurisdiction. */
  countryCode?: string;
  privacyHref: string;
  /** /enquiry, for a reader with more to say than two fields hold. */
  longFormHref: string;
}) {
  return (
    <section className={styles.section} id="ask" aria-labelledby="ask-heading">
      <h2 className={styles.heading} id="ask-heading">
        {labels.heading}
      </h2>
      <p className={styles.body}>{labels.body}</p>

      {/* The three panels, in the order the stylesheet's :target rules expect,
          and before the form because the success panel hides it with a sibling
          selector. All three are listed: the one that says the fault is ours
          was left out of two older forms and never displayed at all. */}
      <div className={styles.result} id="ask-sent">
        <p className={styles.resultTitle}>{labels.sent.title}</p>
        <p className={styles.resultBody}>{labels.sent.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="ask-error">
        <p className={styles.resultTitle}>{labels.error.title}</p>
        <p className={styles.resultBody}>{labels.error.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="ask-failed">
        <p className={styles.resultTitle}>{labels.broke.title}</p>
        <p className={styles.resultBody}>{labels.broke.body}</p>
      </div>

      {/* Renders nothing. See lib/analytics/lead.ts for why the event fires on
          the return rather than on the click, and for what `form_path` may and
          may not carry. */}
      <LeadTracking formId="ask-form" successHash="ask-sent" kind="article" />

      <form id="ask-form" className={styles.form} method="post" action="/api/enquiry">
        <input type="hidden" name="kind" value="article" />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnTo" value={slug} />
        {/* Only when the guide is about exactly one jurisdiction, and the line
            under the fields says so in words. The server checks it against the
            same allow-list every other form's jurisdiction goes through. */}
        {countryCode ? (
          <input type="hidden" name="where" value={countryCode} />
        ) : null}

        {/* Honeypot. The name is meaningless on purpose — see the long note in
            the route handler for what a name that reads like a real field cost
            once already. `readOnly` is the layer that does not depend on the
            name at all. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="ask-q7">{labels.honeypotLabel}</label>
          <input
            type="text"
            id="ask-q7"
            name="q7"
            tabIndex={-1}
            readOnly
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore=""
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ask-situation">
            {labels.situationLabel}
          </label>
          <textarea
            className={styles.textarea}
            id="ask-situation"
            name="situation"
            rows={3}
            maxLength={4000}
            placeholder={labels.situationPlaceholder}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ask-email">
            {labels.emailLabel}
          </label>
          <div className={styles.row}>
            <input
              className={styles.input}
              type="email"
              id="ask-email"
              name="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
            />
            <button className={styles.button} type="submit">
              {labels.submitLabel}
            </button>
          </div>
        </div>

        <label className={styles.consent}>
          <input type="checkbox" name="consentToShare" required />
          <span>{labels.consentLabel}</span>
        </label>

        <p className={styles.fine}>
          {labels.about ? `${labels.about} ` : null}
          {labels.fine}{" "}
          <a className={styles.fineLink} href={privacyHref}>
            {labels.privacyLabel}
          </a>
        </p>

        <p className={styles.longForm}>
          <a className={styles.fineLink} href={longFormHref}>
            {labels.longFormLabel}
          </a>
        </p>
      </form>
    </section>
  );
}
