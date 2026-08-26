import type { StructureBuilder, StructureResolver } from "sanity/structure";

// Singletons: exactly one document PER LANGUAGE, linked into an en/ru/pl
// translation set by @sanity/document-internationalization. Fixed pane id
// convention: `${typeId}-${language}` — e.g. "homePage-en", "homePage-ru".
// The desk always opens the English one; the language switcher inside the
// document takes it from there.
export const SINGLETON_TYPES = new Set([
  "siteSettings",
  "homePage",
  "partnersPage",
  "privacyPage",
  "aboutPage",
  "sourcesPage",
  "contactsPage",
  "faqPage",
]);

// Types whose delete and duplicate actions are removed. Today that is
// exactly the singletons — a second homePage-en would be unreachable but
// would still answer GROQ queries, which is how a site starts rendering a
// document nobody knows exists.
//
// `country` is deliberately NOT here: five jurisdictions today, and adding
// or removing one is a legitimate editorial act, not an accident to guard
// against.
export const PROTECTED_TYPES = new Set([...SINGLETON_TYPES]);

// Every type registered with @sanity/document-internationalization.
// `country` is absent on purpose — see its schema file: ISO code, chip
// colour, sort order and status are language-neutral, and duplicating them
// per locale is how one jurisdiction ends up two different greens.
//
// `propertyPage` was missing here until 24 Aug 2026 — an oversight from the
// step that built the buying half, and one with no symptom on the site: the
// four pages render correctly, because the route reads `language` off the
// document and seeding writes it. What was broken was the STUDIO. Unregistered,
// a property page gets no language switcher, so an editor who opens the
// Portuguese one has no route to its Russian counterpart, and the plugin never
// treats the three as one translation set.
export const TRANSLATABLE_TYPES = new Set([
  ...PROTECTED_TYPES,
  "countryPage",
  "propertyPage",
  "faqItem",
]);

const DEFAULT_LOCALE = "en";

// Pointing a pane at an id that does not exist yet is not a write: Sanity
// renders an empty, pre-addressed create form. That is how each singleton
// bootstraps itself the first time an editor opens it.
function singletonListItem(S: StructureBuilder, typeId: string, title: string) {
  return S.listItem()
    .id(typeId)
    .title(title)
    .child(
      S.document().schemaType(typeId).documentId(`${typeId}-${DEFAULT_LOCALE}`),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("moveandinvest")
    .items([
      singletonListItem(S, "homePage", "Home page"),
      singletonListItem(S, "partnersPage", "For partners"),
      S.divider(),
      S.listItem()
        .title("Jurisdictions")
        .child(
          S.documentTypeList("country")
            .title("Jurisdictions")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Jurisdiction pages")
        .child(S.documentTypeList("countryPage").title("Jurisdiction pages")),
      // Same oversight as TRANSLATABLE_TYPES above: the buying half had no
      // pane at all, so four published documents were unreachable in the
      // Studio. A page an editor cannot open is a page only a script can fix.
      S.listItem()
        .title("Property pages")
        .child(S.documentTypeList("propertyPage").title("Property pages")),
      S.divider(),
      S.listItem()
        .title("FAQ")
        .child(
          S.documentTypeList("faqItem")
            .title("FAQ")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      singletonListItem(S, "aboutPage", "About the project"),
      singletonListItem(S, "sourcesPage", "Sources and working"),
      singletonListItem(S, "faqPage", "FAQ page"),
      singletonListItem(S, "contactsPage", "Contact"),
      singletonListItem(S, "privacyPage", "Privacy policy"),
      singletonListItem(S, "siteSettings", "Site settings"),
    ]);
