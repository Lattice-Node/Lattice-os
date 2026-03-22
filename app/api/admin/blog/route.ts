import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { title, slug, description, content, published } = await req.json()
  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const post = await prisma.post.create({
    data: { title, slug, description: description ?? '', content, published: published ?? false },
  })
  return NextResponse.json(post, { status: 201 })
}