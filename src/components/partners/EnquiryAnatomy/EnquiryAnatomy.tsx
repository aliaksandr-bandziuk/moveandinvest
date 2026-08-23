import { SectionHead } from "@/components/ui";

import styles from "./EnquiryAnatomy.module.scss";

export interface AnatomyField {
  /** The field name, used both in the sample card and as the note's heading. */
  label: string;
  /** What that field looks like filled in. Invented — see `sampleTag`. */
  sample: string;
  /** Why the field is there and what it tells a partner. */
  note: string;
}

interface EnquiryAnatomyProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  /** Header of the sample card, e.g. "Как выглядит заявка". */
  sampleLabel: string;
  /** The chip marking the card as invented, e.g. "образец". Required by the
   *  schema, and deliberately so — see the note below. */
  sampleTag: string;
  fields: AnatomyField[];
  /** The closing qualification: what "qualified" does and does not mean. */
  note: string;
}

// Section 02 of /for-partners. A white plane directly under the black hero —
// two dark sections in a row turn the page into one unbroken black band.
//
// The layout is one idea: the sample card sticks while the notes scroll past
// it. Six notes are too long to hold the sample in memory, and the whole
// section exists to connect "this field" to "this is why it is there". On a
// phone there is no sticking — the card simply comes first.
//
// THE SAMPLE IS INVENTED, and the chip says so. No real enquiry exists yet,
// and on a page whose entire position is that we publish real numbers, an
// unmarked fabrication is the one thing that would cost more than it buys.
// `sampleTag` is a required schema field for that reason: an editor who
// empties it removes the disclosure, not just a decoration.
export function EnquiryAnatomy({
  index,
  eyebrow,
  heading,
  intro,
  sampleLabel,
  sampleTag,
  fields,
  note,
}: EnquiryAnatomyProps) {
  return (
    <section className={styles.section} id="anatomy">
      <div className="container">
        <SectionHead
          index={index}
          eyebrow={eyebrow}
          heading={heading}
          intro={intro}
        />

        <div className={styles.grid}>
          <figure className={styles.card}>
            <figcaption className={styles.cardHead}>
              <span className={styles.cardLabel}>{sampleLabel}</span>
              <span className={styles.chip}>{sampleTag}</span>
            </figcaption>
            <dl className={styles.sample}>
              {fields.map((field) => (
                <div key={field.label} className={styles.sampleRow}>
                  <dt className={styles.sampleKey}>{field.label}</dt>
                  <dd className={styles.sampleValue}>{field.sample}</dd>
                </div>
              ))}
            </dl>
          </figure>

          <ol className={styles.notes}>
            {fields.map((field, i) => (
              <li key={field.label} className={styles.note}>
                {/* Decorative: the notes are in the same order as the card
                    above, and a screen reader already announces list
                    position. */}
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={styles.noteTitle}>{field.label}</h3>
                  <p className={styles.noteBody}>{field.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.closing}>{note}</p>
      </div>
    </section>
  );
}
