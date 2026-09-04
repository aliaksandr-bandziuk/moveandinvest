"use client";

import { useEffect, useRef } from "react";
import { readRouteAnswers } from "@/lib/routeAnswers";

// The key and the shape moved to src/lib/routeAnswers.ts when a third caller
// appeared — the jurisdiction pages' closing link. Re-exported here for one
// release so nothing importing the old name breaks silently.
export { ROUTE_ANSWERS_KEY } from "@/lib/routeAnswers";

/** Maps a route-finder answer value to this form's value for the same idea. */
const BUDGET: Record<string, string> = {
  "500": "500",
  "800": "800",
  any: "over800",
};
const TIMELINE: Record<string, string> = {
  fast: "fast",
  "half-year": "half-year",
  any: "year",
};
const GOAL: Record<string, string> = {
  passport: "passport",
  tax: "tax",
  speed: "residency",
};

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
export function EnquiryPrefill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Private mode, storage disabled, a malformed value — all three come back
    // as an empty object. The form works, it just starts empty.
    const answers = readRouteAnswers();

    const check = (name: string, value: string | undefined) => {
      if (!value) return;
      const input = root.querySelector<HTMLInputElement>(
        `input[name="${name}"][value="${value}"]`,
      );
      // Never overwrite an answer the reader has already given here.
      if (input && !root.querySelector(`input[name="${name}"]:checked`)) {
        input.checked = true;
      }
    };

    // The calculator's state, passed straight through. Not shown to the
    // reader and not editable: it is the screen they were looking at, and a
    // field they could change would be a figure claiming to be theirs that
    // isn't. See the note on the input in EnquiryForm.
    const calc = root.querySelector<HTMLInputElement>("input[data-calc]");
    if (calc && answers.calc) calc.value = answers.calc;

    check("budget", answers.budget ? BUDGET[answers.budget] : undefined);
    check("timeline", answers.speed ? TIMELINE[answers.speed] : undefined);

    // `where` is only prefilled from the jurisdiction the finder actually
    // showed — not from the priority answer, which is a preference and not a
    // choice of country.
    check("where", answers.jurisdiction);

    const goal = answers.priority ? GOAL[answers.priority] : undefined;
    if (goal) {
      const box = root.querySelector<HTMLInputElement>(
        `input[name="goals"][value="${goal}"]`,
      );
      if (box && !box.checked) box.checked = true;
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
