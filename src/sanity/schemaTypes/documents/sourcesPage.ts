import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: sourcesPage-en, sourcesPage-ru, sourcesPage-pl.
//
// DELIBERATELY THE SMALLEST DOCUMENT TYPE ON THIS SITE — four fields and no
// body. The page it heads is long, but almost none of it is editable, and that
// is the point rather than an omission.
//
// The evidence — 33 checks, their findings and their citations — lives in
// src/lib/sourceData.ts, in code. The project's standing rule is that a figure
// may not change in copy/jurisdictions.ts without
// docs/figures-verification-2026-08-23.md changing in the same commit. A
// dataset editable in Studio routes straight around that rule: somebody
// corrects a threshold in a text field, the dossier still says the old thing,
// and the one page whose entire purpose is provable sourcing quietly stops
// being provable. So the schema deliberately offers no field to do it in.
//
// What IS editable is the head: the eyebrow, the headline, the deck and the
// "how to read this" line. Those are prose about the page, not claims about the
// world, and a typo in them should not need a deploy.
export const sourcesPage = defineType({
  name: "sourcesPage",
  title: "Sources and working",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", {
      description:
        "About the EVIDENCE, not about the method — /about already covers the method. “Every figure on this site, and where it came from”.",
      max: 90,
    }),
    textField("intro", "Deck", {
      description:
        "LEAD WITH THE NUMBER OF CORRECTIONS. Fourteen of thirty-three checks came back wrong, and the instinct to bury that is exactly backwards: no competitor publishes such a number, and a comparison that has never found itself wrong has never checked. Four to seven lines.",
      max: 600,
      rows: 6,
    }),
    textField("howToRead", "How to read a row", {
      description:
        "Two sentences above the table. What the three columns are, and why the citation rather than the link is the thing to verify against.",
      max: 500,
      rows: 4,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "meta" }),
    languageField(),
  ],
  preview: {
    select: { title: "heading", subtitle: "language" },
  },
});
