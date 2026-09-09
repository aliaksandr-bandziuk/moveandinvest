// WHAT THE STATE TAKES WHEN A PROPERTY CHANGES HANDS, AS DATA.
//
// This is deliberately NOT src/lib/costModel.ts, and the boundary between them
// is worth stating because the two will otherwise drift into computing the same
// number twice and disagreeing.
//
//   costModel.ts   answers "what does this RESIDENCE ROUTE cost" — agency fees,
//                  permits, legal work, fund charges, the lot. Its Portuguese
//                  branch has no transfer tax at all, and correctly so: Lei
//                  56/2023 art. 53 revoked the property options, so the
//                  Portuguese golden visa is a fund subscription and nothing is
//                  transferred.
//
//   this file      answers "what does the STATE take when the deed is signed",
//                  for anyone buying, route or no route. Portugal belongs here
//                  precisely because it does not belong there.
//
// So this module models transfer taxes and the charges set by the SAME
// instrument, and nothing else. Notary scales, cadastre fees, agents'
// commissions and the Dubai administrative tariff stay in costModel.ts. A
// reader who wants the whole cost of a route is sent there; a reader who wants
// to know what the tax is gets an answer that is only the tax.
//
// --- CONFIDENCE, INHERITED FROM costModel.ts --------------------------------
//
// Same three levels, same reason. Every line says whether an authority sets it
// and whether we read the instrument. A calculator that prints one total and
// hides which lines are which is the thing this site exists to be an
// alternative to.
//
// --- NO CURRENCY CONVERSION, DELIBERATELY -----------------------------------
//
// Three jurisdictions price in euro and Dubai prices in dirhams, and this
// module will not convert between them. We have no verified rate source, a rate
// read today is wrong tomorrow, and a converted total would be the only number
// on this site that nobody could check against an instrument. The price is
// entered in the currency of the jurisdiction and the answer comes back in it.

export type Confidence = "primary" | "secondary" | "custom";

export type TransferJurisdiction = "pt" | "gr" | "mt" | "ae";

export type Currency = "EUR" | "AED";

export const CURRENCY: Record<TransferJurisdiction, Currency> = {
  pt: "EUR",
  gr: "EUR",
  mt: "EUR",
  ae: "AED",
};

/** The date the Portuguese instruments were read at source. */
export const CHECKED_PT = "2026-09-09";
/** Greek, Maltese and Emirati lines are inherited from the property dossier. */
export const CHECKED_PROPERTY = "2026-08-24";

// --- Portugal ---------------------------------------------------------------
//
// IMT IS NOT A RATE, IT IS TWO SCALES AND A CLIFF, and the cliff is the thing
// every simple calculator gets wrong.
//
// The lower bands are marginal: tax accumulates band by band, the way income
// tax does. The top two bands are not. Código do IMT art. 17 calls them
// "taxa única", and a single rate applies to the WHOLE value rather than to the
// excess over the threshold. Above €1,150,853 that rate is 7.5%; between the
// 8% band and that ceiling it is 6%.
//
// A CLAIM I WROTE HERE AND THEN KILLED ON THE ARITHMETIC. The first version of
// this comment said the scale is non-monotonic — that a purchase just over a
// flat-rate threshold can attract less tax than one just under it. It cannot.
// Scanning the whole scale in €1,000 steps produces no decrease anywhere.
//
// What is actually true is better, and it is a single place rather than a
// general property. The 6% thresholds are set almost exactly where the marginal
// accumulation below them reaches 6%: at €633,931 the scale gives €38,014.59,
// which is 5.997%, and the flat band picks up at 6.000%. That transition is
// smooth to within about twenty euro, and it is smooth by construction.
//
// The €1,150,853 threshold is not. One euro more moves the whole value from 6%
// to 7.5%, and the tax goes from €69,051.18 to €86,314.05 — €17,262.87 for one
// euro of price. That is the cliff, there is exactly one of it, and it is a
// property of the statute rather than of this code.
//
// Read 9 September 2026 at info.portaldasfinancas.gov.pt, Código do IMT art.
// 17, in the table as amended by Lei 73-A/2025 of 30 December 2025.
//
// MAINLAND ONLY. Madeira and the Azores legislate their own reduced tables and
// we have not read them. The calculator says so rather than quietly applying
// mainland numbers to an island purchase.

