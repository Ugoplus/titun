import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const hasValidSignature = (buffer: Buffer, extension: string) => {
  if (extension === "jpg") return buffer[0] === 0xff && buffer[1] === 0xd8;
  if (extension === "png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (extension === "webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
};

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "custom-order-upload",
    limit: 10,
    windowSeconds: 60 * 60,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Choose an artwork image" }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  if (!extension || file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image under 5 MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(buffer, extension))
    return NextResponse.json({ error: "That image file is not valid" }, { status: 400 });

  const uploadDirectory = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(/* turbopackIgnore: true */ uploadDirectory, filename), buffer, { flag: "wx" });
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
