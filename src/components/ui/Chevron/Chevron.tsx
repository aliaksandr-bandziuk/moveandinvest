interface ChevronProps {
  /** Sizing and the rotation for the open state come from the caller. */
  className?: string;
}

// The disclosure mark on a <details> summary. An SVG, and the reason is the
// two bugs the CSS version had — both of them one root cause.
//
// IT USED TO BE A ROTATED SQUARE with border-right and border-bottom, the
// common trick. Its box is much larger than its ink: the visible "v" is one
// corner of a square, so the box extends up and left into empty space. Two
// consequences, and a reader reported both without knowing they were the same
// thing.
//
//   * IT SAT LOW. `align-items: center` centres the BOX; the eye reads the INK.
//     The ink is in the lower-right of that box, so a perfectly centred box
//     looks like a mark hanging below the text beside it. Chasing this with a
//     negative margin is fitting a constant to one font size, and it was still
//     wrong at the next one.
//
//   * IT DID NOT SPIN IN PLACE. Rotation is about the box centre, which is not
//     the ink's centre, so flipping open swung the corner through an arc
//     instead of turning it over. That is what "rotates strangely" was.
//
// Here the viewBox wraps the stroke tightly, so the box IS the ink: centring is
// exact at any size with no correction, and rotate(180deg) turns the mark about
// its own middle. Both complaints disappear rather than being compensated for.
//
// `aria-hidden` because the summary it sits in already says what it does, and
// `focusable="false"` because IE-era SVG otherwise takes a tab stop — cheap
// insurance, no cost.
export function Chevron({ className }: ChevronProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 1 5 5 9 1" />
    </svg>
  );
}
