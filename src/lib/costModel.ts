// WHAT A ROUTE COSTS, LINE BY LINE, AS DATA.
//
// Until this file the site held one number per jurisdiction — `extras` in
// scripts/copy/costs.ts — with its composition written out beside it as
// English prose in a `breakdown` string. That is enough to draw the bars in
// section 04 and enough to print the PDF, and it is not enough for anything
// that has to RECOMPUTE. A reader who is looking at a €620,000 apartment in
// Athens cannot use a figure calculated for €400,000, and the prose cannot be
// asked what changes.
//
// So the breakdown becomes the model. Each line carries what it is a
// percentage OF, what the rate is, the instrument that sets it, the date it
// was read, and — the field that matters most on this site — whether an
// authority sets it at all.
//
// --- THE THREE LEVELS OF CONFIDENCE, AND WHY THEY ARE NOT TWO ---------------
//
// docs/property-verification-2026-08-24.md separates three things that a
// single "verified / unverified" flag would flatten into one, and the
// flattening would misinform in both directions:
//
//   `primary`   An authority sets it and we read the instrument. Greek ΦΜΑ at
//               3% plus the 3% municipal surcharge on the tax. Maltese stamp
//               duty at 5%. The Dubai transfer fee at 4%.
//
//   `secondary` The figure comes from a faithful reproduction rather than the
//               authority's own page — usually because the authority's page
//               is unreachable. The Greek land-registry fee is the case that
//               forced this level: ktimatologio.gov.gr is robots-blocked.
//
//   `custom`    NO instrument sets it. It is what the market does, and it is
//               negotiable. Agents' commissions everywhere; the buyer paying
//               the whole 4% in Dubai when Executive Council Resolution
//               30/2013 art. 3 splits it 2/2 "unless agreed otherwise";
//               Maltese notary fees, where the tariff annexed to Cap. 55 is a
//               truncated PDF and only market sources give a range.
//
// A calculator that prints one total and hides which lines are which is the
// thing this site exists to be an alternative to. Every consumer of this
// module gets the level per line and is expected to render it.
//
// --- WHAT IS NOT MODELLED, DELIBERATELY -------------------------------------
//
// FAMILY COMPOSITION. It is the obvious second axis and it is the one we
// cannot source: the only verified per-dependant figure in the whole project
// is Malta's €7,500 (and €500 per residence card). No AIMA tariff for family
// reunification, no Greek paravolo for family members, and the UAE dossier
// records every dependant figure it found as commercial-source-only. Adding
// the input before the dossier exists would produce a control that changes
// one jurisdiction out of four.
//
// CYPRUS. Deferred on the site, and scripts/copy/costs.ts carries an explicit
// instruction not to publish it until a human has read a primary source.
//
// EVERY FIGURE HERE IS TRACEABLE TO docs/property-verification-2026-08-24.md,
// docs/figures-verification-2026-08-23.md or the per-jurisdiction dossiers,
// and may not change without one of those changing in the same commit — the
// same rule that governs scripts/copy/costs.ts.

/** The four jurisdictions that are published. Cyprus is deliberately absent. */
export type CalcCode = "gr" | "pt" | "mt" | "ae";

/** Who sets the figure. See the note above — this is rendered, not internal. */
export type Confidence = "primary" | "secondary" | "custom";

/** What the line is computed from. */
export type LineBasis =
  /** A flat euro amount that does not move with the investment. */
  | { of: "fixed"; eur: number }
  /** A flat amount denominated in dirhams, converted at the input rate. So
   *  the euro figure moves when the rate does — which is the point: the
   *  previous published UAE total was €24,000 out because a rate had been
   *  frozen into a constant. */
  | { of: "aed"; aed: number }
  /** A straight percentage of the capital committed. */
  | { of: "rate"; rate: number }
  /** A progressive scale over the capital, lowest band first. `upTo` is the
   *  top of the band; the last band's `upTo` is Infinity. Greek notaries are
   *  the only line in the set priced this way, and a flat rate misprices them
   *  by a factor of two at €400,000. */
  | { of: "scale"; bands: { upTo: number; rate: number }[]; plusEur: number }
  /** An annual amount, multiplied by the years the input asks to price. */
  | { of: "annualFixed"; eur: number }
  /** An annual percentage of the capital, multiplied the same way. */
  | { of: "annualRate"; rate: number };

