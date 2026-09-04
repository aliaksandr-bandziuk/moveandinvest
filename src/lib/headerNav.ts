// The header's link structure, in one place — the sibling of footerNav.ts, and
// deliberately the same shape.
//
// That file's own comment already wrote the rule this one follows: "the moment
// an editor needs to add a page without a deploy — the first guide — this
// becomes a navLink document type with the same four fields, and the component
// does not change, because it already takes its groups as data." The blog is
// that moment. So this file is the DEFAULT, not the source: a headerSettings
// document in Sanity overrides it item for item, and when no such document
// exists the header still renders exactly what is written here.
//
// WHY A CODE DEFAULT AT ALL, rather than going straight to the CMS. Two
// reasons, and the second is the real one. The header is on all forty-five
// pages, so a missing or half-filled document must not be able to produce a
// site with no navigation. And a nav item is a promise that a page exists —
// which is why, when this does move to Sanity, the editor gets a dropdown of
// routes this codebase owns and a reference picker for real documents, never a
// free-text URL field. An editor should not be able to type a 404.
//
// JURISDICTIONS ARE NOT LISTED HERE, for the same reason the footer omits
// them: they come from Sanity already, and a second hand-written list of the
// same five countries goes stale the week Cyprus goes live.

import { ENQUIRY_HREF } from "./routes";
import type { AppHref } from "./routes";
export interface HeaderLink {
  /** Message key under `nav.links`. */
  key: string;
  /** Absent means the item is a submenu label and carries `children`. */
  href?: AppHref;
  /** A submenu. One level only — a nav that needs two is a nav that needs a
   *  page instead. */
  children?: HeaderLink[];
  /** Filled at render time from the Sanity country registry rather than from
   *  this file. Exactly one item may set it. */
  fromJurisdictions?: boolean;
}

export const HEADER_NAV: HeaderLink[] = [
  // The one dynamic item: its children are the live jurisdictions, in the
  // registry's own order, with the same names the rest of the site uses.
  { key: "countries", fromJurisdictions: true },
  { key: "research", href: "/blog" },
  { key: "faq", href: "/faq" },
  // THE SECOND SUBMENU, ADDED 4 SEPTEMBER 2026 to give the calculator a home in
  // the bar. It is the site's own subject in two links: what entry costs, and
  // where every figure in that answer comes from.
  //
  // "Sources" used to sit in this slot on its own, and moving it in rather than
  // adding a seventh item is the reason this works — the row still carries six.
  // It also reads better one level down: "Sources", alone in a navigation, is a
  // word without an object, while under "Cost" it plainly means the working
  // behind the figures the calculator prints.
  //
  // The first draft hung the calculator off "Jurisdictions" instead. Wrong
  // shelf: that submenu answers "which country", the calculator answers "how
  // much", and a tool sitting among five country names reads as a sixth
  // country no matter how it is set off.
  {
    key: "cost",
    children: [
      { key: "calculator", href: "/calculator" },
      { key: "working", href: "/sources" },
    ],
  },
  { key: "about", href: "/about" },
  { key: "forPartners", href: "/for-partners" },
];

/** The header's one button. Points at the enquiry section rather than opening a
 *  dialog of its own, and that is a decision rather than a shortcut.
 *
 *  This site has ONE enquiry form, with six qualifying fields and an explicit
 *  consent checkbox, and /for-partners tells partners that exactly those six
 *  fields are what reaches their inbox. A shorter form behind a button in the
 *  header would create a second, thinner tier of enquiry — which either gets
 *  passed on, breaking that promise, or does not, in which case it collects
 *  addresses nobody answers. A dialog containing the same six fields is not a
 *  dialog, it is a page in a box. */
export const HEADER_CTA = { key: "enquiry", href: ENQUIRY_HREF } as const;
