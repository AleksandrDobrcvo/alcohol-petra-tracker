import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";
import { ApiError } from "@/src/server/errors";

const workOffSchema = z.object({
  type: z.enum(["ALCO", "PETRA"]),
  amount: z.number().int().min(1),
  warningId: z.string().uuid().optional(), // Если не указан - берем первый активный
});

// Функция для отработки догана (используется и API и entries)
export async function processWarningWorkOff(
  userId: string, 
  type: "ALCO" | "PETRA", 
  amount: number,
  specificWarningId?: string
) {
  // Находим активный доган для отработки
  const warning = specificWarningId 
    ? await prisma.warning.findFirst({
        where: { 
          id: specificWarningId,
          userId,
          isWorkedOff: false,
        },
      })
    : await prisma.warning.findFirst({
        where: { 
          userId, 
          isWorkedOff: false,
        },
        orderBy: { issuedAt: "asc" }, // Отрабатываем с самого старого
      });

  if (!warning) {
    return null; // Нет активных доганов
  }

  const newWorkedOffAmount = warning.workedOffAmount + amount;
  const isFullyWorkedOff = newWorkedOffAmount >= warning.requiredAmount;

  // Обновляем доган
  const updatedWarning = await prisma.warning.update({
    where: { id: warning.id },
    data: {
      workedOffAmount: Math.min(newWorkedOffAmount, warning.requiredAmount),
      workedOffType: warning.workedOffType || type, // Сохраняем тип первой отработки
      isWorkedOff: isFullyWorkedOff,
      workedOffAt: isFullyWorkedOff ? new Date() : null,
    },
  });

  // Если доган полностью отработан - уменьшаем счетчик у пользователя
  if (isFullyWorkedOff) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newActiveWarnings = Math.max(0, user.activeWarnings - 1);
      const shouldUnfreeze = user.isFrozen && 
        user.frozenReason?.includes('3 догани') && 
        newActiveWarnings < 3;

      await prisma.user.update({
        where: { id: userId },
        data: {
          activeWarnings: newActiveWarnings,
          ...(shouldUnfreeze && {
            isFrozen: false,
            frozenReason: null,
          }),
        },
      });

      return {
        warning: updatedWarning,
        isFullyWorkedOff: true,
        newActiveWarnings,
        wasUnfrozen: shouldUnfreeze,
        remainingAmount: 0,
      };
    }
  }

  return {
    warning: updatedWarning,
    isFullyWorkedOff: false,
    remainingAmount: warning.requiredAmount - newWorkedOffAmount,
    progress: Math.min(newWorkedOffAmount, warning.requiredAmount),
  };
}

// POST - Ручная отработка догана (если нужно)
export async function POST(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    const userId = ctx2.params.id;

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
