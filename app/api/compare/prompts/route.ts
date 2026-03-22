import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()

  const freeAgents = await prisma.agent.findMany({
    where: { price: 0 },
    orderBy: { useCount: 'desc' },
    take: 20,
    select: { id: true, name: true, description: true, category: true, prompt: true, price: true },
  })

  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ agents: freeAgents })
  }

  const userId = session.user.id ?? session.user.email ?? ''

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    select: { agentId: true },
  })

  const purchasedIds = purchases.map(p => p.agentId)

  const purchasedAgents = purchasedIds.length > 0 ? await prisma.agent.findMany({
    where: { id: { in: purchasedIds }, price: { gt: 0 } },
    select: { id: true, name: true, description: true, category: true, prompt: true, price: true },
  }) : []

  const all = [...purchasedAgents, ...freeAgents]
  const unique = all.filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)

  return NextResponse.json({ agents: unique })
}