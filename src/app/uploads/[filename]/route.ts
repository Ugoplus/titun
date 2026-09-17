import { open, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function GET(request: Request, { params }: RouteContext<"/uploads/[filename]">) {
  const { filename } = await params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp|avif|mp4|m4v|webm|mov)$/.test(filename)) return new NextResponse("Not found", { status: 404 });
  try {
    const uploadDirectory = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
    const filePath = path.join(/* turbopackIgnore: true */ uploadDirectory, filename);
    const extension = filename.split(".").pop();
    const contentType = contentTypes[extension ?? ""] ?? "application/octet-stream";
    const range = request.headers.get("range");
    if (range && contentType.startsWith("video/")) {
      const details = await stat(filePath);
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) return new NextResponse(null, { status: 416 });
      const start = Number(match[1]);
      const end = Math.min(match[2] ? Number(match[2]) : start + 1024 * 1024 - 1, details.size - 1);
      if (start >= details.size || end < start) return new NextResponse(null, { status: 416 });
      const length = end - start + 1;
      const handle = await open(filePath, "r");
      const chunk = Buffer.alloc(length);
      try {
        await handle.read(chunk, 0, length, start);
      } finally {
        await handle.close();
      }
      return new NextResponse(chunk, {
        status: 206,
        headers: {
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": String(length),
          "Content-Range": `bytes ${start}-${end}/${details.size}`,
          "Content-Type": contentType,
        },
      });
    }
    const file = await readFile(filePath);
    return new NextResponse(file, { headers: { "Accept-Ranges": "bytes", "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
