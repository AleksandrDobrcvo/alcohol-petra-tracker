import { NextResponse } from "next/server";
import { ApiError } from "@/src/server/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(error: unknown) {
  // Log actual error for debugging
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  // Return detailed error message for debugging
  const message = error instanceof Error ? error.message : "Unknown internal error";
  const stack = error instanceof Error ? error.stack : undefined;
  console.error("[API Stack]", stack);
  
  return NextResponse.json(
    { ok: false, error: { code: "INTERNAL_ERROR", message } },
    { status: 500 },
  );
}

