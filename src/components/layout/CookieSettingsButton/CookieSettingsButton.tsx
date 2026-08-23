"use client";

import { openConsentManager } from "@/lib/consent/consent";

// The footer control that reopens the banner. A <button>, not a link: it
// performs an action on this page rather than navigating anywhere.
//
// It is not decoration. The privacy policy tells the reader they can change
// their mind at any time from the same control, and without this there is no
// same control — the only way back would be to clear cookies by hand, which
// is not "as easy to withdraw as to give".
export function CookieSettingsButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={() => openConsentManager()}>
      {label}
    </button>
  );
}
