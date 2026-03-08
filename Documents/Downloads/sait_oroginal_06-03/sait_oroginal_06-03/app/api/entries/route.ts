import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { calcQuantityAndAmount } from "@/src/server/entryCalc";
import { writeAuditLog } from "@/src/server/audit";
import { canManageRequests } from "@/src/server/rbac";
import { ApiError } from "@/src/server/errors";
import { processWarningWorkOff } from "@/app/api/users/[id]/warning/work-off/route";

const entryCreateSchema = z.object({
  date: z.string().datetime(),
  submitterId: z.string().uuid(),
  type: z.enum(["ALCO", "PETRA"]),
  stars: z.number().int().min(1).max(3),
  quantity: z.number().int().min(1).default(1),
});

export async function GET(req: Request) {
  try {
    // public for signed-in users (including MEMBER)
    await requireSession();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? undefined;
    const type = url.searchParams.get("type") ?? undefined;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const paymentStatus = url.searchParams.get("paymentStatus") ?? undefined;
    const mine = url.searchParams.get("mine") === "true";

    const session = await requireSession();
    const where = {
      submitterId: mine ? session.userId : userId,
      type: type === "ALCO" || type === "PETRA" ? type : undefined,
      paymentStatus:
        paymentStatus === "PAID" || paymentStatus === "UNPAID" ? paymentStatus : undefined,
      date:
        from || to
          ? {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            }
          : undefined,
    } as const;

    const entries = await (prisma as any).entry.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        submitter: { select: { id: true, name: true, role: true, discordId: true, additionalRoles: true } },
        createdBy: { select: { id: true, name: true, role: true, discordId: true, additionalRoles: true } },
        updatedBy: { select: { id: true, name: true, role: true, discordId: true, additionalRoles: true } },
        entryRequest: {
          select: {
            id: true,
            nickname: true,
            screenshotPath: true,
            status: true,
            decidedAt: true,
            decisionNote: true,
            cardLastDigits: true,
            createdAt: true,
            decidedBy: { select: { id: true, name: true, role: true, discordId: true, additionalRoles: true } },
          }
        }
      },
    });

    return jsonOk({ entries });
  } catch (e) {
    console.error("[GET /api/entries] Error:", e);
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireSession();
    
    // Check if user has permission to manage requests
    const hasPermission = await canManageRequests(ctx);
    if (!hasPermission) {
      throw new ApiError(403, "FORBIDDEN", "Insufficient permissions to create entries");
    }
    
    const body = entryCreateSchema.parse(await req.json());
    const { quantity, amount } = await calcQuantityAndAmount(body.type, body.stars, body.quantity);

    const entry = await prisma.entry.create({
      data: {
        date: new Date(body.date),
        submitterId: body.submitterId,
        type: body.type,
        stars: body.stars,
        quantity,
        amount,
        paymentStatus: "UNPAID",
        createdById: ctx.userId,
      },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "ENTRY_CREATE",
      targetType: "Entry",
      targetId: entry.id,
      after: {
        date: entry.date,
        type: entry.type,
        stars: entry.stars,
        quantity: entry.quantity,
        amount: entry.amount,
        paymentStatus: entry.paymentStatus,
        submitterId: entry.submitterId,
      },
    });

    // Проверяем есть ли у пользователя активные доганы для отработки
    let warningWorkOffResult = null;
    try {
      const submitter = await prisma.user.findUnique({
        where: { id: body.submitterId },
        select: { activeWarnings: true },
      });

      if (submitter && submitter.activeWarnings > 0) {
        // Автоматически засчитываем quantity в отработку догана
        warningWorkOffResult = await processWarningWorkOff(
          body.submitterId,
          body.type as "ALCO" | "PETRA",
          quantity
        );

        if (warningWorkOffResult) {
          await writeAuditLog({
            actorUserId: ctx.userId,
            action: "WARNING_AUTO_WORK_OFF",
            targetType: "Warning",
            targetId: warningWorkOffResult.warning.id,
            after: {
              entryId: entry.id,
              type: body.type,
              amount: quantity,
              isFullyWorkedOff: warningWorkOffResult.isFullyWorkedOff,
            },
          });
        }
      }
    } catch (workOffError) {
      // Не прерываем создание entry если отработка не удалась
      console.error("[entries/POST] Warning work-off error:", workOffError);
    }

    return jsonOk({ 
      entry, 
      warningWorkOff: warningWorkOffResult,
    }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

