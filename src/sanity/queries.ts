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
// The name is resolved per locale HERE rather than in the component, because
// six components render it and every one of them would otherwise need the
// same three-way fallback. GROQ cannot index an object by a parameter
// (`label[$locale]` is not attribute access), hence the explicit select; the
// coalesce is what makes the English `name` the fallback for a locale whose
// label has not been filled.
export const COUNTRY_ROWS_QUERY = groq`
  *[_type == "country"] | order(order asc) {
    _id,
    "name": coalesce(
      select($locale == "ru" => label.ru, $locale == "pl" => label.pl, label.en),
      name
    ),
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

// The method page. Its own document, sharing nothing with the others, so a
// revalidation of one never invalidates the rest. `country` is deliberately
// absent: the page names Cyprus and Malta in prose, not from the registry, and
// tagging a document it does not read would make an unrelated edit rebuild it.
export const ABOUT_TAGS = ["aboutPage", "siteSettings"];

// NAMED FIELDS, unlike the policy's `sections[]`. The five blocks answer five
// questions in one order and an editor may not reorder or drop one — see
// aboutPage.ts. `portraitAlt` is optional at the schema level and so may come
// back null; the component treats a missing portrait as "no portrait" rather
// than rendering a broken image frame.
export const ABOUT_PAGE_QUERY = groq`
  *[_type == "aboutPage" && language == $locale][0]{
    eyebrow, heading, intro,
    method, unverified, money, corrections, notAdvice,
    authorLabel, authorNote, portraitAlt,
    seo
  }
`;

// The sources page. Four fields and no body: everything else on that page is
// the dataset in src/lib/sourceData.ts, which is code-owned on purpose — see
// sourcesPage.ts.
export const GOLDEN_VISA_TAGS = ["goldenVisaPage", "siteSettings"];

// The explainer's head. Four fields and no body, exactly like the sources page
// and the change log: the page's substance is read from src/lib, and a field
// here to restate it would be the second place a threshold could live.
export const GOLDEN_VISA_PAGE_QUERY = groq`
  *[_type == "goldenVisaPage" && language == $locale][0]{
    eyebrow, heading, intro, namesNote, seo
  }
`;

export const SOURCES_TAGS = ["sourcesPage", "siteSettings"];

export const SOURCES_PAGE_QUERY = groq`
  *[_type == "sourcesPage" && language == $locale][0]{
    eyebrow, heading, intro, howToRead, seo
  }
`;

// The rule-change log's head. Four fields and no body, exactly like the sources
// page above: the log itself is in src/lib/changeData.ts, code-owned, so that a
// row cannot be added without the instrument beside it.
export const CHANGES_TAGS = ["changesPage", "siteSettings"];

export const CHANGES_PAGE_QUERY = groq`
  *[_type == "changesPage" && language == $locale][0]{
    eyebrow, heading, intro, howToRead, seo
  }
`;

// The enquiry page's head. Three fields and no form labels: the form itself is
// the same component the home page renders, and it takes its labels from the
// home page document so that two editable copies of one consent checkbox cannot
// end up promising different things. The three steps under the heading are in
// messages, code-owned — see the note in the schema.
//
// `homePage` is in the tag list because this page's form is built from that
// document: without it, rewording the consent label in Studio would refresh the
// home page and leave /enquiry showing the old wording.
export const ENQUIRY_PAGE_TAGS = ["enquiryPage", "homePage", "siteSettings"];

export const ENQUIRY_PAGE_QUERY = groq`
  *[_type == "enquiryPage" && language == $locale][0]{
    eyebrow, heading, intro, seo
  }
`;

// The FAQ page. Five fields and no body, exactly like the sources page above:
// the fifty-two questions and their answers are in src/lib/faqData.ts, which is
// code-owned so that a figure cannot move without its evidence moving with it.
export const FAQ_PAGE_TAGS = ["faqPage", "siteSettings"];

export const FAQ_PAGE_QUERY = groq`
  *[_type == "faqPage" && language == $locale][0]{
    eyebrow, heading, intro, howToRead, seo
  }
