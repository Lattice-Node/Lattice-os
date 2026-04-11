import { prisma } from "@/lib/prisma";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_login:       { id: "first_login",       icon: "🎉", title: "Lattice へようこそ",        description: "最初の一歩、おめでとう" },
  streak_3:          { id: "streak_3",           icon: "🔥", title: "3日連続ログイン",           description: "継続は力なり" },
  streak_7:          { id: "streak_7",           icon: "⚡", title: "1週間連続ログイン",         description: "習慣化の一歩" },
  streak_30:         { id: "streak_30",          icon: "👑", title: "30日連続ログイン",           description: "Lattice の達人" },
  first_agent:       { id: "first_agent",        icon: "🤖", title: "最初のエージェント作成",     description: "自動化の旅が始まる" },
  first_execution:   { id: "first_execution",    icon: "✨", title: "最初の自動実行",            description: "AI が動き出した" },
  starter_upgrade:   { id: "starter_upgrade",    icon: "💎", title: "Starter プラン",           description: "限界を超えた" },
  pro_upgrade:       { id: "pro_upgrade",        icon: "🌟", title: "Pro プラン",               description: "最高峰の体験" },
};

/**
 * Unlock an achievement for a user. Idempotent — safe to call multiple times.
 * Returns the achievement if it was newly unlocked, null if already had it.
 */
export async function unlockAchievement(userId: string, achievementId: string): Promise<Achievement | null> {
  const def = ACHIEVEMENTS[achievementId];
  if (!def) return null;

  try {
    await prisma.userAchievement.create({
      data: { userId, achievementId },
    });
    return def;
  } catch {
    // Unique constraint violation = already unlocked
    return null;
  }
}

/**
 * Check streak milestones and unlock achievements.
 */
export async function checkStreakAchievements(userId: string, currentStreak: number): Promise<Achievement | null> {
  if (currentStreak === 3) return unlockAchievement(userId, "streak_3");
  if (currentStreak === 7) return unlockAchievement(userId, "streak_7");
  if (currentStreak === 30) return unlockAchievement(userId, "streak_30");
  return null;
}
