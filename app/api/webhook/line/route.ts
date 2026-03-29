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
        "Lattice Bot\u3078\u3088\u3046\u3053\u305d\uff01\n\nLattice\u306e\u8a2d\u5b9a\u753b\u9762\u304b\u3089LINE\u9023\u643a\u3092\u884c\u3046\u3068\u3001\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u306e\u5b9f\u884c\u7d50\u679c\u3092LINE\u3067\u53d7\u3051\u53d6\u308c\u307e\u3059\u3002\n\n\u9023\u643a\u7528\u30b3\u30fc\u30c9: " + lineUserId
      );
    }

    if (event.type === "message" && event.message?.type === "text") {
      const text = event.message.text || "";

      const conn = await prisma.userConnection.findFirst({
        where: { provider: "line", accessToken: lineUserId },
      });

      if (!conn) {
        await sendLineMessage(
          lineUserId,
          "Lattice\u3068\u672a\u9023\u643a\u3067\u3059\u3002\u8a2d\u5b9a\u753b\u9762\u304b\u3089LINE\u9023\u643a\u3092\u884c\u3063\u3066\u304f\u3060\u3055\u3044\u3002\n\u9023\u643a\u7528\u30b3\u30fc\u30c9: " + lineUserId
        );
        continue;
      }

      await prisma.agentLog.create({
        data: {
          agentId: "line-incoming",
          userId: conn.userId,
          status: "received",
          output: text,
          error: "",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}