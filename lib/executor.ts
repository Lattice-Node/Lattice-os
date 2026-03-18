export interface InstalledAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  authorName: string;
  price: number;
}

export interface ExecuteOptions {
  agent: InstalledAgent;
  task: string;
  onStatus?: (message: string) => void;
  onToken?: (token: string) => void;
  onDone?: (fullOutput: string) => void;
  onError?: (message: string) => void;
}

export async function executeAgent({
  agent,
  task,
  onStatus,
  onToken,
  onDone,
  onError,
}: ExecuteOptions): Promise<void> {
  let fullOutput = "";

  try {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: agent.id,
        agentPrompt: agent.prompt,
        agentName: agent.name,
        task,
      }),
    });

    if (!res.ok || !res.body) {
      onError?.("実行に失敗しました: " + res.statusText);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const chunk of lines) {
        const line = chunk.replace(/^data: /, "").trim();
        if (!line) continue;

        try {
          const data = JSON.parse(line);
          if (data.type === "status") onStatus?.(data.message);
          else if (data.type === "token") { fullOutput += data.content; onToken?.(data.content); }
          else if (data.type === "done") onDone?.(fullOutput);
          else if (data.type === "error") onError?.(data.message);
        } catch {
          // skip
        }
      }
    }
  } catch (err) {
    onError?.(String(err));
  }
}

export function getInstalledAgents(): InstalledAgent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("installedAgents") || "[]");
  } catch {
    return [];
  }
}

export function removeInstalledAgent(id: string): void {
  const agents = getInstalledAgents().filter((a) => a.id !== id);
  localStorage.setItem("installedAgents", JSON.stringify(agents));
}
