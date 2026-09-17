import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { customOrderRequests } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { sendCustomOrderAlert } from "@/lib/email";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { customOrderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "custom-order-request",
    limit: 8,
    windowSeconds: 60 * 60,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);
  try {
    const input = customOrderSchema.parse(await request.json());
    const reference = `CUSTOM-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
    const [requestRecord] = await getDb().insert(customOrderRequests).values({
      ...input,
      company: input.company || null,
      artworkUrl: input.artworkUrl || null,
      reference,
    }).returning();
    await sendCustomOrderAlert(requestRecord).catch(console.error);
    return NextResponse.json({ reference }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Your request could not be sent" }, { status: 400 });
  }
}
