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
// unrelated documents.
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
    isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, url: origin, name: "moveandinvest" },
    ...(sourceNote ? { citation: sourceNote } : {}),
  };
}
