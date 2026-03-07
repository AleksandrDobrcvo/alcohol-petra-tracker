import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";

const ACTIVITY_ACTIONS = [
  "REQUEST_CREATE",
  "REQUEST_DECISION",
  "ENTRY_CREATE",
  "ENTRY_CREATE_FROM_REQUEST",
  "USER_NAME_CHANGE",
  "USER_ROLE_CHANGE",
  "USER_APPROVE_CHANGE",
] as const;

export async function GET() {
  try {
    // Будь-який авторизований учасник бачить стрічку активності
    await requireSession();

    const logs = await prisma.auditLog.findMany({
      where: {
        action: { in: ACTIVITY_ACTIONS as any },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return jsonOk({ logs });
  } catch (e) {
    return jsonError(e);
  }
}

