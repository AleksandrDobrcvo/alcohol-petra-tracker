import { prisma } from "./prisma";

export type EntryType = "ALCO" | "PETRA";

export type CalcResult = { quantity: number; amount: number };

export async function calcQuantityAndAmount(type: EntryType, stars: number, quantity: number = 1): Promise<CalcResult> {
  const safeStars = Math.max(1, Math.min(3, Math.trunc(stars)));
  const safeQuantity = Math.max(1, Math.trunc(quantity));
  
  // Fetch price from DB
  const pricing = await prisma.pricing.findUnique({
    where: {
      type_stars: {
        type,
        stars: safeStars
      }
    }
  });

  const unitPrice = pricing?.price ?? (safeStars * 50); // fallback if not found
  const amount = Math.round(unitPrice * safeQuantity * 100) / 100;
  
  return { quantity: safeQuantity, amount };
}

