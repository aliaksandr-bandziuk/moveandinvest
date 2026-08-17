import { CountUp, InView } from "@/components/ui";
import styles from "./CostComparison.module.scss";

export interface CostRow {
  id: string;
  name: string;
  /** The figure every brochure prints, in euro. */
  advertised: number;
  /** Taxes, fees and first-year renewals on top of it, in euro. */
  extras: number;
}

interface CostComparisonProps {
  eyebrow: string;
  index: string;
  heading: string;
  intro: string;
  rows: CostRow[];
  labels: {
    advertised: string;
    extras: string;
    real: string;
  };
  note: string;
  locale: string;
}

// The strongest differentiator on the site: everyone publishes the entry
// threshold, almost nobody publishes what it actually costs to clear it.
//
// Every figure is euro. That is a real constraint, not a formatting choice —
// a bar chart comparing dirhams to euro is a picture of an exchange rate, not
// of a decision. The jurisdiction pages keep their own native-currency
// figures; this block only renders a row once someone has converted and
// checked one, which is why it takes `rows` already filtered.
export function CostComparison({
  eyebrow,
  index,
  heading,
  intro,
  rows,
  labels,
  note,
  locale,
}: CostComparisonProps) {
  // Rendering nothing is correct here, but silence is a bad diagnostic: from
  // the browser an intentionally hidden section and a broken one look
  // identical. Say which it is, in the terminal, in development only.
  if (rows.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[moveandinvest] Cost comparison hidden: no jurisdiction has both " +
          "costAdvertisedEur and costExtrasEur filled in Sanity. Fill both on a " +
          "countryPage document (Comparison row tab) and the section appears. " +
          "Run `npm run inspect` to see which are missing.",
      );
    }
    return null;
  }

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const widest = Math.max(...rows.map((row) => row.advertised + row.extras));

  return (
    <section className={styles.section} id="cost">
      <div className={`container ${styles.head}`}>
        <p className={styles.eyebrow}>
          <span className={styles.index}>{index}</span> · {eyebrow}
        </p>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.intro}>{intro}</p>
      </div>

      <InView className="container">
        <ol className={styles.rows}>
          {rows.map((row) => {
            const total = row.advertised + row.extras;
            return (
              <li key={row.id} className={styles.row}>
                <h3 className={styles.name}>{row.name}</h3>

                <div
                  className={styles.track}
                  // The bar is a picture of the numbers beside it, which are
                  // already readable — so it carries no separate label.
                  aria-hidden="true"
                >
                  <span
                    className={styles.advertised}
                    style={{ width: `${(row.advertised / widest) * 100}%` }}
                  />
                  <span
                    className={styles.extras}
                    style={{ width: `${(row.extras / widest) * 100}%` }}
                  />
                </div>

                <p className={styles.figures}>
                  <span className={styles.figure}>
                    <span className={styles.figureLabel}>{labels.advertised}</span>
                    <CountUp value={row.advertised} locale={locale} currency="EUR">
                      {currency.format(row.advertised)}
                    </CountUp>
                  </span>
                  <span className={styles.figure}>
                    <span className={styles.figureLabel}>{labels.extras}</span>
                    <CountUp value={row.extras} locale={locale} currency="EUR">
                      {currency.format(row.extras)}
                    </CountUp>
                  </span>
                  <span className={`${styles.figure} ${styles.total}`}>
                    <span className={styles.figureLabel}>{labels.real}</span>
                    <CountUp value={total} locale={locale} currency="EUR">
                      {currency.format(total)}
                    </CountUp>
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      </InView>

      <div className="container">
        <p className={styles.note}>{note}</p>
      </div>
    </section>
  );
}
