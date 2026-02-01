import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { ApiError } from "@/src/server/errors";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const schema = z.object({
  role: z.enum(["LEADER", "DEPUTY", "SENIOR", "ALCO_STAFF", "PETRA_STAFF", "MEMBER"]).optional(),
  moderatesAlco: z.boolean().optional(),
  moderatesPetra: z.boolean().optional(),
  reason: z.string().optional(),
});

// Role hierarchy - higher number = more power
const ROLE_POWER: Record<string, number> = {
  LEADER: 100,
  DEPUTY: 80,
  SENIOR: 60,
  ALCO_STAFF: 40,
  PETRA_STAFF: 40,
  MEMBER: 20,
};

function getRolePower(role: string): number {
  return ROLE_POWER[role] ?? 0;
}

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    const actor = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!actor) throw new ApiError(403, "ACTOR_NOT_FOUND", "Користувача не знайдено");

    const actorPower = getRolePower(actor.role);
    const targetPower = getRolePower(target.role);
    const newRolePower = body.role ? getRolePower(body.role) : targetPower;

    // Rule 1: Cannot change your own role (except LEADER transferring leadership)
    if (id === ctx.userId && actor.role !== "LEADER") {
      throw new ApiError(403, "CANNOT_CHANGE_OWN_ROLE", "Ви не можете змінити свою роль");
    }

    // Rule 2: Cannot modify someone with same or higher power (except LEADER)
    if (targetPower >= actorPower && actor.role !== "LEADER") {
      throw new ApiError(403, "INSUFFICIENT_POWER", "Ви не можете змінювати користувача з такою ж або вищою роллю");
    }

    // Rule 3: Cannot assign role higher than or equal to your own (except LEADER)
    if (body.role && newRolePower >= actorPower && actor.role !== "LEADER") {
      throw new ApiError(403, "ROLE_TOO_HIGH", "Ви не можете призначити роль вищу або рівну вашій");
    }

    // Rule 4: Only LEADER can assign LEADER role (transfer leadership)
    if (body.role === "LEADER" && actor.role !== "LEADER") {
      throw new ApiError(403, "LEADER_ONLY", "Тільки Лідер може передати лідерство");
    }

    // Rule 5: If transferring leadership, demote current leader
    let leadershipTransfer = false;
    if (body.role === "LEADER" && actor.role === "LEADER" && id !== ctx.userId) {
      leadershipTransfer = true;
      // Demote current leader to DEPUTY
      await prisma.user.update({
        where: { id: ctx.userId },
        data: { role: "DEPUTY" },
      });
      await writeAuditLog({
        actorUserId: ctx.userId,
        action: "USER_ROLE_CHANGE",
        targetType: "User",
        targetId: ctx.userId,
        before: { role: "LEADER" },
        after: { role: "DEPUTY", reason: "Передача лідерства" },
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { 
        role: body.role,
        moderatesAlco: body.moderatesAlco,
        moderatesPetra: body.moderatesPetra,
      },
      select: { id: true, name: true, role: true, isBlocked: true, cardNumber: true, moderatesAlco: true, moderatesPetra: true },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "USER_ROLE_CHANGE",
      targetType: "User",
      targetId: id,
      before: { role: target.role },
      after: { role: updated.role, reason: body.reason || (leadershipTransfer ? "Передача лідерства" : "Без причини") },
    });

    return jsonOk({ user: updated, leadershipTransfer });
  } catch (e) {
    return jsonError(e);
  }
}

