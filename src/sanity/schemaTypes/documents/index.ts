import { country } from "./country";
import { countryPage } from "./countryPage";
import { faqItem } from "./faqItem";
import { homePage } from "./homePage";
import { partnersPage } from "./partnersPage";
import { privacyPage } from "./privacyPage";
import { propertyPage } from "./propertyPage";
import { siteSettings } from "./siteSettings";

export const documentTypes = [
  // Singletons (one document per language each)
  siteSettings,
  homePage,
  partnersPage,
  privacyPage,
  // Jurisdictions: a language-neutral registry plus its translated pages
  country,
  countryPage,
  // The buying half. Shares the top-level URL space with countryPage — see the
  // arbitration in src/app/[locale]/[slug]/page.tsx.
  propertyPage,
  // Reusable across pages: the home page renders all of them, a jurisdiction
  // page renders the ones tagged with it.
  faqItem,
];

// Deliberately NOT in `documentTypes`. All three types below carry personal
// data and live in their own private dataset; registering any of them in the
// content workspace would put a document type that holds names, emails and a
// mailing list one public GROQ query away. See enquiry.ts.
export { enquiry } from "./enquiry";
export { partnerEnquiry } from "./partnerEnquiry";
export { subscriber } from "./subscriber";
