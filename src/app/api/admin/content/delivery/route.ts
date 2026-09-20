import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminIdentity, writeAdminAudit } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { deliveryContentKey, deliveryContentSchema } from "@/lib/delivery-content";
import { protectAdminRequest } from "@/lib/rate-limit";

export async function PUT(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-delivery-content-write", {
    permission: "site_assets:manage",
    limit: 30,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  try {
    const input = await request.json();
    const content = deliveryContentSchema.parse(input.content);
    await getDb()
      .insert(siteContent)
      .values({ key: deliveryContentKey, label: "Delivery page", content })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { content, updatedAt: new Date() },
      });

    const identity = await getAdminIdentity();
    if (identity) {
      await writeAdminAudit({
        actorUserId: identity.id,
        action: "content.delivery_updated",
        targetType: "site_content",
        targetId: deliveryContentKey,
      });
    }

    revalidatePath("/shipping");
    return NextResponse.json({ content });
  } catch (error) {
    if (!(error instanceof ZodError)) {
      console.error("Delivery content update failed", error);
    }
    return NextResponse.json(
      {
        error: error instanceof ZodError
          ? (error.issues[0]?.message ?? "Check the delivery information and try again")
          : "Delivery information could not be published. Please try again.",
      },
      { status: 400 },
    );
  }
}
