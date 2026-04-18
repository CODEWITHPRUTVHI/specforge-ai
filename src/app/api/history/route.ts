import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const interactions = await db.getInteractions(auth.userId);

  const history = interactions.map((i) => ({
    id: i.id,
    problem: i.problem_statement,
    category: i.problem_category,
    timestamp: i.created_at,
    feedback: i.user_feedback || null,
    diagnosis: i.ai_response?.diagnosis,
  }));

  return NextResponse.json({ history });
}
