import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

export async function DELETE(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const existing = await prisma.entryRequest.findUnique({ where: { id } });
    if (!existing) {
      return jsonOk({ success: true }, { status: 404 });
    }

    await prisma.entryRequest.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "REQUEST_DELETE",
      targetType: "EntryRequest",
      targetId: id,
      before: {
        status: existing.status,
        nickname: existing.nickname,
        type: existing.type,
        totalAmount: (existing as any).totalAmount,
      },
    });

    return jsonOk({ success: true });
  } catch (e) {
    return jsonError(e);
  }
}