export interface CostLine {
  /** Stable key. The label is a translated message; this is not it. */
  key: string;
  basis: LineBasis;
  confidence: Confidence;
  /** The instrument, article and gazette where one exists — or the plainest
   *  true statement of where the figure comes from where one does not.
   *  Language-neutral by nature, exactly as on /sources: a law number is the
   *  same number in every language, and translating one is how a citation
   *  stops being checkable. */
  citation: string;
  /** ISO date this line was last read against its source. */
  checkedOn: string;
  /** Applies only on one branch of a per-jurisdiction choice. A line with
   *  `only: "buy"` is skipped when the reader picks the lease route. */
  only?: "buy" | "rent";
  /** Reduced by 25% when the reader says they will file online. Portugal's
   *  AIMA fees are the only lines in the set with a channel discount. */
  discountable?: boolean;
  /** Something true about the figure that a reader would want before relying
   *  on it, where the confidence level alone does not say it. Rendered. */
  caveat?: string;
}

export interface CalcInput {
  /** Capital committed, in euro: the property price, or the fund
   *  subscription in Portugal. Ignored on the Maltese lease route. */
  amount: number;
  /** Malta only. Buying and leasing are two different first cycles, not two
   *  prices for one. */
  route?: "buy" | "rent";
  /** How many years of recurring cost to price. Defaults to the holding
   *  period the programme imposes — five on Malta — so that a lease is
   *  compared against a purchase over the same period rather than over one
   *  year, which would flatter it by a factor of five. */
  years?: number;
  /** Portugal only. AIMA charges 25% less for an application filed online. */
  online?: boolean;
  /** UAE only. Dirhams per euro. Defaults to the rate on the date the figure
   *  was checked, which is carried beside it rather than hidden in it. */
  aedRate?: number;
  /** Greece only. Which of the three thresholds the location falls under.
   *  It sets the FLOOR, not the price — a reader in Attica still types what
   *  the apartment costs, and is told when that is under the tier. */
  tier?: GreekTier;
}

export interface ComputedLine extends CostLine {
  /** What this line comes to, in euro, at the given input. */
  eur: number;
  /** The rate actually applied, where the basis has one. For display: a
   *  reader should be able to see "0.65% of €400,000" and check the
   *  multiplication. */
  appliedRate?: number;
  /** The dirham figure behind a converted line, so the conversion is visible
   *  rather than asserted. */
  aed?: number;
  /** True where `discountable` met `online`. */
  discountApplied?: boolean;
  /** False for a line belonging to the OTHER branch of a fork — Malta's rent
   *  while the reader is buying, its stamp duty and notary while leasing.
   *
   *  Such a line is priced and returned rather than dropped, and the reason is
   *  a rendering one that is easy to get wrong: the page prints every line on
   *  the server and the browser only ever hides and unhides them. If the
   *  server returned the applicable lines only, switching route in the browser
   *  would have to CREATE the rows for the other branch — and a row created by
   *  JavaScript is a row no crawler and no reader without it ever sees. Both
   *  Maltese routes are in the HTML for the same reason all five route-finder
   *  readouts are.
   *
   *  It is excluded from every total. */
  applies: boolean;
}

