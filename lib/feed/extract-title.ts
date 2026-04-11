/**
 * Extract a display title from AI-generated markdown output.
 * Falls back to agentName if no heading is found.
 */
export function extractTitle(resultText: string, agentName: string): string {
  if (!resultText) return agentName;

  // Try # heading first
  const h1 = resultText.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim().slice(0, 100);

  // Try ## heading
  const h2 = resultText.match(/^##\s+(.+)$/m);
  if (h2) return h2[1].trim().slice(0, 100);

  // First non-empty line (strip markdown)
  const firstLine = resultText
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);

  if (firstLine) {
    const clean = firstLine
      .replace(/^#+\s*/, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .trim();
    if (clean.length > 0) return clean.slice(0, 100);
  }

  return agentName;
}
