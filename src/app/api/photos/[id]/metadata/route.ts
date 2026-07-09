import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse, NotFoundError } from "@/lib/api-utils";

const patchSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  caption: z.string().max(2000).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  takenAt: z.string().nullable().optional(), // ISO date string, or null to clear
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = patchSchema.parse(await request.json());

    const existing = await prisma.photo.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("사진을 찾을 수 없습니다");
    }

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.caption !== undefined ? { caption: body.caption } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.takenAt !== undefined
          ? { takenAt: body.takenAt ? new Date(body.takenAt) : null }
          : {}),
      },
    });

    return NextResponse.json({ photo });
  } catch (err) {
    return errorResponse(err);
  }
}
