import type { RuleChange } from "@/lib/changeData";

import styles from "./ChangeLog.module.scss";

export interface ChangeLogLabels {
  /** Column headers. A real <thead> at desktop, hidden but still announced
   *  once the rows become cards. */
  date: string;
  change: string;
  instrument: string;
  moved: string;
  /** Rendered in place of an instrument where none exists. Not "n/a": this is
   *  a finding, and it has to read like one. */
  noInstrument: string;
  /** Prefix on the deep link into /sources. */
  seeWorking: string;
}

// The rule-change log: what changed, when, by which act, and which of our own
// figures moved with it.
//
// A REAL <table> for the same reason SourceTable is one, and with the same
// mobile treatment — `display: block` on the parts plus a data-label per cell,
// which keeps the semantics and drops the layout. This is tabular data with a
// header row, which is what a table is for, and a reader navigating by column
// is the strongest argument for keeping it.
//
// THE INSTRUMENT COLUMN IS THE POINT OF THE PAGE, so it is not last. Three of
// the eighteen rows have no instrument at all, and a reader scanning that
// column learns the page's whole argument without reading a word of prose. At
// the width where a table gets truncated, the column that survives beside the
// date should be the one carrying the argument.
//
// A ROW WITH NO INSTRUMENT IS STYLED, NOT JUST WORDED. Colour carries the
// status and the status also carries a word — the same rule the figures follow.
// An accent rule down the left of those rows, and the cell says in text that no
// act could be found. Neither alone would survive a printout or a colourblind
// reader; together they do.
export function ChangeLog({
  changes,
  locale,
  labels,
  countryNames,
  formatDate,
  sourcesHref,
}: {
  changes: RuleChange[];
  locale: string;
  labels: ChangeLogLabels;
  /** Jurisdiction names from the registry, so this page cannot call a country
   *  something the rest of the site does not. */
  countryNames: Map<string, string>;
  /** Renders an ISO date in this locale, and an approximate one to the month.
   *  Passed in rather than built here: the page owns Intl, the table owns
   *  markup. */
  formatDate: (iso: string, approximate?: boolean) => string;
  sourcesHref: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th scope="col">{labels.date}</th>
            <th scope="col">{labels.change}</th>
            <th scope="col">{labels.instrument}</th>
            <th scope="col">{labels.moved}</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change, index) => {
            const orphan = change.instrument === null;
            return (
              <tr
                key={`${change.effective}-${index}`}
                className={`${styles.row} ${orphan ? styles.orphan : ""}`}
              >
                <th scope="row" className={styles.date} data-label={labels.date}>
                  <span className={styles.dateValue}>
                    {formatDate(change.effective, change.approximate)}
                  </span>
                  <span className={styles.country}>
                    {countryNames.get(change.country) ??
                      change.country.toUpperCase()}
                  </span>
                </th>

                <td className={styles.what} data-label={labels.change}>
                  {pick(change.what, locale)}
                </td>

                <td className={styles.instrument} data-label={labels.instrument}>
                  {change.instrument ? (
                    pick(change.instrument, locale)
                  ) : (
                    <span className={styles.missing}>{labels.noInstrument}</span>
                  )}
                </td>

                <td className={styles.moved} data-label={labels.moved}>
                  {change.moved ? pick(change.moved, locale) : null}
                  {/* The deep link goes to the /sources section this row's
                      evidence sits in — the working, not a repeat of it. */}
                  {change.section ? (
                    <a
                      className={styles.working}
                      href={`${sourcesHref}#${change.section}`}
                    >
                      {labels.seeWorking}
                    </a>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The locale's string, falling back to English. Same helper and same reason as
 *  SourceTable's: a missing translation should degrade to readable rather than
 *  to an empty cell. */
function pick(value: Record<string, string>, locale: string): string {
  return value[locale] ?? value.en ?? "";
}
