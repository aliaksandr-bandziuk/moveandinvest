"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onConsentChange, runWhenConsented } from "@/lib/consent/consent";
import { isClarityLoaded, loadClarity, stopClarity } from "@/lib/consent/loadClarity";
import { loadGoogleAnalytics, trackPageView } from "@/lib/consent/loadGoogleAnalytics";

// Mounted once in the layout beside CookieBanner. Renders nothing; its whole
// job is wiring the two vendor loaders through the gate the banner writes to.
//
// There is no <script> tag for GA or Clarity in this file, in the layout, or
// anywhere else in the repo. The tags come into existence inside the loaders,
// and the loaders only ever run through `runWhenConsented`.
//
// GA and Clarity share the "analytics" category rather than having one each,
// which matches how the privacy policy groups them: both answer "how is the
// site used", neither is advertising. `marketing` exists in the stored shape
// and gates nothing today.
export function AnalyticsLoader() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const unsubscribeGA = runWhenConsented("analytics", loadGoogleAnalytics);
    const unsubscribeClarity = runWhenConsented("analytics", loadClarity);

    // Neither script can be un-loaded once injected. GA copes because
    // trackPageView re-checks consent on every call; Clarity records
    // continuously and has no equivalent hook, so stopping it explicitly is
    // the only way a withdrawal takes effect before the next reload.
    const unsubscribeStop = onConsentChange((state) => {
      if (isClarityLoaded() && state?.analytics !== true) stopClarity();
    });

    return () => {
      unsubscribeGA();
      unsubscribeClarity();
      unsubscribeStop();
    };
  }, []);

  // The App Router does not fire a document load on client-side navigation.
  // The first pageview is sent from inside the loader itself, so this effect
  // skips its own first run rather than double-counting it.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);

  return null;
}
