import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ConflictError, NotFoundError } from "@/lib/api-utils";

const schema = z.object({
  tagAId: z.string(),
  tagBId: z.string(),
  newName: z.string().trim().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const { tagAId, tagBId, newName } = schema.parse(await request.json());

    if (tagAId === tagBId) {
      throw new ConflictError("서로 다른 두 태그를 선택해야 합니다");
    }

    const [tagA, tagB, nameTaken] = await Promise.all([
      prisma.tag.findUnique({ where: { id: tagAId } }),
      prisma.tag.findUnique({ where: { id: tagBId } }),
      prisma.tag.findUnique({ where: { name: newName } }),
    ]);
    if (!tagA || !tagB) throw new NotFoundError("태그를 찾을 수 없습니다");
    if (nameTaken) throw new ConflictError("이미 같은 이름의 태그가 있습니다");

    const merged = await prisma.$transaction(async (tx) => {
      const newTag = await tx.tag.create({
        data: {
          name: newName,
          mergedFromIds: JSON.stringify([tagA.id, tagB.id]),
        },
      });

      const photoTags = await tx.photoTag.findMany({
        where: { tagId: { in: [tagA.id, tagB.id] } },
        select: { photoId: true },
        distinct: ["photoId"],
      });

      if (photoTags.length > 0) {
        await tx.photoTag.createMany({
          data: photoTags.map((pt) => ({ photoId: pt.photoId, tagId: newTag.id })),
        });
      }

      return newTag;
    });

    return NextResponse.json({ tag: merged }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
