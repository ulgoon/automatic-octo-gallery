import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/api-utils";

const querySchema = z.object({
  tagId: z.string().optional(),
  deleted: z.enum(["only", "exclude", "all"]).default("exclude"),
  q: z.string().optional(),
  sort: z.enum(["name", "createdAt", "takenAt"]).default("name"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      tagId: searchParams.get("tagId") ?? undefined,
      deleted: searchParams.get("deleted") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    if (query.tagId) {
      const tag = await prisma.tag.findUnique({ where: { id: query.tagId } });
      if (!tag) {
        return NextResponse.json({ error: "태그를 찾을 수 없습니다" }, { status: 404 });
      }
    }

    // A secondary key on `id` keeps ordering stable across requests when the
    // primary key ties (e.g. same filename in two different folders) —
    // without it, SQLite's tie-breaking order isn't guaranteed identical
    // between two otherwise-identical queries.
    const orderBy =
      query.sort === "createdAt"
        ? [{ createdAt: "desc" as const }, { id: "asc" as const }]
        : query.sort === "takenAt"
          ? [{ takenAt: "desc" as const }, { id: "asc" as const }]
          : [{ filename: "asc" as const }, { id: "asc" as const }];

    const photos = await prisma.photo.findMany({
      where: {
        deletedAt: query.deleted === "only" ? { not: null } : query.deleted === "all" ? undefined : null,
        tags: query.tagId ? { some: { tagId: query.tagId } } : undefined,
        ...(query.q
          ? {
              OR: [
                { filename: { contains: query.q } },
                { title: { contains: query.q } },
                { caption: { contains: query.q } },
              ],
            }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
      orderBy,
    });

    return NextResponse.json({
      photos: photos.map((p) => ({
        ...p,
        tags: p.tags.map((pt) => pt.tag),
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
