import { defineField } from "sanity";

// Inline link inside Portable Text. Deliberately one annotation, not two
// (internal/external): editors get one "Link" button, and whether it opens
// in a new tab is a checkbox rather than a second concept to explain.
export function linkAnnotation() {
  return {
    name: "link",
    title: "Link",
    type: "object" as const,
    fields: [
      defineField({
        name: "href",
        title: "URL",
        type: "url",
        validation: (Rule) =>
          Rule.required().uri({
            scheme: ["http", "https", "mailto", "tel"],
            allowRelative: true,
          }),
      }),
      defineField({
        name: "newTab",
        title: "Open in a new tab",
        description:
          "Use for links leaving moveandinvest.com — a partner firm, an official government page, a source document.",
        type: "boolean",
        initialValue: false,
      }),
    ],
  };
}
