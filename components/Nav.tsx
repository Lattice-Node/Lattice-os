'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map(e => e.trim())

export default function Nav() {
  const { data: session } = useSession()
  const isAdmin = !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email)

  return (
    <nav style={{
      borderBottom: '1px solid #1c2136',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#080b14',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#e8eaf0' }}>
        <span style={{ fontSize: 20, color: '#3b82f6' }}>◆</span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: '#e8eaf0' }}>Lattice</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/work" style={{ fontSize: 13, color: '#34d399', textDecoration: 'none', fontWeight: 700 }}>Work</Link>
        <Link href="/marketplace" style={{ fontSize: 13, color: '#8b92a9', textDecoration: 'none' }}>プロンプト</Link>
        <Link href="/compare" style={{ fontSize: 13, color: '#8b92a9', textDecoration: 'none' }}>AI比較</Link>
        <Link href="/news" style={{ fontSize: 13, color: '#8b92a9', textDecoration: 'none' }}>ニュース</Link>
        <Link href="/blog" style={{ fontSize: 13, color: '#8b92a9', textDecoration: 'none' }}>ブログ</Link>
        {isAdmin && (
          <Link href="/admin" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>管理</Link>
        )}
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#8b92a9', textDecoration: 'none' }}>ダッシュボード</Link>
            <img src={session.user?.image ?? ''} style={{ width: 28, height: 28, borderRadius: '50%' }} alt="avatar" />
            <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: '#4a5068', fontSize: 12, cursor: 'pointer' }}>
              ログアウト
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, display: 'inline-block' }}>
            ログイン
          </Link>
        )}
      </div>
    </nav>
  )
}