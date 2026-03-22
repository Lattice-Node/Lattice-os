'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  mode: 'new' | 'edit'
  initialData?: {
    id: string
    title: string
    slug: string
    description: string
    content: string
    published: boolean
  }
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:600;margin:1rem 0 0.5rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.3rem;font-weight:700;margin:1.5rem 0 0.75rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.6rem;font-weight:800;margin:2rem 0 1rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#1e2235;padding:2px 6px;border-radius:4px;color:#f472b6">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:4px solid #7c3aed;padding-left:1rem;color:#9ca3af;font-style:italic">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:1.5rem;list-style:disc">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin-bottom:0.75rem">')
}

export default function BlogEditor({ mode, initialData }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleTitleChange = useCallback((v: string) => {
    setTitle(v)
    if (mode === 'new') setSlug(slugify(v))
  }, [mode])

  async function handleSave(pub: boolean) {
    if (!title || !slug || !content) {
      setError('タイトル・スラッグ・本文は必須です')
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = { title, slug, description, content, published: pub }
      const res = mode === 'new'
        ? await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch(`/api/admin/blog/${initialData!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '保存に失敗しました')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0d1120',
    border: '1px solid #1c2136',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#e8eaf0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#8b92a9', marginBottom: 6 }}>タイトル *</label>
        <input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="記事タイトル" style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#8b92a9', marginBottom: 6 }}>スラッグ（URL） *</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#4a5068', fontSize: 13, whiteSpace: 'nowrap' }}>/blog/</span>
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-article-slug" style={{ ...inputStyle, fontFamily: 'monospace' }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#8b92a9', marginBottom: 6 }}>説明文（SEO用）</label>
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="この記事の要約（150文字程度）" style={inputStyle} />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: '#8b92a9' }}>本文（Markdown） *</label>
          <button onClick={() => setPreview(p => !p)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #1c2136', background: 'transparent', color: '#8b92a9', cursor: 'pointer' }}>
            {preview ? '✏️ 編集' : '👁 プレビュー'}
          </button>
        </div>
        {preview ? (
          <div style={{ minHeight: 400, background: '#0d1120', border: '1px solid #1c2136', borderRadius: 8, padding: '20px 24px', fontSize: 14, lineHeight: 1.8, color: '#e8eaf0' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        ) : (
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={'# 見出し\n\n本文をMarkdownで書いてください。\n\n## 小見出し\n\n- リスト\n- アイテム\n\n**太字** や *イタリック* も使えます。'}
            rows={22} style={{ ...inputStyle, fontFamily: 'monospace', lineHeight: 1.7, resize: 'vertical' }} />
        )}
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #1c2136' }}>
        <a href="/admin" style={{ fontSize: 13, color: '#4a5068', textDecoration: 'none' }}>← キャンセル</a>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleSave(false)} disabled={saving}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #1c2136', background: 'transparent', color: '#8b92a9', cursor: 'pointer', fontSize: 13 }}>
            {saving ? '保存中…' : '下書き保存'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {saving ? '保存中…' : '公開する'}
          </button>
        </div>
      </div>
    </div>
  )
}