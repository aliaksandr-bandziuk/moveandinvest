import { defineField, defineType } from "sanity";
import { sectionField, stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language. Document id convention: homePage-en,
// homePage-ru, homePage-pl (see src/sanity/structure.ts). Translations are
// handled by @sanity/document-internationalization — `language` at the
// bottom is written by the plugin, never by hand.
//
// STRUCTURE: one object field per section rendered by
// src/app/[locale]/page.tsx, in page order, titled with the number that
// section shows in its own eyebrow. No field groups, no tabs, no section
// builder — the page has a fixed composition, and an editor should be able
// to scroll this document alongside the live page and see the same order.
//
// Every string a visitor can read now lives here. That was not true before:
// five of the eight sections had no fields at all and their copy sat in
// messages/<locale>.json, so fixing a typo in "Порог входа — это не цена"
// needed a deploy. The message catalogues keep only what is genuinely not
// editorial — see CLAUDE.md.
//
// Three things worth knowing before editing:
//
//  * Fields called `template` contain {placeholders} filled in by the
//    browser. Keep every brace exactly as it is; delete one and the sentence
//    renders with a hole in it. They are plain strings here, NOT ICU
//    messages — moving them out of next-intl is what removed a whole class
//    of FORMATTING_ERROR failures.
//  * The option labels in section 08 are labels only. The values the server
//    accepts are a fixed allow-list in src/app/api/enquiry/route.ts, so
//    rewording a label here is safe and the wording is all a person sees.
//  * Nothing here states a price or a payment model. See the note at the top
//    of partnersPage.ts for why, including the Malta/UAE constraint.
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    // --- 01 -----------------------------------------------------------------
    sectionField(
      "hero",
      "01. Hero and comparison table",
      "The black plane at the top and the table butted straight underneath it. One component on the page, so one section here.",
      [
        stringField("eyebrow", "Eyebrow", {
          description: "Small uppercase line above the headline.",
          max: 40,
          required: false,
        }),
        stringField("updatedLabel", "Updated label", {
          description:
            "Mono line next to the eyebrow, e.g. «Обновлено 15 авг 2026». Change it when the figures change, not on a schedule.",
          max: 40,
        }),
        stringField("heading", "Headline", { max: 90 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        defineField({
          name: "primaryCta",
          title: "Primary call to action",
          type: "cta",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "secondaryCta",
          title: "Secondary call to action",
          description: "Usually the partner page.",
          type: "cta",
        }),
        stringField("contentsLabel", "Contents label", {
          description:
            "Heads the list of sections beside the headline, e.g. «На этой странице». The list itself is generated from the eyebrow of every section below — rename a section there and the contents follow.",
          max: 40,
        }),
        stringField("tableEyebrow", "Table eyebrow", {
          description:
            "The small uppercase line above the table heading. The block is section 01 and carries the same head as 02–08.",
          max: 40,
        }),
        stringField("tableHeading", "Table heading", { max: 80 }),
        textField("tableIntro", "Table deck", {
          description:
            "The right half of section 01's head. A paragraph, four to seven lines.",
          max: 500,
          rows: 5,
        }),
        stringField("tableDetailLabel", "Full-comparison label", {
          description:
            "Mono label between the threshold summary and the table itself, e.g. «Полное сравнение».",
          max: 40,
        }),
        stringField("tableScrollHint", "Scroll hint", {
          description:
            "Shown under the table on phones only, where two columns sit off-screen. Name the columns — «ещё две колонки» alone does not say which.",
          max: 60,
        }),
        defineField({
          name: "columns",
          title: "Table column headers",
          description:
            "Five, in the order the table renders them. Kept short: these are column heads, not sentences.",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("jurisdiction", "Jurisdiction", { max: 30 }),
            stringField("route", "Route", { max: 30 }),
            stringField("minimumInvestment", "Minimum investment", { max: 30 }),
            stringField("timeToPermit", "Time to first permit", { max: 30 }),
            stringField("taxRegime", "Tax regime", { max: 30 }),
          ],
        }),
        textField("sourcePending", "Source note fallback", {
          description:
            "Shown under the table until at least one jurisdiction page carries a checked source note of its own.",
          max: 200,
          rows: 2,
        }),
        stringField("pendingLabel", "Pending label", {
          description:
            "Shown instead of the table while no jurisdiction has published figures.",
          max: 40,
        }),
        textField("pendingNote", "Pending note", { max: 400 }),
      ],
    ),

    // --- 02 -----------------------------------------------------------------
    sectionField(
      "method",
      "02. How the comparison is built",
      "Where the numbers come from and how the site is paid — the two questions that decide whether a reader trusts the table above.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        defineField({
          name: "points",
          title: "Points",
          description: "Three to five.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                stringField("title", "Title", { max: 60 }),
                textField("body", "Body", { max: 280 }),
              ],
              preview: { select: { title: "title", subtitle: "body" } },
            },
          ],
          validation: (Rule) => Rule.required().min(3).max(5),
        }),
      ],
    ),

    // --- 03 -----------------------------------------------------------------
    sectionField(
      "map",
      "03. Jurisdictions",
      "The five jurisdictions as cards on the black plane. Names, thresholds, permit times and tax regimes all come from the registry — this section holds only the head and the note under it.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        textField("note", "Note under the cards", {
          description:
            "Keep both sentences. The first says the outlines are not to scale — Malta is drawn as large as Portugal — and the second says the borders are simplified. A drawn country is a political statement whether or not anyone meant it to be.",
          max: 300,
        }),
      ],
    ),

    // --- 04 -----------------------------------------------------------------
    sectionField(
      "cost",
      "04. What the entry threshold leaves out",
      "The bars comparing the advertised threshold against the real first-year cost. The figures themselves live on each jurisdiction page.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        stringField("advertisedLabel", "«Advertised» label", { max: 40 }),
        stringField("extrasLabel", "«Everything else» label", { max: 40 }),
        stringField("realLabel", "«Real, first year» label", { max: 40 }),
        stringField("noteLabel", "Label beside the note", {
          description:
            "Hung in the left margin next to the source note, e.g. «Источники». A note that shows its grid reads as an apparatus rather than as leftover text.",
          max: 30,
        }),
        textField("note", "Note under the bars", {
          description:
            "Says how the figures were converted and when they were checked. Do not remove — it is what separates this block from a brochure.",
          max: 400,
        }),
      ],
    ),

    // --- 05 -----------------------------------------------------------------
    sectionField(
      "routeFinder",
      "05. Route finder",
      "Three questions answered in the browser, nothing sent anywhere. The result sentences use {placeholders} — keep every brace.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        defineField({
          name: "questions",
          title: "The three questions",
          description:
            "Legend and answer options for each. The VALUES behind the options are fixed in code — these are the words a reader sees.",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({
              name: "budget",
              title: "01. Budget",
              type: "object",
              fields: [
                stringField("legend", "Question", { max: 60 }),
                stringField("upTo500", "Up to €500,000", { max: 40 }),
                stringField("upTo800", "Up to €800,000", { max: 40 }),
                stringField("any", "Over €500,000", { max: 40 }),
              ],
            }),
            defineField({
              name: "speed",
              title: "02. Speed",
              type: "object",
              fields: [
                stringField("legend", "Question", { max: 60 }),
                stringField("fast", "Within a few weeks", { max: 40 }),
                stringField("half", "Within six months", { max: 40 }),
                stringField("any", "A year or more, no rush", { max: 40 }),
              ],
            }),
            defineField({
              name: "priority",
              title: "03. Priority",
              type: "object",
              fields: [
                stringField("legend", "Question", { max: 60 }),
                stringField("passport", "Route to an EU passport", { max: 40 }),
                stringField("tax", "Tax position", { max: 40 }),
                stringField("speed", "Speed and least paperwork", { max: 40 }),
              ],
            }),
          ],
        }),
        textField("placeholder", "Empty-state text", {
          description: "Shown in the summary panel before the first answer.",
          max: 300,
        }),
        stringField("ctaLabel", "Result button label", { max: 40 }),
        defineField({
          name: "rows",
          title: "Summary row labels",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("advertised", "Threshold", { max: 40 }),
            stringField("extras", "On top, first year", { max: 40 }),
            stringField("real", "Real, first year", { max: 40 }),
            stringField("permit", "First permit", { max: 40 }),
            stringField("tax", "Tax", { max: 40 }),
          ],
        }),
        defineField({
          name: "templates",
          title: "Result sentences",
          description:
            "Each contains {placeholders} the browser fills in: {n} and {total} are counts, {relax} is what would have to give, {names} is a list of jurisdictions. Keep the braces exactly as written.",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("count", "Count line — uses {n} and {total}", { max: 80 }),
            stringField("compromise", "Compromise line — uses {relax}", { max: 160 }),
            stringField("cutBudget", "Cut by budget — uses {names}", { max: 160 }),
            stringField("cutSpeed", "Cut by speed — uses {names}", { max: 160 }),
            stringField("cutPriority", "Cut by priority — uses {names}", { max: 160 }),
          ],
        }),
        defineField({
          name: "relaxWords",
          title: "Words used inside {relax}",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("budget", "Budget", { max: 30 }),
            stringField("speed", "Speed", { max: 30 }),
            stringField("priority", "Priority", { max: 30 }),
          ],
        }),
        stringField("pending", "Pending jurisdiction note", { max: 120 }),
        stringField("unverified", "«Not verified» chip", { max: 30 }),
      ],
    ),

    // --- 06 -----------------------------------------------------------------
    sectionField(
      "faq",
      "06. Frequently asked questions",
      "The questions and answers are separate documents (FAQ item). Only the wrapper copy is here.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 90 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        stringField("allLabel", "«All» filter chip", { max: 30 }),
        stringField("filterLegend", "Filter legend", {
          description:
            "Announced by screen readers to explain what the chips do. Not shown visually.",
          max: 80,
        }),
        stringField("countTemplate", "Count line — uses {n} and {total}", {
          description: "Keep both braces.",
          max: 200,
        }),
        textField("note", "Note under the questions", {
          description: "Keep the line saying none of this is legal advice.",
          max: 300,
        }),
      ],
    ),

    // --- 07 -----------------------------------------------------------------
    sectionField(
      "partnerTeaser",
      "07. For partners (teaser)",
      "The one block on this page addressed to somebody other than the reader. The full page is a separate document.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("body", "Body", { max: 320 }),
        stringField("ctaLabel", "Link label", { max: 40 }),
        stringField("qualifiersLabel", "Qualifier list label", { max: 60 }),
        defineField({
          name: "qualifiers",
          title: "What an enquiry has already answered",
          description:
            "One word each. The list IS the count — never write the number in the prose above, it goes stale the moment the form grows a question.",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.required().min(3).max(6),
        }),
      ],
    ),

    // --- 08 -----------------------------------------------------------------
    sectionField(
      "enquiry",
      "08. Enquiry form",
      "The page's one loud call to action. Labels only — the values the server accepts are fixed in code.",
      [
        stringField("eyebrow", "Eyebrow", { max: 40 }),
        stringField("heading", "Heading", { max: 80 }),
        textField("intro", "Deck", {
          description:
            "The right half of the section head. A PARAGRAPH, four to seven lines — the layout gives it a full column and a single clause looks lost in it. Say what the section is for and what it does not claim.",
          max: 500,
          rows: 5,
        }),
        defineField({
          name: "fork",
          title: "The two cards at the top",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("chosenLabel", "«Country chosen» label", { max: 40 }),
            textField("chosenBody", "«Country chosen» body", { max: 160, rows: 2 }),
            stringField("openLabel", "«Not yet» label", { max: 40 }),
            textField("openBody", "«Not yet» body", { max: 160, rows: 2 }),
            stringField("undecidedOption", "«Undecided» option", { max: 40 }),
            stringField("otherOption", "«Another country» option", { max: 40 }),
          ],
        }),
        defineField({
          name: "budget",
          title: "Budget question",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("label", "Question", { max: 60 }),
            stringField("upTo500", "Up to €500,000", { max: 40 }),
            stringField("upTo800", "Up to €800,000", { max: 40 }),
            stringField("over800", "Over €800,000", { max: 40 }),
            stringField("unknown", "Don't know yet", { max: 40 }),
          ],
        }),
        defineField({
          name: "timeline",
          title: "Timeline question",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("label", "Question", { max: 60 }),
            stringField("fast", "Within a few weeks", { max: 40 }),
            stringField("halfYear", "Within six months", { max: 40 }),
            stringField("year", "A year or more", { max: 40 }),
            stringField("browsing", "Just looking", { max: 40 }),
          ],
        }),
        defineField({
          name: "goals",
          title: "Goals question",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("label", "Question", { max: 60 }),
            stringField("hint", "Hint under the question", { max: 160 }),
            stringField("residency", "Residency for the family", { max: 40 }),
            stringField("tax", "Tax position", { max: 40 }),
            stringField("passport", "EU passport in time", { max: 40 }),
            stringField("business", "Business and banking", { max: 40 }),
            stringField("property", "Property as an investment", { max: 40 }),
          ],
        }),
        defineField({
          name: "contact",
          title: "Situation and contact",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("situationLabel", "«Your situation» label", { max: 60 }),
            textField("situationHint", "«Your situation» hint", { max: 200, rows: 2 }),
            stringField("contactLabel", "«How to reach you» label", { max: 60 }),
            stringField("nameLabel", "Name", { max: 40 }),
            stringField("emailLabel", "Email", { max: 40 }),
            stringField("consentLabel", "Consent checkbox", {
              description:
                "The enquiry is passed to nobody unless this is ticked. Keep it explicit about what the reader is agreeing to.",
              max: 160,
            }),
            stringField("honeypotLabel", "Spam-trap field label", {
              // Do NOT reword this to "Company", "Organisation" or anything a
              // browser recognises as an address field: autofill will fill the
              // trap and a real person gets silently rejected. It happened.
              description:
                "Hidden from sight but read aloud by screen readers, which is why it says to leave it empty.",
              max: 60,
            }),
            stringField("submitLabel", "Submit button", { max: 40 }),
          ],
        }),
        stringField("privacyLabel", "Privacy link label", {
          description:
            "The link on the fine-print line, beside the consent box. It points at /privacy — the path lives in the component, only the words are here. Consent that cannot be read before it is given is not informed consent, so this link is not optional.",
          max: 60,
        }),
        textField("fine", "Fine print under the button", {
          description:
            "Response time, who the enquiry goes to, and how to have the data deleted. All three are promises — do not soften them without meaning it.",
          max: 500,
          rows: 4,
        }),
        defineField({
          name: "result",
          title: "After submitting",
          type: "object",
          options: { collapsible: true, collapsed: true },
          fields: [
            stringField("sentTitle", "Sent — title", { max: 40 }),
            textField("sentBody", "Sent — body", { max: 300 }),
            stringField("failedTitle", "Failed — title", { max: 40 }),
            textField("failedBody", "Failed — body", { max: 300 }),
            // A THIRD state, and the distinction is not cosmetic. "Failed"
            // names something the visitor can fix. This one is shown when the
            // fault is ours — the enquiry could not be stored, or the address
            // was rate limited — and telling that person to check their own
            // email address is both false and the surest way to lose them.
            stringField("brokeTitle", "Our fault — title", { max: 40 }),
            textField("brokeBody", "Our fault — body", { max: 300 }),
          ],
        }),
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
        title: title ?? "Home page",
        subtitle: String(language ?? "").toUpperCase(),
      };
    },
  },
});
