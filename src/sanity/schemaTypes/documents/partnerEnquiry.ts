import { defineField, defineType } from "sanity";

// A reply from a firm to the question on /for-partners (section 05).
//
// SAME PRIVATE DATASET as `enquiry`, and for the same reason: this document
// holds a person's name and email. The content dataset is public, and
// `*[_type == "partnerEnquiry"]` over the public API would hand out every
// contact a partner ever gave us. Never register this type in the content
// workspace.
//
// Kept as its own type rather than a flag on `enquiry` because the two have
// almost no fields in common and mean opposite things: one is a person asking
// for help, the other is a firm quoting terms. Merging them would make every
// field on both optional and every list in the Studio a mixture.
//
// readOnly for the same reason as `enquiry` — a submission is a record of
// what somebody actually sent, and editing it turns a record into a note.
// Deletion stays enabled for erasure requests.
export const partnerEnquiry = defineType({
  name: "partnerEnquiry",
  title: "Partner reply",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "submittedAt", title: "Submitted", type: "datetime" }),
    defineField({
      name: "locale",
      title: "Site language",
      type: "string",
    }),
    defineField({
      name: "jurisdiction",
      title: "Jurisdiction",
      description:
        "One of the five ISO codes, or 'several' for a firm covering more than one.",
      type: "string",
    }),
    defineField({
      name: "organisation",
      title: "Type of organisation",
      description:
        "law-firm / relocation / developer / estate-agent. This decides how the conversation goes: paying a lawyer per referred client is prohibited in Malta and criminal in the UAE, while the other three sit outside the bar codes entirely.",
      type: "string",
    }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({
      name: "terms",
      title: "Their terms, in their own words",
      description:
        "The whole point of the form. Whatever a firm writes here is the answer the first outbound wave was sent to get.",
      type: "text",
      rows: 10,
    }),
  ],
  preview: {
    select: { title: "email", subtitle: "organisation", date: "submittedAt" },
    prepare({ title, subtitle, date }) {
      const day = typeof date === "string" ? date.slice(0, 10) : "";
      return {
        title: title ?? "Partner reply",
        subtitle: [subtitle, day].filter(Boolean).join(" · "),
      };
    },
  },
});
