import { SectionHead } from "@/components/ui";

import styles from "./PartnerContact.module.scss";

export interface ContactOption {
  value: string;
  label: string;
}

interface PartnerContactProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  questions: string[];
  locale: string;
  jurisdictionLabel: string;
  /** The five from the registry plus "several" — assembled by the page, so
   *  this component never decides which jurisdictions exist. */
  jurisdictions: ContactOption[];
  orgLabel: string;
  organisations: ContactOption[];
  nameLabel: string;
  emailLabel: string;
  termsLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  sentTitle: string;
  sentBody: string;
  failedTitle: string;
  failedBody: string;
  brokeTitle: string;
  brokeBody: string;
}

// Section 05 of /for-partners, and the only interactive block on the page.
//
// The questions and the form share ONE frame, questions on a tint above the
// form rather than in a column beside it. The reason is the third question —
// "on what terms: exclusivity, a window to decline, replacing a bad one" —
// which is the prompt for the free-text field. A layout that scrolls it out
// of view is a layout that collects one-word answers.
//
// A real <form method="post">. It works with JavaScript switched off: the
// route handler answers with a 303 to a fragment on this page, and the two
// result panels below reveal themselves with :target. No client component is
// involved, which is also why the page stays statically generated.
//
// `kind` is what tells the shared handler this is a partner reply rather than
// a reader's enquiry — see src/app/api/enquiry/route.ts. There is no consent
// checkbox here, unlike the home page form: a firm quoting its own commercial
// terms is not handing over somebody else's personal data, which is what that
// checkbox governs.
export function PartnerContact({
  index,
  eyebrow,
  heading,
  intro,
  questions,
  locale,
  jurisdictionLabel,
  jurisdictions,
  orgLabel,
  organisations,
  nameLabel,
  emailLabel,
  termsLabel,
  honeypotLabel,
  submitLabel,
  fine,
  sentTitle,
  sentBody,
  failedTitle,
  failedBody,
  brokeTitle,
  brokeBody,
}: PartnerContactProps) {
  return (
    <section className={styles.section} id="contact">
      <div className="container">
        <SectionHead
          index={index}
          eyebrow={eyebrow}
          heading={heading}
          intro={intro}
        />

        <div className={styles.box}>
          <ol className={styles.questions}>
            {questions.map((question, i) => (
              <li key={question} className={styles.question}>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{question}</p>
              </li>
            ))}
          </ol>

          <div className={styles.body}>
            {/* Both panels stay hidden until the redirect's fragment targets
                one of them. Ids, not classes — the handler redirects to the
                literal fragment, so the selector has to stay literal too. */}
            <div className={styles.result} id="partner-sent">
              <h3 className={styles.resultTitle}>{sentTitle}</h3>
              <p className={styles.resultBody}>{sentBody}</p>
            </div>
            <div
              className={`${styles.result} ${styles.failed}`}
              id="partner-error"
            >
              <h3 className={styles.resultTitle}>{failedTitle}</h3>
              <p className={styles.resultBody}>{failedBody}</p>
            </div>
            {/* Our fault rather than theirs — see the note in EnquiryForm. */}
            <div
              className={`${styles.result} ${styles.failed}`}
              id="partner-failed"
            >
              <h3 className={styles.resultTitle}>{brokeTitle}</h3>
              <p className={styles.resultBody}>{brokeBody}</p>
            </div>

            <form className={styles.form} method="post" action="/api/enquiry">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="kind" value="partner" />

              {/* The spam trap. Off-screen rather than display:none, because
                  a field that is not rendered is one a bot can also see is
                  not rendered. aria-hidden and tabindex keep it away from
                  anyone using the keyboard or a screen reader — and the
                  meaningless name plus readOnly keep it away from autofill,
                  which once rejected a real person. See the note on the home
                  page's copy of this block. */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="partner-q7">{honeypotLabel}</label>
                <input
                  id="partner-q7"
                  name="q7"
                  type="text"
                  tabIndex={-1}
                  readOnly
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore=""
                />
              </div>

              <fieldset className={styles.field}>
                <legend className={styles.label}>{jurisdictionLabel}</legend>
                <ul className={styles.chips}>
                  {jurisdictions.map((option) => (
                    <li key={option.value}>
                      <input
                        className={styles.input}
                        type="radio"
                        name="jurisdiction"
                        id={`jurisdiction-${option.value}`}
                        value={option.value}
                      />
                      <label
                        className={styles.chip}
                        htmlFor={`jurisdiction-${option.value}`}
                      >
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <fieldset className={styles.field}>
                <legend className={styles.label}>{orgLabel}</legend>
                <ul className={styles.chips}>
                  {organisations.map((option) => (
                    <li key={option.value}>
                      <input
                        className={styles.input}
                        type="radio"
                        name="organisation"
                        id={`organisation-${option.value}`}
                        value={option.value}
                      />
                      <label
                        className={styles.chip}
                        htmlFor={`organisation-${option.value}`}
                      >
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <div className={styles.pair}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="partner-name">
                    {nameLabel}
                  </label>
                  <input
                    className={styles.text}
                    id="partner-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="partner-email">
                    {emailLabel}
                  </label>
                  <input
                    className={styles.text}
                    id="partner-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="partner-terms">
                  {termsLabel}
                </label>
                <textarea
                  className={styles.textarea}
                  id="partner-terms"
                  name="terms"
                  rows={5}
                  required
                />
              </div>

              <button className={styles.submit} type="submit">
                {submitLabel}
              </button>

              <p className={styles.fine}>{fine}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
