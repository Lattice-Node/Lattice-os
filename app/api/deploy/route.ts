import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "Lattice-Node";
const REPO_NAME = "Lattice-os";
const DEPLOY_SECRET = process.env.DEPLOY_SECRET ?? "lattice-deploy-2026";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-deploy-secret");
  if (auth !== DEPLOY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path, content, message } = await req.json();

  if (!path || !content || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const getSha = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" } }
  );

  let sha: string | undefined;
  if (getSha.ok) {
    const data = await getSha.json();
    sha = data.sha;
  }

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: "main",
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ success: true, path, message });
}