"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { DISMISS_OPEN_SELECTOR } from "@/lib/dismiss";

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
  const [open, setOpen] = useState(false);

  // Close on navigation. Deliberately keyed on the path rather than on a click
  // handler bound to every link: a link added later would silently miss the
  // handler, whereas nothing can change the path without this running.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  // THE PAGE DOES NOT SCROLL UNDER AN OPEN MENU, and getting there is less
  // obvious than it sounds. The obvious recipe — `overflow: hidden` on <body> —
  // is the one the sibling project shipped and then had to patch three times:
  // on a document whose scroller is the root element, hiding the body's
  // overflow can reset scrollY to zero outright, so the lock has to capture the
  // position, restore it on close, and opt that restore out of the smooth
  // scrolling globals.scss turns on, or the page visibly travels back down
  // behind the closing menu.
  //
  // Locking the ROOT ELEMENT instead has none of that. It is the actual
  // scroller here, and hiding the overflow of the element that is already
  // scrolled leaves its scrollTop alone — measured before this was written, at
  // scroll 1200, in both directions. Nothing to capture, nothing to restore,
  // nothing to un-smooth.
  //
  // `scrollbar-gutter: stable` for the width the scrollbar gives up, but only
  // where the scrollbar consumed width in the first place: on a phone, and on
  // any overlay-scrollbar desktop, reserving it unconditionally introduces the
  // very shift it exists to prevent. innerWidth against clientWidth is the test
  // for that, and it is asked at lock time rather than assumed.
  //
  // The panel covers the viewport, so none of this is visible while it is
  // open — which is exactly why an unnoticed scroll jump here would only show
  // up on the way out, as a page that is somewhere else than where it was left.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const hadScrollbarWidth = window.innerWidth > root.clientWidth;

    root.style.overflow = "hidden";
    if (hadScrollbarWidth) root.style.scrollbarGutter = "stable";

    // Everything outside the header is unreachable while the menu is over it.
    // Tab alone is not enough: the panel is a sibling of the page content, not
    // a wrapper around it, so tabbing past the last link walks straight into a
    // document the reader cannot see. `inert` takes each of those subtrees out
    // of the tab order AND the accessibility tree in one step, which also
    // closes the screen-reader browse-mode hole Tab-trapping never covers.
    const header = ref.current?.closest("header");
    const inerted: HTMLElement[] = [];
    for (const sibling of Array.from(document.body.children)) {
      if (!(sibling instanceof HTMLElement)) continue;
      if (sibling === header || sibling.tagName === "SCRIPT") continue;
      if (sibling.inert) continue;
      sibling.inert = true;
      inerted.push(sibling);
    }

    return () => {
      root.style.overflow = "";
      root.style.scrollbarGutter = "";
      for (const sibling of inerted) sibling.inert = false;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const details = ref.current;
      if (!details?.open) return;
      // ESCAPE PEELS ONE LAYER. The panel contains dropdowns of its own — the
      // jurisdictions submenu, the language list — and DetailsDismiss closes
      // the innermost open one on the same key. If this ran too, one press
      // would take both the list and the menu around it, which is not what a
      // reader who opened a list and changed their mind is asking for. So the
      // outer layer stands down while an inner one is open, and a second press
      // closes it.
      if (details.querySelector(DISMISS_OPEN_SELECTOR)) return;
      details.open = false;
      // Focus goes back to the control that opened the panel, not to the top
      // of the document — otherwise closing the menu loses the reader's place.
      details.querySelector("summary")?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // `toggle` rather than a click handler on the summary: <details> also opens
  // from the keyboard, from a find-in-page hit, and from the `open` property
  // the two effects above set directly. This fires for all of them, so the
  // React state can never disagree with the element about whether it is open.
  return (
    <details
      ref={ref}
      id={id}
      className={className}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  );
}
