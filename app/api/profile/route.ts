import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generatePublicId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { handle, displayName, avatarUrl } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, publicId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  // Handle validation
  if (handle !== undefined) {
    if (handle === null || handle === "") {
      updateData.handle = null;
    } else {
      const cleaned = handle.replace(/^@/, "");
      if (cleaned.length < 3 || cleaned.length > 20) {
        return NextResponse.json({ error: "ハンドルは3〜20文字にしてください" }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
        return NextResponse.json({ error: "ハンドルは英数字とアンダースコアのみ使用できます" }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: { handle: cleaned, NOT: { id: user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "このハンドルは既に使われています" }, { status: 409 });
      }
      updateData.handle = cleaned;
    }
  }

  // Display name
  if (displayName !== undefined) {
    if (typeof displayName === "string" && displayName.length <= 30) {
      updateData.displayName = displayName;
    }
  }

  // Avatar URL - accept preset IDs, base64 data URLs, or null
  if (avatarUrl !== undefined) {
    if (avatarUrl === null || avatarUrl === "") {
      updateData.avatarUrl = null;
    } else if (avatarUrl.startsWith("avatar:")) {
      updateData.avatarUrl = avatarUrl;
    } else if (avatarUrl.startsWith("data:image")) {
      // Base64 image - validate size (max ~50KB base64 ≈ ~37KB image)
      if (avatarUrl.length > 70000) {
        return NextResponse.json({ error: "画像サイズが大きすぎます" }, { status: 400 });
      }
      updateData.avatarUrl = avatarUrl;
    }
  }

  // Generate publicId if missing
  if (!user.publicId) {
    let pid = generatePublicId();
    let attempts = 0;
    while (attempts < 10) {
      const exists = await prisma.user.findFirst({ where: { publicId: pid } });
      if (!exists) break;
      pid = generatePublicId();
      attempts++;
    }
    updateData.publicId = pid;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: {
      handle: true,
      displayName: true,
      avatarUrl: true,
      publicId: true,
    },
  });

  return NextResponse.json({ profile: updated });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      handle: true,
      displayName: true,
      avatarUrl: true,
      publicId: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: user });
}
