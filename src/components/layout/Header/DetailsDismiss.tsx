"use client";

import { useEffect } from "react";
import { DISMISS_OPEN_SELECTOR } from "@/lib/dismiss";

// The attribute and the selector live in src/lib/dismiss.ts, NOT here. They
// were exported from this file until a server component tried to import one —
// see that file for what happens then. Nothing in a "use client" module can be
// imported by a server component as a value.

// WHAT <details> DOES NOT GIVE YOU. It opens, closes, and works from the
// keyboard for free — which is why every disclosure on this site is one. What
// it has no concept of is being dismissed: the element closes when the same
// summary is activated again and at no other time. On a page that is fine for
// an accordion, where the panel is part of the document and staying open costs
// nothing. It is wrong for a menu that floats over the page, because a reader
// who has changed their mind clicks away — and then the panel is still there,
// over the thing they were trying to reach.
//
// Hence one pair of listeners for the whole header rather than a hook per
// dropdown. The alternative the sibling project has — an open/close hook with
// its own timers, per-instance refs and a shared "which one is open" state —
// is what you need when the panels are React state. These are DOM elements
// that already know whether they are open, so the only thing missing is the
// dismissal, and that is genuinely one document-level concern.
//
// `pointerdown`, not `click`. A click fires after the button comes back up, so
// dragging a selection out of a panel and releasing outside would close it;
// pointerdown also lands before the browser's own toggle on a summary, which
// keeps the two from fighting over the same tap.
//
// ESCAPE CLOSES THE INNERMOST ONE, which matters because the language list
// lives inside the phone menu panel. Escape there should take away the list and
// leave the menu; a second press takes the menu. That ordering is why this
// handler closes exactly one element and why HeaderMenu checks for an open
// child before acting on its own Escape.
export function DetailsDismiss() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      for (const details of document.querySelectorAll<HTMLDetailsElement>(
        DISMISS_OPEN_SELECTOR,
      )) {
        // Anything inside stays open: a click on a link in the panel is the
        // panel being used, and navigation closes it a moment later anyway.
        if (target && details.contains(target)) continue;
        details.open = false;
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      // The last match in document order is the innermost of any nested pair —
      // querySelectorAll returns them outer-first.
      const open = [
        ...document.querySelectorAll<HTMLDetailsElement>(DISMISS_OPEN_SELECTOR),
      ].pop();
      if (!open) return;

      open.open = false;
      // Focus returns to the control that opened it. Without this it would sit
      // on an element that has just been hidden, and the next Tab would start
      // over from the top of the document.
      open.querySelector("summary")?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
