import { mkdir, stat as fsStat } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { getRootPath } from "@/lib/settings";
import { resolveSandboxedPath } from "@/lib/fs-sandbox";
import { THUMBS_DIR_NAME, type ThumbnailWidth } from "@/lib/photo-fs";
import { NotFoundError } from "@/lib/api-utils";

export async function getThumbnailPath(
  photoId: string,
  width: ThumbnailWidth
): Promise<string> {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.deletedAt) {
    throw new NotFoundError("Photo not found");
  }

  const root = await getRootPath();
  const sourcePath = await resolveSandboxedPath(root, photo.relPath);
  const cacheDir = path.join(root, THUMBS_DIR_NAME);
  await mkdir(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, `${photoId}-${width}.webp`);

  const sourceStat = await fsStat(sourcePath);
  const cacheStat = await fsStat(cachePath).catch(() => null);

  if (!cacheStat || cacheStat.mtimeMs < sourceStat.mtimeMs) {
    try {
      await sharp(sourcePath)
        .rotate()
        .resize(width, undefined, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(cachePath);
      await prisma.photo.update({
        where: { id: photoId },
        data: { thumbStatus: "READY" },
      });
    } catch (err) {
      await prisma.photo.update({
        where: { id: photoId },
        data: { thumbStatus: "FAILED" },
      });
      throw err;
    }
  }

  return cachePath;
}

export async function getOriginalPath(photoId: string): Promise<{
  absPath: string;
  filename: string;
}> {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.deletedAt) {
    throw new NotFoundError("Photo not found");
  }
  const root = await getRootPath();
  const absPath = await resolveSandboxedPath(root, photo.relPath);
  return { absPath, filename: photo.filename };
}
