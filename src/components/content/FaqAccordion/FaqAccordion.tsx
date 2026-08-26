import { Link } from "@/i18n/navigation";
import type { FaqItem } from "@/lib/faqData";

import styles from "./FaqAccordion.module.scss";

export interface FaqAccordionLabels {
  /** Prefix for the link under an answer, e.g. "Sources". */
  sourcesLabel: string;
  /** Names of the /sources sections, keyed the same way as SOURCE_SECTIONS. */
  sectionNames: Record<string, string>;
}

interface FaqAccordionProps {
  /** Groups every accordion on the page into one exclusive set. */
  groupName: string;
  items: FaqItem[];
  locale: string;
  labels: FaqAccordionLabels;
  /** Index of the first row, so numbering runs across sections rather than
   *  restarting at 01 in each one. */
  startIndex: number;
}

// The /faq accordion. NATIVE <details>, NOT A REACT COMPONENT WITH STATE.
//
// The sibling giuseppeiannone project solves this with a "use client"
// component: useState for the open row, a controlled/uncontrolled prop pair, a
// composite "section:index" key held by the page, and a CSS grid-template-rows
// 0fr→1fr transition driven by a data attribute. It works, and the reasoning in
// it is sound — every panel stays mounted so the answers are in the HTML
// whether open or not, which is the whole point for an answer engine.
//
// This site gets the same property for nothing, because that is what <details>
// already is. The content is in the document, in the accessibility tree, and
// found by the browser's own find-in-page, with no JavaScript at all. That
// matters more here than there: this site's forms post without JavaScript, its
// result panels are :target, and its FAQ filter is written as an enhancement
// that degrades to the complete list. An accordion that needs React to open
// would be the only interactive thing on the site that stops working when a
// script fails.
//
// EXCLUSIVE OPENING COMES FROM `name`, not from state. Every <details> sharing
// a name behaves as one group: opening any one closes the other. Measured in
// Chrome 151 before this was written, rather than assumed — the group works,
// the closed panel's text stays in the DOM, and ::details-content and
// interpolate-size are both supported, so the animation is pure CSS. In an
// older engine the name attribute is ignored and several panels can be open at
// once, which is a lesser accordion and not a broken page.
//
// THE SOURCE LINK IS THE POINT OF THE COMPONENT. Every answer that states a
// figure carries a link to the section of /sources the figure was checked
// against. Of fourteen competitor FAQ pages read on 25 August 2026, not one
// attached a source to an answer. The list is validated at import time in
// faqData.ts, so an unsourced figure fails the build rather than reaching here.
export function FaqAccordion({
  groupName,
  items,
  locale,
  labels,
  startIndex,
}: FaqAccordionProps) {
  return (
    <div className={styles.accordion}>
      {items.map((item, i) => {
        const number = String(startIndex + i + 1).padStart(2, "0");

        return (
          // `id` on the <details> makes every answer individually linkable.
          // Deliberately NOT `open` by default on the first row: on a page of
          // fifty-two, one open panel at the top pushes the section list below
          // the fold and tells the reader nothing about the rest.
          <details key={item.key} id={item.key} name={groupName} className={styles.row}>
            <summary className={styles.summary}>
              <span className={styles.index} aria-hidden="true">
                {number}
              </span>
              <h3 className={styles.question}>{item.q[locale as keyof typeof item.q]}</h3>
              <span className={styles.icon} aria-hidden="true">
                <span className={styles.iconBarH} />
                <span className={styles.iconBarV} />
              </span>
            </summary>

            <div className={styles.panel}>
              <p className={styles.answer}>{item.a[locale as keyof typeof item.a]}</p>

              {item.sources.length > 0 ? (
                <p className={styles.sources}>
                  <span className={styles.sourcesLabel}>{labels.sourcesLabel}</span>{" "}
                  {item.sources.map((key, index) => (
                    <span key={key}>
                      {index > 0 ? <span aria-hidden="true"> · </span> : null}
                      <Link
                        href={{ pathname: "/sources", hash: key }}
                        className={styles.sourceLink}
                      >
                        {labels.sectionNames[key] ?? key}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
