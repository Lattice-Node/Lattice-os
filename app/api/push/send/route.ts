// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToMultipleDevices } from '@/lib/apns';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, title, body, data } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'userId, title, and body are required' }, { status: 400 });
    }

    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId, active: true },
      select: { id: true, token: true },
    });

    if (deviceTokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No active device tokens found' });
    }

    const tokens = deviceTokens.map((dt) => dt.token);
    const results = await sendPushToMultipleDevices(tokens, { title, body, data: data || {} });

    const invalidTokens = results
      .filter((r) => !r.success && (r.reason === 'BadDeviceToken' || r.reason === 'Unregistered' || r.statusCode === 410))
      .map((r) => r.deviceToken);

    if (invalidTokens.length > 0) {
      await prisma.deviceToken.updateMany({
        where: { token: { in: invalidTokens } },
        data: { active: false, updatedAt: new Date() },
      });
    }

    const successCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: results.length - successCount,
      invalidated: invalidTokens.length,
    });
  } catch (error) {
    console.error('[Push Send] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}