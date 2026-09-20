import type { AppPathname } from "./routes";

/** Entries per page in Guides & Research.
 *
 *  TWELVE, chosen with the grid rather than with a rule of thumb: the listing
 *  is three cards wide from `lg` up and two from `md`, so twelve fills whole
 *  rows at both widths and leaves no orphan card on the last row of a full
 *  page. It is also the number that keeps the first page's HTML small enough
 *  to stay a fast crawl target now that the section has passed fifty entries
 *  in Russian. */
export const ENTRIES_PER_PAGE = 12;

/** How many pages a language's listing has. Always at least one, so an empty
 *  language still renders its own page-one copy rather than a 404. */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / ENTRIES_PER_PAGE));
}

/** The slice of the ordered list this page shows, as GROQ's `[from...to]`. */
export function pageRange(page: number): { from: number; to: number } {
  const from = (page - 1) * ENTRIES_PER_PAGE;
  return { from, to: from + ENTRIES_PER_PAGE };
}

/** Where a page of the listing lives.
 *
 *  PAGE ONE IS `/blog`, NEVER `/blog/page/1`. Two addresses for one page is
 *  the duplicate this route would otherwise create, and the one the canonical
 *  of every other page points back at. */
export function blogPageHref(page: number): AppPathname {
  return page <= 1
    ? { pathname: "/blog" }
    : { pathname: "/blog/page/[page]", params: { page: String(page) } };
}

/** Reads the `[page]` segment. Anything that is not a whole number from 2 up
 *  — "1", "0", "02", "abc", "2.5" — returns null, and the route 404s rather
 *  than serving the same list under a second address. */
export function parsePageParam(value: string): number | null {
  if (!/^[1-9][0-9]{0,3}$/.test(value)) return null;
  const page = Number(value);
  return page >= 2 ? page : null;
}
