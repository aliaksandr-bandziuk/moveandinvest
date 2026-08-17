import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Singleton, one per language. Document id convention: homePage-en,
// homePage-ru, homePage-pl (see src/sanity/structure.ts).
//
// Deliberately small. This page has one job in the first weeks: survive the
// ten seconds a lawyer spends checking the domain in an email signature.
// Fields get added when a section proves it is needed, not in anticipation.
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Sections" },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      description:
        "Small uppercase line above the headline. E.g. Independent research.",
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
        "One paragraph. State what the site compares and for whom — this is the text that gets quoted.",
      type: "text",
      rows: 3,
      group: "hero",
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary call to action",
      type: "cta",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary call to action",
      description: "Usually the partner page.",
      type: "cta",
      group: "hero",
    }),
    defineField({
      name: "comparisonHeading",
      title: "Comparison section heading",
      type: "string",
      group: "sections",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "comparisonIntro",
      title: "Comparison section intro",
      type: "text",
      rows: 2,
      group: "sections",
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: "methodHeading",
      title: "Method heading",
      type: "string",
      group: "sections",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "methodIntro",
      title: "Method intro",
      description: "One line under the heading. Stays visible while the points scroll past it.",
      type: "text",
      rows: 2,
      group: "sections",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "methodPoints",
      title: "Method points",
      description:
        "Three to five. This is where the site says where its numbers come from and how it is paid — the two questions that decide whether a reader trusts the table above.",
      type: "array",
      group: "sections",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required().max(60),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required().max(280),
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        },
      ],
      validation: (Rule) => Rule.required().min(3).max(5),
    }),
    defineField({
      name: "partnerTeaserHeading",
      title: "Partner teaser heading",
      type: "string",
      group: "sections",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "partnerTeaserBody",
      title: "Partner teaser body",
      type: "text",
      rows: 3,
      group: "sections",
      validation: (Rule) => Rule.required().max(320),
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
        title: title ?? "Home page",
        subtitle: String(language ?? "").toUpperCase(),
      };
    },
  },
});
