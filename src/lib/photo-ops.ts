import { rename, mkdir, stat } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getRootPath } from "@/lib/settings";
import { resolveSandboxedPath } from "@/lib/fs-sandbox";
import { TRASH_DIR_NAME } from "@/lib/photo-fs";
import { NotFoundError } from "@/lib/api-utils";

export interface BulkOpResult {
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function softDeletePhotos(photoIds: string[]): Promise<BulkOpResult> {
  const root = await getRootPath();
  const result: BulkOpResult = { succeeded: [], failed: [] };

  for (const id of photoIds) {
    try {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo || photo.deletedAt) {
        result.failed.push({ id, reason: "사진을 찾을 수 없거나 이미 휴지통에 있습니다" });
        continue;
      }
      const sourceAbs = await resolveSandboxedPath(root, photo.relPath);
      const trashFilename = `${photo.id}-${path.basename(photo.relPath)}`;
      const trashRelPath = `${TRASH_DIR_NAME}/${trashFilename}`;
      const destAbs = path.join(root, TRASH_DIR_NAME, trashFilename);

      await mkdir(path.dirname(destAbs), { recursive: true });
      await rename(sourceAbs, destAbs);
      await prisma.photo.update({
        where: { id },
        data: { relPath: trashRelPath, originalRelPath: photo.relPath, deletedAt: new Date() },
      });
      result.succeeded.push(id);
    } catch (err) {
      result.failed.push({ id, reason: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return result;
}

export async function restorePhotos(photoIds: string[]): Promise<BulkOpResult> {
  const root = await getRootPath();
  const result: BulkOpResult = { succeeded: [], failed: [] };

  for (const id of photoIds) {
    try {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo || !photo.deletedAt || !photo.originalRelPath) {
        result.failed.push({ id, reason: "휴지통에 있는 사진이 아닙니다" });
        continue;
      }

      const collision = await prisma.photo.findUnique({
        where: { relPath: photo.originalRelPath },
      });
      if (collision && collision.id !== photo.id) {
        result.failed.push({ id, reason: "원래 경로에 다른 사진이 이미 존재합니다" });
        continue;
      }

      const sourceAbs = await resolveSandboxedPath(root, photo.relPath);
      const destAbs = await resolveSandboxedPath(root, photo.originalRelPath);
      if (await pathExists(destAbs)) {
        result.failed.push({ id, reason: "원래 경로에 파일이 이미 존재합니다" });
        continue;
      }

      await mkdir(path.dirname(destAbs), { recursive: true });
      await rename(sourceAbs, destAbs);
      await prisma.photo.update({
        where: { id },
        data: { relPath: photo.originalRelPath, originalRelPath: null, deletedAt: null },
      });
      result.succeeded.push(id);
    } catch (err) {
      result.failed.push({ id, reason: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return result;
}

export async function movePhotos(
  photoIds: string[],
  destRelDir: string
): Promise<BulkOpResult> {
  const root = await getRootPath();
  const result: BulkOpResult = { succeeded: [], failed: [] };

  const destAbsDir = await resolveSandboxedPath(root, destRelDir);
  const destDirStat = await stat(destAbsDir).catch(() => null);
  if (!destDirStat || !destDirStat.isDirectory()) {
    throw new NotFoundError("이동할 대상 폴더를 찾을 수 없습니다");
  }

  for (const id of photoIds) {
    try {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo || photo.deletedAt) {
        result.failed.push({ id, reason: "사진을 찾을 수 없거나 휴지통에 있습니다" });
        continue;
      }

      const destRelPath = destRelDir ? `${destRelDir}/${photo.filename}` : photo.filename;
      if (destRelPath === photo.relPath) {
        result.succeeded.push(id);
        continue;
      }

      const collision = await prisma.photo.findUnique({ where: { relPath: destRelPath } });
      const destAbs = path.join(destAbsDir, photo.filename);
      if (collision || (await pathExists(destAbs))) {
        result.failed.push({ id, reason: "이동할 위치에 같은 이름의 파일이 이미 있습니다" });
        continue;
      }

      const sourceAbs = await resolveSandboxedPath(root, photo.relPath);
      await rename(sourceAbs, destAbs);
      await prisma.photo.update({ where: { id }, data: { relPath: destRelPath } });
      result.succeeded.push(id);
    } catch (err) {
      result.failed.push({ id, reason: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return result;
}
