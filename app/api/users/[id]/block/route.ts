import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const schema = z.object({
  isBlocked: z.boolean(),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: body.isBlocked },
      select: { id: true, name: true, role: true, isBlocked: true, cardNumber: true },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "USER_BLOCK_CHANGE",
      targetType: "User",
      targetId: id,
      before: { isBlocked: target.isBlocked },
      after: { isBlocked: updated.isBlocked },
    });

    return jsonOk({ user: updated });
  } catch (e) {
    return jsonError(e);
  }
}

