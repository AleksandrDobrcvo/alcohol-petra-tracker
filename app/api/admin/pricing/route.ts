import { z } from "zod";
import { prisma } from "@/src/server/prisma"; // Updated prisma client with pricing model
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    const dbPrices = await prisma.pricing.findMany();
    
    const types = ["ALCO", "PETRA"] as const;
    const stars = [1, 2, 3] as const;
    
    const finalPrices = [];
    
    for (const type of types) {
      for (const s of stars) {
        const found = dbPrices.find(p => p.type === type && p.stars === s);
        if (found) {
          finalPrices.push(found);
        } else {
          finalPrices.push({ type, stars: s, price: s * 50 });
        }
      }
    }

    return jsonOk({ prices: finalPrices });
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
