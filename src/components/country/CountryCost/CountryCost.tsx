import { CountUp, InView, SectionHead } from "@/components/ui";

import styles from "./CountryCost.module.scss";

interface CountryCostProps {
  eyebrow: string;
  heading: string;
  intro: string;
  advertised: number;
  extras: number;
  labels: { advertised: string; extras: string; real: string };
  noteLabel: string;
  note: string;
  locale: string;
}

// The same claim the home page's section 04 makes, for one jurisdiction: the
// threshold is not the price.
//
// NOT the CostComparison component with a single row. That block is a bar
// chart, and a bar chart with one bar compares nothing — it is a decoration
// that looks like evidence. Here the three figures carry themselves, and the
// only visual is the one thing worth showing: how much of the real total the
// advertised threshold actually is.
//
// Rendered only when both figures exist. The route checks that before mounting
// this, on the same rule the rest of the site follows — a missing input hides
// the element, it never produces a placeholder.
export function CountryCost({
  eyebrow,
  heading,
  intro,
  advertised,
  extras,
  labels,
  noteLabel,
  note,
  locale,
}: CountryCostProps) {
  const total = advertised + extras;
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <section className={styles.section} id="cost">
      <div className="container">
        <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />

        <InView className={styles.body}>
          <dl className={styles.figures}>
            <div className={styles.figure}>
              <dt className={styles.label}>{labels.advertised}</dt>
              <dd className={styles.value}>
                <CountUp value={advertised} locale={locale} currency="EUR">
                  {currency.format(advertised)}
                </CountUp>
              </dd>
            </div>
            <div className={styles.figure}>
              <dt className={styles.label}>{labels.extras}</dt>
              <dd className={styles.value}>
                <CountUp value={extras} locale={locale} currency="EUR">
                  {currency.format(extras)}
                </CountUp>
              </dd>
            </div>
            <div className={`${styles.figure} ${styles.real}`}>
              <dt className={styles.label}>{labels.real}</dt>
              <dd className={styles.value}>
                <CountUp value={total} locale={locale} currency="EUR">
                  {currency.format(total)}
                </CountUp>
              </dd>
            </div>
          </dl>

          {/* The bar is a picture of the two numbers above it, which are
              already readable, so it carries no label of its own. */}
          <div className={styles.track} aria-hidden="true">
            <span
              className={styles.advertised}
              style={{ width: `${(advertised / total) * 100}%` }}
            />
            <span className={styles.extras} style={{ width: `${(extras / total) * 100}%` }} />
          </div>

          <p className={styles.note}>
            <span className={styles.noteLabel}>{noteLabel}</span> {note}
          </p>
        </InView>
      </div>
    </section>
  );
}
