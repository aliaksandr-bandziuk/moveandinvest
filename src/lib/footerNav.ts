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

import { ENQUIRY_HREF, homeSection } from "./routes";
import type { AppHref } from "./routes";
export interface FooterLink {
  /** Message key under `footer.links`. */
  key: string;
  /** Absent means the page does not exist yet — rendered, but not a link. */
  href?: AppHref;
  /** Opens in a new tab. Only for targets outside this site. */
  external?: boolean;
  /** Renders as a button that reopens the cookie banner instead of a link.
   *  It has no href because it goes nowhere; it is here rather than hidden in
   *  the footer component because the footer's links are data, and a control
   *  that only exists in markup is one nobody finds when it has to move. */
  action?: "cookies";
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
      { key: "comparison", href: homeSection("comparison") },
      { key: "method", href: homeSection("method") },
      { key: "cost", href: homeSection("cost") },
      { key: "route", href: homeSection("route") },
      // REPOINTED FROM "/#faq" ON 25 AUGUST 2026, when /faq was published.
      // The home page still has its section 06 and still has that id, so the
      // old anchor was not broken — it was just aimed at six questions when
      // fifty-two exist. A footer link named "Common questions" should land on
      // the page that answers them, not on an excerpt of it.
      { key: "faq", href: "/faq" },
      { key: "enquiry", href: ENQUIRY_HREF },
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
      // Listed unlinked from the start and given its href on 24 Aug 2026,
      // which is exactly the lifecycle the note at the top of this file
      // describes.
      //
      // The LABEL changed with it, from "Method and sources". Not because that
      // was worse in isolation — it says more — but because the page then had
      // three different names: this link, the /about URL, and an H1 about
      // figures. A reader who clicks "Method and sources" and lands on a page
      // titled something else has been handed a small puzzle for no reason.
      // The message key stays `sources` so no catalogue needs re-keying.
      { key: "sources", href: "/about" },
      // The evidence behind /about's claim, published 24 Aug 2026. A separate
      // entry rather than a link inside the about page alone: a reader doing
      // due diligence looks for "sources" in a footer, and finding the working
      // one click from anywhere is worth more than tidiness.
      { key: "working", href: "/sources" },
      // A human channel, not a second form. Built 24 Aug 2026 — see the note
      // at the top of src/lib/contactChannels.ts for why the channels
      // themselves are not in the CMS.
      { key: "contacts", href: "/contacts" },
      // Not a courtesy link. A site that takes an email address owes a
      // reachable statement of what it does with it, and "reachable" means
      // from every page, not only from beside the form.
      { key: "privacy", href: "/privacy" },
      // Withdrawing consent has to be as easy as giving it, and this is the
      // only route back to the banner once a choice is stored.
      { key: "cookies", action: "cookies" },
    ],
  },
];
