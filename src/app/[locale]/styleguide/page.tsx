import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CountryComparisonTable, type CountryRow } from "@/components/country";
import { Button, Chip, Eyebrow } from "@/components/ui";
import styles from "./styleguide.module.scss";

// Never indexed, in any environment: this route is a mirror of the design
// system, and every string on it is placeholder copy. robots.ts also
// disallows it, but a page-level noindex is the part that survives someone
// linking straight to it.
export const metadata: Metadata = {
  title: "Styleguide — moveandinvest",
  robots: { index: false, follow: false },
};

// Fixture data. Deliberately not fetched from Sanity: the styleguide has to
// render identically on a clean checkout with an empty dataset, which is
// exactly when a design regression is easiest to miss.
const FIXTURE_ROWS: CountryRow[] = [
  {
    id: "pt",
    name: "Portugal",
    code: "pt",
    status: "live",
    href: "/portugal",
    route: "Golden Visa (fund)",
    minimumInvestment: "€500,000",
    timeToPermit: "6–9 months",
    taxRegime: "IFICI, 20% flat on qualifying income",
  },
  {
    id: "gr",
    name: "Greece",
    code: "gr",
    status: "live",
    href: "/greece",
    route: "Golden Visa (property)",
    minimumInvestment: "€250,000",
    timeToPermit: "2–4 months",
    taxRegime: "Non-dom, €100,000 flat",
  },
  {
    id: "mt",
    name: "Malta",
    code: "mt",
    status: "live",
    href: "/malta",
    route: "Permanent residence programme",
    minimumInvestment: "€300,000",
    timeToPermit: "4–6 months",
    taxRegime: "Remittance basis",
  },
  {
    id: "ae",
    name: "UAE",
    code: "ae",
    status: "live",
    href: "/uae",
    route: "Golden Visa (property)",
    minimumInvestment: "AED 2,000,000",
    timeToPermit: "3–6 weeks",
    taxRegime: "No personal income tax",
  },
  {
    id: "cy",
    name: "Cyprus",
    code: "cy",
    status: "planned",
    route: "—",
    minimumInvestment: "—",
    timeToPermit: "—",
    taxRegime: "—",
  },
];

const TYPE_SPECIMENS = [
  { lang: "en", display: "Where to move, and what it costs" },
  { lang: "ru", display: "Куда переехать и сколько это стоит" },
  { lang: "pl", display: "Dokąd się przeprowadzić i ile to kosztuje" },
];

const SWATCHES = [
  { name: "bg", token: "--color-bg" },
  { name: "dark", token: "--color-dark" },
  { name: "text", token: "--color-text" },
  { name: "text-muted", token: "--color-text-muted" },
  { name: "accent", token: "--color-accent" },
  { name: "accent-hover", token: "--color-accent-hover" },
  { name: "accent-on-dark", token: "--color-accent-on-dark" },
  { name: "row-hover", token: "--color-row-hover" },
  { name: "map-land", token: "--color-map-land" },
  { name: "map-active", token: "--color-map-active" },
  { name: "map-pending", token: "--color-map-pending" },
  { name: "hairline", token: "--color-hairline" },
  { name: "line", token: "--color-line" },
];

export default async function StyleguidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className={`container ${styles.page}`}>
      <Eyebrow>Internal · not indexed</Eyebrow>
      <h1>Styleguide</h1>
      <p className={styles.lede}>
        Every primitive on one page, on fixture data. Open this after any token
        change — a value edit that looks fine in one component usually breaks a
        different one.
      </p>

      <section className={styles.section}>
        <h2>Colour</h2>
        <ul className={styles.swatches}>
          {SWATCHES.map((swatch) => (
            <li key={swatch.name} className={styles.swatch}>
              <span
                className={styles.chipBox}
                style={{ backgroundColor: `var(${swatch.token})` }}
              />
              <b>{swatch.name}</b>
              <code>{swatch.token}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Typography across all three locales</h2>
        <p className={styles.note}>
          Spectral covers latin, latin-ext and cyrillic. If a line below falls
          back to a system serif, the subset list in src/lib/fonts.ts is wrong.
        </p>
        {TYPE_SPECIMENS.map((specimen) => (
          <div key={specimen.lang} className={styles.specimen}>
            <span className={styles.specimenLang}>{specimen.lang}</span>
            <p className={styles.specimenDisplay} lang={specimen.lang}>
              {specimen.display}
            </p>
          </div>
        ))}
        <p className={styles.figures} data-figure>
          €250,000 · €500,000 · AED 2,000,000 · 6–9 months · 2026-08-15
        </p>
        <p className={styles.note}>
          Figures render in the mono family with tabular numerals — the digits
          above must sit on the same vertical rhythm as the table below.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Buttons</h2>
        <div className={styles.row}>
          <Button href="/for-partners">Request terms</Button>
          <Button href="/for-partners" variant="ghost">
            For partners
          </Button>
          <Button href="https://example.com">External link</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Chips</h2>
        <div className={styles.row}>
          <Chip label="Portugal" />
          <Chip label="Greece" />
          <Chip label="Malta" />
          <Chip label="UAE" />
          <Chip label="Cyprus" muted />
          <Chip label="Not covered" muted />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Comparison table</h2>
        <CountryComparisonTable
          caption="Residency by investment, 2026"
          scrollHint="Two more columns: first permit and tax"
          columnLabels={{
            jurisdiction: "Jurisdiction",
            route: "Route",
            minimumInvestment: "From",
            timeToPermit: "First permit",
            taxRegime: "Tax regime",
          }}
          rows={FIXTURE_ROWS}
        />
        <p className={styles.note}>
          Placeholder figures for the styleguide only. On real pages the source
          note is rendered by the section around the table, not by the table.
        </p>
      </section>
    </main>
  );
}
