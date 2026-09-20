import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { siteAssets } from "@/lib/db/schema";
import { protectAdminRequest } from "@/lib/rate-limit";
import { siteAssetDefaults, siteAssetKeys } from "@/lib/site-assets";

export async function PATCH(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-site-assets-write", {
    permission: "site_assets:manage",
  });
  if (blocked) return blocked;
  try {
    const input = await request.json() as { key?: string; url?: string };
    if (!input.key || !siteAssetKeys.has(input.key)) throw new Error("Unknown image slot");
    if (!input.url?.match(/^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp|avif)$/)) throw new Error("Upload a valid image first");
    const label = siteAssetDefaults.find(([key]) => key === input.key)?.[1] ?? input.key;
    const [asset] = await getDb().insert(siteAssets).values({ key: input.key, label, url: input.url })
      .onConflictDoUpdate({ target: siteAssets.key, set: { url: input.url, updatedAt: new Date() } }).returning();
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/corporate");
    revalidatePath("/events");
    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image could not be updated" }, { status: 400 });
  }
}
