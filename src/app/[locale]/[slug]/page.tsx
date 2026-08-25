import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PortableText } from "next-sanity";
import { AlertsSignup, type AlertsSignupLabels } from "@/components/marketing";
import {
  CountryCost,
  CountryFacts,
  CountryHero,
  EnquiryCtaLink,
  type Fact,
} from "@/components/country";
import {
  PropertyArticle,
  PropertyBrief,
  type PropertyBriefLabels,
  type PropertySection,
} from "@/components/property";
import type { Crumb } from "@/components/ui";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildJurisdictionPageJsonLd,
} from "@/lib/jsonLd";
import { CONTROLLER } from "@/lib/controller";
import { ogImage } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { resolveRobots } from "@/lib/site";
import { sanityFetch, sanityFetchPublished } from "@/sanity/client";
import {
  COUNTRY_FAQ_QUERY,
  COUNTRY_PAGE_QUERY,
  COUNTRY_ROWS_QUERY,
  COUNTRY_SLUGS_QUERY,
  COUNTRY_TAGS,
  PROPERTY_LINK_QUERY,
  PROPERTY_PAGE_QUERY,
  PROPERTY_SLUGS_QUERY,
  PROPERTY_TAGS,
  TABLE_COLUMNS_QUERY,
} from "@/sanity/queries";
import type {
  CountryFaqResult,
  CountryPageResult,
  CountryRowResult,
  PropertyLinkResult,
  PropertyPageResult,
  TableColumnsResult,
} from "@/sanity/types";

import styles from "./page.module.scss";

// The top-level slug route, and it now resolves TWO document types: a
// jurisdiction page (`countryPage`, "where do I move and what does it cost")
// and a property page (`propertyPage`, "I have chosen, what do I need to know
// before I sign"). Ported in shape from the sibling `giuseppeiannone`
// project's [slug] route — static params from published slugs per locale,
// breadcrumbs rendered twice (visibly and as JSON-LD), a facts strip under the
// hero, an FAQ scoped to this entity.
//
// WHY BOTH LIVE HERE RATHER THAN UNDER /property/…: the Russian reader's query
// is "недвижимость в Греции", and a URL that answers it should say so —
// /nedvizhimost-v-gretsii, not /property/greece, whose first segment is a word
// no reader typed. The cost is the arbitration below.
//
// ARBITRATION: both types are queried in parallel and the jurisdiction page
// wins a collision. Two slugs can only collide by editorial mistake — they are
// written in different files by the same hand — and if it ever happens, the
// older and more linked-to page is the one that must not move. The loser is
// logged rather than silently dropped, because a page that vanishes with no
// trace is the kind of bug that survives for months.
//
// And hreflang comes from the shared `country` reference rather than from a
// translation-metadata document. All three language versions point at the same
// registry entry, which is the relationship the comparison table already
// depends on; the sibling has to defend against its metadata document not
// existing, and here there is nothing that can be missing.
//
// Both types render prose only where a field is filled. A heading over an
// empty column is the placeholder this site does not do, so a jurisdiction
// whose Polish text has not been written yet simply has no prose section, and
// a property page whose section 5 is unverified has no section 5.

// Assembled once and used by both branches. It is a function rather than a
// component prop-drill because the two branches build it from different
// translators at different points, and the alternative was reading fifteen
// message keys twice.
// The signature takes VALUES as well as a key, because one of the fifteen
// messages carries a {email} placeholder. Narrowing it back to (key) => string
// is what would silently reintroduce a hard-typed address.
function buildAlertsLabels(
  t: (key: string, values?: Record<string, string>) => string,
): AlertsSignupLabels {
  return {
    heading: t("heading"),
    body: t("body"),
    emailLabel: t("emailLabel"),
    emailPlaceholder: t("emailPlaceholder"),
    jurisdictionsLegend: t("jurisdictionsLegend"),
    jurisdictionsHint: t("jurisdictionsHint"),
    consentLabel: t("consentLabel"),
    honeypotLabel: t("honeypotLabel"),
    submitLabel: t("submitLabel"),
    fine: t("fine"),
    privacyLabel: t("privacyLabel"),
    sent: { title: t("sent.title"), body: t("sent.body") },
    error: { title: t("error.title"), body: t("error.body") },
    // The address is a PLACEHOLDER, filled here from the one definition the
    // project has. It used to be typed into all three catalogues as hello@,
    // which no mailbox ever answered — see the note in src/lib/controller.ts.
    // Filled on the SERVER and complete by the time it reaches the client, so
    // this stays an ordinary t() call rather than the t.raw() template case.
    broke: {
      title: t("broke.title"),
      body: t("broke.body", { email: CONTROLLER.email }),
    },
  };
}

