import type { Locale } from "./jurisdictions";
import { FAQ_HOME } from "../../src/lib/faqData";

// The six questions the HOME PAGE shows, seeded into Sanity as `faqItem`
// documents and rendered in section 06.
//
// A RE-EXPORT SINCE 25 AUGUST 2026, NOT A SOURCE. The text used to live here,
// in full, in three languages. Then /faq was built and needed the same six
// among its fifty-two — and two copies of one answer is how a figure gets
// corrected in one place and not the other. The same lesson this project has
// already learned three times over, most recently on the very day this file
// was rewritten, when the Greek sanction figures on /sources turned out to
// disagree with the Greek property page's own prose about the same statute.
//
// So the answers moved to src/lib/faqData.ts, where all fifty-two live
// together, where each one names the section of /sources its figures were
// checked against, and where a build fails if an answer states a figure and
// names no source. This file now only reshapes six of them into the shape the
// seed script writes.
//
// WHY THE SHAPE IS STILL DIFFERENT. `faqItem` is a Sanity document with a
// `question`, an `answer` and a list of jurisdiction references, and it is
// referenced from jurisdiction pages as well as the home page. faqData.ts
// knows nothing about Sanity. The mapping is here rather than in src/lib
// because it is a fact about the seed, not about the content.

export interface FaqSeed {
  key: string;
  /** Jurisdiction ids a question is specific to. Empty means all five. */
  countries: string[];
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

export const FAQ_ITEMS: FaqSeed[] = FAQ_HOME.map((item) => ({
  key: item.key,
  countries: item.countries,
  q: item.q as Record<Locale, string>,
  a: item.a as Record<Locale, string>,
}));
