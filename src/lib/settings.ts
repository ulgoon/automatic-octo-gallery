import os from "os";
import { realpath } from "fs/promises";
import { prisma } from "@/lib/db";

export class RootNotConfiguredError extends Error {
  constructor() {
    super("사진 경로가 아직 설정되지 않았습니다");
  }
}

/** Returns the configured, already realpath-resolved photo root. */
export async function getRootPath(): Promise<string> {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new RootNotConfiguredError();
  }
  return settings.rootPath;
}

export async function getSettings() {
  return prisma.settings.findUnique({ where: { id: 1 } });
}

let cachedExplorerRoot: string | null = null;

/**
 * The outer boundary the FileExplorerDialog is allowed to browse when the
 * user is picking (or re-picking) the photo root. Configurable via the
 * GALLERY_EXPLORER_ROOT env var so a deployer can restrict browsing to a
 * specific server directory; defaults to the server user's home directory.
 */
export async function getExplorerRootPath(): Promise<string> {
  if (cachedExplorerRoot) return cachedExplorerRoot;
  const base = process.env.GALLERY_EXPLORER_ROOT?.trim() || os.homedir();
  cachedExplorerRoot = await realpath(base);
  return cachedExplorerRoot;
}
