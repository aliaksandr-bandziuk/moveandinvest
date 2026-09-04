import { LeadTracking } from "@/components/layout";
import { EnquiryPrefill } from "./EnquiryPrefill";
import { SectionHead } from "@/components/ui";
import { Link } from "@/i18n/navigation";

import styles from "./EnquiryForm.module.scss";

interface Option {
  value: string;
  label: string;
}

export interface EnquiryFormProps {
  /** The home page's numbered arc. Optional since this component gained a
   *  second mount point: /enquiry is a page, not section 08 of anything, and a
   *  number there would be counting a sequence of one. */
  index?: string;
  eyebrow: string;
  heading: string;
  intro: string;
  locale: string;
  /** WHICH OF THE TWO MOUNT POINTS THIS IS, and the only thing that differs
   *  between them. The route handler answers with a redirect, and the redirect
   *  has to land on the page the form was actually submitted from — otherwise a
   *  reader who sent it from /enquiry is dropped on the home page with a
   *  fragment that scrolls them into the middle of somebody else's argument.
   *
   *  A closed pair rather than a path: the server allows exactly these two
   *  values and resolves each to a route out of routing.ts itself. A form that
   *  could name its own redirect target would be an open redirect the day
   *  somebody widened the check.
   *
   *  The calculator briefly had a third value here, when its dialog opened this
   *  form. It opens its own now — four fields instead of six, because what it
   *  produces is a conversation rather than a qualified enquiry. See
   *  CalcEnquiryForm. */
  from?: "home" | "enquiry";
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
  /** Label for the link to /privacy, rendered on the fine-print line. */
  privacyLabel: string;
  submit: string;
  sent: { title: string; body: string };
  failed: { title: string; body: string };
  /** Shown when the fault is OURS, not the visitor's. See the panel below. */
  broke: { title: string; body: string };
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
  intro,
  locale,
  from = "home",
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
  privacyLabel,
  submit,
  sent,
  failed,
  broke,
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
        <SectionHead
          index={index}
          eyebrow={eyebrow}
          heading={heading}
          intro={intro}
          tone="onDark"
        />

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
        {/* A THIRD panel, because one error view for every failure told a
            reader who had filled the form correctly that their email address
            was missing. That happened here: the enquiries dataset was not
            configured, the write failed, and the page blamed the visitor.
            This one is shown when the fault is ours — nothing stored, or the
            address rate limited — and it gives an address to write to, so a
            lead survives an outage instead of leaving. */}
        <div className={`${styles.result} ${styles.failed}`} id="enquiry-failed">
          <h3 className={styles.resultTitle}>{broke.title}</h3>
          <p className={styles.resultBody}>{broke.body}</p>
        </div>

        {/* Measurement only — renders nothing, and the form works identically
            without it. See lib/analytics/lead.ts for why the event fires on
            the return rather than on the click. */}
        <LeadTracking formId="enquiry-form" successHash="enquiry-sent" kind="enquiry" />

        <EnquiryPrefill className={styles.formWrap}>
          <form id="enquiry-form" className={styles.form} method="post" action="/api/enquiry">
            <input type="hidden" name="locale" value={locale} />
            {/* Which page to come back to. See the prop's note: two allowed
                values, resolved server-side against routing.ts. */}
            <input type="hidden" name="from" value={from} />

            {/* WHAT THE CALCULATOR SHOWED, when the reader came from it. Empty
                on every other route, and filled by EnquiryPrefill from the same
                sessionStorage handover the route finder uses — never by the
                server, which would make this page dynamic.

                It carries the reader's own figures, not a computed answer: the
                enquiry route parses it and rebuilds the answer from the cost
                model, so nothing a browser posts can put a number in our inbox
                that the site would not print. */}
            <input type="hidden" name="calc" data-calc defaultValue="" />

            {/* Honeypot. The name is meaningless ON PURPOSE — `company` was
                filled by Chrome's address autofill and silently rejected a
                real person, and any name that reads like a real field can
                happen to match somebody's heuristic next. `readOnly` is the
                layer that does not depend on the name at all: a browser will
                not autofill a readonly input, and a script posting the body
                directly does not care that it is there. Kept off-screen,
                out of tab order and hidden from assistive tech. */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="eq-q7">{honeypot}</label>
              <input
                type="text"
                id="eq-q7"
                name="q7"
                tabIndex={-1}
                readOnly
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore=""
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
                  {/* The policy link sits HERE, beside the consent box, and
                      not only in the footer. Consent that cannot be read
                      before it is given is not informed consent, and a
                      reader is not going to hunt the footer for it while
                      their cursor is on the checkbox. */}
                  <p className={styles.fine}>
                    {fine}{" "}
                    <Link className={styles.fineLink} href="/privacy">
                      {privacyLabel}
                    </Link>
                  </p>
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