async function getPage(locale: string, slug: string) {
  return sanityFetch<CountryPageResult | null>(
    COUNTRY_PAGE_QUERY,
    { locale, slug },
    [...COUNTRY_TAGS, `countryPage:${slug}`],
  );
}

async function getPropertyPage(locale: string, slug: string) {
  return sanityFetch<PropertyPageResult | null>(
    PROPERTY_PAGE_QUERY,
    { locale, slug },
    [...PROPERTY_TAGS, `propertyPage:${slug}`],
  );
}

type Resolved =
  | { kind: "jurisdiction"; page: CountryPageResult }
  | { kind: "property"; page: PropertyPageResult };

// Both types, one round trip's worth of latency. Not sequential: a sequential
// lookup would make every property page pay for a miss on the jurisdiction
// query first, and property pages are half the routes here.
async function resolveSlug(locale: string, slug: string): Promise<Resolved | null> {
  const [jurisdiction, property] = await Promise.all([
    getPage(locale, slug),
    getPropertyPage(locale, slug),
  ]);

  if (jurisdiction && property) {
    console.error(
      `[slug] Slug collision on /${locale}/${slug}: countryPage ${jurisdiction._id} and propertyPage ${property._id}. Serving the jurisdiction page; fix the slug in Studio.`,
    );
  }

  if (jurisdiction) return { kind: "jurisdiction", page: jurisdiction };
  if (property) return { kind: "property", page: property };
  return null;
}

// The per-locale URLs for one entity, built from its own alternates. The slug
// differs in every language — portugal / portugaliya / portugalia — so this
// cannot be `getPathname` over routing.locales the way a fixed route can. A
// language with no published page is simply absent, which is correct: hreflang
// pointing at a 404 is worse than an incomplete set.
//
// It takes the alternates array rather than the document, so both page types
// share it. They must: two copies of an hreflang builder is two places for the
// x-default rule to drift, and the drift would be invisible until Search
// Console reported it weeks later.
function localizedPaths(
  alternates: { language?: string; slug?: string }[],
): Record<string, string> {
  const paths: Record<string, string> = {};

  for (const alternate of alternates) {
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
  const [countries, properties] = await Promise.all([
    sanityFetchPublished<{ slug: string }[]>(
      COUNTRY_SLUGS_QUERY,
      { locale: params.locale },
      ["countryPage"],
    ),
    sanityFetchPublished<{ slug: string }[]>(
      PROPERTY_SLUGS_QUERY,
      { locale: params.locale },
      ["propertyPage"],
    ),
  ]);

  // Deduplicated, because a collision would otherwise ask Next to prerender
  // the same route twice.
  const slugs = new Set([...countries, ...properties].map((page) => page.slug));

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = await resolveSlug(locale, slug);
  if (!resolved) return {};

  const { page } = resolved;
  const siteUrl = getSiteUrl();
  // The two types build their alternates from the same relationship — the
  // shared `country` reference — but from their own sibling documents, so a
  // property page never advertises a jurisdiction page as its Polish version.
  const paths = localizedPaths(page.alternates);
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
      images: [ogImage(locale)],
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo.metaTitle,
      description: page.seo.metaDescription,
      images: [ogImage(locale).url],
    },
  };
}

