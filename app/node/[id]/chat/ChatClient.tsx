"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Props {
  nodeId: string;
  nodeName: string;
  initialMessages: Message[];
}

export default function ChatClient({ nodeId, nodeName, initialMessages }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: `tmp-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/node/${nodeId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: `tmp-${Date.now()}-a`,
        role: "assistant",
        content: data.message || "...",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // 日記生成トリガー（5往復以上で非同期）
      const totalMsgs = messages.length + 2;
      if (totalMsgs >= 10) {
        fetch(`/api/node/${nodeId}/diary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(() => {});
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "通信エラーが発生しました", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => router.push(`/node/${nodeId}`)}
          style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          ←
        </button>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success, #34d399)", boxShadow: "0 0 6px var(--success, #34d399)" }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{nodeName}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-disabled)" }}>
            <p style={{ fontSize: 14, margin: 0 }}>最初のメッセージを送ってみましょう</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "var(--accent)" : "var(--surface)",
              color: m.role === "user" ? "#fff" : "var(--text-primary)",
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "var(--surface)", fontSize: 14, color: "var(--text-disabled)" }}>
            考え中...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0, paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid var(--border-visible)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: sending ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: sending || !input.trim() ? 0.5 : 1,
          }}
        >
          送信
        </button>
      </div>
    </div>
  );
}
