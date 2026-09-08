import {
  clock,
  formatClockDate,
  soonest,
  type CaveatKey,
  type ClockInput,
  type ClockResult,
  type NatCode,
} from "@/lib/naturalisationModel";
import type { Locale } from "@/i18n/routing";

import styles from "./NaturalisationClock.module.scss";

// THE CITIZENSHIP CLOCK. Four jurisdictions, one set of dates, and the whole
// argument of the tool is in the gap between two of them.
//
// EVERY STATE IS RENDERED ON THE SERVER, including the ones the default inputs
// do not show. The control below this component never creates a node: it
// rewrites the text of dates it was given and switches rows and caveats on and
// off by a data attribute. Three reasons, and the third is the one that decided
// it.
//
//   1. The page is readable, and indexable, with JavaScript off — which for a
//      site whose pages Google has not finished crawling is not a nicety.
//   2. There is no flash of an empty tool while a bundle loads.
//   3. A caveat that appears only after a click is a caveat that will be missed
//      by exactly the reader who most needs it. Rendering all of them, and
//      hiding the inapplicable ones, means the honest text ships in the HTML
//      whatever happens to the script.
//
// WHY NOT `hidden`. The attribute loses to a `display` set in a CSS module —
// recorded in this codebase after it cost an evening — so visibility here runs
// on `data-off`, which the module owns and which nothing else can outrank.

export interface ClockLabels {
  heading: string;
  intro: string;
  /** The controls. */
  qIssued: string;
  qIssuedNote: string;
  qApplied: string;
  qAppliedNote: string;
  qGroup: string;
  groupEu: string;
  groupCplp: string;
  groupOther: string;
  qFiled: string;
  qFiledNote: string;
  qContinuous: string;
  qContinuousNote: string;
  yes: string;
  no: string;
  /** The table. */
  colWhere: string;
  colEarliest: string;
  colRule: string;
  countedFromIssued: string;
  countedFromApplied: string;
  yearsSuffix: string;
  noRoute: string;
  noRouteNote: string;
  unread: string;
  /** The summary line above the table. */
  soonestIs: string;
  soonestNone: string;
  /** Caveat text, keyed exactly as the model's CaveatKey. */
  caveats: Record<CaveatKey, string>;
  /** Jurisdiction names. */
  names: Record<NatCode, string>;
  sourcesLabel: string;
  sourcesHref: string;
}

interface Props {
  labels: ClockLabels;
  locale: Locale;
  input: ClockInput;
  /** Every caveat the model can produce, so the client can switch them on
   *  without building a node. Passed rather than derived so that the list
   *  cannot drift from the model's own type. */
  allCaveats: CaveatKey[];
}

function dateCell(r: ClockResult, labels: ClockLabels, locale: Locale) {
  if (r.verdict === "no-route") {
    return (
      <>
        <span className={styles.verdictWord}>{labels.noRoute}</span>
        <span className={styles.cellNote}>{labels.noRouteNote}</span>
      </>
    );
  }
  if (r.verdict === "unread" || r.earliest === null) {
    return <span className={styles.verdictWord}>{labels.unread}</span>;
  }
  return (
    <>
      <span className={styles.date} data-date>
        {formatClockDate(r.earliest, locale)}
      </span>
      <span className={styles.cellNote}>
        <span data-years>{r.years}</span> {labels.yearsSuffix} ·{" "}
        <span data-counted>
          {r.countedFrom === "permit-applied"
            ? labels.countedFromApplied
            : labels.countedFromIssued}
        </span>
      </span>
    </>
  );
}

