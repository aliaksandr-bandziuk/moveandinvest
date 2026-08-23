import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/content";
import { buildMetadata } from "@/lib/metadata";
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

  return (
    <main>
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
