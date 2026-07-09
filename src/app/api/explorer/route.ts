import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { getExplorerRootPath, getRootPath } from "@/lib/settings";
import { listDirectory } from "@/lib/explorer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relPath = searchParams.get("path") ?? "";
    const showFiles = searchParams.get("showFiles") === "1";
    // "explorer" browses the outer boundary used to pick the photo root
    // (Settings page); "photos" browses within the already-configured
    // photo root (used to pick a move destination for bulk actions).
    const scope = searchParams.get("scope") === "photos" ? "photos" : "explorer";

    const base = scope === "photos" ? await getRootPath() : await getExplorerRootPath();
    const entries = await listDirectory(base, relPath, { showFiles });

    return NextResponse.json({ path: relPath, entries });
  } catch (err) {
    return errorResponse(err);
  }
}
