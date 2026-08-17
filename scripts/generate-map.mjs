import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as topojson from 'topojson-client';
import * as simplify from 'topojson-simplify';
import { geoMercator, geoPath } from 'd3-geo';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const world = topojson.feature(simplify.simplify(simplify.presimplify(topo), 0.02), simplify.simplify(simplify.presimplify(topo), 0.02).objects.countries);

// ISO alpha-2 by name — only the five we cover. Everything else is base land.
const CODES = { Portugal:'pt', Greece:'gr', Malta:'mt', Cyprus:'cy', 'United Arab Emirates':'ae' };
const W = 1600, H = 620;
const projection = geoMercator();
const path = geoPath(projection);
projection.fitExtent([[150,120],[W-150,H-90]], {
  type:'FeatureCollection',
  features: world.features.filter(f => CODES[f.properties?.name]),
});

const round = d => d.replace(/-?\d+\.\d+/g, n => (Math.round(parseFloat(n)*10)/10).toString());
const inFrame = f => { const [[x0,y0],[x1,y1]] = path.bounds(f); return x1>-40 && x0<W+40 && y1>-40 && y0<H+40; };

const base = [];
const shapes = {};
const centroids = {};
for (const f of world.features) {
  const code = CODES[f.properties?.name];
  if (!code && !inFrame(f)) continue;
  const d = path(f); if (!d) continue;
  if (code) { shapes[code] = round(d); const c = path.centroid(f); centroids[code] = [Math.round(c[0]*10)/10, Math.round(c[1]*10)/10]; }
  else base.push(round(d));
}

const out = `// GENERATED — do not edit by hand.
//
// Source: world-atlas (Natural Earth 50m), simplified with topojson-simplify
// (Visvalingam, 0.02) and projected once at build time with d3-geo's Mercator,
// fitted to the five jurisdictions themselves. Coordinates are rounded to a
// tenth of a pixel: below what any screen resolves, and it cut the payload
// from 1.5MB to ~100KB.
//
// Regenerate with scripts/generate-map.mjs when a jurisdiction is added.
//
// Geometry is keyed by ISO alpha-2 so it joins to the \`country\` documents in
// Sanity by their own \`code\` field — no country name is hardcoded here.

export const MAP_VIEWBOX = { width: ${W}, height: ${H} };

/** Every other country in frame. Rendered as one flat layer, never coloured. */
export const MAP_BASE_PATHS: readonly string[] = ${JSON.stringify(base)};

/** The covered jurisdictions, by ISO alpha-2. */
export const MAP_COUNTRY_PATHS: Record<string, string> = ${JSON.stringify(shapes, null, 1)};

/** Projected centroid per jurisdiction — where a leader line starts. */
export const MAP_CENTROIDS: Record<string, [number, number]> = ${JSON.stringify(centroids, null, 1)};
`;
writeFileSync('/tmp/mi/src/components/country/JurisdictionMap/mapGeometry.ts', out);
console.log('codes:', Object.keys(shapes).join(','), 'base paths:', base.length, 'kb:', Math.round(out.length/1024));