export type PtCategory =
  | "own-permanent"
  | "other-housing"
  | "rustic"
  | "other-urban"
  | "haven";

type MarginalBand = { upTo: number; rate: number };
type FlatBand = { upTo: number; rate: number; flat: true };
type Band = MarginalBand | FlatBand;

const isFlat = (b: Band): b is FlatBand => "flat" in b;

/**
 * Own and permanent residence — art. 17(1)(a). The first €106,346 is free.
 */
const PT_OWN_PERMANENT: Band[] = [
  { upTo: 106_346, rate: 0 },
  { upTo: 145_470, rate: 0.02 },
  { upTo: 198_347, rate: 0.05 },
  { upTo: 330_539, rate: 0.07 },
  { upTo: 660_982, rate: 0.08 },
  { upTo: 1_150_853, rate: 0.06, flat: true },
  { upTo: Infinity, rate: 0.075, flat: true },
];

/**
 * Housing that is not the buyer's own and permanent residence — art. 17(1)(c).
 * A second home, a let, anything bought through the door most of this site's
 * readers come through. Two differences from the scale above, and both matter:
 * the first band is 1% rather than 0%, and the flat-6% band opens at €633,931
 * rather than €660,982.
 */
const PT_OTHER_HOUSING: Band[] = [
  { upTo: 106_346, rate: 0.01 },
  { upTo: 145_470, rate: 0.02 },
  { upTo: 198_347, rate: 0.05 },
  { upTo: 330_539, rate: 0.07 },
  { upTo: 633_931, rate: 0.08 },
  { upTo: 1_150_853, rate: 0.06, flat: true },
  { upTo: Infinity, rate: 0.075, flat: true },
];

/** Single rates, art. 17(1)(d), (e) and 17(4). */
const PT_FLAT: Record<"rustic" | "other-urban" | "haven", number> = {
  rustic: 0.05,
  "other-urban": 0.065,
  haven: 0.1,
};

/** Tabela Geral do Imposto do Selo, verba 1.1: 0.8% on the value. */
export const PT_STAMP_RATE = 0.008;

function scaleTax(value: number, bands: Band[]): number {
  if (value <= 0) return 0;
  let lower = 0;
  let accumulated = 0;
  for (const band of bands) {
    if (value > band.upTo) {
      if (!isFlat(band)) accumulated += (band.upTo - lower) * band.rate;
      lower = band.upTo;
      continue;
    }
    // The band the value falls in.
    return isFlat(band) ? value * band.rate : accumulated + (value - lower) * band.rate;
  }
  return accumulated;
}

// THE SCALES CHECK THEMSELVES AGAINST THE AUTHORITY'S OWN ARITHMETIC.
//
// Art. 17 publishes a second column beside the marginal rates: the AVERAGE rate
// at the top of each band. That column is redundant for computing anything,
// which is exactly what makes it useful — it is an independent statement of
// what the scale produces, written by the people who wrote the scale.
//
// So every marginal band edge is recomputed here and compared with the
// published average. A mistyped threshold or a rate off by a percentage point
// moves the average and this throws at build time. Reading the table twice with
// my own eyes is what produced the last three defects on this site; this does
// not depend on my eyes.
const PUBLISHED_AVERAGES: Array<{
  label: string;
  bands: Band[];
  at: number;
  average: number;
}> = [
  { label: "a) 145 470", bands: PT_OWN_PERMANENT, at: 145_470, average: 0.005379 },
  { label: "a) 198 347", bands: PT_OWN_PERMANENT, at: 198_347, average: 0.017274 },
  { label: "a) 330 539", bands: PT_OWN_PERMANENT, at: 330_539, average: 0.038361 },
  { label: "c) 106 346", bands: PT_OTHER_HOUSING, at: 106_346, average: 0.01 },
  { label: "c) 145 470", bands: PT_OTHER_HOUSING, at: 145_470, average: 0.012689 },
  { label: "c) 198 347", bands: PT_OTHER_HOUSING, at: 198_347, average: 0.022636 },
  { label: "c) 330 539", bands: PT_OTHER_HOUSING, at: 330_539, average: 0.041578 },
];

for (const check of PUBLISHED_AVERAGES) {
  const computed = scaleTax(check.at, check.bands) / check.at;
  // Half a basis point. The published figures are rounded to four decimals.
  if (Math.abs(computed - check.average) > 0.00005) {
    throw new Error(
      `IMT scale ${check.label}: computed average ${(computed * 100).toFixed(4)}% ` +
        `against ${(check.average * 100).toFixed(4)}% published in art. 17. ` +
        `A band edge or a rate in this file does not match the statute.`,
    );
  }
}

