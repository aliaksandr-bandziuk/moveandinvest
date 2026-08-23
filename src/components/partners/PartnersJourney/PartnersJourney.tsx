import { SectionHead } from "@/components/ui";

import styles from "./PartnersJourney.module.scss";

export interface JourneyStep {
  title: string;
  body: string;
}

interface PartnersJourneyProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  steps: JourneyStep[];
  note: string;
  /** Screen-reader label for the step number, e.g. "Шаг". The number itself
   *  is rendered by the list, so this is the one word around it. */
  stepLabel: string;
}

// Section 03 of /for-partners. Back to the black plane: section 02 above is
// white, and two light sections in a row turn the page into one long band.
//
// A vertical timeline, chosen over four columns and over a stepped layout for
// one reason. This section's entire content is a SEQUENCE — first this, then
// that — and columns state four things side by side, leaving the order to be
// inferred from the numbers. Numbers read as list markers as easily as they
// read as steps. A line drawn through the dots states the order in the
// geometry, so it survives being skimmed.
//
// An <ol>, not a <div> stack: the order is meaning, and a screen reader
// announcing "list item 3 of 4" is giving the same information the line gives
// visually. The connecting line is drawn in CSS on the rail, never as a
// character in the markup.
export function PartnersJourney({
  index,
  eyebrow,
  heading,
  intro,
  steps,
  note,
  stepLabel,
}: PartnersJourneyProps) {
  return (
    <section className={styles.section} id="journey">
      <div className="container">
        <SectionHead
          index={index}
          eyebrow={eyebrow}
          heading={heading}
          intro={intro}
          tone="onDark"
        />

        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step.title} className={styles.step}>
              {/* The rail carries the dot and, via ::after, the line down to
                  the next dot. Decorative — the <ol> already conveys order. */}
              <span className={styles.rail} aria-hidden="true">
                <span className={styles.dot} />
              </span>
              <div>
                <p className={styles.number}>
                  {stepLabel} {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.closing}>{note}</p>
      </div>
    </section>
  );
}
