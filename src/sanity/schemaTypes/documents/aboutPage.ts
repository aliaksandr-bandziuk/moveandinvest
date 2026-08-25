import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: aboutPage-en, aboutPage-ru, aboutPage-pl.
//
// WHAT THIS PAGE IS FOR, because getting that wrong produces the usual "About
// us" and wastes the URL. The site claims independence in the eyebrow of every
// page — "independent research" — and until 24 Aug 2026 substantiated it
// nowhere. The legal identity existed in exactly one place: the controller
// section of the privacy policy, which is to say, behind a page nobody opens
// voluntarily. A site whose product is the traceability of a figure was itself
// untraceable.
//
// SO THE PAGE IS ABOUT THE METHOD, NOT ABOUT A PERSON. There are two kinds of
// authority available here. Personal — "trust me, I have twenty years in this"
// — which cannot be checked and which this project does not have. And
// procedural — "do not trust me, here is the statute and the date, check it
// yourself." The second is the only honest one available, and it is also the
// stronger of the two: an expert opinion cannot be verified, a citation can.
//
// Hence no biography, no mission, no team, no years-in-business. The author
// block exists for accountability — somebody to write to when a figure turns
// out to be wrong — and sits in the section about corrections rather than at
// the top as a credential.
//
// NAMED FIELDS, NOT AN ARRAY. This is the opposite call from privacyPage, and
// deliberately: a privacy policy has no design to fix its composition, so its
// sections are an array. This page does. Its five blocks answer five questions
// in one order, and an editor who could reorder or drop one could quietly turn
// it back into an About page — most easily by deleting the section that says
// what is NOT verified, which is the one section a competitor does not have.
//
// THE FIGURES QUOTED IN `method` COME FROM docs/figures-verification-2026-08-23.md.
// The claim that five of six headline numbers were wrong is checkable against
// that document, and it may not change here without changing there.
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About the project",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "sections", title: "The five sections" },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", {
      description:
        "About the METHOD, not about us. “How a figure gets onto this site” rather than “About moveandinvest”.",
      max: 90,
    }),
    textField("intro", "Deck", {
      description:
        "The right half of the page head. Four to seven lines: what this site is and, in the same breath, what it is not. This is the paragraph an answer engine quotes when asked who publishes the comparison.",
      max: 500,
      rows: 5,
    }),

    // --- The five sections ---------------------------------------------------
    // Order fixed in code. Each is portable text so a paragraph can be added
    // when the method changes — which it will, the first time a jurisdiction
    // starts publishing something it did not publish before.
    defineField({
      name: "method",
      title: "1. How a figure gets onto this site",
      description:
        "The rule — primary sources only, and nothing published without one — followed by real examples of it biting. The five-of-six correction on 23 Aug 2026 belongs here: a rule with no example is a slogan.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "unverified",
      title: "2. What is NOT verified here, and why",
      description:
        "Cyprus, the timelines no ministry publishes, the costs that exist only as market practice. THE MOST IMPORTANT SECTION ON THE PAGE — no competitor has one, and it is what separates a comparison from an advertisement. Do not soften it.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "money",
      title: "3. How the project makes money",
      description:
        "The BOUNDARIES, never the model and never a price — see “Business decisions already taken” in CLAUDE.md. One partner per jurisdiction, no resale, no commission on a closing, no paid position in the table, no property sold. Then the conflict of interest stated out loud rather than left for the reader to notice.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "corrections",
      title: "4. If you have found an error",
      description:
        "The mechanism, not an invitation: where to write, how fast a reply comes, and what happens to the figure — it changes together with its verification date, in the open. This section carries the author block.",
      type: "portableText",
      group: "sections",
    }),
    defineField({
      name: "notAdvice",
      title: "5. What this is not",
      description:
        "Not a law firm; no legal, tax or investment advice. The same sentence that closes every email the site sends, said once where a reader can find it before they act on anything.",
      type: "portableText",
      group: "sections",
    }),

    // --- The author block ----------------------------------------------------
    // Text only. The name, the legal form and the NIP are NOT editable here:
    // they live in scripts/copy/privacy.ts as CONTROLLER, language-neutral, and
    // are rendered from there. A legal identity that can be reworded per locale
    // in a CMS is a legal identity that will eventually be wrong in one of them
    // — the same rule the privacy policy already follows.
    //
    // The portrait is NOT a Sanity image either. It is one file that changes
    // roughly never, it must be present at build time for next/image to size
    // it, and routing it through the CMS would add an asset pipeline and a
    // CDN request for a single JPEG. It lives in public/ — see AuthorNote.
    stringField("authorLabel", "Author block: label", {
      description: "The small line above the name. “Who checks the figures”, not “Founder”.",
      max: 40,
    }),
    textField("authorNote", "Author block: what he does here", {
      description:
        "Two or three sentences, and about the WORK rather than the person: what he actually does with the figures and what he is answerable for. No career, no motivation, no story. If a sentence would still be true on any other consultant's site, cut it.",
      max: 400,
      rows: 4,
    }),
    stringField("portraitAlt", "Author block: photo alt text", {
      description:
        "Describes the photograph for somebody who cannot see it. “Aliaksandr Bandziuk” is enough; do not write “photo of”.",
      max: 120,
      required: false,
    }),

    defineField({ name: "seo", title: "SEO", type: "seo", group: "meta" }),
    languageField(),
  ],
  preview: {
    select: { title: "heading", subtitle: "language" },
  },
});
