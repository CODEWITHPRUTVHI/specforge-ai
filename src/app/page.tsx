"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            SpecForge<span className="text-indigo-400"> AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          AI Co-Founder for First-Time Founders
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl">
          Stop being{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            stuck.
          </span>
          <br />
          Start shipping.
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Paste your problem. Get a diagnosis, a{" "}
          <span className="text-slate-200 font-medium">TODAY action plan</span>,
          and real resources — in under 3 seconds. Tailored to your stack,
          stage, and geography.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/auth/signup"
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
          >
            Get unstuck for free →
          </Link>
          <Link
            href="/auth/login"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            I already have an account
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            {
              icon: "🔍",
              title: "Instant Diagnosis",
              desc: "Know exactly why you're stuck — using your actual context.",
            },
            {
              icon: "📋",
              title: "TODAY Action Plan",
              desc: "Max 3 timed actions. No overwhelm. Just forward motion.",
            },
            {
              icon: "🔗",
              title: "Real Resources",
              desc: "Official docs and tools. No hallucinations, no fluff.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition-colors"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-8">
            Solves problems across every founder category
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Technical", emoji: "💻", color: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
              { label: "Product", emoji: "🎨", color: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
              { label: "Operational", emoji: "⚙️", color: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
              { label: "Growth", emoji: "📈", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
              { label: "Financial", emoji: "💰", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
              { label: "Personal", emoji: "❤️", color: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
            ].map((c) => (
              <span
                key={c.label}
                className={`badge border ${c.color}`}
              >
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/5 text-center text-slate-600 text-xs">
        © 2026 SpecForge AI — Built for founders who ship.
      </footer>
    </main>
  );
}
