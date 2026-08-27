import { SOURCE_SECTIONS } from "../../../lib/sourceData";

// The list an editor picks from when saying which sections of /sources an
// entry's figures were checked against.
//
// DERIVED FROM sourceData.ts RATHER THAN TYPED OUT, and that is the point. The
// keys are also the anchor ids on /sources, so a hand-written copy here would
// let the Studio offer a section that does not exist — a link to /sources#xx
// that lands at the top of the page and quietly says nothing. Adding a
// jurisdiction to sourceData adds it here on the next Studio load, with no
// second list to remember.
//
// English titles only, and deliberately: this is Studio chrome, seen by whoever
// is editing, not by a reader. The section's own heading on /sources is
// translated there.
export const SOURCE_SECTION_OPTIONS = SOURCE_SECTIONS.map((section) => ({
  value: section.key,
  title: section.heading?.en ?? section.key.toUpperCase(),
}));
