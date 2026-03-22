import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { title, slug, description, content, published } = await req.json()
  const post = await prisma.post.update({
    where: { id: params.id },
    data: { title, slug, description, content, published },
  })
  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}