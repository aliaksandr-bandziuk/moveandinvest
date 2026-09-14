import { LeadTracking } from "@/components/layout";

import styles from "./ResidenceCaseForm.module.scss";

export interface ResidenceOption {
  /** The stable token the route allow-lists. Never reworded. */
  value: string;
  label: string;
}

export interface ResidenceCaseLabels {
  heading: string;
  body: string;
  citizenshipLegend: string;
  citizenship: ResidenceOption[];
  statusLegend: string;
  status: ResidenceOption[];
  matterLegend: string;
  matter: ResidenceOption[];
  deadlineLegend: string;
  deadlineHint: string;
  deadline: ResidenceOption[];
  situationLabel: string;
  situationPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  reachLabel: string;
  reachPlaceholder: string;
  consentLabel: string;
  honeypotLabel: string;
  submitLabel: string;
  fine: string;
  privacyLabel: string;
  sent: { title: string; body: string };
  error: { title: string; body: string };
  broke: { title: string; body: string };
}

// THE FORM AT THE FOOT OF AN ENTRY ABOUT STAYING IN POLAND. Built 14 September
// 2026 for one partner: a consultancy that handles residence cases for people
// who already live there.
//
// WHY NOT THE GUIDE BLOCK, which every other entry ends with. That block says
// "one licensed firm in the jurisdiction concerned" and offers the long form
// with a budget as its way out, and neither is true here: Poland is not one of
// the five jurisdictions, the firm is a consultancy rather than a law office,
// and a budget is not what separates one residence case from another.
//
// FOUR QUESTIONS, AND WHAT EACH IS FOR. The partner's work is the complex case,
// and a simple one — a first card with every document in order — is something a
// reader can do alone from the page above. The four chips are what tell the two
// apart before anybody picks up a phone:
//
//   citizenship  UKR and CUKR exist for one of them only
//   status       what the stay rests on today, including "I do not know"
//   matter       a refusal is not a long wait, and neither is a first card
//   deadline     a summons in MOS or a fourteen-day appeal window running now
//
// ALL FOUR ARE OPTIONAL. An address and the consent box are the whole
// requirement, as on every other enquiry here: somebody unsure what their status
// is has precisely the case this is for, and a required question they cannot
// answer turns them away.
//
// THE CONSENT IS THE LONG FORM'S — permission to be passed to one firm — and the
// label names what kind of firm, because "a specialist partner" would let a
// reader believe it is a lawyer.
//
// IT POSTS, like every other form here, and works with JavaScript off: a real
// form to the shared route, a 303 to a fragment, and :target shows the panel.
export function ResidenceCaseForm({
  labels,
  locale,
  slug,
  entryKind,
  privacyHref,
}: {
  labels: ResidenceCaseLabels;
  locale: string;
  /** The entry's own slug — validated by the route, never trusted. */
  slug: string;
  /** Which of an entry's two addresses the slug lives at. */
  entryKind: "research" | "reference";
  privacyHref: string;
}) {
  const groups = [
    { name: "citizenship", legend: labels.citizenshipLegend, options: labels.citizenship },
    { name: "status", legend: labels.statusLegend, options: labels.status },
    { name: "matter", legend: labels.matterLegend, options: labels.matter },
  ];

  return (
    <section
      className={styles.section}
      id="residence"
      aria-labelledby="residence-heading"
    >
      <h2 className={styles.heading} id="residence-heading">
        {labels.heading}
      </h2>
      <p className={styles.body}>{labels.body}</p>

      {/* The three panels, before the form: the success panel hides it with a
          sibling selector, and all three ids are in the stylesheet's :target
          list — the "our fault" one was left out of two older forms once. */}
      <div className={styles.result} id="residence-sent">
        <p className={styles.resultTitle}>{labels.sent.title}</p>
        <p className={styles.resultBody}>{labels.sent.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="residence-error">
        <p className={styles.resultTitle}>{labels.error.title}</p>
        <p className={styles.resultBody}>{labels.error.body}</p>
      </div>
      <div className={`${styles.result} ${styles.failed}`} id="residence-failed">
        <p className={styles.resultTitle}>{labels.broke.title}</p>
        <p className={styles.resultBody}>{labels.broke.body}</p>
      </div>

      <LeadTracking
        formId="residence-form"
        successHash="residence-sent"
        kind="residence"
      />

      <form
        id="residence-form"
        className={styles.form}
        method="post"
        action="/api/enquiry"
      >
        <input type="hidden" name="kind" value="residence" />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnTo" value={slug} />
        <input type="hidden" name="entryKind" value={entryKind} />

        {/* Honeypot. Meaningless name, readonly, off-screen — see the long note
            in the route handler for what a plausible name cost once. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="residence-q7">{labels.honeypotLabel}</label>
          <input
            type="text"
            id="residence-q7"
            name="q7"
            tabIndex={-1}
            readOnly
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore=""
          />
        </div>

        {groups.map((group) => (
          <fieldset className={styles.group} key={group.name}>
            <legend className={styles.legend}>{group.legend}</legend>
            <ul className={styles.chips}>
              {group.options.map((option) => (
                <li key={option.value}>
                  <label className={styles.chip}>
                    <input type="radio" name={group.name} value={option.value} />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}

        <fieldset className={styles.group}>
          <legend className={styles.legend}>{labels.deadlineLegend}</legend>
          <p className={styles.hint}>{labels.deadlineHint}</p>
          <ul className={styles.chips}>
            {labels.deadline.map((option) => (
              <li key={option.value}>
                <label className={styles.chip}>
                  <input type="radio" name="deadline" value={option.value} />
                  <span>{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="residence-situation">
            {labels.situationLabel}
          </label>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            id="residence-situation"
            name="situation"
            rows={4}
            maxLength={4000}
            placeholder={labels.situationPlaceholder}
          />
        </div>

        <div className={styles.pair}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="residence-name">
              {labels.nameLabel}
            </label>
            <input
              className={styles.control}
              type="text"
              id="residence-name"
              name="name"
              maxLength={200}
              autoComplete="name"
              placeholder={labels.namePlaceholder}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="residence-email">
              {labels.emailLabel}
            </label>
            <input
              className={styles.control}
              type="email"
              id="residence-email"
              name="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
            />
          </div>
        </div>

        {/* A number or a Telegram handle, free text and optional — the same
            field the calculator's dialog has, for the same reason. */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="residence-reach">
            {labels.reachLabel}
          </label>
          <input
            className={styles.control}
            type="text"
            id="residence-reach"
            name="reach"
            maxLength={200}
            autoComplete="tel"
            placeholder={labels.reachPlaceholder}
          />
        </div>

        <label className={styles.consent}>
          <input type="checkbox" name="consentToShare" required />
          <span>{labels.consentLabel}</span>
        </label>

        <button className={styles.button} type="submit">
          {labels.submitLabel}
        </button>

        {/* One element, one space, one element — two bare text children in a
            row is the hydration error CostCalculator.tsx already paid for. */}
        <p className={styles.fine}>
          <span>{labels.fine}</span>{" "}
          <a className={styles.fineLink} href={privacyHref}>
            {labels.privacyLabel}
          </a>
        </p>
      </form>
    </section>
  );
}
