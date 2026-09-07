import type { RuleChange } from "@/lib/changeData";

import { ChangeFilter } from "./ChangeFilter";
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
  /** Announced to a screen reader in place of the visible chip row. */
  filterLegend: string;
  /** The first chip, and the default. */
  filterAll: string;
  /** "{n} of {total}", both replaced. Shown only while a jurisdiction is
   *  selected — under "all" the number is the length of the table. */
  filterCount: string;
  /** The accessible name of the little link that carries one row's own address.
   *  Carries {change}: "Link to this change: Portugal doubled its naturalisation
   *  period" reads correctly in a list of links; twenty-three identical
   *  "Permalink"s do not. */
  permalinkLabel: string;
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
  // The chips are built from the log itself, in the order the countries first
  // appear, so a jurisdiction with no rows never gets a control that returns an
  // empty table — and adding a row for a fifth country needs no edit here.
  const codes: string[] = [];
  for (const change of changes) {
    if (!codes.includes(change.country)) codes.push(change.country);
  }

  return (
    <ChangeFilter className={styles.root} countTemplate={labels.filterCount}>
      <fieldset className={styles.filter}>
        <legend className={styles.filterLegend}>{labels.filterLegend}</legend>
        <ul className={styles.chips}>
          {["all", ...codes].map((code, i) => {
            const id = `change-${code}`;
            return (
              <li key={code}>
                <input
                  className={styles.input}
                  type="radio"
                  id={id}
                  name="change-filter"
                  value={code}
                  defaultChecked={i === 0}
                />
                <label className={styles.chip} htmlFor={id}>
                  {code === "all"
                    ? labels.filterAll
                    : (countryNames.get(code) ?? code.toUpperCase())}
                </label>
              </li>
            );
          })}
        </ul>
        <p className={styles.count} data-change-count aria-live="polite" />
      </fieldset>

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
          {changes.map((change) => {
            const orphan = change.instrument === null;
            return (
              // ONE ANCHOR PER CHANGE, so an outside page can cite the rule
              // rather than the log. This is the page's whole outreach value:
              // nobody else publishes a dated, sourced rule tracker, and a
              // tracker gets linked because somebody needs to write "as of this
              // date the rule is this" — which needs the address of that row,
              // not of twenty-three rows.
              <tr
                id={change.id}
                key={change.id}
                className={`${styles.row} ${orphan ? styles.orphan : ""}`}
                data-codes={change.country}
              >
                <th scope="row" className={styles.date} data-label={labels.date}>
                  <span className={styles.dateValue}>
                    {formatDate(change.effective, change.approximate)}
                  </span>
                  <span className={styles.country}>
                    {countryNames.get(change.country) ??
                      change.country.toUpperCase()}
                  </span>
                  {/* This row's own address, so a reader can take it away. A
                      real link and not a copy button: a button needs
                      JavaScript and a clipboard permission the browser may
                      refuse, and shows nothing before it is pressed.

                      IN THE DATE CELL, NOT AT THE END OF THE PROSE, and that
                      is a fix for what rendering showed. Set after the "what
                      moved here" sentence it landed flush against the full
                      stop — "row, withdrawn.#" — which is the same defect this
                      stylesheet already carries a note about for `.working`,
                      committed the day before. The first column is where the
                      row's identity lives: the date, the jurisdiction, and now
                      the address, which is what an anchor names. */}
                  <a
                    className={styles.permalink}
                    href={`#${change.id}`}
                    aria-label={labels.permalinkLabel.replace(
                      "{change}",
                      pick(change.what, locale),
                    )}
                  >
                    #
                  </a>
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
    </ChangeFilter>
  );
}

/** The locale's string, falling back to English. Same helper and same reason as
 *  SourceTable's: a missing translation should degrade to readable rather than
 *  to an empty cell. */
function pick(value: Record<string, string>, locale: string): string {
  return value[locale] ?? value.en ?? "";
}
