import { readRouteAnswers, type RouteAnswers } from "./routeAnswers";

// PUTTING THE READER'S OWN ANSWERS BACK IN FRONT OF THEM, in whichever copy of
// the enquiry form they have reached.
//
// It lived inside EnquiryPrefill until the calculator grew a dialog around the
// same form. Two callers now, and they sit in different component areas —
// `country/` may not import from `marketing/` by deep path, which CLAUDE.md
// forbids for good reasons. So the behaviour moved down here, where both are
// allowed to reach it, rather than being copied.
//
// Nothing here is required for a form to work. With JavaScript off, or storage
// disabled, or a value written by an older shape, every field is simply empty
// — which is the normal state of a form.

/** Maps a route-finder answer value to the form's value for the same idea.
 *  Two vocabularies, one translation, in one place. */
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

/** Ticks the budget band, REPLACING whatever is already there — the one place
 *  the never-overwrite rule below does not apply.
 *
 *  It is for the calculator's dialog, where the reader's own figure is on the
 *  screen behind the box and the box says the budget is already ticked. If
 *  they change the number and open it again, the two have to agree; a stale
 *  band under a fresh figure is worse than no band at all. Everywhere else the
 *  reader's answer wins, which is what `applyRouteAnswers` does. */
export function setBudgetBand(root: HTMLElement, band: string | undefined): void {
  const value = band ? BUDGET[band] : undefined;
  if (!value) return;
  const input = root.querySelector<HTMLInputElement>(
    `input[name="budget"][value="${value}"]`,
  );
  if (input) input.checked = true;
}

/**
 * @param root Anything containing the form's fields — the wrapper on a page,
 *   the dialog in the calculator.
 * @param answers Defaults to whatever is in storage. Passed explicitly by the
 *   calculator, which has just written them and should not race its own write.
 */
export function applyRouteAnswers(
  root: HTMLElement,
  answers: RouteAnswers = readRouteAnswers(),
): void {
  // The calculator's own figures, passed straight through. Not shown to the
  // reader and not editable: it is the screen they were looking at, and a
  // field they could change would be a figure claiming to be theirs that
  // isn't. The server parses it and rebuilds the answer from the cost model.
  const calc = root.querySelector<HTMLInputElement>("input[data-calc]");
  if (calc && answers.calc) calc.value = answers.calc;

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
}
