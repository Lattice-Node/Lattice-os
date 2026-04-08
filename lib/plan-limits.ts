/**
 * Lattice plan limits — single source of truth.
 *
 * Phase 1 (current):
 * - Free / Starter / Pro are visible in UI
 * - Business is hidden in UI but kept in code for future B2B revival
 *
 * Phase 2 (future):
 * - monthlyRunsCap will be exposed as "Life Points (LP)" in UI
 * - LP can be earned via referrals, streaks, X share bonuses
 */

export type PlanId = "free" | "starter" | "personal" | "pro" | "business";

export interface PlanLimits {
  monthlyRunsCap: number;
  agentCap: number; // -1 = unlimited
  webSearch: boolean;
  toolUse: boolean;
  memoryInjection: "none" | "basic" | "advanced";
  storeFullAccess: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    monthlyRunsCap: 30,
    agentCap: 3,
    webSearch: false,
    toolUse: false,
    memoryInjection: "none",
    storeFullAccess: false,
  },
  starter: {
    monthlyRunsCap: 150,
    agentCap: 10,
    webSearch: true,
    toolUse: true,
    memoryInjection: "basic",
    storeFullAccess: false,
  },
  // Legacy alias — old "personal" plan was renamed to "starter"
  personal: {
    monthlyRunsCap: 150,
    agentCap: 10,
    webSearch: true,
    toolUse: true,
    memoryInjection: "basic",
    storeFullAccess: false,
  },
  pro: {
    monthlyRunsCap: 800,
    agentCap: -1,
    webSearch: true,
    toolUse: true,
    memoryInjection: "advanced",
    storeFullAccess: true,
  },
  business: {
    monthlyRunsCap: 2000,
    agentCap: -1,
    webSearch: true,
    toolUse: true,
    memoryInjection: "advanced",
    storeFullAccess: true,
  },
};

export function getPlanLimits(plan: string | null | undefined, role?: string): PlanLimits {
  if (role === "admin") {
    // Admins bypass all limits
    return {
      monthlyRunsCap: 999999,
      agentCap: -1,
      webSearch: true,
      toolUse: true,
      memoryInjection: "advanced",
      storeFullAccess: true,
    };
  }
  const key = (plan || "free") as PlanId;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.free;
}

/**
 * Returns the user's effective plan, taking lazy demotion into account.
 * If planExpiresAt is set and in the past, the user is treated as Free
 * regardless of the stored plan column. This implements cancel-at-period-end
 * without requiring a cron job.
 */
export function getEffectivePlan(
  plan: string | null | undefined,
  planExpiresAt: Date | null | undefined,
  now: Date = new Date()
): string {
  if (planExpiresAt && new Date(planExpiresAt).getTime() < now.getTime()) {
    return "free";
  }
  return plan || "free";
}

/**
 * Convenience: combine getEffectivePlan + getPlanLimits in one call.
 */
export function getEffectivePlanLimits(
  plan: string | null | undefined,
  planExpiresAt: Date | null | undefined,
  role?: string,
  now: Date = new Date()
): PlanLimits {
  if (role === "admin") return getPlanLimits(null, role);
  return getPlanLimits(getEffectivePlan(plan, planExpiresAt, now));
}

/**
 * Returns true if `resetAt` is in a previous calendar month from `now`.
 * Used to decide whether monthlyRunsUsed should be reset to 0.
 */
export function isResetDue(resetAt: Date, now: Date = new Date()): boolean {
  return (
    resetAt.getUTCFullYear() !== now.getUTCFullYear() ||
    resetAt.getUTCMonth() !== now.getUTCMonth()
  );
}

/**
 * Returns the first day of the current UTC month (00:00:00).
 * Used as the new resetAt anchor.
 */
export function startOfCurrentMonth(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

/**
 * Returns the next reset date (first day of next UTC month).
 * Used in the UI to show "X月X日にリセットされます".
 */
export function nextResetDate(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}
