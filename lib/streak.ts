import { prisma } from "@/lib/prisma";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  incremented: boolean;
  broken?: boolean;
}

export async function updateLoginStreak(userId: string): Promise<StreakResult | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastLoginDate: true },
    });
    if (!user) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastLoginDate) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: 1, longestStreak: 1, lastLoginDate: today },
      });
      return { currentStreak: 1, longestStreak: 1, incremented: true };
    }

    const last = new Date(user.lastLoginDate);
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / 86400000);

    if (daysDiff === 0) {
      return { currentStreak: user.currentStreak, longestStreak: user.longestStreak, incremented: false };
    }

    if (daysDiff === 1) {
      const newStreak = user.currentStreak + 1;
      const newLongest = Math.max(user.longestStreak, newStreak);
      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: newStreak, longestStreak: newLongest, lastLoginDate: today },
      });
      return { currentStreak: newStreak, longestStreak: newLongest, incremented: true };
    }

    // Streak broken
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: 1, lastLoginDate: today },
    });
    return { currentStreak: 1, longestStreak: user.longestStreak, incremented: true, broken: true };
  } catch (e) {
    console.error("[streak] update failed", e);
    return null;
  }
}
