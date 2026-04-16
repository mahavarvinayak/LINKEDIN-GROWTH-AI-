import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "@/lib/ai/router";
import { LINKEDIN_SYSTEM_PROMPT, buildAnalyzePrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { post } = await req.json();

    if (!post || post.length < 20) {
      return NextResponse.json(
        { error: "Post content is too short (min 20 characters)" },
        { status: 400 }
      );
    }

    // 1. Get user session (Optional for pre-login but needed for credits later)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Determine Plan (Default to 'free' for landing page guests)
    let userPlan: "free" | "starter" | "pro" = "free";
    let persona = { role: "Professional", goal: "Grow audience", tone: "Professional" };

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("plan, credits_analyze")
        .eq("id", user.id)
        .single();
      
      if (userData) {
        userPlan = (userData.plan as any) || "free";
        
        // TODO: Credit check logic will be hardened in Chunk 8
        if (userData.credits_analyze <= 0 && userPlan === "free") {
           return NextResponse.json({ error: "no_credits", message: "You have used your free credits." }, { status: 403 });
        }
      }

      const { data: personaData } = await supabase
        .from("personas")
        .select("role, goal, tone")
        .eq("user_id", user.id)
        .single();
      
      if (personaData) {
        persona = personaData as any;
      }
    }

    // 3. Build Prompt
    const userPrompt = buildAnalyzePrompt(
      post, 
      persona.role, 
      persona.goal, 
      persona.tone
    );

    // 4. Call AI Router
    const rawResponse = await callAI(
      LINKEDIN_SYSTEM_PROMPT,
      userPrompt,
      userPlan,
      0.4 // Lower temperature for analysis accuracy
    );

    // 5. Parse JSON
    const result = parseAIJson(rawResponse);

    // 6. Deduct credit if user exists
    if (user) {
      await supabase.rpc("decrement_analyze_credits", { user_id: user.id });

      // 7. Update Streak (Consistency Vector)
      const { updateUserStreak } = await import("@/lib/supabase/streak");
      await updateUserStreak(supabase, user.id);

      // 8. Save to history
      const scores = (result as any).estimated_scores || {};
      await supabase.from("posts").insert({
        user_id: user.id,
        type: 'analyzed',
        original_content: post,
        hook_score: scores.hook || 0,
        readability_score: scores.readability || 0,
        engagement_score: scores.engagement || 0,
        structure_score: scores.structure || 0,
        overall_score: ((scores.hook || 0) + (scores.readability || 0) + (scores.engagement || 0) + (scores.structure || 0)) / 4
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
