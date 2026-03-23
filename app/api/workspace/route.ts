import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id ?? session.user.email ?? ''

  const [workspace, logs] = await Promise.all([
    prisma.workSpace.findUnique({ where: { userId } }),
    prisma.workLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    }),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyIncome = logs
    .filter(l => new Date(l.date) >= startOfMonth)
    .reduce((sum, l) => sum + l.income, 0)

  const daysSinceStart = workspace
    ? Math.floor((now.getTime() - new Date(workspace.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return NextResponse.json({ workspace, logs, monthlyIncome, daysSinceStart })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id ?? session.user.email ?? ''
  const { jobType, monthlyTarget } = await req.json()

  const workspace = await prisma.workSpace.upsert({
    where: { userId },
    update: { jobType, monthlyTarget },
    create: { userId, jobType, monthlyTarget },
  })
  return NextResponse.json(workspace)
}