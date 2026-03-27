export const dynamic = "force-dynamic";

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#111318] text-white">
      <div className="mx-auto w-full max-w-[420px] px-4 pb-28 pt-6">
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Inbox
            </p>
            <div className="space-y-2">
              <h1 className="text-[32px] font-semibold tracking-tight text-white">
                毎日のAIニュース
              </h1>
              <p className="text-sm leading-7 text-slate-400">
                これは反映確認用の簡易ページです。
              </p>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#2a2d35] bg-[#1a1d24] p-5">
            <h2 className="text-base font-semibold text-white">反映チェック</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              このカードUIが見えたら、/news の更新は成功です。
            </p>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="rounded-[24px] border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-xs text-slate-500">状態</p>
              <p className="mt-2 text-sm font-semibold text-white">OK</p>
            </div>
            <div className="rounded-[24px] border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-xs text-slate-500">配信先</p>
              <p className="mt-2 text-sm font-semibold text-white">アプリ内</p>
            </div>
            <div className="rounded-[24px] border border-[#2a2d35] bg-[#1a1d24] p-4">
              <p className="text-xs text-slate-500">ナビ名</p>
              <p className="mt-2 text-sm font-semibold text-white">受信箱</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}