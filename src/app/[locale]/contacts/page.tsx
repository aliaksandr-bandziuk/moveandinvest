import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ContactChannels, type ContactLabels } from "@/components/marketing";
import { SectionHead } from "@/components/ui";
import { getPathname } from "@/i18n/navigation";
import { CHANNELS } from "@/lib/contactChannels";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import { CONTACTS_PAGE_QUERY, CONTACTS_TAGS } from "@/sanity/queries";
import type { ContactsPage } from "@/sanity/types";

import styles from "./page.module.scss";

// /contacts — one path for all three locales, like /about, /sources and
// /privacy.
//
// WHY IT EXISTS, stated honestly because the usual reason is wrong. Not because
// Google requires a page called "Contact": it does not, and what the rater
// guidance actually asks — that ownership and contactability be clear — was
// already satisfied by /about and by the ContactPoint in the Organization node.
// It exists because a law firm receiving a cold email checks whether the thing
// is real, and a form is not that check. A number that is answered is.
const ROUTE = "/contacts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<ContactsPage | null>(CONTACTS_PAGE_QUERY, { locale }, CONTACTS_TAGS);
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

export default async function Contacts({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await sanityFetch<ContactsPage | null>(CONTACTS_PAGE_QUERY, { locale }, CONTACTS_TAGS);

  if (!page) {
    console.error(
      `[moveandinvest] No contactsPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write", or check those two values in .env.local.`,
    );
    notFound();
  }

  // The one address the project has, substituted into the failure panel. Same
  // arrangement as the brief and the change list: the catalogue carries a
  // placeholder, never a typed address, so a second one cannot appear.
  const labels: ContactLabels = {
    ...page,
    broke: {
      title: page.broke.title,
      body: page.broke.body.replace("{email}", CHANNELS.email),
    },
  };

  const url = routeUrl(ROUTE, locale);

  // ContactPage, which is the type for exactly this, with the organisation as
  // its subject. The Organization node itself is published once on /about and
  // referenced here by @id — see src/lib/jsonLd.ts.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": url,
    url,
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
    mainEntity: organizationRef(getSiteUrl()),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={styles.section}>
        <div className="container">
          <SectionHead level={1} eyebrow={page.eyebrow} heading={page.heading} intro={page.intro} />

          <ContactChannels
            labels={labels}
            locale={locale}
            privacyHref={getPathname({ href: "/privacy", locale })}
          />
        </div>
      </section>
    </main>
  );
}
