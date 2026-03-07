import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";

// GET /api/workshops - list all workshops with their bookings
export async function GET() {
  try {
    await requireSession();

    const workshops = await (prisma as any).workshop.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        bookings: {
          where: {
            status: { in: ["ACTIVE", "WAITING"] },
          },
          orderBy: [
            { status: "asc" }, // ACTIVE first
            { position: "asc" },
            { createdAt: "asc" },
          ],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                discordId: true,
                additionalRoles: true,
              },
            },
          },
        },
      },
    });

    return jsonOk({ workshops });
  } catch (e) {
    return jsonError(e);
  }
}
