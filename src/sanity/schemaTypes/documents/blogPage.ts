import { defineField, defineType } from "sanity";
import { stringField, textField } from "../lib/fields";
import { languageField } from "../lib/languageField";

// Singleton, one per language: blogPage-en, blogPage-ru, blogPage-pl. The head
// of the listing at /blog — the entries themselves are `article` documents.
//
// PROSE ABOUT THE SECTION, NEVER CLAIMS ABOUT THE WORLD. Anything that states a
// threshold belongs in an entry, where the schema requires it to name a source
// section. Nothing here should ever contain a figure.
//
// IT HAS A BODY, unlike faqPage and sourcesPage, and the body sits BELOW the
// list rather than above it. The sibling project puts its editorial block above
// — it can afford to, with four hundred entries behind a paginated list, where
// the reader's next click is a filter rather than an entry. Here the entries
// are the whole page, and four paragraphs between the headline and the first
// one would be four paragraphs in the way. Below, they do the job they are
// actually for: explaining how the section works to someone who has already
// seen what is in it.
//
// THE SECTION IS CALLED GUIDES & RESEARCH, NOT THE BLOG, and the name is a message
// key rather than a field here — it appears in the header, the footer and every
// breadcrumb trail, so it has to be one string the whole site reads, not a
// document one page happens to load. The URL stays /blog in all three
// languages: "blog" is the same word in Russian and Polish, and the address is
// the one part of a section that should be guessable.
export const blogPage = defineType({
  name: "blogPage",
  title: "Guides & Research (listing)",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "SEO" },
  ],
  fields: [
    stringField("eyebrow", "Eyebrow", { max: 40, group: "content" }),
    stringField("heading", "Headline", {
      description:
        "About what gets written here and how often, not about the site. Say the thing a reader cannot see from a list of two entries.",
      max: 90,
      group: "content",
    }),
    textField("intro", "Deck", {
      description:
        "Four to seven lines. WHAT MAKES THIS DIFFERENT FROM A COMPANY BLOG: nothing is published here that does not name the instrument it was read from, and an entry is dated because a threshold that was true in August may not be in March. Say that, rather than promising insight.",
      max: 600,
      rows: 6,
      group: "content",
    }),
    defineField({
      name: "editorial",
      title: "How this section works",
      description:
        "Rendered UNDER the list. What gets published here, why every entry names its sources, why every entry is dated, and what deliberately is not here. Use ## for a subheading. No figures — those belong in an entry, with a source beside them.",
      type: "portableText",
      group: "content",
    }),
    textField("empty", "When there is nothing yet", {
      description:
        "Shown in place of the list when this language has no published entries. Say when something is expected, not “check back soon” — a reader who has just been told the site publishes carefully deserves a straight answer about how often.",
      max: 300,
      rows: 3,
      group: "content",
    }),
    { name: "seo", title: "SEO", type: "seo", group: "meta" },
    languageField(),
  ],
});
