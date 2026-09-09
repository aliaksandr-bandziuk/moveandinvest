"use client";

import { useEffect, useRef } from "react";
import {
  CURRENCY,
  transferTax,
  type PtCategory,
  type TransferJurisdiction,
} from "@/lib/transferTaxModel";

// Behaviour only. Every row, citation and figure inside `children` was rendered
// on the server at the default price; this component rewrites them and creates
// nothing. Same rule as CostCalculatorControl, and for the same reason: a node
// created here is a node that gets created without its class the first time
// someone refactors the stylesheet.
//
// IT RECOMPUTES RATHER THAN INTERPOLATES. The model is a pure module and it
// imports cleanly into the browser, so the number under the reader's price is
// produced by the same function that produced the server's — not by scaling the
// server's answer, which would be wrong the moment a Portuguese price crosses a
// band edge.

interface Props {
  locale: string;
  confidence: Record<"primary" | "secondary" | "custom", string>;
  effectiveLabel: string;
  children: React.ReactNode;
}

const digits = /[^\d]/g;

export function TransferTaxControl({ locale, confidence, effectiveLabel, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const money = (currency: string, value: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);

    const percent = (value: number) =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    const group = (value: number) => new Intl.NumberFormat(locale).format(value);

    const cleanups: Array<() => void> = [];

    for (const block of Array.from(
      root.querySelectorAll<HTMLElement>("[data-jurisdiction]"),
    )) {
      const jurisdiction = block.dataset.jurisdiction as TransferJurisdiction | undefined;
      if (!jurisdiction) continue;
      const currency = CURRENCY[jurisdiction];

      const priceField = block.querySelector<HTMLInputElement>('[data-input="price"]');
      const categoryField = block.querySelector<HTMLSelectElement>('[data-input="pt-category"]');
      const buyerAllField = block.querySelector<HTMLInputElement>('[data-input="ae-buyer-all"]');
      const lineNodes = new Map(
        Array.from(block.querySelectorAll<HTMLElement>("[data-line]")).map((node) => [
          node.dataset.line ?? "",
          node,
        ]),
      );
      const totalNode = block.querySelector<HTMLElement>("[data-total]");
      const totalRateNode = block.querySelector<HTMLElement>("[data-total-rate]");
      if (!priceField || lineNodes.size === 0) continue;

      const render = () => {
        const price = Number(priceField.value.replace(digits, "")) || 0;
        const result = transferTax({
          jurisdiction,
          price,
          ptCategory: (categoryField?.value as PtCategory | undefined) ?? "other-housing",
          aeBuyerPaysAll: buyerAllField?.checked ?? false,
        });

        for (const line of result.lines) {
          const node = lineNodes.get(line.key);
          if (!node) continue;
          const amount = node.querySelector<HTMLElement>("[data-amount]");
          const rate = node.querySelector<HTMLElement>("[data-rate]");
          const tag = node.querySelector<HTMLElement>("[data-confidence]");
          const citation = node.querySelector<HTMLElement>("[data-citation]");
          const caveat = node.querySelector<HTMLElement>("[data-caveat]");

          if (amount) amount.textContent = money(currency, line.amount);
          if (rate) rate.textContent = line.effectiveRate === undefined ? "" : percent(line.effectiveRate);
          if (tag) {
            tag.dataset.confidence = line.confidence;
            tag.textContent = confidence[line.confidence];
          }
          if (citation) citation.textContent = line.citation;
          if (caveat) {
            caveat.textContent = line.caveat ?? "";
            // `data-off`, not `hidden` — see the note in the stylesheet.
            caveat.dataset.off = line.caveat ? "false" : "true";
          }
        }

        if (totalNode) totalNode.textContent = money(currency, result.total);
        if (totalRateNode) {
          totalRateNode.textContent = `${effectiveLabel} ${percent(result.effectiveRate)}`;
        }
      };

      // Digits are regrouped on blur rather than on every keystroke: regrouping
      // while someone is typing moves the caret, and moving the caret in a
      // number field is the single most irritating thing a calculator does.
      const onBlur = () => {
        const value = Number(priceField.value.replace(digits, "")) || 0;
        priceField.value = group(value);
      };

      priceField.addEventListener("input", render);
      priceField.addEventListener("blur", onBlur);
      categoryField?.addEventListener("change", render);
      buyerAllField?.addEventListener("change", render);
      cleanups.push(() => {
        priceField.removeEventListener("input", render);
        priceField.removeEventListener("blur", onBlur);
        categoryField?.removeEventListener("change", render);
        buyerAllField?.removeEventListener("change", render);
      });
    }

    return () => {
      for (const off of cleanups) off();
    };
  }, [locale, confidence, effectiveLabel]);

  return <div ref={ref}>{children}</div>;
}
