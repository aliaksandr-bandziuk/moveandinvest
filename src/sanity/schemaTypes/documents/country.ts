import { defineField, defineType } from "sanity";

// The jurisdiction registry. Deliberately NOT translatable, and deliberately
// not a page.
//
// Everything here is language-neutral: an ISO code, a chip colour, a sort
// order, a launch status. If this type were registered with
// @sanity/document-internationalization, every one of those values would be
// duplicated per locale and would drift — Greece would end up teal in
// English and green in Russian the first time someone edited one side.
//
// Translatable copy (hero, body, facts, meta) lives on `countryPage`, which
// references a country. One country -> N country pages, one per locale.
//
// The chip colour lives here rather than in _tokens.scss so that adding a
// sixth jurisdiction is a Studio edit, not a front-end deploy. The token
// file keeps the five current values only as a rendering fallback.
export const country = defineType({
  name: "country",
  title: "Jurisdiction",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      description:
        "English name, used in Studio lists and as the fallback label. Translated labels come from the country page.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "code",
      title: "ISO code",
      description: "Two-letter ISO 3166-1 code, lowercase: pt, gr, cy, mt, ae.",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .lowercase()
          .length(2)
          .error("Exactly two lowercase letters, e.g. pt."),
    }),
    defineField({
      name: "accentColor",
      title: "Chip colour",
      description:
        "Hex value used for this jurisdiction's chip in navigation and comparison tables. Must read at 3:1 or better against the page background (#F6F7F9) — it is a non-text UI mark.",
      type: "string",
      initialValue: "#59637a",
      validation: (Rule) =>
        Rule.required()
          .regex(/^#[0-9a-f]{6}$/, {
            name: "hex",
            invert: false,
          })
          .error("Lowercase six-digit hex, e.g. #2e6f5e."),
    }),
    defineField({
      name: "status",
      title: "Status",
      description:
        "Planned jurisdictions render as a dimmed chip with no link. Paused ones disappear from navigation but keep their pages reachable by direct URL.",
      type: "string",
      options: {
        list: [
          { title: "Live", value: "live" },
          { title: "Planned", value: "planned" },
          { title: "Paused", value: "paused" },
        ],
        layout: "radio",
      },
      initialValue: "planned",
      validation: (Rule) => Rule.required(),
    }),
    // --- Route finder inputs (section 05) -----------------------------------
    // The finder asks three questions. One of them is answered from data that
    // already exists: the budget ceiling is checked against
    // costAdvertisedEur + costExtrasEur on the country page, which is the
    // whole payoff of section 04 — the finder filters on the REAL number, not
    // on the advertised one.
    //
    // The other two cannot be derived. "3–6 weeks" is a free string written
    // per locale, so parsing it would mean parsing three languages; and what
    // a jurisdiction is comparatively good FOR is an editorial judgement, not
    // a fact in any field. Hence these two, here rather than on countryPage:
    // both are language-neutral, and a route that slows down should be a
    // Studio edit, not a deploy.
    //
    // Both are optional on purpose. A jurisdiction missing either one gets
    // the benefit of the doubt from the finder rather than being filtered
    // out — the site never silently drops a jurisdiction for want of a field.
    defineField({
      name: "speedBand",
      title: "Speed band",
      description:
        "Which deadline this route can meet. Cumulative: a 'weeks' route also satisfies a reader who said 'within six months'.",
      type: "string",
      options: {
        list: [
          { title: "Weeks — first permit in under two months", value: "weeks" },
          { title: "Months — two to six months", value: "months" },
          { title: "Long — six months or more", value: "long" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "strengths",
      title: "Comparative strengths",
      description:
        "What this jurisdiction is better at than the others — not everything it offers. Every route has a tax regime; tick 'Tax position' only where it is a reason to choose this one over the rest. A strength ticked on all five stops discriminating and makes the third question useless.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Path to an EU passport", value: "passport" },
          { title: "Tax position", value: "tax" },
          { title: "Speed and minimal paperwork", value: "speed" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Sort order",
      description:
        "Position in navigation and in every comparison table. Lower first.",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  orderings: [
    {
      name: "byOrder",
      title: "Sort order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", code: "code", status: "status", color: "accentColor" },
    prepare({ title, code, status, color }) {
      return {
        title,
        subtitle: `${String(code ?? "").toUpperCase()} · ${status} · ${color}`,
      };
    },
  },
});
