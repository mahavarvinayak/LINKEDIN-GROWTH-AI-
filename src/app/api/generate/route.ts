import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "@/lib/ai/router";
import { LINKEDIN_SYSTEM_PROMPT, buildGeneratePrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || topic.length < 5) {
      return NextResponse.json(
        { error: "Topic is too short (min 5 characters)" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch User Data & Persona
    const { data: userData } = await supabase
      .from("users")
      .select("plan, credits_generate")
      .eq("id", user.id)
      .single();

    if (!userData) throw new Error("User data not found");

    // TODO: Hardened Credit check in Chunk 9
    if (userData.credits_generate <= 0 && userData.plan === "free") {
      return NextResponse.json(
        { error: "no_credits", message: "You have used your free generate credits." },
        { status: 403 }
      );
    }

    const { data: persona } = await supabase
      .from("personas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not set up", message: "Please complete your profile first." },
        { status: 400 }
      );
    }

    // 2. Build Prompt
    const userPrompt = buildGeneratePrompt(
      topic,
      persona.role,
      persona.topics,
      persona.goal,
      persona.tone,
      persona.audience
    );

    // 3. Call AI Router
    const rawResponse = await callAI(
      LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      userData.plan as any || "free",
      0.7 // Higher temperature for creative generation
    );

    // 4. Parse JSON
    const result = parseAIJson(rawResponse);

    // 5. Deduct credit
    await supabase.rpc("decrement_generate_credits", { user_id: user.id });

    // 6. Update Streak (Consistency Vector)
    const { updateUserStreak } = await import("@/lib/supabase/streak");
    await updateUserStreak(supabase, user.id);

    // 7. Save to history with rich metadata
    const scores = (result as any).estimated_scores || {};
    await supabase.from("posts").insert({
      user_id: user.id,
      type: 'generated',
      topic: topic,
      improved_content: (result as any).post,
      hook_score: scores.hook || 0,
      readability_score: scores.readability || 0,
      engagement_score: scores.engagement || 0,
      structure_score: scores.structure || 0,
      overall_score: ((scores.hook || 0) + (scores.readability || 0) + (scores.engagement || 0) + (scores.structure || 0)) / 4
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Generation API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate post. Please try again." },
      { status: 500 }
    );
  }
}
