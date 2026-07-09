import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, ConflictError, NotFoundError } from "@/lib/api-utils";

const patchSchema = z.object({ name: z.string().trim().min(1).max(100) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = patchSchema.parse(await request.json());

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("태그를 찾을 수 없습니다");

    const nameTaken = await prisma.tag.findUnique({ where: { name } });
    if (nameTaken && nameTaken.id !== id) {
      throw new ConflictError("이미 같은 이름의 태그가 있습니다");
    }

    const tag = await prisma.tag.update({ where: { id }, data: { name } });
    return NextResponse.json({ tag });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("태그를 찾을 수 없습니다");

    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
