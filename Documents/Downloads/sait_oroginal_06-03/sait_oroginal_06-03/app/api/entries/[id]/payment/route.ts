import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const paymentSchema = z.object({
  paymentStatus: z.enum(["PAID", "UNPAID"]),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = paymentSchema.parse(await req.json());

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing) {
      return jsonOk({ entry: null }, { status: 404 });
    }

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        paymentStatus: body.paymentStatus,
        paidAt: body.paymentStatus === "PAID" ? new Date() : null,
        updatedById: ctx.userId,
      },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "PAYMENT_STATUS_CHANGE",
      targetType: "Entry",
      targetId: id,
      before: { paymentStatus: existing.paymentStatus, paidAt: existing.paidAt },
      after: { paymentStatus: updated.paymentStatus, paidAt: updated.paidAt },
    });

    return jsonOk({ entry: updated });
  } catch (e) {
    return jsonError(e);
  }
}

