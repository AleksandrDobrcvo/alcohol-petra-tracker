import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { jsonError, jsonOk } from "@/src/server/http";
import { ApiError } from "@/src/server/errors";
import { calcQuantityAndAmount } from "@/src/server/entryCalc";
import { writeAuditLog } from "@/src/server/audit";
import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const createSchema = z.object({
  nickname: z.string().trim().min(2).max(32),
  type: z.enum(["ALCO", "PETRA"]),
  stars: z.coerce.number().int().min(1).max(3),
  quantity: z.coerce.number().int().min(1).default(1),
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
      stars: form.get("stars"),
      quantity: form.get("quantity"),
      cardLastDigits: form.get("cardLastDigits"),
    };

    const parsed = createSchema.parse({
      nickname: typeof raw.nickname === "string" ? raw.nickname : "",
      type: typeof raw.type === "string" ? raw.type : "",
      stars: typeof raw.stars === "string" ? raw.stars : raw.stars,
      quantity: typeof raw.quantity === "string" ? raw.quantity : "1",
      cardLastDigits: typeof raw.cardLastDigits === "string" ? raw.cardLastDigits : undefined,
    });

    const screenshot = form.get("screenshot");
    if (!screenshot || typeof screenshot === "string") {
      throw new ApiError(400, "MISSING_SCREENSHOT", "Потрібен скріншот");
    }

    const file = screenshot as File;
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength <= 0) {
      throw new ApiError(400, "EMPTY_SCREENSHOT", "Файл скріншоту порожній");
    }

    const dir = join(process.cwd(), "public", "uploads", "requests");
    await mkdir(dir, { recursive: true });

    const safeExt = extname(file.name || "").slice(0, 10) || ".png";
    const filename = `${Date.now()}-${randomUUID()}${safeExt}`;
    const abs = join(dir, filename);
    await writeFile(abs, buf);

    const { quantity, amount } = await calcQuantityAndAmount(parsed.type, parsed.stars, parsed.quantity);
    const screenshotPath = `/uploads/requests/${filename}`;

    const created = await prisma.entryRequest.create({
      data: {
        submitterId: ctx.userId,
        date: new Date(),
        type: parsed.type,
        stars: parsed.stars,
        quantity,
        amount,
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
        type: created.type,
        stars: created.stars,
        quantity: created.quantity,
        amount: created.amount,
        nickname: created.nickname,
        screenshotPath: created.screenshotPath,
        cardLastDigits: created.cardLastDigits,
      },
    });

    return jsonOk({ request: created }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
