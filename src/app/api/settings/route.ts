import { NextRequest, NextResponse } from "next/server";
import { stat } from "fs/promises";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/api-utils";
import { resolveSandboxedPath } from "@/lib/fs-sandbox";
import { getExplorerRootPath } from "@/lib/settings";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return NextResponse.json({ settings });
}

// relPath is relative to the explorer root (GALLERY_EXPLORER_ROOT / home dir),
// exactly the same sandbox boundary the FileExplorerDialog itself browses —
// the client never sends a freeform absolute path.
const putSchema = z.object({ relPath: z.string() });

export async function PUT(request: NextRequest) {
  try {
    const body = putSchema.parse(await request.json());
    const explorerRoot = await getExplorerRootPath();
    const rootPath = await resolveSandboxedPath(explorerRoot, body.relPath);

    const st = await stat(rootPath).catch(() => null);
    if (!st || !st.isDirectory()) {
      return NextResponse.json(
        { error: "디렉토리를 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, rootPath },
      update: { rootPath },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    return errorResponse(err);
  }
}
