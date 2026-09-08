import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  NaturalisationClock,
  NaturalisationClockControl,
  type ClockLabels,
} from "@/components/country";
import { DEFAULT_INPUT, type CaveatKey } from "@/lib/naturalisationModel";
import { getPathname } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/metadata";
import { SOURCES_HREF } from "@/lib/routes";
import type { Locale } from "@/i18n/routing";

import styles from "./page.module.scss";

// /naturalisation-clock — the first tool on this site that answers a question
// about a DATE rather than a price.
//
// WHY IT EXISTS AS A TOOL AND NOT A TABLE IN AN ARTICLE. The Portuguese reform
// of 19 May 2026 moved two rules in opposite directions on the same day: the
// period doubled, and the paragraph that counted time spent waiting for a
// residence permit was repealed. Which of those two dominates depends entirely
// on facts only the reader has — when the permit was issued, when it was
// applied for, and whether a nationality file was already open. A table can
// state the rules; only a tool can tell one reader 2028 and the next 2035 off
// the same two rules.
//
// WHAT IT REFUSES TO DO IS THE POINT. Three of the model's outputs are "we will
// not give you a date": Greek residence once broken, Maltese four-of-six
// arithmetic without year-by-year presence, and the Greek reduced periods we
// have not read. Every competitor tool in this market answers everything.
//
// THE COPY IS IN messages/ AND NOT IN SANITY, for the reason the calculator's
// head already gives: these labels name keys of a model defined in code, and a
// label edited in Studio against a key that no longer exists would render an
// empty cell with no error anywhere.
const ROUTE = "/naturalisation-clock";

/** Every caveat the model can emit, listed once here so the server renders all
 *  of them and the client only switches them on and off.
 *
 *  WRITTEN OUT RATHER THAN DERIVED, and the ugliness is deliberate: this is a
 *  union type, so there is nothing to iterate at runtime. Listing it by hand
 *  means adding a caveat to the model without adding it here is a TYPE ERROR at
 *  this line rather than a caveat that silently never renders. */
const ALL_CAVEATS: CaveatKey[] = [
  "ptTransitional",
  "ptQueueGone",
  "ptWindow",
  "grContinuous",
  "grReduction",
  "grTemporary",
  "mtFinalYear",
  "mtBroken",
  "conditionsBeyondTime",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clock" });

  return buildMetadata({
    seo: { metaTitle: t("metaTitle"), metaDescription: t("metaDescription") },
    locale,
    href: ROUTE,
  });
}

export default async function NaturalisationClockPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "clock" });

  const labels: ClockLabels = {
    heading: t("heading"),
    intro: t("intro"),
    qIssued: t("qIssued"),
    qIssuedNote: t("qIssuedNote"),
    qApplied: t("qApplied"),
    qAppliedNote: t("qAppliedNote"),
    qGroup: t("qGroup"),
    groupEuCplp: t("groupEuCplp"),
    groupOther: t("groupOther"),
    qFiled: t("qFiled"),
    qFiledNote: t("qFiledNote"),
    qContinuous: t("qContinuous"),
    qContinuousNote: t("qContinuousNote"),
    yes: t("yes"),
    no: t("no"),
    colWhere: t("colWhere"),
    colEarliest: t("colEarliest"),
    colRule: t("colRule"),
    countedFromIssued: t("countedFromIssued"),
    countedFromApplied: t("countedFromApplied"),
    yearsSuffix: t("yearsSuffix"),
    noRoute: t("noRoute"),
    noRouteNote: t("noRouteNote"),
    unread: t("unread"),
    soonestIs: t("soonestIs"),
    soonestNone: t("soonestNone"),
    sourcesLabel: t("sourcesLabel"),
    sourcesHref: getPathname({ href: SOURCES_HREF, locale }),
    caveats: Object.fromEntries(
      ALL_CAVEATS.map((key) => [key, t(`caveats.${key}`)]),
    ) as Record<CaveatKey, string>,
    names: {
      pt: t("names.pt"),
      gr: t("names.gr"),
      mt: t("names.mt"),
      ae: t("names.ae"),
    },
  };

  return (
    <main className={styles.main}>
      <NaturalisationClockControl labels={labels} locale={locale as Locale}>
        <NaturalisationClock
          labels={labels}
          locale={locale as Locale}
          input={DEFAULT_INPUT}
          allCaveats={ALL_CAVEATS}
        />
      </NaturalisationClockControl>
    </main>
  );
}
