import { createClient } from "@sanity/client";
import { FAQ_ITEMS } from "./copy/faq";
import { COUNTRY_PAGES, SOURCE_NOTE } from "./copy/jurisdictions";
import { HOME_COPY } from "./copy/home";
import { CONTACT_EMAIL, PARTNERS_COPY } from "./copy/partners";

// One-shot seed. Run with a TEMPORARY write token:
//
//   npm run seed
//
// Create the token with Editor permission in the Sanity dashboard right
// before running, and delete it immediately after. Do not leave a
// write-capable credential sitting in .env.local.
//
// Idempotent: every document has a deterministic _id and is written with
// createOrReplace, so running it twice produces the same dataset rather
// than duplicates. It will overwrite Studio edits to these documents —
// run it once, then stop using it.
//
// PUBLISH POLICY, deliberate: the three singletons are created PUBLISHED
// (they carry no factual claims — headlines and positioning copy), while
// every jurisdiction page is created as a DRAFT. Those carry investment
// thresholds, permit timelines and tax regimes, and CLAUDE.md's rule is
// that an unsourced number on a page a lawyer may forward to a client is a
// liability. They stay invisible on the site until you have checked each
// figure against a primary source and pressed publish yourself.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary Editor token, run this once, then delete it.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token,
});

type Locale = "en" | "ru" | "pl";
const LOCALES: Locale[] = ["en", "ru", "pl"];

// --- Jurisdictions (language-neutral registry) -------------------------------

const COUNTRIES = [
  { id: "country-pt", name: "Portugal", code: "pt", accentColor: "#2e6f5e", status: "live", order: 10 },
  { id: "country-gr", name: "Greece", code: "gr", accentColor: "#2b5c8a", status: "live", order: 20 },
  { id: "country-mt", name: "Malta", code: "mt", accentColor: "#8c3f5d", status: "live", order: 30 },
  { id: "country-ae", name: "United Arab Emirates", code: "ae", accentColor: "#6b5b2e", status: "live", order: 40 },
  // Deferred on purpose while the parallel Cyprus project still earns —
  // shown in the table as a dimmed row rather than silently omitted.
  { id: "country-cy", name: "Cyprus", code: "cy", accentColor: "#a8641e", status: "planned", order: 50 },
] as const;

// --- Jurisdiction pages ------------------------------------------------------
// The figures themselves live in copy/jurisdictions.ts, shared with facts.ts.


// --- Singleton copy ----------------------------------------------------------

const SITE_SETTINGS: Record<Locale, Record<string, string>> = {
  en: {
    tagline: "Relocation and property across five jurisdictions, compared on the same terms.",
    disclaimer:
      "moveandinvest publishes independent comparisons of residency, tax and property rules. It is not a law firm and does not provide legal, tax or investment advice.",
    metaTitle: "moveandinvest — relocation and property, compared",
    metaDescription:
      "Residency routes, tax regimes and property rules in Portugal, Greece, Malta, the UAE and Cyprus — compared side by side and sourced.",
  },
  ru: {
    tagline: "Релокация и недвижимость в пяти юрисдикциях, сравнённые по одним критериям.",
    disclaimer:
      "moveandinvest публикует независимые сравнения правил резидентства, налогов и покупки недвижимости. Проект не является юридической фирмой и не оказывает юридических, налоговых или инвестиционных консультаций.",
    metaTitle: "moveandinvest — релокация и недвижимость в сравнении",
    metaDescription:
      "Маршруты ВНЖ, налоговые режимы и правила покупки недвижимости в Португалии, Греции, на Мальте, в ОАЭ и на Кипре — рядом и со ссылками на источники.",
  },
  pl: {
    tagline: "Relokacja i nieruchomości w pięciu jurysdykcjach, porównane według tych samych kryteriów.",
    disclaimer:
      "moveandinvest publikuje niezależne porównania zasad rezydencji, podatków i nabywania nieruchomości. Nie jest kancelarią prawną i nie świadczy porad prawnych, podatkowych ani inwestycyjnych.",
    metaTitle: "moveandinvest — relokacja i nieruchomości w porównaniu",
    metaDescription:
      "Ścieżki rezydencji, reżimy podatkowe i zasady nabywania nieruchomości w Portugalii, Grecji, na Malcie, w ZEA i na Cyprze — obok siebie i ze źródłami.",
  },
};


