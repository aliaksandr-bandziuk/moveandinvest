"use client";

import { useEffect, useRef, useState } from "react";

interface InViewProps {
  children: React.ReactNode;
  /** Fraction of the element that must be visible before it counts as seen. */
  threshold?: number;
  className?: string;
}

// Behaviour only, no content of its own — the same contract as Reveal.
// `children` is built on the SERVER and handed in complete; this component
// just sets data-inview on a wrapper once the block scrolls into view, and
// the section's own stylesheet decides what that means.
//
// Why a shared primitive rather than animation inside each section: the
// alternative is marking a section "use client", which would move its markup
// out of the server render and hide the numbers from any crawler that does
// not execute JS. Those numbers are the reason the page exists.
export function InView({ children, threshold = 0.25, className }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // prefers-reduced-motion is handled in CSS, not here: the animated start
    // state only exists inside a no-preference media query, so a reader who
    // asked for less motion gets the finished state whatever this does.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className} data-js="on" data-inview={seen ? "true" : "false"}>
      {children}
    </div>
  );
}
