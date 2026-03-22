import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function askGPT(prompt: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  })
  return res.choices[0].message.content ?? ''
}

async function askGemini(prompt: string): Promise<string> {
  const res = await genAI.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    contents: prompt,
  })
  return res.text ?? ''
}

async function askClaude(prompt: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.content[0].type === 'text' ? res.content[0].text : ''
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  const start = Date.now()

  const [gpt, gemini, claude] = await Promise.allSettled([
    askGPT(prompt),
    askGemini(prompt),
    askClaude(prompt),
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