// --- Document builders -------------------------------------------------------

// The three callers no longer share one copy shape, so this takes the two
// fields it actually reads. They are optional in the parameter because two of
// the callers are `Record<string, string>` maps, where noUncheckedIndexedAccess
// makes every read `string | undefined` — and then checked, because a seo
// object with an undefined title is a document that seeds successfully and
// renders a blank <title>. Failing here names the locale instead.
function seoFor(
  copy: { metaTitle?: string; metaDescription?: string },
  label: string,
) {
  const { metaTitle, metaDescription } = copy;

  if (!metaTitle || !metaDescription) {
    throw new Error(`Missing metaTitle or metaDescription in copy for ${label}`);
  }

  return {
    _type: "seo",
    metaTitle,
    metaDescription,
    noIndex: false,
  };
}

const documents: Record<string, unknown>[] = [];

for (const country of COUNTRIES) {
  documents.push({
    _id: country.id,
    _type: "country",
    name: country.name,
    code: country.code,
    accentColor: country.accentColor,
    status: country.status,
    order: country.order,
  });
}

for (const locale of LOCALES) {
  const settings = SITE_SETTINGS[locale];
  const home = HOME_COPY[locale];
  const partners = PARTNERS_COPY[locale];

  documents.push({
    _id: `siteSettings-${locale}`,
    _type: "siteSettings",
    language: locale,
    siteName: "moveandinvest",
    tagline: settings.tagline,
    contactEmail: CONTACT_EMAIL,
    disclaimer: settings.disclaimer,
    defaultSeo: seoFor(settings, `siteSettings-${locale}`),
  });

  // One object per rendered section, in page order — the shape the schema
  // stores and the query projects. See scripts/copy/home.ts.
  documents.push({
    _id: `homePage-${locale}`,
    _type: "homePage",
    language: locale,
    hero: home.hero,
    method: {
      ...home.method,
      points: home.method.points.map((point, i) => ({ _key: `m${i + 1}`, ...point })),
    },
    map: home.map,
    cost: home.cost,
    routeFinder: home.routeFinder,
    faq: home.faq,
    partnerTeaser: home.partnerTeaser,
    enquiry: home.enquiry,
    seo: seoFor(home.seo, `homePage-${locale}`),
  });

  documents.push({
    _id: `partnersPage-${locale}`,
    _type: "partnersPage",
    language: locale,
    hero: {
      ...partners.hero,
      principles: partners.hero.principles.map((principle, i) => ({
        _key: `p${i + 1}`,
        ...principle,
      })),
      contactEmail: CONTACT_EMAIL,
    },
    anatomy: {
      ...partners.anatomy,
      fields: partners.anatomy.fields.map((field, i) => ({ _key: `f${i + 1}`, ...field })),
    },
    journey: {
      ...partners.journey,
      steps: partners.journey.steps.map((step, i) => ({ _key: `s${i + 1}`, ...step })),
    },
    honesty: {
      ...partners.honesty,
      notItems: partners.honesty.notItems.map((item, i) => ({ _key: `n${i + 1}`, ...item })),
      yesItems: partners.honesty.yesItems.map((item, i) => ({ _key: `y${i + 1}`, ...item })),
    },
    contact: partners.contact,
    seo: seoFor(partners.seo, `partnersPage-${locale}`),
  });
}

