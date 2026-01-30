import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertOwner } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { generatePublicToken, hashPublicToken } from "@/src/server/publicToken";
import { writeAuditLog } from "@/src/server/audit";

export async function GET() {
  try {
    const ctx = await requireSession();
    assertOwner(ctx);

    const tokens = await prisma.publicViewToken.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: { id: true, isRevoked: true, createdAt: true, updatedAt: true, createdById: true },
    });

    return jsonOk({ tokens });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST() {
  try {
    const ctx = await requireSession();
    assertOwner(ctx);

    const rawToken = generatePublicToken();
    const tokenHash = hashPublicToken(rawToken);

    const created = await prisma.publicViewToken.create({
      data: { tokenHash, createdById: ctx.userId, isRevoked: false },
      select: { id: true },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "PUBLIC_TOKEN_CREATE",
      targetType: "PublicViewToken",
      targetId: created.id,
      after: { id: created.id },
    });

    // Return raw token only once
    return jsonOk({ id: created.id, token: rawToken }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

