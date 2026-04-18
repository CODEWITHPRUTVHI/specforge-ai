import OpenAI from "openai";
import { User, AIResponse, ProblemCategory } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Category detection ──────────────────────────────────────────────────────
const categoryKeywords: Record<ProblemCategory, string[]> = {
  technical: [
    "error", "bug", "code", "api", "deploy", "crash", "server", "database",
    "npm", "git", "build", "404", "401", "403", "500", "cors", "env",
    "docker", "vercel", "aws", "firebase", "supabase", "stripe", "razorpay",
    "cashfree", "next.js", "react", "typescript", "python", "auth",
  ],
  product: [
    "ux", "design", "feature", "user", "feedback", "ui", "wireframe",
    "landing page", "onboarding", "flow", "prototype", "figma", "mvp spec",
  ],
  operational: [
    "hire", "equity", "legal", "contract", "company", "incorporation",
    "gst", "tax", "co-founder", "team", "esop", "terms", "privacy policy",
    "trademark", "ip", "nda", "process", "workflow",
  ],
  growth: [
    "users", "growth", "marketing", "retention", "churn", "acquisition",
    "waitlist", "launch", "product hunt", "seo", "ads", "social media",
    "viral", "referral", "metrics", "kpi", "analytics", "dashboard",
    "conversion", "funnel",
  ],
  financial: [
    "funding", "investor", "pitch", "runway", "burn", "revenue", "pricing",
    "subscription", "saas", "mrr", "arr", "valuation", "cap table",
    "fundraise", "angel", "vc", "pre-seed",
  ],
  personal: [
    "burnout", "stress", "motivation", "co-founder conflict", "mental",
    "overwhelmed", "anxiety", "stuck", "depression", "quit", "give up",
    "lonely", "imposter", "confidence",
  ],
};

export function detectCategory(problem: string): ProblemCategory {
  const lower = problem.toLowerCase();
  const scores: Record<ProblemCategory, number> = {
    technical: 0,
    product: 0,
    operational: 0,
    growth: 0,
    financial: 0,
    personal: 0,
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[cat as ProblemCategory]++;
    }
  }

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (top[1] > 0 ? top[0] : "technical") as ProblemCategory;
}

// ─── Category-specific prompt additions ─────────────────────────────────────
function getCategoryPrompt(category: ProblemCategory, profile: User): string {
  const base = `
User Context:
- Stage: ${profile.stage || "unknown"}
- Tech Skill: ${profile.tech_skill || "unknown"}
- Team Size: ${profile.team_size ? profile.team_size + " people" : "unknown"}
- Tech Stack: ${profile.tech_stack || "unknown"}
- Geography: ${profile.geography || "unknown"}
- What they're building: ${profile.problem_statement || "unknown"}
`;

  const categoryAdditions: Record<ProblemCategory, string> = {
    technical: `${base}
TECHNICAL PROBLEM RULES:
- Diagnose root cause using their specific tech stack (${profile.tech_stack || "their stack"})
- Link to official documentation FIRST, do NOT paraphrase docs
- Provide a code example ONLY if it's critical and can't be explained otherwise
- Suggest alternatives (different libraries, approaches) if the primary approach is complex
- If complexity > DIY threshold: say "This needs a real engineer. Here's how to find one."
- For India-based founders: Prioritize Razorpay, Cashfree, PayU over Stripe`,

    product: `${base}
PRODUCT PROBLEM RULES:
- Focus on the USER'S specific problem (not generic design advice)
- Recommend tools relevant to their tech skill level (${profile.tech_skill})
- For non-tech founders: Recommend no-code solutions first
- Keep UX advice actionable—link to real examples, not theory`,

    operational: `${base}
OPERATIONAL PROBLEM RULES:
- For India-based founders: Reference Indian law, Companies Act, CA requirements, Startup India
- Always recommend consulting a real CA or lawyer for legal/tax matters
- Give realistic Indian cost estimates (₹ not only $)
- Be specific about timelines (incorporation takes 2-3 weeks in India)
- Don't give legal advice—give frameworks and then say "verify with a CA/lawyer"`,

    growth: `${base}
GROWTH PROBLEM RULES:
- For early stage (< 100 users): Push back on paid ads, recommend direct outreach
- Only recommend paid marketing if they're post product-market fit
- For India: Recommend WhatsApp, LinkedIn, local communities over Twitter/Reddit
- Always question: "Do you have product-market fit yet?"
- Reference Indian startup growth playbooks where relevant`,

    financial: `${base}
FINANCIAL PROBLEM RULES:
- For India: Reference SEBI rules, Indian VC ecosystem, Startup India benefits
- Always mention bootstrap option before fundraising advice
- CAP table advice: Strongly recommend a CA or legal expert
- Don't give financial advice—give frameworks to discuss with advisors`,

    personal: `${base}
PERSONAL PROBLEM RULES:
- Be empathetic. This person is struggling.
- Don't minimize their problem. Acknowledge it first.
- Give practical mental health resources (not just "take a break")
- If there are signs of serious burnout: Recommend professional support
- Co-founder conflict: Recommend mediation, not taking sides`,
  };

  return categoryAdditions[category];
}

