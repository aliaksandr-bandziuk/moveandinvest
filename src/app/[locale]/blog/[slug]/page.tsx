import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { sanityFetchPublished } from "@/sanity/client";
import { BLOG_ENTRIES_QUERY, BLOG_TAGS } from "@/sanity/queries";
import type { ArticleSummary } from "@/sanity/types";

import { EntryView, entryMetadata } from "./entry";

// One RESEARCH entry, at /blog/<slug>.
//
// A THIN ROUTE SINCE 8 SEPTEMBER 2026. Everything this page renders — the
// hreflang set, the Article JSON-LD, the citations, the FAQPage lifted out of
// the body, the enquiry block — moved to ./entry.tsx, which the top-level
// [slug] route calls with the other kind. The two addresses one `article`
// document can have are described at the top of that file and in
// src/sanity/schemaTypes/documents/article.ts.
//
// A REFERENCE ENTRY 404s HERE, and the check is inside EntryView rather than
// duplicated in this file: one document answering at two URLs is a duplicate we
// would have made ourselves.

export async function generateStaticParams() {
  // Every published entry in every language. `sanityFetchPublished` rather than
  // the draft-aware client: a draft has no business pre-rendering a URL.
  //
  // FILTERED BY KIND, because a reference entry pre-rendered here would be a
  // route that exists only to 404 — and Next would have built it, listed it and
  // served it as a static 404 rather than letting the check run.
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const entries = await sanityFetchPublished<ArticleSummary[]>(
        BLOG_ENTRIES_QUERY,
        { locale },
        BLOG_TAGS,
      );
      return entries
        .filter((entry) => entry.pageKind !== "reference")
        .map((entry) => ({ locale, slug: entry.slug }));
    }),
  );

  return perLocale.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return entryMetadata({ locale, slug, kind: "research" });
}

export default async function Entry({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return EntryView({ locale, slug, kind: "research" });
}