// --- The lines ---------------------------------------------------------------

export type TransferLine = {
  key: string;
  /** Amount in the jurisdiction's own currency. */
  amount: number;
  /** Share of the price, for display. Absent where the line is not a percentage. */
  effectiveRate?: number;
  confidence: Confidence;
  citation: string;
  checkedOn: string;
  /** Named where the instrument itself splits, defers or qualifies the charge. */
  caveat?: string;
};

export type TransferResult = {
  jurisdiction: TransferJurisdiction;
  currency: Currency;
  price: number;
  lines: TransferLine[];
  total: number;
  /** Total as a share of the price. */
  effectiveRate: number;
};

export type TransferInput = {
  jurisdiction: TransferJurisdiction;
  price: number;
  /** Portugal only. Ignored elsewhere. */
  ptCategory?: PtCategory;
  /**
   * Dubai only. The resolution splits the fee equally unless the parties agree
   * otherwise; the market custom is that the buyer pays all of it. Default is
   * what the instrument says, not what the market does.
   */
  aeBuyerPaysAll?: boolean;
};

function portugal(price: number, category: PtCategory): TransferLine[] {
  const imt =
    category === "own-permanent"
      ? scaleTax(price, PT_OWN_PERMANENT)
      : category === "other-housing"
        ? scaleTax(price, PT_OTHER_HOUSING)
        : price * PT_FLAT[category];

  const scaleCaveat =
    category === "own-permanent" || category === "other-housing"
      ? "The top two bands are single rates on the whole value, not marginal. Between the 8% band and €1,150,853 the whole price is taxed at 6%, and above it at 7.5% — which is why one euro over that threshold costs €17,262.87 in tax."
      : undefined;

  return [
    {
      key: "imt",
      amount: imt,
      effectiveRate: price > 0 ? imt / price : 0,
      confidence: "primary",
      citation:
        "Código do IMT art. 17, table as amended by Lei 73-A/2025 of 30 December 2025. Mainland scale; Madeira and the Azores legislate their own and are not modelled here.",
      checkedOn: CHECKED_PT,
      caveat: scaleCaveat,
    },
    {
      key: "stamp",
      amount: price * PT_STAMP_RATE,
      effectiveRate: PT_STAMP_RATE,
      confidence: "primary",
      citation:
        'Tabela Geral do Imposto do Selo, verba 1.1: "aquisição onerosa ou por doação do direito de propriedade… sobre o valor", 0.8%.',
      checkedOn: CHECKED_PT,
    },
  ];
}

/**
 * Greece. The surcharge is 3% OF THE TAX and not of the price, which is why the
 * effective rate is 3.09% and not 6%. Getting that wrong doubles the answer,
 * and pages in this market do get it wrong.
 */
const GR_BASE_RATE = 0.03;
const GR_SURCHARGE_ON_TAX = 0.03;

function greece(price: number): TransferLine[] {
  const base = price * GR_BASE_RATE;
  const surcharge = base * GR_SURCHARGE_ON_TAX;
  return [
    {
      key: "fma",
      amount: base + surcharge,
      effectiveRate: GR_BASE_RATE * (1 + GR_SURCHARGE_ON_TAX),
      confidence: "primary",
      citation:
        "AADE, real estate transfer tax (ΦΜΑ): 3% of the taxable value, plus a municipal surcharge of 3% OF THE TAX — 3.09% in total.",
      checkedOn: CHECKED_PROPERTY,
      caveat:
        "Charged on the taxable value, which is the higher of the price and the objective value. VAT on new build is suspended to 31 December 2026, so a 2026 purchase goes through ΦΜΑ.",
    },
  ];
}

/**
 * Malta. One rate, but paid at two moments — and the calculator shows both,
 * because a buyer who has budgeted 5% for the deed is short by 1% at the
 * promise of sale, months earlier.
 */
const MT_TOTAL_RATE = 0.05;
const MT_ON_PROMISE = 0.01;