`;

// --- Guides & Research -----------------------------------------------------------
// The listing head, then the entries. Two queries rather than one nested fetch:
// the head is a singleton that changes rarely and the entries change whenever
// one is published, and they carry different cache tags for exactly that
// reason.
export const BLOG_TAGS = ["blogPage", "article", "country", "siteSettings"];

export const BLOG_PAGE_QUERY = groq`
  *[_type == "blogPage" && language == $locale][0]{
    eyebrow, heading, intro, editorial, empty, seo
  }
`;

// PUBLISHED ONLY, AND DATED ONLY. `defined(publishedAt)` is not belt and
// braces: the field has an initial value, so a draft that has never been opened
// still carries one, and a document whose date somehow went missing would sort
// to an arbitrary place in a list whose entire ordering is chronological.
// `publishedAt <= now()` lets an entry be finished today and appear on Monday
// without anyone having to be at a keyboard on Monday.
export const BLOG_ENTRIES_QUERY = groq`
  *[_type == "article"
    && language == $locale
    && defined(slug.current)
    && defined(publishedAt)
    && publishedAt <= now()
  ] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    standfirst,
    category,
    sources,
    "countries": countries[]->{ _id, "code": code, "name": coalesce(name[$locale], name.en, code) }
  }
`;

// THE ALTERNATES ARE PART OF THE ENTRY, in the same projection and the same
// round trip, exactly as a jurisdiction page carries its own. They feed
// hreflang: three translations of one entry that do not declare each other
// compete with each other in the index, and the one that wins is not
// necessarily the one in the reader's language.
//
// Published siblings only, and `_id != ^._id` is deliberately NOT applied — the
// entry itself belongs in its own alternates list, because a self-referencing
// hreflang is part of a valid set rather than a redundancy.
//
// `defined(translationKey)` GUARDS BOTH SIDES and it is not decoration. GROQ
// compares two nulls as equal, so without it an entry carrying no key would
// match every OTHER entry carrying no key — and an entry published before the
// field existed would advertise unrelated articles as its own translations. The
// clause makes that case return nothing, which is the correct answer.
export const BLOG_ENTRY_QUERY = groq`
  *[_type == "article" && language == $locale && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    _updatedAt,
    standfirst,
    category,
    sources,
    body,
    "countries": countries[]->{ _id, "code": code, "name": coalesce(name[$locale], name.en, code) },
    "alternates": *[
      _type == "article"
      && defined(translationKey)
      && translationKey == ^.translationKey
      && defined(slug.current)
      && defined(publishedAt)
      && publishedAt <= now()
    ]{ language, "slug": slug.current },
    seo
  }
`;

// Every language version of every entry, for the sitemap and for hreflang. Same
// shape as the jurisdiction query below it: the alternates are assembled by
// grouping on a value the documents share rather than by assuming a shared
// slug, which is the mistake this file's own comment warns about further down.
//
// THE GROUPING VALUE IS A FIELD, NOT A JOIN, and it is the second version of
// this query. The first resolved the translation-metadata document the
// internationalization plugin writes:
//
//   "translationId": *[_type == "translation.metadata" && references(^._id)][0]._id
//
// Correct against a dataset read with a token, and empty against the one the
// site actually reads: that document is not visible without one, while
// `article` is. So the switcher offered three dead words and the sitemap
// emitted three URLs with no hreflang joining them — both of them silently,
// because a join that returns null is indistinguishable from an entry that
// genuinely has no translations. Grouping on `translationKey` needs no second
// document and no second read. See the field's note in schemaTypes/documents/
// article.ts.
export const BLOG_SITEMAP_QUERY = groq`
  *[_type == "article"
    && defined(slug.current)
    && defined(publishedAt)
    && publishedAt <= now()
  ]{
    _id,
    _updatedAt,
    language,
    "slug": slug.current,
    translationKey,
    // Selected for the SITEMAP, which must not list a page that tells crawlers
    // not to index it — the same filter the country and property queries above
    // carry, and which this one was missing. The language switcher reads the
    // same query and ignores this field on purpose: noIndex is an instruction
    // to a search engine, not a reason to hide a published page from a reader
    // who is standing on its sibling.
    "noIndex": seo.noIndex
  }
