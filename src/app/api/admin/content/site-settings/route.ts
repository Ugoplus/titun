import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminIdentity, writeAdminAudit } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { protectAdminRequest } from "@/lib/rate-limit";
import { siteSettingsKey, siteSettingsSchema } from "@/lib/site-content";

export async function PUT(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-site-settings-write", {
    permission: "site_assets:manage",
    limit: 30,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  try {
    const input = await request.json();
    const settings = siteSettingsSchema.parse(input.settings);
    await getDb()
      .insert(siteContent)
      .values({ key: siteSettingsKey, label: "Site details", content: settings })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { content: settings, updatedAt: new Date() },
      });

    const identity = await getAdminIdentity();
    if (identity) {
      await writeAdminAudit({
        actorUserId: identity.id,
        action: "content.site_settings_updated",
        targetType: "site_content",
        targetId: siteSettingsKey,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ZodError
            ? (error.issues[0]?.message ?? "Check the site details and try again")
            : error instanceof Error
              ? error.message
              : "Site details could not be published",
      },
      { status: 400 },
    );
  }
}
