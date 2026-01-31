import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { calcQuantityAndAmount } from "@/src/server/entryCalc";
import { writeAuditLog } from "@/src/server/audit";

const entryPatchSchema = z
  .object({
    date: z.string().datetime().optional(),
    submitterId: z.string().uuid().optional(),
    type: z.enum(["ALCO", "PETRA"]).optional(),
    stars: z.number().int().min(1).max(3).optional(),
  })
  .refine((x) => Object.keys(x).length > 0, { message: "No changes" });

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = entryPatchSchema.parse(await req.json());

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing) {
      return jsonOk({ entry: null }, { status: 404 });
    }

    const nextType = body.type ?? existing.type;
    const nextStars = body.stars ?? existing.stars;
    const recalculated = body.type || body.stars ? await calcQuantityAndAmount(nextType as "ALCO" | "PETRA", nextStars) : null;

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        submitterId: body.submitterId,
        type: body.type,
        stars: body.stars,
        quantity: recalculated ? recalculated.quantity : undefined,
        amount: recalculated ? recalculated.amount : undefined,
        updatedById: ctx.userId,
      },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "ENTRY_UPDATE",
      targetType: "Entry",
      targetId: id,
      before: {
        date: existing.date,
        type: existing.type,
        stars: existing.stars,
        quantity: existing.quantity,
        amount: existing.amount,
        paymentStatus: existing.paymentStatus,
        submitterId: existing.submitterId,
      },
      after: {
        date: updated.date,
        type: updated.type,
        stars: updated.stars,
        quantity: updated.quantity,
        amount: updated.amount,
        paymentStatus: updated.paymentStatus,
        submitterId: updated.submitterId,
      },
    });

    return jsonOk({ entry: updated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing) {
      return jsonOk({ success: true }, { status: 404 });
    }

    await prisma.entry.delete({ where: { id } });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "ENTRY_DELETE",
      targetType: "Entry",
      targetId: id,
      before: {
        date: existing.date,
        type: existing.type,
        stars: existing.stars,
        quantity: existing.quantity,
        amount: existing.amount,
        paymentStatus: existing.paymentStatus,
        submitterId: existing.submitterId,
      },
    });

    return jsonOk({ success: true });
  } catch (e) {
    return jsonError(e);
  }
}

