"use client";

import { useEffect, useRef } from "react";

interface ChangeFilterProps {
  children: React.ReactNode;
  className?: string;
  /** "{n} of {total}" — both replaced. Empty string hides the counter. */
  countTemplate?: string;
}

// Hides the rows a jurisdiction filter excludes, turning the log into
// something a reader can interrogate rather than only scroll.
//
// WHY THIS IS A SIBLING OF FaqFilter AND NOT A SHARED ABSTRACTION. The two are
// the same enhancer apart from the radio group's name, and the temptation to
// extract one `ListFilter` is real. It is declined at two call sites: the
// generalisation that survives contact with a third one cannot be guessed from
// two, and the cost of guessing wrong is a shared component that both callers
// fight. If a third filter appears, merge all three then.
//
// Everything here is an enhancement. The server sends every row visible and
// the chips hidden; if this never runs the reader gets the whole log and no
// controls, which is the correct degraded state for a page whose job is to be
// read in full. `hidden` rather than a class, for the reason FaqFilter records:
// it removes the row from the accessibility tree as well as the layout, and it
// needs the matching `[hidden] { display: none }` rule in the stylesheet
// because the UA default loses to any class that sets `display`.
//
// ONE THING DIFFERS FROM THE FAQ, and it is a table. Hiding a <tr> is safe —
// the row leaves the layout and the a11y tree together — but hiding every row
// of a section would leave a header over nothing. It cannot happen here: the
// chips are built from the countries that actually have rows, so every chip
// has at least one match by construction.
export function ChangeFilter({
  children,
  className,
  countTemplate,
}: ChangeFilterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-codes]"));
    if (rows.length === 0) return;

    const counter = root.querySelector<HTMLElement>("[data-change-count]");

    function apply() {
      const checked = root!.querySelector<HTMLInputElement>(
        "input[name='change-filter']:checked",
      );
      const value = checked?.value ?? "all";
      let shown = 0;

      for (const row of rows) {
        const codes = (row.dataset.codes ?? "").split(" ").filter(Boolean);
        const matches = value === "all" || codes.includes(value);
        row.hidden = !matches;
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
                .join(String(rows.length));
      }
    }

    root.dataset.js = "on";
    root.addEventListener("change", apply);
    apply();

    return () => {
      root.removeEventListener("change", apply);
      delete root.dataset.js;
      // Leaving rows hidden after unmount would strip the log from the page
      // for anything that reads it afterwards.
      for (const row of rows) row.hidden = false;
    };
  }, [countTemplate]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
