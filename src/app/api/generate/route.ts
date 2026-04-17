import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "@/lib/ai/router";
import { LINKEDIN_SYSTEM_PROMPT, buildGeneratePrompt, AI_CONFIG } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import { predictEngagementRate, convertLegacyScore } from "@/lib/ai/scoringEngine";

// Helper to validate and clamp scores to 0-10 range
function validateScore(score: any): number {
  const num = parseInt(score) || 0;
  return Math.max(0, Math.min(10, num));
}

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch User Data & Persona
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan, credits_generate")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    const isPaid = userData.plan === "starter" || userData.plan === "pro";

    if (!isPaid && userData.credits_generate <= 0) {
      return NextResponse.json(
        { error: "no_credits", message: "You have used your free generate credits. Upgrade to continue." },
        { status: 403 }
      );
    }

    const { data: persona, error: personaError } = await supabase
      .from("personas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (personaError || !persona) {
      return NextResponse.json(
        { error: "Persona not set up", message: "Please complete your profile first." },
        { status: 400 }
      );
    }

    // 2. Build Prompt and Call AI
    const userPrompt = buildGeneratePrompt(
      topic,
      persona.role,
      persona.topics,
      persona.goal,
      persona.tone,
      persona.audience
    );

    const rawResponse = await callAI(
      LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      userData.plan as any || "free",
      AI_CONFIG.temperature.generate,
      AI_CONFIG.max_tokens.generate
    );

    // 3. Parse JSON response
    const result = parseAIJson(rawResponse);
    const post = (result as any).post || "";
    const hookType = (result as any).hook_type || "generic";
    const hashtagsFromAI = (result as any).suggested_hashtags || [];

    // 4. CALCULATE REALISTIC ENGAGEMENT PREDICTION
    // (Based on real LinkedIn data, not subjective structure scoring)
    const postMetrics = {
      contentLength: post.length,
      hasHashtags: hashtagsFromAI.length > 0,
      hashtagCount: hashtagsFromAI.length,
      postType: "text" as const, // Default for text posts from AI
      dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
      postHour: new Date().getHours(),
      hasMedia: false,
      hookType: hookType,
      hookQuality: 8, // AI generated hooks are usually strong
      ctaSpecificity: 8, // Our new prompts enforce specific CTAs
      emotionalIndex: 7,
    };

    const engagementPrediction = predictEngagementRate(postMetrics);

    // Convert to database scores (for compatibility with existing system)
    // These are NOW realistic predictions, not fake structural scores
    const hookS = Math.round(engagementPrediction.breakdown.hookScore);
    const readS = Math.round(engagementPrediction.breakdown.contentLengthScore);
    const engS = Math.round(engagementPrediction.breakdown.postTypeScore);
    const structS = Math.round(engagementPrediction.breakdown.timingScore);
    const overallScore = engagementPrediction.predictedEngagementRate;

    // 5. Save to history FIRST
    const { error: saveError } = await supabase.from("posts").insert({
      user_id: user.id,
      type: "generated",
      topic: topic,
      improved_content: post,
      hook_score: hookS,
      readability_score: readS,
      engagement_score: engS,
      structure_score: structS,
      overall_score: overallScore,
    });

    if (saveError) {
      console.error("Post save error:", saveError);
      return NextResponse.json({ error: "Failed to save generated post" }, { status: 500 });
    }

    // 6. Deduct credit AFTER successful save (only for free users)
    if (!isPaid) {
      const { error: creditError } = await supabase.rpc("decrement_generate_credits", { user_id: user.id });
      if (creditError) {
        console.error("Credit deduction error:", creditError);
        // Don't fail the response, post already saved
      }
    }

    // 7. Update Streak
    const { updateUserStreak } = await import("@/lib/supabase/streak");
    await updateUserStreak(supabase, user.id);

    // 8. Return enhanced response with engagement insights
    const responsePayload = {
      post: (result as any).post,
      hook_type: (result as any).hook_type,
      suggested_hashtags: (result as any).suggested_hashtags,
      best_time_to_post: (result as any).best_time_to_post,
      estimated_scores: {
        hook: hookS,
        readability: readS,
        engagement: engS,
        structure: structS,
      },
      // New engagement prediction system
      predictedEngagementRate: engagementPrediction.predictedEngagementRate,
      engagementPredictionConfidence: engagementPrediction.confidence,
      engagementInsights: engagementPrediction.insights,
      engagementRecommendation: engagementPrediction.recommendation,
    };

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error("Generation API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate post. Please try again." },
      { status: 500 }
    );
  }
}
