import { Link } from "@/i18n/navigation";
import { Reveal, SectionHead } from "@/components/ui";
import type { CountryRow } from "../types";
import { COUNTRY_OUTLINES } from "./countryOutlines";
import styles from "./JurisdictionCards.module.scss";

interface JurisdictionCardsProps {
  index: string;
  eyebrow: string;
  heading: string;
  intro: string;
  /** The scale disclosure. Required by the schema — see the note below. */
  note: string;
  rows: CountryRow[];
  labels: {
    minimumInvestment: string;
    timeToPermit: string;
    taxRegime: string;
  };
}

// Section 03. Replaced the world map that stood here.
//
// The map answered one question — where — and answered it beautifully. These
// cards answer where, how much and how long in the same space, and each one
// is a link into the jurisdiction it names, which the map's annotations were
// not. One drawn geography per page, not two.
//
// TWO BIG CARDS AND THREE SMALL ONES, not five equal ones. The page's real
// weakness was that every section had the same density from the hero to the
// footer, so nothing read as edited. A row that changes weight inside itself
// is the cheapest way to fix that, and the split is not arbitrary: Portugal
// and Greece are the two jurisdictions most readers arrive for.
//
// On the black plane. Section 02 above and section 04 below are both white,
// and replacing the map with a white block would have put four white
// sections in a row through the middle of the page.
//
// The colours are NOT editorial. They live in the stylesheet beside the rest
// of the tokens because they carry a machine-checked property: every
// adjacent pair stays apart under deuteranopia (ΔE 16.3) and under normal
// vision (18.3), on both planes. An editor picking a hex in the studio would
// silently break that, which is why `accentColor` on the country document is
// not read here.
export function JurisdictionCards({
  index,
  eyebrow,
  heading,
  intro,
  note,
  rows,
  labels,
}: JurisdictionCardsProps) {
  if (rows.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[moveandinvest] Jurisdiction cards hidden: no country documents. " +
          "Run `npm run seed`.",
      );
    }
    return null;
  }

  const card = (row: CountryRow, wide: boolean) => {
    const outline = COUNTRY_OUTLINES[row.code];
    const pending = row.status !== "live";

    const body = (
      <>
        {outline ? (
          // aria-hidden, not role="img": the country's name is right beside
          // it in text, and "Portugal, Portugal" is what a screen reader
          // would otherwise read out.
          <svg
            className={styles.shape}
            viewBox={outline.viewBox}
            aria-hidden="true"
            focusable="false"
          >
            <path d={outline.d} />
          </svg>
        ) : (
          <div className={styles.shape} aria-hidden="true" />
        )}

        <div className={styles.text}>
          <p className={styles.name}>{row.name}</p>
          <p className={styles.figure}>{row.minimumInvestment}</p>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt className={styles.key}>{labels.timeToPermit}</dt>
              <dd>{row.timeToPermit}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.key}>{labels.taxRegime}</dt>
              <dd>{row.taxRegime}</dd>
            </div>
          </dl>
        </div>
      </>
    );

    const className = [
      styles.card,
      wide ? styles.wide : "",
      pending ? styles.pending : "",
    ]
      .filter(Boolean)
      .join(" ");

    // A jurisdiction with no published page is still shown, and is still not
    // a link: a card that looks clickable and is not is worse than a card
    // that plainly says "nothing here yet".
    return row.href ? (
      <li key={row.id} data-code={row.code}>
        <Link className={className} href={row.href}>
          {body}
        </Link>
      </li>
    ) : (
      <li key={row.id} data-code={row.code}>
        <div className={className}>{body}</div>
      </li>
    );
  };

  const big = rows.slice(0, 2);
  const small = rows.slice(2);

  return (
    <section className={styles.section} id="jurisdictions">
      <div className="container">
        <Reveal>
          <SectionHead
            index={index}
            eyebrow={eyebrow}
            heading={heading}
            intro={intro}
            tone="onDark"
          />
        </Reveal>

        <Reveal order={1}>
          <ul className={styles.gridTwo}>
            {big.map((row) => card(row, true))}
          </ul>
        </Reveal>

        <Reveal order={2}>
          <ul className={styles.gridThree}>
            {small.map((row) => card(row, false))}
          </ul>
        </Reveal>

        {/* Every outline is fitted to its own box, so Malta is drawn as large
            as Portugal. At card size that reads as a mark rather than a map,
            but the page's whole position is that it does not let a picture
            imply something the figures do not — so it says so. */}
        <p className={styles.note}>{note}</p>
      </div>
    </section>
  );
}
