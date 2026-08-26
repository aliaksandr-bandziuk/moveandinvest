import { getTranslations } from "next-intl/server";
import { Chevron } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { HEADER_CTA, HEADER_NAV, type HeaderLink } from "@/lib/headerNav";
import type { SlugMap } from "@/lib/slugMap";
import { LocaleSwitcher } from "../LocaleSwitcher";
import { HeaderMenu } from "./HeaderMenu";
import styles from "./Header.module.scss";

export interface HeaderJurisdiction {
  id: string;
  name: string;
  /** Absent for a jurisdiction with no page yet — rendered, never linked. */
  href?: string;
}

interface HeaderProps {
  locale: string;
  /** Fetched once in the layout and passed down, so the language switcher can
   *  point at the real counterpart of a translated slug. */
  slugMap: SlugMap;
  /** The live jurisdiction registry, for the one submenu that is not written
   *  in headerNav.ts. */
  jurisdictions: HeaderJurisdiction[];
}

// STICKY SINCE 25 AUGUST 2026, and the decision it replaces was a good one.
//
// The previous comment here read: "Sits INSIDE the black plane and is not
// sticky. Both of those are deliberate. A white bar floating over a dark hero
// reads as a sticker... and a sticky bar on a page whose main element is a wide
// comparison table steals vertical space exactly where a reader needs it."
//
// Both halves were right and one of them still is. The bar is not white and
// never becomes white — it stays on the dark plane, which is why it can detach
// without reading as a sticker. What changed is the second half: it was written
// when the longest page was a home page of eight sections. /faq is now
// fifty-two questions in eleven groups, and from the bottom of it there is no
// route back to navigation except the scroll wheel.
//
// The old argument is not discarded, it is paid for: the bar SHRINKS once the
// page has moved, so what it costs the comparison table is less than the header
// cost before it was sticky. See the stylesheet — a scroll-driven animation
// where the browser has one, a plain fixed bar at the smaller height where it
// does not.
export async function Header({ locale, slugMap, jurisdictions }: HeaderProps) {
  const t = await getTranslations("nav");

  // The registry fills exactly one item. Written as a transform of the nav
  // rather than a branch inside the markup, so the rendering below never has to
  // know which item is the special one.
  const items: HeaderLink[] = HEADER_NAV.map((item) =>
    item.fromJurisdictions
      ? {
          ...item,
          children: jurisdictions.map((country) => ({
            key: country.id,
            href: country.href,
          })),
        }
      : item,
  );

  // A jurisdiction's name comes from Sanity and is already localised; a fixed
  // route's label is a message key.
  const label = (item: HeaderLink) =>
    jurisdictions.find((entry) => entry.id === item.key)?.name ??
    t(`links.${item.key}`);

  const renderItem = (item: HeaderLink) => {
    if (item.children) {
      return (
        // The submenu is a <details> as well, so the desktop dropdown and the
        // mobile accordion are one element behaving differently under two
        // stylesheets — rather than two components to keep in agreement.
        <details key={item.key} className={styles.group}>
          <summary className={styles.groupLabel}>
            {label(item)}
            <Chevron className={styles.chevron} />
          </summary>
          <ul className={styles.submenu}>
            {item.children.map((child) => (
              <li key={child.key}>
                {child.href ? (
                  <Link href={child.href} className={styles.subLink}>
                    {label(child)}
                  </Link>
                ) : (
                  // A jurisdiction with no page. Shown, because the site says
                  // it covers five and hiding one would misrepresent that; not
                  // linked, because there is nowhere to go.
                  <span className={styles.subAbsent}>
                    {label(child)}{" "}
                    <span className={styles.soon}>{t("soon")}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      );
    }

    return (
      <Link key={item.key} href={item.href ?? "/"} className={styles.navLink}>
        {label(item)}
      </Link>
    );
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.wordmark}>
          move<span className={styles.amp}>&amp;</span>invest
        </Link>

        {/* Desktop: the items in a row. */}
        <div className={styles.desktop}>
          <nav className={styles.desktopNav} aria-label={t("navLabel")}>
            {items.map(renderItem)}
          </nav>
          <LocaleSwitcher currentLocale={locale} slugMap={slugMap} />
          <Link href={HEADER_CTA.href} className={styles.cta}>
            {t(`links.${HEADER_CTA.key}`)}
          </Link>
        </div>

        {/* Phone: one button, one panel. Same items. */}
        <HeaderMenu id="header-menu" className={styles.menu}>
          <summary className={styles.burger} aria-label={t("menu")}>
            <span className={styles.burgerBar} aria-hidden="true" />
            <span className={styles.burgerBar} aria-hidden="true" />
          </summary>
          <div className={styles.panel}>
            <nav className={styles.panelNav} aria-label={t("navLabel")}>
              {items.map(renderItem)}
            </nav>
            <div className={styles.panelFoot}>
              <LocaleSwitcher currentLocale={locale} slugMap={slugMap} />
              <Link href={HEADER_CTA.href} className={styles.cta}>
                {t(`links.${HEADER_CTA.key}`)}
              </Link>
            </div>
          </div>
        </HeaderMenu>
      </div>
    </header>
  );
}
