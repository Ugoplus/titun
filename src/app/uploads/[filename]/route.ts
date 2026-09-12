import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: RouteContext<"/uploads/[filename]">) {
  const { filename } = await params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp|avif)$/.test(filename)) return new NextResponse("Not found", { status: 404 });
  try {
    const uploadDirectory = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
    const file = await readFile(path.join(/* turbopackIgnore: true */ uploadDirectory, filename));
    const extension = filename.split(".").pop();
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    return new NextResponse(file, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
