import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminIdentity, writeAdminAudit } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { protectAdminRequest } from "@/lib/rate-limit";
import { homepageCopyKey, homepageCopySchema } from "@/lib/site-content";

export async function PUT(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-homepage-copy-write", {
    permission: "site_assets:manage",
    limit: 60,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  try {
    const input = await request.json();
    const content = homepageCopySchema.parse(input.content);
    await getDb()
      .insert(siteContent)
      .values({ key: homepageCopyKey, label: "Homepage text", content })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { content, updatedAt: new Date() },
      });

    const identity = await getAdminIdentity();
    if (identity) {
      await writeAdminAudit({
        actorUserId: identity.id,
        action: "content.homepage_copy_updated",
        targetType: "site_content",
        targetId: homepageCopyKey,
      });
    }

    revalidatePath("/");
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ZodError
            ? (error.issues[0]?.message ?? "Check the homepage text and try again")
            : error instanceof Error
              ? error.message
              : "Homepage text could not be published",
      },
      { status: 400 },
    );
  }
}
