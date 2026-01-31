import { z } from "zod";
import { prisma } from "@/src/server/prisma"; // Updated prisma client with pricing model
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    const prices = await prisma.pricing.findMany();
    
    // If empty, return defaults
    if (prices.length === 0) {
      const defaults = [
        { type: "ALCO", stars: 1, price: 50 },
        { type: "ALCO", stars: 2, price: 100 },
        { type: "ALCO", stars: 3, price: 150 },
        { type: "PETRA", stars: 1, price: 50 },
        { type: "PETRA", stars: 2, price: 100 },
        { type: "PETRA", stars: 3, price: 150 },
      ];
      return jsonOk({ prices: defaults });
    }

    return jsonOk({ prices });
  } catch (e) {
    return jsonError(e);
  }
}

const patchSchema = z.object({
  type: z.enum(["ALCO", "PETRA"]),
  stars: z.number().int().min(1).max(3),
  price: z.number().min(0),
});

export async function PATCH(req: Request) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY", "SENIOR"]);

    const body = patchSchema.parse(await req.json());

    const updated = await prisma.pricing.upsert({
      where: {
        type_stars: {
          type: body.type,
          stars: body.stars,
        },
      },
      update: { price: body.price },
      create: {
        type: body.type,
        stars: body.stars,
        price: body.price,
      },
    });

    return jsonOk({ pricing: updated });
  } catch (e) {
    return jsonError(e);
  }
}
