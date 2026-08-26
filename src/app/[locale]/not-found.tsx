import { getTranslations } from "next-intl/server";
import { Button, Eyebrow } from "@/components/ui";

import { homeSection } from "@/lib/routes";
import styles from "./not-found.module.scss";

// The 404, rendered inside the locale layout — so the header, the footer and
// the language switcher are all still there, and a reader who mistyped a slug
// is one click from the site rather than looking at a dead end.
//
// IT LISTS NO JURISDICTIONS, on purpose. The footer directly below already
// lists all five, in this locale, from the same registry the comparison table
// uses. A second list here would be a second thing to keep in step with a
// registry that gains a sixth entry the day Cyprus is verified.
//
// It fetches nothing. A 404 is the one page a crawler and a scanner hit dozens
// of times an hour, and a Sanity round trip on each of those buys a heading
// that could just as well come from the message catalogue.
//
// NO `notFound` LOCALE PARAM EXISTS: not-found.tsx receives no params. It works
// because the locale layout has already called setRequestLocale for this
// request before anything threw, so getTranslations resolves the right
// language. That is also why this file cannot be moved above the [locale]
// segment.
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className={styles.main}>
      <div className={`container ${styles.inner}`}>
        <Eyebrow>404</Eyebrow>
        <h1 className={styles.heading}>{t("heading")}</h1>
        <p className={styles.body}>{t("body")}</p>
        <div className={styles.actions}>
          <Button href="/">{t("homeLabel")}</Button>
          <Button href={homeSection("comparison")} variant="ghost">
            {t("comparisonLabel")}
          </Button>
        </div>
      </div>
    </main>
  );
}
