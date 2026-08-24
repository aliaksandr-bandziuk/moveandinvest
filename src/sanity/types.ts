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

/** Every string the home page renders, in the shape the schema stores it.
 *  Mirrors HOME_PAGE_QUERY field for field — a name that drifts here is a
 *  `undefined` on the page with no type error to catch it. */
export interface HomePageResult {
  hero: {
    eyebrow?: string;
    updatedLabel: string;
    heading: string;
    intro: string;
    primaryCta: CtaResult;
    secondaryCta?: CtaResult;
    contentsLabel: string;
    tableEyebrow: string;
    tableHeading: string;
    tableIntro?: string;
    tableDetailLabel: string;
    tableScrollHint: string;
    columns: {
      jurisdiction: string;
      route: string;
      minimumInvestment: string;
      timeToPermit: string;
      taxRegime: string;
    };
    sourcePending: string;
    pendingLabel: string;
    pendingNote: string;
  };
  method: {
    eyebrow: string;
    heading: string;
    intro?: string;
    points: { title: string; body: string }[];
  };
  map: { eyebrow: string; heading: string; intro: string; note: string };
  cost: {
    eyebrow: string;
    heading: string;
    intro: string;
    advertisedLabel: string;
    extrasLabel: string;
    realLabel: string;
    noteLabel: string;
    note: string;
  };
  routeFinder: {
    eyebrow: string;
    heading: string;
    intro: string;
    questions: {
      budget: { legend: string; upTo500: string; upTo800: string; any: string };
      speed: { legend: string; fast: string; half: string; any: string };
      priority: { legend: string; passport: string; tax: string; speed: string };
    };
    placeholder: string;
    ctaLabel: string;
    rows: {
      advertised: string;
      extras: string;
      real: string;
      permit: string;
      tax: string;
    };
    /** Plain strings carrying {placeholders}. Filled in by the browser, never
     *  parsed as ICU — that is the point of moving them out of next-intl. */
    templates: {
      count: string;
      compromise: string;
      cutBudget: string;
      cutSpeed: string;
      cutPriority: string;
    };
    relaxWords: { budget: string; speed: string; priority: string };
    pending: string;
    unverified: string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    intro: string;
    allLabel: string;
    filterLegend: string;
    countTemplate: string;
    note: string;
  };
  partnerTeaser: {
    eyebrow: string;
    heading: string;
    body: string;
    ctaLabel: string;
    qualifiersLabel: string;
    qualifiers: string[];
  };
  enquiry: {
    eyebrow: string;
    heading: string;
    intro: string;
    fork: {
      chosenLabel: string;
      chosenBody: string;
      openLabel: string;
      openBody: string;
      undecidedOption: string;
      otherOption: string;
    };
    budget: {
      label: string;
      upTo500: string;
      upTo800: string;
      over800: string;
      unknown: string;
    };
    timeline: {
      label: string;
      fast: string;
      halfYear: string;
      year: string;
      browsing: string;
    };
    goals: {
      label: string;
      hint: string;
      residency: string;
      tax: string;
      passport: string;
      business: string;
      property: string;
    };
    contact: {
      situationLabel: string;
      situationHint: string;
      contactLabel: string;
      nameLabel: string;
      emailLabel: string;
      consentLabel: string;
      honeypotLabel: string;
      submitLabel: string;
    };
    fine: string;
    privacyLabel: string;
    result: {
      sentTitle: string;
      sentBody: string;
      failedTitle: string;
      failedBody: string;
      brokeTitle: string;
      brokeBody: string;
    };
  };
  seo: SeoResult;
}

/** All five sections of /for-partners. Each section is nullable: a document
 *  written before that section existed simply does not render it. */
export interface PartnersPageResult {
  hero: {
    eyebrow?: string;
    heading: string;
    intro: string;
    principles: { title: string; body: string }[];
    ctaLabel: string;
    contactEmail: string;
  };
  anatomy: {
    eyebrow: string;
    heading: string;
    intro: string;
    sampleLabel: string;
    sampleTag: string;
    fields: { label: string; sample: string; note: string }[];
    note: string;
  } | null;
  journey: {
    eyebrow: string;
    heading: string;
    intro: string;
    steps: { title: string; body: string }[];
    note: string;
  } | null;
  honesty: {
    eyebrow: string;
    heading: string;
    intro: string;
    notLabel: string;
    notItems: { title: string; body: string }[];
    yesLabel: string;
    yesItems: { title: string; body: string }[];
  } | null;
  contact: {
    eyebrow: string;
    heading: string;
    intro: string;
    questions: string[];
    jurisdictionLabel: string;
    severalLabel: string;
    orgLabel: string;
    orgOptions: string[];
    nameLabel: string;
    emailLabel: string;
    termsLabel: string;
    honeypotLabel: string;
    submitLabel: string;
    fine: string;
    sentTitle: string;
    sentBody: string;
    failedTitle: string;
    failedBody: string;
    brokeTitle: string;
    brokeBody: string;
  } | null;
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

export interface PrivacyPage {
  eyebrow: string;
  heading: string;
  intro: string;
  updatedLabel: string;
  updated: string;
  sections: { heading: string; body: string }[];
  seo: SeoResult;
}

export interface SitemapDoc {
  language?: string;
  _updatedAt: string;
  noIndex?: boolean;
}

export interface CountryPageResult {
  _id: string;
  title: string;
  intro: string;
  route: string;
  minimumInvestment: string;
  timeToPermit: string;
  taxRegime: string;
  costAdvertisedEur?: number | null;
  costExtrasEur?: number | null;
  sourceNote?: string | null;
  body?: unknown;
  seo: SeoResult;
  countryId: string;
  name: string;
  code: string;
  alternates: { language?: string; slug?: string }[];
}

export interface CountryFaqResult {
  _id: string;
  question: string;
  answer: string;
}

export interface TableColumnsResult {
  jurisdiction: string;
  route: string;
  minimumInvestment: string;
  timeToPermit: string;
  taxRegime: string;
}

export interface SitemapCountryDoc {
  language?: string;
  slug?: string;
  _updatedAt: string;
  countryId?: string;
  noIndex?: boolean;
}

/** One property page, everything the route renders. The six section fields are
 *  `unknown` for the same reason `CountryPageResult.body` is: Portable Text is
 *  handed straight to `<PortableText>`, and a hand-written interface for it
 *  would be a second, weaker copy of a type that library already owns. */
export interface PropertyPageResult {
  _id: string;
  title: string;
  intro: string;
  sourceNote?: string | null;
  whoMayBuy?: unknown;
  transactionCosts?: unknown;
  steps?: unknown;
  annualCosts?: unknown;
  shortLet?: unknown;
  residencyLink?: unknown;
  seo: SeoResult;
  countryId: string;
  name: string;
  code: string;
  alternates: { language?: string; slug?: string }[];
  /** The jurisdiction page for the same country and language. Null until it
   *  exists there — the cross-link is then not rendered. */
  jurisdiction?: { title: string; slug: string } | null;
}

/** The mirror link, read by the jurisdiction page. */
export interface PropertyLinkResult {
  title: string;
  slug: string;
}

export type SitemapPropertyDoc = SitemapCountryDoc;
