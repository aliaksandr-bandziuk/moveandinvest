"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/headings";

import styles from "./ArticleToc.module.scss";

// The contents of one entry: in the right margin from lg, and above the body as
// a closed disclosure below that.
//
// A SCROLL POSITION READ ON A FRAME, not an IntersectionObserver. The observer
// is the cheaper instrument and it answers a different question: it says which
// headings are inside a band, which is empty for every long section whose
// heading has scrolled away — precisely the case that lasts longest while
// somebody reads. Handling that means remembering the last non-empty answer,
// and remembering breaks the moment a reader scrolls back up. Asking "which is
// the last heading above the line" answers it directly at any position,
// including both ends. Throttled to one read per frame; the read itself is a
// getBoundingClientRect per heading, of which there are fifteen.
//
// I FIRST BUILT THIS WITHOUT THE MOBILE HALF, on the argument that a fifteen
// item list between the standfirst and the first paragraph is a map the reader
// has to scroll past before reaching the territory. That argument holds for an
// open list and not for a closed one: shut, this is one line, and the article
// it sits above is three thousand words with fifteen sections. So it is a
// <details> — the same disclosure the header menu and the FAQ already use —
// rather than nothing.
//
// BOTH ARE IN THE MARKUP AND ONE IS DISPLAYED. `display: none` takes an element
// out of the accessibility tree entirely, so a screen reader is never offered
// the list twice; the cost is fifteen list items of HTML that no reader at that
// width will ever be shown, which is cheaper than the alternatives — forcing a
// <details> open from CSS is not possible, and doing it from script means the
// contents flash open on a phone before the effect runs.

/** How far below the viewport top a heading counts as "reached". Slightly more
 *  than the sticky header so the section marked active is the one under the
 *  header rather than the one hidden behind it. */
const ACTIVE_LINE = 120;

function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0]);
  const key = ids.join("|");

  useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;

    const read = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= ACTIVE_LINE) current = id;
        else break;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // Keyed on the joined ids rather than the array, so a new array holding the
    // same ids does not tear the listener down and put it back.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}

function List({
  headings,
  active,
}: {
  headings: TocHeading[];
  active: string | undefined;
}) {
  return (
    <ol className={styles.list}>
      {headings.map((heading) => (
        <li key={heading.key} data-level={heading.level}>
          <a
            href={`#${heading.id}`}
            className={styles.link}
            data-active={heading.id === active ? "true" : undefined}
            // The active item is announced as the current one rather than only
            // coloured — colour alone says nothing to a screen reader, and this
            // is a navigation landmark.
            aria-current={heading.id === active ? "true" : undefined}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ArticleToc({
  headings,
  label,
}: {
  headings: TocHeading[];
  label: string;
}) {
  // H2 ONLY. The h3s keep their anchors — they are still linkable, and the
  // renderer still puts ids on them — but they do not go in this list. With
  // them the Greek section alone contributed four entries out of fifteen and
  // the list stopped being a map of the article and became a copy of it.
  // Tracking follows the same rule: while a reader is inside a subsection, the
  // section it belongs to is what should be marked.
  const sections = headings.filter((heading) => heading.level === "h2");
  const active = useActiveHeading(sections.map((heading) => heading.id));

  // Under four sections there is nothing to navigate: the whole list would fit
  // on one screen of the article itself.
  if (sections.length < 4) return null;

  return (
    <>
      <details className={styles.mobile}>
        <summary className={styles.summary}>{label}</summary>
        <div className={styles.panel}>
          <List headings={sections} active={active} />
        </div>
      </details>

      <nav className={styles.toc} aria-label={label}>
        <p className={styles.label}>{label}</p>
        <List headings={sections} active={active} />
      </nav>
    </>
  );
}
