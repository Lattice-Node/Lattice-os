import { prisma } from '@/lib/prisma'
import AdminPostList from './AdminPostList'

export default async function AdminPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, published: true, createdAt: true },
  })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ブログ記事管理</h1>
      <AdminPostList posts={posts} />
    </div>
  )
}