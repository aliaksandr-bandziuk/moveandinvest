import {
  AED_PER_EUR,
  AED_RATE_CHECKED_ON,
  DEFAULTS,
  GREEK_TIERS,
  compute,
  minimumFor,
  published,
  type CalcCode,
  type CalcInput,
  type Computed,
} from "../src/lib/costModel";

// Checks src/lib/costModel.ts against the claims the dossiers in docs/ make,
// and prints every line so a failure can be argued with rather than merely
// noticed.
//
//   npm run costmodel
//
// WHAT IT NO LONGER DOES, since scripts/copy/costs.ts started deriving its two
// money fields from the model on 2 September 2026: compare the model with the
// published figure. That comparison is now tautological — the published figure
// IS the model — which is the whole point of the change, and it means the only
// check worth running is against something written down independently.
//
// So every assertion below quotes a dossier. If the model stops reproducing a
// figure that a human verified against a statute, this goes red, and the
// question it raises is which of the two moved.
//
// Writes nothing, reads no environment, touches no network — unlike every
// other script in this folder it needs no token and no --env-file.

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const exact = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MARK: Record<string, string> = {
  primary: "[act]   ",
  secondary: "[repro] ",
  custom: "[custom]",
};

let failures = 0;

/** One claim, its source, and the arithmetic that has to reproduce it. */
function check(claim: string, source: string, actual: number, expected: number, tolerance: number) {
  const delta = Math.abs(actual - expected);
  const ok = delta <= tolerance;
  if (!ok) failures += 1;
  console.log(
    `  ${ok ? "ok  " : "FAIL"}  ${claim.padEnd(52)} ${exact.format(actual).padStart(14)}  vs ${exact
      .format(expected)
      .padStart(14)}${ok ? "" : `  off by ${exact.format(delta)}`}`,
  );
  console.log(`        ${source}`);
}

function show(title: string, code: CalcCode, input: CalcInput): Computed {
  const result = compute(code, input);

  console.log(`\n${title}`);
  console.log("-".repeat(78));

  for (const line of result.lines) {
    const basis =
      line.appliedRate !== undefined
        ? `${(line.appliedRate * 100).toFixed(2)}%`
        : line.aed !== undefined
          ? `AED ${line.aed.toLocaleString("en-GB")}`
          : "flat";
    console.log(
      `  ${MARK[line.confidence]} ${line.key.padEnd(18)} ${basis.padStart(16)} ${exact
        .format(line.eur)
        .padStart(14)}${line.discountApplied ? "  −25% online" : ""}`,
    );
    // A line with no instrument behind it is the thing this site exists to
    // label, so an unlabelled one is a defect rather than a detail.
    if (!line.citation || !line.checkedOn) {
      console.log(`  !! ${line.key} carries no citation or no date`);
      failures += 1;
    }
  }

  console.log(
    `  ${" ".repeat(8)} ${"extras".padEnd(18)} ${"".padStart(16)} ${exact
      .format(result.extras)
      .padStart(14)}  → published as ${eur.format(result.extrasRounded)}`,
  );
  console.log(
    `  ${" ".repeat(8)} ${"committed".padEnd(18)} ${"".padStart(16)} ${exact
      .format(result.committed)
      .padStart(14)}${result.recoverable ? "" : "  (rent — not recoverable)"}`,
  );
  console.log(
    `  ${" ".repeat(8)} ${"TOTAL".padEnd(18)} ${"".padStart(16)} ${eur
      .format(result.totalRounded)
      .padStart(14)}`,
  );
  if (result.belowMinimum) {
    console.log(`  !! below the programme floor of ${eur.format(result.minimum)}`);
  }

  return result;
}

function sumOf(result: Computed, keys: string[]): number {
  return result.lines
    .filter((line) => keys.includes(line.key))
    .reduce((total, line) => total + line.eur, 0);
}

console.log("COST MODEL");
console.log(`AED/EUR ${AED_PER_EUR}, read ${AED_RATE_CHECKED_ON}`);
console.log("\nWhat the site publishes, computed from the lines:");
for (const code of ["gr", "pt", "mt", "ae"] as CalcCode[]) {
  const { advertised, extras } = published(code);
  console.log(
    `  ${code.toUpperCase()}  advertised ${eur.format(advertised).padStart(12)}   extras ${eur
      .format(extras)
      .padStart(12)}`,
  );
}

// --- The default state ------------------------------------------------------

