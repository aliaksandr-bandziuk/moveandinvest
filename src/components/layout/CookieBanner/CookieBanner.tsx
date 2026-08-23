"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  closeConsentManager,
  getConsent,
  isConsentManagerOpen,
  onConsentChange,
  onConsentManagerOpenChange,
  setConsent,
} from "@/lib/consent/consent";

import styles from "./CookieBanner.module.scss";

// TWO BUTTONS, NOT ONE, and the second one is the whole reason this component
// is more than a notice.
//
// A bar that says "this site uses cookies" with an OK button is not consent:
// consent has to be prior (nothing loads until it is given) and refusing has
// to be as easy as accepting. One button offers no refusal at all, so the
// only way to decline is to leave — which is not a choice, it is a toll. It
// would also make the privacy policy false: that page states, in the reader's
// own language, that refusing is one click the same size as agreeing.
//
// What this deliberately is NOT: a preferences panel with toggles. There is
// one gated category today, so a panel would be a modal to set a single
// switch. If advertising tags are added later, the switch list is the thing
// that grows — the two buttons stay.
//
// Two external stores rather than useState plus an effect. The state this
// component renders lives outside React — in a cookie and in a module-level
// flag — and useSyncExternalStore is the API for exactly that: it reads the
// value during render, keeps the server and client snapshots explicitly
// separate, and needs no effect to copy anything into component state.
function subscribeConsent(callback: () => void) {
  return onConsentChange(() => callback());
}

function consentSnapshot(): "decided" | "undecided" {
  return getConsent() === null ? "undecided" : "decided";
}

// The server always says "decided", which renders nothing. It is not a guess
// about the visitor: it is the only answer that cannot be wrong on screen.
// Guessing "undecided" would put a banner in the HTML that a returning
// visitor sees flash and disappear.
function consentServerSnapshot(): "decided" {
  return "decided";
}

function subscribeManager(callback: () => void) {
  return onConsentManagerOpenChange(() => callback());
}

function managerServerSnapshot(): false {
  return false;
}

export function CookieBanner() {
  const t = useTranslations("cookies");
  const decided = useSyncExternalStore(subscribeConsent, consentSnapshot, consentServerSnapshot);
  const reopened = useSyncExternalStore(
    subscribeManager,
    isConsentManagerOpen,
    managerServerSnapshot,
  );

  if (!reopened && decided === "decided") return null;

  const decide = (analytics: boolean) => {
    setConsent({ analytics, marketing: false });
    closeConsentManager();
  };

  return (
    // `role="region"` and a label rather than `role="dialog"`: this does not
    // trap focus and does not block the page, and announcing it as a dialog
    // would tell a screen-reader user they are stuck in something they are not.
    <aside className={styles.banner} role="region" aria-label={t("label")}>
      <div className={styles.inner}>
        <p className={styles.text}>
          {t("body")}{" "}
          <Link className={styles.link} href="/privacy">
            {t("more")}
          </Link>
        </p>

        {/* Equal weight, deliberately. The accept button is not larger, not
            brighter and not first-and-only: the two are the same size and sit
            side by side, because a refusal that is visually cheaper to skip
            is a refusal in name. */}
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={() => decide(false)}>
            {t("decline")}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={() => decide(true)}
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </aside>
  );
}