`;

// The contact page. The CHANNELS are not in here and never will be — they live
// in src/lib/contactChannels.ts so that one definition feeds the page, the
// ContactPoint in the JSON-LD and the footer at once. See contactsPage.ts.
export const CONTACTS_TAGS = ["contactsPage", "siteSettings"];

export const CONTACTS_PAGE_QUERY = groq`
  *[_type == "contactsPage" && language == $locale][0]{
    eyebrow, heading, intro,
    channelsLabel, emailLabel, emailNote, phoneLabel, phoneNote,
    whatsappLabel, whatsappNote, bookingLabel, bookingNote, bookingCta, socialsLabel,
    formHeading, formBody, nameLabel, emailFieldLabel, emailPlaceholder,
    messageLabel, honeypotLabel, submitLabel, fine, privacyLabel,
    sent{ title, body }, error{ title, body }, broke{ title, body },
    enquiryLead, enquiryCta, identityLabel,
    seo
  }
`;

// JUST THE QUESTION FORM'S OWN STRINGS, for a page that renders the form and
// nothing else from /contacts — /faq, since 31 August 2026. Narrow rather than
// reusing CONTACTS_PAGE_QUERY: /faq has no use for a booking link, a WhatsApp
// note or an identity line, and fetching them would make this page's cache
// entry turn over every time one of them is reworded.
//
// The fields come from contactsPage, which is where they live and stay. Copying
// them into faqPage would give one form two editable copies of every label.
export const QUESTION_FORM_TAGS = ["contactsPage", "siteSettings"];

export const QUESTION_FORM_QUERY = groq`
  *[_type == "contactsPage" && language == $locale][0]{
    nameLabel, emailFieldLabel, emailPlaceholder, messageLabel,
    honeypotLabel, submitLabel, fine, privacyLabel,
    sent{ title, body }, error{ title, body }, broke{ title, body }
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
    "name": coalesce(
      select(
        $locale == "ru" => country->label.ru,
        $locale == "pl" => country->label.pl,
        country->label.en
      ),
      country->name
    ),
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

// --- Property pages ----------------------------------------------------------
//
// The buying half of each jurisdiction, at its own top-level URL. Everything
// below mirrors the jurisdiction-page queries deliberately — same alternates
// trick through the shared `country` reference, same localized label, same
// sitemap shape — because the two page types are siblings and the day they
// stop resolving hreflang the same way is the day one of them breaks quietly.

export const PROPERTY_SLUGS_QUERY = groq`
  *[_type == "propertyPage" && language == $locale && defined(slug.current)]{
    "slug": slug.current
  }
`;

export const PROPERTY_PAGE_QUERY = groq`
  *[_type == "propertyPage" && language == $locale && slug.current == $slug][0]{
    _id,
    title,
    intro,
    sourceNote,
    whoMayBuy,
    transactionCosts,
    steps,
    annualCosts,
    shortLet,
    residencyLink,
    seo,
    "countryId": country._ref,
    "name": coalesce(
      select(
        $locale == "ru" => country->label.ru,
        $locale == "pl" => country->label.pl,
        country->label.en
      ),
      country->name
    ),
    "code": country->code,
    "alternates": *[_type == "propertyPage" && country._ref == ^.country._ref && defined(slug.current)]{
      language,
      "slug": slug.current
    },
    // The jurisdiction page for the same country and language, so the two
    // halves link to each other. Null until that page exists in this language,
    // and the link is simply not rendered then — a cross-link to a 404 is
    // worse than no cross-link.
    "jurisdiction": *[_type == "countryPage" && country._ref == ^.country._ref && language == $locale && defined(slug.current)][0]{
      title,
      "slug": slug.current
    }
  }
`;

// The mirror of the field above, read by the jurisdiction page so it can point
// at its own buying page.
export const PROPERTY_LINK_QUERY = groq`
  *[_type == "propertyPage" && language == $locale && defined(slug.current)
    && country._ref == $countryId][0]{
    title,
    "slug": slug.current
  }
`;

export const SITEMAP_PROPERTY_QUERY = groq`
  *[_type == "propertyPage" && defined(slug.current)]{
    language,
    "slug": slug.current,
    _updatedAt,
    "countryId": country._ref,
    "noIndex": seo.noIndex
  }
`;

export const PROPERTY_TAGS = ["propertyPage", "country"];
