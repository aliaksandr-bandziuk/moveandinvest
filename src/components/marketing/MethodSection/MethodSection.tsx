import { Reveal } from "@/components/ui";
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
      <div className={`container ${styles.grid}`}>
        <div className={styles.headColumn}>
          {/* The sticky element is this inner div, not the grid item. A grid
              item stretches to the row height, which leaves position:sticky
              nothing to travel inside. */}
          <div className={styles.headInner}>
            <Reveal>
              <p className={styles.eyebrow}>
                <span className={styles.index}>{index}</span> · {eyebrow}
              </p>
              <h2 className={styles.heading}>{heading}</h2>
              {intro ? <p className={styles.intro}>{intro}</p> : null}
            </Reveal>
          </div>
        </div>

        <ol className={styles.list}>
          {points.map((point, i) => (
            <li key={point.title} className={styles.item}>
              <Reveal order={i}>
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
