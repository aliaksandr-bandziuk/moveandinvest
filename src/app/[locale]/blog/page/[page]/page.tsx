import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_LOCALES } from "@/i18n/routing";
import { pageCount, parsePageParam } from "@/lib/blogPagination";
import { sanityFetchPublished } from "@/sanity/client";
import { BLOG_ENTRIES_COUNT_QUERY, BLOG_TAGS } from "@/sanity/queries";

import { Listing, listingMetadata } from "../../listing";

// /blog/page/2 onwards.
//
// A PATH SEGMENT RATHER THAN ?page=2. Reading `searchParams` in a server
// component opts the whole route into dynamic rendering for every visitor,
// which the rendering rule in CLAUDE.md forbids — and a query string is also
// the shape Search Console reports as a duplicate of the page it hangs off.
//
// THE SEGMENT STARTS AT TWO. `parsePageParam` refuses "1", so /blog/page/1
// 404s rather than serving the listing at a second address; "01", "0" and
// anything that is not a small whole number go the same way.

export async function generateStaticParams() {
  // uk is deliberately absent: the Ukrainian section has no listing — /uk/blog
  // is redirected to /ru/blog by the proxy (src/lib/ukSection.ts).
  const perLocale = await Promise.all(
    SITE_LOCALES.map(async (locale) => {
      const total = await sanityFetchPublished<number>(
        BLOG_ENTRIES_COUNT_QUERY,
        { locale },
        BLOG_TAGS,
      );
      const pages = pageCount(total);
      return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({
        locale,
        page: String(i + 2),
      }));
    }),
  );

  return perLocale.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}): Promise<Metadata> {
  const { locale, page } = await params;
  const number = parsePageParam(page);
  if (number === null) return {};
  return listingMetadata(locale, number);
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}) {
  const { locale, page } = await params;
  const number = parsePageParam(page);
  if (number === null) notFound();
  return Listing({ locale, page: number });
}