// ─── Master system prompt ───────────────────────────────────────────────────
const MASTER_SYSTEM_PROMPT = `You are SpecForge AI — an execution co-founder helping real founders move forward.

CORE IDENTITY:
- You are NOT a chatbot or a text generator
- You give structured, actionable advice in a specific JSON format
- Every response must be context-aware (use the founder's tech stack, stage, geography)
- You are honest: "I'm not confident about this" is better than hallucinating

ABSOLUTE RULES:
1. Never give generic advice. Always use the founder's context.
2. Max 3 TODAY actions. Always with time estimates.
3. NEVER make up URLs, tools, or links. If unsure, say "Research: [topic]".
4. Know when to escalate: Lawyer for legal, Engineer for complex tech, Therapist for burnout.
5. Be honest about difficulty. "This is hard" is okay.
6. No ChatGPT-style preamble ("Great question!", "Certainly!"). Jump straight to the point.
7. Max 50 words per card section.
8. Links must be real, official documentation links.

REALITY CHECK TRIGGER (only trigger when ALL 3 are true):
1. The user has stated a weak or incorrect assumption
2. You have data/facts to challenge it
3. You can offer a path forward after challenging it

OUTPUT FORMAT — Return ONLY valid JSON, no extra text:
{
  "diagnosis": "1 sentence using their specific context (stack, stage, geo)",
  "the_fix": "1 sentence core change needed",
  "today": [
    { "action": "specific action", "time_mins": 20, "why": "reason" },
    { "action": "specific action", "time_mins": 30, "why": "reason" }
  ],
  "common_mistakes": [
    { "mistake": "Don't X", "reason": "Because Y" }
  ],
  "resources": [
    { "title": "Official Doc", "url": "https://...", "why": "Why you need it" }
  ],
  "next_steps": [
    { "step": "Step 1", "why": "Why and when to do this" }
  ],
  "reality_check": {
    "triggered": true,
    "question": "Assumption they stated",
    "reality": "Actual data/fact",
    "implication": "What this means for them"
  },
  "escalation": null,
  "category": "technical"
}

If reality_check is NOT triggered: "reality_check": null
If escalation is NOT needed: "escalation": null
If escalation IS needed: "escalation": "You need a real [role]. Here's how: [brief guidance]"`;

// ─── Main AI call ────────────────────────────────────────────────────────────
export async function generateResponse(
  problem: string,
  profile: User
): Promise<AIResponse> {
  const category = detectCategory(problem);
  const categoryPrompt = getCategoryPrompt(category, profile);

  const userMessage = `${categoryPrompt}

PROBLEM (Category: ${category.toUpperCase()}):
${problem}

Remember: Return ONLY valid JSON matching the exact format specified. No extra text.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3, // Lower temperature = more consistent, structured output
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const parsed = JSON.parse(content) as AIResponse;
  parsed.category = category; // Ensure category is set

  return parsed;
}
