import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { OnboardingProfile } from "@/types";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const profile: OnboardingProfile = await req.json();

    const { problem_statement, stage, tech_skill, team_size, tech_stack, geography } = profile;
    if (!problem_statement || !stage || !tech_skill || !tech_stack || !geography) {
      return NextResponse.json({ error: "All profile fields are required" }, { status: 400 });
    }

    const user = await db.updateProfile(auth.userId, {
      problem_statement,
      stage,
      tech_skill,
      team_size: Number(team_size) || 1,
      tech_stack,
      geography,
      profile_completed: true,
    });

    return NextResponse.json({ user, profile_saved: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const user = await db.getUserById(auth.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}
