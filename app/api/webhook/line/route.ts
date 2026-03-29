import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLineMessage } from "@/lib/line";

export async function POST(req: Request) {
  const body = await req.json();
  const events = body.events || [];

  for (const event of events) {
    const lineUserId = event.source?.userId;
    if (!lineUserId) continue;

    if (event.type === "follow") {
      await sendLineMessage(
        lineUserId,
        "Lattice Bot\u3078\u3088\u3046\u3053\u305d\uff01\n\nLattice\u306e\u8a2d\u5b9a\u753b\u9762\u3067\u300c\u9023\u643a\u30b3\u30fc\u30c9\u3092\u767a\u884c\u300d\u3092\u62bc\u3057\u3066\u30016\u6841\u306e\u30b3\u30fc\u30c9\u3092\u3053\u3053\u306b\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
      );
    }

    if (event.type === "message" && event.message?.type === "text") {
      const text = (event.message.text || "").trim();

      // Check if already linked
      const existingConn = await prisma.userConnection.findFirst({
        where: { provider: "line", accessToken: lineUserId },
      });

      if (existingConn) {
        await sendLineMessage(lineUserId, "Lattice\u3068\u9023\u643a\u6e08\u307f\u3067\u3059\u3002");
        continue;
      }

      // Check if message is a 6-digit code
      if (/^\d{6}$/.test(text)) {
        const linkCode = await prisma.linkCode.findUnique({
          where: { code: text },
        });

        if (!linkCode || linkCode.expiresAt < new Date()) {
          await sendLineMessage(lineUserId, "\u30b3\u30fc\u30c9\u304c\u7121\u52b9\u307e\u305f\u306f\u671f\u9650\u5207\u308c\u3067\u3059\u3002\u8a2d\u5b9a\u753b\u9762\u304b\u3089\u518d\u767a\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
          continue;
        }

        // Create connection
        const existing = await prisma.userConnection.findFirst({
          where: { userId: linkCode.userId, provider: "line" },
        });

        if (existing) {
          await prisma.userConnection.update({
            where: { id: existing.id },
            data: { accessToken: lineUserId, metadata: JSON.stringify({ lineUserId }) },
          });
        } else {
          await prisma.userConnection.create({
            data: {
              userId: linkCode.userId,
              provider: "line",
              accessToken: lineUserId,
              metadata: JSON.stringify({ lineUserId }),
            },
          });
        }

        // Delete used code
        await prisma.linkCode.delete({ where: { id: linkCode.id } });

        await sendLineMessage(lineUserId, "LINE\u9023\u643a\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\uff01\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u306e\u5b9f\u884c\u7d50\u679c\u304cLINE\u306b\u5c4a\u304d\u307e\u3059\u3002");
      } else {
        await sendLineMessage(
          lineUserId,
          "Lattice\u306e\u8a2d\u5b9a\u753b\u9762\u3067\u300c\u9023\u643a\u30b3\u30fc\u30c9\u3092\u767a\u884c\u300d\u3092\u62bc\u3057\u30016\u6841\u306e\u30b3\u30fc\u30c9\u3092\u3053\u3053\u306b\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}