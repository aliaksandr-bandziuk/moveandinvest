// WHO PUBLISHES THIS SITE. One definition, imported by everything that names
// it, because a legal identity written down twice is a legal identity that
// will eventually disagree with itself.
//
// It lived in scripts/copy/privacy.ts until 24 Aug 2026, which was correct
// while the policy was the only page that named it. Three things now do: the
// policy (as the data controller), the /about page (as the person answerable
// for a wrong figure), and the Organization node in the JSON-LD (as the
// publisher). Two of those three are rendered by the app, which cannot import
// from scripts/ — so the definition moved here and the copy script imports it
// back across the boundary. That direction is the right one: `src` is the
// thing that ships.
//
// LANGUAGE-NEUTRAL ON PURPOSE. Not translated, not per-locale, and not
// editable in the CMS. A name spelled differently in Polish and Russian is how
// one legal entity becomes two, and a NIP translated into anything is still
// the same number.
export const CONTROLLER = {
  name: "Aliaksandr Bandziuk",
  form: "JDG (jednoosobowa działalność gospodarcza), Poland",
  nip: "9512630588",
  email: "office@moveandinvest.com",
  /** Where the business is registered. Needed by the Organization node; a
   *  publisher with no country is a publisher an answer engine cannot place. */
  country: "PL",
} as const;

/** The one-line identity used under a name: legal form and tax number. */
export function controllerIdentity(): string {
  return `${CONTROLLER.form} · NIP ${CONTROLLER.nip}`;
}