export interface Computed {
  code: CalcCode;
  /** The capital committed. On the lease route this is zero — rent is a cost,
   *  not a stake, and adding it to the same total as a purchase price would
   *  compare a thing you keep with a thing you spend. */
  committed: number;
  /** Whether the committed capital is an asset the reader still holds at the
   *  end of the cycle. False for the lease route; true everywhere else,
   *  subject to the obvious caveat that a fund unit is not a bank balance. */
  recoverable: boolean;
  lines: ComputedLine[];
  /** The exact sum of the lines. */
  extras: number;
  /** `extras` rounded the way the site publishes it. See ROUND_TO. */
  extrasRounded: number;
  /** committed + extras, exact. */
  total: number;
  /** committed + extrasRounded — the figure to print. */
  totalRounded: number;
  /** The programme's own floor for this route, in euro. */
  minimum: number;
  /** True when the reader has typed less than the programme allows. Nothing
   *  is clamped and nothing is hidden: the arithmetic still runs and the flag
   *  says the answer does not qualify, which is more useful than a silently
   *  corrected input. */
  belowMinimum: boolean;
}

/** The rounding the site has always published to, made explicit. Greece's
 *  lines come to €35,329 and the bar says €35,000; the alternative is a
 *  comparison chart of five-digit precision on figures whose largest
 *  components are market customs. Half up, so €18,500 goes to €19,000 —
 *  which is what the Cyprus row already does. */
const ROUND_TO = 1_000;

function roundPublished(value: number): number {
  return Math.round(value / ROUND_TO) * ROUND_TO;
}

/** Dirhams per euro on 23 August 2026, the day the UAE figures were checked.
 *  Exported because the number is part of the finding, not a constant: the
 *  previous published total came from 4.08 and was €24,000 out by the time
 *  anyone read it. Whoever re-checks the figures re-converts and moves this. */
export const AED_PER_EUR = 4.288;
export const AED_RATE_CHECKED_ON = "2026-08-23";

// THE GREEK THRESHOLD IS THREE THRESHOLDS, and this is the single largest
// fork in the whole set — larger than any difference between jurisdictions.
// Law 5038/2023 art. 100 as amended by Law 5100/2024 art. 64, in force
// 1 September 2024. Today it lives in a footnote under the comparison table,
// where a reader looking at Thessaloniki cannot act on it.
export const GREEK_TIERS = {
  /** Change of use to residential, a factory idle five years, or the full
   *  restoration of a listed building — with the work FINISHED before the
   *  application, which is why it is not the headline figure. */
  "250": 250_000,
  /** Everywhere not caught by the €800,000 tier. */
  "400": 400_000,
  /** The whole of Attica, the regional unit of Thessaloniki, Mykonos,
   *  Santorini, and every island over 3,100 inhabitants. */
  "800": 800_000,
} as const;

export type GreekTier = keyof typeof GREEK_TIERS;

const CHECKED_PROPERTY = "2026-08-24";
const CHECKED_FIGURES = "2026-08-23";

