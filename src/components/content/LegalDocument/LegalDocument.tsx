import { SectionHead } from "@/components/ui";

import styles from "./LegalDocument.module.scss";

export interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentProps {
  eyebrow: string;
  heading: string;
  intro: string;
  updatedLabel: string;
  updated: string;
  sections: LegalSection[];
}

// A legal text — today the privacy policy, tomorrow terms if they are ever
// needed. Deliberately a component rather than markup inside the route: the
// second such page must not be a copy of the first with different words.
//
// It reuses `SectionHead` for its own head, which is what keeps a policy page
// looking like part of this site rather than a document pasted into it. Below
// that the composition is different from every other page here, and on
// purpose: numbered sections in one narrow column, because this is the one
// page on the site that is read top to bottom in order rather than scanned.
// The two-column spread that fixes an empty right field elsewhere would, here,
// break a sentence a reader is following.
//
// The page head is an h1 here, not the h2 SectionHead defaults to: this is the
// only head on the page, and a document whose highest heading is an h2 has no
// title as far as a screen reader or a crawler is concerned. The numbered
// section headings below it are h2s, which is the level they should have been
// under an h1 all along.
//
// The date sits at the top rather than the bottom. On a policy it is not a
// footnote — it is the first thing a careful reader checks, and the difference
// between a page maintained last week and one maintained two years ago is the
// whole of what they are trying to find out.
export function LegalDocument({
  eyebrow,
  heading,
  intro,
  updatedLabel,
  updated,
  sections,
}: LegalDocumentProps) {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead level={1} eyebrow={eyebrow} heading={heading} intro={intro}>
          <p className={styles.updated}>
            <span className={styles.updatedLabel}>{updatedLabel}</span>{" "}
            <span className={styles.updatedValue} data-figure>
              {updated}
            </span>
          </p>
        </SectionHead>

        <ol className={styles.list}>
          {sections.map((section, i) => (
            <li key={section.heading} className={styles.item}>
              {/* Decorative: the heading beside it already names the section,
                  and a screen reader announcing "zero three" adds nothing. */}
              <p className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div className={styles.text}>
                <h2 className={styles.heading}>{section.heading}</h2>
                {/* One paragraph per section by design. A policy that needs
                    sub-paragraphs needs another section instead — the array in
                    Sanity makes that free, and it keeps every heading a real
                    entry point rather than a decorative rule. */}
                <p className={styles.body}>{section.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
