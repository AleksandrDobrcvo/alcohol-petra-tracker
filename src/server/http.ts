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

  return NextResponse.json(
    { ok: false, error: { code: "INTERNAL_ERROR", message: "Internal error" } },
    { status: 500 },
  );
}

