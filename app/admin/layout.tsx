import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin()
  if (!ok) redirect('/api/auth/signin')
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white text-sm">← サイトへ戻る</a>
          <span className="text-gray-600">|</span>
          <span className="font-semibold text-purple-400">Lattice Admin</span>
        </div>
        <nav className="flex gap-4 text-sm">
          <a href="/admin" className="text-gray-300 hover:text-white">記事一覧</a>
          <a href="/admin/new" className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded-md text-white">＋ 新規作成</a>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}