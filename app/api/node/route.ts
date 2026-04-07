import { authAny } from "@/lib/auth-any";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, corsOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  const nodes = await prisma.node.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return jsonWithCors(req, { nodes: JSON.parse(JSON.stringify(nodes)) });
}

export async function POST(req: Request) {
  const session = await authAny(req);
  if (!session?.userId) {
    return jsonWithCors(req, { error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return jsonWithCors(req, { error: "Name is required" }, { status: 400 });
  }

  try {
    const node = await prisma.node.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : "",
      },
    });
    return jsonWithCors(req, { node });
  } catch (e) {
    console.error("[Node Create] Error:", e);
    return jsonWithCors(req, { error: "Nodeテーブルが未作成です。DBマイグレーションを実行してください。" }, { status: 500 });
  }
}
