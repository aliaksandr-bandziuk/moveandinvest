// THE RESIDENCE FORM'S ANSWERS, AS TOKENS, IN THE ORDER THE CHIPS APPEAR.
//
// One list read by two places: the route's allow-list, which drops anything not
// here, and the entry page, which renders a chip per token with its label from
// the message catalogue. When the two kept their own copies, a chip added to the
// form and forgotten in the route would have been posted and silently dropped —
// the failure every other allow-list in the route warns about in a comment.
// Here it cannot happen.
//
// The decode maps in src/lib/enquiry/sender.ts are the third reader and are
// still typed by hand, because they are a Russian sentence per token rather
// than a token; a missing one prints the raw token, which is legible enough.
//
// Tokens are stable. A label can be reworded in the catalogue at any time; a
// token that changed meaning would change the meaning of every stored answer.
export const RESIDENCE_TOKENS = {
  citizenship: ["ua", "by", "ru", "other"],
  status: ["ukr", "card", "pending", "visa", "unsure"],
  matter: ["waiting", "refusal", "cukr", "temporary", "permanent", "citizenship", "other"],
  deadline: ["soon", "months", "none", "unsure"],
} as const;

/** The /sources section whose presence on an entry makes it an entry about
 *  staying in Poland — and therefore ends it with the residence form rather
 *  than the guide block. See the note in blog/[slug]/entry.tsx. */
export const RESIDENCE_SOURCE_KEY = "pl-legal";
