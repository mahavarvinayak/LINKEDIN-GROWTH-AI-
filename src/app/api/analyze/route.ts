import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "../../../lib/ai/router";
import { LINKEDIN_SYSTEM_PROMPT, buildAnalyzePrompt, AI_CONFIG } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

// Helper to validate and clamp scores to 0-10 range
function validateScore(score: any): number {
  const num = parseInt(score) || 0;
  return Math.max(0, Math.min(10, num));
}

export async function POST(req: NextRequest) {
  try {
    const { post } = await req.json();

    if (!post || post.length < 20) {
      return NextResponse.json(
        { error: "Post content is too short (min 20 characters)" },
        { status: 400 }
      );
    }

    // 1. Get user session (REQUIRED)
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user data and check credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan, credits_analyze")
      .eq("id", user.id)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    const userPlan = (userData.plan as any) || "free";
    
    if (userData.credits_analyze <= 0 && userPlan === "free") {
      return NextResponse.json(
        { error: "no_credits", message: "You have used your free credits." },
        { status: 403 }
      );
    }

    // 3. Get persona
    const { data: personaData } = await supabase
      .from("personas")
      .select("role, goal, tone")
      .eq("user_id", user.id)
      .single();
    
    const persona = personaData || { role: "Professional", goal: "Grow audience", tone: "Professional" };

    // 4. Build Prompt and call AI
    const userPrompt = buildAnalyzePrompt(post, persona.role, persona.goal, persona.tone);
    const rawResponse = await callAI(
      LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      userPlan,
      AI_CONFIG.temperature.analyze,
      AI_CONFIG.max_tokens.analyze
    );

    // 5. Parse JSON response
    const result = parseAIJson(rawResponse);

    // 6. Validate and extract scores
    const scores = (result as any).scores || {};
    const hookS = validateScore(scores.hook?.score);
    const readS = validateScore(scores.readability?.score);
    const engS = validateScore(scores.engagement?.score);
    const structS = validateScore(scores.structure?.score);
    const overallScore = (hookS + readS + engS + structS) / 4;

    // 7. Save to history FIRST
    const { error: saveError } = await supabase.from("posts").insert({
      user_id: user.id,
      type: 'analyzed',
      original_content: post,
      hook_score: hookS,
      readability_score: readS,
      engagement_score: engS,
      structure_score: structS,
      overall_score: overallScore
    });

    if (saveError) {
      console.error("Post save error:", saveError);
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    // 8. Deduct credit AFTER successful save
    const { error: creditError } = await supabase.rpc("decrement_analyze_credits", { user_id: user.id });
    if (creditError) {
      console.error("Credit deduction error:", creditError);
      // Don't fail the response, credit already saved
    }

    // 9. Update Streak
    const { updateUserStreak } = await import("@/lib/supabase/streak");
    await updateUserStreak(supabase, user.id);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
