import { defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { languageField } from "../lib/languageField";

// One per jurisdiction per language. Holds everything a reader sees; the
// language-neutral registry (ISO code, chip colour, order, status) lives on
// the `country` document this references.
//
// The four comparison fields below are NAMED fields rather than a free-form
// label/value array, and that is the whole point: a comparison table only
// works if every row answers the same four questions. A repeater would let
// Portugal answer "minimum investment" while Greece answers "entry
// threshold", and the table would stop being comparable — which is exactly
// the property an answer engine is quoting it for.
//
// They are strings, not numbers: "€250,000" and "from €250,000 (property)"
// are both legitimate, thresholds are stated per route, and a currency-aware
// number field would force a precision the source material does not have.
// Keep them short — they render inside a table cell.
export const countryPage = defineType({
  name: "countryPage",
  title: "Jurisdiction page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "comparison", title: "Comparison row" },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "country",
      title: "Jurisdiction",
      type: "reference",
      to: [{ type: "country" }],
      description:
        "Which jurisdiction this page is about. The chip colour and sort order come from here.",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      description:
        "The page's own H1, in this language. Not the jurisdiction's name — 'Moving to Greece: residency, tax and property' rather than 'Greece'.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "Translated per language: /greece in English, /gretsiya in Russian. Locked once the page has been published.",
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
        "Two or three sentences under the H1. This is the paragraph an answer engine is most likely to quote — lead with the answer, not with a welcome.",
      type: "text",
      rows: 4,
      group: "content",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "route",
      title: "Residency route",
      description: "E.g. Golden Visa, D7, Investor visa. Short.",
      type: "string",
      group: "comparison",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "minimumInvestment",
      title: "Minimum investment",
      description: "E.g. €250,000. Include the currency symbol.",
      type: "string",
      group: "comparison",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "timeToPermit",
      title: "Time to first permit",
      description: "E.g. 2–4 months.",
      type: "string",
      group: "comparison",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "taxRegime",
      title: "Tax regime",
      description: "One short clause, e.g. Non-dom, 7% flat on foreign pensions.",
      type: "string",
      group: "comparison",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "costAdvertisedEur",
      title: "Advertised threshold, in euro",
      description:
        "The number every brochure prints, converted to euro if this jurisdiction sets it in another currency. Euro because the home page compares all five on one axis — a bar chart mixing currencies is a picture of an exchange rate, not of a decision.",
      type: "number",
      group: "comparison",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "costExtrasEur",
      title: "Everything else, first year, in euro",
      description:
        "Transfer taxes, legal and filing fees, government charges and the first renewal. Leave both cost fields empty until they are checked — the home page simply omits a jurisdiction that has no verified pair, rather than showing a guess.",
      type: "number",
      group: "comparison",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "sourceNote",
      title: "Source and date checked",
      description:
        "Where these four figures come from and when they were last verified. Rendered under the table. Not optional: an unsourced number is a liability on a page a lawyer may forward to a client.",
      type: "string",
      group: "comparison",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      group: "content",
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
        subtitle: `${country ?? "no jurisdiction"} · ${String(language ?? "").toUpperCase()}`,
      };
    },
  },
});
