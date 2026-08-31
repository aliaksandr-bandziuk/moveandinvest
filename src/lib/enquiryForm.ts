import type { EnquiryFormProps } from "@/components/marketing";
import type { CountryRowResult, HomePageResult } from "@/sanity/types";

// ONE MAPPING FROM THE HOME PAGE DOCUMENT TO THE FORM'S PROPS, because as of
// 31 August 2026 there are two pages rendering that form and there was nearly a
// second copy of fifty lines of prop plumbing.
//
// A second copy would not have failed loudly. It would have gone on working
// until somebody added an option to the budget question in Studio and it
// appeared on one of the two pages — and the two pages post to the same route
// handler, whose allow-list would then reject the new value from one of them
// and accept it from the other. That is the kind of divergence nobody finds by
// looking at either file.
//
// WHY THE COPY LIVES ON THE HOME PAGE DOCUMENT AND NOT ON enquiryPage. The
// consent checkbox is the reason. It is the sentence a reader agrees to before
// their circumstances are passed to a firm, and two editable copies of it is two
// sentences that can drift apart while one route handler treats both as the same
// permission. So there is one, on the document that had it first, and /enquiry
// reads it — which is also why ENQUIRY_PAGE_TAGS lists `homePage`.
//
// The VALUES are not here. Every option's value — "pt", "over800", "half-year"
// — is fixed in the component call below and checked again against the
// allow-lists in /api/enquiry. Labels are editable; values are not.
export function enquiryFormProps({
  enquiry,
  countries,
  locale,
  from,
  index,
}: {
  enquiry: HomePageResult["enquiry"];
  /** The five jurisdictions in registry order, so the form and the comparison
   *  table cannot disagree about what a country is called. */
  countries: CountryRowResult[];
  locale: string;
  from: "home" | "enquiry";
  /** The home page's section number. Omitted on /enquiry, which is a page and
   *  not the eighth of anything. */
  index?: string;
}): EnquiryFormProps {
  return {
    ...(index ? { index } : {}),
    eyebrow: enquiry.eyebrow,
    heading: enquiry.heading,
    intro: enquiry.intro,
    locale,
    from,
    fork: {
      chosenIndex: "01",
      chosenTitle: enquiry.fork.chosenLabel,
      chosenBody: enquiry.fork.chosenBody,
      undecidedIndex: "02",
      undecidedTitle: enquiry.fork.openLabel,
      undecidedBody: enquiry.fork.openBody,
    },
    jurisdictions: countries.map((country) => ({
      value: country.code,
      label: country.name,
    })),
    openOptions: [
      { value: "undecided", label: enquiry.fork.undecidedOption },
      { value: "other", label: enquiry.fork.otherOption },
    ],
    budget: {
      legend: enquiry.budget.label,
      options: [
        { value: "500", label: enquiry.budget.upTo500 },
        { value: "800", label: enquiry.budget.upTo800 },
        { value: "over800", label: enquiry.budget.over800 },
        { value: "unknown", label: enquiry.budget.unknown },
      ],
    },
    timeline: {
      legend: enquiry.timeline.label,
      options: [
        { value: "fast", label: enquiry.timeline.fast },
        { value: "half-year", label: enquiry.timeline.halfYear },
        { value: "year", label: enquiry.timeline.year },
        { value: "browsing", label: enquiry.timeline.browsing },
      ],
    },
    goals: {
      legend: enquiry.goals.label,
      hint: enquiry.goals.hint,
      options: [
        { value: "residency", label: enquiry.goals.residency },
        { value: "tax", label: enquiry.goals.tax },
        { value: "passport", label: enquiry.goals.passport },
        { value: "business", label: enquiry.goals.business },
        { value: "property", label: enquiry.goals.property },
      ],
    },
    situation: {
      legend: enquiry.contact.situationLabel,
      hint: enquiry.contact.situationHint,
    },
    contact: {
      legend: enquiry.contact.contactLabel,
      name: enquiry.contact.nameLabel,
      email: enquiry.contact.emailLabel,
    },
    consent: enquiry.contact.consentLabel,
    fine: enquiry.fine,
    privacyLabel: enquiry.privacyLabel,
    submit: enquiry.contact.submitLabel,
    sent: {
      title: enquiry.result.sentTitle,
      body: enquiry.result.sentBody,
    },
    broke: {
      title: enquiry.result.brokeTitle,
      body: enquiry.result.brokeBody,
    },
    failed: {
      title: enquiry.result.failedTitle,
      body: enquiry.result.failedBody,
    },
    honeypot: enquiry.contact.honeypotLabel,
  };
}
