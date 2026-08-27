"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Chevron } from "@/components/ui";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { DISMISS_ATTR } from "@/lib/dismiss";
import { articleHref, slugHref, type AppHref } from "@/lib/routes";
import type { SlugMap } from "@/lib/slugMap";
import styles from "./LocaleSwitcher.module.scss";

interface LocaleSwitcherProps {
  currentLocale: string;
  /** Localised slug → its siblings, for the eight pages whose URL is
   *  translated. Fixed routes are absent and do not need an entry. */
  slugMap: SlugMap;
  /** Open the list above the trigger instead of below it. Set in the mobile
   *  panel, where this sits on the bottom edge of a full-height sheet and a
   *  list dropping downward would be off the screen. */
  dropUp?: boolean;
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
// THE LIST HOLDS ONLY THE OTHER LANGUAGES. The trigger is the current one, in
// the same two letters; repeating it as the first row of the panel makes a
// three-item list where one item does nothing, and a reader has to read all
// three to find the two that are choices. What the current language costs by
// leaving the list is a "you are here" mark, and the trigger is that mark.
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
  dropUp = false,
}: LocaleSwitcherProps) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  const route = usePathname();
  const params = useParams<{ slug?: string }>();
  const t = useTranslations("localeSwitcher");

  // THE SLUG COMES FROM THE ROUTE PARAMS, NOT FROM THE PATH, and that changed
  // on 26 August 2026 when the fixed routes gained translated URLs.
  //
  // This used to read `usePathname().replace(/^\//, "")` and look the result up
  // in the map. That worked only while the routing config had no `pathnames`:
  // next-intl's usePathname returns the INTERNAL route once it does, so on
  // /ru/gretsiya it now yields "/[slug]" — the template, not the slug. Every
  // lookup would have missed, silently, on exactly the twenty-eight URLs this
  // component exists to get right. Found by reading getRoute in next-intl
  // rather than by clicking, which would not have looked any different until
  // the wrong language was reached.
  //
  // useParams is the right source anyway: the slug is a route parameter, and
  // reading it as one cannot be broken by a change to how paths are spelled.
  // TWO DYNAMIC ROUTES NOW, and they have to be told apart. A [slug] at the top
  // level is a jurisdiction or property page; a [slug] under /blog is a
  // entry in Guides & Research. Their slug spaces are unrelated, so the map is two lookups
  // and the route picks which one — see slugMap.ts.
  const slug = params.slug;
  const isEntry = route === "/blog/[slug]";
  const siblings = slug
    ? isEntry
      ? slugMap.entries[slug]
      : slugMap.pages[slug]
    : undefined;

  // Close after a choice is made. Keyed on the LOCALE as well as the path, and
  // the locale is the one that matters: next-intl's pathname is stripped of the
  // locale segment, so switching from /faq to /ru/faq leaves it at "/faq" and a
  // path-only dependency would never fire. With scripts off the page reloads
  // and the question does not arise.
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [route, currentLocale]);

  return (
    <details ref={ref} className={styles.switcher} {...{ [DISMISS_ATTR]: "" }}>
      {/* THE ACCESSIBLE NAME CARRIES THE CURRENT LANGUAGE, and it has to since
          the list below stopped carrying it. `aria-label` replaces the element's
          own text for a screen reader, so a bare "Language" would leave a reader
          who cannot see the code with a control that never says which of the
          three they are in. */}
      <summary
        className={styles.trigger}
        aria-label={t("labelCurrent", { code: t(currentLocale) })}
      >
        {/* The span is load-bearing — see mixins.cap-height-box. Without an
            element of its own the code is an anonymous flex item, and the
            property that lines it up with the chevron cannot reach it. */}
        <span className={styles.code}>{t(currentLocale)}</span>
        <Chevron className={styles.chevron} />
      </summary>

      {/* THE CURRENT LANGUAGE IS NOT IN THE LIST. It was, marked white and with
          aria-current, on the argument that "you are here" is worth showing —
          but the trigger the reader just clicked already shows it, in the same
          two letters, two rows above. A list of three where one is the thing you
          already have is a list where every choice has to be read twice to find
          the two that do something. Two rows, both of them destinations. */}
      <ul className={dropUp ? `${styles.list} ${styles.up}` : styles.list}>
        {routing.locales.map((locale) => {
          if (locale === currentLocale) return null;

          // Two kinds of page, and only one of them needs the map. A fixed
          // route is the same route in every language — the router spells it
          // differently, which is precisely what it is for — so the current
          // route is handed straight back. A Sanity page has a slug of its own
          // per language, and that is what the map holds.
          const sibling = siblings?.[locale];
          const href: AppHref | undefined = siblings
            ? sibling === undefined
              ? undefined
              : isEntry
                ? articleHref(sibling)
                : slugHref(sibling)
            : // A dynamic route with no siblings: the page exists in this
              // language only, and there is nowhere to send the reader. A fixed
              // route is the same route everywhere, so it is handed back as is
              // and the router spells it for the language chosen.
              route === "/[slug]" || route === "/blog/[slug]"
              ? undefined
              : route;

          return (
            <li key={locale}>
              {href === undefined ? (
                <span className={styles.absent} aria-disabled="true">
                  {t(locale)}
                </span>
              ) : (
                <Link
                  href={href}
                  locale={locale}
                  lang={locale}
                  hrefLang={locale}
                  className={styles.item}
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
