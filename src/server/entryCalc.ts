export type EntryType = "ALCO" | "PETRA";

export type CalcResult = { quantity: number; amount: number };

const UNIT_PRICE: Record<EntryType, number> = {
  ALCO: 100,
  PETRA: 100,
};

export function calcQuantityAndAmount(type: EntryType, stars: number): CalcResult {
  const safeStars = Math.max(1, Math.min(3, Math.trunc(stars)));
  const quantity = safeStars;
  const amountRaw = quantity * UNIT_PRICE[type];
  const amount = Math.round(amountRaw * 100) / 100;
  return { quantity, amount };
}

