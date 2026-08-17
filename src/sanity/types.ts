// Hand-written result types for the queries in queries.ts. CLAUDE.md forbids
// an untyped fetch, and these are narrow on purpose: a field that is not
// projected in the query must not appear here, or the type stops describing
// what actually arrives.

import type { Image as SanityImage } from "sanity";

export interface SeoResult {
  metaTitle: string;
  metaDescription: string;
  ogImage?: { asset?: { _ref?: string } };
  noIndex?: boolean;
}

export interface CtaResult {
  label: string;
  href: string;
}

export interface HomePageResult {
  eyebrow?: string;
  heading: string;
  intro: string;
  primaryCta: CtaResult;
  secondaryCta?: CtaResult;
  comparisonHeading: string;
  comparisonIntro?: string;
  methodHeading: string;
  methodIntro?: string;
  methodPoints: { title: string; body: string }[];
  partnerTeaserHeading: string;
  partnerTeaserBody: string;
  seo: SeoResult;
}

export interface SiteSettingsResult {
  siteName: string;
  tagline: string;
  contactEmail: string;
  disclaimer: string;
  /** Optional. Absent means the scroll divider is not rendered at all.
   *  Typed as Sanity's own Image so the url builder accepts it directly —
   *  a hand-written `{ asset: { _ref } }` shape is structurally close but
   *  misses `_type` and fails at the builder's signature. */
  dividerImage?: (SanityImage & { alt?: string }) | null;
  defaultSeo: SeoResult;
}

export interface CountryRowResult {
  _id: string;
  name: string;
  code: string;
  /** Still stored in Sanity; no longer read by the front end. */
  accentColor?: string;
  status: "live" | "planned" | "paused";
  /** Route-finder inputs (section 05). Both optional: a jurisdiction missing
   *  either one is given the benefit of the doubt by the finder rather than
   *  being filtered out. */
  speedBand?: "weeks" | "months" | "long" | null;
  strengths?: string[] | null;
  // Null until that jurisdiction's page exists in this locale — a planned
  // jurisdiction, or a page still sitting in drafts awaiting a fact-check.
  page: {
    title: string;
    slug: string;
    route: string;
    minimumInvestment: string;
    timeToPermit: string;
    taxRegime: string;
    /** Both null until someone has checked and converted them. */
    costAdvertisedEur: number | null;
    costExtrasEur: number | null;
    sourceNote: string;
  } | null;
}

export interface FaqItemResult {
  _id: string;
  question: string;
  answer: string;
  /** Null when the question has no jurisdictions ticked — it applies to all. */
  codes: string[] | null;
}
