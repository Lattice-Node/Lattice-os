import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

async function askGPT(prompt: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  })
  return res.choices[0].message.content ?? ''
}

async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
  const res = await model.generateContent(prompt)
  return res.response.text()
}

async function askGrok(prompt: string): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'エラーが発生しました'
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  const start = Date.now()

  const [gpt, gemini, grok] = await Promise.allSettled([
    askGPT(prompt),
    askGemini(prompt),
    askGrok(prompt),
  ])

  const elapsed = Date.now() - start

  return NextResponse.json({
    elapsed,
    results: {
      gpt: gpt.status === 'fulfilled' ? gpt.value : 'エラー: ' + (gpt.reason?.message ?? '不明'),
      gemini: gemini.status === 'fulfilled' ? gemini.value : 'エラー: ' + (gemini.reason?.message ?? '不明'),
      grok: grok.status === 'fulfilled' ? grok.value : 'エラー: ' + (grok.reason?.message ?? '不明'),
    }
  })
}