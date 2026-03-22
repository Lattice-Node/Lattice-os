import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BlogEditor from '../../components/BlogEditor'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>記事を編集</h1>
      <BlogEditor
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description,
          content: post.content,
          published: post.published,
        }}
      />
    </div>
  )
}