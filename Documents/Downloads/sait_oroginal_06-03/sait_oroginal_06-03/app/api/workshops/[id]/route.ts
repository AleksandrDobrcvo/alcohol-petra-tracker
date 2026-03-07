import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { ApiError } from "@/src/server/errors";

// DELETE /api/workshops/[id] - cancel/release a booking
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const bookingId = params.id;

    const booking = await (prisma as any).workshopBooking.findUnique({
      where: { id: bookingId },
      include: { workshop: true },
    });

    if (!booking) {
      throw new ApiError(404, "NOT_FOUND", "Booking not found");
    }

    // Only the user or admins can cancel
    const isAdmin =
      session.role === "LEADER" ||
      session.role === "DEPUTY" ||
      session.role === "SENIOR";

    if (booking.userId !== session.userId && !isAdmin) {
      throw new ApiError(403, "FORBIDDEN", "You can only cancel your own bookings");
    }

    const wasActive = booking.status === "ACTIVE";
    const workshopId = booking.workshopId;

    // Mark booking as cancelled or completed
    await (prisma as any).workshopBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // If the cancelled booking was active, promote next waiting user
    if (wasActive) {
      const nextWaiting = await (prisma as any).workshopBooking.findFirst({
        where: {
          workshopId,
          status: "WAITING",
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });

      if (nextWaiting) {
        await (prisma as any).workshopBooking.update({
          where: { id: nextWaiting.id },
          data: {
            status: "ACTIVE",
            position: 0,
            startedAt: new Date(),
          },
        });

        // Recalculate positions for remaining waiting bookings
        const remaining = await (prisma as any).workshopBooking.findMany({
          where: {
            workshopId,
            status: "WAITING",
          },
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        });

        for (let i = 0; i < remaining.length; i++) {
          await (prisma as any).workshopBooking.update({
            where: { id: remaining[i].id },
            data: { position: i + 1 },
          });
        }
      }
    }

    return jsonOk({ message: "Booking cancelled" });
  } catch (e) {
    return jsonError(e);
  }
}

// PATCH /api/workshops/[id] - mark booking as completed (release workshop)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const bookingId = params.id;

    const booking = await (prisma as any).workshopBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new ApiError(404, "NOT_FOUND", "Booking not found");
    }

    const isAdmin =
      session.role === "LEADER" ||
      session.role === "DEPUTY" ||
      session.role === "SENIOR";

    if (booking.userId !== session.userId && !isAdmin) {
      throw new ApiError(403, "FORBIDDEN", "Not authorized");
    }

    if (booking.status !== "ACTIVE") {
      throw new ApiError(400, "NOT_ACTIVE", "Booking is not active");
    }

    const workshopId = booking.workshopId;

    // Mark as completed
    await (prisma as any).workshopBooking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    });

    // Promote next waiting user
    const nextWaiting = await (prisma as any).workshopBooking.findFirst({
      where: {
        workshopId,
        status: "WAITING",
      },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });

    if (nextWaiting) {
      await (prisma as any).workshopBooking.update({
        where: { id: nextWaiting.id },
        data: {
          status: "ACTIVE",
          position: 0,
          startedAt: new Date(),
        },
      });

      // Recalculate positions
      const remaining = await (prisma as any).workshopBooking.findMany({
        where: {
          workshopId,
          status: "WAITING",
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });

      for (let i = 0; i < remaining.length; i++) {
        await (prisma as any).workshopBooking.update({
          where: { id: remaining[i].id },
          data: { position: i + 1 },
        });
      }
    }

    return jsonOk({ message: "Workshop released" });
  } catch (e) {
    return jsonError(e);
  }
}
