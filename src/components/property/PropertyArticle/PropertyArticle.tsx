import { PortableText } from "next-sanity";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs, type Crumb } from "@/components/ui";

import styles from "./PropertyArticle.module.scss";

/** One of the six. `body` is Portable Text; a section with nothing in it is
 *  not rendered at all. */
export interface PropertySection {
  id: string;
  heading: string;
  body: unknown;
}

interface PropertyArticleProps {
  trail: Crumb[];
  breadcrumbLabel: string;
  /** The eyebrow — "Buying property", localized. Names what this page IS
   *  before the title says which country it is about. */
  eyebrow: string;
  title: string;
  intro: string;
  sections: PropertySection[];
  contentsLabel: string;
  sourceLabel: string;
  sourceNote: string;
  /** The jurisdiction page for the same country, when it exists in this
   *  language. */
  jurisdiction?: { label: string; title: string; slug: string } | null;
}

// The buying page: a hero on the black plane, a contents list, then six
// sections in a fixed order.
//
// THE CONTENTS LIST IS NOT DECORATION. This page is long by nature — six
// sections of law — and the reader almost never wants all six. They want
// "can I let it out" or "what do I pay every year", and a list of six anchors
// at the top is the difference between answering that in one click and making
// them scroll past four sections they did not ask for. It is also what lets an
// answer engine see the page's structure without parsing the prose.
//
// Section headings are h2 and come from the message catalogue, not from
// Sanity: all four jurisdictions carry byte-identical headings in a language,
// which is what makes the pages comparable at all. See propertyPage.ts.
//
// A section with no body is dropped by the caller, so this component never
// renders a heading over an empty column.
export function PropertyArticle({
  trail,
  breadcrumbLabel,
  eyebrow,
  title,
  intro,
  sections,
  contentsLabel,
  sourceLabel,
  sourceNote,
  jurisdiction,
}: PropertyArticleProps) {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs trail={trail} label={breadcrumbLabel} tone="onDark" />

          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>

          {/* Rendered inside the hero rather than as its own band: it is a way
              into the page, not a section of it. */}
          {sections.length > 0 ? (
            <nav className={styles.contents} aria-label={contentsLabel}>
              <p className={styles.contentsLabel}>{contentsLabel}</p>
              <ol className={styles.contentsList}>
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={styles.contentsLink}>
                      <span className={styles.contentsNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <div className={`container ${styles.sectionInner}`}>
            <h2 className={styles.heading}>{section.heading}</h2>
            <div className={styles.prose}>
              <PortableText value={section.body as never} />
            </div>
          </div>
        </section>
      ))}

      <section className={styles.sources}>
        <div className="container">
          <p className={styles.sourcesLabel}>{sourceLabel}</p>
          <p className={styles.sourcesBody}>{sourceNote}</p>

          {/* The other half of the same jurisdiction. Not a "related pages"
              block: there is exactly one destination, and naming it is worth
              more than a grid of cards would be. */}
          {jurisdiction ? (
            <p className={styles.crossLink}>
              <Link href={`/${jurisdiction.slug}`}>
                {jurisdiction.label} — {jurisdiction.title}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
