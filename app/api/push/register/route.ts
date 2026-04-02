// app/api/push/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, platform } = await request.json();

    if (!token || !platform) {
      return NextResponse.json({ error: 'token and platform are required' }, { status: 400 });
    }

    if (!['ios', 'android'].includes(platform)) {
      return NextResponse.json({ error: 'platform must be ios or android' }, { status: 400 });
    }

    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId: session.user.id,
        platform,
        active: true,
        updatedAt: new Date(),
      },
      create: {
        token,
        platform,
        userId: session.user.id,
        active: true,
      },
    });

    return NextResponse.json({ success: true, id: deviceToken.id });
  } catch (error) {
    console.error('[Push Register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    await prisma.deviceToken.updateMany({
      where: { token, userId: session.user.id },
      data: { active: false, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push Unregister] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}