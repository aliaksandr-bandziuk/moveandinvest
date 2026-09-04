import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: goldenVisaPage-en, goldenVisaPage-ru,
// goldenVisaPage-pl. The head of /golden-visa.
//
// WHY THIS PAGE EXISTS, since 4 September 2026. Search demand for the TERM was
// landing nowhere: "golden visa", "golden passport", "golden residency", "visa
// by investment" and "what is a golden visa" together carry more monthly
// impressions than every jurisdiction page on this site combined, and the only
// thing that answered them was a single FAQ row halfway down /faq. The home
// page compares five jurisdictions to a reader who already knows what is being
// compared; this one is for the reader who does not yet.
//
// THE SAME SHAPE AS sourcesPage AND changesPage, AND FOR THE SAME REASON. Four
// editable fields, no body. Everything the page states — what each state
// actually calls the permit, the thresholds, what changed and when — is read
// from src/lib and from the jurisdiction registry, where a figure cannot move
// without its verification document moving in the same commit. A body field
// here would be a second place to write a threshold, and the second place is
// always the one that goes stale.
export const goldenVisaPage = defineType({
  name: "goldenVisaPage",
  title: "Golden visa: the explainer",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", {
      description:
        "Answers “what is this”, not “which is best” — the comparison is the home page's job. Name the thing and say plainly that no state calls it that.",
      max: 90,
    }),
    textField("intro", "Deck", {
      description:
        "The definition itself, in the first two lines: a residence permit granted against an investment. Then the fact that the name is a market invention and each of the five has its own legal term. Four to six lines.",
      max: 600,
      rows: 6,
    }),
    textField("namesNote", "Above the names table", {
      description:
        "Two sentences introducing what each state actually calls it. This is the paragraph that earns the page its traffic from “golden passport” and “golden residency”, so it must say honestly that those are nicknames, not statuses.",
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
