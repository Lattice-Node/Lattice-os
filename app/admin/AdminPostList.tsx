'use client'
import { useState } from 'react'

type Post = { id: string; title: string; slug: string; published: boolean; createdAt: Date }

export default function AdminPostList({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？`)) return
    setDeleting(id)
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    setPosts(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  if (posts.length === 0) {
    return (
      <p className="text-gray-400">
        記事がまだありません。
        <a href="/admin/new" className="text-purple-400 underline ml-1">最初の記事を作成</a>
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.published ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {post.published ? '公開中' : '下書き'}
              </span>
              <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
            <p className="font-medium truncate">{post.title}</p>
            <p className="text-xs text-gray-500">/blog/{post.slug}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href={`/blog/${post.slug}`} target="_blank" className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:text-white">
              プレビュー
            </a>
            <a href={`/admin/edit/${post.id}`} className="text-xs px-3 py-1.5 rounded border border-purple-700 text-purple-400 hover:bg-purple-900">
              編集
            </a>
            <button
              onClick={() => handleDelete(post.id, post.title)}
              disabled={deleting === post.id}
              className="text-xs px-3 py-1.5 rounded border border-red-900 text-red-400 hover:bg-red-950 disabled:opacity-50"
            >
              {deleting === post.id ? '削除中…' : '削除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}