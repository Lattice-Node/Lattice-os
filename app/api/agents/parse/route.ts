import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `あなたはユーザーの自然言語の指示をエージェント設定JSONに変換するAIです。

出力形式（JSONのみ・説明文不要）：
{
  "name": "エージェント名（20文字以内）",
  "description": "何をするエージェントか（50文字以内）",
  "trigger": "schedule" | "manual" | "webhook",
  "triggerCron": "cron式（scheduleの場合のみ・それ以外は空文字）",
  "prompt": "実行時にAIに与える詳細な指示（日本語）",
  "connections": []
}

cronの例：
・毎朝8時 → "0 8 * * *"
・毎週月曜9時 → "0 9 * * 1"
・毎時 → "0 * * * *"
・毎日正午 → "0 12 * * *"

JSONのみ返すこと。バッククォートや説明文は不要。`;

export async function POST(req: NextRequest) {
  const { input } = await req.json();
  if (!input?.trim()) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: input }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";

    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return NextResponse.json({ agent: parsed });
    } catch {
      return NextResponse.json({ error: "JSONパースに失敗しました", raw: text }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}