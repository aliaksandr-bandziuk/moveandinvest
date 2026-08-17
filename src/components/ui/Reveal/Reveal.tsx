"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.scss";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger index. Each step delays the reveal by one unit. */
  order?: number;
  /** Direction the element travels in from. */
  from?: "below" | "left" | "right";
  className?: string;
}

// The one client component on the page, and it deliberately contains no
// content of its own.
//
// This is the answer to "JS animation without client-rendered content":
// `children` is rendered on the SERVER and passed in already-built. This
// component only wraps it in a div and toggles a class once it scrolls into
// view. Every crawler — including the answer engines, which do not execute
// JS — receives the full text in the initial HTML, and the animation is a
// class that never arrives for them. Nothing is hidden behind JS; the CSS
// starts from a visible state and is only made to travel when a
// data-attribute says JS is present (see Reveal.module.scss).
//
// The observer disconnects after the first trigger: this is an entrance, not
// a state to keep in sync, and a live observer per element on a long page is
// a cost with no payoff.
export function Reveal({ children, order = 0, from = "below", className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // prefers-reduced-motion is handled entirely in CSS: the hidden start
    // state only exists inside a `no-preference` media query, so a reader
    // who asked for reduced motion sees the content immediately no matter
    // what this observer does. Deliberately NOT duplicated here — a JS copy
    // of that check would be a second source of truth that can disagree.
    //
    // An element already on screen at mount fires the observer immediately,
    // so above-the-fold content does not wait for a scroll that may never
    // happen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const classes = [styles.reveal, className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      data-js="on"
      data-from={from}
      data-shown={shown ? "true" : "false"}
      style={{ "--reveal-order": order } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
