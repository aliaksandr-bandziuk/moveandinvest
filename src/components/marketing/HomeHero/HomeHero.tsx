import { CountryComparisonTable, type CountryRow } from "@/components/country";
import { Button, Reveal } from "@/components/ui";
import type { CtaResult } from "@/sanity/types";
import styles from "./HomeHero.module.scss";

interface HomeHeroProps {
  eyebrow?: string;
  /** Short, dated line rendered in mono next to the eyebrow. */
  updatedLabel: string;
  heading: string;
  intro: string;
  primaryCta: CtaResult;
  secondaryCta?: CtaResult;
  tableCaption: string;
  tableIntro?: string;
  columnLabels: {
    jurisdiction: string;
    route: string;
    minimumInvestment: string;
    timeToPermit: string;
    taxRegime: string;
  };
  rows: CountryRow[];
  sourceNote: string;
  pendingLabel: string;
  pendingNote: string;
}

// Two planes, butted straight together: a black one carrying the statement
// and a white one carrying the data. No gradient, no seam, no card — the
// contrast between the planes IS the composition, which is why this costs
// nothing to produce and still reads as expensive.
//
// The header renders directly above this on the same black background, so the
// hero has no top border of its own; the header's own hairline is the join.
export function HomeHero({
  eyebrow,
  updatedLabel,
  heading,
  intro,
  primaryCta,
  secondaryCta,
  tableCaption,
  tableIntro,
  columnLabels,
  rows,
  sourceNote,
  pendingLabel,
  pendingNote,
}: HomeHeroProps) {
  const hasRows = rows.length > 0;

  return (
    <>
      <section className={styles.plane}>
        <div className="container">
          <Reveal>
            <p className={styles.meta}>
              {eyebrow ? <span>{eyebrow} · </span> : null}
              <b>{updatedLabel}</b>
            </p>
            <h1 className={styles.heading}>{heading}</h1>
            <div className={styles.rule} />
          </Reveal>

          <Reveal order={1}>
            <p className={styles.intro}>{intro}</p>
            <div className={styles.actions}>
              <Button href={primaryCta.href} tone="onDark">
                {primaryCta.label}
              </Button>
              {secondaryCta ? (
                <Button href={secondaryCta.href} variant="ghost" tone="onDark">
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.data} id="comparison">
        <div className="container">
          <Reveal order={2}>
            <h2 className={styles.sectionTitle}>{tableCaption}</h2>
            {tableIntro ? <p className={styles.sectionIntro}>{tableIntro}</p> : null}

            {hasRows ? (
              <>
                <CountryComparisonTable
                  caption={tableCaption}
                  columnLabels={columnLabels}
                  rows={rows}
                />
                <p className={styles.source}>{sourceNote}</p>
              </>
            ) : (
              // No dashed box and no opacity. A solid rule and a mono label in
              // the accent read as an editorial position — "this is coming,
              // deliberately, one jurisdiction at a time" — where a faded
              // placeholder reads as an unfinished page.
              <div className={styles.pending}>
                <p className={styles.pendingLabel}>{pendingLabel}</p>
                <p className={styles.pendingNote}>{pendingNote}</p>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
