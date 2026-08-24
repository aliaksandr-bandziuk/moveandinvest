import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { languageField } from "../lib/languageField";

// One per jurisdiction per language, about BUYING — not about moving.
//
// It exists because the two questions belong to different people at different
// moments. "Where should I move and what does it cost" is answered by the
// jurisdiction page; "I have chosen the country, what do I need to know before
// I sign" is this one. Folding them together would make one page twice as long
// and answer neither question first, which is the shape that stops being
// quotable.
//
// SIX NAMED SECTIONS, NOT AN ARRAY, and for the same reason `countryPage` has
// four named comparison fields rather than a repeater: a reader comparing
// Greece against Malta must be able to compare the SAME paragraph. A free-form
// section array would let one page answer "what you pay every year" while
// another answers "running costs and other things to consider", and the
// comparison would quietly stop existing.
//
// The order is fixed in code, not chosen per page:
//
//   1. who may buy, and where they may not
//   2. what the transaction costs on top of the price
//   3. the steps and how long they take
//   4. what is payable every year
//   5. short-term letting
//   6. how a purchase connects to residency
//
// THE HEADINGS ARE NOT IN THIS SCHEMA. They come from the message catalogue
// (`property.*` in messages/*.json), so all four pages in a language carry
// byte-identical section headings. An editor who could retitle "Who may buy"
// on the Greece page alone would break the one promise these pages make.
//
// EVERY CLAIM IN THESE FIELDS COMES FROM docs/property-verification-2026-08-24.md.
// A sentence may not change here without that document changing in the same
// commit — the same rule that governs the figures.
export const propertyPage = defineType({
  name: "propertyPage",
  title: "Property page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "sections", title: "The six sections" },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "country",
      title: "Jurisdiction",
      type: "reference",
      to: [{ type: "country" }],
      description:
        "Which jurisdiction this page is about. hreflang between the three languages is assembled from this reference, exactly as it is for the jurisdiction page — so all three language versions must point at the same entry.",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      description:
        "The page's own H1, in this language. 'Buying property in Greece: rules, taxes and the steps' rather than 'Greece property'.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "Translated per language: /property-in-greece, /nedvizhimost-v-gretsii, /nieruchomosci-w-grecji. It shares the URL space with the jurisdiction pages, so it may not collide with one. Locked once published.",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (Rule) => Rule.required(),
      components: { input: SlugLockedAfterPublish },
    }),
    defineField({
      name: "intro",
      title: "Intro",
      description:
        "Two or three sentences under the H1, stating the one thing that most changes a buyer's plan in this jurisdiction. This is the paragraph an answer engine quotes — lead with the answer.",
      type: "text",
      rows: 4,
      group: "content",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "sourceNote",
      title: "Sources and date checked",
      description:
        "Which statutes and official pages these sections rest on, and when they were last verified. Rendered at the foot of the page. Not optional: a page that tells somebody what they may and may not do with a €400,000 purchase, without saying where that comes from, is a liability.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.required(),
    }),

    // --- The six sections ----------------------------------------------------
    // All optional at the schema level and rendered only when filled, so a
    // jurisdiction whose section 5 has not been verified yet simply has no
    // section 5 — rather than a heading over an empty column, which this site
    // does not do. The order below is the order on the page.
    defineField({
      name: "whoMayBuy",
      title: "1. Who may buy, and where they may not",
      description:
        "Restrictions by nationality or by area — border zones, permits, designated areas — and what happens to a transaction made without the permission.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "transactionCosts",
      title: "2. What the transaction costs on top of the price",
      description:
        "Transfer tax or VAT, notary, lawyer, registration, agent commission and who pays it. Say which reliefs a foreign buyer cannot use — that is the half nobody publishes.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "steps",
      title: "3. The steps, and how long they take",
      description:
        "Tax number, bank account, preliminary contract, checks, deed, registration. Give a duration ONLY where an official source publishes one; an invented timeline is the easiest claim on this site to disprove.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "annualCosts",
      title: "4. What is payable every year",
      description:
        "Property tax where one exists, tax on rental income, service charges and municipal duties. Where a country levies no annual property tax, say so plainly.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "shortLet",
      title: "5. Short-term letting",
      description:
        "Licence or registry, restrictions and freezes, the fines, and whether the building or the residency programme forbids it outright. This is where a buyer loses the most money by assumption.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "residencyLink",
      title: "6. How a purchase connects to residency",
      description:
        "Which purchase counts toward a threshold and which does not. Where property confers no status at all, that sentence is the point of the section.",
      type: "portableText",
      group: "sections",
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "meta",
      validation: (Rule) => Rule.required(),
    }),
    languageField(),
  ],
  preview: {
    select: { title: "title", country: "country.name", language: "language" },
    prepare({ title, country, language }) {
      return {
        title,
        subtitle: `${country ?? "no jurisdiction"} · ${String(language ?? "").toUpperCase()} · property`,
      };
    },
  },
});
