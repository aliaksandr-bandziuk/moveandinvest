import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/content";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import { PRIVACY_PAGE_QUERY, PRIVACY_TAGS } from "@/sanity/queries";
import type { PrivacyPage } from "@/sanity/types";

// /privacy — one path for all three locales, like /for-partners. A translated
// slug would be tidier in the abstract and worse in practice: this URL is
// pasted into a consent line, a cookie banner one day, and an email to a
// regulator, and one address that resolves everywhere beats three that each
// resolve in one language.
const ROUTE = "/privacy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<PrivacyPage | null>(
    PRIVACY_PAGE_QUERY,
    { locale },
    PRIVACY_TAGS,
  );

  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

// The policy is indexable, deliberately. It is sometimes argued that a legal
// page should be noindex to keep it out of results; the opposite is true for
// a site whose whole position is that it publishes what it does. A person
// deciding whether to hand over their email should be able to find this page
// before they reach the form, not only after.
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await sanityFetch<PrivacyPage | null>(
    PRIVACY_PAGE_QUERY,
    { locale },
    PRIVACY_TAGS,
  );

  // Same policy as the other routes: a bare 404 looks identical whether the
  // document was never seeded, the dataset name is wrong, or the dev server
  // started before .env.local existed. Name the cause in the terminal.
  if (!page) {
    console.error(
      `[moveandinvest] No privacyPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write", or check those two values in .env.local.`,
    );
    notFound();
  }

  // The only three URLs on the site that carried no structured data at all,
  // found on 25 Aug 2026 by reading all forty-two live pages rather than the
  // code. Not a decision that a policy needs no markup — an omission: every
  // other route emits at least a WebPage, and these three were written before
  // the Organization node existed and never revisited.
  //
  // It buys no rich result and is not meant to. What it buys is that the page
  // stating who processes the data is attached, by @id, to the node naming who
  // that is — which for a policy is the one connection worth asserting.
  const url = routeUrl(ROUTE, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
    // NO `dateModified`, and that is deliberate. The obvious thing to put
    // there is `page.updated` — but that field holds "24 August 2026",
    // "24 августа 2026", "24 sierpnia 2026": a sentence for a reader, in three
    // languages. schema.org wants ISO 8601, so two of the three would be
    // unparseable and all three would be a date asserted in a format that
    // invites a consumer to guess. The alternative — an ISO date written a
    // second time, next to the display one — is the two-copies-of-one-fact
    // shape that has already bitten this project three times. So the date
    // stays where a human reads it and nowhere else, until the schema carries
    // one machine-readable value that the display string is derived FROM.
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LegalDocument
        eyebrow={page.eyebrow}
        heading={page.heading}
        intro={page.intro}
        updatedLabel={page.updatedLabel}
        updated={page.updated}
        sections={page.sections}
      />
    </main>
  );
}
