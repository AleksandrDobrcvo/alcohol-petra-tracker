import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";
import { calcQuantityAndAmount } from "@/src/server/entryCalc";
import { writeAuditLog } from "@/src/server/audit";

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

    const entries = await prisma.entry.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        submitter: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });

    return jsonOk({ entries });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);
    
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

    return jsonOk({ entry }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

