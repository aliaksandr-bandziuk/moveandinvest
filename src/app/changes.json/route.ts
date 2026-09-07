import { NextResponse } from "next/server";

import {
  CHANGES_NOT_COVERED,
  CHANGES_REVIEWED_ON,
  CHANGES_UPDATED_ON,
  RULE_CHANGES,
} from "@/lib/changeData";
import { getSiteUrl } from "@/lib/site";

// The rule-change log as data, at one stable address for all three languages.
//
// WHY THIS EXISTS, AND IT IS NOT A DEVELOPER CONVENIENCE. Of the twenty
// competitors audited on 5 September 2026, none publishes a cross-jurisdiction
// log of rule changes with the date each took effect and the act that made it.
// That is the one thing this site has that other people have a reason to cite,
// and a thing gets cited when citing it is cheap. An HTML table is not cheap to
// cite: whoever wants to say "as of 19 May 2026 Portugal asks ten years" has to
// retype the row and will not link back. A stable JSON document with a stable
// id per row is cheap, and it carries the anchor of the human page in every
// entry, so anything built on it points home.
//
// ONE DOCUMENT FOR THREE LANGUAGES, not three documents. A consumer wanting the
// Polish string should not have to discover a second URL, and a log split by
// language invites the three copies to drift — which is the failure this site
// spent two days removing from its own keyword blocks.
//
// OUTSIDE src/app/[locale] DELIBERATELY. This address must not acquire a locale
// prefix: a citation is worth what it is worth because it does not rot, and
// /pl/changes.json would be a second address for the same document.
//
// WHAT IT DOES NOT DO: paginate, filter, or take parameters. Twenty-three rows
// is one response, and an API surface nobody asked for is a maintenance cost
// with no reader.

export const dynamic = "force-static";

export function GET() {
  const site = getSiteUrl();

  const body = {
    // Named so a consumer can branch on a future change of shape rather than
    // guessing from the keys present.
    schema: "moveandinvest/rule-changes/1",
    source: `${site}/changes`,
    licence:
      "Free to quote and to build on, with attribution to moveandinvest.com. " +
      "The instrument named in each entry is the authority; this document is a record of it.",
    // The two dates mean different things and are both published for the same
    // reason /sources publishes two: a quiet month is not an abandoned page.
    reviewedOn: CHANGES_REVIEWED_ON,
    updatedOn: CHANGES_UPDATED_ON,
    // Jurisdictions this site covers that have no entry, and it is a finding
    // rather than a gap. A consumer counting rows per country would otherwise
    // read the absence as "nothing changed".
    notCovered: CHANGES_NOT_COVERED,
    count: RULE_CHANGES.length,
    changes: RULE_CHANGES.map((change) => ({
      id: change.id,
      url: `${site}/changes#${change.id}`,
      effective: change.effective,
      // Present only where true, and it means the day is not established — the
      // date above is the first of the month standing in for it.
      ...(change.approximate ? { effectiveIsApproximate: true } : {}),
      country: change.country,
      what: change.what,
      // null, not omitted: "no published act could be found" is one of this
      // log's findings, and an absent key would read as an oversight.
      instrument: change.instrument,
      ...(change.moved ? { moved: change.moved } : {}),
      ...(change.section ? { workingUrl: `${site}/sources#${change.section}` } : {}),
    })),
  };

  return NextResponse.json(body, {
    headers: {
      // An hour at the edge, a day while revalidating. The log changes when a
      // law changes, which is not often, and a stale hour of it harms nobody.
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
