import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MethodDocument, type MethodSectionContent } from "@/components/content";
import { getPathname } from "@/i18n/navigation";
import { CONTROLLER, controllerIdentity } from "@/lib/controller";
import { buildAboutPageJsonLd } from "@/lib/jsonLd";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { sanityFetch } from "@/sanity/client";
import { ABOUT_PAGE_QUERY, ABOUT_TAGS } from "@/sanity/queries";
import type { AboutPage } from "@/sanity/types";

// /about — one path for all three locales, like /privacy and /for-partners.
// A translated slug would be tidier in the abstract and worse in practice:
// this URL goes into an outbound email to a law firm and into the footer of
// every page, and one address that resolves everywhere beats three that each
// resolve in one language.
const ROUTE = "/about";

// The five sections, in the order they are read. Fixed here rather than in
// Sanity, and that is the whole point of the page's schema: an editor who
// could reorder or drop one could quietly turn a method page back into an
// About page — most easily by removing "what is not verified here", which is
// the one section no competitor has and the reason the rest is believed.
const SECTION_KEYS = ["method", "unverified", "money", "corrections", "notAdvice"] as const;

// The author block sits in this one, never at the top — see MethodDocument.
const AUTHOR_SECTION = "corrections";

// --- The portrait ------------------------------------------------------------
// Checked on disk at render rather than assumed. The site takes no paid stock
// imagery, so the alternative to a real photograph is NO photograph, and the
// worst outcome is a broken image frame where a face should be — which is what
// a hardcoded <Image src> produces the moment the file is not there.
//
// Server component, so this runs at build time on a statically rendered page
// and costs one stat() per render otherwise. The extension is looked up rather
// than fixed because a portrait arrives as whatever the camera produced.
const PORTRAIT_BASE = "author";
const PORTRAIT_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

function findPortrait(): string | null {
  for (const extension of PORTRAIT_EXTENSIONS) {
    const file = `${PORTRAIT_BASE}.${extension}`;
    if (existsSync(path.join(process.cwd(), "public", file))) return `/${file}`;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<AboutPage | null>(ABOUT_PAGE_QUERY, { locale }, ABOUT_TAGS);
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

// Indexable, and for a stronger reason than the policy is. This is the page
// that carries the publisher: the Organization node lives here, and every
// other page's JSON-LD points back at it. A noindex on this URL would leave
// the whole site's claims attached to an entity a crawler was told to ignore.
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, t, tSources] = await Promise.all([
    sanityFetch<AboutPage | null>(ABOUT_PAGE_QUERY, { locale }, ABOUT_TAGS),
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "sources" }),
  ]);

  // Same policy as every other route: a bare 404 looks identical whether the
  // document was never written, the dataset name is wrong, or the dev server
  // started before .env.local existed. Name the cause in the terminal.
  if (!page) {
    console.error(
      `[moveandinvest] No aboutPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write", or check those two values in .env.local.`,
    );
    notFound();
  }

  // A section whose body is empty is dropped rather than rendered as a heading
  // over nothing — the same rule the jurisdiction and property pages follow.
  const sections: MethodSectionContent[] = SECTION_KEYS.filter((key) => page[key]).map((key) => ({
    id: key,
    heading: t(`sections.${key}`),
    body: page[key],
  }));

  const portraitSrc = findPortrait();

  // The full graph — Organization, WebSite, AboutPage — and the only place on
  // the site that publishes it. Every other route references these nodes by
  // @id. See src/lib/jsonLd.ts.
  const jsonLd = buildAboutPageJsonLd({
    url: `${getSiteUrl()}${getPathname({ href: ROUTE, locale })}`,
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    locale,
  });

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from an object built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MethodDocument
        eyebrow={page.eyebrow}
        heading={page.heading}
        intro={page.intro}
        sections={sections}
        authorInSectionId={AUTHOR_SECTION}
        // Section 1 says every figure carries its law and its date. /sources
        // is where that is shown, all thirty-three checks of it.
        sectionLink={{
          inSectionId: "method",
          href: "/sources",
          label: tSources("linkFromMethod"),
        }}
        author={{
          label: page.authorLabel,
          note: page.authorNote,
          // From code, never from the CMS: a legal identity that can be
          // reworded per locale is one that will eventually be wrong in one of
          // them. Same rule the privacy policy already follows.
          name: CONTROLLER.name,
          identity: controllerIdentity(),
          portrait: portraitSrc
            ? {
                src: portraitSrc,
                // Falls back to the name rather than to empty alt text: the
                // photograph is not decorative here — it is the face of the
                // person a reader is being asked to hold responsible.
                alt: page.portraitAlt || CONTROLLER.name,
                width: 288,
                height: 288,
              }
            : null,
        }}
      />
    </main>
  );
}
