import { LeadTracking } from "@/components/layout";

import styles from "./PropertyBrief.module.scss";

export interface PropertyBriefLabels {
  eyebrow: string;
  heading: string;
  intro: string;
  budgetLegend: string;
  budget: { upTo500: string; upTo800: string; over800: string; unknown: string };
  purposeLegend: string;
  purpose: { live: string; let: string; residency: string; unsure: string };
  cityLabel: string;
  cityHint: string;
  notesLabel: string;
  nameLabel: string;
  emailLabel: string;
  consentLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };
}

interface PropertyBriefProps {
  labels: PropertyBriefLabels;
  locale: string;
  /** ISO alpha-2 of this page's jurisdiction. Submitted as `where`, so the
   *  brief arrives already knowing which country it is about. */
  code: string;
  /** This page's own slug, so the route can send the reader back here rather
   *  than to the home page. Validated server-side against a slug pattern —
   *  see the comment on `safeReturnTo` in the route. */
  slug: string;
  privacyHref: string;
}

// The brief: what a reader who has read the six sections is now ready to say.
//
// FIVE FIELDS, AND ONLY TWO OF THEM REQUIRED. Budget, city and purpose are
// what a partner needs to answer at all; an address and consent are what we
// need to pass it on. Everything else a longer form would ask — timeline,
// financing, family — is a question the partner will ask better, in a reply,
// knowing the answer to these three.
//
// It posts to the SAME handler as the home page enquiry, with kind=brief. One
// honeypot, one rate limit, one pair of delivery channels, one consent rule.
// A second route would be a second copy of the parts that must never drift,
// and the copy that gets forgotten when one of them is fixed.
//
// The jurisdiction is a hidden field rather than a question, because the page
// the reader is standing on has already answered it. The home page form asks
// because there it is genuinely open.
//
// No JavaScript. A plain form, a 303 back to this page, and three panels the
// fragment reveals — the same mechanism the other two forms use, which is why
// the ids below are literal and the stylesheet has to name them literally too.
export function PropertyBrief({
  labels,
  locale,
  code,
  slug,
  privacyHref,
}: PropertyBriefProps) {
  const budgets = [
    { value: "500", label: labels.budget.upTo500 },
    { value: "800", label: labels.budget.upTo800 },
    { value: "over800", label: labels.budget.over800 },
    { value: "unknown", label: labels.budget.unknown },
  ];

  const purposes = [
    { value: "live", label: labels.purpose.live },
    { value: "let", label: labels.purpose.let },
    { value: "residency", label: labels.purpose.residency },
    { value: "unsure", label: labels.purpose.unsure },
  ];

  return (
    <section className={styles.section} id="brief">
      <div className="container">
        <p className={styles.eyebrow}>{labels.eyebrow}</p>
        <h2 className={styles.heading}>{labels.heading}</h2>
        <p className={styles.intro}>{labels.intro}</p>

        <div className={styles.result} id="brief-sent">
          <h3 className={styles.resultTitle}>{labels.sent.title}</h3>
          <p className={styles.resultBody}>{labels.sent.body}</p>
        </div>
        <div className={`${styles.result} ${styles.failed}`} id="brief-error">
          <h3 className={styles.resultTitle}>{labels.error.title}</h3>
          <p className={styles.resultBody}>{labels.error.body}</p>
        </div>
        <div className={`${styles.result} ${styles.failed}`} id="brief-failed">
          <h3 className={styles.resultTitle}>{labels.broke.title}</h3>
          <p className={styles.resultBody}>{labels.broke.body}</p>
        </div>

        <LeadTracking
          formId={`brief-form-${code}`}
          successHash="brief-sent"
          kind="brief"
        />

        <form
          id={`brief-form-${code}`}
          className={styles.form}
          method="post"
          action="/api/enquiry"
        >
          <input type="hidden" name="kind" value="brief" />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="where" value={code} />
          <input type="hidden" name="returnTo" value={slug} />

          {/* Honeypot. Meaningless name, readonly, off-screen — see the long
              note on the home page form for why each of the three layers is
              there and what filling `company` cost. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor={`br-q7-${code}`}>{labels.honeypotLabel}</label>
            <input
              type="text"
              id={`br-q7-${code}`}
              name="q7"
              tabIndex={-1}
              readOnly
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore=""
            />
          </div>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>{labels.budgetLegend}</legend>
            <ul className={styles.chips}>
              {budgets.map((option) => (
                <li key={option.value}>
                  <label className={styles.chip}>
                    <input type="radio" name="budget" value={option.value} />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>{labels.purposeLegend}</legend>
            <ul className={styles.chips}>
              {purposes.map((option) => (
                <li key={option.value}>
                  <label className={styles.chip}>
                    <input type="radio" name="purpose" value={option.value} />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`br-city-${code}`}>
              {labels.cityLabel}
            </label>
            <p className={styles.hint}>{labels.cityHint}</p>
            <input
              className={styles.input}
              type="text"
              id={`br-city-${code}`}
              name="city"
              maxLength={200}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`br-notes-${code}`}>
              {labels.notesLabel}
            </label>
            <textarea
              className={styles.textarea}
              id={`br-notes-${code}`}
              name="situation"
              rows={4}
              maxLength={4000}
            />
          </div>

          <div className={styles.pair}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`br-name-${code}`}>
                {labels.nameLabel}
              </label>
              <input
                className={styles.input}
                type="text"
                id={`br-name-${code}`}
                name="name"
                maxLength={200}
                autoComplete="name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`br-email-${code}`}>
                {labels.emailLabel}
              </label>
              <input
                className={styles.input}
                type="email"
                id={`br-email-${code}`}
                name="email"
                required
                maxLength={200}
                autoComplete="email"
              />
            </div>
          </div>

          <label className={styles.consent}>
            <input type="checkbox" name="consentToShare" required />
            <span>{labels.consentLabel}</span>
          </label>

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
      </div>
    </section>
  );
}
