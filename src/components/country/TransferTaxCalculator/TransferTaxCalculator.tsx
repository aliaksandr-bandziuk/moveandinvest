import {
  CURRENCY,
  transferTax,
  ptCliff,
  ptSmoothStep,
  type PtCategory,
  type TransferJurisdiction,
  type TransferLine,
} from "@/lib/transferTaxModel";

import styles from "./TransferTaxCalculator.module.scss";
import { TransferTaxControl } from "./TransferTaxControl";

// WHAT THE STATE TAKES WHEN THE DEED IS SIGNED, at the reader's own price.
//
// FOUR BLOCKS STACKED, NOT FOUR TABS. Tabs would be tidier and would answer a
// worse question. The thing this site is for is the comparison: a reader
// weighing Athens against Valletta wants both numbers on the screen at once,
// and a tab hides one of them behind a click. Stacking also means every
// jurisdiction is in the HTML at first paint, which is what makes the page
// worth citing and worth crawling.
//
// EVERY NUMBER IS SERVER-RENDERED AT THE DEFAULT PRICE. The control below only
// rewrites them. Without JavaScript the page is a complete, correct table at
// €400,000 and AED 2,000,000 rather than an empty shell — the same rule the
// cost calculator follows, and the reason both pages have something to index.
//
// THE DEFAULT PRICES ARE STARTING FIGURES AND ARE LABELLED AS SUCH. They are
// not a claim about what anything costs; they are a place for the slider to
// begin. The one figure on this page that would be a claim — a euro-dirham
// rate — is the one we refuse to print, because we have no verified source for
// it and a converted total is the only number here nobody could check.

export const DEFAULT_PRICE: Record<TransferJurisdiction, number> = {
  pt: 400_000,
  gr: 400_000,
  mt: 400_000,
  ae: 2_000_000,
};

export const ORDER: TransferJurisdiction[] = ["pt", "gr", "mt", "ae"];

export interface TransferTaxLabels {
  /** Jurisdiction names, from the country registry rather than retyped here. */
  place: Record<TransferJurisdiction, string>;
  /** One line under each heading saying what the instrument is. */
  instrument: Record<TransferJurisdiction, string>;
  lineName: Record<string, string>;
  priceLabel: string;
  priceHint: string;
  totalLabel: string;
  effectiveLabel: string;
  confidence: Record<"primary" | "secondary" | "custom", string>;
  checkedLabel: string;
  ptCategoryLabel: string;
  ptCategory: Record<PtCategory, string>;
  aeToggleLabel: string;
  aeToggleNote: string;
  cliffHeading: string;
  cliffBody: string;
  smoothBody: string;
  scopeHeading: string;
  scopeBody: string;
  routeCostLink: string;
  routeCostHref: string;
}

interface Props {
  labels: TransferTaxLabels;
  locale: string;
  /** 1 on a page whose subject this is, 2 when embedded under another heading. */
  level?: 1 | 2;
}

