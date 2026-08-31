import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: changesPage-en, changesPage-ru, changesPage-pl.
//
// THE SAME SHAPE AS sourcesPage AND FOR THE SAME REASON. The head of the page
// is editable — eyebrow, headline, deck, and the line explaining how to read a
// row — and the log itself is not, because it lives in src/lib/changeData.ts
// where a row cannot move without the commit that moves it. A dataset editable
// in Studio would let somebody add a rule change with no instrument beside it,
// which is the one thing this page exists to make impossible.
export const changesPage = defineType({
  name: "changesPage",
  title: "Rule changes",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", {
      description:
        "MUST NAME ITS SUBJECT AND SPELL OUT ITS SCOPE, because an H1 is read in a search result and a share card, where the page below it is not there to explain it. \u201cWhat changed in the rules\u201d is rules of what \u2014 traffic? And \u201cin five countries\u201d is which five? Both drafts made that mistake in turn. Name residency and tax, and name all five jurisdictions. \u201cBy which act\u201d is the argument and belongs in the deck, where there is room.",
      max: 90,
    }),
    textField("intro", "Deck", {
      description:
        "LEAD WITH THE ROWS THAT HAVE NO INSTRUMENT. Two of the changes in this log were never published as an act by anybody, and saying so first is the whole argument for the page existing. Four to seven lines.",
      max: 600,
      rows: 6,
    }),
    textField("howToRead", "How to read a row", {
      description:
        "Two sentences above the log. What the columns are, and that the third one \u2014 which of our own figures moved \u2014 is the column no competitor publishes.",
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
