import { CONTROLLER } from "./controller";

// Every way to reach this project, in one place.
//
// ONE MODULE, READ BY THREE THINGS: the /contacts page, the Organization node
// in the JSON-LD, and the footer. The site has already been bitten twice by a
// channel that existed in one place and not another — `partners@` printed on
// the partners page with no mailbox behind it, and `hello@` on the broken-form
// panels answering nowhere. A phone number typed into a page and forgotten in
// the markup is the same defect wearing different clothes.
//
// AN EMPTY STRING MEANS THE CHANNEL DOES NOT EXIST, and everything that reads
// this file renders nothing for it. Not a placeholder, not a "coming soon", not
// a dead link — the same rule as the portrait on /about. A channel nobody
// answers is worse than a channel that is absent: somebody writes into it, gets
// silence, and concludes the project is not real. That conclusion is much
// harder to reverse than a missing row.
//
// FILL THESE IN AS THEY BECOME REAL. Each one appears on the site the moment it
// has a value here and disappears the moment it is emptied again.

export interface SocialProfile {
  /** Shown to the reader. */
  label: string;
  url: string;
}

export const CHANNELS = {
  /** The one mailbox the project has. Never typed anywhere else — see
   *  controller.ts. */
  email: CONTROLLER.email,

  /** E.164, with the plus and no spaces: "+48123456789". That format is what
   *  `tel:` expects and what schema.org's ContactPoint expects, and a number
   *  typed with spaces works in neither. The page formats it for display. */
  phone: "+48786517446",

  /** Digits only, no plus — that is what wa.me takes: "48123456789". Usually
   *  the same number as `phone`, but kept separate because it need not be.
   *  A wa.me link loads no script and sets no cookie on this domain, which is
   *  why it is the cheapest channel here in every sense. */
  whatsapp: "48786517446",

  /** The booking page's URL — Google Calendar appointment schedule, Cal.com,
   *  Calendly, whatever it ends up being. EMPTY BY DECISION on 24 Aug 2026, not
   *  by omission: a public booking link with no anti-spam filter (email
   *  verification is a paid tier on Google's appointment schedules) is an open
   *  invitation to fill a calendar with rubbish, and there is no traffic yet to
   *  justify the risk. The row appears the moment this has a value.
   *
   *  A LINK, NEVER AN EMBED, and this is a decision rather than a shortcut. An
   *  iframe from any of those providers pulls a third-party script onto this
   *  domain, sets third-party cookies, and therefore needs: a consent gate, a
   *  new paragraph in the privacy policy naming the provider and its country,
   *  and an entry in the suppliers list. It buys exactly one thing — the reader
   *  does not leave the page. That is not worth three edits to a legal text.
   *  Opened in a new tab, none of it applies. */
  booking: "",

  /** Only profiles that exist and belong to the project. These also populate
   *  `sameAs` in the Organization node, which is precisely why the list may not
   *  be padded: `sameAs` is how a search engine confirms an identity, and a URL
   *  that does not confirm anything is worse there than an empty array. */
  socials: [] as SocialProfile[],
} as const;

/** True when there is anything beyond the email — which is what decides
 *  whether the channels block renders as a list or as a single line. */
export function hasDirectChannels(): boolean {
  return Boolean(CHANNELS.phone || CHANNELS.whatsapp || CHANNELS.booking);
}

/** "+48123456789" → "+48 123 456 789". Grouped for reading; the `tel:` href
 *  always uses the raw E.164 value, because that is what a dialler parses. */
export function formatPhone(e164: string): string {
  if (!e164) return "";
  const digits = e164.replace(/[^\d+]/g, "");
  const rest = digits.startsWith("+") ? digits.slice(1) : digits;
  // Country code is not derivable without a library, and pulling one in for a
  // single number would be silly. Groups of three from the left after a
  // two-digit prefix reads correctly for +48 and degrades harmlessly for the
  // rest — a number a human can read, not a canonical rendering.
  const prefix = rest.slice(0, 2);
  const body = rest.slice(2).replace(/(\d{3})(?=\d)/g, "$1 ");
  return `+${prefix} ${body}`.trim();
}

/** The wa.me address. Empty when there is no WhatsApp. */
export function whatsappHref(): string {
  return CHANNELS.whatsapp ? `https://wa.me/${CHANNELS.whatsapp}` : "";
}
