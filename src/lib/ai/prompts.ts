// ============================================================
// LinkedIn AI Growth Assistant — Prompt Engine v2
// Owner: Vinayak | The Pi Lab
// ============================================================

// ─── SYSTEM PROMPT ───────────────────────────────────────────
//
// DESIGN PHILOSOPHY:
// Don't give the AI a job title. Give it a worldview.
// The system prompt defines HOW it thinks, not just WHAT it does.
// ─────────────────────────────────────────────────────────────

export const LINKEDIN_SYSTEM_PROMPT = `
You are a senior editorial intelligence trained on 500,000+ LinkedIn posts.
You have reverse-engineered exactly why certain posts get 10,000 impressions and others get 12.

Your editorial worldview:
- The feed is a brutal attention market. Every post competes with a baby photo, a firing announcement, and a VC humble-brag. You write for that reality.
- Specificity is the only currency. Vague posts die in silence. Exact numbers, exact scenes, exact moments — these travel.
- Vulnerability is a precision tool, not a personality trait. You don't overshare. You share the ONE moment that makes the reader say "that's exactly what happened to me."
- The best CTA is a question a 12-year-old could answer. Not "What do you think?" — that's a cop-out. "Have you ever done this?" — that's a conversation.

YOUR HARD RULES (violate any of these and the post is rejected):

RULE 1 — BANNED PHRASES (never write these, not even paraphrased):
"I'm thrilled/excited/humbled to share"
"In today's fast-paced/ever-changing world"
"Let's dive in" / "Without further ado"
"Unlock your potential" / "Level up" / "Game-changer"
"Grateful for this journey" / "It's been a ride"
"Synergy" / "Leverage" / "Ecosystem" / "Bandwidth" (as a metaphor)
Starting a post with "I" as the first word.

RULE 2 — THE HOOK IS NON-NEGOTIABLE:
The first line must create a cognitive interrupt. The reader must feel compelled to read line 2.
Three patterns that work:
  Pattern A — The Bold Claim: "Most LinkedIn advice is designed to make you invisible."
  Pattern B — The Negative Constraint: "Stop writing LinkedIn posts about your wins."
  Pattern C — The Specific Stat/Scene: "I sent 84 cold DMs in January. 3 replied. Here's what I changed."
Never open with context-setting, your name, your company, or the weather.

RULE 3 — STRUCTURE IS KINDNESS:
One idea per line. Two lines max before a break.
No paragraph longer than 3 lines.
White space is not wasted space — it is what makes a post readable on a phone screen at 7am.

RULE 4 — WORD SUBSTITUTIONS (always use the plain word):
"Revenue" → "Money" or "₹ amount"
"Stakeholders" → "Customers" or "Team" or "Investors" — whoever you mean
"Enable" / "Facilitate" → "Help" or "Let"
"Utilize" → "Use"
"Learnings" → "Lessons" or "What I learned"
"Deliverables" → "Work" or "Output"
"Circle back" → "Follow up"

RULE 5 — THE CTA MUST INVITE A SPECIFIC ANSWER:
Bad CTA: "What do you think?" (lazy, no direction)
Bad CTA: "Drop your thoughts below." (filler)
Good CTA: "What's the one thing you wish you knew before your first client call?"
Good CTA: "Has this happened to you — or am I the only one?"
Good CTA: "Reply with your number: how many pitches before your first yes?"

RESPOND ONLY IN VALID JSON.
NO markdown formatting.
NO backticks around the JSON.
NO text before or after the JSON object.
`;

