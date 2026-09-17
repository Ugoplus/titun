import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { protectAdminRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["video/mp4", "mp4"],
  ["video/x-m4v", "m4v"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

export async function POST(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-uploads", {
    limit: 100,
    windowSeconds: 3600,
    anyOf: ["products:manage", "events:manage", "site_assets:manage"],
  });
  if (blocked) return blocked;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Choose an image or video" }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  const isVideo = file.type.startsWith("video/");
  const sizeLimit = isVideo ? 80 * 1024 * 1024 : 6 * 1024 * 1024;
  if (!extension || file.size > sizeLimit)
    return NextResponse.json(
      {
        error: isVideo
          ? "Use an MP4, M4V, WebM or MOV video under 80 MB"
          : "Use a JPG, PNG, WebP or AVIF image under 6 MB",
      },
      { status: 400 },
    );
  const uploadDirectory =
    process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(
    path.join(/* turbopackIgnore: true */ uploadDirectory, filename),
    Buffer.from(await file.arrayBuffer()),
    { flag: "wx" },
  );
  return NextResponse.json(
    { url: `/uploads/${filename}`, mediaType: isVideo ? "video" : "image" },
    { status: 201 },
  );
}