const LINES: Record<CalcCode, CostLine[]> = {
  // --- Greece ---------------------------------------------------------------
  gr: [
    {
      key: "transfer-tax",
      basis: { of: "rate", rate: 0.0309 },
      confidence: "primary",
      citation:
        "AADE, real estate transfer tax (ΦΜΑ): 3% of the taxable value, plus a municipal surcharge of 3% OF THE TAX — 3.09% in total. VAT on new build is suspended to 31 Dec 2026 (Law 5000/2022 art. 9, extended by Law 5246/2025 art. 12), so every purchase in 2026 goes through ΦΜΑ.",
      checkedOn: CHECKED_PROPERTY,
      caveat:
        "Charged on the taxable value (αντικειμενική αξία), which is not always the price paid. The first-home relief requires residence in Greece and is normally unavailable to a non-resident.",
    },
    {
      key: "notary",
      // The one line in the set that is genuinely progressive, and modelling
      // it flat is not a rounding error: at €400,000 the tariff comes to
      // €2,930 where a flat 1.5% says €6,000.
      basis: {
        of: "scale",
        bands: [
          { upTo: 120_000, rate: 0.008 },
          { upTo: 380_000, rate: 0.007 },
          { upTo: 2_000_000, rate: 0.0065 },
          { upTo: Number.POSITIVE_INFINITY, rate: 0.0065 },
        ],
        plusEur: 20,
      },
      confidence: "primary",
      citation:
        "KYA 111376/2011: a fixed €20 plus 0.80% to €120,000, 0.70% to €380,000, 0.65% to €2m, and lower above.",
      checkedOn: CHECKED_PROPERTY,
      caveat:
        "Two Greek legal publishers give the first band as 1%; the codified text and the notaries' chamber PDF give 0.80%. The conflict is unresolved and the lower figure is used here.",
    },
    {
      key: "land-registry",
      basis: { of: "scale", bands: [{ upTo: Number.POSITIVE_INFINITY, rate: 0.005 }], plusEur: 23 },
      confidence: "secondary",
      citation:
        "Decision 2/12-01-2026, FEK B' 64/13.01.2026: 5‰ of the value plus fixed charges of €3 and €20, from 13 January 2026. Guides quoting 0.475% are out of date.",
      checkedOn: CHECKED_PROPERTY,
      caveat: "ktimatologio.gov.gr is robots-blocked; read in reproduction.",
    },
    {
      key: "legal",
      basis: { of: "rate", rate: 0.015 },
      confidence: "custom",
      citation:
        "No tariff sets a lawyer's fee, and a lawyer's attendance is no longer compulsory. For a foreign buyer the title check is a practical necessity rather than a legal one.",
      checkedOn: CHECKED_PROPERTY,
    },
    {
      key: "agency",
      basis: { of: "rate", rate: 0.02 },
      confidence: "custom",
      citation:
        "Not set by law. Custom is about 2% plus VAT FROM EACH SIDE — buyer and seller pay their own agents. Agent sources only.",
      checkedOn: CHECKED_PROPERTY,
    },
    {
      key: "permit-fee",
      basis: { of: "fixed", eur: 2_000 },
      confidence: "primary",
      citation: "e-paravolo for the investor permit application, Law 5038/2023.",
      checkedOn: CHECKED_FIGURES,
      caveat:
        "No fee for a family member is set by the KYA. Nothing is published for one here, and nothing should be.",
    },
    {
      key: "permit-card",
      basis: { of: "fixed", eur: 16 },
      confidence: "primary",
      citation: "Printing of the residence card.",
      checkedOn: CHECKED_FIGURES,
    },
    {
      key: "permit-renewal",
      basis: { of: "fixed", eur: 2_000 },
      confidence: "primary",
      citation: "First renewal, same paravolo.",
      checkedOn: CHECKED_FIGURES,
    },
  ],

  // --- Portugal -------------------------------------------------------------
  // A fund subscription, not a property purchase: Lei 56/2023 art. 53 revoked
  // both property options and art. 3(5) bars any investment aimed even
  // indirectly at real estate. So there is no transfer tax, no notary and no
  // agent here — the whole variable part is what the fund charges.
  pt: [
    {
      key: "aima-analysis",
      basis: { of: "fixed", eur: 842.8 },
      confidence: "primary",
      citation: "AIMA fee schedule in force 1 March 2026: analysis of the application.",
      checkedOn: CHECKED_FIGURES,
      discountable: true,
    },
    {
      key: "aima-grant",
      basis: { of: "fixed", eur: 8_418.9 },
      confidence: "primary",
      citation: "AIMA fee schedule in force 1 March 2026: grant of the permit.",
      checkedOn: CHECKED_FIGURES,
      discountable: true,
    },
    {
      key: "aima-renewal",
      basis: { of: "fixed", eur: 4_210.3 },
      confidence: "primary",
      citation: "AIMA fee schedule in force 1 March 2026: first renewal.",
      checkedOn: CHECKED_FIGURES,
      discountable: true,
    },
    {
      key: "legal",
      basis: { of: "fixed", eur: 8_000 },
      confidence: "custom",
      citation: "Market rate for preparing and filing an ARI application. No tariff.",
      checkedOn: CHECKED_FIGURES,
    },
    {
      key: "fund-charges",
      basis: { of: "annualRate", rate: 0.013 },
      confidence: "custom",
      citation:
        "Subscription and management charges over the first year, at about 1.3% of the amount subscribed. Set by each fund, not by an instrument.",
      checkedOn: CHECKED_FIGURES,
      caveat: "The one line here that moves with the amount. Everything else is a flat fee.",
    },
  ],

  // --- Malta ----------------------------------------------------------------
  mt: [
    {
      key: "stamp-duty",
      basis: { of: "rate", rate: 0.05 },
      confidence: "primary",
      citation:
        "Cap. 364 art. 32 and art. 3(6): 5% of the higher of price and value — 1% on registration of the promise of sale, 4% on the deed.",
      checkedOn: CHECKED_PROPERTY,
      only: "buy",
      caveat:
        "No reduced rate is available. Art. 32(4)(a) excludes anyone who WOULD have needed ministerial permission under Cap. 246 had the property not been in a special designated area — a counterfactual test, so buying inside an SDA does not escape it.",
    },
    {
      key: "rent",
      basis: { of: "annualFixed", eur: 14_000 },
      confidence: "primary",
      citation: "MPRP, S.L. 217.26: qualifying lease at €14,000 a year.",
      checkedOn: CHECKED_FIGURES,
      only: "rent",
      caveat:
        "Rent is spent, not staked. A lease priced over the five-year holding period is compared against a purchase the buyer still owns at the end of it.",
    },
    {
      key: "admin-fee",
      basis: { of: "fixed", eur: 60_000 },
      confidence: "primary",
      citation:
        "MPRP administrative fee on the main applicant. S.L. 217.26 as amended by L.N. 310/2024 (from 1 Jan 2025) and L.N. 146/2025 (22 Jul 2025).",
      checkedOn: CHECKED_FIGURES,
    },
    {
      key: "contribution",
      basis: { of: "fixed", eur: 37_000 },
      confidence: "primary",
      citation: "Government contribution. Identical on the purchase and the lease route.",
      checkedOn: CHECKED_FIGURES,
    },
    {
      key: "ngo-donation",
      basis: { of: "fixed", eur: 2_000 },
      confidence: "primary",
      citation: "Compulsory donation to a registered NGO.",
      checkedOn: CHECKED_FIGURES,
    },
    {
      key: "residence-card",
      basis: { of: "fixed", eur: 500 },
      confidence: "primary",
      citation: "Residence card, €500 per person.",
      checkedOn: CHECKED_FIGURES,
    },
    {
      key: "notary-legal",
      basis: { of: "fixed", eur: 7_750 },
      confidence: "custom",
      citation:
        "The notarial tariff annexed to Cap. 55 could not be read — the published PDF is truncated. Market sources give 1–2.5%, searches and registration about €600, an architect €400–600.",
      checkedOn: CHECKED_PROPERTY,
      only: "buy",
      caveat:
        "An agent's commission is 5% plus 18% VAT on Malta and is paid by the SELLER, so it is not in this stack at all.",
    },
  ],

  // --- United Arab Emirates -------------------------------------------------
  ae: [
    {
      key: "golden-visa-fees",
      basis: { of: "aed", aed: 9_884.75 },
      confidence: "secondary",
      citation:
        "DLD golden visa e-service, total AED 9,884.75. The composition was not verified, and the channels do not reconcile: GDRFA publishes AED 1,100 plus ancillaries, and DLD's two-year investor visa is AED 10,212.50. Plausibly three different products.",
      checkedOn: "2026-08-30",
    },
    {
      key: "dld-transfer",
      basis: { of: "rate", rate: 0.04 },
      confidence: "custom",
      citation:
        "Executive Council Resolution 30/2013 art. 3(1) and schedule: 4% of the contract value, and art. 3 — «unless agreed otherwise, the Fee for the sale of Real Property will be shared EQUALLY by the seller and purchaser». DLD's own page says seller 2%, buyer 2%.",
      checkedOn: CHECKED_PROPERTY,
      caveat:
        "The buyer paying the whole 4% is a negotiated allocation under the «unless agreed otherwise» limb, not what the instrument prescribes. Budget it; it is negotiable.",
    },
    {
      key: "dld-admin",
      // 250 title deed + 250 villa/apartment administration + 225 unified
      // municipality card + 10 knowledge + 10 innovation + 4,200 registration
      // trustee (AED 4,000 plus 5% VAT, the band at or above AED 500,000).
      basis: { of: "aed", aed: 4_945 },
      confidence: "primary",
      citation:
        "DLD tariff: title deed AED 250, villa and apartment administration AED 250, unified municipality card AED 225, knowledge and innovation fees AED 10 each, registration trustee AED 4,000 + 5% VAT.",
      checkedOn: CHECKED_PROPERTY,
    },
    {
      key: "agency",
      basis: { of: "rate", rate: 0.02 },
      confidence: "custom",
      citation:
        "DLD sets no commission: «determined by agreement, and failing that by custom». The usual 2% from the buyer is custom, not a rule.",
      checkedOn: CHECKED_PROPERTY,
      caveat:
        "VAT at 5% applies to the commission itself (residential property is exempt, the services on top of it are not) and is not included in this line.",
    },
  ],
};

