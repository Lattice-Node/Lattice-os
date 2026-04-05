import { prisma } from "@/lib/prisma";

export async function getCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { distributedCredits: true, purchasedCredits: true },
  });
  if (!user) throw new Error("User not found");
  return {
    distributed: user.distributedCredits,
    purchased: user.purchasedCredits,
    total: user.distributedCredits + user.purchasedCredits,
  };
}

export async function hasEnoughCredits(userId: string, amount: number) {
  const { total } = await getCredits(userId);
  return total >= amount;
}

/**
 * クレジット消費: purchased を先に消費、不足分を distributed から
 */
export async function consumeCredits(
  userId: string,
  amount: number,
  category: string,
  relatedId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { distributedCredits: true, purchasedCredits: true },
    });
    if (!user) throw new Error("User not found");

    const total = user.distributedCredits + user.purchasedCredits;
    if (total < amount) throw new Error("Insufficient credits");

    // purchased を先に消費
    const fromPurchased = Math.min(user.purchasedCredits, amount);
    const fromDistributed = amount - fromPurchased;

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        purchasedCredits: { decrement: fromPurchased },
        distributedCredits: { decrement: fromDistributed },
      },
      select: { distributedCredits: true, purchasedCredits: true },
    });

    const newBalance = updated.distributedCredits + updated.purchasedCredits;

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: "consumption",
        category,
        creditKind: fromPurchased > 0 ? "purchased" : "distributed",
        balance: newBalance,
        relatedId: relatedId ?? null,
      },
    });

    return { distributed: updated.distributedCredits, purchased: updated.purchasedCredits, total: newBalance };
  });
}

/**
 * クレジット加算: distributed or purchased に加算
 */
export async function addCredits(
  userId: string,
  amount: number,
  creditKind: "distributed" | "purchased",
  category: string,
  relatedId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const field = creditKind === "purchased" ? "purchasedCredits" : "distributedCredits";

    const updated = await tx.user.update({
      where: { id: userId },
      data: { [field]: { increment: amount } },
      select: { distributedCredits: true, purchasedCredits: true },
    });

    const newBalance = updated.distributedCredits + updated.purchasedCredits;

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type: creditKind === "purchased" ? "purchase" : "distribution",
        category,
        creditKind,
        balance: newBalance,
        relatedId: relatedId ?? null,
      },
    });

    return { distributed: updated.distributedCredits, purchased: updated.purchasedCredits, total: newBalance };
  });
}

/**
 * クレジットリセット: サブスク開始/更新/解約時
 * purchased は preservePurchased=true で維持可能
 */
export async function resetCredits(
  userId: string,
  distributed: number,
  purchased: number,
  category: string,
  relatedId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        distributedCredits: distributed,
        purchasedCredits: purchased,
      },
      select: { distributedCredits: true, purchasedCredits: true },
    });

    const newBalance = updated.distributedCredits + updated.purchasedCredits;

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: 0,
        type: "reset",
        category,
        creditKind: "distributed",
        balance: newBalance,
        relatedId: relatedId ?? null,
        note: `distributed=${distributed}, purchased=${purchased}`,
      },
    });

    return { distributed: updated.distributedCredits, purchased: updated.purchasedCredits, total: newBalance };
  });
}
