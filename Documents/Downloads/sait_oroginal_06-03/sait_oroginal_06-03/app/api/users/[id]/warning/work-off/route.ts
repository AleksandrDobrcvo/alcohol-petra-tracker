import { z } from "zod";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";
import { ApiError } from "@/src/server/errors";
import { processWarningWorkOff } from "@/src/server/warningWorkOff";

const workOffSchema = z.object({
  type: z.enum(["ALCO", "PETRA"]),
  amount: z.number().int().min(1),
  warningId: z.string().uuid().optional(), // Если не указан - берем первый активный
});

// POST - Ручная отработка догана (если нужно)
export async function POST(req: Request, ctx2: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireSession();
    const { id: userId } = await ctx2.params;

    // Только сам пользователь или админ
    if (ctx.userId !== userId) {
      throw new ApiError(403, "FORBIDDEN", "Ви можете відпрацьовувати тільки свої догани");
    }

    const body = workOffSchema.parse(await req.json());

    const result = await processWarningWorkOff(
      userId, 
      body.type, 
      body.amount, 
      body.warningId
    );

    if (!result) {
      throw new ApiError(404, "NO_ACTIVE_WARNING", "Немає активних доганів для відпрацювання");
    }

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "WARNING_WORK_OFF",
      targetType: "Warning",
      targetId: result.warning.id,
      before: { 
        workedOffAmount: result.warning.workedOffAmount - body.amount,
      },
      after: { 
        workedOffAmount: result.warning.workedOffAmount,
        isFullyWorkedOff: result.isFullyWorkedOff,
        type: body.type,
        amount: body.amount,
      },
    });

    return jsonOk({ 
      ...result,
      message: result.isFullyWorkedOff 
        ? "Доган успішно відпрацьовано!"
        : `Зараховано ${body.amount} ${body.type}. Залишилось: ${result.remainingAmount}`,
    });
  } catch (e) {
    return jsonError(e);
  }
}
