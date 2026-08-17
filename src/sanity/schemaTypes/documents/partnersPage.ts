import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Singleton, one per language. Document id convention: partnersPage-en,
// partnersPage-ru, partnersPage-pl.
//
// This page exists to change the tone of the outbound email: with it, the
// first message to a law firm is an offer on stated terms rather than a
// request for cooperation. That is why `qualificationSteps` is a required
// field with exactly three entries — the three questions every lead answers
// before it is passed on are the product, and a partner reading this page
// should see them before they see a price.
export const partnersPage = defineType({
  name: "partnersPage",
  title: "For partners",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "offer", title: "Offer" },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      group: "hero",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "heading",
      title: "Headline",
      type: "string",
      group: "hero",
      validation: (Rule) => Rule.required().max(90),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      description:
        "Who this site sends and in what shape. Do not promise volumes that do not exist yet — the market is small and an overstatement surfaces.",
      type: "text",
      rows: 4,
      group: "hero",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "qualificationHeading",
      title: "Qualification heading",
      type: "string",
      group: "offer",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "qualificationSteps",
      title: "Qualification questions",
      description:
        "Exactly three: jurisdiction, budget, timeline. These are what makes a lead qualified rather than raw, and changing the count means changing the offer.",
      type: "array",
      group: "offer",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: "note",
              title: "What the partner gets",
              type: "string",
              validation: (Rule) => Rule.required().max(160),
            }),
          ],
          preview: { select: { title: "question", subtitle: "note" } },
        },
      ],
      validation: (Rule) => Rule.required().length(3),
    }),
    defineField({
      name: "terms",
      title: "Terms",
      description:
        "How the commercial side works: paid per qualified lead, not commission on a closing. Keep it explicit — the entire risk of this model is being paid on someone else's sales performance.",
      type: "portableText",
      group: "offer",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      description: "An address on the moveandinvest.com domain.",
      type: "string",
      group: "offer",
      validation: (Rule) =>
        Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          name: "email",
        }),
    }),
    defineField({
      name: "ctaLabel",
      title: "Contact button label",
      type: "string",
      group: "offer",
      validation: (Rule) => Rule.required().max(40),
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
    select: { title: "heading", language: "language" },
    prepare({ title, language }) {
      return {
        title: title ?? "For partners",
        subtitle: String(language ?? "").toUpperCase(),
      };
    },
  },
});