/** AED 2,000,000, the Emirati floor, in dirhams — converted at the rate the
 *  reader is looking at rather than frozen into a euro constant. */
/** The Emirati floor as the resolution sets it: in dirhams, not in euro.
 *  Exported because the prose on /calculator names it in its own currency —
 *  "2,000,000 AED" is the figure a reader will have seen quoted, and typing it
 *  into the copy would be a second place for it to live. */
export const AED_MINIMUM_AED = 2_000_000;
const AED_MINIMUM = AED_MINIMUM_AED;

/** What the block shows before anyone touches it: each programme's own floor,
 *  which is also the figure section 04 and the PDF publish. So the calculator
 *  opens agreeing with the rest of the site rather than contradicting it.
 *
 *  THE EMIRATI DEFAULT ROUNDS UP, and it is the only one that rounds at all.
 *  AED 2,000,000 at 4.288 is €466,417.91. The bars publish that as €466,000 —
 *  correct as a headline, and €418 UNDER the actual floor. Neither figure is
 *  what the calculator should open on: the exact conversion puts "466418" in a
 *  number field, which reads as a price nobody would pay, and the rounded one
 *  opens the page on an amount that does not qualify and trips its own
 *  below-the-floor warning. So the default is the threshold rounded UP to the
 *  nearest thousand. Rounding up rather than to nearest is the whole point —
 *  a default that fails the test it describes is worse than an untidy one. */
