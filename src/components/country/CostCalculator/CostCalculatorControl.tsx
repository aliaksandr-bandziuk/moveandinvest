"use client";

import { useEffect, useRef } from "react";
import { CALC_YEARS as YEARS, baseInputs } from "@/lib/calcSummary";
import { budgetBandFor, mergeRouteAnswers } from "@/lib/routeAnswers";
import { CALC_CODES, type CalcCode } from "@/lib/costModel";

import type { CostCalculatorLabels } from "./CostCalculator";
import {
  basisText,
  currencyFormatter,
  fill,
  formatEur,
  groupDigits,
  parseDigits,
} from "./format";
import { ALL_GROUPS } from "./groups";
import { buildRow, rankRows, scaleOf, verdictFor, type Row } from "./rows";

interface CostCalculatorControlProps {
  labels: CostCalculatorLabels;
  locale: string;
  children: React.ReactNode;
}

// Behaviour only. Every row, sentence, citation and figure inside `children`
// was rendered on the server; this component never creates one.
//
// It has less to do than the version before it, and that is the point. A row's
// figures come from the programme, not from the budget, so moving the budget
// touches three things: the verdict sentence, the vertical line across the
// bars, and the order of the rows. The bars themselves are rewritten only when
// the reader types a property price into one programme's own working.
export function CostCalculatorControl({
  labels,
  locale,
  children,
}: CostCalculatorControlProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const list = root.querySelector<HTMLElement>("[data-rows]");
    const nodes = new Map<CalcCode, HTMLElement>();
    for (const node of Array.from(root.querySelectorAll<HTMLElement>("[data-row]"))) {
      const code = node.dataset.row as CalcCode | undefined;
      if (code) nodes.set(code, node);
    }
    if (!list || nodes.size === 0) return;

    // --- Motion ---------------------------------------------------------------
    // `ready` is false until one frame after the first paint. A link carries
    // the budget in its fragment, so the first paint can move everything at
    // once; playing that back as an animation while the page is still settling
    // is noise, not feedback. The stylesheet is gated on the same frame — see
    // the note there.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const running = new Map<HTMLElement, Animation>();
    let ready = false;
    let deferred = false;
    let settle: number | undefined;

    const format = currencyFormatter(locale);
    const valueField = root.querySelector<HTMLInputElement>('[data-input="value"]');
    const slider = root.querySelector<HTMLInputElement>('[data-input="slider"]');
    const verdictNode = root.querySelector<HTMLElement>("[data-verdict]");
    const cutTag = root.querySelector<HTMLElement>("[data-cut-tag]");

    /** The name the server printed, read back rather than passed in — the
     *  country registry owns it, and a second copy here would be a second
     *  source of truth for a string that already has one. */
    const nameOf = (code: CalcCode) => nodes.get(code)?.dataset.name ?? code;

    const inputs = baseInputs();

    /** A price the reader actually supplied, or nothing.
     *
     *  UNTOUCHED MEANS ABSENT, and that matters twice over. The field ships
     *  filled with the programme's own floor, so without this every state
     *  would carry four amounts that say nothing — and the address bar is a
     *  link people paste into messages, which is the reason it holds plain
     *  parameters rather than an encoded blob. `#value=500000` is a sentence;
     *  the same thing with four floors appended is not. It also keeps an old
     *  link from pinning a floor that has since moved: what is not stated is
     *  taken from the model, which is where it should come from anyway. */
    function amountFor(code: CalcCode): number | undefined {
      const field = root!.querySelector<HTMLInputElement>(
        `[data-input="amount"][data-for="${code}"]`,
      );
      if (!field) return undefined;
      const typed = parseDigits(field.value);
      if (typed <= 0) return undefined;
      return typed === parseDigits(field.defaultValue) ? undefined : typed;
    }

    function paintRow(row: Row, budget: number, scale: number) {
      const node = nodes.get(row.code);
      if (!node) return;
      const pct = (value: number) => Math.max(0, Math.min(100, (value / scale) * 100));
      const at = (value: number) => `${pct(value)}%`;
      const { fits, diff } = verdictFor(row, budget);
      node.dataset.fits = fits ? "yes" : "no";

      const real = node.querySelector<HTMLElement>("[data-real]");
      if (real) real.textContent = formatEur(row.real, format);

      const advertised = node.querySelector<HTMLElement>('[data-bar="advertised"]');
      if (advertised) advertised.style.width = at(row.advertised);
      const extras = node.querySelector<HTMLElement>('[data-bar="extras"]');
      if (extras) {
        extras.style.left = at(row.advertised);
        extras.style.width = at(row.extras);
      }
      // The surplus, drawn as the stretch between the bar and the line. See
      // the note in the component.
      const surplus = node.querySelector<HTMLElement>('[data-bar="surplus"]');
      if (surplus) {
        // The `hidden` attribute is the server's answer, and it cannot be
        // animated away from. With the control running the element stays in
        // the box at zero width, anchored where the bar ends, so it grows out
        // of the bar rather than appearing beside it. See the stylesheet.
        surplus.hidden = false;
        surplus.dataset.on = fits ? "yes" : "no";
        surplus.style.left = at(row.real);
        surplus.style.width = fits
          ? `${Math.max(0, pct(budget) - pct(row.real))}%`
          : "0%";
      }

      const cut = node.querySelector<HTMLElement>("[data-cut]");
      if (cut) cut.style.left = at(budget);

      const word = node.querySelector<HTMLElement>("[data-verdict-word]");
      if (word) {
        word.textContent = fits
          ? labels.fits
          : fill(labels.missBy, { short: formatEur(diff, format) });
      }
      const sub = node.querySelector<HTMLElement>("[data-verdict-sub]");
      if (sub) {
        sub.textContent = fits
          ? fill(labels.fitsSub, { left: formatEur(diff, format) })
          : fill(labels.missSub, { advertised: formatEur(row.advertised, format) });
      }

      // The working: the structure bar, its legend and the priced lines.
      const extrasTotal = Math.max(row.result.extras, 1);
      for (const group of ALL_GROUPS) {
        const eur = row.groups.find((slice) => slice.key === group)?.eur ?? 0;
        const slice = node.querySelector<HTMLElement>(`[data-slice="${group}"]`);
        if (slice) {
          slice.hidden = eur <= 0;
          slice.style.width = `${(eur / extrasTotal) * 100}%`;
        }
        const dot = node.querySelector<HTMLElement>(`[data-dot="${group}"]`);
        if (dot) {
          dot.hidden = eur <= 0;
          const figure = dot.querySelector<HTMLElement>("[data-dot-eur]");
          if (figure) figure.textContent = formatEur(eur, format);
        }
      }

      for (const line of row.result.lines) {
        const lineNode = node.querySelector<HTMLElement>(`[data-line="${line.key}"]`);
        if (!lineNode) continue;
        lineNode.hidden = !line.applies;
        const basis = lineNode.querySelector<HTMLElement>("[data-basis]");
        if (basis) {
          basis.firstChild?.replaceWith(basisText(line, labels, locale, YEARS));
          const badge = basis.querySelector<HTMLElement>("[data-discount]");
          if (badge) badge.hidden = !line.discountApplied;
        }
        const amount = lineNode.querySelector<HTMLElement>("[data-eur]");
        if (amount) amount.textContent = formatEur(line.eur, format);
      }
    }

    /** Moves one row to the end of the list, keeping whatever state it holds.
     *  `append` on a node already in the document relocates it, which is what
     *  puts document order and reading order back in agreement — but the DOM
     *  does that by removing the node and inserting it again, which drops
     *  focus and restarts any open panel's animation. Someone typing a price
     *  into a row's own working is doing exactly the thing that re-sorts the
     *  list. `moveBefore` is the same relocation without the removal; where it
     *  does not exist yet, the old behaviour is still correct, just ruder. */
    function place(node: HTMLElement) {
      const parent = list as HTMLElement & {
        moveBefore?: (node: Node, child: Node | null) => void;
      };
      if (typeof parent.moveBefore === "function") {
        try {
          parent.moveBefore(node, null);
          return;
        } catch {
          // Not movable in this state — fall through to the plain relocation.
        }
      }
      list!.append(node);
    }

    /** THE ROWS SLIDE PAST EACH OTHER INSTEAD OF TELEPORTING. First and Last,
     *  Invert, Play: measure where every row is, move it, measure again, then
     *  hand the browser the difference to play out. Reordering is rare — the
     *  ranking only changes when the budget crosses one of four totals — so
     *  the common keystroke does nothing here at all.
     *
     *  The order of the two measurements matters. A row caught mid-flight is
     *  measured where the reader can see it, not where the layout says it
     *  belongs, and only then is its animation cancelled; an interrupted move
     *  therefore continues from where it had got to rather than snapping back
     *  and starting again. */
    function reorder(order: CalcCode[]) {
      const wanted = order
        .map((code) => nodes.get(code))
        .filter((node): node is HTMLElement => node !== undefined);
      const current = Array.from(list!.children);
      if (
        wanted.length === current.length &&
        wanted.every((node, index) => node === current[index])
      ) {
        return;
      }

      // THE LIST DOES NOT RE-SORT UNDER THE READER'S OWN HANDS. Typing a price
      // into one programme's working changes what that programme costs, which
      // can change where it ranks — so the row being edited would slide out
      // from under the caret, and on every engine without `moveBefore` it
      // would take the focus with it. While the focus is inside the list the
      // figures and the verdicts still update; only the order waits, and it is
      // applied a frame after the focus leaves.
      if (document.activeElement instanceof HTMLElement && list!.contains(document.activeElement)) {
        deferred = true;
        return;
      }
      deferred = false;

      const animate =
        ready && !reduced.matches && typeof list!.animate === "function";
      const before = animate
        ? new Map(wanted.map((node) => [node, node.getBoundingClientRect().top]))
        : undefined;
      if (before) {
        for (const node of wanted) running.get(node)?.cancel();
      }

      for (const node of wanted) place(node);
      if (!before) return;

      for (const node of wanted) {
        const was = before.get(node);
        if (was === undefined) continue;
        const dy = was - node.getBoundingClientRect().top;
        if (Math.abs(dy) < 1) continue;
        const play = node.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
          { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
        );
        running.set(node, play);
        void play.finished
          .then(() => {
            if (running.get(node) === play) running.delete(node);
          })
          .catch(() => {
            // Cancelled by the next reorder. Nothing to undo.
          });
      }
    }

    function paint() {
      const budget = parseDigits(valueField?.value ?? "");

      // AN EMPTY FIELD IS NOT A BUDGET OF ZERO. Computing one prints "short by
      // €435,000" against nothing, which is arithmetically honest and reads as
      // a broken page.
      if (budget <= 0) {
        if (verdictNode) verdictNode.textContent = labels.emptyPrompt;
        return;
      }

      const rows = rankRows(
        CALC_CODES.filter((code) => nodes.has(code)).map((code) =>
          buildRow(code, inputs[code], amountFor(code)),
        ),
        budget,
      );
      const scale = scaleOf(rows);

      for (const row of rows) paintRow(row, budget, scale);

      reorder(rows.map((row) => row.code));

      if (cutTag) {
        const share = budget / scale;
        cutTag.style.left = `${Math.max(0, Math.min(100, share * 100))}%`;
        cutTag.style.transform =
          share > 0.9 ? "translateX(-100%)" : share < 0.1 ? "none" : "translateX(-50%)";
        cutTag.textContent = fill(labels.cutTag, { value: formatEur(budget, format) });
      }

      const fits = rows.filter((row) => verdictFor(row, budget).fits);
      const misses = rows.filter((row) => !verdictFor(row, budget).fits);
      const nearest = misses[0];

      // Two sentences at every budget — see the note in the component.
      const dearest = rows[rows.length - 1];
      if (verdictNode) {
        verdictNode.textContent = !fits.length
          ? fill(labels.verdictNone, {
              budget: formatEur(budget, format),
              name: nearest ? nameOf(nearest.code) : "",
              short: formatEur(nearest ? verdictFor(nearest, budget).diff : 0, format),
            })
          : nearest
            ? `${fill(labels.verdictSome, {
                budget: formatEur(budget, format),
                n: String(fits.length),
              })} ${fill(labels.verdictNearest, {
                name: nameOf(nearest.code),
                short: formatEur(verdictFor(nearest, budget).diff, format),
              })}`
            : fill(labels.verdictAll, {
                budget: formatEur(budget, format),
                name: dearest ? nameOf(dearest.code) : "",
                total: formatEur(dearest?.real ?? 0, format),
              });
      }

      for (const button of Array.from(
        root!.querySelectorAll<HTMLButtonElement>("[data-preset]"),
      )) {
        button.setAttribute(
          "aria-pressed",
          Number(button.dataset.preset) === budget ? "true" : "false",
        );
      }
    }

    // --- The fragment ---------------------------------------------------------
    // Ordinary search parameters, not an encoded blob: a link pasted into a
    // message is read by a person before it is opened by a browser.

    /** Everything the reader has supplied, in the form the address bar shows
     *  and the enquiry route parses. One producer for both, so a link someone
     *  pastes into a message and the figures that reach our inbox cannot
     *  describe two different screens. */
    function stateParams(): string {
      const params = new URLSearchParams();
      params.set("value", String(Math.round(parseDigits(valueField?.value ?? ""))));
      for (const code of CALC_CODES) {
        const amount = amountFor(code);
        if (amount !== undefined) params.set(`${code}.amount`, String(Math.round(amount)));
      }
      return params.toString();
    }

    function writeHash() {
      // replaceState, not an assignment to location.hash: assigning pushes a
      // history entry per keystroke.
      history.replaceState(null, "", `#${stateParams()}`);
    }

    function readHash() {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const params = new URLSearchParams(raw);
      const value = params.get("value");
      if (value && valueField) valueField.value = groupDigits(parseDigits(value), locale);
      for (const code of CALC_CODES) {
        const given = params.get(`${code}.amount`);
        const field = root!.querySelector<HTMLInputElement>(
          `[data-input="amount"][data-for="${code}"]`,
        );
        if (given && field) field.value = groupDigits(parseDigits(given), locale);
      }
    }

    /** The slider and the field are two views of one number. The slider clamps
     *  rather than dragging a typed figure back into its own range: someone who
     *  types two million keeps two million and sees the handle at the end. */
    function sync(from: "field" | "slider") {
      if (!valueField || !slider) return;
      if (from === "slider") {
        valueField.value = groupDigits(Number(slider.value), locale);
      } else {
        const typed = parseDigits(valueField.value);
        slider.value = String(
          Math.min(Number(slider.max), Math.max(Number(slider.min), typed)),
        );
      }
    }

    function onInput(event: Event) {
      const target = event.target as HTMLElement | null;
      if (target?.dataset.input === "slider") sync("slider");
      else if (target?.dataset.input === "value") sync("field");
      paint();
      writeHash();
    }

    // REGROUPED ON BLUR, NOT ON EVERY KEYSTROKE. Rewriting the value while
    // someone types moves the caret to the end of the field, which turns
    // correcting a digit in the middle of a number into a fight.
    function onBlur(event: FocusEvent) {
      const target = event.target as HTMLInputElement | null;
      const kind = target?.dataset.input;
      if (target && (kind === "value" || kind === "amount")) {
        target.value = groupDigits(parseDigits(target.value), locale);
      }

      // A frame later, because focusout runs before the focus has landed: the
      // next field may well be another one inside the list, and re-sorting
      // then would take it away as it arrives.
      if (deferred) {
        if (settle !== undefined) cancelAnimationFrame(settle);
        settle = requestAnimationFrame(() => {
          settle = undefined;
          paint();
        });
      }
    }

    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-preset],[data-share],[data-calc-cta]",
      );
      if (!target || !root!.contains(target)) return;

      const preset = target.dataset.preset;
      if (preset && valueField) {
        valueField.value = groupDigits(Number(preset), locale);
        sync("field");
        paint();
        writeHash();
        return;
      }
      // WRITTEN ON THE WAY OUT, and only then. Recording the state on every
      // keystroke would put fifty writes a second into sessionStorage while
      // someone drags the slider, and would leave the last idle screen behind
      // for a reader who never followed the link. Following it is the intent.
      if (target.dataset.calcCta !== undefined) {
        const band = budgetBandFor(parseDigits(valueField?.value ?? ""));
        mergeRouteAnswers({
          calc: stateParams(),
          // Merged, never cleared: a reader who answered the route finder and
          // then opened the calculator keeps their deadline and their goal.
          ...(band ? { budget: band } : {}),
        });
        return;
      }

      if (target.dataset.share !== undefined) void onShare();
    }

    // --- Share ----------------------------------------------------------------
    const shareButton = root.querySelector<HTMLButtonElement>("[data-share]");
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function onShare() {
      if (!shareButton) return;
      writeHash();
      try {
        await navigator.clipboard.writeText(window.location.href);
        shareButton.textContent = labels.shareDone;
        timer = setTimeout(() => {
          shareButton.textContent = labels.share;
        }, 2400);
      } catch {
        // Clipboard access can be refused — an insecure origin, a permission
        // policy, a browser that never supported it. The address bar already
        // holds the state, so the honest fallback is to say nothing.
      }
    }

    const presets = root.querySelector<HTMLElement>("[data-presets]");
    if (presets) presets.hidden = false;
    if (shareButton && typeof navigator.clipboard?.writeText === "function") {
      shareButton.hidden = false;
    }

    readHash();
    sync("field");
    paint();

    root.addEventListener("input", onInput);
    root.addEventListener("change", onInput);
    root.addEventListener("focusout", onBlur);
    root.addEventListener("click", onClick);

    // One frame after the first paint, for the reason given above.
    const frame = requestAnimationFrame(() => {
      root.dataset.js = "on";
      ready = true;
    });

    return () => {
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onInput);
      root.removeEventListener("focusout", onBlur);
      root.removeEventListener("click", onClick);
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(frame);
      if (settle !== undefined) cancelAnimationFrame(settle);
      for (const play of running.values()) play.cancel();
      running.clear();
      delete root.dataset.js;
    };
  }, [labels, locale]);

  return <div ref={ref}>{children}</div>;
}