function malta(price: number): TransferLine[] {
  return [
    {
      key: "duty-promise",
      amount: price * MT_ON_PROMISE,
      effectiveRate: MT_ON_PROMISE,
      confidence: "primary",
      citation:
        "Cap. 364 art. 32 and art. 3(6): of the 5%, 1% falls due on registration of the promise of sale.",
      checkedOn: CHECKED_PROPERTY,
      caveat: "Paid months before the deed, not with it.",
    },
    {
      key: "duty-deed",
      amount: price * (MT_TOTAL_RATE - MT_ON_PROMISE),
      effectiveRate: MT_TOTAL_RATE - MT_ON_PROMISE,
      confidence: "primary",
      citation: "Cap. 364 art. 32: the remaining 4% on the deed.",
      checkedOn: CHECKED_PROPERTY,
      caveat:
        "Charged on the higher of price and value. No reduced rate is available: art. 32(4)(a) excludes anyone who WOULD have needed ministerial permission under Cap. 246 had the property not been in a special designated area — a counterfactual test, so buying inside an SDA does not escape it.",
    },
  ];
}

/**
 * Dubai. The default here is the instrument's, not the market's, and that is a
 * deliberate departure from how every other page prints this number.
 */
const AE_FEE_RATE = 0.04;

function uae(price: number, buyerPaysAll: boolean): TransferLine[] {
  const share = buyerPaysAll ? 1 : 0.5;
  return [
    {
      key: "dld-transfer",
      amount: price * AE_FEE_RATE * share,
      effectiveRate: AE_FEE_RATE * share,
      confidence: buyerPaysAll ? "custom" : "primary",
      citation: buyerPaysAll
        ? "The whole 4% on the buyer is market custom, not the rule. Executive Council Resolution 30/2013 art. 3 splits it equally unless the parties agree otherwise, and DLD's own page says seller 2%, buyer 2%."
        : "Executive Council Resolution 30/2013 art. 3(1) and schedule: 4% of the contract value, and art. 3 — «unless agreed otherwise, the Fee for the sale of Real Property will be shared EQUALLY by the seller and purchaser».",
      checkedOn: CHECKED_PROPERTY,
      caveat: buyerPaysAll
        ? "This is what usually happens, not what the resolution says. It is negotiable, and the resolution is the reason it is."
        : "The resolution's default. In practice sellers commonly push the whole fee onto the buyer; the toggle above shows that case.",
    },
  ];
}

export function transferTax(input: TransferInput): TransferResult {
  const price = Number.isFinite(input.price) && input.price > 0 ? input.price : 0;
  const lines =
    input.jurisdiction === "pt"
      ? portugal(price, input.ptCategory ?? "other-housing")
      : input.jurisdiction === "gr"
        ? greece(price)
        : input.jurisdiction === "mt"
          ? malta(price)
          : uae(price, input.aeBuyerPaysAll ?? false);

  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return {
    jurisdiction: input.jurisdiction,
    currency: CURRENCY[input.jurisdiction],
    price,
    lines,
    total,
    effectiveRate: price > 0 ? total / price : 0,
  };
}

/**
 * The Portuguese cliff, as a pair of prices either side of the €1,150,853
 * threshold. The page shows the discontinuity with the statute's own numbers
 * rather than asserting it in prose — and the two scales give the SAME pair,
 * because both flat bands are identical above €1,150,853.
 */
export function ptCliff(category: Exclude<PtCategory, "rustic" | "other-urban" | "haven">) {
  const bands = category === "own-permanent" ? PT_OWN_PERMANENT : PT_OTHER_HOUSING;
  const threshold = 1_150_853;
  const below = scaleTax(threshold, bands);
  const above = scaleTax(threshold + 1, bands);
  return {
    threshold,
    below: { price: threshold, tax: below },
    above: { price: threshold + 1, tax: above },
    /** What one euro of price costs at the threshold. */
    step: above - below,
  };
}

/**
 * The smooth transition, for the same reason in reverse: the page claims the
 * 6% threshold is continuous by construction, so it shows the two numbers that
 * make it continuous instead of asking to be believed.
 */
export function ptSmoothStep(category: Exclude<PtCategory, "rustic" | "other-urban" | "haven">) {
  const own = category === "own-permanent";
  const bands = own ? PT_OWN_PERMANENT : PT_OTHER_HOUSING;
  const threshold = own ? 660_982 : 633_931;
  return {
    threshold,
    below: { price: threshold, tax: scaleTax(threshold, bands) },
    above: { price: threshold + 1, tax: scaleTax(threshold + 1, bands) },
  };
}
