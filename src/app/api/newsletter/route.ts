import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "newsletter",
    limit: 10,
    windowSeconds: 60 * 60,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const input = newsletterSchema.parse(await request.json());
    await getDb()
      .insert(newsletterSubscribers)
      .values(input)
      .onConflictDoNothing({ target: newsletterSubscribers.email });
    return NextResponse.json({ subscribed: true });
  } catch {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
}
