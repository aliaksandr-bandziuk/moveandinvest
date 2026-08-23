import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import {
  CountryCost,
  CountryFacts,
  CountryHero,
  EnquiryCtaLink,
  type Fact,
} from "@/components/country";
import type { Crumb } from "@/components/ui";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildJurisdictionPageJsonLd,
} from "@/lib/jsonLd";
import { getSiteUrl } from "@/lib/site";
import { resolveRobots } from "@/lib/site";
import { sanityFetch, sanityFetchPublished } from "@/sanity/client";
import {
  COUNTRY_FAQ_QUERY,
  COUNTRY_PAGE_QUERY,
  COUNTRY_SLUGS_QUERY,
  COUNTRY_TAGS,
  TABLE_COLUMNS_QUERY,
} from "@/sanity/queries";
import type {
  CountryFaqResult,
  CountryPageResult,
  TableColumnsResult,
} from "@/sanity/types";

import styles from "./page.module.scss";

// One jurisdiction. Ported in shape from the sibling `giuseppeiannone`
// project's [slug] route — static params from published slugs per locale,
// breadcrumbs rendered twice (visibly and as JSON-LD), a facts strip under the
// hero, an FAQ scoped to this entity — and deliberately simpler in two places.
//
// It resolves ONE document type, so there is no slug-collision arbitration and
// no second round trip to check a second type.
//
// And hreflang comes from the shared `country` reference rather than from a
// translation-metadata document. All three language versions point at the same
// registry entry, which is the relationship the comparison table already
// depends on; the sibling has to defend against its metadata document not
// existing, and here there is nothing that can be missing.
//
// WHAT THIS PAGE DOES NOT DO YET: it renders no prose unless `body` is filled
// in Sanity. That is the whole of the first version and it was chosen over
// writing 1,200 words per jurisdiction per locale, because every figure on
// this site is now sourced and dated, and twelve unsourced essays would undo
// exactly that. The section appears the day the field is filled — no code
// change.

async function getPage(locale: string, slug: string) {
  return sanityFetch<CountryPageResult | null>(
    COUNTRY_PAGE_QUERY,
    { locale, slug },
    [...COUNTRY_TAGS, `countryPage:${slug}`],
  );
}

// Builds the per-locale URLs for this jurisdiction from its own alternates.
// The slug differs in every language — portugal / portugaliya / portugalia —
// so this cannot be `getPathname` over routing.locales the way a fixed route
// can. A language with no published page is simply absent, which is correct:
// hreflang pointing at a 404 is worse than an incomplete set.
function localizedPaths(page: CountryPageResult): Record<string, string> {
  const paths: Record<string, string> = {};

  for (const alternate of page.alternates) {
    if (!alternate.language || !alternate.slug) continue;
    if (!routing.locales.includes(alternate.language as never)) continue;
    paths[alternate.language] = getPathname({
      href: `/${alternate.slug}`,
      locale: alternate.language,
    });
  }

  return paths;
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const pages = await sanityFetchPublished<{ slug: string }[]>(
    COUNTRY_SLUGS_QUERY,
    { locale: params.locale },
    ["countryPage"],
  );

  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(locale, slug);
  if (!page) return {};

  const siteUrl = getSiteUrl();
  const paths = localizedPaths(page);
  const canonical = paths[locale] ?? getPathname({ href: `/${slug}`, locale });

  const languages = Object.fromEntries(
    Object.entries(paths).map(([language, path]) => [language, `${siteUrl}${path}`]),
  );
  const defaultPath = paths[routing.defaultLocale];

  return {
    title: page.seo.metaTitle,
    description: page.seo.metaDescription,
    robots: resolveRobots(page.seo.noIndex),
    alternates: {
      canonical: `${siteUrl}${canonical}`,
      languages: {
        ...languages,
        // Only when the default locale actually has a page. buildMetadata can
        // always emit one because its routes exist in code; here the English
        // version is a document that may not have been written.
        ...(defaultPath ? { "x-default": `${siteUrl}${defaultPath}` } : {}),
      },
    },
    openGraph: {
      title: page.seo.metaTitle,
      description: page.seo.metaDescription,
      url: `${siteUrl}${canonical}`,
      siteName: "moveandinvest",
      locale,
      type: "article",
    },
  };
}

