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
]);

export async function POST(request: Request) {
  const blocked = await protectAdminRequest(request, "admin-uploads", {
    limit: 100,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Choose an image" }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  if (!extension || file.size > 6 * 1024 * 1024)
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP or AVIF image under 6 MB" },
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
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
