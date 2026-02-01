import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        discordId: true,
        name: true,
        role: true,
        isBlocked: true,
        banReason: true,
        unbanDate: true,
        isApproved: true,
        moderatesAlco: true,
        moderatesPetra: true,
        isFrozen: true,
        frozenReason: true,
        cardNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonOk({ users });
  } catch (e) {
    return jsonError(e);
  }
}

