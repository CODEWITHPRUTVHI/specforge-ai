"use client";
import { AIResponse, ProblemCategory, TodayAction, Mistake, Resource, NextStep } from "@/types";
import { useState } from "react";

// ─── Category Config ────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  ProblemCategory,
  { label: string; emoji: string; color: string; bg: string }
> = {
  technical: { label: "Technical", emoji: "💻", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  product: { label: "Product", emoji: "🎨", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  operational: { label: "Operational", emoji: "⚙️", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
  growth: { label: "Growth", emoji: "📈", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  financial: { label: "Financial", emoji: "💰", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  personal: { label: "Personal", emoji: "❤️", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
};

// ─── Helper: Copy button ────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-0.5 rounded border border-slate-200 hover:border-slate-300"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────
function Card({
  icon,
  title,
  children,
  className = "",
  accent = "",
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl p-5 card-hover ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3
          className={`text-xs font-bold uppercase tracking-widest ${accent || "text-slate-500"}`}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─── Action block ────────────────────────────────────────────────────────────
function ActionBlock({
  action,
  idx,
}: {
  action: TodayAction;
  idx: number;
}) {
  const [done, setDone] = useState(false);
  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
        done
          ? "bg-emerald-50 border-emerald-100 opacity-60"
          : "bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
      }`}
    >
      <button
        onClick={() => setDone(!done)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : "border-slate-300 hover:border-indigo-400"
        }`}
      >
        {done && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-slate-400">⏱ {action.time_mins}m</span>
        </div>
        <p className={`text-sm font-semibold ${done ? "line-through text-slate-400" : "text-slate-800"}`}>
          {idx + 1}. {action.action}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{action.why}</p>
      </div>
    </div>
  );
}

// ─── Resource link ────────────────────────────────────────────────────────────
function ResourceLink({ resource }: { resource: Resource }) {
  return (
    <div className="group flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-link text-sm font-medium group-hover:text-indigo-700"
        >
          {resource.title}
          <span className="opacity-60">→</span>
        </a>
        <p className="text-xs text-slate-400 mt-0.5">{resource.why}</p>
      </div>
      <CopyButton text={resource.url} />
    </div>
  );
}

// ─── Main ResponseCards component ────────────────────────────────────────────
export function ResponseCards({
  response,
  interactionId,
  onFeedback,
}: {
  response: AIResponse;
  interactionId: string;
  onFeedback?: (helpful: boolean) => void;
}) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const cat = CATEGORY_CONFIG[response.category] || CATEGORY_CONFIG.technical;

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(true);
    onFeedback?.(helpful);
  };

  return (
    <div className="space-y-4 stagger">
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span className={`badge border ${cat.bg} ${cat.color}`}>
          {cat.emoji} {cat.label} Problem
        </span>
        <span className="text-xs text-slate-400">
          SpecForge AI
        </span>
      </div>

      {/* Diagnosis */}
      <Card icon="🔍" title="Diagnosis">
        <p className="text-slate-800 text-sm leading-relaxed font-medium">
          {response.diagnosis}
        </p>
      </Card>

      {/* The Fix */}
      <Card icon="💡" title="The Fix" accent="text-indigo-600">
        <p className="text-slate-800 text-sm leading-relaxed">
          {response.the_fix}
        </p>
      </Card>

      {/* Today Actions */}
      <Card icon="📋" title="Today (Next 90 mins)" accent="text-indigo-600">
        <div className="space-y-2">
          {response.today?.map((action, i) => (
            <ActionBlock key={i} action={action} idx={i} />
          ))}
        </div>
      </Card>

      {/* Common Mistakes */}
      {response.common_mistakes?.length > 0 && (
        <Card icon="⚠️" title="Common Mistakes" accent="text-amber-600" className="border-amber-50">
          <ul className="space-y-2">
            {response.common_mistakes.map((m: Mistake, i: number) => (
              <li key={i} className="text-sm">
                <span className="font-semibold text-slate-800">{m.mistake}</span>
                <span className="text-slate-500"> — {m.reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Resources */}
      {response.resources?.length > 0 && (
        <Card icon="🔗" title="Resources">
          <div>
            {response.resources.map((r: Resource, i: number) => (
              <ResourceLink key={i} resource={r} />
            ))}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      {response.next_steps?.length > 0 && (
        <Card icon="⏭️" title="Next 3 Steps">
          <ol className="space-y-3">
            {response.next_steps.map((s: NextStep, i: number) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.step}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Reality Check */}
      {response.reality_check?.triggered && (
        <Card
          icon="⚡"
          title="Reality Check"
          accent="text-amber-700"
          className="border-amber-100 bg-amber-50/30"
        >
          <div className="space-y-2">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Assumption</span>
              <p className="text-sm text-slate-700 mt-0.5 italic">"{response.reality_check.question}"</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reality</span>
              <p className="text-sm text-slate-700 mt-0.5">{response.reality_check.reality}</p>
            </div>
            <div className="bg-amber-100/60 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-amber-800">{response.reality_check.implication}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Escalation */}
      {response.escalation && (
        <Card
          icon="🚨"
          title="Escalation Needed"
          accent="text-rose-600"
          className="border-rose-100 bg-rose-50/30"
        >
          <p className="text-sm text-slate-800">{response.escalation}</p>
        </Card>
      )}

      {/* Feedback */}
      {!feedbackGiven ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Was this helpful?</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback(true)}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl transition-colors"
            >
              👍 Yes, solved it
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-semibold rounded-xl transition-colors"
            >
              👎 Not helpful
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center text-sm text-emerald-700 font-medium">
          ✅ Thanks for the feedback! It helps improve SpecForge AI.
        </div>
      )}
    </div>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────
export function ResponseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
            {i === 3 && (
              <>
                <div className="skeleton h-3 w-5/6 rounded mt-2" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
