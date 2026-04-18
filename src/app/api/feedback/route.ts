import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { interaction_id, was_helpful, notes } = await req.json();

    if (!interaction_id || was_helpful === undefined) {
      return NextResponse.json({ error: "interaction_id and was_helpful are required" }, { status: 400 });
    }

    const feedback = was_helpful === true ? "solved" : was_helpful === false ? "not-helpful" : "partial";
    await db.updateFeedback(auth.userId, interaction_id, feedback);

    return NextResponse.json({ saved: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
