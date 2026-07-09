import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { errorResponse } from "@/lib/api-utils";
import { getOriginalPath } from "@/lib/thumbnails";
import { mimeTypeFor } from "@/lib/photo-fs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { absPath, filename } = await getOriginalPath(id);
    const buf = await readFile(absPath);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": mimeTypeFor(filename),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
