import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id ?? session.user.email ?? ''
  const { content, income } = await req.json()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const log = await prisma.workLog.create({
    data: { userId, content, income: income ?? 0 },
  })
  return NextResponse.json(log)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  await prisma.workLog.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}