import { published } from "../../src/lib/costModel";

// The verified cost figures, extracted from scripts/facts.ts on 24 Aug 2026 so
// that a second consumer could read them without importing that script — which
// throws on a missing write token at module load and would take a PDF
// generator down with it.
//
// SINCE 2 SEPTEMBER 2026 THE TWO MONEY FIELDS ARE NOT WRITTEN HERE. They are
// computed from src/lib/costModel.ts, which holds the same costs as an ordered
// list of lines — each with its rate, the instrument that sets it, the date it
// was read, and whether an authority sets it at all.
//
// The reason is not tidiness. This file used to carry a literal `extras` and a
// prose `breakdown` describing it, and they had already drifted apart: the
// Greek literal said €36,000, its own prose priced notaries at a flat 1.5%
// that no tariff supports, and docs/figures-verification-2026-08-23.md — the
// dossier the literal is supposed to derive from — scored €34,000 as correct
// at the €400,000 level. A calculator built on top of that would have had a
// fourth number. See docs/costmodel-verification-2026-09-02.md.
//
// So the rule this file has always stated now holds mechanically: a figure
// lives in ONE place, and everything that needs it imports from there.
// `scripts/facts.ts` writes these to Sanity, `scripts/pdf.ts` prints them,
// the calculator recomputes them at other inputs, and none of the four can
// disagree with the others.
//
// EVERY NUMBER BEHIND THEM WAS CHECKED AGAINST A PRIMARY SOURCE, and the
// working is in docs/figures-verification-2026-08-23.md,
// docs/property-verification-2026-08-24.md and the per-jurisdiction dossiers,
// with the corrections of 2 September 2026 in
// docs/costmodel-verification-2026-09-02.md. A rate may not change in
// costModel.ts without one of those changing in the same commit.
//
// BASIS: one main applicant, no dependants. Family members are priced
// completely differently from one jurisdiction to the next — in Portugal a
// spouse costs the same as the main applicant, on Malta a spouse is free — so
// a per-family column would compare four different things. The calculator does
// not take family composition as an input either, and costModel.ts says why.
//
// PERIOD: everything payable to get in and hold the permit through its first
// renewal.
//
// (Unrelated to the old `scripts/_to_delete/costs.ts`, which predates the
// verification and is kept only until it is deleted from the working tree.)

export interface FactSeed {
  /** ISO alpha-2, lowercased — the suffix in both document ids. */
  code: string;
  /** The figure the programme advertises, converted to euro. Derived from
   *  costModel.ts for the four published jurisdictions. */
  advertised: number;
  /** Taxes, professional fees, government charges and the first renewal.
   *  Derived from costModel.ts for the four published jurisdictions. */
  extras: number;
  /** Which deadline this route can meet. Cumulative — see matching.ts. */
  speedBand: "weeks" | "months" | "long";
  /** Comparative advantages only. A value ticked on all five would stop
   *  discriminating and make the route finder's third question useless. */
  strengths: ("passport" | "tax" | "speed")[];
}

