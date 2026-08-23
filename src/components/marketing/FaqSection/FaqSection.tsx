import { SectionHead } from "@/components/ui";

import { FaqFilter } from "./FaqFilter";
import styles from "./FaqSection.module.scss";

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  /** ISO codes this question is specific to. Empty means it applies to all. */
  codes: string[];
}

export interface FaqFilterOption {
  /** "all", or a jurisdiction's ISO code. */
  value: string;
  label: string;
}

interface FaqSectionProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  entries: FaqEntry[];
  /** Built by the caller: "all" plus every jurisdiction that has a question. */
  filters: FaqFilterOption[];
  filterLegend: string;
  /** "{n} of {total}" — shown only while a jurisdiction filter is active. */
  countTemplate: string;
  note: string;
}

// Section 06. The block most likely to be quoted verbatim by an answer
// engine, which decides almost every choice in it:
//
//   * Every answer is visible by default. No accordion, no truncation — the
//     filter starts on "all", so the first thing a crawler and a first-time
//     reader both see is the complete list.
//   * There is no inner scroll container. A fixed-height scrolling box would
//     put a second scrollbar next to the page's own, trap a phone's touch
//     scroll, and shorten the block for nobody's benefit: length is what the
//     filter is for.
//   * The filter is an enhancement. Without JavaScript the chips are hidden
//     and the full list stands — the degraded state is the complete one.
export function FaqSection({
  index,
  eyebrow,
  heading,
  intro,
  entries,
  filters,
  filterLegend,
  countTemplate,
  note,
}: FaqSectionProps) {
  if (entries.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[moveandinvest] FAQ hidden: no faqItem documents for this locale. " +
          "Run `npm run seed`, then `npm run publish -- --type faqItem --all`.",
      );
    }
    return null;
  }

  return (
    <section className={styles.section} id="faq">
      <div className="container">
        <FaqFilter className={styles.root} countTemplate={countTemplate}>
          <div className={styles.top}>
            <SectionHead
              index={index}
              eyebrow={eyebrow}
              heading={heading}
              intro={intro}
            >
            {/* Passed as the head's children so it lands under the deck, in
                the right half of the spread. Beside the head it would have
                been a third column in a two-column grid.

                Rendered by the server but hidden until the enhancer marks the
                block. A visible control that does nothing is worse than no
                control; a control that appears a frame late is not. */}
            <fieldset className={styles.filter}>
              <legend className={styles.filterLegend}>{filterLegend}</legend>
              <ul className={styles.chips}>
                {filters.map((option, i) => {
                  const id = `faq-${option.value}`;
                  return (
                    <li key={option.value}>
                      <input
                        className={styles.input}
                        type="radio"
                        id={id}
                        name="faq-filter"
                        value={option.value}
                        defaultChecked={i === 0}
                      />
                      <label className={styles.chip} htmlFor={id}>
                        {option.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
            </SectionHead>
          </div>

          <dl className={styles.list}>
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className={styles.item}
                // Space-separated so the enhancer can match one code inside
                // several. Empty means "applies to everything" and the filter
                // never hides it.
                data-codes={entry.codes.join(" ")}
              >
                <dt className={styles.question}>
                  <span className={styles.number}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {entry.question}
                </dt>
                <dd className={styles.answer}>{entry.answer}</dd>
              </div>
            ))}
          </dl>

          {/* Empty on the server; the enhancer writes a count here when a
              filter is active, so a shortened list reads as filtered rather
              than as everything there is. */}
          <p className={styles.count} data-faq-count />
        </FaqFilter>

        <p className={styles.note}>{note}</p>
      </div>
    </section>
  );
}
