'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      router.replace('/work/space')
    } else {
      router.replace('/work/lp')
    }
  }, [session, status, router])

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5068' }}>
      読み込み中...
    </div>
  )
}