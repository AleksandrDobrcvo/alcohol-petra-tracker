import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { writeAuditLog } from "@/src/server/audit";
import { canManageUsers } from "@/src/server/rbac";
import { ApiError } from "@/src/server/errors";
import { notifyWarningIssued, notifyUserFrozen, notifyUserUnfrozen } from "@/src/server/discord";

const issueWarningSchema = z.object({
  reason: z.string().min(1, "Причина обов'язкова"),
  requiredAmount: z.number().int().min(1, "Кількість для відпрацювання має бути більше 0"),
});

const removeWarningSchema = z.object({
  warningId: z.string().uuid(),
});

// GET - Получить все доганы пользователя
export async function GET(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    const userId = ctx2.params.id;

    // Пользователь может видеть свои доганы, админы - чужие
    const isSelf = ctx.userId === userId;
    if (!isSelf) {
      const hasPermission = await canManageUsers(ctx);
      if (!hasPermission) {
        throw new ApiError(403, "FORBIDDEN", "Недостатньо прав для перегляду доганів");
      }
    }

    const warnings = await prisma.warning.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      include: {
        issuedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { activeWarnings: true, isFrozen: true, frozenReason: true },
    });

    return jsonOk({ 
      warnings, 
      activeWarnings: user?.activeWarnings ?? 0,
      isFrozen: user?.isFrozen ?? false,
      frozenReason: user?.frozenReason,
    });
  } catch (e) {
    return jsonError(e);
  }
}

// POST - Выдать доган
export async function POST(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    const userId = ctx2.params.id;
    
    const hasPermission = await canManageUsers(ctx);
    if (!hasPermission) {
      throw new ApiError(403, "FORBIDDEN", "Недостатньо прав для видачі доганів");
    }

    const body = issueWarningSchema.parse(await req.json());
    const ROOT_ID = "1223246458975686750";

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено");
    }

    // Защита Root и Leaders
    if (target.discordId === ROOT_ID) {
      throw new ApiError(403, "ROOT_PROTECTION", "Не можна видати доган Root-адміністратору");
    }
    if (target.role === "LEADER") {
      throw new ApiError(403, "LEADER_PROTECTION", "Не можна видати доган Лідеру");
    }

    // Проверка power
    const actor = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!actor) throw new ApiError(403, "ACTOR_NOT_FOUND", "Вас не знайдено в базі");

    const roleDefs = await (prisma as any).roleDefinition.findMany();
    const getPower = (role: string) => roleDefs.find((r: any) => r.name === role)?.power ?? 0;
    
    const isRoot = ctx.discordId === ROOT_ID;
    const actorPower = isRoot ? 999 : getPower(actor.role);
    const targetPower = getPower(target.role);

    if (targetPower >= actorPower && !isRoot) {
      throw new ApiError(403, "INSUFFICIENT_POWER", "Не можна видати доган користувачу з такою ж або вищою роллю");
    }

    // Проверяем количество активных доганов
    if (target.activeWarnings >= 3) {
      throw new ApiError(400, "MAX_WARNINGS", "Користувач вже має 3 догани і заморожений");
    }

    const newActiveWarnings = target.activeWarnings + 1;
    const shouldFreeze = newActiveWarnings >= 3;

    // Создаем доган и обновляем пользователя в транзакции
    const [warning] = await prisma.$transaction([
      prisma.warning.create({
        data: {
          userId,
          reason: body.reason,
          issuedById: ctx.userId,
          requiredAmount: body.requiredAmount,
        },
        include: {
          issuedBy: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          activeWarnings: newActiveWarnings,
          ...(shouldFreeze && {
            isFrozen: true,
            frozenReason: `Автоматична заморозка: 3 догани`,
          }),
        },
      }),
    ]);

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "WARNING_ISSUED",
      targetType: "User",
      targetId: userId,
      before: { activeWarnings: target.activeWarnings },
      after: { 
        activeWarnings: newActiveWarnings, 
        warningId: warning.id,
        reason: body.reason,
        requiredAmount: body.requiredAmount,
        isFrozen: shouldFreeze,
      },
    });

    // Discord уведомления
    try {
      await notifyWarningIssued({
        username: target.name,
        warningNumber: newActiveWarnings,
        reason: body.reason,
        requiredAmount: body.requiredAmount,
        issuedByName: actor.name,
      });

      if (shouldFreeze) {
        await notifyUserFrozen({
          username: target.name,
          reason: `Автоматична заморозка: 3 догани`,
        });
      }
    } catch (discordError) {
      console.error("[warning/POST] Discord notification error:", discordError);
    }

    return jsonOk({ 
      warning, 
      activeWarnings: newActiveWarnings,
      isFrozen: shouldFreeze,
      message: shouldFreeze 
        ? `Доган видано. Користувач отримав 3 догани і був заморожений.`
        : `Доган #${newActiveWarnings} успішно видано`,
    });
  } catch (e) {
    return jsonError(e);
  }
}

// DELETE - Снять доган (админ)
export async function DELETE(req: Request, ctx2: { params: { id: string } }) {
  try {
    const ctx = await requireSession();
    const userId = ctx2.params.id;
    
    const hasPermission = await canManageUsers(ctx);
    if (!hasPermission) {
      throw new ApiError(403, "FORBIDDEN", "Недостатньо прав для зняття доганів");
    }

    const body = removeWarningSchema.parse(await req.json());

    const warning = await prisma.warning.findUnique({
      where: { id: body.warningId },
    });

    if (!warning) {
      throw new ApiError(404, "NOT_FOUND", "Доган не знайдено");
    }

    if (warning.userId !== userId) {
      throw new ApiError(400, "INVALID_WARNING", "Доган не належить цьому користувачу");
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено");
    }

    // Если доган был активным, уменьшаем счетчик
    const wasActive = !warning.isWorkedOff;
    const newActiveWarnings = wasActive 
      ? Math.max(0, target.activeWarnings - 1) 
      : target.activeWarnings;
    
    // Если было 3 догана и теперь меньше - размораживаем
    const shouldUnfreeze = target.isFrozen && 
      target.frozenReason?.includes('3 догани') && 
      newActiveWarnings < 3;

    await prisma.$transaction([
      prisma.warning.delete({
        where: { id: body.warningId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          activeWarnings: newActiveWarnings,
          ...(shouldUnfreeze && {
            isFrozen: false,
            frozenReason: null,
          }),
        },
      }),
    ]);

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "WARNING_REMOVED",
      targetType: "User",
      targetId: userId,
      before: { 
        activeWarnings: target.activeWarnings, 
        warningId: body.warningId,
        isFrozen: target.isFrozen,
      },
      after: { 
        activeWarnings: newActiveWarnings,
        isFrozen: shouldUnfreeze ? false : target.isFrozen,
      },
    });

    // Discord уведомление о разморозке
    if (shouldUnfreeze) {
      try {
        await notifyUserUnfrozen({
          username: target.name,
          remainingWarnings: newActiveWarnings,
        });
      } catch (discordError) {
        console.error("[warning/DELETE] Discord notification error:", discordError);
      }
    }

    return jsonOk({ 
      activeWarnings: newActiveWarnings,
      wasUnfrozen: shouldUnfreeze,
      message: shouldUnfreeze 
        ? "Доган знято. Користувача розморожено."
        : "Доган успішно знято",
    });
  } catch (e) {
    return jsonError(e);
  }
}