export const DEFAULTS: Record<CalcCode, Required<Pick<CalcInput, "amount">> & CalcInput> = {
  gr: { amount: 400_000, tier: "400" },
  pt: { amount: 500_000, online: false },
  mt: { amount: 375_000, route: "buy" },
  ae: { amount: Math.ceil(AED_MINIMUM / AED_PER_EUR / ROUND_TO) * ROUND_TO },
};

/** The floor the programme itself imposes, in euro, for the route asked
 *  about. Portugal's is the fund subscription; Malta's differs by route. */
export function minimumFor(code: CalcCode, input: CalcInput): number {
  switch (code) {
    case "gr":
      return GREEK_TIERS[input.tier ?? "400"];
    case "pt":
      return 500_000;
    case "mt":
      return input.route === "rent" ? 14_000 : 375_000;
    case "ae":
      return AED_MINIMUM / (input.aedRate ?? AED_PER_EUR);
  }
}

function scaleOf(bands: { upTo: number; rate: number }[], amount: number): number {
  let total = 0;
  let floor = 0;
  for (const band of bands) {
    if (amount <= floor) break;
    total += (Math.min(amount, band.upTo) - floor) * band.rate;
    floor = band.upTo;
  }
  return total;
}

/**
 * One jurisdiction, one set of answers, every line priced.
 *
 * Pure and synchronous, like RouteFinder's `matching.ts` and for the same
 * reason: the page renders the default state on the server, and the browser
 * recomputes the same function on every keystroke. Two implementations of one
 * arithmetic is how a printed figure and an interactive one start disagreeing.
 */