const gr = show("GR — €400,000 tier", "gr", DEFAULTS.gr);
const pt = show("PT — €500,000 fund subscription", "pt", DEFAULTS.pt);
const mt = show("MT — purchase route", "mt", DEFAULTS.mt);
const ae = show("AE — AED 2,000,000", "ae", DEFAULTS.ae);

// --- The other inputs the calculator takes ---------------------------------

const gr800 = show(
  `GR — Attica, Thessaloniki and the large islands: ${eur.format(GREEK_TIERS["800"])} tier`,
  "gr",
  { amount: 800_000, tier: "800" },
);
show("GR — restoration and change of use: €250,000 tier", "gr", {
  amount: 250_000,
  tier: "250",
});
show("PT — filed online, AIMA fees −25%", "pt", { ...DEFAULTS.pt, online: true });
const mtRent1 = show("MT — lease route, first year", "mt", {
  amount: 0,
  route: "rent",
  years: 1,
});
const mtRent5 = show("MT — lease route, five-year holding period", "mt", {
  amount: 0,
  route: "rent",
  years: 5,
});
show("AE — same property at AED/EUR 4.00", "ae", { ...DEFAULTS.ae, aedRate: 4.0 });

// --- Against the dossiers ---------------------------------------------------

console.log("\n\n=== AGAINST WHAT A HUMAN VERIFIED ===\n");

check(
  "GR transfer tax at €400,000",
  "docs/property-verification-2026-08-24.md — ΦΜΑ 3% plus a municipal surcharge of 3% of the tax = 3.09%",
  sumOf(gr, ["transfer-tax"]),
  12_360,
  1,
);

check(
  "GR extras at the €800,000 tier",
  "docs/figures-verification-2026-08-23.md — «На уровне €800 000 тот же набор даёт ≈€67 000»",
  gr800.extras,
  67_000,
  1_000,
);

check(
  "PT AIMA fees, one applicant to the first renewal",
  "docs/figures-verification-2026-08-23.md — «Один заявитель до первого продления — ≈€13 470 только пошлин»",
  sumOf(pt, ["aima-analysis", "aima-grant", "aima-renewal"]),
  13_470,
  5,
);

check(
  "MT extras on the purchase route",
  "docs/figures-verification-2026-08-23.md — «≈€126 000 сверх стоимости объекта»",
  mt.extras,
  126_000,
  1,
);

check(
  "MT lease route, first year",
  "docs/figures-verification-2026-08-23.md — «Аренда: ≈€113 500 в первый год без гербового сбора»",
  mtRent1.extras,
  113_500,
  1,
);

// THE THRESHOLD, not the card's default input. They are not the same number
// and should not be: the default rounds the floor UP to the nearest thousand
// so the page does not open on an amount that fails its own test, while the
// claim below is about the floor itself. Asserting the default here failed by
// €600 the moment the default was rounded — correctly, and against the wrong
// quantity.
check(
  "AE threshold in euro",
  "src/lib/sourceData.ts — «AED 2m is about €466,400» at 4.288 on 23 August 2026",
  minimumFor("ae", DEFAULTS.ae),
  466_400,
  100,
);

check(
  "AE default input clears the threshold",
  "a default that trips the calculator's own below-the-floor warning is a defect",
  ae.committed >= minimumFor("ae", DEFAULTS.ae) ? 1 : 0,
  1,
  0,
);

// KNOWN OPEN DIVERGENCE, printed rather than asserted. The dossier's five-year
// lease range is not reproducible from the lines: rent, contribution, the
// administrative fee, the donation and the card come to €169,500, and the
// dossier says €190–205k. The gap is roughly a second administrative fee, so
// the likeliest explanation is that the range prices a renewal the lines do
// not — but that is a guess, and a guess does not become a figure here.
// docs/costmodel-verification-2026-09-02.md records it as unresolved.
console.log(
  `\n  open   MT lease over five years                        ${exact
    .format(mtRent5.extras)
    .padStart(14)}  vs   €190,000–205,000`,
);
console.log(
  "        docs/figures-verification-2026-08-23.md — «≈€190–205 тыс. за пять лет аренды». Unresolved;",
);
console.log("        no five-year lease figure is published anywhere on the site.");

console.log(
  failures === 0
    ? "\nAll checked claims reproduce. Nothing was written.\n"
    : `\n${failures} check(s) failed. Nothing was written.\n`,
);

process.exit(failures === 0 ? 0 : 1);
