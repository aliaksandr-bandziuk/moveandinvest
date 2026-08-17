import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Singleton, one per language: siteSettings-en, siteSettings-ru,
// siteSettings-pl. Translatable because the tagline and the fallback SEO
// copy are language-specific — the site name is not, but splitting one
// three-field document across two types to save one duplicated string is
// not worth the extra concept.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      initialValue: "moveandinvest",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      description: "One line. Used in the footer and as an OG fallback.",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (Rule) =>
        Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: "email" }),
    }),
    defineField({
      name: "disclaimer",
      title: "Footer disclaimer",
      description:
        "Rendered on every page. This site compares regimes; it does not advise. Say so where a visitor cannot miss it.",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: "dividerImage",
      title: "Divider photograph",
      description:
        "A single full-width photograph, shown between the enquiry form and the footer on every page, revealed by a scroll parallax. Optional — with no image the divider is simply not rendered.\n\nChoose it against the design direction, not for it: no villa at sunset, no pool, no terrace with a glass of wine. That palette is the category default and this site exists to not look like it. Something documentary reads correctly — a street, a government building, a queue at a registry, a city from above in ordinary weather. Wide and dark works best: the blocks either side of it are black.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          description:
            "Leave EMPTY if the photograph is decorative, which this one usually is — an empty alt tells a screen reader to skip it, which is correct, while a description of scenery is noise between a form and a footer.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "defaultSeo",
      title: "Default SEO",
      description: "Fallback used by any page that has not set its own.",
      type: "seo",
      validation: (Rule) => Rule.required(),
    }),
    languageField(),
  ],
  preview: {
    select: { title: "siteName", language: "language" },
    prepare({ title, language }) {
      return {
        title: title ?? "Site settings",
        subtitle: String(language ?? "").toUpperCase(),
      };
    },
  },
});
