import { createClient } from "@sanity/client";
import { HOME_COPY, LOCALES } from "./copy/home";
import { CONTACT_EMAIL, PARTNERS_COPY } from "./copy/partners";
import { PRIVACY_COPY } from "./copy/privacy";
import { ABOUT_COPY } from "./copy/about";
import { SOURCES_PAGE_COPY } from "./copy/sourcesPage";
import { FAQ_PAGE_COPY } from "./copy/faqPage";
import { BLOG_PAGE_COPY } from "./copy/blogPage";
import { CONTACTS_COPY } from "./copy/contacts";

// Writes the page copy from scripts/copy/ onto the homePage and partnersPage
// documents that are ALREADY published, one patch per locale.
//
//   npm run content            # show what would change, write nothing
//   npm run content -- --write # apply it
//
// This is the migration that moved every visitor-facing string out of
// messages/<locale>.json and into the CMS. Before it, five of the eight home
// page sections had no Sanity fields at all and fixing a typo needed a
// deploy. Run it once per dataset; after that the Studio is where copy is
// edited and this script is only useful for rebuilding a dataset from
// scratch.
//
// Why not `npm run seed`: seed uses createOrReplace on the singletons, so it
// would discard anything edited in the Studio since the last run. This sets
// named fields and leaves everything else — including hand edits to fields it
// does not touch — alone. Dry run is the default for the same reason.
//
// The old flat fields (heading, comparisonHeading, methodPoints, anatomy*, …)
// are UNSET in the same patch. Leaving them behind would mean two copies of
// the same paragraph in one document, and the next person to edit would have
// no way to tell which one the page reads.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary Editor token, run this, then delete it.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token,
  // The singletons are published, but a draft copy exists alongside them the
  // moment anyone opens the document in the Studio. `raw` sees both.
  perspective: "raw",
});

// Every array member in Sanity needs a stable _key, or the Studio cannot
// reorder the list and React cannot tell two rows apart.
function keyed<T extends object>(items: T[], prefix: string) {
  return items.map((item, i) => ({ _key: `${prefix}${i + 1}`, ...item }));
}

// Field names the old schema used. Unset in the same transaction that writes
// the new ones — see the note at the top.
const RETIRED_HOME = [
  "eyebrow",
  "heading",
  "intro",
  "primaryCta",
  "secondaryCta",
  "comparisonHeading",
  "comparisonIntro",
  "methodHeading",
  "methodIntro",
  "methodPoints",
  "partnerTeaserHeading",
  "partnerTeaserBody",
];

const RETIRED_PARTNERS = [
  "eyebrow",
  "heading",
  "intro",
  "principles",
  "anatomyHeading",
  "anatomyIntro",
  "anatomySampleLabel",
  "anatomySampleTag",
  "anatomyFields",
  "anatomyNote",
  "qualificationHeading",
  "qualificationSteps",
  "terms",
  "contactEmail",
  "ctaLabel",
];

interface Doc {
  _id: string;
  _type: string;
}

