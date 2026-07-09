import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type PhotoTagPair = { photoId: string; tagId: string };

/**
 * SQLite's Prisma driver adapter doesn't support `skipDuplicates` on
 * createMany, so duplicate (photoId, tagId) pairs are filtered out manually
 * before inserting — the composite primary key would otherwise reject them.
 */
export async function addPhotoTagPairs(
  pairs: PhotoTagPair[],
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  if (pairs.length === 0) return;

  const existing = await client.photoTag.findMany({
    where: { OR: pairs.map((p) => ({ photoId: p.photoId, tagId: p.tagId })) },
    select: { photoId: true, tagId: true },
  });
  const existingKeys = new Set(existing.map((e) => `${e.photoId}:${e.tagId}`));
  const toCreate = pairs.filter((p) => !existingKeys.has(`${p.photoId}:${p.tagId}`));

  if (toCreate.length > 0) {
    await client.photoTag.createMany({ data: toCreate });
  }
}
