import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";
import { ApiError } from "@/src/server/errors";

const schema = z.object({
  isBlocked: z.boolean(),
  reason: z.string().optional(),
  unbanDate: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const ROOT_ID = "1223246458975686750";
    
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    // Rule: Cannot ban Root
    if (target.discordId === ROOT_ID && body.isBlocked) {
      throw new ApiError(403, "ROOT_PROTECTION", "Ви не можете заблокувати Root-адміністратора");
    }

    // Rule: Cannot ban Leaders
    if (target.role === "LEADER" && body.isBlocked) {
      throw new ApiError(403, "LEADER_PROTECTION", "Ви не можете заблокувати Лідера");
    }

    // Rule: Only LEADER or Root can block/unblock DEPUTY or higher
    const actor = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!actor) throw new ApiError(403, "ACTOR_NOT_FOUND", "Вас не знайдено в базі");

    const isRoot = ctx.discordId === ROOT_ID;
    
    // Fetch role definitions to compare power (optional, but safer)
    const roleDefs = await (prisma as any).roleDefinition.findMany();
    const getPower = (role: string) => roleDefs.find((r: any) => r.name === role)?.power ?? 0;
    
    const actorPower = isRoot ? 999 : getPower(actor.role);
    const targetPower = getPower(target.role);

    if (targetPower >= actorPower && !isRoot && actor.role !== "LEADER") {
      throw new ApiError(403, "INSUFFICIENT_POWER", "Ви не можете змінювати статус блокування користувача з такою ж або вищою роллю");
    }

    if (body.isBlocked && !body.reason) {
      throw new ApiError(400, "REASON_REQUIRED", "Для блокування необхідно вказати причину");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { 
        isBlocked: body.isBlocked,
        banReason: body.isBlocked ? body.reason : null,
        unbanDate: body.isBlocked ? (body.unbanDate ? new Date(body.unbanDate) : null) : null,
      },
      select: { id: true, name: true, role: true, isBlocked: true, banReason: true, unbanDate: true, cardNumber: true },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "USER_BLOCK_CHANGE",
      targetType: "User",
      targetId: id,
      before: { isBlocked: target.isBlocked, banReason: (target as any).banReason },
      after: { isBlocked: updated.isBlocked, banReason: updated.banReason, unbanDate: updated.unbanDate },
    });

    return jsonOk({ user: updated });
  } catch (e) {
    return jsonError(e);
  }
}

