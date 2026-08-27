import { defineArrayMember, defineField, defineType } from "sanity";

// A run of questions and answers inside an article body, rendered as the same
// native <details> accordion /faq uses.
//
// WHY A BLOCK TYPE AND NOT PARAGRAPHS. The articles already end with a set of
// questions, and as paragraphs they read as more article: ten more screens of
// prose after three thousand words, which is where a reader stops. As an
// accordion the same ten are one screen of headings a reader scans for theirs.
// Nothing is hidden from a machine — a closed <details> keeps its text in the
// document and in the accessibility tree, which is the property the /faq
// component was built around and the reason it is native rather than React.
//
// PLAIN STRINGS IN BOTH FIELDS, same rule as a table cell. Marks and links
// inside an answer would make this a second place a source can be cited, and an
// entry has exactly one — the line under its standfirst. It also keeps an
// answer liftable: an engine quoting a row gets the sentence, not markup.
//
// NO PER-ANSWER SOURCE LINK, unlike /faq's rows. There the list is the page and
// each answer stands alone; here the whole entry is already tied to its
// sections at the top, and repeating them under ten answers would be ten copies
// of one claim.
export const faq = defineType({
  name: "faq",
  title: "Questions",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Questions",
      description:
        "Rendered as an accordion, closed. Write the question as a reader would type it into a search box, and answer it in the first sentence.",
      type: "array",
      of: [
        defineArrayMember({
          name: "item",
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (Rule) => Rule.required().max(160),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "question", subtitle: "answer" },
          },
        }),
      ],
      // TWO, NOT ONE. A single-question accordion is a paragraph a reader has
      // to click to read.
      validation: (Rule) => Rule.required().min(2),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: "Questions",
        subtitle: `${count} question${count === 1 ? "" : "s"}`,
      };
    },
  },
});
