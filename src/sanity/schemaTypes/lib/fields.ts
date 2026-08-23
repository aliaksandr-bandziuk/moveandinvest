import { defineField } from "sanity";

// Two helpers that cut the boilerplate out of a page schema where almost
// every field is "a required string with a length cap". Written after the
// home page grew from four editable strings to sixty: at that size the
// difference between a schema you can read and one you cannot is whether
// each field is one line or eight.
//
// Both take `max` because a page schema without length caps is a page that
// eventually breaks its own layout — the caps here are what the rendered
// design actually tolerates, measured, not guessed.

interface Options {
  description?: string;
  max?: number;
  /** Default true. Pass false for a field the design renders only if set. */
  required?: boolean;
}

export function stringField(name: string, title: string, options: Options = {}) {
  const { description, max = 90, required = true } = options;

  return defineField({
    name,
    title,
    description,
    type: "string",
    validation: (Rule) => (required ? Rule.required().max(max) : Rule.max(max)),
  });
}

export function textField(
  name: string,
  title: string,
  options: Options & { rows?: number } = {},
) {
  const { description, max = 300, required = true, rows = 3 } = options;

  return defineField({
    name,
    title,
    description,
    type: "text",
    rows,
    validation: (Rule) => (required ? Rule.required().max(max) : Rule.max(max)),
  });
}

// A section of a page: one object field holding that section's copy, titled
// with the number the section carries in its own eyebrow on the page, so an
// editor looking at the site can find the right field without counting.
export function sectionField(
  name: string,
  title: string,
  description: string,
  fields: ReturnType<typeof defineField>[],
) {
  return defineField({
    name,
    title,
    description,
    type: "object",
    // Collapsed by default: eight expanded sections is a document nobody can
    // navigate. Sanity remembers what the editor opened last.
    options: { collapsible: true, collapsed: true },
    fields,
  });
}
