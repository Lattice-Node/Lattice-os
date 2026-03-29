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
        "Lattice Bot\u3078\u3088\u3046\u3053\u305d\uff01\n\n\u4ee5\u4e0b\u306e\u9023\u643a\u30b3\u30fc\u30c9\u3092Lattice\u306e\u8a2d\u5b9a\u753b\u9762\u306b\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\n" + lineUserId
      );
    }

    if (event.type === "message") {
      const conn = await prisma.userConnection.findFirst({
        where: { provider: "line", accessToken: lineUserId },
      });

      if (conn) {
        await sendLineMessage(
          lineUserId,
          "Lattice\u3068\u9023\u643a\u6e08\u307f\u3067\u3059\u3002\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u306e\u5b9f\u884c\u7d50\u679c\u304cLINE\u306b\u5c4a\u304d\u307e\u3059\u3002"
        );
      } else {
        await sendLineMessage(
          lineUserId,
          "\u9023\u643a\u30b3\u30fc\u30c9\u3092Lattice\u306e\u8a2d\u5b9a\u753b\u9762\u306b\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002\n\n" + lineUserId
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}