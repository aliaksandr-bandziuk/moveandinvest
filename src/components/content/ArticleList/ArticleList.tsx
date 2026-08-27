import { Link } from "@/i18n/navigation";
import { articleHref } from "@/lib/routes";
import { categoryLabel } from "@/lib/categories";
import type { ArticleSummary } from "@/sanity/types";

import styles from "./ArticleList.module.scss";

export interface ArticleListLabels {
  /** "Concerns" — precedes the jurisdiction names on a card. */
  jurisdictionsLabel: string;
  /** Shown instead of the list when this language has nothing published. */
  empty: string;
}

interface ArticleListProps {
  entries: ArticleSummary[];
  labels: ArticleListLabels;
  /** Which language to name the categories in. */
  locale: string;
  /** Formats the entry's date in the reader's language. Passed in rather than
   *  done here: the page already builds one formatter and two would be two
   *  chances to format the same date differently. */
  formatDate: (iso: string) => string;
}

// The listing. Hairline rows rather than cards, and that is the same decision
// the FAQ accordion made for the same reason: a card is a container, and a
// container is only worth its border when the things inside it need separating
// from a background. These need separating from each other, which one rule
// between them does.
//
// NO COVER IMAGES, and the constraint that produces that is a real one — this
// project buys no stock photography and generates none. The sibling project's
// listing is a photo grid because it inherited four hundred WordPress posts
// with cover images. A grid of grey placeholders would be worse than no grid.
// What each row shows instead is what a reader actually chooses on: the date,
// the title, the standfirst, and which jurisdictions it concerns.
//
// THE DATE IS FIRST, before the title. On a site whose subject is thresholds
// that move, "is this still true?" is the question a reader arrives with, and
// answering it before they read the headline costs nothing.
export function ArticleList({
  entries,
  labels,
  locale,
  formatDate,
}: ArticleListProps) {
  if (entries.length === 0) {
    return <p className={styles.empty}>{labels.empty}</p>;
  }

  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry._id} className={styles.row}>
          <article className={styles.entry}>
            <p className={styles.meta}>
              <time dateTime={entry.publishedAt}>
                {formatDate(entry.publishedAt)}
              </time>
              {/* Beside the date rather than under the title: on a card the
                  reader is scanning, both are the same kind of fact — when, and
                  about what. */}
              {categoryLabel(entry.category, locale) ? (
                <span className={styles.category}>
                  {categoryLabel(entry.category, locale)}
                </span>
              ) : null}
            </p>

            <h2 className={styles.title}>
              {/* The whole title is the link, not a "read more" after it: a
                  reader scanning a list clicks the headline, and a screen
                  reader listing links gets titles rather than eleven identical
                  "read more"s. */}
              <Link href={articleHref(entry.slug)} className={styles.link}>
                {entry.title}
              </Link>
            </h2>

            <p className={styles.standfirst}>{entry.standfirst}</p>

            {entry.countries && entry.countries.length > 0 ? (
              <p className={styles.countries}>
                <span className={styles.countriesLabel}>
                  {labels.jurisdictionsLabel}
                </span>{" "}
                {entry.countries.map((country) => country.name).join(" · ")}
              </p>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
