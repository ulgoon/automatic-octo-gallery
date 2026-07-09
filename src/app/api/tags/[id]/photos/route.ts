import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, NotFoundError } from "@/lib/api-utils";
import { addPhotoTagPairs } from "@/lib/tag-ops";

const schema = z.object({ photoIds: z.array(z.string()).min(1) });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;
    const { photoIds } = schema.parse(await request.json());

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundError("태그를 찾을 수 없습니다");

    await addPhotoTagPairs(photoIds.map((photoId) => ({ photoId, tagId })));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;
    const { photoIds } = schema.parse(await request.json());

    await prisma.photoTag.deleteMany({
      where: { tagId, photoId: { in: photoIds } },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
