"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    id: "problem_statement",
    label: "What are you building?",
    placeholder: "e.g., A live auction platform for sneaker resellers in India",
    help: "Describe the problem you're solving and who your customer is",
    type: "textarea",
  },
  {
    id: "stage",
    label: "What stage are you at?",
    help: "This helps tailor advice to where you actually are",
    type: "select",
    options: [
      { value: "idea", label: "💡 Idea stage", desc: "Exploring the problem, no product yet" },
      { value: "pre-launch", label: "🔧 Pre-launch", desc: "Building, not yet live" },
      { value: "launched", label: "🚀 Launched", desc: "Live with real users" },
    ],
  },
  {
    id: "tech_skill",
    label: "Your tech skill level?",
    help: "No judgment — this changes how advice is framed",
    type: "select",
    options: [
      { value: "non-tech", label: "🙋 Non-technical", desc: "No coding background" },
      { value: "beginner", label: "📚 Beginner", desc: "Some coding, still learning" },
      { value: "experienced", label: "⚡ Experienced", desc: "Comfortable with code" },
    ],
  },
  {
    id: "team_size",
    label: "Team size?",
    help: "Solo or team changes operational advice significantly",
    type: "select",
    options: [
      { value: "1", label: "🦺 Solo founder", desc: "Just me" },
      { value: "2", label: "👥 Two co-founders", desc: "Me + 1 co-founder" },
      { value: "3", label: "👨‍👩‍👧 Three or more", desc: "Small team" },
    ],
  },
  {
    id: "tech_stack",
    label: "Tech stack?",
    placeholder: "e.g., Next.js, Tailwind, Supabase, Vercel",
    help: "What you're building with — leave blank if non-technical",
    type: "input",
  },
  {
    id: "geography",
    label: "Where are you based?",
    help: "Helps with legal, payment, and market-specific advice",
    type: "select",
    options: [
      { value: "India", label: "🇮🇳 India", desc: "Cashfree, Razorpay, CA, GST" },
      { value: "Southeast Asia", label: "🌏 Southeast Asia", desc: "Regional context" },
      { value: "US", label: "🇺🇸 United States", desc: "Stripe, US legal" },
      { value: "Global", label: "🌍 Global / Remote", desc: "No specific region" },
      { value: "Other", label: "✈️ Other", desc: "General advice" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({
    problem_statement: "",
    stage: "",
    tech_skill: "",
    team_size: "",
    tech_stack: "",
    geography: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const step = STEPS[currentStep];
  const progress = ((currentStep) / STEPS.length) * 100;

  const isCurrentStepFilled = () => {
    const val = form[step.id];
    // tech_stack is optional for non-tech founders
    if (step.id === "tech_stack") return true;
    return val && val.trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("sf_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          team_size: parseInt(form.team_size) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      // Update local user
      localStorage.setItem("sf_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          S
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          SpecForge<span className="text-indigo-400"> AI</span>
        </span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium">Setting up your profile</span>
          <span className="text-slate-400 text-xs">{currentStep + 1} of {STEPS.length}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-1">{step.label}</h2>
        <p className="text-slate-400 text-sm mb-6">{step.help}</p>

        {step.type === "textarea" && (
          <textarea
            rows={4}
            placeholder={step.placeholder}
            value={form[step.id]}
            onChange={(e) => setForm({ ...form, [step.id]: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        )}

        {step.type === "input" && (
          <input
            type="text"
            placeholder={step.placeholder}
            value={form[step.id]}
            onChange={(e) => setForm({ ...form, [step.id]: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        )}

        {step.type === "select" && step.options && (
          <div className="space-y-2">
            {step.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, [step.id]: opt.value })}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                  form[step.id] === opt.value
                    ? "bg-indigo-600/20 border-indigo-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-3 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isCurrentStepFilled() || loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : currentStep === STEPS.length - 1 ? (
              "Save Profile & Enter Dashboard →"
            ) : (
              "Continue →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
