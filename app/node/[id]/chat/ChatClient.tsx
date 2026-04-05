"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // body固定 + visualViewport対応
  useEffect(() => {
    const orig = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      top: document.body.style.top,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.top = "0";

    return () => {
      document.body.style.overflow = orig.overflow;
      document.body.style.position = orig.position;
      document.body.style.width = orig.width;
      document.body.style.height = orig.height;
      document.body.style.top = orig.top;
    };
  }, []);

  // visualViewport リサイズ（キーボード開閉）
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      document.documentElement.style.setProperty("--viewport-height", `${vv.height}px`);
      document.documentElement.style.setProperty("--keyboard-height", `${window.innerHeight - vv.height}px`);
      window.scrollTo(0, 0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
      document.documentElement.style.removeProperty("--viewport-height");
      document.documentElement.style.removeProperty("--keyboard-height");
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setError("");

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `サーバーエラー (${res.status})`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `tmp-${Date.now()}-a`,
        role: "assistant",
        content: data.message || "...",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      const totalMsgs = messages.length + 2;
      if (totalMsgs >= 10) {
        fetch(`/api/node/${nodeId}/diary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(() => {});
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "通信エラーが発生しました";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: errMsg, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "var(--viewport-height, 100dvh)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--bg)",
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          background: "var(--bg)",
        }}
      >
        <button
          onClick={() => router.push(`/node/${nodeId}`)}
          style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: "4px 8px" }}
        >
          ←
        </button>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success, #34d399)", boxShadow: "0 0 6px var(--success, #34d399)" }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{nodeName}</span>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
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
      <div
        style={{
          flexShrink: 0,
          padding: "10px 16px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 8,
          background: "var(--bg)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
          onFocus={() => { setTimeout(scrollToBottom, 300); }}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid var(--border-visible)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontSize: 16,
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
            flexShrink: 0,
          }}
        >
          送信
        </button>
      </div>
    </div>
  );
}
