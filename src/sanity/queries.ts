import { groq } from "next-sanity";

// Every query lives here, never inline in a page. Two reasons: the tag
// strings below have to match what the revalidation webhook sends, and a
// query duplicated in two routes is a query that gets fixed in one of them.

export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage" && language == $locale][0]{
    eyebrow,
    heading,
    intro,
    primaryCta,
    secondaryCta,
    comparisonHeading,
    comparisonIntro,
    methodHeading,
    methodIntro,
    methodPoints[]{ title, body },
    partnerTeaserHeading,
    partnerTeaserBody,
    seo
  }
`;

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings" && language == $locale][0]{
    siteName,
    tagline,
    contactEmail,
    disclaimer,
    dividerImage,
    defaultSeo
  }
`;

// Driven from `country`, not from `countryPage`, on purpose: the registry is
// the complete list of jurisdictions, and a planned one has no page yet. A
// query rooted in countryPage would silently drop Cyprus from the table,
// which is exactly the omission the design refuses to make.
export const COUNTRY_ROWS_QUERY = groq`
  *[_type == "country"] | order(order asc) {
    _id,
    name,
    code,
    accentColor,
    status,
    speedBand,
    strengths,
    "page": *[_type == "countryPage" && references(^._id) && language == $locale][0]{
      title,
      "slug": slug.current,
      route,
      minimumInvestment,
      timeToPermit,
      taxRegime,
      costAdvertisedEur,
      costExtrasEur,
      sourceNote
    }
  }
`;

// The home page renders every question; the jurisdiction chips filter them in
// the browser. `jurisdictions` is projected down to bare ISO codes because
// that is all the filter needs — an empty array means the question applies to
// all five, which is the common case and the reason the field is optional.
export const FAQ_ITEMS_QUERY = groq`
  *[_type == "faqItem" && language == $locale] | order(order asc) {
    _id,
    question,
    answer,
    "codes": jurisdictions[]->code
  }
`;

// Cache tags. `country` and `countryPage` are both listed wherever the table
// renders: a chip colour change touches `country` alone, and the webhook only
// ever sends the type of the document that actually changed.
export const HOME_TAGS = [
  "homePage",
  "siteSettings",
  "country",
  "countryPage",
  "faqItem",
];
