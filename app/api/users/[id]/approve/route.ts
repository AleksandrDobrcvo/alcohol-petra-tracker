import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertOwner } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const schema = z.object({
  isApproved: z.boolean(),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertOwner(ctx);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: { isApproved: body.isApproved },
      select: {
        id: true,
        discordId: true,
        name: true,
        role: true,
        isBlocked: true,
        isApproved: true,
        cardNumber: true,
      },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "USER_APPROVE_CHANGE",
      targetType: "User",
      targetId: id,
      before: { isApproved: target.isApproved },
      after: { isApproved: updated.isApproved },
    });

    return jsonOk({ user: updated });
  } catch (e) {
    return jsonError(e);
  }
}
