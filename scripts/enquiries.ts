import { createClient } from "@sanity/client";

// Read-only listing of submitted enquiries (home page, section 08).
//
//   npm run enquiries          # the 20 most recent, summarised
//   npm run enquiries -- 50    # more of them
//
// Enquiries are NOT in the content dataset. They carry names, emails and
// people's personal circumstances, and the content dataset is public — a
// public Sanity dataset answers `*[_type == "enquiry"]` for anyone who knows
// the project id. They live in a separate dataset that must be created as
// PRIVATE, which is also why there is no Studio pane for them yet and why
// this script exists.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET;
const token =
  process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_ENQUIRIES_DATASET. Create a PRIVATE dataset in " +
      "sanity.io/manage (name it 'enquiries'), then add the name to .env.local.",
  );
}
if (!token) {
  throw new Error(
    "A private dataset cannot be read without a token. Set SANITY_API_READ_TOKEN.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-08-15",
  useCdn: false,
  token,
});

interface EnquiryDoc {
  _id: string;
  submittedAt?: string;
  locale?: string;
  where?: string;
  budget?: string;
  timeline?: string;
  goals?: string[];
  situation?: string;
  name?: string;
  email?: string;
  consentToShare?: boolean;
}

async function run() {
  const limitArg = Number(process.argv[2]);
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 20;

  const rows = await client.fetch<EnquiryDoc[]>(
    `*[_type == "enquiry"] | order(submittedAt desc)[0...$limit]`,
    { limit },
  );

  console.log(`project ${projectId} · dataset ${dataset} · ${rows.length} shown\n`);

  if (rows.length === 0) {
    console.log("No enquiries yet.");
    return;
  }

  for (const row of rows) {
    const date = row.submittedAt ? row.submittedAt.slice(0, 16).replace("T", " ") : "?";
    // A missing consent flag is the one thing worth shouting about: without
    // it the enquiry must not be forwarded to anyone.
    const consent = row.consentToShare ? "" : "  ⚠ NO CONSENT TO SHARE";
    console.log(`${date}  ${String(row.locale).padEnd(2)}  ${String(row.where ?? "?").padEnd(9)}  ${row.name ?? "—"} <${row.email ?? "—"}>${consent}`);
    console.log(
      `             budget ${String(row.budget ?? "—").padEnd(8)} · when ${String(row.timeline ?? "—").padEnd(10)} · ${(row.goals ?? []).join(", ") || "—"}`,
    );
    if (row.situation) {
      for (const line of row.situation.split("\n")) {
        console.log(`             | ${line}`);
      }
    }
    console.log();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
