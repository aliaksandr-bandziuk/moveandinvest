"use client";

import { useEffect, useRef } from "react";
import { mergeRouteAnswers } from "@/lib/routeAnswers";
import {
  type Answers,
  type BudgetCeiling,
  type FailReason,
  type Jurisdiction,
  type Priority,
  type SpeedNeed,
  rank,
} from "./matching";

export interface RouteFinderLabels {
  /** "{n} of {total} routes fit" — {n} and {total} are replaced. */
  count: string;
  /** Shown instead of `count` when nothing fits. {relax} is replaced with the
   *  matching `relax` phrase — the constraint the reader would have to move. */
  compromise: string;
  /** One phrase per constraint, e.g. "the deadline". */
  relax: Record<FailReason, string>;
  /** "{names} — over your budget", etc. {names} is replaced. */
  cut: Record<FailReason, string>;
  /** Placed between names inside one clause: ", ". */
  join: string;
  /** Placed between clauses: ". " */
  clauseJoin: string;
}

interface RouteFinderControlProps {
  jurisdictions: Jurisdiction[];
  labels: RouteFinderLabels;
  children: React.ReactNode;
}

// Behaviour only. Every word and every figure inside `children` was rendered
// on the server; this component never re-renders them through React and never
// owns their content.
//
// What it does instead is toggle attributes and write two short strings into
// two elements that the server deliberately left empty. The consequences are
// the point:
//
//   * With JS off, or before this mounts, all five readouts are visible as a
//     plain stacked list. That is a complete, crawlable summary of every
//     jurisdiction — a better no-JS state than the interactive one, not a
//     degraded one.
//   * With JS on, one readout shows at a time and the two empty elements fill
//     in. Nothing that was already on the page can be contradicted by them.
//
// The alternative — a client component holding `answers` in state and
// rendering the readout itself — would move all five summaries out of the
// server HTML for the sake of the same pixels.
export function RouteFinderControl({
  jurisdictions,
  labels,
  children,
}: RouteFinderControlProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const readouts = Array.from(
      root.querySelectorAll<HTMLElement>("[data-readout]"),
    );
    if (readouts.length === 0) return;

    const byCode = new Map(readouts.map((node) => [node.dataset.readout, node]));

    function readAnswers(): Answers {
      const checked = Array.from(
        root!.querySelectorAll<HTMLInputElement>("input[type=radio]:checked"),
      );
      const answers: Answers = {};
      for (const input of checked) {
        if (input.name === "budget") answers.budget = input.value as BudgetCeiling;
        if (input.name === "speed") answers.speed = input.value as SpeedNeed;
        if (input.name === "priority") answers.priority = input.value as Priority;
      }
      return answers;
    }

    function fill(template: string, values: Record<string, string>) {
      return Object.entries(values).reduce(
        (text, [key, value]) => text.split(`{${key}}`).join(value),
        template,
      );
    }

    function update() {
      const answers = readAnswers();
      const answered = Object.keys(answers).length > 0;
      root!.dataset.answered = answered ? "yes" : "no";
      if (!answered) return;

      const result = rank(jurisdictions, answers);
      if (!result.best) return;

      for (const node of readouts) {
        delete node.dataset.active;
      }
      const active = byCode.get(result.best.code);
      if (!active) return;
      active.dataset.active = "";

      // Handed to the enquiry form further down the page, which prefills
      // itself from it. Asking the same three questions again, blank, is how
      // a long form loses the reader who already answered them.
      //
      // sessionStorage, not a URL parameter or a cookie: the answers never
      // leave the tab, they expire when it closes, and nothing about the
      // page's caching changes. A failure here is silent by design — this is
      // a convenience, and neither block depends on it.
      mergeRouteAnswers({ ...answers, jurisdiction: result.best.code });

      const count = active.querySelector<HTMLElement>("[data-count]");
      if (count) {
        count.textContent = result.isCompromise
          ? fill(labels.compromise, {
              relax: labels.relax[result.mustRelax[0] ?? "priority"],
            })
          : fill(labels.count, {
              n: String(result.fits.length),
              total: String(jurisdictions.length),
            });
      }

      // One clause per reason, each naming every jurisdiction that fell to
      // it. Grouping by reason rather than listing five separate sentences is
      // what keeps this readable at three or four exclusions.
      const cutNode = active.querySelector<HTMLElement>("[data-cut]");
      if (cutNode) {
        const grouped = new Map<FailReason, string[]>();
        for (const entry of result.cut) {
          // In the compromise case `best` is itself a near miss, so it is in
          // `cut`. Listing it would have the readout name a jurisdiction and
          // then, two lines below, explain why that jurisdiction was ruled
          // out. The line above already says what it fails.
          if (entry.jurisdiction.code === result.best?.code) continue;
          const names = grouped.get(entry.reason) ?? [];
          names.push(entry.jurisdiction.name);
          grouped.set(entry.reason, names);
        }
        const clauses = (["budget", "speed", "priority"] as FailReason[])
          .filter((reason) => grouped.has(reason))
          .map((reason) =>
            fill(labels.cut[reason], {
              names: (grouped.get(reason) ?? []).join(labels.join),
            }),
          );
        cutNode.textContent = clauses.join(labels.clauseJoin);
      }
    }

    // Set last, so the CSS that hides four of the five readouts only ever
    // applies once this listener is attached and one of them is marked
    // active. Any earlier and a reader could see nothing at all.
    root.dataset.js = "on";
    root.addEventListener("change", update);
    update();

    return () => {
      root.removeEventListener("change", update);
      delete root.dataset.js;
    };
  }, [jurisdictions, labels]);

  return <div ref={ref}>{children}</div>;
}
