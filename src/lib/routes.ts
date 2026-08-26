import type { ComponentProps } from "react";
import type { Link, getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// THE TYPES AND THE TWO SHAPES THAT ARE NOT PLAIN STRINGS.
//
// Since the routing config gained a `pathnames` map, an internal URL is no
// longer a string — it is one of the declared routes, or an object naming one
// of them plus the parts that vary. That is the point rather than a tax: a
// route that does not exist, or a country slug pasted where a fixed route
// belongs, is now a compile error instead of a 404 in one language.
//
// Both types are DERIVED from the navigation helpers rather than written out,
// so adding a route to routing.ts widens them automatically and nothing here
// has to be kept in step.

/** Anything `<Link href>` accepts. Includes `hash`, which is why the enquiry
 *  anchor below is expressible. */
export type AppHref = ComponentProps<typeof Link>["href"];

/** What `getPathname` accepts — the same routes, without `hash`. Narrower on
 *  purpose: a canonical URL, an hreflang alternate or a sitemap entry must
 *  never carry a fragment. */
export type AppPathname = Parameters<typeof getPathname>[0]["href"];

/** A jurisdiction or property page. Its slug is translated per language and
 *  lives in the Sanity document, so the route is the shape and the slug is
 *  data — which is exactly what the object form says. */
export function slugHref(slug: string) {
  return { pathname: "/[slug]", params: { slug } } as const;
}

/** The one enquiry form, on the home page. Written as a route plus a fragment
 *  rather than the string "/#enquiry", which is not a route: it used to work
 *  only because every href was an untyped string, and in Russian it would have
 *  had to become "/#enquiry" pointing at a page whose other links had all moved.
 *
 *  See HEADER_CTA in headerNav.ts for why the button goes here instead of
 *  opening a second, shorter form. */
export const ENQUIRY_HREF = { pathname: "/", hash: "enquiry" } as const;

/** A section of the home page, for the footer's shortcut column. The leading
 *  slash matters: these are followed from jurisdiction pages too, not only from
 *  the home route. */
export function homeSection(id: string) {
  return { pathname: "/", hash: id } as const;
}

/** A destination this site does not own. Still a string, because nothing here
 *  can check it — but a shape narrow enough that a mistyped internal path
 *  cannot pass as one. */
export type ExternalHref =
  | `${"https" | "http" | "mailto" | "tel"}:${string}`
  | `#${string}`;

/** Everything a call to action can point at. */
export type CtaHref = AppHref | ExternalHref;

const DECLARED = new Set(Object.keys(routing.pathnames));

/** Turns a raw href out of the CMS into something that can be linked.
 *
 *  THIS IS NOT DEFENSIVE PROGRAMMING, IT IS A CORRECTNESS REQUIREMENT since the
 *  fixed routes gained translated URLs. An editor's "/for-partners" is a string
 *  in the document, identical in all three languages; the Polish page has to
 *  render /pl/dla-partnerow. Passing the raw value through would produce a link
 *  that 404s in two languages out of three. Matching it against the declared
 *  routes is what lets the router do the substitution.
 *
 *  Returns null for anything unrecognised rather than guessing. The caller
 *  decides what to do with that, and the honest options are "render no button"
 *  or "fall back to the home page" — never "emit it anyway and hope".
 *
 *  The right long-term answer is that the CMS should not offer a free-text URL
 *  field at all; headerNav.ts already argues this for the navigation. Until the
 *  `cta` object type becomes a route picker, this is the boundary. */
export function parseHref(raw: string | undefined | null): CtaHref | null {
  if (!raw) return null;
  if (/^(https?:|mailto:|tel:|#)/.test(raw)) return raw as ExternalHref;
  return DECLARED.has(raw) ? (raw as AppHref) : null;
}
