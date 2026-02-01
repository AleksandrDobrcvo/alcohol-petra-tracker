import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { ApiError } from "@/src/server/errors";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const schema = z.object({
  role: z.string().optional(),
  additionalRoles: z.array(z.string()).optional(),
  moderatesAlco: z.boolean().optional(),
  moderatesPetra: z.boolean().optional(),
  reason: z.string().optional(),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const ROOT_ID = "1223246458975686750";
    const isRoot = ctx.discordId === ROOT_ID;

    // Fetch all role definitions to handle hierarchy dynamically
    const roleDefs = await (prisma as any).roleDefinition.findMany();
    const getRolePower = (roleName: string) => roleDefs.find((r: any) => r.name === roleName)?.power ?? 0;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    const actor = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!actor) throw new ApiError(403, "ACTOR_NOT_FOUND", "Користувача не знайдено");

    const actorPower = isRoot ? 999 : getRolePower(actor.role);
    const targetPower = getRolePower(target.role);
    const newRolePower = body.role ? getRolePower(body.role) : targetPower;

    // Validation: if role is provided, it must exist in RoleDefinition
    if (body.role && !roleDefs.some((r: any) => r.name === body.role)) {
      throw new ApiError(400, "INVALID_ROLE", "Вказана роль не існує в системі");
    }

    // Rule 1: Cannot change your own role (except Root)
    if (id === ctx.userId && !isRoot) {
      throw new ApiError(403, "CANNOT_CHANGE_OWN_ROLE", "Ви не можете змінити свою роль");
    }

    // Rule 2: Cannot modify someone with same or higher power (except Root)
    if (targetPower >= actorPower && !isRoot) {
      throw new ApiError(403, "INSUFFICIENT_POWER", "Ви не можете змінювати користувача з такою ж або вищою роллю");
    }

    // Rule 3: Cannot assign role higher than or equal to your own (except Root)
    if (body.role && newRolePower >= actorPower && !isRoot) {
      throw new ApiError(403, "ROLE_TOO_HIGH", "Ви не можете призначити роль вищу або рівну вашій");
    }

    // Rule 4: Only someone with LEADER role (power >= 100) or Root can assign LEADER role
    // We assume LEADER is the name of the top role. 
    // More robust: check if newRolePower >= 100
    if (body.role === "LEADER" && actorPower < 100 && !isRoot) {
      throw new ApiError(403, "LEADER_ONLY", "Тільки Лідер може призначити цю роль");
    }

    // Rule 5: If assigning LEADER, and actor is LEADER, this is a transfer (optional logic)
    // For now, keep it simple: allow Root or Leader to promote.
    let leadershipTransfer = false;
    if (body.role === "LEADER" && actor.role === "LEADER" && id !== ctx.userId) {
      leadershipTransfer = true;
      // Note: In dynamic system, we don't automatically demote unless specified
    }

    // Validate additional roles if provided
    if (body.additionalRoles) {
      for (const addRole of body.additionalRoles) {
        if (!roleDefs.some((r: any) => r.name === addRole)) {
          throw new ApiError(400, "INVALID_ADDITIONAL_ROLE", `Роль ${addRole} не існує в системі`);
        }
      }
    }

    const updated = await (prisma as any).user.update({
      where: { id },
      data: { 
        role: body.role,
        additionalRoles: body.additionalRoles,
        moderatesAlco: body.moderatesAlco,
        moderatesPetra: body.moderatesPetra,
      },
      select: { id: true, name: true, role: true, additionalRoles: true, isBlocked: true, cardNumber: true, moderatesAlco: true, moderatesPetra: true },
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

