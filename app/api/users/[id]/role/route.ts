import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertOwner } from "@/src/server/rbac";
import { ApiError } from "@/src/server/errors";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";

const schema = z.object({
  role: z.enum(["OWNER", "ADMIN", "VIEWER"]),
});

export async function PATCH(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    assertOwner(ctx);

    const id = ctx2.params.id;
    const body = schema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return jsonOk({ user: null }, { status: 404 });

    // OWNER cannot be downgraded
    if (target.role === "OWNER" && body.role !== "OWNER") {
      throw new ApiError(400, "OWNER_IMMUTABLE", "OWNER role cannot be changed");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: { id: true, name: true, role: true, isBlocked: true, cardNumber: true },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "USER_ROLE_CHANGE",
      targetType: "User",
      targetId: id,
      before: { role: target.role },
      after: { role: updated.role },
    });

    return jsonOk({ user: updated });
  } catch (e) {
    return jsonError(e);
  }
}

