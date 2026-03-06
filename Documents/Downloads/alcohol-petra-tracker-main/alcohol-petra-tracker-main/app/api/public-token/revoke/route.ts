import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const schema = z.object({
  id: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const body = schema.parse(await req.json());
    const token = await prisma.publicViewToken.findUnique({ where: { id: body.id } });
    if (!token) return jsonOk({ token: null }, { status: 404 });

    const updated = await prisma.publicViewToken.update({
      where: { id: body.id },
      data: { isRevoked: true },
      select: { id: true, isRevoked: true },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "PUBLIC_TOKEN_REVOKE",
      targetType: "PublicViewToken",
      targetId: body.id,
      before: { isRevoked: token.isRevoked },
      after: { isRevoked: updated.isRevoked },
    });

    return jsonOk({ token: updated });
  } catch (e) {
    return jsonError(e);
  }
}

