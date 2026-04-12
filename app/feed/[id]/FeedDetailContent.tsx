"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import { stripLeadingH1 } from "@/lib/feed/strip-leading-h1";
import { LikeButton, ShareButton, XPostButton, ReportButton } from "./FeedActions";

type Props = {
  resultText: string;
  previewText: string;
  feedItemId: string;
  title: string;
  likeCount: number;
  viewCount: number;
  agent: { id: string; name: string; description: string; isPublic: boolean };
};

export function FeedDetailContent({ resultText, previewText, feedItemId, title, likeCount, viewCount, agent }: Props) {
  return (
    <>
      {/* Markdown body */}
      <div className="prose-lattice max-w-none" style={{ color: "var(--text-primary)", marginBottom: 24 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {stripLeadingH1(resultText)}
        </ReactMarkdown>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 16px" }} />

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <LikeButton feedItemId={feedItemId} initialCount={likeCount} initialLiked={false} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-disabled)", fontSize: 14, fontFamily: "'Space Mono', monospace", padding: "8px 12px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <span>{viewCount} ビュー</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <ShareButton id={feedItemId} title={title} />
        <XPostButton id={feedItemId} title={title} previewText={previewText} />
        <ReportButton feedItemId={feedItemId} />
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)", margin: "0 0 20px" }} />

      {/* Agent info */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px" }}>このエージェント</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-display)", margin: "0 0 4px" }}>{agent.name}</p>
        {agent.description && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>{agent.description}</p>
        )}
        {/* TODO: Link to template creation flow when available */}
        <Link href={`/agents/${agent.id}`} prefetch={false} style={{ display: "inline-block", padding: "10px 20px", background: "var(--btn-bg)", color: "var(--btn-text)", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "inherit" }}>
          このエージェントを見る
        </Link>
      </div>
    </>
  );
}
