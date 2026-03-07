import { requireSession } from "@/src/server/auth";
import { prisma } from "@/src/server/prisma";
import { ApiError } from "@/src/server/errors";

// Отримати активні цехи (для головної)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const view = url.searchParams.get("view");

    if (view === "current") {
      // Активні цехи
      const current = await prisma.cecBooking.findMany({
        where: {
          status: { in: ["APPROVED", "ACTIVE"] },
          endTime: { gt: new Date() },
        },
        include: {
          user: {
            select: { id: true, name: true, discordId: true },
          },
          approver: {
            select: { id: true, name: true },
          },
        },
        orderBy: { startTime: "asc" },
      });

      return Response.json({ data: current });
    }

    if (view === "pending") {
      // Чекають схвалення (для адміна)
      const auth = await requireSession();
      
      // Перевірка чи юзер - лідер/модератор
      if (!["LEADER", "DEPUTY", "SENIOR"].includes(auth.role)) {
        throw new ApiError(403, "FORBIDDEN", "Немає доступу");
      }

      const pending = await prisma.cecBooking.findMany({
        where: { status: "PENDING" },
        include: {
          user: {
            select: { id: true, name: true, discordId: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return Response.json({ data: pending });
    }

    if (view === "queue") {
      // Черга для кожного цеху
      const queues = await Promise.all(["PETRA", "ALCO"].map(async (cecType) => {
        const bookings = await prisma.cecBooking.findMany({
          where: {
            cecType,
            status: { in: ["PENDING", "APPROVED"] },
            endTime: { gt: new Date() },
          },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        return { cecType, count: bookings.length, bookings };
      }));

      return Response.json({ data: queues });
    }

    // Всі броні (для адміна)
    const auth = await requireSession();
    const all = await prisma.cecBooking.findMany({
      include: {
        user: {
          select: { id: true, name: true, discordId: true },
        },
        approver: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return Response.json({ data: all });
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/cec-bookings error:", error);
    return Response.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
