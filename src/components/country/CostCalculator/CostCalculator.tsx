import { SectionHead } from "@/components/ui";
import {
  CALC_CODES,
  DEFAULTS,
  DEFAULT_BUDGET,
  type CalcCode,
  type CalcInput,
  type Confidence,
} from "@/lib/costModel";

import { CostCalculatorControl } from "./CostCalculatorControl";
import {
  basisText,
  currencyFormatter,
  fill,
  formatEur,
  groupDigits,
} from "./format";
import { ALL_GROUPS, type GroupKey } from "./groups";
import { buildRow, rankRows, scaleOf, verdictFor, type Row } from "./rows";
import styles from "./CostCalculator.module.scss";

export interface CostCalculatorJurisdiction {
  code: CalcCode;
  name: string;
  href?: string;
}

export interface CostCalculatorLabels {
  bandTitle: string;
  bandNote: string;

  /** The only thing the page asks. */
  qValue: string;
  valueAria: string;
  sliderAria: string;

  colProgramme: string;
  colAdvertised: string;
  /** The two column headings again, in one word each, for the phone — where
   *  the header row does not fit and two bare figures would stand side by side
   *  with nothing saying which is which. */
  capAdvertised: string;
  capReal: string;
  colReal: string;
  colBar: string;
  colYours: string;

  /** "{budget}", "{n}". */
  verdictSome: string;
  /** "{budget}", "{name}", "{total}". Used when nothing is left to miss. */
  verdictAll: string;
  /** "{name}", "{short}". Appended to the above when something misses. */
  verdictNearest: string;
  /** "{budget}", "{name}", "{short}". */
  verdictNone: string;
  emptyPrompt: string;

  fits: string;
  /** "{left}". */
  fitsSub: string;
  /** "{short}". */
  missBy: string;
  /** "{advertised}". */
  missSub: string;
  /** "{value}" — the tag on the reader's own line. */
  cutTag: string;

  /** One sentence per jurisdiction, naming the variants of that programme with
   *  their figures. Read, not operated — see the spec. */
  notes: Record<CalcCode, string>;

  workingLabel: string;
  amountLabel: string;
  structureLabel: string;
  groups: Record<GroupKey, string>;

  basisNote: string;
  ctaHeading: string;
  ctaLabel: string;
  ctaNote: string;

  columnLine: string;
  columnBasis: string;
  columnAmount: string;
  flat: string;
  /** "{n}". */
  perYear: string;
  discount: string;
  confidence: Record<Confidence, string>;
  sourceLabel: string;
  lines: Record<string, string>;
  lineNotes: Record<string, string>;

  share: string;
  shareDone: string;
  jurisdictionCta: string;
}

interface CostCalculatorProps {
  index?: string;
  eyebrow: string;
  heading: string;
  intro: string;
  jurisdictions: CostCalculatorJurisdiction[];
  labels: CostCalculatorLabels;
  /** Where the call to action goes, already resolved for the locale. */
  enquiryHref: string;
  locale: string;
}

const SLIDER_MIN = 200_000;
const SLIDER_MAX = 1_200_000;
const SLIDER_STEP = 10_000;

/** Quick figures under the field. Not advice and not a range: the four sums a
 *  reader arriving from an article has most likely already seen quoted. They
 *  need JavaScript, so they ship hidden. */
const PRESETS = [250_000, 500_000, 800_000, 1_000_000];

/** The basis, fixed rather than asked. Every published figure on this site
 *  counts the first cycle once. See docs/calculator-spec-2026-09-03.md. */
const YEARS = 1;

