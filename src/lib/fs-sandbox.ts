import { realpath } from "fs/promises";
import path from "path";

export class PathSandboxError extends Error {}

async function realpathExistingPrefix(target: string): Promise<string> {
  try {
    return await realpath(target);
  } catch {
    const parent = path.dirname(target);
    if (parent === target) {
      throw new PathSandboxError("Invalid path");
    }
    const realParent = await realpathExistingPrefix(parent);
    return path.join(realParent, path.basename(target));
  }
}

/**
 * Resolves `requestedRelPath` against `rootRealPath` (already realpath-resolved)
 * and guarantees the result stays inside the root. Throws PathSandboxError on
 * any absolute-path injection, ".." escape, or symlink escape.
 */
export async function resolveSandboxedPath(
  rootRealPath: string,
  requestedRelPath: string
): Promise<string> {
  if (path.isAbsolute(requestedRelPath)) {
    throw new PathSandboxError("Absolute paths are not allowed");
  }
  if (requestedRelPath.includes("\0")) {
    throw new PathSandboxError("Invalid path");
  }

  const candidate = path.resolve(rootRealPath, requestedRelPath);
  const rel = path.relative(rootRealPath, candidate);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new PathSandboxError("Path escapes root");
  }

  const real = await realpathExistingPrefix(candidate);
  if (real !== rootRealPath && !real.startsWith(rootRealPath + path.sep)) {
    throw new PathSandboxError("Path escapes root (symlink)");
  }

  return real;
}
