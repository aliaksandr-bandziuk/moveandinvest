import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// One question and its answer. Translatable, and a document rather than a
// field on the home page for one reason: the same answer belongs on a
// jurisdiction page too, and a copy on each page is a copy that goes stale on
// one of them.
//
// The answer is plain text, not portable text. Every one of these is fed to a
// FAQPage JSON-LD block, and schema.org's acceptedAnswer takes a string —
// rich text would have to be flattened anyway, and the flattening is where
// links and emphasis silently disappear. Keep answers to a short paragraph:
// this is the block an answer engine quotes verbatim, and it quotes the
// whole thing.
export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ question",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      description:
        "Phrased the way a reader would type it, not the way a lawyer would file it. 'Does the permit let me work in the EU?' rather than 'Employment rights under residence permits'.",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description:
        "Lead with the answer — yes, no, or the number. The explanation comes after. If the honest answer is 'it depends', say what it depends on in the same sentence.",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required().max(700),
    }),
    defineField({
      name: "jurisdictions",
      title: "Applies to",
      description:
        "Leave EMPTY for a question that applies to all five — that is the common case, and an empty list means 'general', not 'unassigned'. Tick jurisdictions only where the answer would be wrong for the others.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "country" }] }],
    }),
    defineField({
      name: "order",
      title: "Sort order",
      description: "Lower first. The first two or three are what most people read.",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    languageField(),
  ],
  orderings: [
    { name: "byOrder", title: "Sort order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "question", order: "order", language: "language" },
    prepare({ title, order, language }) {
      return {
        title,
        subtitle: `${String(order ?? "?").padStart(2, "0")} · ${String(language ?? "").toUpperCase()}`,
      };
    },
  },
});
