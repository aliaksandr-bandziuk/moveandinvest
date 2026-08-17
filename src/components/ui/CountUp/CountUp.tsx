"use client";

import { useEffect, useRef } from "react";

interface CountUpProps {
  /** The final value, already formatted on the server. Rendered as-is. */
  children: string;
  /** The same value as a number, for the animation to run towards. */
  value: number;
  /** BCP-47 tag and options used to format each intermediate frame. */
  locale: string;
  currency?: string;
  durationMs?: number;
}

// Counts up to a figure that is ALREADY in the HTML.
//
// The server renders the final, formatted string; this component never
// replaces it through React. On mount it captures that exact text, animates
// by writing textContent directly, and writes the captured original back on
// the last frame. Three consequences worth stating:
//
//   1. A crawler, a reader with JS off, or a failed bundle all see the real
//      number — the animation is an enhancement laid over finished content.
//   2. There is no hydration mismatch, because React renders the same string
//      on both sides and the animation happens outside its control.
//   3. The final frame is byte-identical to the server's formatting, even if
//      Intl in the browser would have rounded a fraction differently.
//
// tabular-nums (applied by the figure-text mixin) is what stops the width
// from jittering while the digits change.
export function CountUp({
  children,
  value,
  locale,
  currency,
  durationMs = 900,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const finalText = node.textContent ?? "";
    const format = new Intl.NumberFormat(locale, {
      style: currency ? "currency" : "decimal",
      currency,
      maximumFractionDigits: 0,
    });

    let raf = 0;
    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      // Ease-out cubic: fast at the beginning, settles rather than stops.
      const eased = 1 - (1 - t) ** 3;
      node.textContent =
        t >= 1 ? finalText : format.format(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };

    // Only animate once the figure is actually on screen — a number that
    // finished counting before the reader arrived has animated for nobody.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            raf = requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = finalText;
    };
  }, [value, locale, currency, durationMs]);

  return (
    <span ref={ref} data-figure>
      {children}
    </span>
  );
}
