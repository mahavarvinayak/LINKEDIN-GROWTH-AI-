import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { 
      userId, 
      role, 
      topics, 
      goal, 
      tone, 
      audience 
    } = await req.json();

    if (!userId || !role || topics.length === 0 || !goal || !tone || !audience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Save persona
    const { error: personaError } = await supabase
      .from("personas")
      .insert({
        user_id: userId,
        role: role.toLowerCase(), // Normalizing for DB
        topics: topics,
        goal: goal.toLowerCase(),
        tone: tone.toLowerCase(),
        audience: audience.toLowerCase()
      });

    if (personaError) throw personaError;

    // 2. Mark onboarding as complete in users table
    const { error: userError } = await supabase
      .from("users")
      .update({ persona_complete: true })
      .eq("id", userId);

    if (userError) throw userError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Persona save error:", error);
    return NextResponse.json(
      { error: "Failed to save settings. Try again." },
      { status: 500 }
    );
  }
}
