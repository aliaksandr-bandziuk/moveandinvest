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
  /** An entry in Guides & Research, named by its `translationKey` rather than
   *  by a path. The slug differs in every language, so a footer link — one
   *  value for all three locales — cannot hold one; the layout resolves this
   *  key against the slug map and hands the footer the slug for the language
   *  being rendered. Takes precedence over `href` when both are set, which
   *  they never should be. */
  entry?: string;
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
      // FIRST IN THE GROUP, AND THAT IS THE ARGUMENT FOR IT. Every other row
      // here assumes the reader knows what is being compared; this one is for
      // the reader who does not, and it is the only page on the site that
      // defines the term before using it. Added 4 September 2026.
      { key: "goldenVisa", href: "/golden-visa" },
      { key: "comparison", href: homeSection("comparison") },
      { key: "method", href: homeSection("method") },
      { key: "cost", href: homeSection("cost") },
      // A ROUTE, NOT AN ANCHOR, unlike the four rows around it. The calculator
      // is a page of its own for the reason /enquiry became one: a tool is
      // what other people link to, and a fragment cannot carry a title or be
      // counted separately. Added 2 September 2026.
      { key: "calculator", href: "/calculator" },
      // The second tool, added 9 September 2026 for the reason recorded in
      // headerNav.ts: it shipped with no entry in either navigation, and its
      // Russian and Polish versions had no inbound link from anywhere.
      { key: "clock", href: "/naturalisation-clock" },
      // The third tool, 9 September 2026. Same rule as the row above it.
      { key: "transferTax", href: "/property-transfer-tax-calculator" },
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
    // THE GROUP THAT WAS ALREADY THE SECTION. Its three rows have sat here
    // since launch, greyed out and unlinked — a content plan in the footer,
    // waiting for somewhere to put it. Now there is somewhere: they are the
    // first three things Guides & Research will publish, and the group is
    // named after it rather than after the word they happened to share.
    //
    // They stay unlinked until they are written. The rule the comparison table
    // follows for a jurisdiction with no page holds here too: show what the
    // site will cover, never pretend it already does, never link to a 404.
    key: "guides",
    links: [
      // "Everything published" pointing at /blog was removed on 28 August 2026.
      // The header's own nav carries /blog on every page, so the footer row was
      // a second copy of a link a reader already has — and inside a group named
      // after the section, "everything published" reads as a fourth guide
      // rather than as the index. Nothing is orphaned by its removal.
      // Promised since launch and greyed out until 30 August 2026.
      { key: "ruleChanges", href: "/changes" },
      // REBUILT 9 SEPTEMBER 2026. The two rows that stood here pointed at the
      // August queue — "Moving guides" at portugal-residency and "Cost of
      // living" at the five-country income piece — from the period when this
      // group was a list of promises rather than of published work. Replaced
      // with the four largest verified clusters, which are also the four that
      // do not go stale: three citizenship laws and the Portuguese cost of
      // living.
      //
      // FOUR AND NOT NINE. A footer link is worth something only while there
      // are few of them; a footer of sixty is boilerplate a reader skips and a
      // crawler discounts. The rule this file now follows: a page sits here
      // while it has no better parent, and the day a hub exists the hub takes
      // the row and its children leave.
      { key: "portugalCitizenship", entry: "article-portugal-citizenship" },
      { key: "maltaCitizenship", entry: "article-malta-citizenship" },
      { key: "greeceCitizenship", entry: "article-greece-citizenship" },
      { key: "costOfLiving", entry: "article-portugal-living" },
    ],
  },
  {
    // THE PERSONA PAGES, ADDED 9 SEPTEMBER 2026. Three pages written for a
    // reader defined by where they are leaving from rather than by where they
    // are going, and until today each was reachable only through a cross-link
    // inside another article's body.
    //
    // THIS GROUP HAS A CEILING AND SHOULD NOT OUTGROW IT. Three rows is a
    // navigation; six is a directory, and a directory belongs on a page rather
    // than under every page. When the fourth arrives — D3 is written and the
    // Russian citizenship cluster gets its hub at F3 — this group's rows should
    // collapse into one link to that hub. The English side has no such hub yet,
    // and that gap is the thing to close before writing more of these.
    key: "moving",
    links: [
      { key: "fromUs", entry: "article-portugal-americans" },
      { key: "fromUk", entry: "article-portugal-uk" },
      { key: "greeceAmericans", entry: "article-greece-americans" },
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
