import { defineField } from "sanity";

// Required on every schema type registered with
// @sanity/document-internationalization (see TRANSLATABLE_TYPES in
// src/sanity/structure.ts). The plugin writes this field itself — it is
// read-only and hidden so an editor never touches it directly.
export function languageField() {
  return defineField({
    name: "language",
    title: "Language",
    type: "string",
    readOnly: true,
    hidden: true,
  });
}
