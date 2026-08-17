import { defineArrayMember, defineField, defineType } from "sanity";
import { linkAnnotation } from "./linkAnnotation";

// Restricted rich text: H2 and H3 only (H1 always comes from the document
// title), paragraphs, bold/italic, links, lists, blockquote, and images with
// required alt text. Nothing else — do not add marks, styles or blocks here
// without deliberately revisiting the rule in CLAUDE.md.
//
// No H4: a page that needs four heading levels is a page that needs
// splitting, and deep heading trees hurt the extractability this whole site
// is built around.
export const portableText = defineType({
  name: "portableText",
  title: "Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet list", value: "bullet" },
        { title: "Numbered list", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [linkAnnotation()],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          description: "Optional. Shown beneath the image in the muted style.",
          type: "string",
        }),
      ],
    }),
  ],
});