export default async function JurisdictionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getPage(locale, slug);
  if (!page) notFound();

  // The FAQ needs the country id, which only the page document knows, so these
  // two cannot be parallelised with it — but they can with each other.
  const [faq, columns, t] = await Promise.all([
    sanityFetch<CountryFaqResult[]>(
      COUNTRY_FAQ_QUERY,
      { locale, countryId: page.countryId },
      COUNTRY_TAGS,
    ),
    sanityFetch<TableColumnsResult | null>(TABLE_COLUMNS_QUERY, { locale }, ["homePage"]),
    getTranslations("country"),
  ]);

  const siteUrl = getSiteUrl();
  const paths = localizedPaths(page);
  const path = paths[locale] ?? getPathname({ href: `/${slug}`, locale });

  const trail: Crumb[] = [
    { name: t("home"), href: "/" },
    { name: page.name },
  ];

  // The same trail, absolute, for the markup. One array, two shapes: the
  // visible nav needs locale-aware relative hrefs, the markup needs full URLs,
  // and writing the list twice is how the two stop matching.
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: t("home"), url: `${siteUrl}${getPathname({ href: "/", locale })}` },
    { name: page.name, url: `${siteUrl}${path}` },
  ]);

  const faqJsonLd = buildFaqPageJsonLd(faq);

  const pageJsonLd = buildJurisdictionPageJsonLd({
    url: `${siteUrl}${path}`,
    name: page.title,
    description: page.seo.metaDescription,
    sourceNote: page.sourceNote,
  });

  const facts: Fact[] = [
    { label: columns?.minimumInvestment ?? "", value: page.minimumInvestment ?? "" },
    { label: columns?.timeToPermit ?? "", value: page.timeToPermit ?? "" },
    { label: columns?.taxRegime ?? "", value: page.taxRegime ?? "" },
  ].filter((fact) => fact.label !== "");

  const hasCost =
    typeof page.costAdvertisedEur === "number" && typeof page.costExtrasEur === "number";

  return (
    <main>
      {/* Three separate scripts rather than one @graph. Each describes a
          different thing, and a malformed one invalidates only itself. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <CountryHero
        trail={trail}
        breadcrumbLabel={t("breadcrumbLabel")}
        route={page.route}
        title={page.title}
        intro={page.intro}
      />

      <CountryFacts facts={facts} />

      {hasCost ? (
        <CountryCost
          eyebrow={t("costEyebrow")}
          heading={t("costHeading", { name: page.name })}
          intro={t("costIntro")}
          advertised={page.costAdvertisedEur as number}
          extras={page.costExtrasEur as number}
          labels={{
            advertised: t("costAdvertised"),
            extras: t("costExtras"),
            real: t("costReal"),
          }}
          noteLabel={t("costNoteLabel")}
          note={page.sourceNote ?? ""}
          locale={locale}
        />
      ) : null}

      {/* Rendered only when written. A heading over an empty column is the
          placeholder this site does not do. */}
      {page.body ? (
        <section className={styles.body}>
          <div className="container">
            <div className={styles.prose}>
              <PortableText value={page.body as never} />
            </div>
          </div>
        </section>
      ) : null}

      {faq.length > 0 ? (
        <section className={styles.faq} id="faq">
          <div className="container">
            <h2 className={styles.faqHeading}>{t("faqHeading", { name: page.name })}</h2>
            <dl className={styles.faqList}>
              {faq.map((item) => (
                <div key={item._id} className={styles.faqItem}>
                  <dt className={styles.question}>{item.question}</dt>
                  <dd className={styles.answer}>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* The page ends by asking, because that is what it is for. It links to
          the home page's enquiry form rather than repeating it here: one form,
          one handler, one honeypot, one rate limit — a second copy is a second
          thing to keep in step with the route that receives it.
          The country IS preselected: the link writes this jurisdiction into
          the same sessionStorage the route finder writes to, and the form's
          prefill already ticks the matching radio from it. Nothing new
          crosses the wire — no query parameter, no change to the handler,
          and with JavaScript off the link still navigates, just without the
          country ticked. */}
      <section className={styles.cta}>
        <div className={`container ${styles.ctaInner}`}>
          <div>
            <h2 className={styles.ctaHeading}>{t("ctaHeading", { name: page.name })}</h2>
            <p className={styles.ctaBody}>{t("ctaBody")}</p>
          </div>
          <EnquiryCtaLink code={page.code} className={styles.ctaButton}>
            {t("ctaLabel")}
          </EnquiryCtaLink>
        </div>
      </section>
    </main>
  );
}
