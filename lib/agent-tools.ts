// Tool definitions for Lattice AI agents (Phase 2 - Tool Use)
// These are client-side tools that Claude can invoke during execution.
// The agent-executor loop handles tool_use → execute → tool_result cycling.

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

// URL fetch tool - available for all paid plans
export const fetchUrlTool: ToolDefinition = {
  name: "fetch_url",
  description: "指定したURLのWebページの内容を取得します。ニュース記事、ブログ、ドキュメントなどの本文を読み取れます。",
  input_schema: {
    type: "object",
    properties: {
      url: { type: "string", description: "取得するWebページのURL" },
    },
    required: ["url"],
  },
};

// Gmail send tool - available for starter+ plans with Gmail connection
export const sendGmailTool: ToolDefinition = {
  name: "send_gmail",
  description: "Gmail経由でメールを送信します。宛先、件名、本文を指定してください。",
  input_schema: {
    type: "object",
    properties: {
      to: { type: "string", description: "送信先メールアドレス" },
      subject: { type: "string", description: "メールの件名" },
      body: { type: "string", description: "メールの本文" },
    },
    required: ["to", "subject", "body"],
  },
};

// Get available tools based on user plan and connections
export function getAvailableTools(
  plan: string,
  role: string,
  connections: string[]
): ToolDefinition[] {
  // Lazy import to avoid circular deps in some build paths
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getPlanLimits } = require("@/lib/plan-limits");
  const limits = getPlanLimits(plan, role);

  if (!limits.toolUse) return []; // Free plan: no client tools

  const tools: ToolDefinition[] = [fetchUrlTool];

  if (connections.includes("gmail")) {
    tools.push(sendGmailTool);
  }

  return tools;
}

// Execute a tool and return the result
export async function executeTool(
  toolName: string,
  toolInput: Record<string, string>,
  context: {
    userId: string;
    gmailToken?: string | null;
    sendGmailFn?: (token: string, to: string, subject: string, body: string) => Promise<unknown>;
  }
): Promise<string> {
  switch (toolName) {
    case "fetch_url": {
      const url = toolInput.url;
      if (!url) return "Error: URL is required";
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "LatticeBot/1.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return `Error: HTTP ${res.status} ${res.statusText}`;
        const html = await res.text();
        // Extract text content (strip HTML tags, limit length)
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000);
        return text || "Error: No text content found";
      } catch (err) {
        return `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    case "send_gmail": {
      const { to, subject, body } = toolInput;
      if (!to || !subject || !body) return "Error: to, subject, body are required";
      if (!context.gmailToken || !context.sendGmailFn) return "Error: Gmail is not connected";
      try {
        await context.sendGmailFn(context.gmailToken, to, subject, body);
        return `メールを送信しました: ${to} / 件名: ${subject}`;
      } catch (err) {
        return `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    default:
      return `Error: Unknown tool: ${toolName}`;
  }
}
