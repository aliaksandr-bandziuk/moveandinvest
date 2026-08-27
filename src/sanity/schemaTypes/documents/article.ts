import { defineArrayMember, defineField, defineType } from "sanity";
import { SlugLockedAfterPublish } from "../../components/SlugLockedAfterPublish";
import { languageField } from "../lib/languageField";
import { SOURCE_SECTION_OPTIONS } from "../lib/sourceSections";
import { CATEGORY_OPTIONS } from "../../../lib/categories";

// One entry in Guides & Research, one per language. The listing at /blog and the entry at
// /blog/<slug>.
//
// WHAT THIS TYPE DOES NOT HAVE, and each omission is a decision rather than a
// gap. The sibling project's article type carries a seven-way taxonomy with a
// custom validator, a second independent category used only for filter chips,
// WordPress's imported excerpt and its eighty-six tags. That type is shaped by
// four hundred and sixty-eight documents. This one started at two, and tags and
// filter chips are still absent for that reason.
//
// ONE CATEGORY ARRIVED ON 27 AUGUST 2026, and the note that used to stand here
// said categories were absent too. That note was arguing against a FILTER over
// two entries, which is furniture, and it wrongly took a label down with it: a
// category is how a reader decides what to read next, and the person working
// out what a route costs is not the person tracking what changed in a statute.
// See lib/categories.ts for the six and for why they have no pages of their own
// yet.
//
// WHAT IT HAS THAT THEIRS DOES NOT is `sources`, and it is required. Every
// other page on this site can trace a figure it states to the instrument that
// says so: /faq throws at import time if an answer states a number and names no
// section, and /sources is the section list itself. An article is prose about
// thresholds, fees and deadlines — exactly the material that goes stale — so
// the same rule has to reach it. A dataset cannot run the module-level guard
// faqData.ts uses, but it can refuse to publish, which is the same rule
// enforced at the only other moment that matters.
//
// THE SLUG LOCKS ON PUBLISH, same component the jurisdiction pages use. This
// site has already paid once for moving live URLs; an entry that has been
// published has been linked.
export const article = defineType({
  name: "article",
  title: "Guides & Research entry",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description:
        "The entry's own H1. Say what changed or what the piece establishes — “Greece raised the property threshold in three of its zones” beats “Greece update”, which makes a reader open the page to find out whether it concerns them. Bind an amount to its currency with a non-breaking space (800 000 €): rendered at 390px, a headline broke between the number and the euro sign and left the symbol alone on its own line.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().max(110),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "Translated per language, like the jurisdiction pages. Locked once this entry has been published — see the note on the field.",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (Rule) => Rule.required(),
      components: { input: SlugLockedAfterPublish },
    }),
    defineField({
      name: "publishedAt",
      title: "Published",
      description:
        "The date the entry is dated on the site, and the order the listing uses. It is shown, not hidden: a reader deciding whether a threshold still applies needs to know when this was written.",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      description:
        "Two or three sentences under the title, and the only summary there is — it heads the entry, fills the listing card and feeds the meta description if SEO is left empty. Written, not truncated from the body.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "category",
      title: "Category",
      description:
        "What the entry is about. One, required — an entry that belongs in three lists is an entry nobody finds again, and a piece that genuinely covers two of these is usually two pieces.",
      type: "string",
      options: { list: CATEGORY_OPTIONS, layout: "radio" },
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    // WHAT MAKES THREE DOCUMENTS ONE ENTRY, and it is a field on the documents
    // for the same reason a jurisdiction page's is: the app reads it as an
    // anonymous visitor.
    //
    // It used to be derived from the translation-metadata document the
    // internationalization plugin writes, and that read returned nothing on the
    // live site — the plugin's document is not visible to a reader without a
    // token, while `article` is. Symptom: the language switcher on every entry
    // offered three greyed-out words, and the sitemap listed the three
    // translations as three unrelated URLs with no hreflang between them.
    //
    // The plugin stays; it is how an editor moves between languages in the
    // Studio, and every other translatable type is registered with it too. What
    // changed is that the SITE no longer reads its bookkeeping. Grouping on a
    // value carried by the documents themselves is what countryPage and
    // propertyPage already do — see lib/slugMap.ts, where one function now
    // serves all three.
    //
    // A STRING RATHER THAN A REFERENCE, unlike a country page's. A jurisdiction
    // page groups on the `country` it points at, which exists anyway and is a
    // real thing an editor picks; an entry has no shared parent, and inventing
    // a document type whose only content is an identity would be machinery for
    // a field. The cost is that a mistyped key silently splits a set, so
    // `npm run inspect` reports any entry whose key no sibling shares.
    defineField({
      name: "translationKey",
      title: "Translation key",
      description:
        "The same short key on all three language versions of one entry — this is what makes them one entry rather than three. Lowercase letters, digits and hyphens. Written by `npm run articles`; type it only when adding a translation by hand, and copy it exactly from a sibling.",
      type: "string",
      group: "meta",
      validation: (Rule) =>
        Rule.required()
          .regex(/^[a-z0-9-]+$/, { name: "lowercase letters, digits, hyphens" })
          .max(96),
    }),
    defineField({
      name: "countries",
      title: "Jurisdictions",
      description:
        "Which of the five this entry concerns. Optional — a piece about the idea of residency by investment concerns none of them in particular. Used to label the entry and, later, to surface it on the jurisdiction pages it belongs to.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "country" }] })],
      group: "content",
    }),
    defineField({
      name: "sources",
      title: "Sources",
      description:
        "The sections of /sources this entry's figures were checked against. REQUIRED, and the reason is the whole site: every figure here can be traced to the instrument that states it, and an entry that states a threshold without naming where it came from contradicts the page it links to. If a piece genuinely states no figures, it still belongs to at least one section — the one whose material it is about.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: SOURCE_SECTION_OPTIONS },
      group: "content",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "meta",
    }),
    languageField(),
  ],
  orderings: [
    {
      name: "publishedAtDesc",
      title: "Newest first",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      date: "publishedAt",
      language: "language",
      category: "category",
    },
    prepare({ title, date, language, category }) {
      const day = typeof date === "string" ? date.slice(0, 10) : "unpublished";
      const parts = [
        day,
        String(language ?? "").toUpperCase(),
        category,
      ].filter(Boolean);
      return { title, subtitle: parts.join(" · ") };
    },
  },
});