async function run() {
  const write = process.argv.slice(2).includes("--write");

  const docs = await client.fetch<Doc[]>(
    `*[_type in ["siteSettings", "homePage", "partnersPage", "privacyPage", "aboutPage", "sourcesPage", "contactsPage", "faqPage", "blogPage"]] | order(_id asc){ _id, _type }`,
  );

  if (docs.length === 0) {
    console.error("No page documents found. Run `npm run seed` first.");
    process.exit(1);
  }

  // The privacy policy arrived after the first seed ran, so unlike the other
  // two singletons its documents may not exist yet. createOrReplace rather
  // than patch: there is nothing to patch on a dataset seeded before this
  // page existed, and the policy has no editor-authored state worth
  // preserving — every word of it is generated from scripts/copy/privacy.ts
  // on purpose, because a legal text edited in two places is a legal text
  // that disagrees with itself.
  const existingPrivacy = new Set(
    docs
      .filter((d) => d._type === "privacyPage")
      .map((d) => d._id.replace(/^drafts\./, "")),
  );

  // Same story one page later: /about was added on 24 Aug 2026, long after the
  // seed, and for the same reason its three documents are generated whole
  // rather than patched. The method page has no editor-authored state worth
  // preserving either — a page that describes how figures are verified must
  // agree with the file that verifies them, and two editable copies of that
  // description is how it stops agreeing.
  const existingAbout = new Set(
    docs
      .filter((d) => d._type === "aboutPage")
      .map((d) => d._id.replace(/^drafts\./, "")),
  );

  // Same arrangement as /about and the policy: added after the seed, so its
  // documents may not exist and createOrReplace is safe — every field is
  // generated, there is no editor state to lose.
  const existingSources = new Set(
    docs
      .filter((d) => d._type === "sourcesPage")
      .map((d) => d._id.replace(/^drafts\./, "")),
  );

  // Same arrangement as /about, /sources and the policy: added after the seed,
  // so its three documents may not exist and createOrReplace is safe. Every
  // field on it is generated — the questions themselves are not in Sanity at
  // all, they are in src/lib/faqData.ts.
  // /blog arrived on 26 August 2026, after every other singleton, so its three
  // documents never exist on a dataset seeded before that — same story as the
  // privacy policy and /about before it. Created whole rather than patched.
  const existingBlogPage = new Set(
    docs
      .filter((d) => d._type === "blogPage")
      .map((d) => d._id.replace(/^drafts\./, "")),
  );

  const existingFaqPage = new Set(
    docs
      .filter((d) => d._type === "faqPage")
      .map((d) => d._id.replace(/^drafts\./, "")),
  );

  const existingContacts = new Set(
    docs
      .filter((d) => d._type === "contactsPage")
      .map((d) => d._id.replace(/^drafts\./, "")),
  );

  const transaction = client.transaction();
  let planned = 0;
  const skipped: string[] = [];

  for (const doc of docs) {
    // `homePage-ru` and `drafts.homePage-ru` both end in the locale, so the
    // suffix survives the drafts prefix.
    const locale = doc._id
      .replace(/^drafts\./, "")
      .split("-")
      .pop();
    const isLocale = LOCALES.includes(locale as never);

    if (!isLocale) {
      skipped.push(doc._id);
      continue;
    }

    // THE FOOTER'S EMAIL, on every page of the site. It lives on siteSettings
    // and nothing had ever patched it: seed.ts creates the document and
    // create-if-not-exists does nothing on a dataset that already has one, so
    // the address seeded on day one survived every later correction.
    //
    // Which is how `partners@moveandinvest.com` was still in the live footer
    // of all forty-two pages on 25 Aug 2026 — a mailbox that does not exist,
    // three separate times after the decision that there is one mailbox and it
    // is office@. It was fixed in the copy files, fixed on the partners page,
    // written into a comment in contactChannels.ts as the cautionary tale, and
    // left untouched in the one place a reader is most likely to click it.
    //
    // ONLY THIS FIELD. The tagline, the disclaimer and the default SEO on this
    // document are editable in the Studio and a patch that reset them would
    // silently undo an editor's work. The address is not editable in that
    // sense: it is the controller's, it comes from controller.ts, and there is
    // exactly one.
    if (doc._type === "siteSettings") {
      transaction.patch(doc._id, { set: { contactEmail: CONTACT_EMAIL } });
      console.log(
        `  ${doc._id.padEnd(26)} ${doc._type.padStart(13)}  ->  contactEmail = ${CONTACT_EMAIL}`,
      );
      planned += 1;
      continue;
    }

    if (doc._type === "contactsPage") {
      const copy = CONTACTS_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          channelsLabel: copy.channelsLabel,
          emailLabel: copy.emailLabel,
          emailNote: copy.emailNote,
          phoneLabel: copy.phoneLabel,
          phoneNote: copy.phoneNote,
          whatsappLabel: copy.whatsappLabel,
          whatsappNote: copy.whatsappNote,
          bookingLabel: copy.bookingLabel,
          bookingNote: copy.bookingNote,
          bookingCta: copy.bookingCta,
          socialsLabel: copy.socialsLabel,
          formHeading: copy.formHeading,
          formBody: copy.formBody,
          nameLabel: copy.nameLabel,
          emailFieldLabel: copy.emailFieldLabel,
          emailPlaceholder: copy.emailPlaceholder,
          messageLabel: copy.messageLabel,
          honeypotLabel: copy.honeypotLabel,
          submitLabel: copy.submitLabel,
          fine: copy.fine,
          privacyLabel: copy.privacyLabel,
          sent: copy.sent,
          error: copy.error,
          broke: copy.broke,
          enquiryLead: copy.enquiryLead,
          enquiryCta: copy.enquiryCta,
          identityLabel: copy.identityLabel,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} contact`);
      continue;
    }

    if (doc._type === "sourcesPage") {
      const copy = SOURCES_PAGE_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          howToRead: copy.howToRead,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} sources / working`);
      continue;
    }

    if (doc._type === "blogPage") {
      const copy = BLOG_PAGE_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          editorial: copy.editorial,
          empty: copy.empty,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} guides & research`);
      continue;
    }

    if (doc._type === "faqPage") {
      const copy = FAQ_PAGE_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          howToRead: copy.howToRead,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} faq page head`);
      continue;
    }

    if (doc._type === "aboutPage") {
      const copy = ABOUT_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          method: copy.method,
          unverified: copy.unverified,
          money: copy.money,
          corrections: copy.corrections,
          notAdvice: copy.notAdvice,
          authorLabel: copy.authorLabel,
          authorNote: copy.authorNote,
          portraitAlt: copy.portraitAlt,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} about / method`);
      continue;
    }

    if (doc._type === "privacyPage") {
      const copy = PRIVACY_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          eyebrow: copy.eyebrow,
          heading: copy.heading,
          intro: copy.intro,
          updatedLabel: copy.updatedLabel,
          updated: copy.updated,
          sections: keyed(copy.sections, "p"),
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
      });
      planned += 1;
      console.log(`  ${doc._id.padEnd(28)} privacy policy`);
      continue;
    }

    if (doc._type === "homePage") {
      const copy = HOME_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          hero: copy.hero,
          method: { ...copy.method, points: keyed(copy.method.points, "m") },
          map: copy.map,
          cost: copy.cost,
          routeFinder: copy.routeFinder,
          faq: copy.faq,
          partnerTeaser: copy.partnerTeaser,
          enquiry: copy.enquiry,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
        unset: RETIRED_HOME,
      });
    } else {
      const copy = PARTNERS_COPY[locale as (typeof LOCALES)[number]];
      transaction.patch(doc._id, {
        set: {
          hero: {
            ...copy.hero,
            principles: keyed(copy.hero.principles, "p"),
            contactEmail: CONTACT_EMAIL,
          },
          anatomy: { ...copy.anatomy, fields: keyed(copy.anatomy.fields, "f") },
          journey: { ...copy.journey, steps: keyed(copy.journey.steps, "s") },
          honesty: {
            ...copy.honesty,
            notItems: keyed(copy.honesty.notItems, "n"),
            yesItems: keyed(copy.honesty.yesItems, "y"),
          },
          contact: copy.contact,
          seo: { _type: "seo", ...copy.seo, noIndex: false },
        },
        unset: RETIRED_PARTNERS,
      });
    }

    console.log(
      `  ${doc._id.padEnd(26)} ${doc._type.padStart(13)}  ->  every section rewritten`,
    );
    planned += 1;
  }

  // The three privacy documents may not exist at all: they were added after
  // the first seed ran, and `seed.ts` is a one-shot on an empty dataset that
  // must never be run again on a live one. createOrReplace is safe here for
  // the reason given above — every word of this page is generated, so there
  // is no editor state to lose — and it is what makes `npm run content` the
  // single command that brings a dataset up to date.
  for (const locale of LOCALES) {
    const id = `privacyPage-${locale}`;
    if (existingPrivacy.has(id)) continue;

    const copy = PRIVACY_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "privacyPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      updatedLabel: copy.updatedLabel,
      updated: copy.updated,
      sections: keyed(copy.sections, "p"),
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  for (const locale of LOCALES) {
    const id = `contactsPage-${locale}`;
    if (existingContacts.has(id)) continue;

    const copy = CONTACTS_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "contactsPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      channelsLabel: copy.channelsLabel,
      emailLabel: copy.emailLabel,
      emailNote: copy.emailNote,
      phoneLabel: copy.phoneLabel,
      phoneNote: copy.phoneNote,
      whatsappLabel: copy.whatsappLabel,
      whatsappNote: copy.whatsappNote,
      bookingLabel: copy.bookingLabel,
      bookingNote: copy.bookingNote,
      bookingCta: copy.bookingCta,
      socialsLabel: copy.socialsLabel,
      formHeading: copy.formHeading,
      formBody: copy.formBody,
      nameLabel: copy.nameLabel,
      emailFieldLabel: copy.emailFieldLabel,
      emailPlaceholder: copy.emailPlaceholder,
      messageLabel: copy.messageLabel,
      honeypotLabel: copy.honeypotLabel,
      submitLabel: copy.submitLabel,
      fine: copy.fine,
      privacyLabel: copy.privacyLabel,
      sent: copy.sent,
      error: copy.error,
      broke: copy.broke,
      enquiryLead: copy.enquiryLead,
      enquiryCta: copy.enquiryCta,
      identityLabel: copy.identityLabel,
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  for (const locale of LOCALES) {
    const id = `sourcesPage-${locale}`;
    if (existingSources.has(id)) continue;

    const copy = SOURCES_PAGE_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "sourcesPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      howToRead: copy.howToRead,
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  for (const locale of LOCALES) {
    const id = `faqPage-${locale}`;
    if (existingFaqPage.has(id)) continue;

    const copy = FAQ_PAGE_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "faqPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      howToRead: copy.howToRead,
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  for (const locale of LOCALES) {
    const id = `blogPage-${locale}`;
    if (existingBlogPage.has(id)) continue;

    const copy = BLOG_PAGE_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "blogPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      editorial: copy.editorial,
      empty: copy.empty,
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  for (const locale of LOCALES) {
    const id = `aboutPage-${locale}`;
    if (existingAbout.has(id)) continue;

    const copy = ABOUT_COPY[locale];
    transaction.createOrReplace({
      _id: id,
      _type: "aboutPage",
      language: locale,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      method: copy.method,
      unverified: copy.unverified,
      money: copy.money,
      corrections: copy.corrections,
      notAdvice: copy.notAdvice,
      authorLabel: copy.authorLabel,
      authorNote: copy.authorNote,
      portraitAlt: copy.portraitAlt,
      seo: { _type: "seo", ...copy.seo, noIndex: false },
    });
    planned += 1;
    console.log(`  ${id.padEnd(28)} created (published)`);
  }

  if (skipped.length > 0) {
    console.log(
      `\nskipped (id does not end in a known locale): ${skipped.join(", ")}`,
    );
  }

  if (!write) {
    console.log(
      `\nDry run. ${planned} document(s) would change. Re-run with --write to apply:\n  npm run content -- --write`,
    );
    return;
  }

  await transaction.commit();
  console.log(`\nPatched ${planned} document(s).`);
  console.log(
    "Reload the site. Every string on both pages now comes from Sanity.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
