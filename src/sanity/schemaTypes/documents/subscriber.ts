import { defineField, defineType } from "sanity";

// One address on the change list.
//
// SAME PRIVATE DATASET AND THE SAME RULE as `enquiry`: never register this
// type in the content workspace. A public dataset is readable by anyone with
// the project id, and `*[_type == "subscriber"]` would hand out the whole
// mailing list.
//
// It is the smallest document on the site and stays that way. The address, the
// jurisdictions the person asked about, the language they were reading and the
// time — nothing else. There is no name field, no page history and no link to
// an enquiry, because the consent given here covers one thing: sending an
// email when a rule changes. Joining this to an enquiry from the same address
// would use one consent to enrich a record collected under another, which is
// exactly what the privacy policy says does not happen.
//
// readOnly, like the enquiry: a subscription is a record of what somebody
// asked for. Deletion stays enabled — unsubscribing is a right, and it has to
// be one click rather than a support ticket.
export const subscriber = defineType({
  name: "subscriber",
  title: "Change-list subscriber",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "submittedAt",
      title: "Subscribed",
      type: "datetime",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "jurisdictions",
      title: "Jurisdictions",
      description:
        "ISO codes the person asked to be told about. EMPTY MEANS ALL FIVE — the form says so, and a reader who ticks nothing is subscribing to everything rather than to nothing.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "locale",
      title: "Site language",
      description: "Which language version they were reading. Decides which language we write in.",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "email", subtitle: "submittedAt" },
  },
});
