import { CountryComparisonTable, type CountryRow } from "@/components/country";
import { Button, Reveal, SectionHead } from "@/components/ui";
import type { CtaHref } from "@/lib/routes";

/** A CMS call to action after its href has been matched against the declared
 *  routes — see parseHref. The page does that, not this component. */
export interface ResolvedCta {
  label: string;
  href: CtaHref;
}
import styles from "./HomeHero.module.scss";

export interface HeroContentsEntry {
  /** Two digits, the same number the section shows in its own head. */
  index: string;
  label: string;
  /** Fragment on this page, e.g. "#cost". A bare fragment rather than a route:
   *  every entry points at a section of the page it is already on. */
  href: `#${string}`;
}

interface HomeHeroProps {
  eyebrow?: string;
  /** Short, dated line rendered in mono next to the eyebrow. */
  updatedLabel: string;
  heading: string;
  intro: string;
  primaryCta: ResolvedCta;
  secondaryCta?: ResolvedCta | null;
  /** Heads the contents list. */
  contentsLabel: string;
  /** The eight sections of this page, assembled by the page itself. */
  contents: HeroContentsEntry[];
  tableEyebrow: string;
  tableCaption: string;
  tableIntro?: string;
  /** Mono label between the threshold summary and the table itself. */
  tableDetailLabel: string;
  /** Shown under the table on phones, where two columns sit off-screen. */
  tableScrollHint: string;
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
  contentsLabel,
  contents,
  tableEyebrow,
  tableCaption,
  tableIntro,
  tableDetailLabel,
  tableScrollHint,
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
        <div className={`container ${styles.planeGrid}`}>
          <div>
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

          {/* The contents of the page, beside the statement.
              
              It is here because the container was widened to the viewport and
              the hero then used a third of a 1920 screen, with black to the
              right of it. Filling that with an ornament would have been
              decoration; this is navigation for a page that is ten thousand
              pixels long, and it says the same thing the eyebrow says — that
              what follows is a report rather than a pitch.

              Every label is the eyebrow of the section it points at, read
              from the same document. Rename a section in the studio and the
              contents follow; there is no second list to keep in sync.

              Hidden below lg. On a phone eight rows would push the table down
              by about half a screen, and the reader who needs a contents list
              is the one with a mouse and a long page in front of them. */}
          <nav className={styles.contents} aria-label={contentsLabel}>
            <Reveal order={1}>
              <p className={styles.contentsLabel}>{contentsLabel}</p>
              <ol className={styles.contentsList}>
                {contents.map((entry) => (
                  <li key={entry.href}>
                    <a className={styles.contentsLink} href={entry.href}>
                      {/* Decorative: the list is an <ol>, so the position is
                          already announced. */}
                      <span className={styles.contentsIndex} aria-hidden="true">
                        {entry.index}
                      </span>
                      <span>{entry.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </Reveal>
          </nav>
        </div>
      </section>

      <section className={styles.data} id="comparison">
        <div className="container">
          <Reveal order={2}>
            <SectionHead
              index="01"
              eyebrow={tableEyebrow}
              heading={tableCaption}
              intro={tableIntro}
            />

            {hasRows ? (
              <>
                {/* The threshold summary. It repeats two figures the table
                    below also carries, and that repetition is the point: it
                    is the headline the hero above promises, and on a phone it
                    is the only way to see all five thresholds without
                    scrolling a table sideways. Names, thresholds and the time
                    to a first permit only — four columns here would be the
                    table again. */}
                <ol className={styles.summary}>
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className={styles.cell}
                      data-status={row.status}
                    >
                      <p className={styles.cellName}>{row.name}</p>
                      <span className={styles.cellFigure}>
                        {row.minimumInvestment}
                      </span>
                      <span className={styles.cellSub}>{row.timeToPermit}</span>
                    </li>
                  ))}
                </ol>

                <p className={styles.detailLabel}>{tableDetailLabel}</p>

                <CountryComparisonTable
                  caption={tableCaption}
                  columnLabels={columnLabels}
                  rows={rows}
                  scrollHint={tableScrollHint}
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
