import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PathSandboxError } from "@/lib/fs-sandbox";
import { RootNotConfiguredError } from "@/lib/settings";

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request", issues: err.issues },
      { status: 400 }
    );
  }
  if (err instanceof PathSandboxError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof RootNotConfiguredError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message || "Not found" }, { status: 404 });
  }
  if (err instanceof ConflictError) {
    return NextResponse.json({ error: err.message || "Conflict" }, { status: 409 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
