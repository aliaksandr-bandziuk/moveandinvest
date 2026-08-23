import { InView, SectionHead } from "@/components/ui";
import { COUNTRY_OUTLINES } from "../JurisdictionCards/countryOutlines";

import type { Jurisdiction } from "./matching";
import { realTotal } from "./matching";
import { RouteFinderControl, type RouteFinderLabels } from "./RouteFinderControl";
import styles from "./RouteFinder.module.scss";

export type { Jurisdiction, RouteFinderLabels };

interface Option {
  value: string;
  label: string;
}

export interface RouteFinderQuestion {
  /** Must be "budget", "speed" or "priority" — read back by the control. */
  name: string;
  index: string;
  legend: string;
  options: Option[];
}

interface RouteFinderProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  questions: RouteFinderQuestion[];
  jurisdictions: Jurisdiction[];
  figureLabels: {
    advertised: string;
    extras: string;
    real: string;
    permit: string;
    tax: string;
  };
  ctaLabel: string;
  pendingLabel: string;
  placeholder: string;
  unverified: string;
  controlLabels: RouteFinderLabels;
  locale: string;
}

// Section 05. The block where a reader becomes a lead, which is why the
// answer is a data readout rather than a sentence: every figure in it is the
// same figure the comparison table and the cost block already published, so
// the recommendation inherits their sourcing instead of asserting something
// new.
//
// All five readouts are server-rendered. See RouteFinderControl for why.
export function RouteFinder({
  index,
  eyebrow,
  heading,
  intro,
  questions,
  jurisdictions,
  figureLabels,
  ctaLabel,
  pendingLabel,
  placeholder,
  unverified,
  controlLabels,
  locale,
}: RouteFinderProps) {
  if (jurisdictions.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[moveandinvest] Route finder hidden: no jurisdictions were passed. " +
          "Check that the country registry has documents — `npm run inspect`.",
      );
    }
    return null;
  }

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <section className={styles.section} id="route">
      <div className="container">
        <SectionHead
          index={index}
          eyebrow={eyebrow}
          heading={heading}
          intro={intro}
          tone="onDark"
        />

        <RouteFinderControl jurisdictions={jurisdictions} labels={controlLabels}>
          <div className={styles.grid}>
            <div className={styles.ask}>
              {/* A real <form>, and it has to be one: radio groups are scoped
                  to their form, and loose radios with the same `name` group
                  across the WHOLE document. Two blocks on a page — or one
                  unrelated radio named "budget" — and answering here would
                  silently unanswer there.

                  It carries no action and no submit button, so it never
                  submits: implicit submission is only ever triggered from a
                  text-like field, and there are none here. Nothing leaves the
                  page until the CTA inside the readout is pressed. */}
              <form className={styles.questions}>
                {questions.map((question) => (
                  <fieldset key={question.name} className={styles.question}>
                    <legend className={styles.legend}>
                      <span className={styles.qIndex}>{question.index}</span> ·{" "}
                      {question.legend}
                    </legend>
                    <ul className={styles.options}>
                      {question.options.map((option) => {
                        const id = `rf-${question.name}-${option.value}`;
                        return (
                          <li key={option.value}>
                            <input
                              className={styles.input}
                              type="radio"
                              id={id}
                              name={question.name}
                              value={option.value}
                            />
                            <label className={styles.option} htmlFor={id}>
                              {option.label}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </fieldset>
                ))}
              </form>
            </div>

            {/* InView, not a plain div: the outlines below draw themselves,
                and a CSS animation with no trigger would have run on page
                load — finishing several screens before anyone scrolled here.
                The wrapper sets data-inview and the stylesheet decides what
                that means, exactly as the cost bars in section 04 do. */}
            <InView className={styles.answer}>
              {/* The state every reader sees before their first click, so it
                  carries content rather than a promise of content: the five
                  jurisdictions, their outlines and their thresholds. Answering
                  narrows it to one, which is the section's whole argument
                  made visible.

                  The outlines draw themselves — stroke-dasharray from the
                  path's own length, which ships with the geometry, so this
                  needs no JavaScript and no measurement in the browser. Under
                  prefers-reduced-motion the final state is painted at once. */}
              <div className={styles.placeholder}>
                <ul className={styles.shortlist}>
                  {jurisdictions.map((jurisdiction, i) => {
                    const outline = COUNTRY_OUTLINES[jurisdiction.code];
                    return (
                      <li
                        key={jurisdiction.id}
                        className={styles.shortItem}
                        data-code={jurisdiction.code}
                        style={{ "--i": i } as React.CSSProperties}
                      >
                        {outline ? (
                          <svg
                            className={styles.shortShape}
                            viewBox={outline.viewBox}
                            aria-hidden="true"
                            focusable="false"
                            style={
                              { "--len": outline.len } as React.CSSProperties
                            }
                          >
                            <path d={outline.d} />
                          </svg>
                        ) : null}
                        <span className={styles.shortName}>
                          {jurisdiction.name}
                        </span>
                        <span className={styles.shortFigure}>
                          {jurisdiction.advertised === null
                            ? unverified
                            : currency.format(jurisdiction.advertised)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className={styles.placeholderNote}>{placeholder}</p>
              </div>

              {jurisdictions.map((jurisdiction) => {
                const total = realTotal(jurisdiction);
                return (
                  <article
                    key={jurisdiction.id}
                    className={styles.readout}
                    data-readout={jurisdiction.code}
                  >
                    {/* Empty on the server and hidden while empty. The count
                        depends on answers the server has never seen, so
                        rendering a placeholder number here would be a claim
                        about a state that does not exist yet. */}
                    <p className={styles.count} data-count />

                    <h3 className={styles.name}>{jurisdiction.name}</h3>

                    <dl className={styles.rows}>
                      <div className={styles.figure}>
                        <dt>{figureLabels.advertised}</dt>
                        <dd>
                          {jurisdiction.advertised === null
                            ? unverified
                            : currency.format(jurisdiction.advertised)}
                        </dd>
                      </div>
                      <div className={styles.figure}>
                        <dt>{figureLabels.extras}</dt>
                        <dd>
                          {jurisdiction.extras === null
                            ? unverified
                            : currency.format(jurisdiction.extras)}
                        </dd>
                      </div>
                      <div className={`${styles.figure} ${styles.total}`}>
                        <dt>{figureLabels.real}</dt>
                        <dd>{total === null ? unverified : currency.format(total)}</dd>
                      </div>
                      <div>
                        <dt>{figureLabels.permit}</dt>
                        <dd>{jurisdiction.timeToPermit}</dd>
                      </div>
                      <div>
                        <dt>{figureLabels.tax}</dt>
                        <dd>{jurisdiction.taxRegime}</dd>
                      </div>
                    </dl>

                    {/* Also empty on the server, for the same reason. */}
                    <p className={styles.cut} data-cut />

                    {jurisdiction.href ? (
                      <a
                        className={styles.cta}
                        href={jurisdiction.href}
                        data-route-cta={jurisdiction.code}
                      >
                        {ctaLabel}
                      </a>
                    ) : (
                      <p className={styles.pending}>{pendingLabel}</p>
                    )}
                  </article>
                );
              })}
            </InView>
          </div>
        </RouteFinderControl>
      </div>
    </section>
  );
}
