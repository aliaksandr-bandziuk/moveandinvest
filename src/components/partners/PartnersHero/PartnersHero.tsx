import { Button, Reveal } from "@/components/ui";
import styles from "./PartnersHero.module.scss";

export interface PartnerPrinciple {
  title: string;
  body: string;
}

interface PartnersHeroProps {
  eyebrow?: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  /** Where the button goes. A mailto until the page has a form of its own. */
  ctaHref: string;
  /** Rendered next to the button so the address can be copied, not only clicked. */
  contactEmail: string;
  /** The commercial terms, three of them. See the note below on why these are
   *  content rather than hard-coded prose. */
  principles: PartnerPrinciple[];
}

// Section 01 of /for-partners. The same black plane as the home page hero —
// the header sits inside it on every route — but the composition is the
// opposite way round: the home page opens with a statement and answers it
// with a table, this one opens with a statement and answers it with terms.
//
// The heading names the subject of an enquiry in full: residency and
// property, in the reader's own jurisdiction. That is deliberate and was the
// whole reason this section was rewritten. A partner reaching this page comes
// from a cold email and has never heard of the site; a headline that says
// "qualified enquiries" without saying enquiries about WHAT reads as a lead
// exchange, which is the one thing we are not.
//
// The three principles are Sanity content, not prose in this file, for one
// reason: they are the commercial position, they will be argued about, and
// the person arguing should be able to change them without a deploy. They are
// NOT a price. The site states no price anywhere — the first outbound wave
// exists to ask the market what it pays, and a figure printed here would
// answer the question we are asking.
export function PartnersHero({
  eyebrow,
  heading,
  intro,
  ctaLabel,
  ctaHref,
  contactEmail,
  principles,
}: PartnersHeroProps) {
  return (
    <section className={styles.plane}>
      <div className="container">
        <Reveal>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.heading}>{heading}</h1>
        </Reveal>

        <Reveal order={1}>
          <p className={styles.intro}>{intro}</p>

          <div className={styles.actions}>
            <Button href={ctaHref} tone="onDark">
              {ctaLabel}
            </Button>
            {/* Not a duplicate of the button: the button opens a mail client,
                this is the address itself, for a reader who wants to paste it
                somewhere else or simply see who they would be writing to. */}
            <a className={styles.email} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          </div>
        </Reveal>

        {principles.length > 0 ? (
          <Reveal order={2}>
            <dl className={styles.terms}>
              {principles.map((principle) => (
                <div key={principle.title} className={styles.term}>
                  <dt className={styles.termTitle}>{principle.title}</dt>
                  <dd className={styles.termBody}>{principle.body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
