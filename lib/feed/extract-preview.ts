/**
 * Strip markdown and extract a plain-text preview for feed cards.
 */
export function extractPreview(resultText: string, maxLength = 300): string {
  if (!resultText) return "";

  return resultText
    .replace(/^#{1,6}\s+.+$/gm, "")          // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")          // **bold**
    .replace(/\*(.+?)\*/g, "$1")              // *italic*
    .replace(/`(.+?)`/g, "$1")                // `code`
    .replace(/```[\s\S]*?```/g, "")           // code blocks
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")       // [link](url) → link
    .replace(/!\[.*?\]\(.+?\)/g, "")          // images
    .replace(/^[-*+]\s+/gm, "")              // list markers
    .replace(/^\d+\.\s+/gm, "")             // numbered lists
    .replace(/^>\s+/gm, "")                  // blockquotes
    .replace(/---+/g, "")                     // horizontal rules
    .replace(/\n{2,}/g, " ")                  // multiple newlines
    .replace(/\n/g, " ")                      // single newlines
    .replace(/\s+/g, " ")                     // consecutive spaces
    .trim()
    .slice(0, maxLength);
}
