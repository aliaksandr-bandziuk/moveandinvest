"use client";

import { useEffect, useRef } from "react";
import {
  clock,
  formatClockDate,
  soonest,
  type ClockInput,
  type NationalityGroup,
  type NatCode,
} from "@/lib/naturalisationModel";
import type { Locale } from "@/i18n/routing";

import type { ClockLabels } from "./NaturalisationClock";

interface Props {
  labels: ClockLabels;
  locale: Locale;
  children: React.ReactNode;
}

// BEHAVIOUR ONLY. Every row, date, citation and caveat inside `children` was
// rendered on the server; this component creates nothing. It reads the five
// controls, runs the same pure model the server ran, and writes the answers
// back into nodes that already exist.
//
// The one thing it must never do is invent a sentence. Where the model changes
// its verdict — a date becomes "we have not read the rule" — the row's
// `data-verdict` flips and the stylesheet swaps which of the two already
// rendered spans is visible. Writing new prose here would put a sixth copy of
// the legal text in a place no translation file can reach.
export function NaturalisationClockControl({ labels, locale, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const issued = root.querySelector<HTMLInputElement>('[data-input="issued"]');
    const applied = root.querySelector<HTMLInputElement>('[data-input="applied"]');
    const summary = root.querySelector<HTMLElement>("[data-summary]");
    if (!issued) return;

    const rows = new Map<NatCode, HTMLElement>();
    for (const node of Array.from(root.querySelectorAll<HTMLElement>("[data-row]"))) {
      const code = node.dataset.row as NatCode | undefined;
      if (code) rows.set(code, node);
    }
    if (rows.size === 0) return;

    const checked = (name: string): string | null =>
      root.querySelector<HTMLInputElement>(`[data-input="${name}"]:checked`)?.value ?? null;

    function read(): ClockInput | null {
      const permitIssued = issued!.value;
      // AN EMPTY OR HALF-TYPED DATE IS NOT AN INPUT. A native date field
      // reports "" while the reader is still filling it, and 0002-06-01 the
      // moment they have typed two digits of the year. Recomputing on either
      // produces a date fourteen centuries out, drawn confidently, for as long
      // as it takes to type the third digit.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(permitIssued)) return null;
      if (Number(permitIssued.slice(0, 4)) < 1900) return null;

      const permitApplied =
        applied && /^\d{4}-\d{2}-\d{2}$/.test(applied.value) && Number(applied.value.slice(0, 4)) >= 1900
          ? applied.value
          : undefined;

      return {
        permitIssued,
        permitApplied,
        group: (checked("group") as NationalityGroup | null) ?? "other",
        filedBefore19May2026: checked("filed") === "yes",
        continuous: checked("continuous") !== "no",
      };
    }

    function paint() {
      const input = read();
      if (!input) return;
      const results = clock(input);

      for (const r of results) {
        const row = rows.get(r.code);
        if (!row) continue;

        row.dataset.verdict = r.verdict;

        const dateNode = row.querySelector<HTMLElement>("[data-date]");
        const yearsNode = row.querySelector<HTMLElement>("[data-years]");
        const countedNode = row.querySelector<HTMLElement>("[data-counted]");
        const instrumentNode = row.querySelector<HTMLElement>("[data-instrument]");

        if (dateNode && r.earliest) dateNode.textContent = formatClockDate(r.earliest, locale);
        if (yearsNode && r.years !== null) yearsNode.textContent = String(r.years);
        if (countedNode) {
          countedNode.textContent =
            r.countedFrom === "permit-applied"
              ? labels.countedFromApplied
              : labels.countedFromIssued;
        }
        if (instrumentNode) instrumentNode.textContent = r.instrument;

        for (const node of Array.from(row.querySelectorAll<HTMLElement>("[data-caveat]"))) {
          const key = node.dataset.caveat;
          const on = key ? r.caveats.includes(key as never) : false;
          if (on) delete node.dataset.off;
          else node.dataset.off = "true";
        }
      }

      if (summary) {
        const first = soonest(results);
        summary.textContent = first
          ? `${labels.soonestIs} ${labels.names[first.code]}, ${formatClockDate(first.earliest!, locale)}`
          : labels.soonestNone;
      }
    }

    const controls = root.querySelector<HTMLElement>("[data-controls]");
    controls?.addEventListener("input", paint);
    controls?.addEventListener("change", paint);
    // No initial paint: the server already rendered this exact state. Painting
    // on mount would rewrite every node with identical text and, on a slow
    // device, do it visibly.
    return () => {
      controls?.removeEventListener("input", paint);
      controls?.removeEventListener("change", paint);
    };
  }, [labels, locale]);

  return <div ref={ref}>{children}</div>;
}
