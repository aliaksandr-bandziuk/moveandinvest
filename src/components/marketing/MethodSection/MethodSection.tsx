import { Reveal, SectionHead } from "@/components/ui";
import styles from "./MethodSection.module.scss";

export interface MethodPoint {
  title: string;
  body: string;
}

interface MethodSectionProps {
  eyebrow: string;
  /** Rendered in mono next to the eyebrow, matching the table's column heads. */
  index: string;
  heading: string;
  intro?: string;
  points: MethodPoint[];
}

// The second black plane on the page, and the block that makes the table
// above it quotable: a figure without a stated source and date is a claim, not
// data.
//
// The heading column is sticky from lg up. That is the whole reason this
// layout was chosen over a stacked one — the reader keeps "how the comparison
// is built" in view while reading what it is built from, so the four points
// read as one argument rather than four unrelated bullets.
export function MethodSection({
  eyebrow,
  index,
  heading,
  intro,
  points,
}: MethodSectionProps) {
  return (
    <section className={styles.section} id="method">
      <div className="container">
        <div className={styles.head}>
          <Reveal>
            <SectionHead
              index={index}
              eyebrow={eyebrow}
              heading={heading}
              intro={intro}
            />
          </Reveal>
        </div>

        <ol className={styles.list}>
          {points.map((point, i) => (
            // The grid lives on the Reveal wrapper, not on the <li>. Reveal
            // renders a div between the two, so a grid declared on the <li>
            // would have exactly one child — the wrapper — and the three
            // columns would never appear.
            <li key={point.title} className={styles.item}>
              <Reveal order={i} className={styles.itemGrid}>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.pointTitle}>{point.title}</h3>
                <p className={styles.pointBody}>{point.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
