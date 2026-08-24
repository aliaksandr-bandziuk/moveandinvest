import { LeadTracking } from "@/components/layout";

import styles from "./AlertsSignup.module.scss";

export interface AlertsSignupLabels {
  heading: string;
  body: string;
  emailLabel: string;
  emailPlaceholder: string;
  jurisdictionsLegend: string;
  jurisdictionsHint: string;
  consentLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };
}

interface AlertsSignupProps {
  labels: AlertsSignupLabels;
  locale: string;
  /** The page this sits on, so the route can return the reader to it. */
  slug: string;
  /** The five jurisdictions, in registry order, as {code, name} in this
   *  language. The one this page is about is pre-ticked. */
  jurisdictions: { code: string; name: string }[];
  /** ISO alpha-2 of this page's own jurisdiction, pre-ticked. */
  code?: string;
  privacyHref: string;
  /** Distinguishes the two instances that can appear on one visit, so their
   *  ids and their form do not collide. */
  instance: string;
}

// The exit for a reader who is not ready to be introduced to anybody.
//
// WHY IT EXISTS AT ALL. Until now the only way to give this site an address
// was to submit a full enquiry with consent to be passed to a partner. That is
// a large ask of someone who has just discovered their plan does not work, and
// they are precisely the reader who will come back in six months when it does.
// The brief has, in CLAUDE.md's words, "no audience capture" as a named gap;
// this is it.
//
// WHAT IT PROMISES IS WHAT THE SITE ALREADY DOES. Not a newsletter: an email
// when a rule changes. The site's whole position is that it knows when a
// threshold stopped being the old one, and the verification dossiers are the
// evidence that it actually tracks that. An offer of "useful tips" would be a
// promise the project has no way to keep.
//
// It is DELIBERATELY SMALLER than the forms it sits under. One field, one
// checkbox and an optional row of jurisdictions. Two asks on one page compete,
// and the loser should be the one that costs the reader least.
export function AlertsSignup({
  labels,
  locale,
  slug,
  jurisdictions,
  code,
  privacyHref,
  instance,
}: AlertsSignupProps) {
  const formId = `alerts-form-${instance}`;

  return (
    <section className={styles.section} id="alerts">
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <h2 className={styles.heading}>{labels.heading}</h2>
          <p className={styles.body}>{labels.body}</p>
        </div>

        <div className={styles.formSide}>
          <div className={styles.result} id="alerts-sent">
            <p className={styles.resultTitle}>{labels.sent.title}</p>
            <p className={styles.resultBody}>{labels.sent.body}</p>
          </div>
          <div className={`${styles.result} ${styles.failed}`} id="alerts-error">
            <p className={styles.resultTitle}>{labels.error.title}</p>
            <p className={styles.resultBody}>{labels.error.body}</p>
          </div>
          <div className={`${styles.result} ${styles.failed}`} id="alerts-failed">
            <p className={styles.resultTitle}>{labels.broke.title}</p>
            <p className={styles.resultBody}>{labels.broke.body}</p>
          </div>

          <LeadTracking formId={formId} successHash="alerts-sent" kind="subscribe" />

          <form id={formId} className={styles.form} method="post" action="/api/enquiry">
            <input type="hidden" name="kind" value="subscribe" />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="returnTo" value={slug} />

            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor={`al-q7-${instance}`}>{labels.honeypotLabel}</label>
              <input
                type="text"
                id={`al-q7-${instance}`}
                name="q7"
                tabIndex={-1}
                readOnly
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore=""
              />
            </div>

            <div className={styles.row}>
              <label className={styles.visuallyHidden} htmlFor={`al-email-${instance}`}>
                {labels.emailLabel}
              </label>
              <input
                className={styles.input}
                type="email"
                id={`al-email-${instance}`}
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

            {/* Optional, and unticked boxes mean all five rather than none —
                stated in the hint, because a set of empty checkboxes reads as
                "you have chosen nothing" and would cost subscriptions. */}
            <fieldset className={styles.group}>
              <legend className={styles.legend}>{labels.jurisdictionsLegend}</legend>
              <p className={styles.hint}>{labels.jurisdictionsHint}</p>
              <ul className={styles.chips}>
                {jurisdictions.map((entry) => (
                  <li key={entry.code}>
                    <label className={styles.chip}>
                      <input
                        type="checkbox"
                        name="alerts"
                        value={entry.code}
                        defaultChecked={entry.code === code}
                      />
                      <span>{entry.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <label className={styles.consent}>
              <input type="checkbox" name="consentToEmail" required />
              <span>{labels.consentLabel}</span>
            </label>

            <p className={styles.fine}>
              {labels.fine}{" "}
              <a className={styles.fineLink} href={privacyHref}>
                {labels.privacyLabel}
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
