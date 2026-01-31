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

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    // LEADER cannot be downgraded
    if (target.role === "LEADER" && body.role && body.role !== "LEADER") {
      throw new ApiError(400, "LEADER_IMMUTABLE", "LEADER role cannot be changed");
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
      after: { role: updated.role, reason: body.reason || "No reason provided" },
    });

    return jsonOk({ user: updated });
  } catch (e) {
    return jsonError(e);
  }
}