// THE CALCULATOR. One number in; four programmes, each with the figure it
// advertises beside the figure it actually costs.
//
// The whole design is in docs/calculator-spec-2026-09-03.md, written after a
// day of building without one. Two rules from it govern this file:
//
// 1. A ROW IS A FACT ABOUT A PROGRAMME, NOT ABOUT THE READER'S MONEY. Its
//    figures and its bar do not depend on the budget. The budget decides only
//    the verdict beside the row, the order of the rows, and where one vertical
//    line falls across all four bars. Bars stand still; the line moves. The
//    version before this one moved the bars instead, and no reader could
//    connect what they did to what they saw.
//
// 2. NO CONTROLS ON THE FIRST SCREEN EXCEPT THE ONE FIELD. A programme's
//    variants — the Greek €250,000 and €800,000 thresholds, the Maltese lease,
//    the dirham rate, Portugal's online filing — are one sentence of text under
//    that programme's own row, with the figure in it. They are read, not
//    operated. Two rows of bare numbers on one screen, the reader's money and
//    Greece's statutory floor, is what produced "why does €500,000 qualify for
//    fewer countries than €250,000".
export function CostCalculator({
  index,
  eyebrow,
  heading,
  intro,
  jurisdictions,
  labels,
  enquiryHref,
  locale,
}: CostCalculatorProps) {
  const ordered = CALC_CODES.map((code) =>
    jurisdictions.find((entry) => entry.code === code),
  ).filter((entry): entry is CostCalculatorJurisdiction => entry !== undefined);

  if (ordered.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[moveandinvest] Calculator hidden: none of the four modelled " +
          "jurisdictions was passed. Check the country registry — `npm run inspect`.",
      );
    }
    return null;
  }

  const format = currencyFormatter(locale);
  const nameOf = new Map(ordered.map((entry) => [entry.code, entry.name]));
  const hrefOf = new Map(ordered.map((entry) => [entry.code, entry.href]));

  const inputs = Object.fromEntries(
    CALC_CODES.map((code) => {
      const { amount: _amount, ...rest } = DEFAULTS[code];
      return [code, { ...rest, years: YEARS } as Omit<CalcInput, "amount">];
    }),
  ) as Record<CalcCode, Omit<CalcInput, "amount">>;

  const budget = DEFAULT_BUDGET;
  const rows = rankRows(
    ordered.map((entry) => buildRow(entry.code, inputs[entry.code])),
    budget,
  );
  const scale = scaleOf(rows);
  const pct = (value: number) => Math.max(0, Math.min(100, (value / scale) * 100));
  const at = (value: number) => `${pct(value)}%`;
  /** The label is centred on the line, so near either end half of it would sit
   *  outside the frame. The mark itself never moves; only its label tucks in. */
  const tagShift = (share: number) =>
    share > 0.9 ? "translateX(-100%)" : share < 0.1 ? "none" : "translateX(-50%)";

  const fits = rows.filter((row) => verdictFor(row, budget).fits);
  const misses = rows.filter((row) => !verdictFor(row, budget).fits);
  const nearest = misses[0];

  // TWO SENTENCES AT EVERY BUDGET, and that is a layout decision as much as a
  // copy one. The sentence used to name the qualifying countries, so its
  // length moved with their number and the block jumped between two and three
  // lines as the reader dragged the slider — everything below it shifting with
  // it. The names were redundant anyway: the four rows underneath are sorted,
  // ticked and tinted, so which of them qualify is visible without reading a
  // list. What is left varies by a few characters, and the case where nothing
  // is left to miss gets a second sentence of its own rather than none.
  const dearest = rows[rows.length - 1];
  const verdict = !fits.length
    ? fill(labels.verdictNone, {
        budget: formatEur(budget, format),
        name: nameOf.get(nearest?.code ?? "gr") ?? "",
        short: formatEur(nearest ? verdictFor(nearest, budget).diff : 0, format),
      })
    : nearest
      ? `${fill(labels.verdictSome, {
          budget: formatEur(budget, format),
          n: String(fits.length),
        })} ${fill(labels.verdictNearest, {
          name: nameOf.get(nearest.code) ?? nearest.code,
          short: formatEur(verdictFor(nearest, budget).diff, format),
        })}`
      : fill(labels.verdictAll, {
          budget: formatEur(budget, format),
          name: nameOf.get(dearest?.code ?? "gr") ?? "",
          total: formatEur(dearest?.real ?? 0, format),
        });

  const renderRow = (row: Row) => {
    const code = row.code;
    const { fits: ok, diff } = verdictFor(row, budget);
    const href = hrefOf.get(code);
    const extrasTotal = Math.max(row.result.extras, 1);

    return (
      <li
        key={code}
        className={styles.row}
        data-row={code}
        data-name={nameOf.get(code)}
        data-fits={ok ? "yes" : "no"}
      >
        <span className={styles.name}>{nameOf.get(code)}</span>

        {/* ONE STATEMENT, ONE CELL. "advertised €400,000" and "really
            €435,000" is a single claim about a programme; splitting it across
            two columns is what left two figures side by side with nothing
            saying which heading owned which. The arrow carries the relation,
            grey to black carries the emphasis. On a phone the pair stacks and
            the captions come back, because there the arrow has nowhere to go. */}
        <span className={styles.pair}>
          <span className={styles.advertised}>
            <span className={styles.cap}>{labels.capAdvertised}</span>
            <span data-figure>{formatEur(row.advertised, format)}</span>
          </span>
          <i className={styles.arrow} aria-hidden="true">
            →
          </i>
          <span className={styles.real}>
            <span className={styles.cap}>{labels.capReal}</span>
            <b data-real data-figure>
              {formatEur(row.real, format)}
            </b>
          </span>
        </span>

        {/* THE BAR, AND IT DOES NOT MOVE. Grey is what the programme asks for,
            dark is what lands on top of it. The only thing that moves across
            these four bars is the reader's own line, drawn inside each of them
            at the same fraction so the four marks read as one rule. */}
        <span className={styles.barwrap} aria-hidden="true">
          <i
            className={styles.barAdvertised}
            data-bar="advertised"
            style={{ width: at(row.advertised) }}
          />
          <i
            className={styles.barExtras}
            data-bar="extras"
            style={{ left: at(row.advertised), width: at(row.extras) }}
          />
          {/* WHAT IS LEFT OVER, AS A LENGTH. Without it the reader's line
              stands on bare track on every row that fits and reads as though
              it were floating over nothing. The stretch it fills is not empty
              at all: it is the money the programme does not take. On a row
              that does not fit there is no such stretch — the line falls on
              the bar itself — so nothing is drawn. */}
          <i
            className={styles.barSurplus}
            data-bar="surplus"
            data-on={ok ? "yes" : "no"}
            hidden={!ok}
            style={{
              left: at(row.real),
              width: ok ? `${Math.max(0, pct(budget) - pct(row.real))}%` : "0%",
            }}
          />
          <i className={styles.cut} data-cut style={{ left: at(budget) }} />
        </span>

        <span className={styles.verdictCell}>
          <b className={styles.verdictWord} data-verdict-word>
            {ok ? labels.fits : fill(labels.missBy, { short: formatEur(diff, format) })}
          </b>
          <span className={styles.verdictSub} data-verdict-sub>
            {ok
              ? fill(labels.fitsSub, { left: formatEur(diff, format) })
              : fill(labels.missSub, { advertised: formatEur(row.advertised, format) })}
          </span>
        </span>

        {/* THE VARIANTS OF THIS PROGRAMME, AS A SENTENCE. Every figure in it is
            printed by the server from the same model; none of it is a control. */}
        <p className={styles.note}>{labels.notes[code]}</p>

        <details className={styles.disclosure}>
          <summary className={styles.disclose}>{labels.workingLabel}</summary>
          <div className={styles.working}>
            <label className={styles.amountField}>
              <span className={styles.amountLabel}>{labels.amountLabel}</span>
              <span className={styles.field}>
                <input
                  className={styles.amount}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  name={`amount-${code}`}
                  data-input="amount"
                  data-for={code}
                  defaultValue={groupDigits(row.advertised, locale)}
                />
                <span className={styles.unit} aria-hidden="true">
                  €
                </span>
              </span>
            </label>

            <p className={styles.structureLabel}>{labels.structureLabel}</p>
            <span className={styles.structure} aria-hidden="true">
              {ALL_GROUPS.map((group) => {
                const eur = row.groups.find((slice) => slice.key === group)?.eur ?? 0;
                return (
                  <i
                    key={group}
                    className={styles.slice}
                    data-slice={group}
                    hidden={eur <= 0}
                    style={{ width: `${(eur / extrasTotal) * 100}%` }}
                  />
                );
              })}
            </span>
            <ul className={styles.dots}>
              {ALL_GROUPS.map((group) => {
                const eur = row.groups.find((slice) => slice.key === group)?.eur ?? 0;
                return (
                  <li key={group} className={styles.dot} data-dot={group} hidden={eur <= 0}>
                    <i className={styles.swatch} data-slice={group} aria-hidden="true" />
                    <span className={styles.dotName}>{labels.groups[group]}</span>
                    <em className={styles.dotEur} data-dot-eur data-figure>
                      {formatEur(eur, format)}
                    </em>
                  </li>
                );
              })}
            </ul>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{labels.columnLine}</th>
                  <th scope="col">{labels.columnBasis}</th>
                  <th scope="col">{labels.columnAmount}</th>
                </tr>
              </thead>
              <tbody>
                {row.result.lines.map((line) => {
                  const key = `${code}.${line.key}`;
                  const note = labels.lineNotes[key];
                  return (
                    <tr key={line.key} data-line={line.key} hidden={!line.applies}>
                      <th scope="row">
                        <span className={styles.lineName}>{labels.lines[key] ?? key}</span>
                        <span className={styles.tag} data-confidence={line.confidence}>
                          {labels.confidence[line.confidence]}
                        </span>
                        {note ? <span className={styles.lineNote}>{note}</span> : null}
                        {/* The citation is language-neutral by the rule
                            /sources holds: a statute number is the same number
                            in every language. */}
                        <details className={styles.source}>
                          <summary>{labels.sourceLabel}</summary>
                          <p>{line.citation}</p>
                          <p className={styles.checked}>{line.checkedOn}</p>
                        </details>
                      </th>
                      <td data-basis>
                        {basisText(line, labels, locale, YEARS)}
                        <span
                          className={styles.discount}
                          data-discount
                          hidden={!line.discountApplied}
                        >
                          {labels.discount}
                        </span>
                      </td>
                      <td data-eur data-figure>
                        {formatEur(line.eur, format)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {href ? (
              <a className={styles.cta} href={href}>
                {labels.jurisdictionCta}
              </a>
            ) : null}
          </div>
        </details>
      </li>
    );
  };

  return (
    <section className={styles.section} id="calculator">
      <div className="container">
        <SectionHead index={index} eyebrow={eyebrow} heading={heading} intro={intro} level={2} />

        <CostCalculatorControl labels={labels} locale={locale}>
          <div className={styles.tool}>
            <p className={styles.band}>
              <span>{labels.bandTitle}</span>
              <em>{labels.bandNote}</em>
            </p>

            {/* A real <form>, for the reason RouteFinder gives: it scopes its
                controls. No action and no submit button. */}
            <form className={styles.ask}>
              <label className={styles.q} htmlFor="calc-value">
                {labels.qValue}
              </label>
              <div className={styles.askRow}>
                <span className={styles.field}>
                  {/* TEXT, NOT NUMBER: a number input cannot show grouped
                      digits, and this is the largest figure on the page. */}
                  <input
                    id="calc-value"
                    className={styles.value}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    name="value"
                    aria-label={labels.valueAria}
                    data-input="value"
                    defaultValue={groupDigits(budget, locale)}
                  />
                  <span className={styles.unit} aria-hidden="true">
                    €
                  </span>
                </span>
                <span className={styles.presets} data-presets hidden>
                  {PRESETS.map((sum) => (
                    <button
                      key={sum}
                      className={styles.preset}
                      type="button"
                      data-preset={sum}
                      aria-pressed={sum === budget}
                    >
                      {groupDigits(sum, locale)}
                    </button>
                  ))}
                </span>
              </div>
              <div className={styles.sliderRow}>
                <span className={styles.end} data-figure>
                  {groupDigits(SLIDER_MIN, locale)}
                </span>
                <input
                  className={styles.slider}
                  type="range"
                  name="slider"
                  aria-label={labels.sliderAria}
                  data-input="slider"
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={SLIDER_STEP}
                  defaultValue={budget}
                />
                <span className={styles.end} data-figure>
                  {groupDigits(SLIDER_MAX, locale)}
                </span>
              </div>
            </form>

            {/* The band spans the frame; the sentence inside it keeps a
                readable measure. One element cannot do both — putting the
                max-width on the element that carries the background cut the
                dark band off mid-way across the tool. */}
            <p className={styles.verdict}>
              <span className={styles.verdictText} data-verdict>
                {verdict}
              </span>
            </p>

            <div className={styles.colhead} aria-hidden="true">
              <span>{labels.colProgramme}</span>
              <span className={styles.pairHead}>
                <span>{labels.colAdvertised}</span>
                <i className={styles.arrow}>→</i>
                <span>{labels.colReal}</span>
              </span>
              <span>{labels.colBar}</span>
              <span>{labels.colYours}</span>
            </div>

            {/* The tag sits in the bar column's own coordinate system, so it
                lines up with the marks inside the bars at any width. */}
            <div className={styles.rail} aria-hidden="true">
              <span />
              <span />
              <span className={styles.railTrack}>
                <span
                  className={styles.cutTag}
                  data-cut-tag
                  style={{ left: at(budget), transform: tagShift(budget / scale) }}
                >
                  {fill(labels.cutTag, { value: formatEur(budget, format) })}
                </span>
              </span>
              <span />
            </div>

            <ol className={styles.rows} data-rows>
              {rows.map(renderRow)}
            </ol>

            <div className={styles.foot}>
              <p className={styles.basis}>{labels.basisNote}</p>
              {/* Hidden until the control mounts: a button whose only function
                  is to copy the address bar does nothing without JavaScript. */}
              <button className={styles.share} type="button" data-share hidden>
                {labels.share}
              </button>
            </div>
          </div>

          <div className={styles.next}>
            <p className={styles.nextHeading}>{labels.ctaHeading}</p>
            <a className={styles.nextCta} href={enquiryHref}>
              {labels.ctaLabel}
            </a>
            <p className={styles.nextNote}>{labels.ctaNote}</p>
          </div>
        </CostCalculatorControl>
      </div>
    </section>
  );
}
