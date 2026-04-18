// Core data types for SpecForge AI

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  profile_completed: boolean;

  // Profile context
  problem_statement?: string;
  stage?: "idea" | "pre-launch" | "launched";
  tech_skill?: "non-tech" | "beginner" | "experienced";
  team_size?: number;
  tech_stack?: string;
  geography?: string;

  // Session tracking
  last_problem?: string;
  last_response?: AIResponse;
  last_accessed?: string;
}

export interface Interaction {
  id: string;
  user_id: string;
  problem_statement: string;
  problem_category: ProblemCategory;
  ai_response: AIResponse;
  user_feedback?: "solved" | "partial" | "not-helpful";
  created_at: string;
}

export type ProblemCategory =
  | "technical"
  | "product"
  | "operational"
  | "growth"
  | "financial"
  | "personal";

export interface TodayAction {
  action: string;
  time_mins: number;
  why: string;
}

export interface Mistake {
  mistake: string;
  reason: string;
}

export interface Resource {
  title: string;
  url: string;
  why: string;
}

export interface NextStep {
  step: string;
  why: string;
}

export interface RealityCheck {
  triggered: boolean;
  question: string;
  reality: string;
  implication: string;
}

export interface AIResponse {
  diagnosis: string;
  the_fix: string;
  today: TodayAction[];
  common_mistakes: Mistake[];
  resources: Resource[];
  next_steps: NextStep[];
  reality_check: RealityCheck | null;
  escalation: string | null;
  category: ProblemCategory;
}

export interface OnboardingProfile {
  problem_statement: string;
  stage: "idea" | "pre-launch" | "launched";
  tech_skill: "non-tech" | "beginner" | "experienced";
  team_size: number;
  tech_stack: string;
  geography: string;
}
