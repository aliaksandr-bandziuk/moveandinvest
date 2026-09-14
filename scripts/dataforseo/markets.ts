// The markets every DataForSEO script measures, in one place, so that two
// scripts cannot quietly measure two different things and be compared anyway.
//
// EVERY CODE HERE WAS READ OUT OF THE LIVE DIRECTORY ON 11 SEPTEMBER 2026 by
// `npm run dfs:locations`, not remembered. Re-run that command before changing
// any line of this file.
//
// WHY THERE IS NO RUSSIA, AND WHY THE RUSSIAN ROWS BARELY WORK. Labs covers
// 94 countries and Russia is not among them; neither is it among the 270 385
// entries of the SERP API's own, much larger directory. Measured 11 September
// 2026: DataForSEO cannot query Google for Russia through any of its APIs.
// Russian is offered through Kazakhstan and Ukraine, and there the position
// data is thin by two orders of magnitude — immigrantinvest.com has 19 161
// ranking keywords in the United States against 153 in Kazakhstan and 302 in
// Ukraine, and prian.ru, a purely Russian-language portal, has 92 and 238.
// Volume data for Russian is fine; POSITION data is not.
//
// Search Console for the three months to 8 September 2026 puts the
// Russian-language audience across Russia (35 impressions), Ukraine (12),
// Armenia (3), Belarus and Georgia (1 each) — dispersed, with the largest
// share in the one country no API can see. Both proxies are measured rather
// than one being picked, and neither is the audience: a competitor table for
// ru built on them would be a table of who happens to rank in Kazakhstan.
//
// WHY TWO ENGLISH MARKETS. Search Console puts the United States at 166
// impressions and the United Kingdom at 136 — close enough that choosing one
// would throw away half the evidence, and the site has separate articles
// addressed to each ("moving to greece from the us", "living in greece from
// the uk"). Their SERPs differ; a single "English" reading would average two
// different competitive fields into one that exists nowhere.

export interface Market {
  /** Short key used in filenames and report columns. */
  key: string;
  locationCode: number;
  locationName: string;
  languageCode: string;
  /** Whether this market stands for the audience itself or only proxies it. */
  proxy: boolean;
  /** False where DataForSEO Labs does not carry this pairing at all. Labs has
   *  Poland with Polish only, so a Russian or Ukrainian reading of Poland
   *  exists for the SERP and Google Ads endpoints and for nothing that asks
   *  Labs. Scripts that call Labs skip these rather than fail on them. */
  labs?: boolean;
}

export const MARKETS: Market[] = [
  { key: "en-US", locationCode: 2840, locationName: "United States", languageCode: "en", proxy: false },
  { key: "en-GB", locationCode: 2826, locationName: "United Kingdom", languageCode: "en", proxy: false },
  { key: "pl-PL", locationCode: 2616, locationName: "Poland", languageCode: "pl", proxy: false },
  { key: "ru-KZ", locationCode: 2398, locationName: "Kazakhstan", languageCode: "ru", proxy: true },
  { key: "ru-UA", locationCode: 2804, locationName: "Ukraine", languageCode: "ru", proxy: true },
  // ADDED 14 SEPTEMBER 2026 for the Polish legalisation question. These are
  // not proxies: the readers are in Poland and search in these languages. Ads
  // keyword data and the SERP API both accept the pairing; Labs does not.
  { key: "ru-PL", locationCode: 2616, locationName: "Poland", languageCode: "ru", proxy: false, labs: false },
  { key: "uk-PL", locationCode: 2616, locationName: "Poland", languageCode: "uk", proxy: false, labs: false },
];

/** The site's own domain, without protocol or www — the form Labs expects. */
export const TARGET = "moveandinvest.com";

export function marketsFor(languageCode: string): Market[] {
  return MARKETS.filter((market) => market.languageCode === languageCode);
}