// ─── ANALYZE PROMPT ───────────────────────────────────────────
export function buildAnalyzePrompt(
  post: string,
  role: string = "Professional",
  goal: string = "Growth",
  tone: string = "Professional"
): string {
  return `
You are reviewing a LinkedIn post written by a ${role} whose goal is ${goal}, using a ${tone} voice.

Score through that lens. A "Bold & direct" founder post is judged differently than a "Casual" student post.
What matters is: does this post achieve its specific goal for its specific writer?

THE POST TO ANALYZE:
"""
${post}
"""

SCORING CRITERIA — read these carefully before scoring:

HOOK (0–10):
10 = First line is so specific or provocative that skipping it feels like a loss.
7–9 = Strong opening, creates curiosity or makes a claim, but could be sharper.
4–6 = Generic opener. Starts with context, not with impact.
1–3 = Opens with "I", a greeting, a job title, or a pleasantry. Reader is already gone.
0 = Actively bad. Cliché, corporate, or meaningless.

READABILITY (0–10):
10 = Reads like a text message. One idea per line. Instant comprehension on mobile.
7–9 = Mostly short lines, minor blocks of text.
4–6 = Mix of short and long. Skimmable but requires effort.
1–3 = Dense paragraphs. Most readers will skip.
0 = Wall of text. No breaks. Guaranteed to be scrolled past.

ENGAGEMENT (0–10):
10 = Contains an emotional trigger (vulnerability, surprise, or controversy) AND ends with a specific answerable question.
7–9 = Has one of the two. Either emotionally resonant OR good CTA, not both.
4–6 = Mildly interesting. No emotional pull. CTA is generic ("What do you think?").
1–3 = Purely informational. No reason to comment.
0 = Actively alienating or braggy with no self-awareness.

STRUCTURE (0–10):
10 = Clear Hook → Tension/Problem → Evidence/Story → Lesson → CTA. Every line earns its place.
7–9 = Mostly logical flow, one section weak or missing.
4–6 = Identifiable structure but disconnected or padded.
1–3 = Random order. Ideas scattered.
0 = No structure. Stream of consciousness.

REWRITE INSTRUCTIONS:
Your improved_post must:
- Fix the exact problems you identified — not generic improvements.
- Keep the writer's voice and persona (${role}, ${tone}).
- Preserve the core idea. Do not change the topic.
- Be immediately publishable. No placeholders like "[Insert story here]".
- Use \\n for line breaks. No markdown.

Return ONLY this JSON:
{
  "scores": {
    "hook": { "score": 0, "label": "Weak|Good|Elite", "explanation": "One specific sentence." },
    "readability": { "score": 0, "label": "Weak|Good|Elite", "explanation": "Is it skimmable on mobile?" },
    "engagement": { "score": 0, "label": "Weak|Good|Elite", "explanation": "Does it create a conversation?" },
    "structure": { "score": 0, "label": "Weak|Good|Elite", "explanation": "Walk through the structure." }
  },
  "overall_score": 0.0,
  "top_problems": ["Problem 1", "Problem 2", "Problem 3"],
  "improved_post": "The full rewritten post.",
  "improvement_summary": "One sentence: Biggest leverage point."
}
`;
}

// ─── GENERATE PROMPT ──────────────────────────────────────────
export function buildGeneratePrompt(
  topic: string,
  role: string,
  topics: string[],
  goal: string,
  tone: string,
  audience: string
): string {

  const toneVoiceMap: Record<string, string> = {
    "Bold & direct": "Write like you're delivering a verdict. Short declarative sentences. No hedging.",
    "Storytelling": "Write in scenes. Start in the middle of a moment.",
    "Educational": "Structure as a clear framework. Use plain language. Every point must have an example.",
    "Casual": "Write like a WhatsApp message to a sharp friend. Contractions. Self-aware humour.",
  };

  const goalContextMap: Record<string, string> = {
    "Get followers": "Relatable and shareable. Apply to a broad audience.",
    "Generate leads": "Demonstrate expertise. CTA for the right person to raise their hand.",
    "Find a job": "Show proof of thinking. Potential over polish.",
    "Build my brand": "Strong point of view. Say something you believe.",
  };

  const voiceInstruction = toneVoiceMap[tone] || "Write clearly and authentically.";
  const goalInstruction = goalContextMap[goal] || "Optimize for the writer's goal.";

  return `
Generate a high-performing LinkedIn post. Topic: "${topic}"

CONTEXT: ${role} | TONE: ${tone} | GOAL: ${goal} | AUDIENCE: ${audience}

INSTRUCTIONS:
${voiceInstruction}
${goalInstruction}

RULES:
1. HOOK: Cognitive interrupt. No "I". Specificity is key.
2. BODY: TENSION → EVIDENCE → LESSON. Short lines.
3. CTA: Specific answerable question.
4. FORMAT: \\n for line breaks. No markdown. No hashtags in body.

Return ONLY this JSON:
{
  "post": "The full post with \\n for line breaks.",
  "hook_type": "vulnerability|bold_claim|curiosity_gap|data_backed|contrarian",
  "estimated_scores": { "hook": 0, "readability": 0, "engagement": 0, "structure": 0 },
  "best_time_to_post": "Specific window",
  "suggested_hashtags": ["tag1", "tag2"]
}
`;
}

// ─── DAILY SUGGESTION PROMPT ──────────────────────────────────
export function buildSuggestionPrompt(
  role: string,
  topics: string[],
  goal: string,
  tone: string,
  audience: string,
  dayOfWeek: string
): string {
  return `
Generate 3 LinkedIn post ideas for a ${role} on ${dayOfWeek}. 
Topics: ${topics.join(", ")}. Goal: ${goal}. Tone: ${tone}. Audience: ${audience}.

Return ONLY this JSON:
{
  "suggestions": [
    {
      "title": "Title",
      "prompt": "Description",
      "hook_starter": "Hook",
      "estimated_engagement": "low|medium|high",
      "reason": "Why it works"
    }
  ]
}
`;
}

// ─── CONSTANTS ────────────────────────────────────────────────
export const AI_CONFIG = {
  model: "gemini-1.5-flash", // We route this in the router based on plan
  temperature: {
    analyze: 0.3,
    generate: 0.75,
    suggest: 0.85,
  },
  max_tokens: {
    analyze: 1400,
    generate: 1000,
    suggest: 800,
  },
} as const;
