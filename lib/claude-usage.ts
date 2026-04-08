import { prisma } from "@/lib/prisma";

// Pricing for claude-haiku-4-5 (per 1M tokens, in USD).
// Update if Anthropic changes pricing.
const PRICING = {
  "claude-haiku-4-5-20251001": {
    input: 1.0,
    output: 5.0,
    cacheWrite: 1.25,
    cacheRead: 0.1,
  },
  default: {
    input: 1.0,
    output: 5.0,
    cacheWrite: 1.25,
    cacheRead: 0.1,
  },
};

const USD_TO_JPY = 155; // rough estimate; actual rate is variable
const WEB_SEARCH_USD_PER_CALL = 0.01; // $10 / 1000 searches

export function estimateCostJpy(opts: {
  model?: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  webSearches?: number;
}): number {
  const p = (opts.model && (PRICING as any)[opts.model]) || PRICING.default;
  const usd =
    (opts.inputTokens / 1_000_000) * p.input +
    (opts.outputTokens / 1_000_000) * p.output +
    ((opts.cacheReadTokens || 0) / 1_000_000) * p.cacheRead +
    ((opts.cacheWriteTokens || 0) / 1_000_000) * p.cacheWrite +
    (opts.webSearches || 0) * WEB_SEARCH_USD_PER_CALL;
  return Math.round(usd * USD_TO_JPY * 100) / 100;
}

export interface LogClaudeUsageInput {
  userId?: string | null;
  route: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  } | null;
  webSearches?: number;
}

/**
 * Log a Claude API call to ClaudeUsageLog. Fire-and-forget — does NOT throw.
 */
export async function logClaudeUsage(opts: LogClaudeUsageInput): Promise<void> {
  try {
    const u = opts.usage || {};
    const inputTokens = u.input_tokens ?? 0;
    const outputTokens = u.output_tokens ?? 0;
    const cacheReadTokens = u.cache_read_input_tokens ?? 0;
    const cacheWriteTokens = u.cache_creation_input_tokens ?? 0;
    const webSearches = opts.webSearches ?? 0;
    const model = opts.model || "claude-haiku-4-5-20251001";
    const cost = estimateCostJpy({ model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, webSearches });

    await prisma.claudeUsageLog.create({
      data: {
        userId: opts.userId || null,
        route: opts.route,
        model,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        cacheWriteTokens,
        webSearches,
        costJpyEstimate: cost,
      },
    });
  } catch (e) {
    // Never let logging block the request
    console.warn("[claude-usage] log failed", e);
  }
}
