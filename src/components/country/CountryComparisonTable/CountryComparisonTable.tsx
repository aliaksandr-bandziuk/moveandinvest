import { CountryChip } from "../CountryChip";
import type { CountryRow } from "../types";
import styles from "./CountryComparisonTable.module.scss";

interface CountryComparisonTableProps {
  /** Duplicated from the section heading above it, and visually hidden here —
   *  a <table> still needs its own <caption> for assistive technology. */
  caption: string;
  columnLabels: {
    jurisdiction: string;
    route: string;
    minimumInvestment: string;
    timeToPermit: string;
    taxRegime: string;
  };
  rows: CountryRow[];
  /** Shown under the table on phones, where the last two columns sit
   *  off-screen. Names the columns: "two more columns" alone does not say
   *  which two, and a reader who cannot see them cannot guess. */
  scrollHint: string;
}

// A real <table> with <caption> and <th scope>, not a grid of divs. Screen
// readers announce it as a table and an answer engine can lift it whole —
// which is the entire reason this design leads with a table instead of a
// photograph.
//
// No container: no border, no radius, no panel. The first build wrapped this
// in a rounded card and that single decision made the page read as marketing.
// Structure now comes only from hairlines and from the tabular figures.
export function CountryComparisonTable({
  caption,
  columnLabels,
  rows,
  scrollHint,
}: CountryComparisonTableProps) {
  return (
    <>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className={styles.caption}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{columnLabels.jurisdiction}</th>
              <th scope="col">{columnLabels.route}</th>
              <th scope="col">{columnLabels.minimumInvestment}</th>
              <th scope="col">{columnLabels.timeToPermit}</th>
              <th scope="col">{columnLabels.taxRegime}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} data-status={row.status}>
                <th scope="row" className={styles.rowHead}>
                  <CountryChip country={row} />
                </th>
                <td>{row.route}</td>
                <td data-figure>{row.minimumInvestment}</td>
                <td data-figure>{row.timeToPermit}</td>
                <td>{row.taxRegime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decorative arrow, real sentence. aria-hidden on the arrow only: a
          screen reader gets the column names from <th scope="col"> and the
          table is not clipped for it in the first place. */}
      <p className={styles.hint}>
        <span aria-hidden="true">→</span>
        {scrollHint}
      </p>
    </>
  );
}