export function compute(code: CalcCode, input: CalcInput): Computed {
  const years = input.years ?? 1;
  const rate = input.aedRate ?? AED_PER_EUR;
  const route = input.route ?? "buy";
  const amount = Math.max(0, input.amount);
  const leased = code === "mt" && route === "rent";

  const lines: ComputedLine[] = [];

  for (const line of LINES[code]) {
    const applies = !line.only || line.only === route;

    const discountApplied = Boolean(line.discountable && input.online);
    const discount = discountApplied ? 0.75 : 1;

    let eur = 0;
    let appliedRate: number | undefined;
    let aed: number | undefined;

    switch (line.basis.of) {
      case "fixed":
        eur = line.basis.eur;
        break;
      case "aed":
        aed = line.basis.aed;
        eur = aed / rate;
        break;
      case "rate":
        appliedRate = line.basis.rate;
        eur = amount * line.basis.rate;
        break;
      case "scale":
        eur = scaleOf(line.basis.bands, amount) + line.basis.plusEur;
        // The effective rate, so a reader can sanity-check a progressive
        // line against a flat one without doing the bands themselves.
        appliedRate = amount > 0 ? eur / amount : undefined;
        break;
      case "annualFixed":
        eur = line.basis.eur * years;
        break;
      case "annualRate":
        appliedRate = line.basis.rate;
        eur = amount * line.basis.rate * years;
        break;
    }

    lines.push({ ...line, eur: eur * discount, appliedRate, aed, discountApplied, applies });
  }

  const extras = lines
    .filter((line) => line.applies)
    .reduce((sum, line) => sum + line.eur, 0);
  // Rent is a cost, not a stake: on the lease route nothing is committed, and
  // the €14,000 sits in the extras where the money actually goes.
  const committed = leased ? 0 : amount;
  const extrasRounded = roundPublished(extras);
  const minimum = minimumFor(code, input);

  return {
    code,
    committed,
    recoverable: !leased,
    lines,
    extras,
    extrasRounded,
    total: committed + extras,
    totalRounded: committed + extrasRounded,
    minimum,
    belowMinimum: (leased ? 14_000 : amount) < minimum,
  };
}

/**
 * The two figures the site publishes for a jurisdiction, computed rather than
 * typed.
 *
 * THIS IS THE POINT OF THE MODULE, not a convenience on top of it. Before
 * this, `extras` was a literal in scripts/copy/costs.ts and its composition
 * was a prose string beside it, and the two were kept in step by whoever
 * remembered. They had already drifted: the Greek literal said €36,000, its
 * own prose said a flat 1.5% notary fee that no tariff supports, and
 * docs/figures-verification-2026-08-23.md — the dossier the literal is
 * supposed to derive from — scored €34,000 as the correct figure at the
 * €400,000 level. Three numbers, one of them published.
 *
 * With the lines as data there is one number and everything reads it: the
 * bars in section 04, the comparison PDF, what `npm run facts` writes to
 * Sanity, and the calculator.
 */
