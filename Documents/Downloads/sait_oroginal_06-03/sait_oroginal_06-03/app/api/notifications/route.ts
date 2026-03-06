import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    const ctx = await requireSession();

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

    const items = requests.map((r) => ({
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

    return jsonOk({ items });
  } catch (e) {
    return jsonError(e);
  }
}

