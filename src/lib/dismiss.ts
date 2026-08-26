/** The attribute that opts a <details> into closing on an outside click or on
 *  Escape. Read by DetailsDismiss, written by the header's dropdowns.
 *
 *  A PLAIN MODULE, AND THAT IS THE WHOLE POINT OF IT. This lived in
 *  DetailsDismiss.tsx, which carries "use client". Next replaces every export
 *  of a client module with a reference the client runtime resolves later, so a
 *  server component importing this constant did not get a string — it got a
 *  proxy that throws when called. Spread as an attribute name it produced
 *  `Invalid attribute name: function() { throw new Error("Attempted to call
 *  DISMISS_ATTR() from the server...") }`, a hydration mismatch, and the same
 *  text again as an unrecognised DOM prop.
 *
 *  Neither `tsc` nor eslint can see this: the types line up exactly, and the
 *  rule being broken is a Next.js boundary rule enforced at runtime. `next
 *  build` would have caught it and cannot run in the environment this was
 *  written in — so the check that would have found it is the one that was not
 *  available, which is worth knowing about rather than working around.
 *
 *  A file with no "use client" and no server-only import can be imported by
 *  both sides, and a constant shared across the boundary belongs in one. */
export const DISMISS_ATTR = "data-dismiss-outside";

/** Every such <details> that is currently open, outermost first. */
export const DISMISS_OPEN_SELECTOR = `details[${DISMISS_ATTR}][open]`;
