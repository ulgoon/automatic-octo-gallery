import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/api-utils";
import { addPhotoTagPairs } from "@/lib/tag-ops";

const schema = z.object({
  photoIds: z.array(z.string()).min(1),
  addTagIds: z.array(z.string()).default([]),
  removeTagIds: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const { photoIds, addTagIds, removeTagIds } = schema.parse(await request.json());

    await prisma.$transaction(async (tx) => {
      if (addTagIds.length > 0) {
        await addPhotoTagPairs(
          photoIds.flatMap((photoId) => addTagIds.map((tagId) => ({ photoId, tagId }))),
          tx
        );
      }
      if (removeTagIds.length > 0) {
        await tx.photoTag.deleteMany({
          where: { photoId: { in: photoIds }, tagId: { in: removeTagIds } },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
