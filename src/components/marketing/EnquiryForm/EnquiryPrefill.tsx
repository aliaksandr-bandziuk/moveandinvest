"use client";

import { useEffect, useRef } from "react";
import { applyRouteAnswers } from "@/lib/prefillEnquiry";

// The key and the shape moved to src/lib/routeAnswers.ts when a third caller
// appeared — the jurisdiction pages' closing link. Re-exported here for one
// release so nothing importing the old name breaks silently.
export { ROUTE_ANSWERS_KEY } from "@/lib/routeAnswers";

// Copies the reader's answers from the route finder — and, since 4 September
// 2026, from the calculator — into this form.
//
// The reason is not convenience, it is not asking twice. Someone who worked
// through section 05 has already said their budget, their deadline and what
// they care about; presenting the same three questions again, blank, tells
// them nobody was listening — and it is the point in a long form where people
// leave.
//
// sessionStorage rather than a URL parameter or a server session: the answers
// never leave the tab, they expire when it closes, and the home page stays
// statically generated. Nothing here is required for the form to work — with
// JavaScript off the fields are simply empty, which is the normal state of a
// form.
//
// The work itself is in src/lib/prefillEnquiry.ts, because the calculator's
// dialog wraps the same form and needs the same behaviour from another
// component area. This is the mount point; that is the behaviour.
export function EnquiryPrefill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) applyRouteAnswers(ref.current);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
