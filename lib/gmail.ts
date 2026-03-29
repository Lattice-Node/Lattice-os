import { prisma } from "@/lib/prisma";

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^---$/gm, '<hr>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

export async function getGmailToken(userId: string): Promise<string | null> {
  const connection = await prisma.userConnection.findFirst({
    where: { userId, provider: "gmail" },
  });

  if (!connection) return null;

  if (connection.expiresAt && connection.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return connection.accessToken;
  }

  if (!connection.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: connection.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await res.json();

  if (!tokens.access_token) {
    console.error("Gmail refresh failed:", tokens);
    return null;
  }

  await prisma.userConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: tokens.access_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });

  return tokens.access_token;
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const message = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    markdownToHtml(body),
  ].join("\r\n");

  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("Gmail send error:", err);
    return false;
  }

  return true;
}

export async function readGmailMessages(
  accessToken: string,
  maxResults: number = 5
): Promise<Array<{ from: string; subject: string; snippet: string; date: string }>> {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&labelIds=INBOX`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  if (!data.messages) return [];

  const emails = [];
  for (const msg of data.messages) {
    const detail = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const d = await detail.json();
    const headers = d.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: { name: string }) => h.name === name)?.value || "";

    emails.push({
      from: getHeader("From"),
      subject: getHeader("Subject"),
      snippet: d.snippet || "",
      date: getHeader("Date"),
    });
  }

  return emails;
}