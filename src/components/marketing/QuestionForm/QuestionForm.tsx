import styles from "./QuestionForm.module.scss";

export interface QuestionFormLabels {
  nameLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };
}

// A question, and the smallest commitment this site asks for.
//
// EXTRACTED FROM ContactChannels ON 31 AUGUST 2026, unchanged in behaviour. It
// had lived inside that component since /contacts was built, which was correct
// while /contacts was the only page that could reasonably carry it. /faq made
// that false: fifty-two answers is exactly the page where a reader discovers
// that theirs is the fifty-third, and the offer that belongs there is not an
// enquiry — it is this.
//
// THE FORM IS NOT THE ENQUIRY FORM, and the difference is not a matter of
// length. Its `kind` is `question`; it carries no jurisdiction, no budget and
// NO CONSENT CHECKBOX — because consent on this site governs one thing, being
// passed to a third party, and a question is never passed to anybody. A
// checkbox here would consent to nothing, and consent theatre in one place
// makes the real checkbox on the enquiry form look like the same ritual.
//
// It is also NOT STORED. The enquiries dataset holds leads; a question answered
// and closed is correspondence, and correspondence belongs in a mailbox. So the
// email is the only channel, and unlike the enquiry there is no "one of the two
// worked" — if the mail fails the reader is told plainly, which is what the
// third panel is for.
//
// NO LeadTracking, DELIBERATELY. Every other form on the site fires
// `generate_lead` on success; this one must not. A question is not a lead, and
// counting it would inflate the one number those events exist to measure — an
// inflated funnel being worse than an unmeasured one, because it looks like it
// is working. Adding "question" to LeadKind is the tempting version of this
// mistake, and it is still tempting now that the form is on two pages.
export function QuestionForm({
  labels,
  locale,
  privacyHref,
  returnTo,
}: {
  labels: QuestionFormLabels;
  locale: string;
  privacyHref: string;
  /** The page's own localised slug, so the 303 comes back to the page the
   *  question was asked on rather than always to /contacts. Validated against
   *  a bare-slug shape server-side — see `safeReturnTo` in the route handler.
   *  Empty means /contacts, which is where this form spent its first week. */
  returnTo: string;
}) {
  return (
    <>
      {/* The three panels, before the form: the success one hides it with a
          sibling selector. All three are listed, including the one that says
          the fault is ours — that panel was omitted from two older forms on
          this site and never displayed at all. */}
      <div className={styles.result} id="question-sent">
        <p className={styles.resultTitle}>{labels.sent.title}</p>
        <p className={styles.resultBody}>{labels.sent.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="question-error">
        <p className={styles.resultTitle}>{labels.error.title}</p>
        <p className={styles.resultBody}>{labels.error.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="question-failed">
        <p className={styles.resultTitle}>{labels.broke.title}</p>
        <p className={styles.resultBody}>{labels.broke.body}</p>
      </div>

      <form id="question-form" className={styles.form} method="post" action="/api/enquiry">
        <input type="hidden" name="kind" value="question" />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnTo" value={returnTo} />

        {/* Honeypot. The name is meaningless on purpose — see the long note in
            the route handler for what a name that reads like a real field cost
            once already. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="q-q7">{labels.honeypotLabel}</label>
          <input
            type="text"
            id="q-q7"
            name="q7"
            tabIndex={-1}
            readOnly
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore=""
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="q-name">
            {labels.nameLabel}
          </label>
          <input
            className={styles.input}
            type="text"
            id="q-name"
            name="name"
            maxLength={120}
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="q-email">
            {labels.emailLabel}
          </label>
          <input
            className={styles.input}
            type="email"
            id="q-email"
            name="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder={labels.emailPlaceholder}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="q-message">
            {labels.messageLabel}
          </label>
          <textarea
            className={styles.textarea}
            id="q-message"
            name="message"
            required
            rows={6}
            maxLength={2000}
          />
        </div>

        <button className={styles.button} type="submit">
          {labels.submitLabel}
        </button>

        <p className={styles.fine}>
          {labels.fine}{" "}
          <a className={styles.fineLink} href={privacyHref}>
            {labels.privacyLabel}
          </a>
        </p>
      </form>
    </>
  );
}
