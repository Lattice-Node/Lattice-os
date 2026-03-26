import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ agents: [] });

  const agents = await prisma.userAgent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: session.user.email, name: session.user.name ?? "" },
    });
  }

  const { name, description, prompt, trigger, triggerCron, connections } = await req.json();
  const agent = await prisma.userAgent.create({
    data: {
      userId: user.id,
      name,
      description: description ?? "",
      prompt,
      trigger,
      triggerCron: triggerCron ?? "",
      connections: connections ?? "[]",
    },
  });
  return NextResponse.json({ agent });
}