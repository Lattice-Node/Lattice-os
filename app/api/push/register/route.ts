import { authAny } from "@/lib/auth-any";
// app/api/push/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const request = req;
  try {
    const session = await authAny(req);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token || !platform) {
      return NextResponse.json({ error: 'token and platform are required' }, { status: 400 });
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json({ error: 'platform must be ios, android, or web' }, { status: 400 });
    }

    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId: session.userId,
        platform,
        active: true,
        updatedAt: new Date(),
      },
      create: {
        token,
        platform,
        userId: session.userId,
        active: true,
      },
    });

    return NextResponse.json({ success: true, id: deviceToken.id });
  } catch (error) {
    console.error('[Push Register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const request = req;
  try {
    const session = await authAny(req);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    await prisma.deviceToken.updateMany({
      where: { token, userId: session.userId },
      data: { active: false, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push Unregister] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}