export const FACTS: FactSeed[] = [
  {
    code: "gr",
    // Law 5038/2023 art. 100 as amended by Law 5100/2024 art. 64, in force
    // 1 Sep 2024. THREE tiers, not one: €800,000 across the whole of Attica,
    // the regional unit of Thessaloniki, Mykonos, Santorini and every island
    // over 3,100 inhabitants; €400,000 everywhere else; €250,000 only for a
    // change of use to residential, a factory idle five years, or the full
    // restoration of a listed building — with the work FINISHED before the
    // application. The table carries €400,000 and says the rest in a note;
    // the calculator takes the tier as an input, which is where a reader in
    // Attica can finally act on it.
    ...published("gr"),
    // The permit card takes months and the backlog reached 18 months, but
    // art. 10 of Law 5038/2023 issues a bebaiosi on filing that ITSELF confers
    // lawful residence and the rights of the permit until the decision. That
    // is what a relocator actually needs, so the band follows the receipt, not
    // the card. Challenge this if the receipt ever stops carrying the rights.
    speedBand: "months",
    // 7 years of ACTUAL residence for naturalisation, and the investor permit
    // is a qualifying title — but it carries no minimum stay, so the permit
    // alone never accrues the period. Shortest EU route in the set after
    // Malta's ~5 years.
    strengths: ["passport"],
  },
  {
    code: "pt",
    // Fund subscription, subalinea vii of art. 3(1) of Lei 23/2007. The two
    // real-estate options and the plain capital transfer were revoked by
    // Lei 56/2023 art. 53; art. 3(5) additionally bars any investment aimed
    // directly or indirectly at real estate. So there is no transfer tax, no
    // notary and no agent in this stack — the whole variable part is what the
    // fund charges.
    ...published("pt"),
    // Statute says 60 days for a grant, 30 for a renewal (art. 82 Lei
    // 23/2007) — not the 90 days this comment carried until 5 Sep 2026, which
    // came from an early draft and never matched the verification file.
    // Reality is a year to
    // three: filing to biometrics 6–24 months, biometrics to card 6–18, and
    // AIMA still reported ~30,000 pending files on 4 Aug 2026.
    speedBand: "long",
    // NOT a passport route any more. Lei Organica 1/2026, in force 19 May
    // 2026, took naturalisation to 7 years for EU and CPLP nationals and 10
    // for everyone else, counted from the ISSUE of the permit, with a culture
    // and history exam on top. Malta at ~5 years is now shorter. What
    // Portugal does have is IFICI: 20% flat on Portuguese category A and B
    // income for 10 years.
    strengths: ["tax"],
  },
  {
    code: "mt",
    // MPRP, S.L. 217.26 under Cap. 217, as amended by L.N. 310 of 2024 (from
    // 1 Jan 2025) and L.N. 146 of 2025 (22 Jul 2025). The €300,000 the site
    // used to publish was the pre-reform floor for the south of Malta and
    // Gozo; that regional discount no longer exists.
    //
    // These figures are the PURCHASE route. Leasing at €14,000 a year is the
    // other half of the programme and it is not in the published bar, because
    // a bar comparing a stake with a rent compares a thing you keep with a
    // thing you spend. The calculator carries both, and says which is which.
    ...published("mt"),
    // Residency Malta publishes no processing time at all; the agents'
    // handbook says only "reasonable times". The regulations allow 8 months
    // after the letter of approval in principle just to complete the purchase
    // and the payments, so 6–12 months end to end is the honest range.
    speedBand: "months",
    // Ordinary naturalisation: 4 years within the last 6, plus 12 continuous
    // months before applying. The shortest in the set. Citizenship BY
    // INVESTMENT is closed — after CJEU C-181/23 (29 Apr 2025) the scheme was
    // replaced by merit-based naturalisation under S.L. 188.06, where payment
    // alone does not qualify. Remittance basis for non-domiciled residents,
    // but MPRP by itself confers no tax residence.
    strengths: ["passport", "tax"],
  },
  {
    code: "ae",
    // AED 2,000,000, one or more properties, mortgage allowed with a bank
    // no-objection letter. 10 years, renewable. Off-plan is NOT claimed here:
    // no ICP, GDRFA or DLD page supports it, and GDRFA's property-owner page
    // requires a completed building.
    //
    // THE RATE IS PART OF THE FIGURE, NOT A CONSTANT, and it is now the model
    // that says so: costModel.ts converts at AED_PER_EUR and takes a rate as
    // an input, so the euro threshold moves when the rate does. The previous
    // 490,000 came from 4.08 and was 24,000 euro out by the time anyone read
    // it. Re-convert when re-checking, in costModel.ts.
    ...published("ae"),
    // DLD publishes 7–10 working days, GDRFA about 5, ICP two days for the
    // entry permit. Title deed to Emirates ID is realistically 2–4 weeks.
    speedBand: "weeks",
    // u.ae, verbatim: "The UAE does not levy income tax on individuals."
    // Corporate tax and the 15% domestic top-up do not touch personal income.
    // Naturalisation is discretionary and by nomination; property never
    // triggers it, so no passport strength.
    strengths: ["tax", "speed"],
  },
  {
    code: "cy",
    // THE ONE ROW STILL WRITTEN BY HAND, and deliberately so. Cyprus is not in
    // costModel.ts because it is not published: gov.cy returns 403 to an
    // automated request, mip.gov.cy has an expired certificate and the tax
    // department's PDF is robots-blocked, so every figure below rests on
    // secondary sources. Modelling it line by line would dress the weakest
    // data in the project in the same clothes as the strongest.
    //
    // Regulation 6(2), revised criteria of 2 May 2023. €300,000 EXCLUDING
    // VAT, plus €50,000 of secured annual income from abroad, +€15,000 for a
    // spouse and +€10,000 per minor child, health insurance, and an annual
    // proof that the investment is still held.
    //
    // Do not publish Cyprus until a primary source has been read by a human.
    // Extras below: VAT at the reduced 5% 15,000 (19% if the reduced rate does
    // not apply, which is 57,000); legal ~1% 3,000; permit and immigration
    // fees ~500. Transfer fees are NIL where VAT was paid, and the 6(2) route
    // requires a first-sale property — so they are not in the stack at all.
    advertised: 300_000,
    extras: 19_000,
    speedBand: "months",
    strengths: ["tax"],
  },
];
