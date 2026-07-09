import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, NotFoundError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundError("태그를 찾을 수 없습니다");

    const photos = await prisma.photo.findMany({
      where: { deletedAt: null, tags: { some: { tagId } } },
      orderBy: [{ filename: "asc" }, { id: "asc" }],
      select: {
        id: true,
        filename: true,
        title: true,
        caption: true,
        takenAt: true,
        location: true,
        width: true,
        height: true,
      },
    });

    return NextResponse.json({ tag, photos });
  } catch (err) {
    return errorResponse(err);
  }
}
