import { SectionHead } from "@/components/ui";
import styles from "./RegionBand.module.scss";

export interface RegionBandLink {
  key: string;
  label: string;
  description: string;
  href: string;
}

interface RegionBandProps {
  eyebrow: string;
  heading: string;
  intro?: string;
  links: RegionBandLink[];
}

// An unnumbered band on the home page that points at a section of the site
// which is not a jurisdiction — today, Poland, for readers who already live
// there. Added 17 September 2026.
//
// NOT A NUMBERED SECTION, and that is the constraint it is built around.
// Poland is a section, not a sixth jurisdiction: it cannot join the cards
// above, and a number would shift sections 04–08 and make it read as one of
// the five. So SectionHead gets no index, and the band is left out of the
// hero's contents list.
//
// The page renders it only when the locale's document has a heading and at
// least one link, which in practice means the Russian home page only.
//
// Links, not a button: the page's one loud call to action is the enquiry
// form, and this block is a signpost for a different reader, like the
// partner teaser.
export function RegionBand({ eyebrow, heading, intro, links }: RegionBandProps) {
  return (
    <section className={styles.section} id="poland">
      <div className="container">
        <SectionHead eyebrow={eyebrow} heading={heading} intro={intro} />

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.key} className={styles.item}>
              <a className={styles.link} href={link.href}>
                <span className={styles.label}>
                  {link.label}
                  {/* Decoration: the label already says where it goes. */}
                  <span aria-hidden="true">{" →"}</span>
                </span>
                <span className={styles.description}>{link.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
