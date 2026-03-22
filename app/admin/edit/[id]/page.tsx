import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BlogEditor from '../../components/BlogEditor'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">記事を編集</h1>
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