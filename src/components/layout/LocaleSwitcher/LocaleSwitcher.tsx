"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "./LocaleSwitcher.module.scss";

interface LocaleSwitcherProps {
  currentLocale: string;
}

// Codes, never flags. A Russian-speaking reader of this site may be in
// Warsaw, Limassol, Dubai or Lisbon — a flag would tie the language to a
// state and be wrong for most of them.
//
// usePathname here is next-intl's, not Next's: it returns the pathname with
// the locale segment already stripped, so passing it back to Link with a
// different `locale` produces the correct counterpart. That is exact for
// every fixed route. Jurisdiction pages have genuinely translated slugs
// (/greece vs /gretsiya), so when those land in step 5 this component reads
// the reciprocal path from the page's own hreflang tag instead — the same
// mechanism the sibling project uses. Until then there are only fixed
// routes and this is correct for all of them.
export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  return (
    <nav className={styles.switcher} aria-label={t("label")}>
      {routing.locales.map((locale) => {
        const isCurrent = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            lang={locale}
            hrefLang={locale}
            className={isCurrent ? styles.current : styles.item}
            aria-current={isCurrent ? "true" : undefined}
          >
            {t(locale)}
          </Link>
        );
      })}
    </nav>
  );
}
