import { prisma } from "@/lib/prisma";
import { getPlanLimits, isResetDue, startOfCurrentMonth } from "@/lib/plan-limits";

export interface RunCapCheckResult {
  allowed: boolean;
  used: number;
  cap: number;
  reason?: "limit_reached" | "user_not_found";
}

/**
 * Check whether a user has runs remaining this month.
 * Performs a lazy reset if the current month differs from monthlyRunsResetAt.
 * Does NOT increment the counter — call `consumeRun` after a successful execution.
 */
export async function checkRunCap(userId: string): Promise<RunCapCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      role: true,
      monthlyRunsUsed: true,
      monthlyRunsResetAt: true,
    },
  });

  if (!user) {
    return { allowed: false, used: 0, cap: 0, reason: "user_not_found" };
  }

  const limits = getPlanLimits(user.plan, user.role);
  const now = new Date();

  // Lazy monthly reset
  let used = user.monthlyRunsUsed;
  if (isResetDue(user.monthlyRunsResetAt, now)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyRunsUsed: 0,
        monthlyRunsResetAt: startOfCurrentMonth(now),
      },
    });
    used = 0;
  }

  if (used >= limits.monthlyRunsCap) {
    return {
      allowed: false,
      used,
      cap: limits.monthlyRunsCap,
      reason: "limit_reached",
    };
  }

  return { allowed: true, used, cap: limits.monthlyRunsCap };
}

/**
 * Increment monthlyRunsUsed by 1. Call this AFTER a successful Claude API call.
 */
export async function consumeRun(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { monthlyRunsUsed: { increment: 1 } },
  });
}

/**
 * Reset monthlyRunsUsed to 0 when a user upgrades their plan.
 * Call this from Stripe / RevenueCat webhook on subscription_new and product_change-upgrade.
 * Idempotent: safe to call multiple times for the same upgrade.
 */
export async function resetRunsOnUpgrade(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyRunsUsed: 0,
      monthlyRunsResetAt: startOfCurrentMonth(),
    },
  });
}

const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  personal: 1, // legacy
  pro: 2,
  business: 3,
};

/**
 * Returns true if `newPlan` is strictly higher than `oldPlan` in the plan hierarchy.
 */
export function isUpgrade(oldPlan: string | null | undefined, newPlan: string): boolean {
  const o = PLAN_RANK[oldPlan || "free"] ?? 0;
  const n = PLAN_RANK[newPlan] ?? 0;
  return n > o;
}
