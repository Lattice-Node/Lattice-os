"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Exchange {
  id: string;
  userMessage: string;
  nodeResponse: string;
  createdAt: string;
}

interface Props {
  nodeId: string;
  nodeName: string;
  latestExchange: Exchange | null;
}

export default function TalkClient({ nodeId, nodeName, latestExchange }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [nodeResponse, setNodeResponse] = useState(latestExchange?.nodeResponse || "");
  const [displayedResponse, setDisplayedResponse] = useState(latestExchange?.nodeResponse || "");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const nodeCardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // body固定
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.top = "0";
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.top = "";
    };
  }, []);

  // visualViewport
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const handleResize = () => {
      const vh = window.visualViewport!.height;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      window.scrollTo(0, 0);
    };
    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    handleResize();
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
      document.documentElement.style.removeProperty("--vh");
    };
  }, []);

  // タイピングアニメーション
  useEffect(() => {
    if (!isTyping || !nodeResponse) return;
    setDisplayedResponse("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedResponse(nodeResponse.slice(0, i));
      if (i >= nodeResponse.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [nodeResponse, isTyping]);

  // Nodeカードスクロール
  useEffect(() => {
    if (nodeCardRef.current) {
      nodeCardRef.current.scrollTop = nodeCardRef.current.scrollHeight;
    }
  }, [displayedResponse]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setError("");
    setSending(true);
    setDisplayedResponse("");
    setNodeResponse("");

    try {
      const res = await fetch(`/api/node/${nodeId}/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `エラー (${res.status})`);
      }

      const data = await res.json();
      setInput("");
      setNodeResponse(data.response);
      setIsTyping(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
    } finally {
      setSending(false);
    }
  }, [input, sending, nodeId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        height: "var(--vh, 100dvh)",
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
          padding: "10px 16px",
          paddingTop: "calc(10px + env(safe-area-inset-top, 0px))",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.push(`/node/${nodeId}`)}
          style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 16, cursor: "pointer", fontFamily: "inherit", padding: "4px 8px" }}
        >
          ←
        </button>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success, #34d399)", boxShadow: "0 0 6px var(--success, #34d399)" }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>{nodeName}</span>
      </div>

      {/* Node Response Card */}
      <div style={{ flex: 1, padding: "8px 16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div
          ref={nodeCardRef}
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "20px",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            display: "flex",
            flexDirection: "column",
            justifyContent: displayedResponse ? "flex-start" : "center",
            alignItems: displayedResponse ? "flex-start" : "center",
          }}
        >
          {sending && !displayedResponse ? (
            <p style={{ fontSize: 14, color: "var(--text-disabled)", margin: 0, fontFamily: "'Space Mono', monospace" }}>
              考え中...
            </p>
          ) : displayedResponse ? (
            <p style={{
              fontSize: 15,
              color: "var(--text-primary)",
              lineHeight: 1.8,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {displayedResponse}
              {isTyping && <span style={{ opacity: 0.5, animation: "blink 1s infinite" }}>|</span>}
            </p>
          ) : (
            <p style={{ fontSize: 14, color: "var(--text-disabled)", margin: 0, textAlign: "center" }}>
              話しかけてみましょう
            </p>
          )}
        </div>
      </div>

      {/* User Input Card */}
      <div
        style={{
          flexShrink: 0,
          padding: "8px 16px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {error && (
          <p style={{ fontSize: 12, color: "var(--accent)", margin: "0 0 8px", textAlign: "center" }}>{error}</p>
        )}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "12px 14px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
            onFocus={() => setTimeout(() => window.scrollTo(0, 0), 100)}
            placeholder="メッセージを入力..."
            disabled={sending}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: 16,
              fontFamily: "inherit",
              outline: "none",
              padding: 0,
            }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: sending || !input.trim() ? "var(--border)" : "var(--accent)",
              color: "#fff",
              fontSize: 16,
              cursor: sending ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
