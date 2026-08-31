import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { EnquiryForm } from "@/components/marketing";
import { SectionHead } from "@/components/ui";
import { enquiryFormProps } from "@/lib/enquiryForm";
import { organizationRef } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  COUNTRY_ROWS_QUERY,
  ENQUIRY_PAGE_QUERY,
  ENQUIRY_PAGE_TAGS,
  HOME_PAGE_QUERY,
  HOME_TAGS,
} from "@/sanity/queries";
import type {
  CountryRowResult,
  EnquiryPage,
  HomePageResult,
} from "@/sanity/types";

import styles from "./page.module.scss";

// /enquiry — where every call to action on the site now goes.
//
// WHAT IT REPLACED. The header button, the footer link and every jurisdiction
// page's call to action pointed at "/#enquiry": section 08 of the home page.
// From a guide, from /sources, from /faq, from a jurisdiction page — that is a
// full page load onto a document the reader did not ask for, landing eight
// sections down it with the form's own head already scrolled past. It also
// could not be counted separately from the home page, could not carry a title,
// and had no room to answer the question a reader actually has at that moment,
// which is not "what shall I type" but "what happens if I do".
//
// SO THE PAGE IS THREE STEPS AND A FORM, in that order. The steps are the
// content; the form is the thing the steps make it reasonable to fill in.
//
// THE FORM IS THE SAME COMPONENT THE HOME PAGE RENDERS, from the same document,
// through one shared prop builder — see lib/enquiryForm.ts. The home page keeps
// its section: a reader who has just come through eight sections is the highest
// intent on the site and sending them somewhere else first would be paying for
// tidiness in leads. What tells the two apart is a single `from` field, which
// the route handler resolves to a redirect target out of routing.ts.
//
// THE STEPS ARE NOT IN SANITY, and that is deliberate rather than lazy. They are
// promises about what this business does with an enquiry — who reads it, who it
// goes to, who pays — and a promise editable in Studio is one that can be
// reworded without anybody changing the thing it describes. They live in
// messages/{en,ru,pl}.json, in the commit that changes them.
const ROUTE = "/enquiry";

const STEPS = ["one", "two", "three"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<EnquiryPage | null>(
    ENQUIRY_PAGE_QUERY,
    { locale },
    ENQUIRY_PAGE_TAGS,
  );
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

export default async function Enquiry({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, home, countries, t] = await Promise.all([
    sanityFetch<EnquiryPage | null>(
      ENQUIRY_PAGE_QUERY,
      { locale },
      ENQUIRY_PAGE_TAGS,
    ),
    // The form's own labels. From the home page document rather than this one,
    // so that the consent sentence exists in exactly one editable place — see
    // the note in lib/enquiryForm.ts.
    sanityFetch<HomePageResult | null>(HOME_PAGE_QUERY, { locale }, HOME_TAGS),
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "enquiry" }),
  ]);

  if (!page || !home) {
    console.error(
      `[moveandinvest] /enquiry cannot render for locale "${locale}": ` +
        `${!page ? "no enquiryPage document" : ""}` +
        `${!page && !home ? " and " : ""}` +
        `${!home ? "no homePage document (the form's labels live there)" : ""}` +
        ` in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write".`,
    );
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    // ContactPage rather than WebPage. It is the one schema.org type that says
    // what this page is for, and an answer engine asked "how do I contact them"
    // has no other way to tell this page from the other eleven.
    "@type": "ContactPage",
    "@id": routeUrl(ROUTE, locale),
    url: routeUrl(ROUTE, locale),
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    publisher: organizationRef(getSiteUrl()),
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
          <SectionHead
            level={1}
            eyebrow={page.eyebrow}
            heading={page.heading}
            intro={page.intro}
          />

          {/* THE THREE STEPS, and they are the reason this is a page rather
              than an anchor. A reader hesitating over a form is not hesitating
              about the fields; they are wondering who reads it, whether it
              becomes spam, and what it costs. Answered above the form, where
              the hesitation is, rather than in fine print below it. */}
          <h2 className={styles.stepsHeading}>{t("stepsHeading")}</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step} className={styles.step}>
                <p className={styles.stepIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className={styles.stepTitle}>{t(`steps.${step}.title`)}</h3>
                <p className={styles.stepBody}>{t(`steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>

          {/* The two pages that back the second step up. A claim to work from
              published figures is worth exactly as much as the link to them. */}
          <p className={styles.links}>
            <Link href="/sources">{t("sourcesLink")}</Link>
            <Link href="/changes">{t("changesLink")}</Link>
          </p>
        </div>
      </section>

      <EnquiryForm
        {...enquiryFormProps({
          enquiry: home.enquiry,
          countries,
          locale,
          from: "enquiry",
        })}
      />
    </main>
  );
}
