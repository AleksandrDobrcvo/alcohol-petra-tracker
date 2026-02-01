import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { ApiError } from "@/src/server/errors";
import { calcQuantityAndAmount } from "@/src/server/entryCalc";
import { writeAuditLog } from "@/src/server/audit";

const createSchema = z.object({
  nickname: z.string().trim().min(2).max(32),
  type: z.enum(["ALCO", "PETRA"]),
  quantities: z.object({
    stars1: z.number().int().min(0).default(0),
    stars2: z.number().int().min(0).default(0),
    stars3: z.number().int().min(0).default(0),
  }),
  cardLastDigits: z.string().length(6).regex(/^\d+$/).optional(),
});

const listSchema = z.object({
  mine: z.enum(["true", "false"]).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  type: z.enum(["ALCO", "PETRA"]).optional(),
});

function canSeeAll(ctx: Awaited<ReturnType<typeof requireSession>>) {
  // User requested that everyone can see all requests and statuses
  return true;
}

export async function GET(req: Request) {
  try {
    const ctx = await requireSession();

    const url = new URL(req.url);
    const q = listSchema.parse({
      mine: url.searchParams.get("mine") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
    });

    const effectiveMine = q.mine === "true" || !canSeeAll(ctx);

    const where = {
      submitterId: effectiveMine ? ctx.userId : undefined,
      status: q.status,
      type: q.type,
    } as const;

    const requests = await prisma.entryRequest.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        submitter: { select: { id: true, name: true } },
        decidedBy: { select: { id: true, name: true } },
      },
    });

    return jsonOk({ requests });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireSession();

    const form = await req.formData();
    const raw = {
      nickname: form.get("nickname"),
      type: form.get("type"),
      quantities: form.get("quantities"),
      cardLastDigits: form.get("cardLastDigits"),
    };

    // Parse quantities JSON
    let quantitiesObj = { stars1: 0, stars2: 0, stars3: 0 };
    if (typeof raw.quantities === "string") {
      try {
        quantitiesObj = JSON.parse(raw.quantities);
      } catch {
        throw new ApiError(400, "INVALID_QUANTITIES", "Некоректний формат кількостей");
      }
    }

    const parsed = createSchema.parse({
      nickname: typeof raw.nickname === "string" ? raw.nickname : "",
      type: typeof raw.type === "string" ? raw.type : "",
      quantities: quantitiesObj,
      cardLastDigits: typeof raw.cardLastDigits === "string" ? raw.cardLastDigits : undefined,
    });

    // Validate at least one quantity > 0
    const totalQty = parsed.quantities.stars1 + parsed.quantities.stars2 + parsed.quantities.stars3;
    if (totalQty <= 0) {
      throw new ApiError(400, "NO_QUANTITY", "Вкажіть кількість хоча б одного ресурсу");
    }

    const screenshot = form.get("screenshot");
    if (!screenshot || typeof screenshot === "string") {
      throw new ApiError(400, "MISSING_SCREENSHOT", "Потрібен скріншот");
    }

    const file = screenshot as File;
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength <= 0) {
      throw new ApiError(400, "EMPTY_SCREENSHOT", "Файл скріншоту порожній");
    }
    if (buf.byteLength > 5 * 1024 * 1024) {
      throw new ApiError(400, "FILE_TOO_LARGE", "Файл занадто великий (макс 5MB)");
    }

    // Store as base64 data URL
    const mimeType = file.type || "image/png";
    const base64 = buf.toString("base64");
    const screenshotPath = `data:${mimeType};base64,${base64}`;

    // Create one consolidated request
    const { totalAmount } = await calcTotalForConsolidated(parsed.type, parsed.quantities);

    const created = await (prisma as any).entryRequest.create({
      data: {
        submitterId: ctx.userId,
        date: new Date(),
        type: parsed.type,
        stars1Qty: parsed.quantities.stars1,
        stars2Qty: parsed.quantities.stars2,
        stars3Qty: parsed.quantities.stars3,
        totalAmount: totalAmount,
        nickname: parsed.nickname,
        screenshotPath,
        cardLastDigits: parsed.cardLastDigits ?? null,
        status: "PENDING",
      },
      include: {
        submitter: { select: { id: true, name: true } },
        decidedBy: { select: { id: true, name: true } },
      },
    });

    await writeAuditLog({
      actorUserId: ctx.userId,
      action: "REQUEST_CREATE",
      targetType: "EntryRequest",
      targetId: created.id,
      after: {
        type: (created as any).type,
        stars1: (created as any).stars1Qty,
        stars2: (created as any).stars2Qty,
        stars3: (created as any).stars3Qty,
        totalAmount: (created as any).totalAmount,
        nickname: (created as any).nickname,
        cardLastDigits: (created as any).cardLastDigits,
      },
    });

    return jsonOk({ request: created }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

async function calcTotalForConsolidated(type: "ALCO" | "PETRA", q: { stars1: number; stars2: number; stars3: number }) {
  const prices = await prisma.pricing.findMany({ where: { type } });
  const getPrice = (s: number) => prices.find(p => p.stars === s)?.price ?? 0;

  const totalAmount = 
    (q.stars1 * getPrice(1)) + 
    (q.stars2 * getPrice(2)) + 
    (q.stars3 * getPrice(3));

  return { totalAmount };
}
