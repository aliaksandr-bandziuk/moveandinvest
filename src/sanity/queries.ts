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

// One query, run once per singleton type, for sitemap.ts. It returns every
// language version of that type with the two things a sitemap entry needs —
// when it last changed, and whether it is meant to be indexed at all.
//
// Rooted in the DOCUMENT rather than in a hand-written list of URLs: the URL
// for a fixed route is already known in code, but "does this page exist in
// Polish yet" and "when did it change" are only knowable from the dataset. A
// sitemap that hardcodes both is one that lists a page nobody has written.
export const SITEMAP_SINGLETON_QUERY = groq`
  *[_type == $documentType] {
    language,
    _updatedAt,
    "noIndex": seo.noIndex
  }
`;

// --- Jurisdiction pages ------------------------------------------------------

// Every published slug for one locale, for generateStaticParams. Rooted in
// countryPage rather than in the `country` registry on purpose — this one is
// the opposite case from COUNTRY_ROWS_QUERY: the table must list a
// jurisdiction that has no page yet, and this must not build a route for one.
export const COUNTRY_SLUGS_QUERY = groq`
  *[_type == "countryPage" && language == $locale && defined(slug.current)]{
    "slug": slug.current
  }
`;

// One jurisdiction page, everything it renders, in a single request.
//
// `alternates` is the interesting part. All three language versions reference
// the SAME `country` document, so the sibling URLs are derivable from that
// reference alone — no translation-metadata document is involved, and there is
// nothing to fall out of sync. The sibling project builds hreflang from
// @sanity/document-internationalization's metadata and has to defend against
// that document not existing; here the relationship the site already depends
// on for the comparison table does the same job.
export const COUNTRY_PAGE_QUERY = groq`
  *[_type == "countryPage" && language == $locale && slug.current == $slug][0]{
    _id,
    title,
    intro,
    route,
    minimumInvestment,
    timeToPermit,
    taxRegime,
    costAdvertisedEur,
    costExtrasEur,
    sourceNote,
    body,
    seo,
    "countryId": country._ref,
    "name": country->name,
    "code": country->code,
    "alternates": *[_type == "countryPage" && country._ref == ^.country._ref && defined(slug.current)]{
      language,
      "slug": slug.current
    }
  }
`;

// The questions that belong to one jurisdiction: the ones tagged with it, plus
// the general ones. An empty `jurisdictions` array means "applies to all five"
// — see the field's own description — so an untagged question appears on every
// jurisdiction page rather than on none.
export const COUNTRY_FAQ_QUERY = groq`
  *[_type == "faqItem" && language == $locale
    && (count(jurisdictions) == 0 || $countryId in jurisdictions[]._ref)]
    | order(order asc) {
      _id,
      question,
      answer
    }
`;

// The comparison table's own column labels, reused on the jurisdiction page's
// facts strip. Fetched rather than duplicated in the message catalogue: the
// strip shows the same four figures the table's columns show, and two places
// naming the same figure differently is how "From" and "Threshold" end up on
// one site.
export const TABLE_COLUMNS_QUERY = groq`
  *[_type == "homePage" && language == $locale][0].hero.columns
`;

export const COUNTRY_TAGS = ["countryPage", "country", "faqItem", "homePage"];

// Every published jurisdiction page across every locale, for the sitemap.
// Grouped there by `countryId`, which is what turns three documents into one
// URL with two hreflang siblings.
export const SITEMAP_COUNTRY_QUERY = groq`
  *[_type == "countryPage" && defined(slug.current)]{
    language,
    "slug": slug.current,
    _updatedAt,
    "countryId": country._ref,
    "noIndex": seo.noIndex
  }
`;
