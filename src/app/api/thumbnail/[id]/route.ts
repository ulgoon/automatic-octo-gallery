import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { errorResponse } from "@/lib/api-utils";
import { getThumbnailPath } from "@/lib/thumbnails";
import { THUMBNAIL_WIDTHS, type ThumbnailWidth } from "@/lib/photo-fs";

function parseWidth(raw: string | null): ThumbnailWidth {
  const n = Number(raw);
  return (THUMBNAIL_WIDTHS as readonly number[]).includes(n)
    ? (n as ThumbnailWidth)
    : 480;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const width = parseWidth(searchParams.get("w"));

    const cachePath = await getThumbnailPath(id, width);
    const buf = await readFile(cachePath);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
