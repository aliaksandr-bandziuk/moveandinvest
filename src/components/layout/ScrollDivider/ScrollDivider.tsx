import Image from "next/image";
import styles from "./ScrollDivider.module.scss";

interface ScrollDividerProps {
  src: string;
  /** Empty string for a decorative photograph, which this usually is. */
  alt: string;
  width: number;
  height: number;
}

// A scroll reveal with no JavaScript at all. No scroll listener, no rAF loop,
// no IntersectionObserver, no library.
//
// The mechanic, in two parts:
//
//   1. The FRAME is an ordinary in-flow block. It scrolls like everything
//      else on the page.
//   2. The IMAGE inside it is `position: fixed`, sized to the viewport, and
//      never moves. Not transformed, not animated, not touched by scroll.
//
// What produces the motion is the frame's `clip-path: inset(0)`. clip-path
// clips its whole subtree at PAINT time, which reaches across the
// containing-block boundary a fixed element would otherwise escape —
// `overflow: hidden` alone does NOT clip a fixed child. So the frame becomes
// a moving window onto a stationary photograph, and the parallax is the
// window travelling, not the image.
//
// One precondition, and it is the thing that silently breaks this: no
// ancestor between the frame and <html> may set transform, filter,
// perspective, backdrop-filter or will-change on any of those. Any of them
// makes that ancestor the containing block for the fixed image, the image
// stops being viewport-anchored, and the effect degrades to a static crop
// with no error anywhere. Verified against this project's tree before
// shipping — nothing between <body> and here sets one.
//
// Reduced motion drops to a plain cropped image via a media query in the
// stylesheet; there is no JS branch because there is no JS.
export function ScrollDivider({ src, alt, width, height }: ScrollDividerProps) {
  return (
    <div className={styles.divider}>
      <div className={styles.frame}>
        <Image
          className={styles.image}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="100vw"
          // Below the fold on every page by definition — it sits between the
          // last section and the footer.
          priority={false}
        />
      </div>
    </div>
  );
}
