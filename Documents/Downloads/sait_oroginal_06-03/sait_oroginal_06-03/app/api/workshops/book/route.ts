import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { ApiError } from "@/src/server/errors";

const bookSchema = z.object({
  workshopId: z.string().uuid(),
  note: z.string().max(100).optional(),
});

// POST /api/workshops/book - book a workshop (join queue)
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { workshopId, note } = bookSchema.parse(body);

    // Check workshop exists and is active
    const workshop = await (prisma as any).workshop.findUnique({
      where: { id: workshopId },
    });
    if (!workshop || !workshop.isActive) {
      throw new ApiError(404, "NOT_FOUND", "Workshop not found");
    }

    // Check if user already has an active/waiting booking for this workshop
    const existing = await (prisma as any).workshopBooking.findFirst({
      where: {
        workshopId,
        userId: session.userId,
        status: { in: ["ACTIVE", "WAITING"] },
      },
    });
    if (existing) {
      throw new ApiError(400, "ALREADY_BOOKED", "You already have a booking for this workshop");
    }

    // Count current active bookings
    const activeCount = await (prisma as any).workshopBooking.count({
      where: { workshopId, status: "ACTIVE" },
    });

    // Count waiting bookings for position
    const waitingCount = await (prisma as any).workshopBooking.count({
      where: { workshopId, status: "WAITING" },
    });

    const isActive = activeCount < workshop.capacity;
    const booking = await (prisma as any).workshopBooking.create({
      data: {
        workshopId,
        userId: session.userId,
        status: isActive ? "ACTIVE" : "WAITING",
        position: isActive ? 0 : waitingCount + 1,
        note: note || null,
        startedAt: isActive ? new Date() : null,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        workshop: { select: { id: true, name: true } },
      },
    });

    return jsonOk({ booking, message: isActive ? "Workshop booked!" : "Added to queue" });
  } catch (e) {
    return jsonError(e);
  }
}
