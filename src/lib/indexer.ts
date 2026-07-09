import { readdir, stat, open } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { getRootPath } from "@/lib/settings";
import { isImageFile } from "@/lib/photo-fs";

interface WalkedFile {
  relPath: string;
  absPath: string;
}

async function walk(root: string, dir = root): Promise<WalkedFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: WalkedFile[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue; // skips .trash, .thumbs, dotfiles
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(root, absPath)));
    } else if (entry.isFile() && isImageFile(entry.name)) {
      const relPath = path.relative(root, absPath).split(path.sep).join("/");
      files.push({ relPath, absPath });
    }
  }
  return files;
}

async function partialHash(absPath: string, size: number): Promise<string> {
  const hash = crypto.createHash("sha1");
  hash.update(String(size));
  const fh = await open(absPath, "r");
  try {
    const len = Math.min(65536, size);
    const buf = Buffer.alloc(len);
    if (len > 0) {
      const { bytesRead } = await fh.read(buf, 0, len, 0);
      hash.update(buf.subarray(0, bytesRead));
    }
  } finally {
    await fh.close();
  }
  return hash.digest("hex");
}

async function readImageMeta(
  absPath: string
): Promise<{ width?: number; height?: number } | null> {
  try {
    const meta = await sharp(absPath).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return null;
  }
}

export interface RescanSummary {
  scanned: number;
  added: number;
  updated: number;
  relinked: number;
  missing: number;
}

export async function rescan(): Promise<RescanSummary> {
  const root = await getRootPath();
  const walked = await walk(root);
  const seenRelPaths = walked.map((f) => f.relPath);

  const summary: RescanSummary = {
    scanned: walked.length,
    added: 0,
    updated: 0,
    relinked: 0,
    missing: 0,
  };

  for (const file of walked) {
    const st = await stat(file.absPath);
    const existing = await prisma.photo.findUnique({
      where: { relPath: file.relPath },
    });

    if (existing) {
      if (existing.mtimeMs === st.mtimeMs && existing.size === st.size) {
        continue;
      }
      const contentHash = await partialHash(file.absPath, st.size);
      const meta = await readImageMeta(file.absPath);
      await prisma.photo.update({
        where: { id: existing.id },
        data: {
          size: st.size,
          mtimeMs: st.mtimeMs,
          contentHash,
          width: meta?.width ?? null,
          height: meta?.height ?? null,
          thumbStatus: "PENDING",
        },
      });
      summary.updated++;
      continue;
    }

    const contentHash = await partialHash(file.absPath, st.size);
    const orphan = await prisma.photo.findFirst({
      where: {
        contentHash,
        deletedAt: null,
        NOT: { relPath: { in: seenRelPaths } },
      },
    });

    if (orphan) {
      await prisma.photo.update({
        where: { id: orphan.id },
        data: {
          relPath: file.relPath,
          filename: path.basename(file.relPath),
          size: st.size,
          mtimeMs: st.mtimeMs,
        },
      });
      summary.relinked++;
      continue;
    }

    const meta = await readImageMeta(file.absPath);
    if (!meta) continue; // extension matched but not a real decodable image

    await prisma.photo.create({
      data: {
        relPath: file.relPath,
        filename: path.basename(file.relPath),
        size: st.size,
        mtimeMs: st.mtimeMs,
        contentHash,
        width: meta.width ?? null,
        height: meta.height ?? null,
        thumbStatus: "PENDING",
      },
    });
    summary.added++;
  }

  summary.missing = await prisma.photo.count({
    where: { deletedAt: null, relPath: { notIn: seenRelPaths } },
  });

  return summary;
}
