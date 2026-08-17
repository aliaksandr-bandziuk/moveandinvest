import { defineField, defineType } from "sanity";

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "href",
      title: "Destination",
      description:
        "A path on this site (/for-partners) or a full external URL. Locale prefixes are added automatically — write /for-partners, not /ru/for-partners.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
