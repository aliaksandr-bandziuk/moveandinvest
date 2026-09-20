import type { Metadata } from "next";

import { Listing, listingMetadata } from "./listing";

// /blog — Guides & Research, page one.
//
// THE URL IS /blog AND THE SECTION IS NOT CALLED THAT. Deliberate: "blog" is
// the word a reader types and the word every language already has, so it is the
// right address; "Guides & Research" is what the section is, and that belongs
// in the label rather than in the path. Nothing in this file knows the display
// name — it comes from the message catalogue, which is why renaming the section
// costs three strings and no code.
//
// EVERYTHING THIS PAGE RENDERS LIVES IN ./listing, which page two onwards
// renders as well. Page one keeps this address rather than redirecting to
// /blog/page/1: one page, one URL.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return listingMetadata(locale, 1);
}

export default async function Blog({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return Listing({ locale, page: 1 });
}
