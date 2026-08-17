import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "../LocaleSwitcher";
import styles from "./Header.module.scss";

interface HeaderProps {
  locale: string;
}

// Sits INSIDE the black plane and is not sticky.
//
// Both of those are deliberate. A white bar floating over a dark hero reads as
// a sticker; making the header part of the same plane is most of what makes
// the top of the site look considered. And a sticky bar on a page whose main
// element is a wide comparison table steals vertical space exactly where a
// reader needs it — so the top of every page is dark, the header lives there,
// and it scrolls away like everything else.
export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations("nav");

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.wordmark}>
          move<span className={styles.amp}>&amp;</span>invest
        </Link>

        <div className={styles.right}>
          <nav className={styles.nav} aria-label={t("navLabel")}>
            {/* Anchors the home page's comparison table, so it resolves from
                any page rather than only from the home route. */}
            <Link href="/#comparison" className={styles.navLink}>
              {t("countries")}
            </Link>
            <Link href="/for-partners" className={styles.navLink}>
              {t("forPartners")}
            </Link>
          </nav>

          <LocaleSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
