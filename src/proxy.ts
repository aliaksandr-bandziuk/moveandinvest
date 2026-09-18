import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { isUkSectionPath, UK_ENTRY_PATH } from "./lib/ukSection";

const intlMiddleware = createMiddleware(routing);

/** THE UKRAINIAN SECTION IS A LIST, and every other /uk/ address is the same
 *  page in Russian. The header, the footer and the language switcher link
 *  under /uk/ like any locale does; this is what turns those links into the
 *  Russian pages they stand for, rather than into Ukrainian pages that do not
 *  exist. See src/lib/ukSection.ts.
 *
 *  308 for a Russian page, because /uk/o-nas will never be anything else.
 *  307 for /uk itself, because the section may one day get a home page and a
 *  permanent redirect to the pillar would be cached against it. */
function ukRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (pathname !== "/uk" && !pathname.startsWith("/uk/")) return null;

  const rest = pathname.slice("/uk".length);
  if (rest !== "" && rest !== "/" && isUkSectionPath(rest)) return null;

  const url = request.nextUrl.clone();
  if (rest === "" || rest === "/") {
    url.pathname = UK_ENTRY_PATH;
    return NextResponse.redirect(url, 307);
  }
  url.pathname = `/ru${rest}`;
  return NextResponse.redirect(url, 308);
}

export default function proxy(request: NextRequest) {
  const response = ukRedirect(request) ?? intlMiddleware(request);

  // Hard rule: any *.vercel.app host is always noindex, regardless of
  // environment. This specifically catches the production deployment's own
  // auto-assigned vercel.app alias, which VERCEL_ENV alone cannot tell
  // apart from the real custom domain (see src/lib/site.ts). Enforced here,
  // per-request at the edge, rather than in generateMetadata — reading the
  // request hostname there would force every page to render dynamically.
  if (request.nextUrl.hostname.endsWith(".vercel.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Skip /studio (Sanity Studio), /api routes, Next.js internals, and any
  // request for a file with an extension (favicon.ico, images, fonts).
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};
