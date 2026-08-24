"use client";

import { useEffect } from "react";
import { type LeadKind, stashLead, takeLead, trackLead } from "@/lib/analytics/lead";

interface LeadTrackingProps {
  /** The `id` of the form this instance watches. */
  formId: string;
  /** The fragment the route redirects to on success — "enquiry-sent" and so
   *  on, without the hash. */
  successHash: string;
  kind: LeadKind;
}

// Renders nothing. Two jobs, and they are in one component because they are
// two halves of one measurement that would otherwise be split across two files
// and drift apart.
//
// ON SUBMIT it stashes the kind of form and the path it was submitted from.
// That has to happen here rather than after the redirect, because the page the
// reader lands on is not always the page they submitted from.
//
// It does NOT stash the jurisdiction, and that is a policy constraint rather
// than an oversight — see the warning in lib/analytics/lead.ts.
//
// ON LOAD it checks whether the fragment is this form's success fragment and,
// if a matching stash is waiting, sends the event. See lib/analytics/lead.ts
// for why the return rather than the click, and what that means for the
// numbers.
//
// It attaches to the form by id rather than wrapping it, because two of the
// three forms are server components with no client boundary of their own, and
// wrapping them would have created one for no other reason.
export function LeadTracking({ formId, successHash, kind }: LeadTrackingProps) {
  useEffect(() => {
    const form = document.getElementById(formId);

    const onSubmit = () => {
      stashLead({ kind, path: window.location.pathname });
    };

    form?.addEventListener("submit", onSubmit);

    // The order matters and is safe either way: the listener is attached
    // before the check, so a page that is both a return AND has a form ready
    // for a second submission behaves correctly.
    if (window.location.hash === `#${successHash}`) {
      const detail = takeLead();
      // The kind guard stops one form's return from consuming another's
      // stash — impossible today, since each page carries one form, and free
      // to keep true.
      if (detail && detail.kind === kind) trackLead(detail);
    }

    return () => form?.removeEventListener("submit", onSubmit);
    // Mount only. The props are fixed for the life of the page, and re-running
    // this would re-send the event on any re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
