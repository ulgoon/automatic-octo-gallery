import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ConflictError } from "@/lib/api-utils";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });
  return NextResponse.json({
    tags: tags.map((t) => ({ ...t, photoCount: t._count.photos, _count: undefined })),
  });
}

const postSchema = z.object({ name: z.string().trim().min(1).max(100) });

export async function POST(request: NextRequest) {
  try {
    const { name } = postSchema.parse(await request.json());

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictError("이미 같은 이름의 태그가 있습니다");
    }

    const tag = await prisma.tag.create({ data: { name } });
    return NextResponse.json({ tag }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
