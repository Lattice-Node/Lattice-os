import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'メールアドレスが正しくありません' }, { status: 400 })
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } })
  } catch {
    return NextResponse.json({ error: 'すでに登録されています' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'Lattice <noreply@lattice-protocol.com>',
    to: email,
    subject: '【Lattice AI Morning】登録ありがとうございます',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #080b14; color: #e8eaf0;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 24px; color: #3b82f6; font-weight: 900;">◆ Lattice</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 900; margin-bottom: 12px; color: #e8eaf0;">登録ありがとうございます！</h1>
        <p style="color: #8b92a9; line-height: 1.8; margin-bottom: 24px;">
          毎朝8時に最新AIニュース・今日使えるプロンプト・AI活用ヒントをお届けします。
        </p>
        <div style="background: #0d1120; border: 1px solid #1c2136; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #8b92a9; margin-bottom: 8px;">毎朝届く内容</p>
          <ul style="color: #e8eaf0; font-size: 14px; line-height: 2; padding-left: 20px;">
            <li>今日のAIニュース3本（要点まとめ）</li>
            <li>今日使えるプロンプト1本</li>
            <li>AI活用ヒント</li>
          </ul>
        </div>
        <a href="https://www.lattice-protocol.com" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
          Latticeを今すぐ使う →
        </a>
        <p style="color: #4a5068; font-size: 12px; margin-top: 32px;">
          配信停止は返信メールにてお知らせください。
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}