import { prisma } from "@/lib/prisma";

/**
 * クレジット消費: 旧creditsフィールドを使用（マイグレーション適用後に新フィールドに切替）
 */
export async function consumeCredits(
  userId: string,
  amount: number,
  category: string,
  relatedId?: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: amount } },
  });
}

/**
 * クレジット加算: 旧creditsフィールドを使用
 */
export async function addCredits(
  userId: string,
  amount: number,
  creditKind: "distributed" | "purchased",
  category: string,
  relatedId?: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}

/**
 * クレジットリセット: 旧creditsフィールドを使用
 */
export async function resetCredits(
  userId: string,
  distributed: number,
  purchased: number,
  category: string,
  relatedId?: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: distributed + purchased },
  });
}
