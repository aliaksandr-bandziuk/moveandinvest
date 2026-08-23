import { Breadcrumbs, type Crumb } from "@/components/ui";

import styles from "./CountryHero.module.scss";

interface CountryHeroProps {
  trail: Crumb[];
  breadcrumbLabel: string;
  /** The route name — "Golden Visa (fund)". The page's eyebrow. */
  route: string;
  title: string;
  intro: string;
}

// The black plane again, the same one the home page's hero and the
// jurisdiction cards sit on, so a reader arriving here from the table is
// obviously still on the same site.
//
// The route is the eyebrow rather than a fact in the strip below, because it
// is the one thing that names what this page IS — "Golden Visa (fund)" tells
// you what you are reading about before the figures tell you what it costs.
export function CountryHero({
  trail,
  breadcrumbLabel,
  route,
  title,
  intro,
}: CountryHeroProps) {
  return (
    <section className={styles.section}>
      <div className="container">
        <Breadcrumbs trail={trail} label={breadcrumbLabel} tone="onDark" />

        <p className={styles.route}>{route}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.intro}>{intro}</p>
      </div>
    </section>
  );
}
