"use client";

import { Link } from "@/i18n/navigation";
import { mergeRouteAnswers } from "@/lib/routeAnswers";

interface EnquiryCtaLinkProps {
  /** ISO alpha-2 of the jurisdiction this page is about. */
  code: string;
  className?: string;
  children: React.ReactNode;
}

// The jurisdiction page's closing link to the enquiry form, which preselects
// the country on the way.
//
// It writes into the SAME sessionStorage key the route finder writes to, and
// `EnquiryPrefill` already reads `jurisdiction` from it and ticks the matching
// `where` radio — so this adds no new channel, no query parameter and no
// change to the form. It only supplies the one answer a reader arriving from
// this page has obviously already given.
//
// Merged rather than replaced — see `mergeRouteAnswers`, which is where that
// rule lives now.
//
// A plain link underneath. With JavaScript off the click still navigates to
// the form — it simply arrives without the country ticked, which is the
// normal state of a form and not a broken one.
export function EnquiryCtaLink({ code, className, children }: EnquiryCtaLinkProps) {
  const remember = () => mergeRouteAnswers({ jurisdiction: code });

  return (
    <Link className={className} href="/#enquiry" onClick={remember}>
      {children}
    </Link>
  );
}
