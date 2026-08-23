import { groq } from "next-sanity";

// Every query lives here, never inline in a page. Two reasons: the tag
// strings below have to match what the revalidation webhook sends, and a
// query duplicated in two routes is a query that gets fixed in one of them.

export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage" && language == $locale][0]{
    hero{
      eyebrow, updatedLabel, heading, intro, primaryCta, secondaryCta, contentsLabel,
      tableEyebrow, tableHeading, tableIntro, tableDetailLabel, tableScrollHint,
      columns{ jurisdiction, route, minimumInvestment, timeToPermit, taxRegime },
      sourcePending, pendingLabel, pendingNote
    },
    method{ eyebrow, heading, intro, points[]{ title, body } },
    map{ eyebrow, heading, intro, note },
    cost{ eyebrow, heading, intro, advertisedLabel, extrasLabel, realLabel, noteLabel, note },
    routeFinder{
      eyebrow, heading, intro,
      questions{
        budget{ legend, upTo500, upTo800, any },
        speed{ legend, fast, half, any },
        priority{ legend, passport, tax, speed }
      },
      placeholder, ctaLabel,
      rows{ advertised, extras, real, permit, tax },
      templates{ count, compromise, cutBudget, cutSpeed, cutPriority },
      relaxWords{ budget, speed, priority },
      pending, unverified
    },
    faq{ eyebrow, heading, intro, allLabel, filterLegend, countTemplate, note },
    partnerTeaser{ eyebrow, heading, body, ctaLabel, qualifiersLabel, qualifiers },
    enquiry{
      eyebrow, heading, intro,
      fork{ chosenLabel, chosenBody, openLabel, openBody, undecidedOption, otherOption },
      budget{ label, upTo500, upTo800, over800, unknown },
      timeline{ label, fast, halfYear, year, browsing },
      goals{ label, hint, residency, tax, passport, business, property },
      contact{
        situationLabel, situationHint, contactLabel, nameLabel, emailLabel,
        consentLabel, honeypotLabel, submitLabel
      },
      fine,
      privacyLabel,
      result{ sentTitle, sentBody, failedTitle, failedBody, brokeTitle, brokeBody }
    },
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

// All five sections of /for-partners.
export const PARTNERS_PAGE_QUERY = groq`
  *[_type == "partnersPage" && language == $locale][0]{
    hero{ eyebrow, heading, intro, principles[]{ title, body }, ctaLabel, contactEmail },
    anatomy{
      eyebrow, heading, intro, sampleLabel, sampleTag,
      fields[]{ label, sample, note },
      note
    },
    journey{ eyebrow, heading, intro, steps[]{ title, body }, note },
    honesty{
      eyebrow, heading, intro,
      notLabel, notItems[]{ title, body },
      yesLabel, yesItems[]{ title, body }
    },
    contact{
      eyebrow, heading, intro, questions,
      jurisdictionLabel, severalLabel, orgLabel, orgOptions,
      nameLabel, emailLabel, termsLabel, honeypotLabel, submitLabel,
      fine, sentTitle, sentBody, failedTitle, failedBody, brokeTitle, brokeBody
    },
    seo
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

// `siteSettings` is listed even though no section reads it directly: the
// layout above this page renders the footer and the scroll divider from that
// document, and a tag list that omits it leaves the route serving a stale
// footer after a settings edit. `country` is listed because section 05's
// jurisdiction chips come from the registry, not from the page document.
export const PARTNERS_TAGS = ["partnersPage", "siteSettings", "country"];

// The policy is its own document and shares nothing with the other pages, so
// a revalidation of one never has to invalidate the other.
export const PRIVACY_TAGS = ["privacyPage", "siteSettings"];

// The privacy policy. `sections` is an array rather than a fixed set of
// fields — see privacyPage.ts for why a legal text is the one page on this
// site whose composition an editor is allowed to change.
export const PRIVACY_PAGE_QUERY = groq`
  *[_type == "privacyPage" && language == $locale][0]{
    eyebrow, heading, intro, updatedLabel, updated,
    sections[]{ heading, body },
    seo
  }
`;
