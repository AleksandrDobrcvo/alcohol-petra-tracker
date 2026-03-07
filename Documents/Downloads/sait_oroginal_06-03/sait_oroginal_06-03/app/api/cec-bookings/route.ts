import { requireSession } from "@/src/server/auth";
import { prisma } from "@/src/server/prisma";
import { ApiError } from "@/src/server/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireSession();
    const body = await request.json();
    
    const { cecType, duration, reason } = body;
    
    if (!["PETRA", "ALCO"].includes(cecType)) {
      throw new ApiError(400, "INVALID_CEC_TYPE", "Невірний тип цеху");
    }
    
    if (!duration || duration < 1 || duration > 8) {
      throw new ApiError(400, "INVALID_DURATION", "Тривалість має бути від 1 до 8 годин");
    }

    const now = new Date();
    const startTime = now;
    const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);

    const booking = await prisma.cecBooking.create({
      data: {
        userId: auth.userId,
        cecType,
        duration,
        reason,
        startTime,
        endTime,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, name: true, discordId: true },
        },
      },
    });

    console.log(`[CEC] Нова заявка на ${cecType} від @${booking.user.name} на ${duration}ч`);

    return Response.json(booking);
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/cec-bookings error:", error);
    return Response.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
