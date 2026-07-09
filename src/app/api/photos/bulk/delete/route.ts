import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/lib/api-utils";
import { softDeletePhotos } from "@/lib/photo-ops";

const schema = z.object({ photoIds: z.array(z.string()).min(1) });

export async function POST(request: NextRequest) {
  try {
    const { photoIds } = schema.parse(await request.json());
    const result = await softDeletePhotos(photoIds);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
