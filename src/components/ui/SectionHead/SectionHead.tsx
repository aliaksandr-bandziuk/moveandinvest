import styles from "./SectionHead.module.scss";

interface SectionHeadProps {
  /** Two digits. Rendered large above the eyebrow, and repeated nowhere.
   *  Optional: a page that is not a numbered section of the home page — the
   *  privacy policy — omits it, and the element disappears rather than
   *  rendering as an empty paragraph still holding its own margin. */
  index?: string;
  eyebrow: string;
  heading: string;
  /** The deck: the right half of the spread. A real paragraph, not a caption
   *  — see the note in the stylesheet. Optional only so a section can be
   *  built before its copy is written; every section on the site passes it. */
  intro?: string;
  /** Set on the black plane, which needs its own three colours. */
  tone?: "onLight" | "onDark";
  /** The heading level. Defaults to 2, which is right for a numbered section
   *  of a page whose h1 is its hero. A page whose ONLY head is this one — the
   *  privacy policy — passes 1, because a document with no h1 is a document
   *  a screen reader cannot summarise and a crawler reads as untitled. */
  level?: 1 | 2;
  /** Anything that belongs under the deck rather than under the section —
   *  a button, a note. Rare; most sections pass nothing. */
  children?: React.ReactNode;
}

// The head of every numbered section on the site, in one place.
//
// It exists because the same four elements — number, eyebrow, title, deck —
// were being rebuilt in eleven components, which is eleven chances for the
// spacing to drift and eleven files to edit when it changes.
//
// The composition is a SPREAD: title left, deck right, both filling the
// container. The stylesheet carries the argument for why, and it is the same
// argument that decides how the sections below it are laid out — most of them
// inherit the 6fr/5fr split, so the head and the body share one grid rather
// than each inventing its own.
export function SectionHead({
  index,
  eyebrow,
  heading,
  intro,
  tone = "onLight",
  level = 2,
  children,
}: SectionHeadProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div className={`${styles.head} ${styles[tone]}`}>
      <div className={styles.text}>
        {/* Decorative: the eyebrow under it already names the section, and a
            screen reader announcing "zero four" adds nothing but noise. */}
        {index ? (
          <p className={styles.number} aria-hidden="true">
            {index}
          </p>
        ) : null}
        <p className={styles.eyebrow}>{eyebrow}</p>
        <Heading className={styles.heading}>{heading}</Heading>
      </div>

      <div className={styles.deck}>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
        {children}
      </div>
    </div>
  );
}
