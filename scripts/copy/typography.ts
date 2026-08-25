// Moved to src/lib/typography.ts on 24 Aug 2026, when the sources dataset —
// rendered directly by the app, which cannot import from scripts/ — became the
// fourth consumer of this rule. Re-exported here so the copy modules keep
// importing it by the path they always did.
export { tightenNumbers, tightenDeep } from "../../src/lib/typography";
