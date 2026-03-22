import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin()
  if (!ok) redirect('/api/auth/signin')
  return (
    <div style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif" }}>
      <header style={{ borderBottom: '1px solid #1c2136', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ color: '#4a5068', fontSize: 13, textDecoration: 'none' }}>← サイトへ戻る</a>
          <span style={{ color: '#1c2136' }}>|</span>
          <span style={{ fontWeight: 700, color: '#a78bfa' }}>Lattice Admin</span>
        </div>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/admin" style={{ color: '#8b92a9', fontSize: 13, textDecoration: 'none' }}>記事一覧</a>
          <a href="/admin/new" style={{ background: '#7c3aed', color: '#fff', fontSize: 13, padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>＋ 新規作成</a>
        </nav>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>{children}</main>
    </div>
  )
}