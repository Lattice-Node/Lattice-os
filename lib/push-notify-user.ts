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

export async function notifyCronComplete(params: {
  userId: string;
  agentName: string;
  agentId: string;
  success: boolean;
}) {
  const title = params.success
    ? `${params.agentName} 実行完了`
    : `${params.agentName} 実行失敗`;
  const body = params.success
    ? '定時実行が完了しました。結果を確認してください。'
    : '定時実行でエラーが発生しました。詳細を確認してください。';

  return notifyUser({
    userId: params.userId,
    title,
    body,
    agentId: params.agentId,
  });
}