export function NaturalisationClock({ labels, locale, input, allCaveats }: Props) {
  const results = clock(input);
  const first = soonest(results);

  return (
    <section className={styles.root} data-clock>
      <h2 className={styles.heading}>{labels.heading}</h2>
      <p className={styles.intro}>{labels.intro}</p>

      <form className={styles.controls} data-controls>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{labels.qIssued}</span>
          <input
            className={styles.input}
            type="date"
            name="issued"
            defaultValue={input.permitIssued}
            data-input="issued"
          />
          <span className={styles.fieldNote}>{labels.qIssuedNote}</span>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{labels.qApplied}</span>
          <input
            className={styles.input}
            type="date"
            name="applied"
            defaultValue={input.permitApplied ?? ""}
            data-input="applied"
          />
          <span className={styles.fieldNote}>{labels.qAppliedNote}</span>
        </label>

        <fieldset className={styles.field}>
          <legend className={styles.fieldLabel}>{labels.qGroup}</legend>
          <div className={styles.choices}>
            {/* THREE OPTIONS, NOT TWO, since 8 September 2026. Portugal treats
                EU and CPLP citizens alike; Greece gives three years to EU
                nationals and says nothing about CPLP. One bucket for both was
                telling Brazilians the wrong Greek answer. */}
            <label className={styles.choice}>
              <input
                type="radio"
                name="group"
                value="eu"
                defaultChecked={input.group === "eu"}
                data-input="group"
              />
              <span>{labels.groupEu}</span>
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                name="group"
                value="cplp"
                defaultChecked={input.group === "cplp"}
                data-input="group"
              />
              <span>{labels.groupCplp}</span>
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                name="group"
                value="other"
                defaultChecked={input.group === "other"}
                data-input="group"
              />
              <span>{labels.groupOther}</span>
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend className={styles.fieldLabel}>{labels.qFiled}</legend>
          <div className={styles.choices}>
            <label className={styles.choice}>
              <input
                type="radio"
                name="filed"
                value="yes"
                defaultChecked={input.filedBefore19May2026}
                data-input="filed"
              />
              <span>{labels.yes}</span>
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                name="filed"
                value="no"
                defaultChecked={!input.filedBefore19May2026}
                data-input="filed"
              />
              <span>{labels.no}</span>
            </label>
          </div>
          <span className={styles.fieldNote}>{labels.qFiledNote}</span>
        </fieldset>

        <fieldset className={styles.field}>
          <legend className={styles.fieldLabel}>{labels.qContinuous}</legend>
          <div className={styles.choices}>
            <label className={styles.choice}>
              <input
                type="radio"
                name="continuous"
                value="yes"
                defaultChecked={input.continuous}
                data-input="continuous"
              />
              <span>{labels.yes}</span>
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                name="continuous"
                value="no"
                defaultChecked={!input.continuous}
                data-input="continuous"
              />
              <span>{labels.no}</span>
            </label>
          </div>
          <span className={styles.fieldNote}>{labels.qContinuousNote}</span>
        </fieldset>
      </form>

      <p className={styles.summary} data-summary>
        {first
          ? `${labels.soonestIs} ${labels.names[first.code]}, ${formatClockDate(first.earliest!, locale)}`
          : labels.soonestNone}
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{labels.colWhere}</th>
              <th scope="col">{labels.colEarliest}</th>
              <th scope="col">{labels.colRule}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.code} data-row={r.code} data-verdict={r.verdict}>
                <th scope="row" className={styles.where}>
                  {labels.names[r.code]}
                </th>
                <td className={styles.when}>{dateCell(r, labels, locale)}</td>
                <td className={styles.rule}>
                  <span className={styles.instrument} data-instrument>
                    {r.instrument}
                  </span>
                  {/* EVERY caveat is rendered for every row and switched off by
                      the control. See the note at the head of this file: a
                      caveat that only exists after a click is a caveat the
                      wrong reader never sees. */}
                  <ul className={styles.caveats}>
                    {allCaveats.map((key) => (
                      <li
                        key={key}
                        className={styles.caveat}
                        data-caveat={key}
                        data-off={r.caveats.includes(key) ? undefined : "true"}
                      >
                        {labels.caveats[key]}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.sources}>
        <a href={labels.sourcesHref}>{labels.sourcesLabel}</a>
      </p>
    </section>
  );
}
