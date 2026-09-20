import { Link } from "@/i18n/navigation";
import { blogPageHref } from "@/lib/blogPagination";

import styles from "./Pagination.module.scss";

export interface PaginationLabels {
  /** Names the whole control for a screen reader: "Guides & Research pages". */
  navLabel: string;
  previous: string;
  next: string;
  /** "Page 2 of 5", already formatted by the caller. */
  position: string;
  /** Prefixes a numbered link for a screen reader: "Page 3". */
  pageLabel: (page: number) => string;
}

interface PaginationProps {
  current: number;
  total: number;
  labels: PaginationLabels;
}

/** WHICH NUMBERS ARE SHOWN. The first, the last, the current and its two
 *  neighbours; a gap anywhere else. Never every page — at fifty entries in one
 *  language the row already wraps on a phone, and a paginator that wraps is
 *  read as a paragraph of digits.
 *
 *  Returned as numbers and nulls rather than as JSX so the decision can be
 *  tested by reading it, and so the gap is one thing rather than two. */
function pageItems(current: number, total: number): (number | null)[] {
  const keep = new Set<number>([1, total, current, current - 1, current + 1]);
  const shown = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const items: (number | null)[] = [];
  let previous = 0;
  for (const page of shown) {
    if (previous && page - previous > 1) items.push(null);
    items.push(page);
    previous = page;
  }
  return items;
}

/** The listing's pager.
 *
 *  EVERY PAGE IS A REAL LINK, including the neighbours — this is a server
 *  component and there is no JavaScript behind it, so the section stays
 *  crawlable page by page. The current page is rendered as text with
 *  `aria-current`, because a link to where you already are is a link that
 *  wastes a tap.
 *
 *  Page one is always `/blog`, never `/blog/page/1` — see blogPagination.ts. */
export function Pagination({ current, total, labels }: PaginationProps) {
  if (total <= 1) return null;

  return (
    <nav className={styles.nav} aria-label={labels.navLabel}>
      {/* The sentence a screen reader gets first, and the only place the
          position is stated in words. Visually it sits under the numbers on a
          phone and beside them from md up. */}
      <p className={styles.position}>{labels.position}</p>

      <ul className={styles.list}>
        <li className={styles.item}>
          {current > 1 ? (
            <Link className={styles.step} href={blogPageHref(current - 1)} rel="prev">
              {labels.previous}
            </Link>
          ) : (
            <span className={styles.stepOff} aria-hidden="true">
              {labels.previous}
            </span>
          )}
        </li>

        {pageItems(current, total).map((page, i) =>
          page === null ? (
            <li className={styles.item} key={`gap-${i}`}>
              <span className={styles.gap} aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li className={styles.item} key={page}>
              {page === current ? (
                <span className={styles.current} aria-current="page">
                  {page}
                </span>
              ) : (
                <Link
                  className={styles.page}
                  href={blogPageHref(page)}
                  aria-label={labels.pageLabel(page)}
                >
                  {page}
                </Link>
              )}
            </li>
          ),
        )}

        <li className={styles.item}>
          {current < total ? (
            <Link className={styles.step} href={blogPageHref(current + 1)} rel="next">
              {labels.next}
            </Link>
          ) : (
            <span className={styles.stepOff} aria-hidden="true">
              {labels.next}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
