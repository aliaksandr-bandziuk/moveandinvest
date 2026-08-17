import { defineField, defineType } from "sanity";

// A submitted enquiry from the home page's form (section 08).
//
// THIS TYPE LIVES IN A SEPARATE, PRIVATE DATASET. That is not a preference,
// it is the whole reason this file exists as its own workspace: the content
// dataset is public, and a public Sanity dataset is readable by anyone who
// knows the project id — `*[_type == "enquiry"]` over the public API would
// hand out every name, email and personal circumstance the form ever
// collected. Never register this type in the content workspace.
//
// Every field is readOnly in the Studio. An enquiry is a record of what
// somebody actually sent; editing it turns a record into a note. Deletion is
// deliberately left enabled — under GDPR a person can ask for their data to
// be erased, and that has to be one click, not a support ticket.
export const enquiry = defineType({
  name: "enquiry",
  title: "Enquiry",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "submittedAt",
      title: "Submitted",
      type: "datetime",
    }),
    defineField({
      name: "locale",
      title: "Site language",
      description: "Which language version the form was filled in.",
      type: "string",
    }),
    defineField({
      name: "where",
      title: "Jurisdiction",
      description:
        "One of the five ISO codes, or 'undecided' / 'other'. The two latter values are the point of the block — an enquiry from someone who has not chosen yet is a lead, not a gap.",
      type: "string",
    }),
    defineField({ name: "budget", title: "Budget ceiling", type: "string" }),
    defineField({ name: "timeline", title: "Timeline", type: "string" }),
    defineField({
      name: "goals",
      title: "Goals",
      description: "Multi-select: what they are actually buying.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "situation",
      title: "Their own words",
      description:
        "The free-text field. Usually the most useful thing in the document — the four selects above are what fits in a select.",
      type: "text",
      rows: 8,
    }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({
      name: "consentToShare",
      title: "Consented to being passed to a partner",
      description:
        "False means this enquiry must NOT be forwarded to anyone. Answer it directly or not at all.",
      type: "boolean",
    }),
  ],
  orderings: [
    {
      name: "newest",
      title: "Newest first",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      where: "where",
      submittedAt: "submittedAt",
      consent: "consentToShare",
    },
    prepare({ name, email, where, submittedAt, consent }) {
      const date = submittedAt ? String(submittedAt).slice(0, 10) : "?";
      return {
        title: `${name ?? "no name"} · ${email ?? "no email"}`,
        subtitle: `${date} · ${String(where ?? "?").toUpperCase()}${consent ? "" : " · NO CONSENT TO SHARE"}`,
      };
    },
  },
});
