"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Chevron } from "@/components/ui";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { SlugMap } from "@/lib/slugMap";
import styles from "./LocaleSwitcher.module.scss";

interface LocaleSwitcherProps {
  currentLocale: string;
  /** Localised slug → its siblings, for the eight pages whose URL is
   *  translated. Fixed routes are absent and do not need an entry. */
  slugMap: SlugMap;
}

// Codes, never flags. A Russian-speaking reader of this site may be in
// Warsaw, Limassol, Dubai or Lisbon — a flag would tie the language to a
// state and be wrong for most of them.
//
// A DROPDOWN SINCE 25 AUGUST 2026, and quieter than what it replaced. Three
// bordered chips in a row put the language choice at the same visual weight as
// the enquiry button, which is not what it is worth: almost every reader
// arrives in the language they want and never touches it. Now it is one grey
// code with the same chevron the jurisdictions submenu uses — the same
// affordance, from the same mixin, so the two cannot drift apart.
//
// Still a native <details>, like the burger and the FAQ accordion. It opens,
// closes and works from the keyboard with no JavaScript.
//
// --- What this used to get wrong ---------------------------------------------
//
// Until the same day, the component took the current path and prefixed a
// locale: on /greece the RU chip pointed at /ru/greece. There is no such page —
// the Russian one is /ru/gretsiya. Twenty-eight of the site's forty-five URLs
// had a switcher link returning 404: every page whose slug is genuinely
// translated, in every language pairing.
//
// The old comment here described exactly this, as a thing to fix "when
// jurisdiction pages land in step 5". They landed. The note outlived its own
// deadline, which is the argument for closing a known gap rather than
// documenting it — a comment cannot 404.
//
// `usePathname` is next-intl's, so it returns the path with the locale segment
// stripped: on /ru/gretsiya it gives "/gretsiya". That is the key into the map,
// and the map says what the same page is called in each language. Fixed routes
// (/about, /faq, /contacts…) are absent from the map and need no entry — their
// path is identical in all three languages, which is what the old code wrongly
// assumed was true of everything.
//
// A LANGUAGE WITH NO PAGE IS NOT A LINK. If a jurisdiction has no Polish
// document, the PL row is plain text rather than a link to nothing. The footer
// already holds this rule for its "soon" items, and it applies with more force
// here, in the component that was breaking it.
export function LocaleSwitcher({
  currentLocale,
  slugMap,
}: LocaleSwitcherProps) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  const bare = pathname.replace(/^\//, "");
  const siblings = slugMap[bare];

  // Close after a choice is made. Keyed on the LOCALE as well as the path, and
  // the locale is the one that matters: next-intl's pathname is stripped of the
  // locale segment, so switching from /faq to /ru/faq leaves it at "/faq" and a
  // path-only dependency would never fire. With scripts off the page reloads
  // and the question does not arise.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname, currentLocale]);

  return (
    <details ref={ref} className={styles.switcher}>
      <summary className={styles.trigger} aria-label={t("label")}>
        {t(currentLocale)}
        <Chevron className={styles.chevron} />
      </summary>

      <ul className={styles.list}>
        {routing.locales.map((locale) => {
          const isCurrent = locale === currentLocale;
          const target = siblings ? siblings[locale] : bare;

          return (
            <li key={locale}>
              {target === undefined ? (
                <span className={styles.absent} aria-disabled="true">
                  {t(locale)}
                </span>
              ) : (
                <Link
                  href={`/${target}`}
                  locale={locale}
                  lang={locale}
                  hrefLang={locale}
                  className={isCurrent ? styles.current : styles.item}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  {t(locale)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
