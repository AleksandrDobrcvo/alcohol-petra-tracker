import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertCanModerateOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { ApiError } from "@/src/server/errors";
import { writeAuditLog } from "@/src/server/audit";
import { calcQuantityAndAmount } from "@/src/server/entryCalc";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(500).optional(),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const existing = await prisma.entryRequest.findUnique({ where: { id } });
    if (!existing) return jsonOk({ request: null }, { status: 404 });

    if (existing.status !== "PENDING") {
      throw new ApiError(400, "ALREADY_DECIDED", "Цю заявку вже опрацьовано");
    }

    assertCanModerateOrThrow(ctx, existing.type as "ALCO" | "PETRA");

    if (body.status === "REJECTED") {
      const updated = await prisma.entryRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          decisionNote: body.note ?? null,
          decidedAt: new Date(),
          decidedById: ctx.userId,
        },
        include: {
          submitter: { select: { id: true, name: true } },
          decidedBy: { select: { id: true, name: true } },
        },
      });

      await writeAuditLog({
        actorUserId: ctx.userId,
        action: "REQUEST_DECISION",
        targetType: "EntryRequest",
        targetId: id,
        before: { status: existing.status },
        after: { status: updated.status, decisionNote: updated.decisionNote },
      });

      return jsonOk({ request: updated });
    }

    const result = await prisma.$transaction(async (tx) => {
      const starLevels = [
        { stars: 1, qty: (existing as any).stars1Qty },
        { stars: 2, qty: (existing as any).stars2Qty },
        { stars: 3, qty: (existing as any).stars3Qty },
      ];

      const entries = [];
      for (const { stars, qty } of starLevels) {
        if (qty <= 0) continue;

        // Calculate amount for this specific entry
        const { amount } = await calcQuantityAndAmount(existing.type as "ALCO" | "PETRA", stars, qty);

        const entry = await tx.entry.create({
          data: {
            date: existing.date,
            submitterId: existing.submitterId,
            type: existing.type,
            stars,
            quantity: qty,
            amount,
            paymentStatus: "PAID",
            createdById: ctx.userId,
            requestId: id,
          },
        });
        entries.push(entry);
      }

      const updated = await tx.entryRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          decisionNote: body.note ?? null,
          decidedAt: new Date(),
          decidedById: ctx.userId,
        },
        include: {
          submitter: { select: { id: true, name: true } },
          decidedBy: { select: { id: true, name: true } },
        },
      });

      return { entries, request: updated };
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "REQUEST_DECISION",
      targetType: "EntryRequest",
      targetId: id,
      before: { status: existing.status },
      after: { status: result.request.status, entriesCount: result.entries.length },
    });

    for (const entry of result.entries) {
      await writeAuditLog({
        actorUserId: ctx.userId,
        action: "ENTRY_CREATE_FROM_REQUEST",
        targetType: "Entry",
        targetId: entry.id,
        after: {
          requestId: id,
          submitterId: entry.submitterId,
          type: entry.type,
          stars: entry.stars,
          quantity: entry.quantity,
          amount: entry.amount,
        },
      });
    }

    return jsonOk({ request: result.request, entries: result.entries });
  } catch (e) {
    return jsonError(e);
  }
}
