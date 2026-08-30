import type { Claim, SourceLink, Verdict } from "@/lib/sourceData";

import styles from "./SourceTable.module.scss";

export interface VerdictLabels {
  confirmed: string;
  corrected: string;
  added: string;
  unverified: string;
  withdrawn: string;
}

export interface SourceTableLabels {
  /** Column headers. Rendered as a real <thead> at desktop and hidden — but
   *  still announced — once the rows become cards. */
  subject: string;
  verdict: string;
  finding: string;
  sourcesLabel: string;
  official: string;
  reproduction: string;
  verdicts: VerdictLabels;
  /** "Re-checked 28 August 2026", already rendered, keyed by the ISO date a
   *  claim names. A map rather than a formatter because this component is
   *  handed data and never a function: passing `t` down would make a server
   *  component's props unserialisable the day one of these becomes a client
   *  component, and the set of dates is three entries long. */
  recheckedByDate: Record<string, string>;
}

interface SourceTableProps {
  id: string;
  heading: string;
  claims: Claim[];
  sources: SourceLink[];
  note?: string | null;
  locale: string;
  labels: SourceTableLabels;
}

// One jurisdiction's working: what the site says, how it compared to the
// source, and what the source says.
//
// A REAL <table>, not a grid of divs, and at 360px it becomes cards WITHOUT
// leaving the table element. This is tabular data — three columns with a
// header row is exactly what a table is for, and a screen reader navigating by
// column is the strongest reason to keep it. The mobile treatment is
// `display: block` on the parts plus a data-label on each cell, which keeps
// the semantics and drops the layout.
//
// THE VERDICT COLUMN IS THE POINT OF THE PAGE. Fourteen of the thirty-three
// rows say "corrected" and four say "unverified" — a reader scanning that
// column learns more about whether to trust this site than the prose could
// tell them. So it is second, not last: at the width where a table gets
// truncated, the column that survives is the one next to the subject.
export function SourceTable({
  id,
  heading,
  claims,
  sources,
  note,
  locale,
  labels,
}: SourceTableProps) {
  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-heading`}>
      <h2 className={styles.heading} id={`${id}-heading`}>
        {heading}
      </h2>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.head}>
            <tr>
              <th scope="col">{labels.subject}</th>
              <th scope="col">{labels.verdict}</th>
              <th scope="col">{labels.finding}</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim, index) => (
              <tr key={`${id}-${index}`} className={styles.row}>
                <th scope="row" className={styles.subject} data-label={labels.subject}>
                  {pick(claim.subject, locale)}
                </th>
                <td className={styles.verdictCell} data-label={labels.verdict}>
                  <VerdictChip verdict={claim.verdict} labels={labels.verdicts} />
                  {/* Only on a row read on a day other than the page's
                      baseline. A date on every row would be a column of
                      thirty-three identical strings, which is how the three
                      that differ would stop being visible. */}
                  {claim.checked ? (
                    <span className={styles.rechecked}>
                      {labels.recheckedByDate[claim.checked] ?? claim.checked}
                    </span>
                  ) : null}
                </td>
                <td className={styles.finding} data-label={labels.finding}>
                  {pick(claim.finding, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty for Cyprus, where nothing could be reached — the note below
          says so rather than the section rendering a heading over nothing. */}
      {sources.length > 0 ? (
        <div className={styles.sources}>
          <p className={styles.sourcesLabel}>{labels.sourcesLabel}</p>
          <ul className={styles.sourceList}>
            {sources.map((source) => (
              <li key={source.url} className={styles.source}>
                {/* The citation is the link text, not the URL: it is the thing
                    that stays true when the link rots. */}
                <a
                  className={styles.sourceLink}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.citation}
                </a>{" "}
                <span
                  className={`${styles.kind} ${
                    source.kind === "official" ? styles.official : styles.reproduction
                  }`}
                >
                  {source.kind === "official" ? labels.official : labels.reproduction}
                </span>
                {source.caveat ? (
                  <span className={styles.caveat}>{pick(source.caveat, locale)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {note ? <p className={styles.note}>{note}</p> : null}
    </section>
  );
}

// The five marks. A chip rather than a word alone: this column is scanned
// vertically, and colour plus a word is faster to scan than a word. Colour is
// never the only carrier — the word is always there — because a reader who
// cannot distinguish them must get the same information.
function VerdictChip({ verdict, labels }: { verdict: Verdict; labels: VerdictLabels }) {
  return <span className={`${styles.chip} ${styles[verdict]}`}>{labels[verdict]}</span>;
}

// The dataset is keyed by locale; the route hands the locale down as a string.
// Falls back to English rather than rendering an empty cell — a missing
// translation should look like an untranslated page, not like a page with a
// hole in it.
function pick(value: Record<string, string>, locale: string): string {
  return value[locale] ?? value.en ?? "";
}
