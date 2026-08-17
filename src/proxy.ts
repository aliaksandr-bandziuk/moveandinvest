import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

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
