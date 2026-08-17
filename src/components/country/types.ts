// The shape every comparison surface consumes. Assembled in a page from a
// `countryPage` document joined to its `country` — the components below
// never fetch, so the same row data can come from Sanity, from a fixture in
// the styleguide, or from a seed script without changing a component.
export interface CountryRow {
  /** country._id — stable key across locales. */
  id: string;
  /** Translated jurisdiction label as it should read in this locale. */
  name: string;
  /** ISO 3166-1 alpha-2, lowercase. Joins a row to its map geometry. */
  code: string;
  status: "live" | "planned" | "paused";
  /** Path to the jurisdiction page, without a locale prefix. Absent while planned. */
  href?: string;
  route: string;
  minimumInvestment: string;
  timeToPermit: string;
  taxRegime: string;
}
