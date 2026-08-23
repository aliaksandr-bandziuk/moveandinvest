import { defineField, defineType } from "sanity";
import { sectionField, stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language. Document id convention: partnersPage-en,
// partnersPage-ru, partnersPage-pl. Same structure as homePage: one object
// field per rendered section, in page order, no groups and no tabs.
//
// This page exists to change the tone of the outbound email: with it, the
// first message to a law firm is an offer on stated terms rather than a
// request for cooperation.
//
// ONE RULE GOVERNS EVERY TEXT FIELD BELOW. THE PAGE NAMES NO PRICE AND NO
// PAYMENT MODEL. The whole purpose of the first outbound wave is to ask the
// market what it pays for a qualified enquiry and on what terms; a figure or
// a model printed here answers the question we are asking, and anchors it
// low. There is a second, harder reason: paying a lawyer per referred client
// is prohibited in Malta and criminal in the UAE, so "paid per lead" is not
// merely premature as copy — it is wrong for two of the five jurisdictions.
// What the page states instead is what an enquiry is, who receives it, and
// what we do not do: one partner per jurisdiction, no resale, no commission
// on a closing.
//
// Section 05 is written but not yet designed, so it has no fields here yet. Fields are added when the section they belong to is built — a
// dormant field is one an editor fills in and then cannot find on the page,
// which is worse than no field at all.
export const partnersPage = defineType({
  name: "partnersPage",
  title: "For partners",
  type: "document",
  fields: [
    // --- 01 -----------------------------------------------------------------
    sectionField(
      "hero",
      "01. Hero",
      "The black plane at the top. The headline must name what an enquiry is ABOUT — residency and property — because a partner arriving from a cold email has never heard of this site.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40, required: false }),
        stringField("heading", "Headline", { max: 90 }),
        textField("intro", "Intro", {
          description:
            "Who this site sends and in what shape. Do not promise volumes that do not exist yet — the market is small and an overstatement surfaces.",
          max: 400,
          rows: 4,
        }),
        defineField({
          name: "principles",
          title: "Terms, in three lines",
          description:
            "The commercial position as the hero states it. Three, because three fit one row on a laptop and a fourth pushes the last onto its own line. Not a price: see the note at the top of this file.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                stringField("title", "Title", { max: 40 }),
                stringField("body", "Body", { max: 140 }),
              ],
              preview: { select: { title: "title", subtitle: "body" } },
            },
          ],
          validation: (Rule) => Rule.required().length(3),
        }),
        stringField("ctaLabel", "Button label", { max: 40 }),
        defineField({
          name: "contactEmail",
          title: "Contact email",
          description: "An address on the moveandinvest.com domain.",
          type: "string",
          validation: (Rule) =>
            Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: "email" }),
        }),
      ],
    ),

    // --- 02 -----------------------------------------------------------------
    sectionField(
      "anatomy",
      "02. What is inside an enquiry",
      "A white plane under the hero. A marked sample card on the left, one note per field on the right.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Intro", {
          description:
            "Must say the sample below is invented. No real enquiry exists yet, and this page's whole position is that we publish real figures.",
          max: 300,
        }),
        stringField("sampleLabel", "Sample card label", { max: 60 }),
        stringField("sampleTag", "Sample card tag", {
          description:
            "The chip marking the card as made up — e.g. «образец». Required: emptying it removes a disclosure, not a decoration.",
          max: 20,
        }),
        defineField({
          name: "fields",
          title: "Enquiry fields",
          description:
            "One entry per field of the enquiry form, in the order the form asks them. `Sample value` is invented and shown inside the marked card; `Why it is there` explains what the field tells a partner.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                stringField("label", "Field name", { max: 40 }),
                textField("sample", "Sample value", { max: 200, rows: 2 }),
                textField("note", "Why it is there", { max: 260 }),
              ],
              preview: { select: { title: "label", subtitle: "sample" } },
            },
          ],
          validation: (Rule) => Rule.required().min(4).max(8),
        }),
        textField("note", "What «qualified» does not mean", {
          description:
            "The closing line. Keep the disclaimer: we do not verify budget, source of funds or intent — a partner who believes we did will be angry later, and rightly.",
          max: 400,
        }),
      ],
    ),

    // --- 03 -----------------------------------------------------------------
    sectionField(
      "journey",
      "03. How a person gets to an enquiry",
      "A vertical timeline on the black plane. The steps are a SEQUENCE — the order is the point, which is why the layout draws a line through them rather than setting them side by side.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Intro", { max: 240, rows: 2 }),
        defineField({
          name: "steps",
          title: "Steps",
          description:
            "In the order they happen on the site. Three to six: below three there is no sequence to show, above six the timeline stops being readable in one screen.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                stringField("title", "Step", { max: 60 }),
                textField("body", "What happens", { max: 300 }),
              ],
              preview: { select: { title: "title", subtitle: "body" } },
            },
          ],
          validation: (Rule) => Rule.required().min(3).max(6),
        }),
        textField("note", "Closing note", {
          description:
            "Keep the line about pop-ups. It is a promise about the whole site, and it is checkable — the moment one appears, this sentence is a lie.",
          max: 300,
        }),
      ],
    ),

    // --- 04 -----------------------------------------------------------------
    sectionField(
      "honesty",
      "04. What we do not promise",
      "A white plane. The two groups are STACKED, not side by side, and the order is the argument: expectations are removed first, commitments are the last thing read before the form. Setting them in columns would let a reader take the promises before the caveats — the reverse of the point.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Intro", { max: 300 }),
        stringField("notLabel", "«We do not promise» label", { max: 40 }),
        defineField({
          name: "notItems",
          title: "What we do not promise",
          description:
            "The riskiest block on the page and the reason it works. Every one of these a partner finds out for themselves in the second week; reading it here is what separates the first email from a lead exchange's. Do not soften them.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                stringField("title", "In a word", { max: 60 }),
                textField("body", "Why", { max: 300 }),
              ],
              preview: { select: { title: "title", subtitle: "body" } },
            },
          ],
          validation: (Rule) => Rule.required().min(3).max(6),
        }),
        stringField("yesLabel", "«We do promise» label", { max: 40 }),
        defineField({
          name: "yesItems",
          title: "What we do promise",
          description:
            "These are commitments, not features. Each one is checkable, and each one costs us something — which is what makes the block above credible rather than merely modest.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                stringField("title", "In a word", { max: 60 }),
                textField("body", "What exactly", { max: 300 }),
              ],
              preview: { select: { title: "title", subtitle: "body" } },
            },
          ],
          validation: (Rule) => Rule.required().min(2).max(4),
        }),
      ],
    ),

    // --- 05 -----------------------------------------------------------------
    sectionField(
      "contact",
      "05. Now our question",
      "Questions and the reply form inside ONE frame: the third question is the prompt for the free-text field, so it has to stay beside the form rather than scroll away above it.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Intro", {
          description:
            "Says why there is no price here. This is the sentence the whole page has been building towards — it turns a missing price from an omission into a position.",
          max: 400,
        }),
        defineField({
          name: "questions",
          title: "The questions",
          description:
            "What the first outbound wave exists to find out. Two to four; the last one should be the one that needs a paragraph, because it is what the free-text field below is for.",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.required().min(2).max(4),
        }),
        stringField("jurisdictionLabel", "«Jurisdiction» label", { max: 60 }),
        stringField("severalLabel", "«Several» option", {
          description:
            "The five jurisdictions come from the registry. This is the extra option for a firm covering more than one.",
          max: 40,
        }),
        stringField("orgLabel", "«Type of organisation» label", {
          description:
            "Not cosmetic. Paying a lawyer per referred client is prohibited in Malta and criminal in the UAE, while relocation agencies, developers and estate agents fall outside the bar codes entirely — so the conversation differs by answer from the first email.",
          max: 60,
        }),
        defineField({
          name: "orgOptions",
          title: "Types of organisation",
          description:
            "Labels only; the values the server accepts are fixed in src/app/api/enquiry/route.ts. Changing the wording here is safe, adding an option is not — add it there first.",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.required().length(4),
        }),
        stringField("nameLabel", "«Name» label", { max: 40 }),
        stringField("emailLabel", "«Email» label", { max: 40 }),
        stringField("termsLabel", "Free-text label", { max: 120 }),
        stringField("honeypotLabel", "Spam-trap field label", {
              // Do NOT reword this to "Company", "Organisation" or anything a
              // browser recognises as an address field: autofill will fill the
              // trap and a real person gets silently rejected. It happened.
          description:
            "Hidden from sight but read aloud by screen readers, which is why it says to leave it empty.",
          max: 60,
        }),
        stringField("submitLabel", "Submit button", { max: 40 }),
        textField("fine", "Fine print", {
          description:
            "Response time, that the answer commits them to nothing and is not published, and that we give no legal advice. All three matter to a lawyer deciding whether to reply.",
          max: 400,
        }),
        stringField("sentTitle", "Sent — title", { max: 40 }),
        textField("sentBody", "Sent — body", { max: 300 }),
        // See the note on homePage.ts: a failure that is OUR fault must not be
        // reported as the visitor's mistake.
        stringField("brokeTitle", "Our fault — title", { max: 40 }),
        textField("brokeBody", "Our fault — body", { max: 300 }),
        stringField("failedTitle", "Failed — title", { max: 40 }),
        textField("failedBody", "Failed — body", { max: 300 }),
      ],
    ),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (Rule) => Rule.required(),
    }),
    languageField(),
  ],
  preview: {
    select: { title: "hero.heading", language: "language" },
    prepare({ title, language }) {
      return {
        title: title ?? "For partners",
        subtitle: String(language ?? "").toUpperCase(),
      };
    },
  },
});
