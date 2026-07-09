import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { rescan } from "@/lib/indexer";

export async function POST() {
  try {
    const summary = await rescan();
    return NextResponse.json({ summary });
  } catch (err) {
    return errorResponse(err);
  }
}
