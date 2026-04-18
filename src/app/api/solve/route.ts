import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateResponse } from "@/lib/ai";
import { v4 as uuidv4 } from "uuid";
import { Interaction } from "@/types";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { problem } = await req.json();

    if (!problem || typeof problem !== "string" || problem.trim().length < 10) {
      return NextResponse.json(
        { error: "Please describe your problem in more detail (min 10 chars)" },
        { status: 400 }
      );
    }

    const user = await db.getUserById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profile_completed) {
      return NextResponse.json(
        { error: "Please complete your profile first" },
        { status: 400 }
      );
    }

    // Generate AI response
    const aiResponse = await generateResponse(problem.trim(), user);

    // Save interaction
    const interaction: Interaction = {
      id: uuidv4(),
      user_id: auth.userId,
      problem_statement: problem.trim(),
      problem_category: aiResponse.category,
      ai_response: aiResponse,
      created_at: new Date().toISOString(),
    };

    await db.saveInteraction(interaction);
    await db.updateLastProblem(auth.userId, problem.trim(), aiResponse);

    return NextResponse.json({
      interaction_id: interaction.id,
      response: aiResponse,
    });
  } catch (err: unknown) {
    console.error("Solve API error:", err);
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
