import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [subscribers, latestNews, latestPrompt] = await Promise.all([
    prisma.newsletterSubscriber.findMany(),
    prisma.newsArticle.findMany({
      where: { lang: 'ja' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    }),
    prisma.agent.findFirst({
      where: { price: 0 },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true },
    }),
  ])

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const newsText = latestNews.slice(0, 3).map((n, i) =>
    `${i + 1}. ${n.title}（${n.source}）`
  ).join('\n')

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  const aiRes = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `今日（${today}）のAI活用ヒントを1つ、100文字以内で教えてください。実用的で今すぐ使えるものにしてください。タイトルと本文の形式で。`
    }],
  })
  const hint = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #080b14; color: #e8eaf0;">

      <div style="background: #0d1120; border-bottom: 1px solid #1c2136; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 20px; color: #3b82f6; font-weight: 900;">◆ Lattice</span>
        <span style="font-size: 12px; color: #4a5068;">AI Morning</span>
      </div>

      <div style="padding: 32px;">
        <p style="font-size: 13px; color: '#4a5068'; margin-bottom: 24px;">${today}</p>

        <h1 style="font-size: 20px; font-weight: 900; margin-bottom: 24px; color: #e8eaf0; letter-spacing: -0.02em;">
          今日のAI情報まとめ
        </h1>

        <!-- ニュース -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <div style="width: 4px; height: 16px; background: #3b82f6; border-radius: 2px;"></div>
            <h2 style="font-size: 14px; font-weight: 700; color: #60a5fa; margin: 0; letter-spacing: 0.05em;">TODAY'S AI NEWS</h2>
          </div>
          ${latestNews.slice(0, 3).map(n => `
            <a href="${n.url}" style="display: block; text-decoration: none; margin-bottom: 12px;">
              <div style="background: #0d1120; border: 1px solid #1c2136; border-radius: 10px; padding: 14px 16px;">
                <p style="font-size: 13px; color: #4a5068; margin-bottom: 4px;">${n.source}</p>
                <p style="font-size: 14px; font-weight: 600; color: #e8eaf0; margin: 0; line-height: 1.5;">${n.title}</p>
              </div>
            </a>
          `).join('')}
          <a href="https://www.lattice-protocol.com/news" style="font-size: 13px; color: #3b82f6; text-decoration: none;">
            すべてのニュースを見る →
          </a>
        </div>

        <!-- 今日使えるプロンプト -->
        ${latestPrompt ? `
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <div style="width: 4px; height: 16px; background: #34d399; border-radius: 2px;"></div>
            <h2 style="font-size: 14px; font-weight: 700; color: #34d399; margin: 0; letter-spacing: 0.05em;">TODAY'S PROMPT</h2>
          </div>
          <div style="background: #0d1a14; border: 1px solid #34d39930; border-radius: 10px; padding: 16px 20px;">
            <p style="font-size: 15px; font-weight: 700; color: #e8eaf0; margin-bottom: 6px;">${latestPrompt.name}</p>
            <p style="font-size: 13px; color: #8b92a9; margin-bottom: 12px; line-height: 1.6;">${latestPrompt.description}</p>
            <a href="https://www.lattice-protocol.com/apps/${latestPrompt.id}" style="display: inline-block; background: #34d399; color: #080b14; text-decoration: none; padding: '8px 16px'; border-radius: 6px; font-size: 13px; font-weight: 700;">
              今すぐ使う →
            </a>
          </div>
        </div>
        ` : ''}

        <!-- AIヒント -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <div style="width: 4px; height: 16px; background: #a78bfa; border-radius: 2px;"></div>
            <h2 style="font-size: 14px; font-weight: 700; color: #a78bfa; margin: 0; letter-spacing: 0.05em;">TODAY'S HINT</h2>
          </div>
          <div style="background: #0d0d1a; border: 1px solid #a78bfa30; border-radius: 10px; padding: 16px 20px;">
            <p style="font-size: 14px; color: #c8cad4; line-height: 1.8; margin: 0; white-space: pre-wrap;">${hint}</p>
          </div>
        </div>

        <a href="https://www.lattice-protocol.com" style="display: block; text-align: center; background: #2563eb; color: #fff; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 15px;">
          Latticeを開く →
        </a>
      </div>

      <div style="padding: 20px 32px; border-top: 1px solid #1c2136; text-align: center;">
        <p style="color: #4a5068; font-size: 12px; margin: 0;">
          © 2026 Lattice · <a href="https://www.lattice-protocol.com" style="color: #4a5068;">lattice-protocol.com</a>
        </p>
        <p style="color: #2a3050; font-size: 11px; margin-top: 8px;">配信停止をご希望の方は返信メールにてお知らせください</p>
      </div>
    </div>
  `

  let sent = 0
  for (const subscriber of subscribers) {
    try {
      await resend.emails.send({
        from: 'Lattice AI Morning <noreply@lattice-protocol.com>',
        to: subscriber.email,
        subject: `【Lattice AI Morning】${today}のAIニュース`,
        html,
      })
      sent++
    } catch {}
  }

  return NextResponse.json({ ok: true, sent })
}