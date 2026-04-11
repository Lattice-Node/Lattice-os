import { NextResponse } from "next/server";
import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true, displayName: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { feedItemId, reason } = await req.json();
  if (!feedItemId || !reason) return NextResponse.json({ error: "feedItemId and reason required" }, { status: 400 });

  const item = await prisma.publicFeedItem.findUnique({
    where: { id: feedItemId },
    include: { user: { select: { displayName: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.feedReport.findFirst({
    where: { feedItemId, reporterId: user.id },
  });
  if (existing) return NextResponse.json({ ok: true, message: "Already reported" });

  await prisma.feedReport.create({
    data: { feedItemId, reporterId: user.id, reason },
  });

  try {
    await resend.emails.send({
      from: "Lattice <noreply@lattice-protocol.com>",
      to: "support@lattice-protocol.com",
      subject: `[通報] フィード投稿が通報されました`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="font-size:18px;margin-bottom:16px;">フィード投稿の通報</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#888;width:120px;">投稿ID</td><td style="padding:8px 0;">${feedItemId}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#888;">理由</td><td style="padding:8px 0;">${reason}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#888;">通報者</td><td style="padding:8px 0;">${user.displayName || user.id}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#888;">投稿者</td><td style="padding:8px 0;">${item.user.displayName || item.userId}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#888;">エージェント</td><td style="padding:8px 0;">${item.agentName}</td></tr>
          </table>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-top:16px;">
            <p style="font-size:12px;color:#888;margin:0 0 8px;">投稿内容（先頭500文字）:</p>
            <p style="font-size:13px;white-space:pre-wrap;">${item.resultText.slice(0, 500)}</p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error("[report] email failed:", e);
  }

  return NextResponse.json({ ok: true });
}
