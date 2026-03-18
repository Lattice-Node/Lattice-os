import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { agentPrompt, agentName, agentId, task } = await req.json();

  if (!agentPrompt || !task) {
    return new Response(JSON.stringify({ error: "Missing agentPrompt or task" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // useCount++ (非同期・失敗しても続行)
  if (agentId) {
    prisma.agent.update({
      where: { id: agentId },
      data: { useCount: { increment: 1 } },
    }).catch(() => {});
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "status", message: `🤖 ${agentName} が起動しました...` });

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
            max_tokens: 2048,
            stream: true,
            messages: [
              { role: "system", content: agentPrompt },
              { role: "user", content: task },
            ],
          }),
        });

        if (!groqRes.ok || !groqRes.body) {
          send({ type: "error", message: "Groq API error: " + groqRes.statusText });
          controller.close();
          return;
        }

        send({ type: "status", message: "✍️ 生成中..." });

        const reader = groqRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.replace(/^data: /, "").trim();
            if (!trimmed || trimmed === "[DONE]") continue;

            try {
              const parsed = JSON.parse(trimmed);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) send({ type: "token", content: delta });
            } catch {
              // skip
            }
          }
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
