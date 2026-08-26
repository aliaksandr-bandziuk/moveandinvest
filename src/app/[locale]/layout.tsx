import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  AnalyticsLoader,
  CookieBanner,
  Footer,
  Header,
  ScrollDivider,
  type FooterJurisdiction,
} from "@/components/layout";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { getSiteUrl, isProductionDeployment } from "@/lib/site";
import { getSlugMap } from "@/lib/slugMap";
import { sanityFetch } from "@/sanity/client";
import { imageDimensions, urlFor } from "@/sanity/image";
import {
  COUNTRY_ROWS_QUERY,
  HOME_TAGS,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import type { CountryRowResult, SiteSettingsResult } from "@/sanity/types";
import "./globals.scss";

// Every locale is known at build time, so all three trees are statically
// generated. setRequestLocale below is what keeps them static — without it
// next-intl reads the locale from request headers and the whole segment
// opts into dynamic rendering, which would defeat the SEO/AEO rule in
// CLAUDE.md.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  robots: {
    index: isProductionDeployment(),
    follow: isProductionDeployment(),
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // The same two queries the home page runs, so Next's fetch cache serves the
  // second caller rather than hitting Sanity twice. The footer lists the five
  // jurisdictions from the registry rather than from a hand-written list —
  // one place decides which jurisdictions exist, and the footer inherits it.
  const [settings, countries, slugMap] = await Promise.all([
    sanityFetch<SiteSettingsResult | null>(
      SITE_SETTINGS_QUERY,
      { locale },
      HOME_TAGS,
    ),
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    // Language-neutral on purpose: it maps every localised slug onto its
    // siblings, so it is the same object whichever locale is rendering. One
    // fetch in the layout rather than one per page — see src/lib/slugMap.ts
    // for the 404s that existed before it.
    getSlugMap(),
  ]);

  // Optional by design: with no photograph uploaded the divider is not
  // rendered at all, rather than rendering an empty band. Same rule as every
  // other block on this site — a missing input hides the element, it never
  // produces a placeholder.
  const dividerAsset = settings?.dividerImage;
  const dividerSize = dividerAsset ? imageDimensions(dividerAsset) : null;
  const dividerSrc =
    dividerAsset && dividerSize
      ? urlFor(dividerAsset).width(2400).quality(72).auto("format").url()
      : null;

  const jurisdictions: FooterJurisdiction[] = countries.map((country) => ({
    id: country._id,
    name: country.name,
    href: country.page ? `/${country.page.slug}` : undefined,
  }));

  return (
    // suppressHydrationWarning on these two elements only, and deliberately.
    //
    // The mismatch React reports here is `cz-shortcut-listen="true"` on
    // <body> — an attribute a browser extension (ColorZilla, and several
    // password managers do the same thing on <html>) writes into the DOM
    // before React hydrates. Nothing in this repo can stop it: the server
    // never emitted the attribute, the client did not either, and the visitor
    // owns the extension. The warning is real but it is not ours, and left in
    // place it buries the mismatches that ARE ours in the same console.
    //
    // The flag is one level deep: it silences a mismatch in THIS element's own
    // attributes and text, and nothing below it. Header, Footer and every
    // section still report hydration errors normally. Do not move it onto a
    // component to make a warning go away — that is how a real bug goes quiet.
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Messages here are UI chrome only — nav labels, button text, form
            validation. Page content always comes from Sanity (CLAUDE.md),
            never from the message catalogues. */}
        <NextIntlClientProvider>
          <Header
            locale={locale}
            slugMap={slugMap}
            jurisdictions={jurisdictions}
          />
          {children}
          {/* Between the last section and the footer on every page. The
              reveal is pure CSS — see ScrollDivider for how, and for the one
              ancestor property that would silently break it. */}
          {dividerSrc && dividerSize ? (
            <ScrollDivider
              src={dividerSrc}
              alt={dividerAsset?.alt ?? ""}
              width={dividerSize.width}
              height={dividerSize.height}
            />
          ) : null}

          {/* Footer copy comes from siteSettings once that document exists;
              until then it falls back to the message catalogue. */}
          <Footer
            disclaimer={settings?.disclaimer}
            contactEmail={settings?.contactEmail}
            jurisdictions={jurisdictions}
          />

          {/* Both mounted once, here, and nowhere else. AnalyticsLoader
              renders nothing — it is the wiring between the banner's stored
              choice and the two vendor loaders, and neither loader creates a
              script tag until that choice is yes. The banner renders nothing
              during SSR either; see its own comment. */}
          <AnalyticsLoader />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
