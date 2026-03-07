import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    const ctx = await requireSession();

    const audit = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "USER_ROLE_CHANGE",
            "USER_NAME_CHANGE",
            "USER_BLOCK_CHANGE",
            "USER_APPROVE_CHANGE",
            "USER_CARD_CHANGE",
            "USER_FREEZE_CHANGE",
          ],
        },
        OR: [
          {
            targetType: "User",
            targetId: ctx.userId,
          },
          {
            actorUserId: ctx.userId,
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        before: true,
        after: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Latest decisions about this user's own requests
    const requests = await prisma.entryRequest.findMany({
      where: {
        submitterId: ctx.userId,
        status: { not: "PENDING" },
        decidedAt: { not: null },
      },
      orderBy: { decidedAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        totalAmount: true,
        status: true,
        decisionNote: true,
        decidedAt: true,
        decidedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const requestItems = requests.map((r) => ({
      id: r.id,
      kind: "REQUEST_DECISION" as const,
      type: r.type,
      status: r.status,
      totalAmount: r.totalAmount,
      decidedAt: r.decidedAt,
      decisionNote: r.decisionNote,
      decidedBy: r.decidedBy
        ? {
            id: r.decidedBy.id,
            name: r.decidedBy.name,
            role: r.decidedBy.role,
          }
        : null,
    }));

    const auditItems = audit.map((a) => ({
      id: a.id,
      kind: "PROFILE_CHANGE" as const,
      action: a.action,
      createdAt: a.createdAt,
      actor: a.actor,
      before: a.before,
      after: a.after,
    }));

    const items = [...auditItems, ...requestItems]
      .sort((x: any, y: any) => {
        const tx = new Date((x.createdAt ?? x.decidedAt) as any).getTime();
        const ty = new Date((y.createdAt ?? y.decidedAt) as any).getTime();
        return ty - tx;
      })
      .slice(0, 15);

    return jsonOk({ items });
  } catch (e) {
    return jsonError(e);
  }
}

