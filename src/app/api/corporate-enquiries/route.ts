import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { corporateEnquiries } from "@/lib/db/schema";
import { sendCorporateEnquiryAlert } from "@/lib/email";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { corporateEnquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "corporate-enquiry",
    limit: 8,
    windowSeconds: 60 * 60,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const input = corporateEnquirySchema.parse(await request.json());
    await getDb().insert(corporateEnquiries).values(input);
    await sendCorporateEnquiryAlert(input).catch(console.error);
    return NextResponse.json({ received: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Check the form and try again." },
      { status: 400 },
    );
  }
}