export function published(code: CalcCode): { advertised: number; extras: number } {
  return {
    // THE THRESHOLD, not the calculator's default input. The two differ in the
    // UAE — the default rounds the floor up so the page does not open on an
    // amount that fails, while what the site advertises is the floor itself,
    // rounded to nearest, which is the €466,000 already printed in three
    // languages of page copy. Reading the default here instead would have
    // moved a published figure to tidy up a form field.
    advertised: roundPublished(minimumFor(code, DEFAULTS[code])),
    extras: compute(code, DEFAULTS[code]).extrasRounded,
  };
}

/** The order every surface lists them in — the same order as the comparison
 *  table and the cost bars, so a reader moving between them is not asked to
 *  re-find a jurisdiction. */
export const CALC_CODES: CalcCode[] = ["gr", "pt", "mt", "ae"];

/**
 * The newest date on which any line in the model was read against its source.
 *
 * THE PAGE'S "UPDATED" STAMP, and derived rather than typed for the reason
 * docs/competitors-strengths-2026-09-02.md gives about the home page: the
 * stamp there is the string "Updated 15 Aug 2026", connected to nothing, and
 * it was three weeks stale the day it was read. A date computed from the
 * figures it describes cannot go stale while they change, and cannot be
 * refreshed while they do not.
 */
export const UPDATED_ON: string = Object.values(LINES)
  .flat()
  .reduce((latest, line) => (line.checkedOn > latest ? line.checkedOn : latest), "");

/** Every line for a jurisdiction, unpriced — for a surface that needs to know
 *  what the stack is made of before it knows the inputs. */
export function linesFor(code: CalcCode): CostLine[] {
  return LINES[code];
}

/**
 * THE INVERSE QUESTION, and the one a reader actually arrives with.
 *
 * Every calculator on this market answers "the threshold is €500,000, here is
 * what it costs on top". Nobody answers "I have €500,000 — what does that
 * actually buy me, all in". The second is the question people ask, and on this
 * site it is also the thesis: the advertised threshold is not the number.
 *
 * Given a total budget, returns the largest committed amount whose full cost —
 * the amount plus every line on top of it — still fits inside that budget.
 *
 * SOLVED NUMERICALLY, NOT ALGEBRAICALLY, and that is deliberate. Most lines are
 * a flat fee or a straight percentage, so the algebra is a one-liner; the Greek
 * notary is a progressive scale, which the one-liner cannot express, and the
 * next jurisdiction to gain a banded charge would silently break it. Cost is
 * monotone in the amount, so bisection is exact to the euro in forty steps and
 * stays correct whatever a line's basis becomes.
 *
 * Returns null where the budget cannot reach the programme's own floor — which
 * is an answer, not a failure, and the table says so in as many words.
 */
export function solveForBudget(
  code: CalcCode,
  budget: number,
  input: Omit<CalcInput, "amount">,
): number | null {
  const floor = compute(code, { ...input, amount: minimumFor(code, { ...input, amount: 0 }) });
  if (floor.total > budget) return null;

  let low = 0;
  let high = budget;
  for (let step = 0; step < 40; step += 1) {
    const mid = (low + high) / 2;
    if (compute(code, { ...input, amount: mid }).total > budget) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return low;
}

/** What the budget falls short by, when it does. The honest second half of a
 *  "does not qualify" row: a reader who is €28,000 away should be told that
 *  rather than shown a blank. */
export function shortfall(
  code: CalcCode,
  budget: number,
  input: Omit<CalcInput, "amount">,
): number {
  const floor = compute(code, { ...input, amount: minimumFor(code, { ...input, amount: 0 }) });
  return Math.max(0, floor.total - budget);
}

/** The budget the page opens on, and it is chosen rather than round.
 *
 *  €500,000 is the most-quoted figure in this category — Portugal's threshold,
 *  printed on every competitor's landing page. At €500,000 the Portuguese route
 *  does not qualify, because the real total is €528,000. So the default state
 *  of this page is the site's entire argument, made in one line, before the
 *  reader has typed anything. */
export const DEFAULT_BUDGET = 500_000;
