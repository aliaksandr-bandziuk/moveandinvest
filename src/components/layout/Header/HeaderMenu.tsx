"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

interface HeaderMenuProps {
  /** The <details> id, so the summary and the panel can reference each other. */
  id: string;
  /** Optional because CSS-module lookups are typed `string | undefined`
   *  under `noUncheckedIndexedAccess`, which is on in this project. */
  className?: string;
  children: React.ReactNode;
}

// The burger, as a native <details> — the same choice as the FAQ accordion, and
// the same reasoning. Without JavaScript it opens, closes, and works from the
// keyboard, because that is what <details> already is. No state, no portal, no
// focus library.
//
// WHAT THE JAVASCRIPT IS ACTUALLY FOR, and it is worth being precise because
// the answer is "one edge case". With scripts off, a nav link is an ordinary
// <a> and following it loads a new document — the menu is gone because the
// page is gone. With scripts on, Next navigates on the client: the DOM
// survives, and a menu left open would cover the page the reader just asked
// for. So the only thing below is: when the path changes, close.
//
// Escape is handled by the browser for a <details> only when it is a popover,
// which this is not; the effect below adds it, and its absence would be a
// nuisance rather than a trap — the summary stays focusable and clicking it
// closes the panel either way.
export function HeaderMenu({ id, className, children }: HeaderMenuProps) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const pathname = usePathname();

  // Close on navigation. Deliberately keyed on the path rather than on a click
  // handler bound to every link: a link added later would silently miss the
  // handler, whereas nothing can change the path without this running.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const details = ref.current;
      if (!details?.open) return;
      details.open = false;
      // Focus goes back to the control that opened the panel, not to the top
      // of the document — otherwise closing the menu loses the reader's place.
      details.querySelector("summary")?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <details ref={ref} id={id} className={className}>
      {children}
    </details>
  );
}
