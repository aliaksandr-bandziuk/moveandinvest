import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: contactsPage-en, contactsPage-ru, contactsPage-pl.
//
// WHAT IS NOT IN THIS SCHEMA: the channels themselves. The phone number, the
// WhatsApp number, the booking URL and the social profiles live in
// src/lib/contactChannels.ts, in code, and an empty value there means the
// channel does not render at all.
//
// That is deliberate and it is the lesson of two earlier defects. This site has
// twice printed a way to reach it that reached nobody — `partners@` on the
// partners page and `hello@` on the broken-form panels, neither of which was a
// mailbox. A number typed into a CMS field is a number that exists on the page
// and nowhere else: not in the ContactPoint in the JSON-LD, not in the footer,
// and not in whatever names it next. One definition, read by everything, is the
// only arrangement that cannot drift.
//
// So the editable part here is LABELS AND EXPLANATIONS — what each channel is
// for and when it is answered — which is prose, and prose should not need a
// deploy.
export const contactsPage = defineType({
  name: "contactsPage",
  title: "Contact",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "channels", title: "Channel labels" },
    { name: "form", title: "The question form" },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40 }),
    stringField("heading", "Headline", { max: 90 }),
    textField("intro", "Deck", {
      description:
        "MUST ROUTE THE READER. Somebody who wants an introduction to a partner belongs in the enquiry form, not in this mailbox — say so here rather than letting them find out after writing. Four to seven lines.",
      max: 600,
      rows: 6,
    }),

    stringField("channelsLabel", "Channels: section label", { max: 40, group: "channels" }),
    stringField("emailLabel", "Email: label", { max: 40, group: "channels" }),
    stringField("emailNote", "Email: when it is answered", { max: 120, group: "channels" }),
    stringField("phoneLabel", "Phone: label", { max: 40, group: "channels" }),
    stringField("phoneNote", "Phone: when it is answered", {
      description:
        "State the hours and the timezone. A number with no stated hours is a number somebody rings at midnight and concludes nobody is there.",
      max: 160,
      group: "channels",
    }),
    stringField("whatsappLabel", "WhatsApp: label", { max: 40, group: "channels" }),
    stringField("whatsappNote", "WhatsApp: note", { max: 120, group: "channels" }),
    stringField("bookingLabel", "Call: label", { max: 40, group: "channels" }),
    stringField("bookingNote", "Call: what it is", {
      description: "Length, price and what is NOT going to happen on it.",
      max: 160,
      group: "channels",
    }),
    stringField("bookingCta", "Call: link text", { max: 40, group: "channels" }),
    stringField("socialsLabel", "Socials: section label", { max: 40, group: "channels" }),

    stringField("formHeading", "Form: heading", { max: 60, group: "form" }),
    textField("formBody", "Form: what it is for", {
      description:
        "Say plainly that this is not the enquiry form and that nothing written here is passed to a partner.",
      max: 400,
      rows: 4,
      group: "form",
    }),
    stringField("nameLabel", "Form: name label", { max: 40, group: "form" }),
    stringField("emailFieldLabel", "Form: email label", { max: 40, group: "form" }),
    stringField("emailPlaceholder", "Form: email placeholder", { max: 40, group: "form" }),
    stringField("messageLabel", "Form: question label", { max: 60, group: "form" }),
    stringField("honeypotLabel", "Form: honeypot label", { max: 60, group: "form" }),
    stringField("submitLabel", "Form: button", { max: 30, group: "form" }),
    stringField("fine", "Form: fine print", { max: 160, group: "form" }),
    stringField("privacyLabel", "Form: privacy link text", { max: 60, group: "form" }),

    defineField({
      name: "sent",
      title: "Form: sent panel",
      type: "object",
      group: "form",
      options: { collapsible: true, collapsed: true },
      fields: [stringField("title", "Title", { max: 60 }), textField("body", "Body", { max: 240 })],
    }),
    defineField({
      name: "error",
      title: "Form: error panel",
      type: "object",
      group: "form",
      options: { collapsible: true, collapsed: true },
      fields: [stringField("title", "Title", { max: 60 }), textField("body", "Body", { max: 240 })],
    }),
    defineField({
      name: "broke",
      title: "Form: our-fault panel",
      type: "object",
      group: "form",
      options: { collapsible: true, collapsed: true },
      description:
        "Keep the {email} placeholder in the body. It is filled from the one address the project has — typing an address here is how a second one appears.",
      fields: [stringField("title", "Title", { max: 60 }), textField("body", "Body", { max: 240 })],
    }),

    stringField("enquiryLead", "Enquiry pointer: line", { max: 120 }),
    stringField("enquiryCta", "Enquiry pointer: link text", { max: 60 }),
    stringField("identityLabel", "Legal identity: label", {
      description:
        "Only the label. The name, legal form and tax number come from src/lib/controller.ts — a legal identity reworded per locale in a CMS is one that will eventually be wrong in one of them.",
      max: 60,
    }),

    defineField({ name: "seo", title: "SEO", type: "seo", group: "meta" }),
    languageField(),
  ],
  preview: { select: { title: "heading", subtitle: "language" } },
});
