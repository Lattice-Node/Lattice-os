import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import PushNotificationSetup from "@/components/PushNotificationSetup";
import BottomNav from "@/components/BottomNav";
import NavDebug from "@/components/NavDebug";
import NetworkStatus from "@/components/NetworkStatus";
import MorningBriefingSetup from "@/components/MorningBriefingSetup";

export const metadata: Metadata = {
  title: "Lattice - 自然言語で動くAIエージェント",
  description: "話しかけるだけで業務を自動化。技術知識ゼロで使えるノーコード自動化プラットフォーム。",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Lattice" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  function showErr(label, msg, stack){
    try{
      var d=document.getElementById('__early_err__');
      if(!d){
        d=document.createElement('div');
        d.id='__early_err__';
        d.style.cssText='position:fixed;inset:0;background:#000;color:#fff;padding:60px 16px 16px;font:11px monospace;overflow:auto;z-index:999999;white-space:pre-wrap;word-break:break-word';
        document.body.appendChild(d);
      }
      d.textContent += '\\n['+label+'] '+msg+'\\n'+(stack||'')+'\\n---\\n';
    }catch(e){}
  }
  window.addEventListener('error', function(e){
    showErr('window.error', (e.message||'?')+' @ '+(e.filename||'?')+':'+(e.lineno||'?'), e.error&&e.error.stack);
  });
  window.addEventListener('unhandledrejection', function(e){
    var r=e.reason;
    showErr('unhandledrejection', (r&&r.message)||String(r), r&&r.stack);
  });
})();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 999998, padding: "2px 6px", background: "#222", color: "#0f0", fontSize: 9, fontFamily: "monospace", pointerEvents: "none" }}>
          BUILD: dbg-3315c9c
        </div>
        <Providers>
          <NavDebug />
          <div className="app-shell">{children}</div>
          <BottomNav />
          <PushNotificationSetup />
          <NetworkStatus />
          <MorningBriefingSetup />
        </Providers>
      </body>
    </html>
  );
}
