import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPathname, Link } from "@/i18n/navigation";
import { SectionHead } from "@/components/ui";
import { GOLDEN_VISA_NAMES } from "@/lib/goldenVisaNames";
import { entryHref, slugHref } from "@/lib/routes";
import { getSlugMap } from "@/lib/slugMap";
import { buildMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import { routeUrl } from "@/lib/urls";
import { sanityFetch } from "@/sanity/client";
import {
  COUNTRY_ROWS_QUERY,
  GOLDEN_VISA_PAGE_QUERY,
  GOLDEN_VISA_TAGS,
  HOME_TAGS,
} from "@/sanity/queries";
import type { CountryRowResult } from "@/sanity/types";

import styles from "./page.module.scss";

// /golden-visa — what the term means, and what the five states actually issue.
//
// THE ENTRY POINT THIS SITE DID NOT HAVE. Every other page here assumes the
// reader already knows what is being compared. The demand does not: the term
// and its nicknames — golden visa, golden passport, golden residency, visa by
// investment — carry more monthly searches than every jurisdiction page
// combined, and until this page existed they landed on nothing, or on one FAQ
// row halfway down /faq.
//
// WHY IT IS NOT A GUIDES & RESEARCH ENTRY. Same argument that kept /changes out
// of that section, and it is the section's own: an entry carries one date, its
// publication, and this page's whole content is a definition plus the current
// state of four instruments. A definition does not expire on a publication
// date; a threshold beside it does, and it is read from the registry so that it
// cannot go stale here independently.
//
// NOTHING ON THIS PAGE IS WRITTEN TWICE. The names come from
// src/lib/goldenVisaNames.ts, the thresholds and timelines from the country
// registry through the same query the home page uses, and the head from Sanity.
// There is no field anywhere on this route in which a figure could be typed.
const ROUTE = "/golden-visa";

// LOCAL RATHER THAN GENERATED. `sanity typegen` writes src/sanity/types.ts from
// the deployed schema, and this document type is newer than the last run. The
// shape is the projection in GOLDEN_VISA_PAGE_QUERY, field for field; when
// typegen next runs, this can be deleted in favour of the generated type.
interface GoldenVisaPageDoc {
  eyebrow: string;
  heading: string;
  intro: string;
  namesNote: string;
  seo: { metaTitle: string; metaDescription: string; noIndex?: boolean };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const page = await sanityFetch<GoldenVisaPageDoc | null>(
    GOLDEN_VISA_PAGE_QUERY,
    { locale },
    GOLDEN_VISA_TAGS,
  );
  if (!page) return {};

  return buildMetadata({ seo: page.seo, locale, href: ROUTE });
}

/** THE THREE CITIZENSHIP ENTRIES THE BLOCK LINKS DOWN TO, by translation key
 *  rather than by path — their slugs differ per language, exactly as the
 *  footer's do. Malta has no Russian version yet (plan item F6), and a language
 *  with no published entry is simply absent from the list: an inline link to a
 *  page nobody wrote is worse than a shorter list. Same rule the footer has
 *  followed since launch. */
const CITIZENSHIP_ENTRIES = [
  { key: "article-portugal-citizenship", label: "toPortugalCitizenship" },
  { key: "article-greece-citizenship", label: "toGreeceCitizenship" },
  { key: "article-malta-citizenship", label: "toMaltaCitizenship" },
] as const;

export default async function GoldenVisa({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, countries, t, slugMap] = await Promise.all([
    sanityFetch<GoldenVisaPageDoc | null>(
      GOLDEN_VISA_PAGE_QUERY,
      { locale },
      GOLDEN_VISA_TAGS,
    ),
    // Jurisdiction names and figures from the registry, exactly as the home
    // page and /changes take them. One place decides what a country is called
    // and what its threshold is; every page inherits both.
    sanityFetch<CountryRowResult[]>(COUNTRY_ROWS_QUERY, { locale }, HOME_TAGS),
    getTranslations({ locale, namespace: "goldenVisa" }),
    // The same map the layout reads for the footer. An entry's slug is data and
    // differs per language, so a link to one cannot be written by hand here.
    getSlugMap(),
  ]);

  if (!page) {
    console.error(
      `[moveandinvest] No goldenVisaPage document found for locale "${locale}" ` +
        `in dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}" ` +
        `of project "${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}". ` +
        `Run "npm run content -- --write".`,
    );
    notFound();
  }

  const byCode = new Map(countries.map((country) => [country.code, country]));
  const sourcesHref = getPathname({ href: "/sources", locale });

  // Rows the registry can actually name. A jurisdiction present in
  // goldenVisaNames but missing from the registry is a data error, not a row to
  // render half-empty.
  const nameRows = GOLDEN_VISA_NAMES.map((entry) => ({
    ...entry,
    country: byCode.get(entry.country),
  })).filter((row) => row.country);

  // Only jurisdictions whose page exists in this language: the table's last
  // column is a link, and a row that cannot be followed is a row that wastes
  // the reader's click.
  const compareRows = countries.filter((country) => country.page?.slug);

  const url = routeUrl(ROUTE, locale);

  // A DefinedTerm, not just a WebPage. The page's subject IS a term with three
  // nicknames and no legal existence, and that is precisely what alternateName
  // is for: it tells an answer engine that "golden passport" and "golden
  // residency" name the thing this page defines, which no amount of prose can
  // state as unambiguously.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: page.seo.metaTitle,
    description: page.seo.metaDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntity: {
      "@type": "DefinedTerm",
      "@id": `${url}#term`,
      name: page.heading,
      alternateName: ["golden visa", "golden passport", "golden residency"],
      description: page.intro,
      inDefinedTermSet: `${getSiteUrl()}/#website`,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Serialised from objects built above, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container">
        <SectionHead
          level={1}
          eyebrow={page.eyebrow}
          heading={page.heading}
          intro={page.intro}
        >
          <p className={styles.namesNote}>{page.namesNote}</p>
        </SectionHead>

        <section className={styles.block}>
          <h2 className={styles.blockHeading}>{t("namesHeading")}</h2>
          <div className={styles.scroller}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t("columns.jurisdiction")}</th>
                  <th scope="col">{t("columns.official")}</th>
                  <th scope="col">{t("columns.term")}</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>
                      {t("seeWorking")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {nameRows.map((row) => (
                  <tr key={row.section}>
                    <th scope="row">{row.country?.name}</th>
                    <td>{row.official[locale as keyof typeof row.official]}</td>
                    <td>{row.term[locale as keyof typeof row.term]}</td>
                    <td>
                      <a href={`${sourcesHref}#${row.section}`}>
                        {t("seeWorking")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ГРАЖДАНСТВО ЗА ИНВЕСТИЦИИ — БЛОК, ДОБАВЛЕННЫЙ 9 СЕНТЯБРЯ 2026, и он
            стоит здесь, между перечнем документов и таблицей стоимости,
            намеренно: страница объясняет, что такое золотая виза, и ровно в
            этом месте читатель путает её с тем, чем она не является.

            ПОЧЕМУ РАЗДЕЛ, А НЕ ОТДЕЛЬНАЯ СТРАНИЦА. Пункт F3 плана предполагал
            хаб под запрос «гражданство за инвестиции». Выдача по нему —
            глобальный листикл на шестнадцать стран (Вануату, Науру, Сан-Томе,
            Карибы, Турция, Египет), и ни одной из наших пяти в нём нет; из
            3 320 схлопнутых показов на наши юрисдикции приходится около 240.
            Своей формы у нас там нет. А хаб над русским кластером уже
            существует — это данная страница, построенная под определительный
            запрос 4 сентября. Новый адрес стоил бы места в очереди обхода на
            домене, где показы хоть раз были у 37 адресов из 93; раздел на уже
            обойдённой странице не стоит ничего. */}
        <section className={styles.block}>
          <h2 className={styles.blockHeading}>{t("citizenshipHeading")}</h2>
          <p className={styles.blockIntro}>{t("citizenshipBody")}</p>
          <p className={styles.blockIntro}>{t("citizenshipMalta")}</p>
          <nav className={styles.onward} aria-label={t("citizenshipHeading")}>
            {CITIZENSHIP_ENTRIES.map(({ key, label }) => {
              const slug = slugMap.entriesByKey[key]?.[locale];
              if (!slug) return null;
              return (
                <Link
                  key={key}
                  href={entryHref(slug, slugMap.entryKinds[slug] ?? "research")}
                >
                  {t(label)}
                </Link>
              );
            })}
          </nav>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockHeading}>{t("compareHeading")}</h2>
          <p className={styles.blockIntro}>{t("compareIntro")}</p>
          <div className={styles.scroller}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t("columns.jurisdiction")}</th>
                  <th scope="col">{t("columns.term")}</th>
                  <th scope="col">{t("columns.official")}</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>
                      {t("toCountry")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((country) => (
                  <tr key={country.code}>
                    <th scope="row">{country.name}</th>
                    <td>{country.page?.minimumInvestment}</td>
                    <td>{country.page?.timeToPermit}</td>
                    <td>
                      <Link href={slugHref(country.page?.slug ?? "")}>
                        {t("toCountry")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <nav className={styles.onward} aria-label={t("namesHeading")}>
          <Link href="/faq">{t("toFaq")}</Link>
          <Link href="/calculator">{t("toCalculator")}</Link>
          <Link href="/changes">{t("toChanges")}</Link>
        </nav>
      </div>
    </main>
  );
}
