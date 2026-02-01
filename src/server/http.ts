import { NextResponse } from "next/server";
import { ApiError } from "@/src/server/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  // Log actual error for debugging
  console.error("[API Error]", error);

  const message = error instanceof Error ? error.message : "Internal error";
  return NextResponse.json(
    { ok: false, error: { code: "INTERNAL_ERROR", message } },
    { status: 500 },
  );
}

