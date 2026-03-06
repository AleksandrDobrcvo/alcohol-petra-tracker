import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";
import { canManageRequests } from "@/src/server/rbac";
import { ApiError } from "@/src/server/errors";

export async function DELETE(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    
    // Check if user has permission to manage requests
    const hasPermission = await canManageRequests(ctx);
    if (!hasPermission) {
      throw new ApiError(403, "FORBIDDEN", "Insufficient permissions to delete requests");
    }

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