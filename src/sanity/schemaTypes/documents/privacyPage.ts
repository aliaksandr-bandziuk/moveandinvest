import { defineArrayMember, defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: privacyPage-en, privacyPage-ru, privacyPage-pl.
//
// THIS ONE BREAKS THE "no section builder" RULE, and here is the argument.
// Every other page on the site has a composition fixed by its design — eight
// numbered sections, each with its own object field, in the order the page
// renders them. A privacy policy has no design to fix it. Its section list is
// determined by what the site actually does with data, and that changes when
// a supplier changes, when a purpose is added, or when a regulator decides
// something needs saying. Freezing eight headings into a schema would mean a
// deploy every time the processing changes, and the predictable result is a
// policy that quietly stops matching reality. So `sections` is an array.
//
// The trade is real: an editor can now write a policy section that says
// anything, with nothing in the schema to stop them. That is the correct
// trade for a legal text and the wrong one for a marketing page.
//
// What is NOT editable here: the controller's name, legal form and NIP. They
// live in scripts/copy/privacy.ts as language-neutral constants and are
// written into the section bodies from there. A legal identity that can be
// reworded per locale in a CMS is a legal identity that will eventually be
// wrong in one of them.
export const privacyPage = defineType({
  name: "privacyPage",
  title: "Privacy policy",
  type: "document",
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", { max: 90 }),
    textField("intro", "Deck", {
      description:
        "The right half of the page head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it.",
      max: 500,
      rows: 5,
    }),
    stringField("updatedLabel", "“Last updated” label", { max: 30 }),
    stringField("updated", "Date last updated", {
      description:
        "Written out, in this document's own language. Change it whenever a section changes — a policy whose date has not moved in a year reads as one nobody maintains.",
      max: 40,
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      description:
        "In reading order. Each is a heading and a paragraph. Add one when the site starts doing something new with data; the page numbers them itself.",
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            stringField("heading", "Heading", { max: 80 }),
            textField("body", "Body", { max: 1200, rows: 6 }),
          ],
          preview: {
            select: { title: "heading", subtitle: "body" },
          },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (Rule) => Rule.required(),
    }),
    languageField(),
  ],
  preview: {
    select: { title: "heading", language: "language" },
    prepare({ title, language }) {
      return {
        title: title ?? "Privacy policy",
        subtitle: typeof language === "string" ? language.toUpperCase() : undefined,
      };
    },
  },
});
