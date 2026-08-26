import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: faqPage-en, faqPage-ru, faqPage-pl.
//
// THE SAME SHAPE AS sourcesPage, AND FOR THE SAME REASON. Five fields and no
// body. The fifty-two questions, their answers in three languages, and the
// /sources section each figure was checked against all live in
// src/lib/faqData.ts, in code — because almost every answer carries a
// threshold, a fee or a number of years, and a text field in Studio is a way
// for one of those to move without its evidence moving with it. That is not
// hypothetical: on 25 August 2026 this site was found stating two different
// things about one Greek statute on two different pages.
//
// faqData.ts also throws at import time if an answer states a figure and names
// no source section. A dataset cannot enforce that; a module can.
//
// What IS editable here is the head — eyebrow, headline, deck, and the line
// above the accordion explaining what the source link under each answer is.
// Prose about the page, not claims about the world.
//
// The `faqItem` DOCUMENT TYPE STAYS, and is not superseded by this. It holds
// the six questions the home page shows, it is referenced from jurisdiction
// pages, and its text is now read from faqData.ts by the seed script so the two
// cannot disagree.
export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", {
      description:
        "About the questions, not about the site. “Fifty-two questions, answered from the statute” beats “Frequently asked questions”, which says nothing a reader could not see.",
      max: 90,
    }),
    textField("intro", "Deck", {
      description:
        "LEAD WITH WHAT MAKES IT DIFFERENT: every answer that states a figure links to the law it was checked against, and the ones no primary source supports say so instead of guessing. Four to seven lines.",
      max: 600,
      rows: 6,
    }),
    textField("howToRead", "What the source line means", {
      description:
        "Two sentences above the first section. What the link under an answer goes to, and what it means when an answer says no primary source publishes something.",
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
