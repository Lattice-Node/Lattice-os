'use client'
import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    if (!email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? 'エラーが発生しました')
        setStatus('error')
        return
      }
      setStatus('success')
      setMessage('登録完了！毎朝8時にお届けします')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('通信エラーが発生しました')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '20px', background: '#0d1a14', border: '1px solid #34d39930', borderRadius: 12 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>登録完了！</p>
        <p style={{ fontSize: 13, color: '#8b92a9' }}>毎朝8時にAIニュースをお届けします</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f614', border: '1px solid #3b82f630', borderRadius: 100, padding: '4px 12px', fontSize: 11, color: '#60a5fa', marginBottom: 16, fontWeight: 600, letterSpacing: '0.05em' }}>
        毎朝8時配信
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Lattice AI Morning
      </h2>
      <p style={{ fontSize: 13, color: '#8b92a9', marginBottom: 24, lineHeight: 1.7 }}>
        今日のAIニュース・使えるプロンプト・AI活用ヒントを<br />毎朝メールでお届けします。無料。
      </p>
      <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="your@email.com"
          style={{ flex: 1, background: '#080b14', border: '1px solid #1c2136', borderRadius: 8, padding: '11px 14px', color: '#e8eaf0', fontSize: 14, outline: 'none' }}
        />
        <button onClick={handleSubmit} disabled={status === 'loading' || !email.includes('@')}
          style={{ padding: '11px 20px', borderRadius: 8, border: 'none', background: email.includes('@') ? '#2563eb' : '#1c2136', color: email.includes('@') ? '#fff' : '#4a5068', fontSize: 14, fontWeight: 700, cursor: email.includes('@') ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
          {status === 'loading' ? '登録中...' : '無料登録'}
        </button>
      </div>
      {message && status === 'error' && (
        <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{message}</p>
      )}
      <p style={{ fontSize: 11, color: '#2a3050', marginTop: 12 }}>いつでも解除できます</p>
    </div>
  )
}