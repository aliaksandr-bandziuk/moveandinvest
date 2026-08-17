import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { type NextRequest, NextResponse } from "next/server";

interface WebhookPayload {
  _type: string;
  slug?: { current?: string };
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    console.error("SANITY_REVALIDATE_SECRET is not configured");
    return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
  }

  let body: WebhookPayload | null;
  let isValidSignature: boolean | null;

  try {
    // The third argument skips the eventual-consistency wait: this handler
    // only invalidates cache tags, it never re-queries Sanity within the
    // request, so there is nothing that needs replication to catch up.
    ({ isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      secret,
      false,
    ));
  } catch (error) {
    console.error("Failed to parse revalidation webhook payload", error);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  if (isValidSignature !== true) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  if (!body?._type) {
    return NextResponse.json({ message: "Missing _type in payload" }, { status: 400 });
  }

  // Always revalidate the type-wide tag on every change, regardless of
  // references. Correctness over cleverness: a stale page is worse than an
  // occasionally over-broad revalidation. This also covers documents pulled
  // in by reference elsewhere — a `country` edit changes a chip colour on
  // every comparison table, and none of those pages carry that country's
  // own tag.
  //
  // { expire: 0 } means immediate expiration rather than the
  // stale-while-revalidate profile: a publish should make the NEXT visitor
  // see fresh content, not one more stale response.
  revalidateTag(body._type, { expire: 0 });

  if (body.slug?.current) {
    revalidateTag(`${body._type}:${body.slug.current}`, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
