// Flags a value imported from a "use client" module into a module that is not
// one. Run with: node scripts/check-client-boundary.mjs
//
// WHY THIS EXISTS. Next replaces every export of a client module with a
// reference the client runtime resolves later. Import a COMPONENT that way and
// it works — that is the whole point of the boundary. Import a plain constant
// and the server does not get its value; it gets a proxy that throws when
// called. On 26 August 2026 a `data-` attribute name was imported this way and
// the header rendered an attribute literally named `function() { throw new
// Error("Attempted to call DISMISS_ATTR() from the server...") }`, followed by a
// hydration mismatch.
//
// Nothing in this project's checks could see it. The types are identical either
// way, so `tsc` is silent; eslint has no rule for it; and `next build`, which
// does catch it, cannot run in the environment the code was written in because
// next/font cannot reach Google Fonts from there. A rule with no gate is a rule
// that gets broken, so here is the gate.
//
// THE HEURISTIC, stated plainly because it is a heuristic. A PascalCase import
// is assumed to be a component, which is the legitimate way to cross this
// boundary and is not flagged. Anything else — a constant, a helper, a type
// used as a value — is. That misses a lowercase component factory and would
// complain about a PascalCase constant, and both of those are conventions this
// codebase does not use. Type-only imports are exempt: they are erased before
// any of this matters.

import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const EXTS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = await walk(SRC);
const source = new Map();
for (const file of files) source.set(file, await readFile(file, "utf8"));

const isClient = (file) =>
  /^\s*(?:\/\/[^\n]*\n|\s)*["']use client["']/.test(source.get(file) ?? "");

/** Resolve an import specifier to a file in src, or null for a package. */
function resolveSpecifier(fromFile, specifier) {
  let base;
  if (specifier.startsWith("@/")) base = join(SRC, specifier.slice(2));
  else if (specifier.startsWith(".")) base = resolve(dirname(fromFile), specifier);
  else return null;

  for (const ext of ["", ...EXTS]) {
    const candidate = base + ext;
    if (source.has(candidate)) return candidate;
  }
  return null;
}

const IMPORT = /import\s+(type\s+)?([^;]*?)\s+from\s+["']([^"']+)["']/g;
const problems = [];

for (const file of files) {
  if (isClient(file)) continue;

  for (const [, typeOnly, clause, specifier] of source.get(file).matchAll(IMPORT)) {
    if (typeOnly) continue;

    const target = resolveSpecifier(file, specifier);
    if (!target || !isClient(target)) continue;

    const named = clause.match(/\{([^}]*)\}/)?.[1] ?? "";
    const defaultName = clause.replace(/\{[^}]*\}/, "").replace(/,/g, "").trim();

    const bindings = [
      ...(defaultName ? [defaultName] : []),
      ...named
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => !part.startsWith("type "))
        .map((part) => part.split(/\s+as\s+/).pop().trim()),
    ];

    for (const binding of bindings) {
      if (/^[A-Z][A-Za-z0-9]*$/.test(binding)) continue; // a component
      problems.push(
        `${relative(ROOT, file)}: imports \`${binding}\` from the client module ` +
          `${relative(ROOT, target)}. Move the value to a module without ` +
          `"use client" — the server gets a throwing proxy, not the value.`,
      );
    }
  }
}

if (problems.length === 0) {
  console.log(`client boundary: ok (${files.length} files)`);
  process.exit(0);
}

for (const problem of problems) console.error(problem);
process.exit(1);
