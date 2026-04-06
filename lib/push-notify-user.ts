// lib/push-notify-user.ts
import { prisma } from '@/lib/prisma';
import { sendPushToMultipleDevices } from '@/lib/apns';

export async function notifyUser(params: {
  userId: string;
  title: string;
  body: string;
  agentId?: string;
  executionId?: string;
}) {
  try {
    if (!process.env.APNS_KEY_P8 || !process.env.APNS_KEY_ID || !process.env.APNS_TEAM_ID) {
      console.log('[Push] APNs not configured, skipping notification');
      return { sent: 0 };
    }

    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId: params.userId, active: true },
      select: { token: true },
    });

    if (deviceTokens.length === 0) return { sent: 0 };

    const tokens = deviceTokens.map((dt) => dt.token);
    const results = await sendPushToMultipleDevices(tokens, {
      title: params.title,
      body: params.body,
      data: {
        ...(params.agentId && { agentId: params.agentId }),
        ...(params.executionId && { executionId: params.executionId }),
      },
    });

    const invalidTokens = results
      .filter((r) => !r.success && (r.reason === 'BadDeviceToken' || r.reason === 'Unregistered' || r.statusCode === 410))
      .map((r) => r.deviceToken);

    if (invalidTokens.length > 0) {
      await prisma.deviceToken.updateMany({
        where: { token: { in: invalidTokens } },
        data: { active: false },
      });
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`[Push] Sent ${successCount}/${tokens.length} to user ${params.userId}`);
    return { sent: successCount };
  } catch (error) {
    console.error('[Push] notifyUser error:', error);
    return { sent: 0 };
  }
}

function formatOutputForNotification(output: string): string {
  const cleaned = output
    .trim()
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[#*`\-]+/g, "")
    .trim();

  if (cleaned.length === 0) return "実行が完了しました";
  if (cleaned.length <= 100) return cleaned;
  return cleaned.slice(0, 100) + "\u2026";
}

export async function notifyCronComplete(params: {
  userId: string;
  agentName: string;
  agentId: string;
  success: boolean;
  output?: string;
  error?: string;
}) {
  console.log("[notify-cron-complete]", {
    userId: params.userId,
    agentName: params.agentName,
    status: params.success ? "success" : "error",
    bodyLength: params.output?.length ?? 0,
    hasKeys: Boolean(process.env.APNS_KEY_P8 && process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID),
  });

  let title: string;
  let body: string;

  if (params.success) {
    title = params.agentName;
    body = params.output ? formatOutputForNotification(params.output) : "実行が完了しました";
  } else {
    title = `${params.agentName} - 失敗`;
    const errText = params.error?.trim();
    body = errText ? (errText.length <= 80 ? errText : errText.slice(0, 80) + "\u2026") : "エラーが発生しました";
  }

  return notifyUser({
    userId: params.userId,
    title,
    body,
    agentId: params.agentId,
  });
}
