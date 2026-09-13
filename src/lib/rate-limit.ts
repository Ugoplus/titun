import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimitEvents } from "@/lib/db/schema";

export type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowSeconds: number;
  identity?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  retryAfter: number;
};

export function getClientIp(requestHeaders: Headers) {
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp)) return realIp;

  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const proxyAddress = forwarded?.at(-1);
  if (proxyAddress && isIP(proxyAddress)) return proxyAddress;

  return "unknown";
}

function hashBucket(scope: string, subject: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for rate limiting");
  return createHmac("sha256", secret)
    .update(`${scope}:${subject}`)
    .digest("hex");
}

export async function consumeRateLimit(
  source: Pick<Request, "headers"> | Headers,
  { scope, limit, windowSeconds, identity }: RateLimitPolicy,
): Promise<RateLimitResult> {
  const requestHeaders = "headers" in source ? source.headers : source;
  const subject = identity
    ? `identity:${identity.toLowerCase()}`
    : `ip:${getClientIp(requestHeaders)}`;
  const bucket = hashBucket(scope, subject);
  const cutoff = new Date(Date.now() - windowSeconds * 1000);
  const allowed = await getDb().transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${bucket}))`);
    await tx
      .delete(rateLimitEvents)
      .where(
        and(
          eq(rateLimitEvents.bucket, bucket),
          lt(rateLimitEvents.occurredAt, cutoff),
        ),
      );
    const [usage] = await tx
      .select({ value: count() })
      .from(rateLimitEvents)
      .where(
        and(
          eq(rateLimitEvents.bucket, bucket),
          gte(rateLimitEvents.occurredAt, cutoff),
        ),
      );
    if (Number(usage?.value ?? 0) >= limit) return false;
    await tx.insert(rateLimitEvents).values({ bucket });
    return true;
  });

  return { allowed, limit, retryAfter: windowSeconds };
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    { error: "Too many requests. Please wait and try again." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(result.retryAfter),
      },
    },
  );
}

export async function protectAdminRequest(
  request: Request,
  scope: string,
  { limit = 1000, windowSeconds = 300 } = {},
) {
  const identity = await getAdminIdentity();
  if (!identity)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await consumeRateLimit(request.headers, {
    scope,
    limit,
    windowSeconds,
    identity,
  });
  return result.allowed ? null : rateLimitResponse(result);
}

export async function cleanupRateLimits() {
  const retentionCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await getDb()
    .delete(rateLimitEvents)
    .where(lt(rateLimitEvents.occurredAt, retentionCutoff));
}
