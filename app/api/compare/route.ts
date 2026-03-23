import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_BASE = `回答は必ず以下のルールを守ってください：
- 日本語で回答する
- 300文字以内で簡潔にまとめる
- 箇条書きは最大3つまで
- Markdownの記号（**や##など）は使わない
- 読みやすいシンプルなテキストで回答する`

async function askGPT(system: string, prompt: string): Promise<string> {
  const finalSystem = system ? `${system}\n\n${SYSTEM_BASE}` : SYSTEM_BASE
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: finalSystem },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
  })
  return res.choices[0].message.content ?? ''
}

async function askGemini(system: string, prompt: string): Promise<string> {
  const content = `${system ? system + '\n\n' : ''}${SYSTEM_BASE}\n\n${prompt}`
  const res = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: content,
  })
  return res.text ?? ''
}

async function askClaude(system: string, prompt: string): Promise<string> {
  const finalSystem = system ? `${system}\n\n${SYSTEM_BASE}` : SYSTEM_BASE
  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: finalSystem,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.content[0].type === 'text' ? res.content[0].text : ''
}

export async function POST(req: NextRequest) {
  const { prompt, agentId } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  let systemPrompt = ''
  if (agentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { prompt: true },
    })
    if (agent?.prompt) systemPrompt = agent.prompt
  }

  const start = Date.now()
  const [gpt, gemini, claude] = await Promise.allSettled([
    askGPT(systemPrompt, prompt),
    askGemini(systemPrompt, prompt),
    askClaude(systemPrompt, prompt),
  ])
  const elapsed = Date.now() - start

  return NextResponse.json({
    elapsed,
    results: {
      gpt: gpt.status === 'fulfilled' ? gpt.value : 'エラー: ' + (gpt.reason?.message ?? '不明'),
      gemini: gemini.status === 'fulfilled' ? gemini.value : 'エラー: ' + (gemini.reason?.message ?? '不明'),
      claude: claude.status === 'fulfilled' ? claude.value : 'エラー: ' + (claude.reason?.message ?? '不明'),
    }
  })
}