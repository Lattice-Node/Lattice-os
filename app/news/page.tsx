@import "tailwindcss";

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
                AIニュース
              </h1>
              <p className="text-sm leading-relaxed text-slate-400">
                毎日のAIニュース要約が届きます。
              </p>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#2a2d35] bg-[#1a1d24] p-5">
            <p className="text-sm text-slate-500">まだ実行結果がありません。</p>
            <p className="mt-2 text-xs text-slate-600">
              マイAgentから「毎朝AIニュース要約」を実行してください。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}