// The property branch of the route.
//
// It is a function rather than a second file because the two page types share
// a URL space, and a reader of this route has to be able to see both outcomes
// of the arbitration without opening another file.
async function renderProperty({
  locale,
  slug,
  page,
}: {
  locale: string;
  slug: string;
  page: PropertyPageResult;
}) {
  const [t, tCountry, tBrief, tAlerts, rows] = await Promise.all([
    getTranslations("property"),
    getTranslations("country"),
    getTranslations("brief"),
    getTranslations("alerts"),
    // The five jurisdictions with their localized labels, from the registry —
    // the same source the footer and the table use, so a sixth country appears
    // in the change list the day it appears anywhere else.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, COUNTRY_TAGS),
  ]);

  const siteUrl = getSiteUrl();
  const paths = localizedPaths(page.alternates);
  const path = paths[locale] ?? getPathname({ href: `/${slug}`, locale });

  // The six, in the order the schema fixes. Filtered, not padded: a section
  // whose field is empty does not exist on the page.
  const sections: PropertySection[] = (
    [
      { id: "who-may-buy", heading: t("whoMayBuy"), body: page.whoMayBuy },
      { id: "costs", heading: t("transactionCosts"), body: page.transactionCosts },
      { id: "steps", heading: t("steps"), body: page.steps },
      { id: "annual", heading: t("annualCosts"), body: page.annualCosts },
      { id: "short-let", heading: t("shortLet"), body: page.shortLet },
      { id: "residency", heading: t("residencyLink"), body: page.residencyLink },
    ] satisfies PropertySection[]
  ).filter((section) => Boolean(section.body));

  // Three crumbs, not two, and the middle one is a real parent: the
  // jurisdiction page for the same country. That is the actual hierarchy —
  // "Greece" is the subject, "buying property" is one of two things this site
  // says about it — and it gives a reader who arrived from a search for
  // "property in Greece" a one-click route to the residency and tax figures.
  // The middle crumb loses its link, not its place, when that page has not
  // been written in this language.
  const trail: Crumb[] = [
    { name: tCountry("home"), href: "/" },
    page.jurisdiction
      ? { name: page.name, href: `/${page.jurisdiction.slug}` }
      : { name: page.name },
    { name: t("eyebrow") },
  ];

  const breadcrumbJsonLd = buildBreadcrumbListJsonLd([
    { name: tCountry("home"), url: `${siteUrl}${getPathname({ href: "/", locale })}` },
    ...(page.jurisdiction
      ? [
          {
            name: page.name,
            url: `${siteUrl}${getPathname({ href: `/${page.jurisdiction.slug}`, locale })}`,
          },
        ]
      : []),
    { name: page.title, url: `${siteUrl}${path}` },
  ]);

  const pageJsonLd = buildJurisdictionPageJsonLd({
    url: `${siteUrl}${path}`,
    name: page.title,
    description: page.seo.metaDescription,
    sourceNote: page.sourceNote,
  });

  // Assembled here rather than read inside the component, because the brief is
  // a server component with no translator of its own and a props object keeps
  // the whole label set visible in one place — including the three result
  // panels, which are the easiest thing on a form to leave untranslated.
  const briefLabels: PropertyBriefLabels = {
    eyebrow: tBrief("eyebrow"),
    heading: tBrief("heading"),
    intro: tBrief("intro"),
    budgetLegend: tBrief("budgetLegend"),
    budget: {
      upTo500: tBrief("budget.upTo500"),
      upTo800: tBrief("budget.upTo800"),
      over800: tBrief("budget.over800"),
      unknown: tBrief("budget.unknown"),
    },
    purposeLegend: tBrief("purposeLegend"),
    purpose: {
      live: tBrief("purpose.live"),
      let: tBrief("purpose.let"),
      residency: tBrief("purpose.residency"),
      unsure: tBrief("purpose.unsure"),
    },
    cityLabel: tBrief("cityLabel"),
    cityHint: tBrief("cityHint"),
    notesLabel: tBrief("notesLabel"),
    nameLabel: tBrief("nameLabel"),
    emailLabel: tBrief("emailLabel"),
    consentLabel: tBrief("consentLabel"),
    honeypotLabel: tBrief("honeypotLabel"),
    submitLabel: tBrief("submitLabel"),
    fine: tBrief("fine"),
    privacyLabel: tBrief("privacyLabel"),
    sent: { title: tBrief("sent.title"), body: tBrief("sent.body") },
    error: { title: tBrief("error.title"), body: tBrief("error.body") },
    broke: {
      title: tBrief("broke.title"),
      body: tBrief("broke.body", { email: CONTROLLER.email }),
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PropertyArticle
        trail={trail}
        breadcrumbLabel={tCountry("breadcrumbLabel")}
        eyebrow={t("eyebrow")}
        title={page.title}
        intro={page.intro}
        sections={sections}
        contentsLabel={t("contentsLabel")}
        sourceLabel={t("sourceLabel")}
        sourceNote={page.sourceNote ?? ""}
        jurisdiction={
          page.jurisdiction
            ? {
                label: t("jurisdictionLinkLabel"),
                title: page.jurisdiction.title,
                slug: page.jurisdiction.slug,
              }
            : null
        }
      />

      <PropertyBrief
        labels={briefLabels}
        locale={locale}
        code={page.code}
        slug={slug}
        privacyHref={getPathname({ href: "/privacy", locale })}
      />

      {/* After the brief, not before it. This is the exit for a reader who
          did not take the larger ask, and putting it first would make the
          larger ask the alternative. */}
      <AlertsSignup
        labels={buildAlertsLabels(tAlerts)}
        locale={locale}
        slug={slug}
        jurisdictions={rows.map((row) => ({ code: row.code, name: row.name }))}
        code={page.code}
        privacyHref={getPathname({ href: "/privacy", locale })}
        instance={`p-${page.code}`}
      />
    </main>
  );
}

export default async function JurisdictionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const resolved = await resolveSlug(locale, slug);
  if (!resolved) notFound();

  if (resolved.kind === "property") {
    return renderProperty({ locale, slug, page: resolved.page });
  }

  const page = resolved.page;

  // The FAQ needs the country id, which only the page document knows, so these
  // two cannot be parallelised with it — but they can with each other.
  const [faq, columns, propertyLink, t, tProperty, tAlerts, tSources, rows] = await Promise.all([
    sanityFetch<CountryFaqResult[]>(
      COUNTRY_FAQ_QUERY,
      { locale, countryId: page.countryId },
      COUNTRY_TAGS,
    ),
    sanityFetch<TableColumnsResult | null>(TABLE_COLUMNS_QUERY, { locale }, ["homePage"]),
    // The buying half, if it has been written in this language. Null is the
    // normal state for a jurisdiction whose property page does not exist yet,
    // and the link is simply absent then.
    sanityFetch<PropertyLinkResult | null>(
      PROPERTY_LINK_QUERY,
      { locale, countryId: page.countryId },
      PROPERTY_TAGS,
    ),
    getTranslations("country"),
    getTranslations("property"),
    getTranslations("alerts"),
    getTranslations("sources"),
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, COUNTRY_TAGS),
  ]);

  const siteUrl = getSiteUrl();
  const paths = localizedPaths(page.alternates);
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
          // Deep-linked to this jurisdiction's own block, not to the top of
          // /sources: a reader who wants the working for Greece should not
          // land on Portugal's.
          workingLink={
            page.code ? { href: `/sources#${page.code}`, label: tSources("linkFromPage") } : null
          }
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

            {/* The buying half. Placed at the end of the prose rather than in
                the hero: a reader who has just finished the "after the first
                permit" section is the one for whom this is the next question,
                and a reader who has not read anything yet is not. */}
            {propertyLink ? (
              <p className={styles.crossLink}>
                <Link href={`/${propertyLink.slug}`}>
                  {tProperty("propertyLinkLabel")} — {propertyLink.title}
                </Link>
              </p>
            ) : null}
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

      {/* The quieter alternative to the CTA above it: a reader who is not
          ready to be introduced to anybody can still leave an address. */}
      <AlertsSignup
        labels={buildAlertsLabels(tAlerts)}
        locale={locale}
        slug={slug}
        jurisdictions={rows.map((row) => ({ code: row.code, name: row.name }))}
        code={page.code}
        privacyHref={getPathname({ href: "/privacy", locale })}
        instance={`j-${page.code}`}
      />
    </main>
  );
}
