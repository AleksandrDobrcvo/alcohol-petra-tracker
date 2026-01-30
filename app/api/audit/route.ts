import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertOwner } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";

export async function GET(req: Request) {
  try {
    const ctx = await requireSession();
    assertOwner(ctx);

    const url = new URL(req.url);
    const actorUserId = url.searchParams.get("actorUserId") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;
    const targetId = url.searchParams.get("targetId") ?? undefined;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const logs = await prisma.auditLog.findMany({
      where: {
        actorUserId,
        action: action as never,
        targetId,
        createdAt:
          from || to
            ? {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(to) : undefined,
              }
            : undefined,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 200,
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
    });

    return jsonOk({ logs });
  } catch (e) {
    return jsonError(e);
  }
}

