"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        padding: "60px 20px 20px",
        fontFamily: "monospace",
        fontSize: 12,
        overflowY: "auto",
        zIndex: 99999,
      }}
    >
      <h1 style={{ fontSize: 16, marginBottom: 12, color: "#ff5555" }}>
        Client Error
      </h1>
      <div style={{ marginBottom: 8, color: "#ffcc00" }}>
        <strong>Message:</strong>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: 16 }}>
        {error?.message || "(no message)"}
      </pre>
      <div style={{ marginBottom: 8, color: "#ffcc00" }}>
        <strong>Name:</strong> {error?.name || "(unknown)"}
      </div>
      {error?.digest && (
        <div style={{ marginBottom: 8, color: "#ffcc00" }}>
          <strong>Digest:</strong> {error.digest}
        </div>
      )}
      <div style={{ marginBottom: 8, color: "#ffcc00" }}>
        <strong>Stack:</strong>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 10, marginBottom: 16 }}>
        {error?.stack || "(no stack)"}
      </pre>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 20px",
          background: "#fff",
          color: "#000",
          border: "none",
          borderRadius: 6,
          fontSize: 14,
          marginRight: 10,
        }}
      >
        Retry
      </button>
      <button
        onClick={() => (window.location.href = "/home/")}
        style={{
          padding: "10px 20px",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        Go to Login
      </button>
    </div>
  );
}
