import { writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";

const FLAG_PATH = join(process.cwd(), ".maintenance");

export async function GET() {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);
    const isOn = existsSync(FLAG_PATH);
    return jsonOk({ maintenance: isOn });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const body = (await req.json()) as { enabled?: boolean };
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "Missing or invalid 'enabled' flag" } },
        { status: 400 },
      );
    }

    if (enabled) {
      writeFileSync(FLAG_PATH, "1");
    } else {
      if (existsSync(FLAG_PATH)) unlinkSync(FLAG_PATH);
    }

    return jsonOk({ maintenance: enabled });
  } catch (e) {
    return jsonError(e);
  }
}
