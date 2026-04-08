import { prisma } from "@/lib/prisma";

export interface RevenueInput {
  date: Date;
  amountJpy: number;
  userId?: string | null;
  platform: "ios" | "web";
  productId: string;
  transactionType: "subscription_new" | "subscription_renewal" | "subscription_cancel" | "one_time";
  externalId?: string | null;
}

/**
 * Idempotent revenue recorder. If externalId is provided and already exists,
 * the call is a no-op (prevents double-counting on webhook retries).
 */
export async function recordRevenue(input: RevenueInput): Promise<void> {
  try {
    if (input.externalId) {
      const existing = await prisma.revenueRecord.findFirst({
        where: { externalId: input.externalId },
      });
      if (existing) return;
    }
    await prisma.revenueRecord.create({
      data: {
        date: input.date,
        amount: input.amountJpy,
        userId: input.userId || null,
        platform: input.platform,
        productId: input.productId,
        transactionType: input.transactionType,
        externalId: input.externalId || null,
      },
    });
  } catch (e) {
    console.warn("[revenue] record failed", e);
  }
}

/**
 * Sum revenue for the current calendar year (UTC).
 */
export async function getYtdRevenue(): Promise<number> {
  const start = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
  const sum = await prisma.revenueRecord.aggregate({
    where: { date: { gte: start } },
    _sum: { amount: true },
  });
  return sum._sum.amount || 0;
}

/**
 * Returns a 12-month array of revenue totals for the current calendar year.
 */
export async function getMonthlyRevenue(): Promise<number[]> {
  const year = new Date().getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const records = await prisma.revenueRecord.findMany({
    where: { date: { gte: start, lt: end } },
    select: { date: true, amount: true },
  });
  const months = new Array(12).fill(0);
  for (const r of records) {
    const m = new Date(r.date).getUTCMonth();
    months[m] += r.amount;
  }
  return months;
}
