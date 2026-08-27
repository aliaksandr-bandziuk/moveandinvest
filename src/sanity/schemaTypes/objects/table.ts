import { defineArrayMember, defineField, defineType } from "sanity";

// A table inside an article body.
//
// WHY THE BODY NEEDED ONE. The first Guides & Research article carries five
// tables — thresholds by zone, cost on top of the threshold, advertised against
// actual timelines. Those are the parts a reader screenshots, and every one of
// them is a comparison across a fixed set of columns. Written as prose they
// stop being comparable, which is the one property the whole site is for.
//
// ROWS OF STRINGS, NOT RICH TEXT IN A CELL. A cell here holds a threshold, a
// date or a short phrase; allowing marks and links inside one would make the
// table a second place where a source can be cited, and this site has exactly
// one — the line under the standfirst. Keeping cells plain also keeps them
// extractable: an answer engine quoting a row gets the row, not markup.
//
// THE FIRST ROW IS THE HEADER, always, and there is no switch to say otherwise.
// A table whose header is optional is a table that renders without one by
// accident, and a comparison with no column names is not a comparison.
export const table = defineType({
  name: "table",
  title: "Table",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "Caption",
      description:
        "Optional, shown above the table. Say what is being compared, not that a table follows.",
      type: "string",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      description:
        "The first row is the header. Every row must have the same number of cells as the header — a short row would silently shift every value after it into the wrong column.",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          type: "object",
          fields: [
            defineField({
              name: "cells",
              title: "Cells",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare({ cells }) {
              return { title: (cells ?? []).join(" · ").slice(0, 80) };
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(2)
          .custom((rows) => {
            if (!Array.isArray(rows) || rows.length === 0) return true;
            const header = (rows[0] as { cells?: unknown[] })?.cells ?? [];
            const width = header.length;
            // RAGGED ROWS ARE REJECTED AT PUBLISH. A row one cell short does not
            // look broken in the Studio — it looks like a row — and on the page
            // it shifts every value after the gap one column to the left. That
            // is a table that states the wrong number without ever looking
            // wrong, which is the failure this whole site is built against.
            const bad = rows.findIndex(
              (row) => ((row as { cells?: unknown[] })?.cells ?? []).length !== width,
            );
            return bad === -1
              ? true
              : `Row ${bad + 1} has a different number of cells than the header (${width}).`;
          }),
    }),
  ],
  preview: {
    select: { caption: "caption", rows: "rows" },
    prepare({ caption, rows }) {
      const count = Array.isArray(rows) ? rows.length : 0;
      return {
        title: caption || "Table",
        subtitle: `${count} row${count === 1 ? "" : "s"}`,
      };
    },
  },
});
