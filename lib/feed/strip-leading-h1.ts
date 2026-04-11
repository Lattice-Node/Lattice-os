/**
 * Removes the first line if it's an h1 (starts with "# ").
 * Used to prevent duplicate titles: the detail page shows `title` field
 * as the heading, so the resultText's own leading # becomes redundant.
 */
export function stripLeadingH1(resultText: string): string {
  if (!resultText) return "";
  const lines = resultText.split("\n");
  if (lines[0]?.trim().startsWith("# ")) {
    let i = 1;
    while (i < lines.length && lines[i].trim() === "") i++;
    return lines.slice(i).join("\n");
  }
  return resultText;
}