// Jurisdiction pages: created as DRAFTS. See the publish policy at the top.
for (const page of COUNTRY_PAGES) {
  for (const locale of LOCALES) {
    const code = page.country.replace("country-", "");
    documents.push({
      _id: `drafts.countryPage-${code}-${locale}`,
      _type: "countryPage",
      language: locale,
      country: { _type: "reference", _ref: page.country },
      title: page.title[locale],
      slug: { _type: "slug", current: page.slug[locale] },
      intro: page.intro[locale],
      route: page.route[locale],
      minimumInvestment: page.minimumInvestment,
      timeToPermit: page.timeToPermit[locale],
      taxRegime: page.taxRegime[locale],
      sourceNote: SOURCE_NOTE[locale],
      seo: {
        _type: "seo",
        metaTitle: page.title[locale].slice(0, 60),
        metaDescription: page.intro[locale].slice(0, 155),
        noIndex: false,
      },
    });
  }
}


// --- FAQ ---------------------------------------------------------------------
// Created as DRAFTS, same policy as the jurisdiction pages and for the same
// reason: several of these answers contain years and thresholds, and an
// unchecked number in the block an answer engine quotes is worse than no
// block. Promote with `npm run publish -- --type faqItem --all`.
//
// `countries` is the list of jurisdiction ids a question is specific to.
// Empty means it applies to all five — the common case, and the reason the
// filter chips only appear for jurisdictions that have a question of their
// own.

for (const [i, item] of FAQ_ITEMS.entries()) {
  for (const locale of LOCALES) {
    documents.push({
      _id: `drafts.faqItem-${item.key}-${locale}`,
      _type: "faqItem",
      language: locale,
      question: item.q[locale],
      answer: item.a[locale],
      order: (i + 1) * 10,
      jurisdictions: item.countries.map((id) => ({
        _key: id,
        _type: "reference",
        _ref: id,
      })),
    });
  }
}

// Translation metadata: what links a document to its counterparts inside
// Studio's own language switcher. Without these each document still has a
// correct `language` field and the site renders fine — the plugin's
// "Translations" panel would just show nothing to jump to.
function translationMetadata(typeId: string, idFor: (locale: Locale) => string) {
  return {
    _id: `translation.metadata.${typeId}`,
    _type: "translation.metadata",
    schemaTypes: [typeId],
    translations: LOCALES.map((locale) => ({
      _key: locale,
      _type: "internationalizedArrayReferenceValue",
      value: { _type: "reference", _ref: idFor(locale) },
    })),
  };
}

for (const typeId of ["siteSettings", "homePage", "partnersPage"]) {
  documents.push(translationMetadata(typeId, (locale) => `${typeId}-${locale}`));
}

// --- Write -------------------------------------------------------------------

async function run() {
  // Re-running this after `npm run publish` must not resurrect a draft next to
  // the published document it came from — that is how an editor ends up with
  // two versions of the same page and no idea which one the site renders. Any
  // jurisdiction page that already exists as published is skipped; its content
  // is yours now, not the seed's.
  const publishedIds = await client.fetch<string[]>(
    `*[_type in ["countryPage", "faqItem"]]._id`,
  );
  const published = new Set(publishedIds);

  const toWrite = documents.filter((doc) => {
    const id = String(doc._id);
    if (!id.startsWith("drafts.")) return true;
    return !published.has(id.replace(/^drafts\./, ""));
  });

  const skipped = documents.length - toWrite.length;

  const transaction = client.transaction();

  for (const doc of toWrite) {
    transaction.createOrReplace(doc as { _id: string; _type: string });
  }

  await transaction.commit();

  const written = toWrite.filter((d) => !String(d._id).startsWith("drafts."));
  const drafts = toWrite.length - written.length;

  console.log(`Seeded ${toWrite.length} documents.`);
  if (skipped > 0) {
    console.log(`  skipped ${skipped} already-published jurisdiction page(s)`);
  }
  console.log(`  published: ${written.length}`);
  console.log(`  drafts (jurisdiction pages, awaiting your fact-check): ${drafts}`);
  console.log("");
  console.log("Now delete the write token you created for this run.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
