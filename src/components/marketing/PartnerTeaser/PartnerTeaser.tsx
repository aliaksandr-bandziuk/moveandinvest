import styles from "./PartnerTeaser.module.scss";

interface PartnerTeaserProps {
  index: string;
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** Everything an enquiry has answered before it reaches a partner. */
  qualifiers: string[];
  /** Labels the list, so the words are not floating without context. */
  qualifiersLabel: string;
}

// Section 07. A bordered block split 8/4: the offer on the left, the list of
// what an enquiry has already answered on the right.
//
// Two things this block deliberately does not do.
//
// It does not state how many questions there are. The previous copy promised
// partners "three questions" and the form downstream grew a fourth; a count
// written in prose is a fact stored twice, and the second copy is the one
// that goes stale. The list IS the count.
//
// It does not compete with the enquiry form below it. No filled button, no
// dark plane — a link with a rule under it. The form is the page's one loud
// call to action, and a second one immediately above it would split the
// attention of a reader who is not even the audience for this block: almost
// everybody here is relocating, not selling relocation services.
export function PartnerTeaser({
  index,
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  qualifiers,
  qualifiersLabel,
}: PartnerTeaserProps) {
  return (
    <section className={styles.section} id="partners">
      <div className="container">
        <p className={styles.eyebrow}>
          <span className={styles.index}>{index}</span> · {eyebrow}
        </p>

        <div className={styles.box}>
          <div className={styles.main}>
            <h2 className={styles.heading}>{heading}</h2>
            <p className={styles.body}>{body}</p>
            <a className={styles.cta} href={ctaHref}>
              {ctaLabel}
              {/* Decoration: the link text already says where it goes, and a
                  screen reader announcing "right arrow" adds nothing. */}
              <span aria-hidden="true">{" →"}</span>
            </a>
          </div>

          <div className={styles.side}>
            <h3 className={styles.sideLabel}>{qualifiersLabel}</h3>
            <ol className={styles.qualifiers}>
              {qualifiers.map((qualifier, i) => (
                <li key={qualifier} className={styles.qualifier}>
                  <span className={styles.number} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{qualifier}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
