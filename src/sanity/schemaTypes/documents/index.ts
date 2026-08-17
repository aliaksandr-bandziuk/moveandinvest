import { country } from "./country";
import { countryPage } from "./countryPage";
import { faqItem } from "./faqItem";
import { homePage } from "./homePage";
import { partnersPage } from "./partnersPage";
import { siteSettings } from "./siteSettings";

export const documentTypes = [
  // Singletons (one document per language each)
  siteSettings,
  homePage,
  partnersPage,
  // Jurisdictions: a language-neutral registry plus its translated pages
  country,
  countryPage,
  // Reusable across pages: the home page renders all of them, a jurisdiction
  // page renders the ones tagged with it.
  faqItem,
];

// Deliberately NOT in `documentTypes`. Enquiries carry personal data and
// live in their own private dataset; registering this type in the content
// workspace would put a document type that holds names and emails one
// public GROQ query away. See enquiry.ts.
export { enquiry } from "./enquiry";
