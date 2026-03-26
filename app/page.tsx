import Link from "next/link";
import Nav from "@/components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lattice - Automate your work without code",
  description: "Build and run automation agents in plain language. No technical skills required.",
};

const TEMPLATES = [
  { id: "1", name: "Monitor competitor mentions", description: "Track when competitors are mentioned online and get daily summaries.", trigger: "Every morning at 8am", category: "Research" },
  { id: "2", name: "Weekly report generator", description: "Compile your week's activity into a structured report automatically.", trigger: "Every Friday at 5pm", category: "Productivity" },
  { id: "3", name: "New lead follow-up", description: "When a new inquiry arrives, draft a personalized response immediately.", trigger: "On new email", category: "Sales" },
  { id: "4", name: "Price change alert", description: "Monitor product prices and notify you when targets are reached.", trigger: "Every hour", category: "E-commerce" },
  { id: "5", name: "Social media digest", description: "Summarize trending discussions in your industry each morning.", trigger: "Every morning at 7am", category: "Marketing" },
  { id: "6", name: "Contract review assistant", description: "Analyze incoming contracts and flag unusual clauses for review.", trigger: "On new document", category: "Legal" },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        .template-card { background: #111111; transition: background 0.15s; }
        .template-card:hover { background: #161616; }
        .step-card { background: #111111; }
        .btn-secondary:hover { border-color: #333 !important; color: #aaa !important; }
        .nav-link:hover { color: #fff !important; }
      `}</style>
      <main style={{ background: "#0a0a0a", minHeight: "100vh", color: "#ffffff" }}>
        <Nav />

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "160px 24px 120px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, border: "1px solid #222222", marginBottom: 40, fontSize: 13, color: "#888888" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
            Now in public beta
          </div>
          <h1 style={{ fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 28, color: "#ffffff" }}>
            Automate anything.<br />
            <span style={{ color: "#444444" }}>No code required.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#888888", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7, letterSpacing: "-0.01em" }}>
            Describe what you want automated in plain language. Lattice builds and runs the agent for you.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 600, background: "#5b5fc7", color: "#ffffff", textDecoration: "none", letterSpacing: "-0.01em" }}>
              Start building free
            </Link>
            <Link href="#how-it-works" className="btn-secondary" style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 500, border: "1px solid #222222", color: "#888888", textDecoration: "none", letterSpacing: "-0.01em", transition: "all 0.15s" }}>
              See how it works
            </Link>
          </div>
        </section>

        {/* Demo */}
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 120px" }}>
          <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#333" }}></div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#333" }}></div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#333" }}></div>
              <span style={{ marginLeft: 8, fontSize: 12, color: "#444444", fontFamily: "monospace" }}>lattice.run / new-agent</span>
            </div>
            <div style={{ padding: "28px 24px" }}>
              <p style={{ fontSize: 12, color: "#444444", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Describe your automation</p>
              <div style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.6, padding: "16px", background: "#0a0a0a", borderRadius: 8, border: "1px solid #1a1a1a", minHeight: 80 }}>
                "Every morning, check my top 3 competitors' websites for new product launches and send me a summary to Slack."
              </div>
              <div style={{ marginTop: 16, padding: "16px", background: "#0d1117", borderRadius: 8, border: "1px solid #1a1a1a" }}>
                <p style={{ fontSize: 12, color: "#444444", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>Agent created</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Schedule", value: "Daily at 8:00 AM" },
                    { label: "Action", value: "Scrape 3 websites, compare against history" },
                    { label: "Output", value: "Slack #updates channel" },
                    { label: "Status", value: "Active", green: true },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#444444" }}>{item.label}</span>
                      <span style={{ color: item.green ? "#22c55e" : "#888888" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 120px" }}>
          <div style={{ marginBottom: 64 }}>
            <p style={{ fontSize: 12, color: "#444444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#ffffff", maxWidth: 480 }}>
              Three steps to full automation
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {[
              { step: "01", title: "Describe in plain language", description: "Write what you want to automate as if explaining to a colleague. No technical terminology needed." },
              { step: "02", title: "Lattice builds the agent", description: "The system translates your description into a working automation with the right schedule, logic, and connections." },
              { step: "03", title: "It runs while you work", description: "Your agent operates in the background on schedule. You get results, not process." },
            ].map((item) => (
              <div key={item.step} className="step-card" style={{ padding: "40px", border: "1px solid #1a1a1a" }}>
                <p style={{ fontSize: 13, color: "#5b5fc7", fontWeight: 600, marginBottom: 20, letterSpacing: "0.05em" }}>{item.step}</p>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", marginBottom: 12, letterSpacing: "-0.02em" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#666666", lineHeight: 1.7 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 120px" }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 12, color: "#444444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Templates</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#ffffff" }}>Start from a template</h2>
              <Link href="/agents" style={{ fontSize: 13, color: "#888888", textDecoration: "none" }}>View all →</Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1 }}>
            {TEMPLATES.map((template) => (
              <Link key={template.id} href="/agents/new" style={{ textDecoration: "none" }}>
                <div className="template-card" style={{ padding: "28px", border: "1px solid #1a1a1a", cursor: "pointer" }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#5b5fc7", padding: "3px 8px", borderRadius: 4, background: "#1a1b3a", letterSpacing: "0.02em" }}>
                      {template.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 8, letterSpacing: "-0.01em" }}>{template.name}</h3>
                  <p style={{ fontSize: 13, color: "#666666", lineHeight: 1.6, marginBottom: 16 }}>{template.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#333333", display: "inline-block" }}></span>
                    <span style={{ fontSize: 12, color: "#444444" }}>{template.trigger}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: "1px solid #1a1a1a", padding: "120px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#ffffff", marginBottom: 20 }}>
            Stop doing work<br /><span style={{ color: "#444444" }}>that can run itself.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#666666", marginBottom: 40 }}>Free to start. No credit card required.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "13px 32px", borderRadius: 8, fontSize: 15, fontWeight: 600, background: "#ffffff", color: "#0a0a0a", textDecoration: "none", letterSpacing: "-0.01em" }}>
            Get started free
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #1a1a1a", padding: "40px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7"/>
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.6"/>
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5b5fc7" opacity="0.3"/>
              </svg>
              <span style={{ fontSize: 14, color: "#444444" }}>Lattice</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: "#444444", textDecoration: "none" }}>Privacy</Link>
              <Link href="/terms" style={{ fontSize: 13, color: "#444444", textDecoration: "none" }}>Terms</Link>
            </div>
            <span style={{ fontSize: 13, color: "#333333" }}>© 2026 Lattice</span>
          </div>
        </footer>
      </main>
    </>
  );
}