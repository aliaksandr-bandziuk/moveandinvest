"use client";

import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import type { DocumentActionComponent } from "sanity";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";
import {
  PROTECTED_TYPES,
  structure,
  TRANSLATABLE_TYPES,
} from "./src/sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}

// This Studio serves the PUBLIC content dataset only.
//
// Enquiries live in a second, private dataset and are deliberately absent
// here: adding a workspace for them means changing this file's basePath and
// re-testing Presentation and document-internationalization against a live
// project, and an admin panel is not something to change blind. Until then
// they are read with `npm run enquiries`. See src/sanity/enquiries.ts.
export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Removes templates from the pool itself rather than filtering per
    // creation context, so this applies everywhere a document can be
    // created from a template: the global "+ Create" menu, a list pane's
    // own "+", and inline reference-field creation alike.
    templates: (prev) =>
      prev.filter((template) => {
        // Singletons: no creation via any template, bare or
        // language-tagged. They are only reachable through their fixed
        // pane, so an editor can never spawn a stray second one.
        if (PROTECTED_TYPES.has(template.schemaType)) return false;
        // Other translatable types: hide only the bare, language-less
        // template (its id equals the schema type name) so creation always
        // goes through a language-tagged one. All three languages stay
        // available; what disappears is the silent, unpaired document.
        if (TRANSLATABLE_TYPES.has(template.id)) return false;
        return true;
      }),
  },
  plugins: [
    structureTool({ structure }),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
        { id: "en", title: "English" },
        { id: "ru", title: "Russian" },
        { id: "pl", title: "Polish" },
      ],
      schemaTypes: [...TRANSLATABLE_TYPES],
    }),
    presentationTool({
      // previewUrl.initial is intentionally omitted: it defaults to
      // location.origin, already correct for localhost, every Vercel
      // preview and production alike, with no env-var branching.
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
  ],
  document: {
    actions: (prev, context) => {
      if (PROTECTED_TYPES.has(context.schemaType)) {
        return prev.filter(
          ({ action }) => action !== "delete" && action !== "duplicate",
        );
      }
      if (TRANSLATABLE_TYPES.has(context.schemaType)) {
        // The plugin types `action` as a plain string rather than the
        // narrower DocumentActionComponent["action"] union — a declaration
        // gap in the library, not a real mismatch.
        return [
          ...prev,
          useDeleteTranslationAction as DocumentActionComponent,
          useDuplicateWithTranslationsAction as DocumentActionComponent,
        ];
      }
      return prev;
    },
  },
});
