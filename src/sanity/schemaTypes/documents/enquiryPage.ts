import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: enquiryPage-en, enquiryPage-ru, enquiryPage-pl.
//
// THE HEAD ONLY, and the omissions are the design. The form's own labels come
// from the home page document, because the same component renders in both
// places and two editable copies of one consent checkbox is how the two end up
// promising different things. The three steps — what happens after the button
// is pressed — are in messages/{en,ru,pl}.json, code-owned, because they are
// promises about what this business does and a promise editable in Studio can
// be changed without anybody changing the thing it describes.
//
// So what is left here is what an editor should be able to reword freely: the
// eyebrow, the headline, the deck, and the SEO block.
export const enquiryPage = defineType({
  name: "enquiryPage",
  title: "Enquiry page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", {
      description:
        "MUST NAME BOTH HALVES OF THE EXCHANGE — what the reader gives and what they get back — and must be understandable without the page under it, because an H1 is read in a search result and a share card. “Get in touch” names neither half. “Find a lawyer” names only the second and is also a promise this site may not make: finding a firm and being introduced to one are different things, and only the second is on offer.",
      max: 90,
    }),
    textField("intro", "Deck", {
      description:
        "LEAD WITH WHAT WE ARE NOT: not a law firm, no lawyers, nothing here is legal advice. A reader arriving from a guide full of statute references may reasonably think they are writing to their lawyer, and that has to be corrected before the form rather than in the fine print under it. Then say who pays — the firm, on an introduction it accepts; the reader never. Four to six lines.",
      max: 600,
      rows: 6,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "meta" }),
    languageField(),
  ],
  preview: {
    select: { title: "heading", subtitle: "language" },
  },
});
