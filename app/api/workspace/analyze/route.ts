import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id ?? session.user.email ?? ''

  const [workspace, logs] = await Promise.all([
    prisma.workSpace.findUnique({ where: { userId } }),
    prisma.workLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    }),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyIncome = logs
    .filter(l => new Date(l.date) >= startOfMonth)
    .reduce((sum, l) => sum + l.income, 0)

  const logSummary = logs.slice(0, 14).map(l =>
    `${new Date(l.date).toLocaleDateString('ja-JP')}：${l.content}${l.income > 0 ? `（¥${l.income}収益）` : ''}`
  ).join('\n')

  const prompt = `あなたはAI副業の専門コンサルタントです。以下のユーザーの副業活動を分析して、具体的なアドバイスを3つ提供してください。

副業の種類：${workspace?.jobType ?? '未設定'}
月収目標：¥${workspace?.monthlyTarget?.toLocaleString() ?? '0'}
今月の収益：¥${monthlyIncome.toLocaleString()}
副業開始からの日数：${workspace ? Math.floor((now.getTime() - new Date(workspace.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}日

直近の活動ログ：
${logSummary || 'まだログがありません'}

以下の形式で回答してください：
- 現状の評価（2文以内）
- 改善点1（具体的なアクション付き）
- 改善点2（具体的なアクション付き）
- 今週やるべきこと（3つ箇条書き）

300文字以内で簡潔に。`

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const analysis = res.content[0].type === 'text' ? res.content[0].text : ''
  return NextResponse.json({ analysis })
}