// `playwright` is not a dependency of this project and must not become one.
//
// It is needed to RUN scripts/og.ts and never to build, serve or deploy the
// site — the same arrangement scripts/generate-map.mjs has with topojson and
// d3-geo. Carrying a browser in the dependency tree of a deployment that never
// opens one is not worth the install time on every CI run.
//
// The cost is that `npx tsc --noEmit` cannot resolve the import, which would
// otherwise fail the whole typecheck over a file that is not part of the app.
// Declaring it here makes it untyped rather than missing.
//
// If playwright is ever added to package.json, DELETE THIS FILE. A real type
// definition beats `any`, and an ambient declaration left behind would hide it.
declare module "playwright";
