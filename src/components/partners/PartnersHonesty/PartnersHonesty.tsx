import { SectionHead } from "@/components/ui";

import styles from "./PartnersHonesty.module.scss";

export interface HonestyItem {
  title: string;
  body: string;
}

interface PartnersHonestyProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  notLabel: string;
  notItems: HonestyItem[];
  yesLabel: string;
  yesItems: HonestyItem[];
}

// Section 04 of /for-partners. A white plane under the black timeline, with
// the commitments set on a dark slab inside it.
//
// The two groups are STACKED rather than set side by side, and that is the
// whole argument of the section. It does two things in order: it removes
// expectations, then it gives commitments — and the commitments have to be
// the last thing read before the form. Side by side on a wide screen, the eye
// goes right first and a partner reads the promises before the caveats, which
// is exactly backwards. A vertical order cannot be taken out of order.
//
// The dark slab is doing the same job as the tonal contrast elsewhere on the
// site: it costs nothing, needs no imagery, and makes the second half read as
// a different KIND of statement rather than as more of the first.
//
// Both lists are <ul>: within a group the items are unordered, unlike the
// steps in section 03 where the sequence is the point.
export function PartnersHonesty({
  index,
  eyebrow,
  heading,
  intro,
  notLabel,
  notItems,
  yesLabel,
  yesItems,
}: PartnersHonestyProps) {
  return (
    <section className={styles.section} id="honesty">
      <div className="container">
        <SectionHead
          index={index}
          eyebrow={eyebrow}
          heading={heading}
          intro={intro}
        />

        <div className={styles.negative}>
          <h3 className={styles.groupLabel}>{notLabel}</h3>
          <ul className={styles.items}>
            {notItems.map((item) => (
              <li key={item.title}>
                <h4 className={styles.itemTitle}>{item.title}</h4>
                <p className={styles.itemBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.positive}>
          <h3 className={styles.groupLabel}>{yesLabel}</h3>
          <ul className={styles.items}>
            {yesItems.map((item) => (
              <li key={item.title}>
                <h4 className={styles.itemTitle}>{item.title}</h4>
                <p className={styles.itemBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
