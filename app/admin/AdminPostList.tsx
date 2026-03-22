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
      <p style={{ color: '#4a5068' }}>
        記事がまだありません。
        <a href="/admin/new" style={{ color: '#a78bfa', marginLeft: 4 }}>最初の記事を作成</a>
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {posts.map(post => (
        <div key={post.id} style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, background: post.published ? '#14532d' : '#1f2937', color: post.published ? '#86efac' : '#6b7280' }}>
                {post.published ? '公開中' : '下書き'}
              </span>
              <span style={{ fontSize: 11, color: '#4a5068' }}>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
            <p style={{ fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
            <p style={{ fontSize: 11, color: '#4a5068' }}>/blog/{post.slug}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href={`/blog/${post.slug}`} target="_blank" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #1c2136', color: '#8b92a9', textDecoration: 'none' }}>
              プレビュー
            </a>
            <a href={`/admin/edit/${post.id}`} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #4c1d95', color: '#a78bfa', textDecoration: 'none' }}>
              編集
            </a>
            <button
              onClick={() => handleDelete(post.id, post.title)}
              disabled={deleting === post.id}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #450a0a', color: '#f87171', background: 'transparent', cursor: 'pointer' }}
            >
              {deleting === post.id ? '削除中…' : '削除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}