function money(locale: string, currency: string, value: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(locale: string, value: number) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function LineRow({
  line,
  labels,
  locale,
  currency,
}: {
  line: TransferLine;
  labels: TransferTaxLabels;
  locale: string;
  currency: string;
}) {
  return (
    <li className={styles.line} data-line={line.key}>
      <div className={styles.lineHead}>
        <span className={styles.lineName}>{labels.lineName[line.key] ?? line.key}</span>
        <span className={styles.lineAmount} data-amount>
          {money(locale, currency, line.amount)}
        </span>
      </div>
      <div className={styles.lineMeta}>
        <span className={styles.rate} data-rate>
          {line.effectiveRate === undefined ? "" : percent(locale, line.effectiveRate)}
        </span>
        <span className={styles.tag} data-confidence={line.confidence}>
          {labels.confidence[line.confidence]}
        </span>
        <span className={styles.checked}>
          {labels.checkedLabel} {line.checkedOn}
        </span>
      </div>
      <p className={styles.citation} data-citation>
        {line.citation}
      </p>
      {/* Always in the DOM, switched off when empty. A caveat appears and
          disappears with the Portuguese category and the Dubai toggle, and a
          node created on the fly is a node created without its class.
          `data-off` rather than `hidden` for the reason the stylesheet gives:
          in a CSS module a `display` on the class outranks the attribute, and
          this codebase has paid for that twice. */}
      <p className={styles.caveat} data-caveat data-off={line.caveat ? "false" : "true"}>
        {line.caveat ?? ""}
      </p>
    </li>
  );
}

export function TransferTaxCalculator({ labels, locale, level = 2 }: Props) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <TransferTaxControl
      locale={locale}
      confidence={labels.confidence}
      effectiveLabel={labels.effectiveLabel}
    >
      <div className={styles.root}>
        {ORDER.map((jurisdiction) => {
          const price = DEFAULT_PRICE[jurisdiction];
          const currency = CURRENCY[jurisdiction];
          const result = transferTax({
            jurisdiction,
            price,
            ptCategory: "other-housing",
            aeBuyerPaysAll: false,
          });

          return (
            <section
              key={jurisdiction}
              className={styles.block}
              id={`transfer-tax-${jurisdiction}`}
              data-jurisdiction={jurisdiction}
              data-currency={currency}
            >
              <Heading className={styles.heading}>{labels.place[jurisdiction]}</Heading>
              <p className={styles.instrument}>{labels.instrument[jurisdiction]}</p>

              <div className={styles.controls}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{labels.priceLabel}</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    defaultValue={new Intl.NumberFormat(locale).format(price)}
                    data-input="price"
                    aria-describedby={`hint-${jurisdiction}`}
                  />
                  <span className={styles.currency}>{currency}</span>
                </label>
                <p className={styles.hint} id={`hint-${jurisdiction}`}>
                  {labels.priceHint}
                </p>

                {jurisdiction === "pt" ? (
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{labels.ptCategoryLabel}</span>
                    <select className={styles.select} data-input="pt-category" defaultValue="other-housing">
                      {(
                        [
                          "own-permanent",
                          "other-housing",
                          "other-urban",
                          "rustic",
                          "haven",
                        ] as PtCategory[]
                      ).map((category) => (
                        <option key={category} value={category}>
                          {labels.ptCategory[category]}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {jurisdiction === "ae" ? (
                  <>
                    <label className={styles.toggle}>
                      <input type="checkbox" data-input="ae-buyer-all" />
                      <span>{labels.aeToggleLabel}</span>
                    </label>
                    <p className={styles.hint}>{labels.aeToggleNote}</p>
                  </>
                ) : null}
              </div>

              <ul className={styles.lines} data-lines>
                {result.lines.map((line) => (
                  <LineRow
                    key={line.key}
                    line={line}
                    labels={labels}
                    locale={locale}
                    currency={currency}
                  />
                ))}
              </ul>

              <div className={styles.total}>
                <span className={styles.totalLabel}>{labels.totalLabel}</span>
                <span className={styles.totalAmount} data-total>
                  {money(locale, currency, result.total)}
                </span>
                <span className={styles.totalRate} data-total-rate>
                  {labels.effectiveLabel} {percent(locale, result.effectiveRate)}
                </span>
              </div>

              {jurisdiction === "pt" ? <PtCliffNote labels={labels} locale={locale} /> : null}
            </section>
          );
        })}

        <section className={styles.scope}>
          <h2 className={styles.scopeHeading}>{labels.scopeHeading}</h2>
          <p>{labels.scopeBody}</p>
          <p>
            <a href={labels.routeCostHref}>{labels.routeCostLink}</a>
          </p>
        </section>
      </div>
    </TransferTaxControl>
  );
}

/**
 * The cliff, shown rather than asserted. Both numbers come out of the same
 * function the table above uses, so the paragraph cannot drift away from the
 * scale it describes — which is how a figure on this site went stale before.
 */
function PtCliffNote({ labels, locale }: { labels: TransferTaxLabels; locale: string }) {
  const cliff = ptCliff("other-housing");
  const smooth = ptSmoothStep("other-housing");
  const fmt = (v: number) => money(locale, "EUR", Math.round(v));

  return (
    <div className={styles.cliff}>
      <h3 className={styles.cliffHeading}>{labels.cliffHeading}</h3>
      <p>
        {labels.cliffBody
          .replace("{threshold}", fmt(cliff.threshold))
          .replace("{below}", fmt(cliff.below.tax))
          .replace("{above}", fmt(cliff.above.tax))
          .replace("{step}", fmt(cliff.step))}
      </p>
      <p className={styles.cliffSmooth}>
        {labels.smoothBody
          .replace("{threshold}", fmt(smooth.threshold))
          .replace("{below}", fmt(smooth.below.tax))
          .replace("{above}", fmt(smooth.above.tax))}
      </p>
    </div>
  );
}
