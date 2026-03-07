import { requireSession } from "@/src/server/auth";
import { prisma } from "@/src/server/prisma";
import { ApiError } from "@/src/server/errors";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireSession();
    const { action } = await request.json();

    if (!params.id) {
      throw new ApiError(400, "MISSING_ID", "ID броні не вказано");
    }

    const booking = await prisma.cecBooking.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      throw new ApiError(404, "NOT_FOUND", "Бронь не знайдена");
    }

    // Перевірка прав
    if (!["LEADER", "DEPUTY", "SENIOR"].includes(auth.role)) {
      throw new ApiError(403, "FORBIDDEN", "Немає прав для цієї операції");
    }

    if (action === "approve") {
      const updated = await prisma.cecBooking.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          approvedBy: auth.userId,
          approvedAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
      });

      console.log(`[CEC] ${updated.user.name} схвалена на ${updated.cecType} (${updated.duration}ч)`);
      return Response.json(updated);
    }

    if (action === "reject") {
      const updated = await prisma.cecBooking.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      console.log(`[CEC] ${updated.user.name} як відхилена на ${updated.cecType}`);
      return Response.json(updated);
    }

    if (action === "cancel") {
      // Тільки користувач або адмін може скасувати
      if (booking.userId !== auth.userId && !["LEADER", "DEPUTY"].includes(auth.role)) {
        throw new ApiError(403, "FORBIDDEN", "Немає прав для скасування");
      }

      const updated = await prisma.cecBooking.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      return Response.json(updated);
    }

    throw new ApiError(400, "INVALID_ACTION", "Невідома операція");
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("PUT /api/cec-bookings/[id] error:", error);
    return Response.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
