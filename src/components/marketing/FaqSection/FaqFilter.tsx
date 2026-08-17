"use client";

import { useEffect, useRef } from "react";

interface FaqFilterProps {
  children: React.ReactNode;
  className?: string;
  /** "{n} of {total}" — both replaced. Empty string hides the counter. */
  countTemplate?: string;
}

// Hides the questions a jurisdiction filter excludes.
//
// Hiding, not dimming: the first draft dimmed non-matching rows to about a
// quarter opacity, which produced grey-on-white text far below any contrast
// floor, still announced by a screen reader, and still occupying the height
// the filter was supposed to reclaim. A filter that leaves everything on
// screen is a highlighter, and this is not a highlighter.
//
// A jurisdiction chip shows THAT jurisdiction's questions and nothing else —
// general questions included. The first version kept the general ones on
// screen under every filter, on the theory that they are relevant to
// everybody, and the result was a control that visibly did nothing: five of
// six questions are general, so "Portugal" and "all" rendered the same list.
// A filter that does not filter is worse than no filter. The count line says
// how many of the total are showing, and "All" is the first chip and the
// default, so nothing is more than one click away.
//
// `hidden` rather than a class: it removes the row from the accessibility
// tree as well as from the layout, in one attribute. It needs a matching
// `[hidden] { display: none }` rule in the stylesheet — the UA default loses
// to any class that sets `display`, which is how this silently did nothing
// once already.
//
// Everything here is an enhancement. The server sends every question visible
// and the chips hidden; if this never runs, the reader gets the full list and
// no controls, which is the correct degraded state for a block whose job is
// to be read in full.
export function FaqFilter({ children, className, countTemplate }: FaqFilterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-codes]"));
    if (items.length === 0) return;

    const counter = root.querySelector<HTMLElement>("[data-faq-count]");

    function apply() {
      const checked = root!.querySelector<HTMLInputElement>(
        "input[name='faq-filter']:checked",
      );
      const value = checked?.value ?? "all";
      let shown = 0;

      for (const item of items) {
        const codes = (item.dataset.codes ?? "").split(" ").filter(Boolean);
        const matches = value === "all" || codes.includes(value);
        item.hidden = !matches;
        if (matches) shown += 1;
      }

      if (counter) {
        counter.textContent =
          value === "all" || !countTemplate
            ? ""
            : countTemplate
                .split("{n}")
                .join(String(shown))
                .split("{total}")
                .join(String(items.length));
      }
    }

    root.dataset.js = "on";
    root.addEventListener("change", apply);
    apply();

    return () => {
      root.removeEventListener("change", apply);
      delete root.dataset.js;
      // Leaving rows hidden after unmount would strip content from the page
      // for anything that reads it afterwards.
      for (const item of items) item.hidden = false;
    };
  }, [countTemplate]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
