// Structured data, as plain objects. Rendered by the page through a
// <script type="application/ld+json">.
//
// Why this file exists at all, on this site more than most: the whole
// positioning is being the source an answer engine quotes when somebody asks
// where to move and what it costs. An answer engine reads a comparison table
// as prose it has to parse and a FAQPage as an answer it can lift. The markup
// is the difference between being read and being quoted.
//
// ONE RULE GOVERNS EVERY FUNCTION HERE: the markup must describe what is
// visibly on the page, and nothing else. A FAQPage listing questions a reader
// cannot see is the exact abuse the format is policed for, and the penalty is
// losing the rich result entirely — worse than never having marked it up.

// --- The publisher -----------------------------------------------------------
// WHO SAYS SO. Until 24 Aug 2026 this file had no Organization node at all, and
// the comment on /for-partners already claimed "the organisation is described
// once sitewide rather than restated on every route" — describing something
// that did not exist. Every page was a WebPage inside a WebSite that carried a
// name and nothing else: no legal entity, no country, no contact, no publisher.
//
// For a site whose entire product is the traceability of a figure, that is the
// one gap that undoes the rest. An engine deciding whether to quote "the Greek
// threshold is €400,000" is deciding whether to attribute it to somebody, and
// there was nobody to attribute it to.
//
// ONE NODE, ONE @id, REFERENCED EVERYWHERE. `${origin}/#organization` is
// emitted in full on /about — the page a reader can actually verify it against
// — and referenced by @id from every other page. A JSON-LD graph is assembled
// across a site by identifier, so restating the whole node per route buys
// nothing and guarantees the copies drift.
//
// `sameAs` IS DERIVED FROM REAL PROFILES ONLY. It takes URLs that confirm the
// identity, and inventing plausible ones is precisely the fabrication this
// markup exists to be the opposite of. It reads CHANNELS.socials, which is
// empty until a profile actually exists — and an empty array is omitted rather
// than emitted, because `sameAs: []` asserts "there are none" where saying
// nothing asserts nothing.
import { CHANNELS } from "./contactChannels";
import { CONTROLLER } from "./controller";

/** The reference form: an @id and nothing else. Every page but /about uses
 *  this, because the full node is published once. */
export function organizationRef(origin: string) {
  return { "@id": `${origin}/#organization` };
}

/** The full node. Emitted on /about only. */
export function buildOrganizationJsonLd(origin: string) {
  return {
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: "moveandinvest",
    url: origin,
    // The sole proprietorship behind the brand. `legalName` rather than a
    // second `name`: the site is called moveandinvest and the entity is not,
    // and collapsing the two is how a search engine ends up with two
    // organisations that are the same one.
    legalName: CONTROLLER.name,
    taxID: CONTROLLER.nip,
    address: { "@type": "PostalAddress", addressCountry: CONTROLLER.country },
    email: `mailto:${CONTROLLER.email}`,
    founder: { "@type": "Person", name: CONTROLLER.name },
    // The machine-readable "you can reach us here". This is the part of the
    // contacts question that actually matters to a search engine — far more
    // than whether a page happens to be called "Contact" — and it is why the
    // node carries it rather than the page carrying it alone.
    //
    // `telephone` only appears once a number exists in CHANNELS. A ContactPoint
    // asserting a phone that nobody answers is the same failure as printing one
    // on a page, except a machine repeats it.
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: CONTROLLER.email,
        ...(CHANNELS.phone ? { telephone: CHANNELS.phone } : {}),
        availableLanguage: ["en", "ru", "pl"],
        areaServed: ["PT", "GR", "MT", "AE", "CY"],
      },
    ],
    ...(CHANNELS.socials.length > 0
      ? { sameAs: CHANNELS.socials.map((profile) => profile.url) }
      : {}),
  };
}

/** The WebSite node, with its publisher attached. Referenced by @id from the
 *  `isPartOf` of every page. */
export function buildWebSiteJsonLd(origin: string) {
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: origin,
    name: "moveandinvest",
    publisher: organizationRef(origin),
  };
}

interface BreadcrumbStep {
  name: string;
  /** Absolute URL. The last step is the current page and still needs one. */
  url: string;
}

export function buildBreadcrumbListJsonLd(trail: BreadcrumbStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: step.url,
    })),
  };
}

interface FaqEntry {
  question: string;
  answer: string;
}

/** Null when there is nothing to mark up — an empty FAQPage is invalid, and
 *  emitting one is worse than emitting none. */
export function buildFaqPageJsonLd(items: FaqEntry[]) {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

interface JurisdictionPageArgs {
  url: string;
  name: string;
  description: string;
  /** Where the figures on the page came from, verbatim from the page. */
  sourceNote?: string | null;
}

// WebPage rather than Article: nobody is credited as the author of a page
// whose substance is four figures and their sources, and claiming an Article
// would invite a byline and a publish date the page does not have.
//
// `isPartOf` ties every jurisdiction page to one WebSite node, which is what
// lets an engine understand five pages as one comparison rather than five
// unrelated documents. Since 24 Aug 2026 it is a REFERENCE by @id rather than
// an inline copy — the full WebSite node, with the publisher on it, is
// published once on /about. `publisher` is repeated here as a bare @id for the
// crawler that reads one page and never fetches another.
export function buildJurisdictionPageJsonLd({
  url,
  name,
  description,
  sourceNote,
}: JurisdictionPageArgs) {
  const origin = new URL(url).origin;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name,
    description,
    isPartOf: { "@id": `${origin}/#website` },
    publisher: organizationRef(origin),
    ...(sourceNote ? { citation: sourceNote } : {}),
  };
}

interface AboutPageArgs {
  url: string;
  name: string;
  description: string;
  locale: string;
}

// The one page that publishes the graph in full: the Organization, the WebSite
// that points at it, and the page itself. Everywhere else these are references.
//
// `@graph` rather than three sibling scripts, because that is what the format
// is for — one document describing several linked nodes — and because three
// scripts on one page is three chances for one of them to be dropped by a
// crawler that stops after the first.
//
// AboutPage rather than WebPage: the type exists, it is exactly what this is,
// and it is the type an engine looks for when asked who publishes a site.
export function buildAboutPageJsonLd({ url, name, description, locale }: AboutPageArgs) {
  const origin = new URL(url).origin;

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(origin),
      buildWebSiteJsonLd(origin),
      {
        "@type": "AboutPage",
        "@id": url,
        url,
        name,
        description,
        inLanguage: locale,
        isPartOf: { "@id": `${origin}/#website` },
        publisher: organizationRef(origin),
        // What the page is about is the publisher, which is the whole reason
        // it exists and the link an engine follows to attach a claim to an
        // entity.
        mainEntity: organizationRef(origin),
      },
    ],
  };
}
