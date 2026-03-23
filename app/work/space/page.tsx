'use client'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Nav from '@/components/Nav'
import Link from 'next/link'

const JOB_TYPES = [
  'AIライティング',
  'AI画像生成',
  'AI活用コンサル',
  'プロンプト販売',
  'AIデータ分析',
  'AI翻訳・ローカライズ',
  'その他',
]

type WorkLog = {
  id: string
  content: string
  income: number
  date: string
}

type WorkSpace = {
  jobType: string
  monthlyTarget: number
}

export default function WorkSpacePage() {
  const { data: session, status } = useSession()
  const [workspace, setWorkspace] = useState<WorkSpace | null>(null)
  const [logs, setLogs] = useState<WorkLog[]>([])
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [daysSinceStart, setDaysSinceStart] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isSetup, setIsSetup] = useState(false)

  // Setup form
  const [jobType, setJobType] = useState('')
  const [monthlyTarget, setMonthlyTarget] = useState('')

  // Log form
  const [logContent, setLogContent] = useState('')
  const [logIncome, setLogIncome] = useState('')
  const [savingLog, setSavingLog] = useState(false)

  // Analysis
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status])

  async function fetchData() {
    setLoading(true)
    const res = await fetch('/api/workspace')
    const data = await res.json()
    setWorkspace(data.workspace)
    setLogs(data.logs ?? [])
    setMonthlyIncome(data.monthlyIncome ?? 0)
    setDaysSinceStart(data.daysSinceStart ?? 0)
    if (!data.workspace) setIsSetup(true)
    setLoading(false)
  }

  async function handleSetup() {
    if (!jobType || !monthlyTarget) return
    await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobType, monthlyTarget: parseInt(monthlyTarget) }),
    })
    setIsSetup(false)
    fetchData()
  }

  async function handleSaveLog() {
    if (!logContent.trim()) return
    setSavingLog(true)
    await fetch('/api/workspace/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: logContent, income: parseInt(logIncome) || 0 }),
    })
    setLogContent('')
    setLogIncome('')
    setSavingLog(false)
    fetchData()
  }

  async function handleDeleteLog(id: string) {
    await fetch('/api/workspace/logs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  async function handleAnalyze() {
    setAnalyzing(true)
    setAnalysis('')
    const res = await fetch('/api/workspace/analyze', { method: 'POST' })
    const data = await res.json()
    setAnalysis(data.analysis)
    setAnalyzing(false)
  }

  if (status === 'unauthenticated') {
    return (
      <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 480, margin: '120px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🔒</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>ログインが必要です</h1>
          <p style={{ color: '#8b92a9', marginBottom: 32 }}>Lattice Work Spaceはログイン済みユーザー専用です</p>
          <button onClick={() => signIn()} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            ログインして始める
          </button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif" }}>
        <Nav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#4a5068' }}>読み込み中...</div>
      </main>
    )
  }

  if (isSetup) {
    return (
      <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif" }}>
        <Nav />
        <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Lattice Work Spaceへようこそ</h1>
            <p style={{ color: '#8b92a9', fontSize: 14 }}>最初に副業の目標を設定しましょう</p>
          </div>

          <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 16, padding: '32px' }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#8b92a9', marginBottom: 10, fontWeight: 600 }}>どの副業をやりますか？</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {JOB_TYPES.map(type => (
                  <button key={type} onClick={() => setJobType(type)}
                    style={{ padding: '10px', borderRadius: 8, border: jobType === type ? '2px solid #3b82f6' : '1px solid #1c2136', background: jobType === type ? '#1a2a4a' : '#080b14', color: jobType === type ? '#60a5fa' : '#8b92a9', cursor: 'pointer', fontSize: 13, fontWeight: jobType === type ? 700 : 400 }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#8b92a9', marginBottom: 8, fontWeight: 600 }}>月収目標はいくらですか？</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#4a5068' }}>¥</span>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={e => setMonthlyTarget(e.target.value)}
                  placeholder="30000"
                  style={{ flex: 1, background: '#080b14', border: '1px solid #1c2136', borderRadius: 8, padding: '10px 14px', color: '#e8eaf0', fontSize: 16, fontWeight: 700, outline: 'none' }}
                />
                <span style={{ color: '#4a5068' }}>円/月</span>
              </div>
            </div>

            <button onClick={handleSetup} disabled={!jobType || !monthlyTarget}
              style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: jobType && monthlyTarget ? '#2563eb' : '#1c2136', color: jobType && monthlyTarget ? '#fff' : '#4a5068', fontSize: 15, fontWeight: 700, cursor: jobType && monthlyTarget ? 'pointer' : 'not-allowed' }}>
              スペースを作成する →
            </button>
          </div>
        </div>
      </main>
    )
  }

  const progress = workspace?.monthlyTarget ? Math.min(100, Math.round((monthlyIncome / workspace.monthlyTarget) * 100)) : 0

  return (
    <main style={{ minHeight: '100vh', background: '#080b14', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif" }}>
      <Nav />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* ヘッダー */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <span style={{ fontSize: 12, color: '#34d399', fontWeight: 700, letterSpacing: '0.05em' }}>LATTICE WORK SPACE</span>
              <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
                {session?.user?.name?.split(' ')[0]}さんの副業スペース
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: '#4a5068' }}>副業開始から</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#e8eaf0' }}>{daysSinceStart}日目</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
          {/* 今月の収益 */}
          <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 14, padding: '20px' }}>
            <p style={{ fontSize: 12, color: '#4a5068', marginBottom: 8 }}>今月の収益</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#34d399', marginBottom: 8 }}>¥{monthlyIncome.toLocaleString()}</p>
            <div style={{ background: '#1c2136', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', background: '#34d399', borderRadius: 99, width: `${progress}%`, transition: 'width 0.5s' }} />
            </div>
            <p style={{ fontSize: 11, color: '#4a5068' }}>目標 ¥{workspace?.monthlyTarget?.toLocaleString()} の {progress}%</p>
          </div>

          {/* 副業の種類 */}
          <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 14, padding: '20px' }}>
            <p style={{ fontSize: 12, color: '#4a5068', marginBottom: 8 }}>副業の種類</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#e8eaf0', marginBottom: 8 }}>{workspace?.jobType}</p>
            <button onClick={() => setIsSetup(true)}
              style={{ fontSize: 11, color: '#4a5068', background: 'none', border: '1px solid #1c2136', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
              変更する
            </button>
          </div>

          {/* 活動日数 */}
          <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 14, padding: '20px' }}>
            <p style={{ fontSize: 12, color: '#4a5068', marginBottom: 8 }}>今月の活動日数</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6', marginBottom: 8 }}>
              {logs.filter(l => new Date(l.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length}日
            </p>
            <p style={{ fontSize: 11, color: '#4a5068' }}>合計ログ {logs.length}件</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* 左カラム */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 今日のログ入力 */}
            <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 14, padding: '24px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>今日の活動を記録する</h2>
              <textarea
                value={logContent}
                onChange={e => setLogContent(e.target.value)}
                placeholder="今日やったことを入力（例：クラウドワークスに3件応募した）"
                rows={3}
                style={{ width: '100%', background: '#080b14', border: '1px solid #1c2136', borderRadius: 8, padding: '12px 14px', color: '#e8eaf0', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: '#4a5068', whiteSpace: 'nowrap' }}>収益（任意）¥</span>
                <input
                  type="number"
                  value={logIncome}
                  onChange={e => setLogIncome(e.target.value)}
                  placeholder="0"
                  style={{ width: 100, background: '#080b14', border: '1px solid #1c2136', borderRadius: 8, padding: '8px 12px', color: '#e8eaf0', fontSize: 14, outline: 'none' }}
                />
                <button onClick={handleSaveLog} disabled={savingLog || !logContent.trim()}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: logContent.trim() ? '#2563eb' : '#1c2136', color: logContent.trim() ? '#fff' : '#4a5068', fontSize: 13, fontWeight: 700, cursor: logContent.trim() ? 'pointer' : 'not-allowed' }}>
                  {savingLog ? '保存中...' : '保存する'}
                </button>
              </div>
            </div>

            {/* AI分析 */}
            <div style={{ background: '#0d1120', border: '1px solid #a78bfa30', borderRadius: 14, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>AI参謀に相談する</h2>
                <button onClick={handleAnalyze} disabled={analyzing || logs.length === 0}
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: logs.length > 0 ? '#7c3aed' : '#1c2136', color: logs.length > 0 ? '#fff' : '#4a5068', fontSize: 13, fontWeight: 700, cursor: logs.length > 0 ? 'pointer' : 'not-allowed' }}>
                  {analyzing ? '分析中...' : '活動を分析する'}
                </button>
              </div>
              {logs.length === 0 && (
                <p style={{ fontSize: 13, color: '#4a5068' }}>ログを記録するとAIが活動を分析してアドバイスを提供します</p>
              )}
              {analysis && (
                <div style={{ fontSize: 13, color: '#c8cad4', lineHeight: 1.8, whiteSpace: 'pre-wrap', background: '#080b14', borderRadius: 8, padding: '16px' }}>
                  {analysis}
                </div>
              )}
            </div>
          </div>

          {/* 右カラム：活動履歴 */}
          <div style={{ background: '#0d1120', border: '1px solid #1c2136', borderRadius: 14, padding: '24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>活動履歴</h2>
            {logs.length === 0 ? (
              <p style={{ fontSize: 13, color: '#4a5068', textAlign: 'center', padding: '40px 0' }}>まだログがありません</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ background: '#080b14', border: '1px solid #1c2136', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: '#e8eaf0', marginBottom: 4, lineHeight: 1.5 }}>{log.content}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: '#4a5068' }}>
                            {new Date(log.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                          </span>
                          {log.income > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>+¥{log.income.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLog(log.id)}
                        style={{ background: 'none', border: 'none', color: '#4a5068', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* おすすめプロンプト */}
        <div style={{ marginTop: 24, background: '#0d1120', border: '1px solid #2563eb30', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>副業に使えるプロンプトを探す</p>
            <p style={{ fontSize: 12, color: '#8b92a9' }}>{workspace?.jobType}に特化したプロンプトが見つかります</p>
          </div>
          <Link href="/marketplace" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
            プロンプトを探す →
          </Link>
        </div>
      </div>
    </main>
  )
}