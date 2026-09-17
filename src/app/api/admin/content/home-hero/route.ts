import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getDb } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { getAdminIdentity, writeAdminAudit } from "@/lib/auth";
import { protectAdminRequest } from "@/lib/rate-limit";
import {
  homepageHeroKey,
  homepageHeroSlidesSchema,
} from "@/lib/site-content";

export async function PUT(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-homepage-content-write", {
    permission: "site_assets:manage",
    limit: 60,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  try {
    const input = await request.json();
    const slides = homepageHeroSlidesSchema.parse(input.slides);
    await getDb()
      .insert(siteContent)
      .values({
        key: homepageHeroKey,
        label: "Homepage slideshow",
        content: slides,
      })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { content: slides, updatedAt: new Date() },
      });

    const identity = await getAdminIdentity();
    if (identity) {
      await writeAdminAudit({
        actorUserId: identity.id,
        action: "content.homepage_slideshow_updated",
        targetType: "site_content",
        targetId: homepageHeroKey,
        metadata: { slideCount: slides.length },
      });
    }

    revalidatePath("/");
    return NextResponse.json({ slides });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ZodError
            ? (error.issues[0]?.message ?? "Check each slide and try again")
            : error instanceof Error
            ? error.message
            : "Homepage content could not be saved",
      },
      { status: 400 },
    );
  }
}
