import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/lib/api-utils";
import { movePhotos } from "@/lib/photo-ops";

const schema = z.object({
  photoIds: z.array(z.string()).min(1),
  destRelDir: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { photoIds, destRelDir } = schema.parse(await request.json());
    const result = await movePhotos(photoIds, destRelDir);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
