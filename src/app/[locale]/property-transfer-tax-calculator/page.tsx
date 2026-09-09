import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TransferTaxCalculator, type TransferTaxLabels } from "@/components/country";
import { getPathname } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/metadata";
import { SOURCES_HREF } from "@/lib/routes";
import type { Locale } from "@/i18n/routing";

import styles from "./page.module.scss";

// /property-transfer-tax-calculator — what the state takes when the deed is
// signed, at the reader's own price, in four jurisdictions.
//
// THE ITEM WAS CANCELLED AND THE OWNER OVERRULED IT, and the record should say
// why he was right. It was cancelled on 7 September because `portugal imt
// calculator` and every sibling phrase return zero across four keyword waves.
// That number is correct and it measures the wrong thing. A calculator is not
// read, it is USED and LINKED: the head of the cost calculator's page already
// records that a competitor's transfer-tax calculator "is a page, and it is the
// page their competitors' articles cite". Links are the binding constraint on
// this whole site — the domain had none at all a week ago. A tool that earns
// them is worth building at zero search volume, and measuring it by position
// would repeat the mistake that cancelled it.
//
// WHAT IT DELIBERATELY DOES NOT DO. It does not compute notary scales, cadastre
// fees, agents' commissions or the Dubai administrative tariff. Those live in
// src/lib/costModel.ts and are rendered by /calculator, and two tools computing
// the same charge is two tools that will one day disagree. The boundary is the
// instrument: this page models the transfer tax and whatever the SAME
// instrument sets, and sends the reader to the other tool for the rest.
//
// AND IT DOES NOT CONVERT CURRENCY. Three jurisdictions price in euro, Dubai in
// dirhams, and a converted total would be the only number on this site that
// nobody could check against an instrument.
const ROUTE = "/property-transfer-tax-calculator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "transferTax" });

  return buildMetadata({
    seo: { metaTitle: t("metaTitle"), metaDescription: t("metaDescription") },
    locale,
    href: ROUTE,
  });
}

export default async function TransferTaxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "transferTax" });
  const sourcesHref = getPathname({ href: SOURCES_HREF, locale });

  const labels: TransferTaxLabels = {
    place: {
      pt: t("place.pt"),
      gr: t("place.gr"),
      mt: t("place.mt"),
      ae: t("place.ae"),
    },
    instrument: {
      pt: t("instrument.pt"),
      gr: t("instrument.gr"),
      mt: t("instrument.mt"),
      ae: t("instrument.ae"),
    },
    lineName: {
      imt: t("lineName.imt"),
      stamp: t("lineName.stamp"),
      fma: t("lineName.fma"),
      "duty-promise": t("lineName.dutyPromise"),
      "duty-deed": t("lineName.dutyDeed"),
      "dld-transfer": t("lineName.dldTransfer"),
    },
    priceLabel: t("priceLabel"),
    priceHint: t("priceHint"),
    totalLabel: t("totalLabel"),
    effectiveLabel: t("effectiveLabel"),
    confidence: {
      primary: t("confidence.primary"),
      secondary: t("confidence.secondary"),
      custom: t("confidence.custom"),
    },
    checkedLabel: t("checkedLabel"),
    ptCategoryLabel: t("ptCategoryLabel"),
    ptCategory: {
      "own-permanent": t("ptCategory.ownPermanent"),
      "other-housing": t("ptCategory.otherHousing"),
      "other-urban": t("ptCategory.otherUrban"),
      rustic: t("ptCategory.rustic"),
      haven: t("ptCategory.haven"),
    },
    aeToggleLabel: t("aeToggleLabel"),
    aeToggleNote: t("aeToggleNote"),
    cliffHeading: t("cliffHeading"),
    // TEMPLATES, NOT MESSAGES, so they are read with `raw`.
    //
    // Both carry {threshold}, {below}, {above} and {step}, and next-intl sees
    // those as ICU arguments it is expected to fill. It cannot: the values come
    // out of transferTaxModel.ts, formatted in the component beside the table
    // they have to agree with. Asking `t()` for them throws FORMATTING_ERROR
    // before the string is even returned.
    //
    // The same pattern is documented at the head of /calculator, where a
    // placeholder is filled by the browser rather than by the server. Here it
    // is filled by the component, and for the same reason: whoever owns the
    // number owns the substitution.
    cliffBody: t.raw("cliffBody") as string,
    smoothBody: t.raw("smoothBody") as string,
    scopeHeading: t("scopeHeading"),
    scopeBody: t("scopeBody"),
    routeCostLink: t("routeCostLink"),
    routeCostHref: getPathname({ href: "/calculator", locale }),
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.heading}>{t("heading")}</h1>
        <p className={styles.intro}>{t("intro")}</p>
        <p className={styles.method}>
          {t("methodNote")}{" "}
          <a href={sourcesHref}>{t("sourcesLabel")}</a>
        </p>
      </header>

      <TransferTaxCalculator labels={labels} locale={locale as Locale} level={2} />
    </main>
  );
}
