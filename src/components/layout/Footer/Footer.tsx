import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FOOTER_GROUPS } from "@/lib/footerNav";
import { articleHref } from "@/lib/routes";
import { CookieSettingsButton } from "../CookieSettingsButton";

import type { AppHref } from "@/lib/routes";
import styles from "./Footer.module.scss";

export interface FooterJurisdiction {
  id: string;
  name: string;
  /** Absent while the page for this locale is still a draft. */
  href?: AppHref;
}

interface FooterProps {
  /** Falls back to the message catalogue until siteSettings is populated. */
  disclaimer?: string;
  contactEmail?: string;
  jurisdictions?: FooterJurisdiction[];
  year?: number;
  /** Slug of each Guides & Research entry IN THE LANGUAGE BEING RENDERED,
   *  keyed by its translation key. Resolved in the layout, which already holds
   *  the slug map, rather than here — a footer that fetched its own links would
   *  be a second read of the same data on every page.
   *
   *  An entry missing from this map is an entry that has not been published, or
   *  not in this language: the row falls back to the greyed "soon" state, which
   *  is the same rule the section has held since launch. */
  entrySlugs?: Record<string, string>;
}

// Three storeys, in this order: an invitation to write, the wordmark as a
// watermark, then the links and the legal line.
//
// The watermark sits in the MIDDLE rather than at the bottom, and that is the
// reason the invitation is above it: a wordmark under the last link is a
// signature, and a wordmark between two blocks of text is a divider that
// happens to be the brand. It is aria-hidden — the same word is already the
// site's first link in the header, and a screen reader gains nothing from
// hearing it again as decoration.
//
// The disclaimer is not decoration either. This site compares regimes and
// does not advise, and saying so where a visitor cannot miss it is what keeps
// a comparison table from reading as a recommendation.
export async function Footer({
  disclaimer,
  contactEmail,
  jurisdictions = [],
  year,
  entrySlugs = {},
}: FooterProps) {
  const t = await getTranslations("footer");

  return (
    <footer className={styles.footer}>
      <div className={styles.invite}>
        <div className={`container ${styles.inviteRow}`}>
          <p className={styles.inviteText}>{t("invite")}</p>
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`} className={styles.email}>
              {contactEmail}
            </a>
          ) : null}
        </div>
      </div>

      <div className={`container ${styles.watermarkWrap}`}>
        <p className={styles.watermark} aria-hidden="true">
          move<span className={styles.amp}>&amp;</span>invest
        </p>
      </div>

      <div className="container">
        <nav className={styles.groups} aria-label={t("navLabel")}>
          {jurisdictions.length > 0 ? (
            <div className={styles.group}>
              <h2 className={styles.groupTitle}>{t("groups.jurisdictions")}</h2>
              <ul className={styles.links}>
                {jurisdictions.map((jurisdiction) => (
                  <li key={jurisdiction.id}>
                    {jurisdiction.href ? (
                      <Link className={styles.link} href={jurisdiction.href}>
                        {jurisdiction.name}
                      </Link>
                    ) : (
                      <span className={styles.pending}>
                        {jurisdiction.name}
                        <span className={styles.soon}>{t("soon")}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {FOOTER_GROUPS.map((group) => (
            <div key={group.key} className={styles.group}>
              <h2 className={styles.groupTitle}>{t(`groups.${group.key}`)}</h2>
              <ul className={styles.links}>
                {group.links.map((link) => (
                  <li key={link.key}>
                    {link.action === "cookies" ? (
                      // The one entry that is a control rather than a
                      // destination: it reopens the consent banner. Styled as
                      // a link because that is what it looks like in a footer
                      // list, and it is the route back that the privacy
                      // policy promises exists.
                      <CookieSettingsButton
                        className={`${styles.link} ${styles.linkButton}`}
                        label={t(`links.${link.key}`)}
                      />
                    ) : link.entry && entrySlugs[link.entry] ? (
                      // A published entry, reached by its translation key. The
                      // slug is the one for this locale; see SlugMap.entriesByKey
                      // for why the key rather than a path.
                      <Link
                        className={styles.link}
                        href={articleHref(entrySlugs[link.entry] as string)}
                      >
                        {t(`links.${link.key}`)}
                      </Link>
                    ) : link.href ? (
                      <Link className={styles.link} href={link.href}>
                        {t(`links.${link.key}`)}
                      </Link>
                    ) : (
                      <span className={styles.pending}>
                        {t(`links.${link.key}`)}
                        <span className={styles.soon}>{t("soon")}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <p className={styles.disclaimer}>{disclaimer ?? t("disclaimer")}</p>
          <div className={styles.meta}>
            <span>© {year ?? new Date().getFullYear()} moveandinvest</span>
            {/* A plain external link, deliberately WITHOUT rel="nofollow".
                There is no rel="follow" and no rel="index" — followed and
                indexable is what a link already is, and the only way to change
                that is to add nofollow, which is exactly what this must not
                have. rel="noopener" is a security measure and has no bearing
                on how a crawler treats the link. */}
            <span className={styles.credit}>
              {t("creditPrefix")}{" "}
              <a
                className={styles.creditLink}
                href="https://www.bandziuk.com"
                target="_blank"
                rel="noopener"
              >
                bandziuk.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
