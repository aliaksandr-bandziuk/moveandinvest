import { EnquiryPrefill } from "./EnquiryPrefill";
import styles from "./EnquiryForm.module.scss";

interface Option {
  value: string;
  label: string;
}

export interface EnquiryFormProps {
  index: string;
  eyebrow: string;
  heading: string;
  locale: string;
  fork: {
    chosenIndex: string;
    chosenTitle: string;
    chosenBody: string;
    undecidedIndex: string;
    undecidedTitle: string;
    undecidedBody: string;
  };
  /** The five jurisdictions, in registry order. Values are ISO codes. */
  jurisdictions: Option[];
  /** "undecided" and "other" — the second card's options. */
  openOptions: Option[];
  budget: { legend: string; options: Option[] };
  timeline: { legend: string; options: Option[] };
  goals: { legend: string; hint: string; options: Option[] };
  situation: { legend: string; hint: string };
  contact: { legend: string; name: string; email: string };
  consent: string;
  fine: string;
  submit: string;
  sent: { title: string; body: string };
  failed: { title: string; body: string };
  honeypot: string;
}

// Section 08. The long form, for the reader the three-question route finder
// could not place: undecided, between two jurisdictions, or carrying a
// situation that does not fit in a select.
//
// The block works with JavaScript disabled, end to end. Three decisions make
// that true, and each of them also happens to be the simpler option:
//
//   1. THE FORK IS THE QUESTION. "Country chosen" and "not yet" are not a
//      mode switch that reveals a hidden field — they are two halves of one
//      radio group. The cards invert via :has(:checked), so the state that
//      looks interactive is pure CSS and cannot desynchronise from the data.
//   2. IT POSTS. A real form to a real route handler, answered with a
//      redirect. The client component alongside only prefills.
//   3. SUCCESS IS A FRAGMENT, not a query parameter. `?sent=1` read in a
//      server component would make this statically generated page dynamic
//      for every visitor, to style two paragraphs.
export function EnquiryForm({
  index,
  eyebrow,
  heading,
  locale,
  fork,
  jurisdictions,
  openOptions,
  budget,
  timeline,
  goals,
  situation,
  contact,
  consent,
  fine,
  submit,
  sent,
  failed,
  honeypot,
}: EnquiryFormProps) {
  const radios = (name: string, options: Option[]) =>
    options.map((option) => {
      const id = `eq-${name}-${option.value}`;
      return (
        <li key={option.value}>
          <input
            className={styles.input}
            type="radio"
            id={id}
            name={name}
            value={option.value}
          />
          <label className={styles.chip} htmlFor={id}>
            {option.label}
          </label>
        </li>
      );
    });

  return (
    <section className={styles.section} id="enquiry">
      <div className="container">
        <p className={styles.eyebrow}>
          <span className={styles.index}>{index}</span> · {eyebrow}
        </p>
        <h2 className={styles.heading}>{heading}</h2>

        {/* Both panels are hidden until the redirect's fragment targets one
            of them; the success panel also hides the form, so a reader is
            never looking at a filled form they have already sent. */}
        <div className={styles.result} id="enquiry-sent">
          <h3 className={styles.resultTitle}>{sent.title}</h3>
          <p className={styles.resultBody}>{sent.body}</p>
        </div>
        <div className={`${styles.result} ${styles.failed}`} id="enquiry-error">
          <h3 className={styles.resultTitle}>{failed.title}</h3>
          <p className={styles.resultBody}>{failed.body}</p>
        </div>

        <EnquiryPrefill className={styles.formWrap}>
          <form className={styles.form} method="post" action="/api/enquiry">
            <input type="hidden" name="locale" value={locale} />

            {/* Honeypot: off-screen, never announced, never tab-reachable.
                autoComplete="off" stops a password manager filling it and
                turning a real person into a rejected bot. */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="eq-company">{honeypot}</label>
              <input
                type="text"
                id="eq-company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <fieldset className={styles.fork}>
              <legend className={styles.visuallyHidden}>
                {fork.chosenTitle} / {fork.undecidedTitle}
              </legend>

              <div className={styles.card}>
                <p className={styles.cardIndex}>{fork.chosenIndex}</p>
                <h3 className={styles.cardTitle}>{fork.chosenTitle}</h3>
                <p className={styles.cardBody}>{fork.chosenBody}</p>
                <ul className={styles.chips}>{radios("where", jurisdictions)}</ul>
              </div>

              <div className={styles.card}>
                <p className={styles.cardIndex}>{fork.undecidedIndex}</p>
                <h3 className={styles.cardTitle}>{fork.undecidedTitle}</h3>
                <p className={styles.cardBody}>{fork.undecidedBody}</p>
                <ul className={styles.chips}>{radios("where", openOptions)}</ul>
              </div>
            </fieldset>

            <div className={styles.rest}>
              <fieldset className={styles.group}>
                <legend className={styles.legend}>{budget.legend}</legend>
                <ul className={styles.chips}>{radios("budget", budget.options)}</ul>
              </fieldset>

              <fieldset className={styles.group}>
                <legend className={styles.legend}>{timeline.legend}</legend>
                <ul className={styles.chips}>
                  {radios("timeline", timeline.options)}
                </ul>
              </fieldset>

              {/* Checkboxes, not radios: nobody moves for exactly one
                  reason, and forcing a single answer here would throw away
                  the most useful thing about the combination. */}
              <fieldset className={styles.group}>
                <legend className={styles.legend}>{goals.legend}</legend>
                <ul className={styles.chips}>
                  {goals.options.map((option) => {
                    const id = `eq-goals-${option.value}`;
                    return (
                      <li key={option.value}>
                        <input
                          className={styles.input}
                          type="checkbox"
                          id={id}
                          name="goals"
                          value={option.value}
                        />
                        <label className={styles.chip} htmlFor={id}>
                          {option.label}
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className={styles.hint}>{goals.hint}</p>
              </fieldset>

              <div className={styles.group}>
                <label className={styles.legend} htmlFor="eq-situation">
                  {situation.legend}
                </label>
                <textarea
                  className={styles.textarea}
                  id="eq-situation"
                  name="situation"
                  rows={5}
                  maxLength={4000}
                />
                <p className={styles.hint}>{situation.hint}</p>
              </div>

              <div className={styles.group}>
                <p className={styles.legend}>{contact.legend}</p>
                <div className={styles.pair}>
                  <div>
                    <label className={styles.fieldLabel} htmlFor="eq-name">
                      {contact.name}
                    </label>
                    <input
                      className={styles.text}
                      type="text"
                      id="eq-name"
                      name="name"
                      autoComplete="name"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel} htmlFor="eq-email">
                      {contact.email}
                    </label>
                    <input
                      className={styles.text}
                      type="email"
                      id="eq-email"
                      name="email"
                      autoComplete="email"
                      required
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.send}>
                <div>
                  {/* Required and unchecked, and it stays that way. This
                      site's business model is passing enquiries to partners;
                      a pre-ticked box is not consent under the GDPR, and a
                      missing one makes every forward unlawful. */}
                  <p className={styles.consent}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      id="eq-consent"
                      name="consentToShare"
                      required
                    />
                    <label htmlFor="eq-consent">{consent}</label>
                  </p>
                  <p className={styles.fine}>{fine}</p>
                </div>
                <button className={styles.button} type="submit">
                  {submit}
                </button>
              </div>
            </div>
          </form>
        </EnquiryPrefill>
      </div>
    </section>
  );
}
