import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  type ContactOption,
  EnquiryAnatomy,
  PartnerContact,
  PartnersHero,
  PartnersHonesty,
  PartnersJourney,
} from "@/components/partners";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  COUNTRY_ROWS_QUERY,
  PARTNERS_PAGE_QUERY,
  PARTNERS_TAGS,
} from "@/sanity/queries";
import type { CountryRowResult, PartnersPageResult } from "@/sanity/types";

// The four values the shared route handler accepts, paired with the order the
// labels are stored in. Values live in code because the server validates
// against them; labels live in Sanity because they are words on a page.
const ORG_VALUES = ["law-firm", "relocation", "developer", "estate-agent"];

const ROUTE = "/for-partners";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<PartnersPageResult | null>(
    PARTNERS_PAGE_QUERY,
    { locale },
    PARTNERS_TAGS,
  );

  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

// /for-partners. Section 01 only for now — the rest of the page is being
// written as copy first and designed after, which is the reverse of how the
// home page was built and the better order for a page whose whole job is to
// say something precise.
//
// Shipping it at one section is deliberate rather than lazy: three links on
// the live site already point here (the header on every page, section 07 of
// the home page, and the footer), and every one of them was returning a 404.
// A short honest page beats three dead links.
export default async function ForPartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // UI chrome only — section eyebrows. Everything with a claim in it comes
  // from Sanity, per CLAUDE.md.
  const t = await getTranslations("partners");

  // The registry decides which jurisdictions exist, here as everywhere else,
  // so the chips in section 05 can never disagree with the table on the home
  // page.
  const [page, countries] = await Promise.all([
    sanityFetch<PartnersPageResult | null>(PARTNERS_PAGE_QUERY, { locale }, PARTNERS_TAGS),
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, PARTNERS_TAGS),
  ]);

  // Same policy as the home page: a missing document is a content gap, and a
  // bare 404 in the browser looks identical whether the dataset was never
  // seeded, the dataset name is wrong, or the dev server started before
  // .env.local existed. So name the cause in the terminal.
  if (!page) {
    console.error(
      `[moveandinvest] No partnersPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run seed", or check those two values in .env.local and restart the dev server.`,
    );
    notFound();
  }

  // Built with the same helper buildMetadata uses for the canonical, so the
  // URL in the structured data and the URL in <link rel="canonical"> cannot
  // drift — including the default locale, which carries no prefix.
  const url = routeUrl(ROUTE, locale);

  // Section 02 lives entirely in Sanity, and the fields it needs were added
  // after the first seed ran. A published document from before that has none
  // of them — so the section is skipped rather than rendered as a heading
  // with nothing under it. Same rule as the scroll divider and the
  // comparison table: a missing input hides the element, it never produces a
  // placeholder. The warning is what turns "the section vanished" into a
  // one-line diagnosis in dev.
  // Each section is skipped rather than half-rendered when its content is
  // missing — the same rule as the scroll divider and the comparison table.
  // The warning is what turns "the section vanished" into a one-line
  // diagnosis in dev.
  const anatomy = page.anatomy;
  const hasAnatomy = Boolean(anatomy?.heading) && (anatomy?.fields?.length ?? 0) > 0;

  const journey = page.journey;
  const hasJourney = Boolean(journey?.heading) && (journey?.steps?.length ?? 0) > 0;

  const contact = page.contact;
  const hasContact =
    Boolean(contact?.heading) && (contact?.questions?.length ?? 0) > 0;

  const honesty = page.honesty;
  const hasHonesty =
    Boolean(honesty?.heading) &&
    (honesty?.notItems?.length ?? 0) > 0 &&
    (honesty?.yesItems?.length ?? 0) > 0;

  if (process.env.NODE_ENV !== "production") {
    const missing = [
      hasAnatomy ? null : "02 (anatomy)",
      hasJourney ? null : "03 (journey)",
      hasHonesty ? null : "04 (honesty)",
      hasContact ? null : "05 (contact)",
    ].filter(Boolean);

    if (missing.length > 0) {
      console.warn(
        `[moveandinvest] partnersPage-${locale} is missing content for section(s) ${missing.join(", ")}, ` +
          `so they are not rendered. Run "npm run content -- --write", or fill them in the Studio.`,
      );
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    url,
    inLanguage: locale,
    // The comment below this object used to say the organisation is described
    // once sitewide. It was not described anywhere until 24 Aug 2026; now it
    // is, on /about, and these are references to it by @id.
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
  };

  return (
    <main>
      <PartnersHero
        eyebrow={page.hero.eyebrow}
        heading={page.hero.heading}
        intro={page.hero.intro}
        ctaLabel={page.hero.ctaLabel}
        // A mailto, not an anchor to a form that does not exist yet — the
        // CLAUDE.md rule about links to nowhere applies to fragments too.
        // This becomes "#partner-enquiry" the day that section lands.
        ctaHref={`mailto:${page.hero.contactEmail}`}
        contactEmail={page.hero.contactEmail}
        principles={page.hero.principles ?? []}
      />

      {hasAnatomy && anatomy ? (
        <EnquiryAnatomy
          index="02"
          eyebrow={anatomy.eyebrow}
          heading={anatomy.heading}
          intro={anatomy.intro}
          sampleLabel={anatomy.sampleLabel}
          sampleTag={anatomy.sampleTag}
          fields={anatomy.fields}
          note={anatomy.note}
        />
      ) : null}

      {hasJourney && journey ? (
        <PartnersJourney
          index="03"
          eyebrow={journey.eyebrow}
          heading={journey.heading}
          intro={journey.intro}
          steps={journey.steps}
          note={journey.note}
          stepLabel={t("stepLabel")}
        />
      ) : null}

      {hasHonesty && honesty ? (
        <PartnersHonesty
          index="04"
          eyebrow={honesty.eyebrow}
          heading={honesty.heading}
          intro={honesty.intro}
          notLabel={honesty.notLabel}
          notItems={honesty.notItems}
          yesLabel={honesty.yesLabel}
          yesItems={honesty.yesItems}
        />
      ) : null}

      {hasContact && contact ? (
        <PartnerContact
          index="05"
          eyebrow={contact.eyebrow}
          heading={contact.heading}
          intro={contact.intro}
          questions={contact.questions}
          locale={locale}
          jurisdictionLabel={contact.jurisdictionLabel}
          jurisdictions={[
            ...countries.map((country) => ({
              value: country.code,
              label: country.name,
            })),
            { value: "several", label: contact.severalLabel },
          ]}
          orgLabel={contact.orgLabel}
          organisations={ORG_VALUES.map((value, i): ContactOption => ({
            value,
            // The schema pins this list at four, so the index always resolves;
            // the fallback exists because noUncheckedIndexedAccess is right to
            // insist that an array index can be undefined.
            label: contact.orgOptions[i] ?? value,
          }))}
          nameLabel={contact.nameLabel}
          emailLabel={contact.emailLabel}
          termsLabel={contact.termsLabel}
          honeypotLabel={contact.honeypotLabel}
          submitLabel={contact.submitLabel}
          fine={contact.fine}
          sentTitle={contact.sentTitle}
          sentBody={contact.sentBody}
          failedTitle={contact.failedTitle}
          failedBody={contact.failedBody}
          brokeTitle={contact.brokeTitle}
          brokeBody={contact.brokeBody}
        />
      ) : null}

      {/* WebPage, not Organization: this describes the document. The
          organisation itself is published once, on /about, and referenced
          from here by @id. No FAQPage here — nothing on this page is a question
          and answer pair, and marking up prose as one is how a rich result
          turns into a manual action. */}
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
