// The footer's link structure, in one place.
//
// The point of this file is that adding a link is editing a list, not editing
// a component. When the guides exist, `pending` comes off and an `href` goes
// on — nothing else changes.
//
// Why here and not in Sanity: today every one of these targets is a route this
// codebase owns, so a link that moves is a deploy anyway. The moment an editor
// needs to add a page without a deploy — the first guide — this becomes a
// `navLink` document type with the same four fields, and the Footer component
// does not change, because it already takes its groups as data.
//
// Jurisdictions are the exception and are NOT listed here: they come from
// Sanity already, and a second hand-written list of the same five countries is
// the kind of duplicate that goes stale the week Cyprus goes live.

export interface FooterLink {
  /** Message key under `footer.links`. */
  key: string;
  /** Absent means the page does not exist yet — rendered, but not a link. */
  href?: string;
  /** Opens in a new tab. Only for targets outside this site. */
  external?: boolean;
}

export interface FooterGroup {
  /** Message key under `footer.groups`. */
  key: string;
  links: FooterLink[];
}

// Anchors point at ids declared on the home page's sections. They are written
// with a leading slash so they resolve from a jurisdiction page too, not only
// from the home route.
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    key: "site",
    links: [
      { key: "comparison", href: "/#comparison" },
      { key: "method", href: "/#method" },
      { key: "cost", href: "/#cost" },
      { key: "route", href: "/#route" },
      { key: "faq", href: "/#faq" },
      { key: "enquiry", href: "/#enquiry" },
    ],
  },
  {
    key: "guides",
    links: [
      // Nothing here is written yet. They are listed anyway, marked and
      // unlinked — the same rule the comparison table follows for a
      // jurisdiction with no page: show what the site will cover, never
      // pretend it already does, and never link to a 404.
      { key: "ruleChanges" },
      { key: "movingGuides" },
      { key: "costOfLiving" },
    ],
  },
  {
    key: "project",
    links: [
      { key: "partners", href: "/for-partners" },
      { key: "sources" },
    ],
  },
];
