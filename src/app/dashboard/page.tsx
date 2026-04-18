"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, AIResponse, ProblemCategory } from "@/types";
import { ResponseCards, ResponseSkeleton } from "@/components/ResponseCards";

const CATEGORY_COLORS: Record<ProblemCategory, string> = {
  technical: "bg-blue-100 text-blue-700",
  product: "bg-purple-100 text-purple-700",
  operational: "bg-slate-100 text-slate-700",
  growth: "bg-emerald-100 text-emerald-700",
  financial: "bg-amber-100 text-amber-700",
  personal: "bg-rose-100 text-rose-700",
};

const CATEGORY_EMOJI: Record<ProblemCategory, string> = {
  technical: "💻",
  product: "🎨",
  operational: "⚙️",
  growth: "📈",
  financial: "💰",
  personal: "❤️",
};

const EXAMPLE_PROBLEMS = [
  "Cashfree payment gateway API returning 401 on live mode",
  "Not sure how to structure equity for my first hire",
  "We've been live 2 weeks and only have 3 users",
  "Co-founder and I disagree on product direction",
  "How do I price my SaaS subscription?",
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<
    { id: string; problem: string; category: ProblemCategory; timestamp: string; feedback: string | null }[]
  >([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("sf_token");
    const storedUser = localStorage.getItem("sf_user");
    if (!token || !storedUser) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser) as User | null;
    if (!parsedUser || !parsedUser.profile_completed) {
      router.push("/onboarding");
      return;
    }
    setUser(parsedUser);
    fetchHistory(token);
  }, [router]);

  const fetchHistory = async (token: string) => {
    try {
      const res = await fetch("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.history) setHistory(data.history.slice(0, 5));
    } catch {}
  };

  const handleSolve = async () => {
    if (!problem.trim() || loading) return;
    setLoading(true);
    setError("");
    setResponse(null);
    setInteractionId(null);

    try {
      const token = localStorage.getItem("sf_token");
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problem: problem.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");

      setResponse(data.response);
      setInteractionId(data.interaction_id);

      // Refresh history
      if (token) fetchHistory(token);

      // Scroll to response
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!interactionId) return;
    const token = localStorage.getItem("sf_token");
    await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ interaction_id: interactionId, was_helpful: helpful }),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_user");
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSolve();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-slate-900 tracking-tight">
              SpecForge<span className="text-indigo-600"> AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block">{user.name}</span>
              <span className="text-slate-400 text-xs">▾</span>
            </button>
          </div>
        </div>

        {/* Profile dropdown */}
        {profileOpen && (
          <div className="absolute right-4 sm:right-6 top-16 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-64 z-20 animate-fade-in">
            <div className="mb-4 pb-4 border-b border-slate-100">
              <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
            <div className="space-y-1 mb-4 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Stage</span>
                <span className="font-medium text-slate-700 capitalize">{user.stage}</span>
              </div>
              <div className="flex justify-between">
                <span>Tech skill</span>
                <span className="font-medium text-slate-700 capitalize">{user.tech_skill}</span>
              </div>
              <div className="flex justify-between">
                <span>Stack</span>
                <span className="font-medium text-slate-700 truncate ml-2 text-right">{user.tech_stack || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Geography</span>
                <span className="font-medium text-slate-700">{user.geography}</span>
              </div>
            </div>
            <button
              onClick={() => { setProfileOpen(false); router.push("/onboarding"); }}
              className="w-full text-left text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1"
            >
              ✏️ Edit profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left text-xs text-rose-500 hover:text-rose-700 font-medium py-1 mt-1"
            >
              → Log out
            </button>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile + Input */}
          <div className="lg:col-span-2 space-y-5">
            {/* Welcome + Context pill */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  What are you stuck on?
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Describe the problem. Get a diagnosis + action plan in seconds.
                </p>
              </div>
            </div>

            {/* Context strip */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: user.stage, icon: "📊" },
                { label: user.geography, icon: "📍" },
                { label: user.tech_skill, icon: "⚡" },
                { label: user.tech_stack?.split(",")[0]?.trim(), icon: "🛠" },
              ]
                .filter((item) => item.label)
                .map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full font-medium"
                  >
                    {item.icon} <span className="capitalize">{item.label}</span>
                  </span>
                ))}
              <span className="text-slate-400 text-xs self-center">
                Context active · AI tailors to these
              </span>
            </div>

            {/* Problem Input */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <textarea
                ref={textareaRef}
                rows={5}
                placeholder={`e.g., "${EXAMPLE_PROBLEMS[Math.floor(Math.random() * EXAMPLE_PROBLEMS.length)]}"`}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="w-full px-5 py-4 text-slate-800 placeholder-slate-300 text-sm resize-none focus:outline-none leading-relaxed"
              />
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  ⌘+Enter to submit · Context: {user.stage}, {user.geography}
                </span>
                <button
                  onClick={handleSolve}
                  disabled={!problem.trim() || loading}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Thinking…
                    </span>
                  ) : (
                    "Ask SpecForge →"
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-rose-700 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Response area */}
            <div ref={responseRef}>
              {loading && <ResponseSkeleton />}
              {!loading && response && (
                <div className="animate-fade-in">
                  <ResponseCards
                    response={response}
                    interactionId={interactionId || ""}
                    onFeedback={handleFeedback}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: History */}
          <div className="space-y-4">
            {/* What you're building */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                What you&apos;re building
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {user.problem_statement || "—"}
              </p>
            </div>

            {/* Recent history */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Recent Questions
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Your problem history will appear here
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setProblem(h.problem)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-start gap-2 py-2 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="text-base mt-0.5 flex-shrink-0">
                          {CATEGORY_EMOJI[h.category] || "💭"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium truncate group-hover:text-indigo-600 transition-colors">
                            {h.problem}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`badge text-[10px] py-0 px-1.5 ${
                                CATEGORY_COLORS[h.category] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {h.category}
                            </span>
                            {h.feedback === "solved" && (
                              <span className="text-[10px] text-emerald-600 font-medium">✓ Solved</span>
                            )}
                            {h.feedback === "not-helpful" && (
                              <span className="text-[10px] text-rose-500 font-medium">✗ Not helpful</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-2">
                💡 Pro Tips
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• Be specific — error messages, stack, and stage matter</li>
                <li>• Paste error logs or code snippets when relevant</li>
                <li>• Say your geography for payment/legal advice</li>
                <li>• Check history to re-run past problems</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
