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

    // Helper to map human-readable labels to DB schema values
    const mapToDbValue = (val: string, type: 'role' | 'goal' | 'tone' | 'audience') => {
      const v = val.toLowerCase();
      if (type === 'role') {
        if (v.includes('student')) return 'student';
        if (v.includes('founder')) return 'founder';
        if (v.includes('freelancer')) return 'freelancer';
        if (v.includes('job seeker')) return 'job_seeker';
      }
      if (type === 'goal') {
        if (v.includes('followers')) return 'followers';
        if (v.includes('leads')) return 'leads';
        if (v.includes('job')) return 'job';
        if (v.includes('brand')) return 'brand';
      }
      if (type === 'tone') {
        if (v.includes('bold')) return 'bold';
        if (v.includes('story')) return 'story';
        if (v.includes('educational')) return 'educational';
        if (v.includes('casual')) return 'casual';
      }
      if (type === 'audience') {
        if (v.includes('student')) return 'students';
        if (v.includes('founder')) return 'founders';
        if (v.includes('recruiter') || v.includes('developer') || v.includes('professional')) return 'recruiters';
      }
      return v;
    };

    // 1. Save persona
    const { error: personaError } = await supabase
      .from("personas")
      .insert({
        user_id: userId,
        role: mapToDbValue(role, 'role'),
        topics: topics,
        goal: mapToDbValue(goal, 'goal'),
        tone: mapToDbValue(tone, 'tone'),
        audience: mapToDbValue(audience, 'audience')
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
