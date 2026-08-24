import { createClient } from "@sanity/client";

// Read-only. Prints what is actually in the dataset, so a "the page is empty"
// problem stops being a guessing game: which documents exist, which are still
// drafts, which language each carries, and — the one that actually breaks the
// home page — whether each countryPage's reference to its country resolves.
//
//   npm run inspect
//
// Uses SANITY_API_READ_TOKEN if present, otherwise the write token, otherwise
// no token at all (fine for a public dataset). Never writes.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token =
  process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  ...(token ? { token } : {}),
  // Without this a query only ever sees published documents, which is exactly
  // the state we are trying to tell apart from drafts.
  perspective: "raw",
});

interface CountryDoc {
  _id: string;
  name?: string;
  code?: string;
  status?: string;
  order?: number;
}

interface CountryPageDoc {
  _id: string;
  language?: string;
  title?: string;
  slug?: string;
  countryRef?: string;
  countryName?: string | null;
  costAdvertisedEur?: number | null;
  costExtrasEur?: number | null;
}

interface SingletonDoc {
  _id: string;
  _type: string;
  language?: string;
}

function state(id: string) {
  return id.startsWith("drafts.") ? "DRAFT    " : "published";
}

async function run() {
  console.log(`project ${projectId} · dataset ${dataset}\n`);

  const countries = await client.fetch<CountryDoc[]>(
    `*[_type == "country"] | order(order asc){ _id, name, code, status, order }`,
  );
  console.log(`country (${countries.length})`);
  for (const c of countries) {
    console.log(
      `  ${state(c._id)}  ${c._id.padEnd(28)} ${String(c.code).padEnd(3)} ${String(c.status).padEnd(8)} ${c.name ?? ""}`,
    );
  }

  const pages = await client.fetch<CountryPageDoc[]>(
    `*[_type == "countryPage"] | order(_id asc){
       _id, language, title, "slug": slug.current,
       "countryRef": country._ref,
       "countryName": *[_type == "country" && _id == ^.country._ref][0].name,
       costAdvertisedEur,
       costExtrasEur
     }`,
  );
  console.log(`\ncountryPage (${pages.length})`);
  for (const p of pages) {
    const link = p.countryName ? `-> ${p.countryName}` : "-> REFERENCE DOES NOT RESOLVE";
    console.log(
      `  ${state(p._id)}  ${p._id.padEnd(38)} ${String(p.language).padEnd(3)} /${String(p.slug ?? "?").padEnd(14)} ${link}`,
    );
  }

  // Per-language totals, because the line above is twelve rows and the thing
  // that actually matters about them is a comparison between three numbers.
  //
  // This exists because of a real morning: the English jurisdiction pages were
  // live and the Russian and Polish ones 404'd, and the listing above had said
  // so all along — twelve rows, four of them published, in a column nobody
  // reads row by row. `npm run publish` defaults to `--locale en`, so
  // publishing "the jurisdiction pages" publishes exactly one language and
  // reports success.
  const languages = ["en", "ru", "pl"];
  console.log(`\npublished jurisdiction pages by language`);
  const counts = languages.map((language) => ({
    language,
    n: pages.filter((p) => !p._id.startsWith("drafts.") && p.language === language).length,
  }));
  for (const { language, n } of counts) {
    console.log(`  ${language}  ${n}`);
  }
  const most = Math.max(...counts.map((c) => c.n));
  const behind = counts.filter((c) => c.n < most);
  if (behind.length > 0) {
    console.log(
      `  ⚠ ${behind.map((c) => c.language).join(" and ")} behind ${most} — those pages 404 and the` +
        ` comparison table shows the jurisdiction without a link.`,
    );
    console.log(`    Fix: npm run publish -- --all`);
  }

  // --- property pages -------------------------------------------------------
  // Added 24 Aug 2026 with the type itself. The same per-language summary as
  // above, for the same reason: twelve rows, and the thing that matters about
  // them is a comparison between three numbers.
  const properties = await client.fetch<CountryPageDoc[]>(
    `*[_type == "propertyPage"] | order(_id asc){
       _id, language, title, "slug": slug.current,
       "countryRef": country._ref,
       "countryName": *[_type == "country" && _id == ^.country._ref][0].name
     }`,
  );
  console.log(`\npropertyPage (${properties.length})`);
  for (const p of properties) {
    const link = p.countryName ? `-> ${p.countryName}` : "-> REFERENCE DOES NOT RESOLVE";
    console.log(
      `  ${state(p._id)}  ${p._id.padEnd(38)} ${String(p.language).padEnd(3)} /${String(p.slug ?? "?").padEnd(26)} ${link}`,
    );
  }

  if (properties.length > 0) {
    console.log(`\npublished property pages by language`);
    const propertyCounts = languages.map((language) => ({
      language,
      n: properties.filter((p) => !p._id.startsWith("drafts.") && p.language === language).length,
    }));
    for (const { language, n } of propertyCounts) {
      console.log(`  ${language}  ${n}`);
    }
    const propertyMost = Math.max(...propertyCounts.map((c) => c.n));
    const propertyBehind = propertyCounts.filter((c) => c.n < propertyMost);
    if (propertyBehind.length > 0) {
      console.log(
        `  ⚠ ${propertyBehind.map((c) => c.language).join(" and ")} behind ${propertyMost} — those pages 404.`,
      );
      console.log(`    Fix: npm run publish -- --type propertyPage --all`);
    }
  }

  const singletons = await client.fetch<SingletonDoc[]>(
    `*[_type in ["siteSettings","homePage","partnersPage"]] | order(_id asc){ _id, _type, language }`,
  );
  console.log(`\nsingletons (${singletons.length})`);
  for (const s of singletons) {
    console.log(`  ${state(s._id)}  ${s._id.padEnd(28)} ${s._type}`);
  }

  // The exact condition the cost comparison checks: both euro figures, on a
  // published page. One of the two is not enough — half a pair would draw a
  // bar that understates the real number.
  const costReady = pages.filter(
    (p) =>
      !p._id.startsWith("drafts.") &&
      typeof p.costAdvertisedEur === "number" &&
      typeof p.costExtrasEur === "number",
  );
  console.log(`\ncost comparison (section 04)`);
  for (const p of pages.filter((p) => !p._id.startsWith("drafts."))) {
    const a = typeof p.costAdvertisedEur === "number" ? String(p.costAdvertisedEur) : "—";
    const b = typeof p.costExtrasEur === "number" ? String(p.costExtrasEur) : "—";
    console.log(
      `  ${p._id.padEnd(30)} advertised ${a.padStart(8)} · extras ${b.padStart(8)}`,
    );
  }
  console.log(
    `  will render: ${costReady.length > 0 ? "YES" : "NO"} — ${costReady.length} jurisdiction(s) with both figures`,
  );

  // The exact condition the home page checks before it renders the table.
  const publishedRows = pages.filter(
    (p) => !p._id.startsWith("drafts.") && p.language === "en" && p.slug && p.countryName,
  );
  console.log(
    `\nHome page (en) will render the table: ${publishedRows.length > 0 ? "YES" : "NO"} — ${publishedRows.length} usable row(s)`,
  );
  if (publishedRows.length === 0) {
    console.log(
      "  A row is usable only when it is published, has language 'en', has a slug,",
    );
    console.log("  and its country reference resolves. Check the list above.");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
