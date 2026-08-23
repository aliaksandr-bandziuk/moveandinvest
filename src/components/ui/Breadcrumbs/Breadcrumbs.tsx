import { Link } from "@/i18n/navigation";

import styles from "./Breadcrumbs.module.scss";

export interface Crumb {
  name: string;
  /** Absent on the last step — the page you are already on. */
  href?: string;
}

interface BreadcrumbsProps {
  trail: Crumb[];
  label: string;
  tone?: "onLight" | "onDark";
}

// The visible trail. Its twin in JSON-LD is built separately in the route from
// the same array, because the markup needs absolute URLs and this needs
// locale-aware relative ones — one source, two shapes, rather than two lists.
//
// The last step is not a link. A link to the page you are on is a control that
// does nothing, and `aria-current="page"` is what actually tells a screen
// reader where the trail ends.
export function Breadcrumbs({ trail, label, tone = "onLight" }: BreadcrumbsProps) {
  return (
    <nav className={`${styles.nav} ${styles[tone]}`} aria-label={label}>
      <ol className={styles.list}>
        {trail.map((crumb, i) => (
          <li key={crumb.name} className={styles.item}>
            {crumb.href ? (
              <Link className={styles.link} href={crumb.href}>
                {crumb.name}
              </Link>
            ) : (
              <span aria-current="page">{crumb.name}</span>
            )}
            {i < trail.length - 1 ? (
              <span className={styles.divider} aria-hidden="true">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
