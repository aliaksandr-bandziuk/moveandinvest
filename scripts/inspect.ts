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
// WHICH TOKEN THIS FILE USED IS PART OF THE ANSWER, so it is printed rather
// than resolved quietly. The fallback to the write token is convenient and it
// is also how this script came to report a healthy dataset for a page that was
// reading it as an anonymous visitor: the app's client takes
// SANITY_API_READ_TOKEN and nothing else, so when that variable is unset the
// two are not looking at the same dataset at all. A diagnostic that reads with
// more privilege than the thing it is diagnosing can only ever be optimistic.
const token =
  process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;
const tokenSource = process.env.SANITY_API_READ_TOKEN
  ? "SANITY_API_READ_TOKEN"
  : process.env.SANITY_API_WRITE_TOKEN
    ? "SANITY_API_WRITE_TOKEN (fallback — the app does NOT use this)"
    : "no token (anonymous, same as the app)";

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
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
  console.log(`this script reads with: ${tokenSource}`);

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
    const link = p.countryName
      ? `-> ${p.countryName}`
      : "-> REFERENCE DOES NOT RESOLVE";
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
    n: pages.filter(
      (p) => !p._id.startsWith("drafts.") && p.language === language,
    ).length,
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
    const link = p.countryName
      ? `-> ${p.countryName}`
      : "-> REFERENCE DOES NOT RESOLVE";
    console.log(
      `  ${state(p._id)}  ${p._id.padEnd(38)} ${String(p.language).padEnd(3)} /${String(p.slug ?? "?").padEnd(26)} ${link}`,
    );
  }

  if (properties.length > 0) {
    console.log(`\npublished property pages by language`);
    const propertyCounts = languages.map((language) => ({
      language,
      n: properties.filter(
        (p) => !p._id.startsWith("drafts.") && p.language === language,
      ).length,
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
    const a =
      typeof p.costAdvertisedEur === "number"
        ? String(p.costAdvertisedEur)
        : "—";
    const b =
      typeof p.costExtrasEur === "number" ? String(p.costExtrasEur) : "—";
    console.log(
      `  ${p._id.padEnd(30)} advertised ${a.padStart(8)} · extras ${b.padStart(8)}`,
    );
  }
  console.log(
    `  will render: ${costReady.length > 0 ? "YES" : "NO"} — ${costReady.length} jurisdiction(s) with both figures`,
  );

  // The exact condition the home page checks before it renders the table.
  const publishedRows = pages.filter(
    (p) =>
      !p._id.startsWith("drafts.") &&
      p.language === "en" &&
      p.slug &&
      p.countryName,
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

// --- Guides & Research: does the language switcher have anything to switch to? -
//
// WHY THIS SECTION EXISTS. An entry's siblings are not derivable from the
// documents themselves — unlike a jurisdiction page, which finds its siblings
// through the `country` it references, an entry finds them only through the
// `translation.metadata` document that lists all three. So there are three
// independent ways for the switcher to show a language greyed out, and from the
// page they look identical: the entry does not exist in that language, the
// metadata document is missing, or it exists and does not reference the entry.
//
// This prints the same GROQ the switcher's map is built from, so the answer
// comes from the dataset rather than from the rendered page — which on a dev
// server can be a cached fetch from before the entries were published.
async function inspectEntries(): Promise<void> {
  const articles = await client.fetch<
    { _id: string; language?: string; slug?: string; publishedAt?: string }[]
  >(
    `*[_type == "article"] | order(_id asc){ _id, language, "slug": slug.current, publishedAt }`,
  );

  console.log(`\nGuides & Research entries: ${articles.length}`);
  for (const doc of articles) {
    const state = doc._id.startsWith("drafts.") ? "DRAFT" : "published";
    console.log(
      `  ${doc._id.padEnd(38)} ${String(doc.language ?? "—").padEnd(3)} ${state.padEnd(9)} /blog/${doc.slug ?? "—"}`,
    );
  }

  const sets = await client.fetch<{ _id: string; refs: string[] }[]>(
    `*[_type == "translation.metadata" && "article" in schemaTypes]{ _id, "refs": translations[].value._ref }`,
  );
  console.log(`\ntranslation sets for articles: ${sets.length}`);
  for (const set of sets) {
    console.log(`  ${set._id}`);
    for (const ref of set.refs ?? []) console.log(`      -> ${ref}`);
  }

  // THE QUERY THE SWITCHER ACTUALLY USES, run verbatim — now a field on the
  // document rather than a join onto the sets printed above. A missing key here
  // is the whole answer: that entry's languages will be greyed out, and no
  // amount of looking at the page will say why.
  const resolved = await client.fetch<
    { slug?: string; language?: string; translationKey?: string | null }[]
  >(
    `*[_type == "article" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()]{
      language,
      "slug": slug.current,
      translationKey
    }`,
  );

  console.log(
    `\nwhat the switcher sees (${resolved.length} published entries)`,
  );
  for (const row of resolved) {
    console.log(
      `  ${String(row.language ?? "—").padEnd(3)} ${String(row.slug ?? "—").padEnd(48)} ${row.translationKey ?? "NO TRANSLATION KEY"}`,
    );
  }

  // A KEY NO SIBLING SHARES, which is the failure mode a plain string field
  // buys in exchange for needing no second document: one typo and a set splits
  // into two sets of one, each perfectly valid on its own and each offering the
  // reader nothing. Cheap to detect, so it is detected rather than trusted.
  const keyCounts = new Map<string, number>();
  for (const row of resolved) {
    if (!row.translationKey) continue;
    keyCounts.set(
      row.translationKey,
      (keyCounts.get(row.translationKey) ?? 0) + 1,
    );
  }
  const lonely = resolved.filter(
    (row) => row.translationKey && keyCounts.get(row.translationKey) === 1,
  );
  if (lonely.length > 0) {
    console.log(
      `\n  entries whose key no other entry shares: ${lonely.length}`,
    );
    for (const row of lonely) {
      console.log(`    ${row.language} ${row.slug} -> ${row.translationKey}`);
    }
    console.log(
      "  Legitimate for an entry that exists in one language only. Otherwise it is a",
    );
    console.log("  typo, and it splits one entry into two that cannot see each other.");
  }

  // THE SAME QUERY THROUGH THE APP'S OWN CLIENT, and this is the check the
  // section above was missing. Everything printed so far came from THIS file's
  // client: perspective "raw", and a token that falls back to the write token.
  // The app's client (src/sanity/client.ts) is configured differently — no
  // perspective, so on apiVersion 2026-08-15 it defaults to "published", and
  // only SANITY_API_READ_TOKEN. A diagnostic that answers with a different
  // client than the one serving the page can say "fine" about a page that is
  // broken, which is the one thing a diagnostic must not do.
  const appClient = createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-15",
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
  });

  console.log(
    `\nas the app sees it (read token ${process.env.SANITY_API_READ_TOKEN ? "present" : "ABSENT"}, perspective: default)`,
  );

  // THE VERDICT AT THE BOTTOM IS COMPUTED FROM THIS, not from `resolved`. It
  // used to be counted off the authenticated run above and printed "YES" under
  // a block that had just printed NO TRANSLATION SET three times — the same
  // mistake as the token fallback, in a second place: an answer about a client
  // that is not the one serving the page.
  let appEntryCount = 0;
  let appReadFailed = false;

  try {
    const asApp = await appClient.fetch<
      { slug?: string; language?: string; translationKey?: string | null }[]
    >(
      `*[_type == "article" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()]{
        language,
        "slug": slug.current,
        translationKey
      }`,
    );

    // The map the switcher is handed, built by the same rule slugMap.ts uses.
    const entries: Record<string, Record<string, string>> = {};
    const bySet = new Map<string, typeof asApp>();
    for (const doc of asApp) {
      if (!doc.slug || !doc.language || !doc.translationKey) continue;
      const group = bySet.get(doc.translationKey) ?? [];
      group.push(doc);
      bySet.set(doc.translationKey, group);
    }
    for (const group of bySet.values()) {
      const siblings: Record<string, string> = {};
      for (const doc of group) siblings[doc.language!] = doc.slug!;
      for (const doc of group) entries[doc.slug!] = siblings;
    }

    console.log(`  rows: ${asApp.length}`);
    for (const row of asApp) {
      console.log(
        `    ${String(row.language ?? "—").padEnd(3)} ${String(row.slug ?? "—").padEnd(48)} ${row.translationKey ?? "NO TRANSLATION KEY"}`,
      );
    }
    appEntryCount = Object.keys(entries).length;
    console.log(`  slugMap.entries keys: ${appEntryCount}`);
    for (const [key, siblings] of Object.entries(entries)) {
      console.log(`    ${key.padEnd(48)} -> ${JSON.stringify(siblings)}`);
    }
  } catch (error) {
    appReadFailed = true;
    console.log(
      `  QUERY FAILED: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.log(
      "  This is what the page sees too. A read that fails here is a switcher",
    );
    console.log("  with nothing to switch to, and a page that renders anyway.");
  }

  // WHAT AN ANONYMOUS READER CAN SEE OF EACH TYPE, and this is the check that
  // found the bug rather than a leftover from it.
  //
  // It began as a four-way probe over token × perspective, because the switcher
  // was dead and the app's client differed from this file's in exactly those two
  // ways. It isolated the token: anonymous found 0 of 3 translation sets under
  // both perspectives, a token found 3 of 3 under both. The obvious conclusion
  // was "add a token", and it was the wrong one — every other page on this site
  // switches language correctly without one, so the thing to fix was the entry
  // reading a document type its readers cannot see, not the readers.
  //
  // What it is kept for: the same asymmetry can appear again, because any type
  // the plugin or the Studio writes may not be public while content is. So it
  // now counts the types the SITE reads, and a zero in the anonymous row is a
  // page that is broken for everyone who is not logged into the Studio.
  console.log(`\nwhat each client can see of each type`);
  for (const useToken of [true, false]) {
    const probe = createClient({
      projectId,
      dataset,
      apiVersion: "2026-08-15",
      useCdn: false,
      perspective: "published",
      ...(useToken && token ? { token } : {}),
    });

    try {
      const seen = await probe.fetch<{
        articles: number;
        keyed: number;
        countries: number;
        sets: number;
      }>(
        `{
          "articles": count(*[_type == "article"]),
          "keyed": count(*[_type == "article" && defined(translationKey)]),
          "countries": count(*[_type == "country"]),
          "sets": count(*[_type == "translation.metadata"])
        }`,
      );
      console.log(
        `  ${(useToken ? "token" : "anonymous").padEnd(10)} article: ${String(seen.articles).padEnd(3)} with key: ${String(seen.keyed).padEnd(3)} country: ${String(seen.countries).padEnd(3)} translation.metadata: ${seen.sets} (Studio only — the site does not read it)`,
      );
    } catch (error) {
      console.log(
        `  ${(useToken ? "token" : "anonymous").padEnd(10)} FAILED: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // THE VERDICT, off the app's client and nothing else. `resolved` above is a
  // privileged read and has no business answering a question about what a
  // visitor gets.
  console.log(
    `\n  switcher will offer other languages: ${!appReadFailed && appEntryCount > 0 ? "YES" : "NO"}`,
  );
  if (appReadFailed || appEntryCount === 0) {
    console.log(
      "  The app builds slugMap.entries by grouping entries on `translationKey`. An",
    );
    console.log(
      "  entry carrying none gets no siblings, so every other language renders as plain",
    );
    console.log(
      "  text rather than a link. `npm run articles -- --write` writes the key; if the",
    );
    console.log(
      "  anonymous row above shows articles but no keys, the documents predate the",
    );
    console.log("  field and republishing them is the whole fix.");
  }
}

run()
  .then(inspectEntries)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
