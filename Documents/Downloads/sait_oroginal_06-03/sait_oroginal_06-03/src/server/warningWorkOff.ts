import { prisma } from "@/src/server/prisma";

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
