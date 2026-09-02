import type { Locale } from "@/i18n/routing";

// WHO WROTE THE ENTRY. One definition, imported by the byline, the end-of-entry
// block and the BlogPosting node, for the same reason CONTROLLER is one
// definition: a name written down three times is a name that will eventually
// disagree with itself.
//
// "ALEX BANDZIUK", NOT "ALIAKSANDR BANDZIUK", AND THE TWO ARE NOT
// INTERCHANGEABLE. controller.ts holds the legal identity — the person the
// privacy policy names as the data controller, the one attached to a NIP. This
// is the professional name a reader sees over an article. Neither may be
// substituted for the other: putting the byline name on the policy would name
// a person who does not legally exist, and putting the legal spelling on an
// article would be a byline nobody searches for.
//
// LANGUAGE-NEUTRAL NAME, TRANSLATED ROLE. Same rule as the controller: a name
// transliterated into Cyrillic for the Russian page is a second person as far
// as an answer engine is concerned. What he does is a sentence, so it is
// written in each language.
//
// "FOUNDER", NOT "CEO", AND THE CHOICE IS FORCED BY controller.ts. The business
// there is a JDG — a Polish sole trader — which has no board and therefore no
// officers, so a chief executive of it is a post that does not exist. The role
// also travels: it is the line under every byline AND the line in the outreach
// signature, and a recipient who opens the site after the letter must find the
// same person in the same role. Changed from "Publisher" on 2 Sep 2026 — that
// word reads as "publishing house" to a non-native reader, which is most of
// the people the letters go to.
export const AUTHOR = {
  name: "Alex Bandziuk",
  /** Where the JSON-LD points for the person. The /about page is the only page
   *  that explains how the figures are checked, which is what a reader
   *  following a byline wants. */
  page: "/about",
  /** Profiles that are the same person, in the order they are shown.
   *
   *  URLS ONLY, NO ICONS. Which glyph draws a network is a rendering decision
   *  and belongs where the rendering is; this file is imported by the JSON-LD
   *  builder too, and a React component reaching that far would be a component
   *  in a data module. The same list feeds the Person node's `sameAs`, which is
   *  the part of this that a search engine reads: it is how a name on a page
   *  becomes the same entity as a name on LinkedIn. */
  profiles: [
    {
      network: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/bandziuk/",
    },
    {
      network: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/bandziuk/",
    },
  ],
} as const;

export interface AuthorCopy {
  /** Under the name. What he is on this site, not a job title. */
  role: string;
  /** One sentence at the end of the entry. Not a biography. */
  line: string;
  /** The link out of that block. */
  more: string;
  /** Prefix for the byline in the head: "By Alex Bandziuk". */
  by: string;
}

const COPY: Record<Locale, AuthorCopy> = {
  en: {
    role: "Founder, moveandinvest",
    line: "Checks every threshold, fee and deadline on this site against the instrument that states it, and publishes the instrument alongside the figure.",
    more: "How these figures are checked",
    by: "By",
  },
  ru: {
    role: "Основатель moveandinvest",
    line: "Сверяет каждый порог, сбор и срок на этом сайте с документом, который его устанавливает, и публикует документ рядом с цифрой.",
    more: "Как проверяются эти цифры",
    by: "Автор:",
  },
  pl: {
    role: "Założyciel moveandinvest",
    line: "Sprawdza każdy próg, opłatę i termin w tym serwisie z aktem, który go ustanawia, i publikuje ten akt obok liczby.",
    more: "Jak sprawdzamy te liczby",
    by: "Autor:",
  },
};

/** The author copy for a route's locale.
 *
 *  Takes a plain string because that is what a route param is: `[locale]` is
 *  typed as `string` all the way down this page, and a cast at the call site
 *  would be a lie about where the value came from. Falling back to English
 *  rather than throwing — a locale that is not one of the three cannot reach
 *  here through the middleware, and if one ever does, an entry with an English
 *  byline is a better page than a 500. */
export function authorCopy(locale: string): AuthorCopy {
  return COPY[locale as Locale] ?? COPY.en;
}
