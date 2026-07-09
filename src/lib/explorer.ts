import { readdir } from "fs/promises";
import { resolveSandboxedPath } from "@/lib/fs-sandbox";
import { EXCLUDED_DIR_NAMES } from "@/lib/photo-fs";

export interface ExplorerEntry {
  name: string;
  relPath: string;
  isDirectory: boolean;
}

export async function listDirectory(
  rootRealPath: string,
  relPath: string,
  { showFiles = false }: { showFiles?: boolean } = {}
): Promise<ExplorerEntry[]> {
  const absDir = await resolveSandboxedPath(rootRealPath, relPath);
  const entries = await readdir(absDir, { withFileTypes: true });

  const result: ExplorerEntry[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory() && EXCLUDED_DIR_NAMES.has(entry.name)) continue;
    if (!entry.isDirectory() && !showFiles) continue;
    result.push({
      name: entry.name,
      relPath: relPath ? `${relPath}/${entry.name}` : entry.name,
      isDirectory: entry.isDirectory(),
    });
  }

  result.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}
