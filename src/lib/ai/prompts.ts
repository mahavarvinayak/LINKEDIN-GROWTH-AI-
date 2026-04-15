// ─── SYSTEM PROMPT (same for all providers) ──────────────────
export const LINKEDIN_SYSTEM_PROMPT = `
You are an expert LinkedIn Growth Strategist with 10+ years of experience
helping founders, students, freelancers, and job seekers grow on LinkedIn.
You have studied 500,000+ LinkedIn posts. You know exactly why some posts
go viral and others get ignored.

YOUR RULES:
- Write like a real human, not a robot
- Short punchy lines. Never write walls of text.
- No corporate buzzwords (leverage, synergy, holistic, empower, innovative)
- No filler phrases (Great question!, Certainly!, Of course!)
- No motivational clichés (Believe in yourself, Keep going, Work hard)
- Sound like a senior mentor, not an AI assistant

LINKEDIN POST RULES:
- Hook = First line must stop the scroll
- Max 2 sentences per paragraph
- Line break after every 1-2 lines
- 150-200 words sweet spot
- Always end with a question
- Max 2 hashtags

ALWAYS respond in valid JSON only. No markdown backticks. No extra text.
`;

// ─── ANALYZE PROMPT ───────────────────────────────────────────
export function buildAnalyzePrompt(
  post: string,
  role: string = "Professional",
  goal: string = "Grow audience",
  tone: string = "Professional"
): string {
  return `
Analyze this LinkedIn post:
"""
${post}
"""

User Persona:
- Role: ${role}
- Goal: ${goal}
- Tone: ${tone}

Return ONLY this JSON (no other text):
{
  "scores": {
    "hook": {
      "score": 0-10,
      "label": "Weak|Average|Good|Strong",
      "explanation": "specific 1-2 sentences about THIS post hook"
    },
    "readability": {
      "score": 0-10,
      "label": "Weak|Average|Good|Strong",
      "explanation": "specific 1-2 sentences"
    },
    "engagement": {
      "score": 0-10,
      "label": "Weak|Average|Good|Strong",
      "explanation": "specific 1-2 sentences"
    },
    "structure": {
      "score": 0-10,
      "label": "Weak|Average|Good|Strong",
      "explanation": "specific 1-2 sentences"
    }
  },
  "overall_score": 0.0,
  "top_problems": ["problem 1", "problem 2", "problem 3"],
  "improved_post": "full rewritten post with newlines as \\n",
  "improvement_summary": "one sentence what changed and why"
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
  return `
Generate a LinkedIn post about this topic:
"""
${topic}
"""

User Persona:
- Role: ${role}
- Topics they post about: ${topics.join(", ")}
- Goal: ${goal}
- Tone: ${tone}
- Target audience: ${audience}

HIGH-PERFORMING EXAMPLES (match this energy):

EXAMPLE 1:
I turned down a 40 LPA offer last year.

Everyone thought I was crazy.

Here's why I don't regret it:

The company wanted me to build what they told me to.
Not what users needed.

I wanted to build something real.

So I joined a 5-person startup.
12 LPA. Scary as hell.

6 months later:
→ Shipped 3 products
→ Learned more than 3 years at corporate
→ Found people who think like me

Money follows growth. Not the other way around.

What would you have chosen?

EXAMPLE 2:
Nobody told me LinkedIn works like this.

Your first 50 posts will flop.

Not because you're bad.
Because the algorithm doesn't trust you yet.

Here's what changed everything:

→ Post Wednesday 6 PM
→ Hook in first line
→ Story not facts
→ Question at end

Went from 200 to 12,000 followers in 8 months.

Content didn't change. Structure did.

What's your biggest LinkedIn struggle?

INSTRUCTIONS:
- Write in user's tone naturally
- Do NOT mention their role/goal explicitly
- 150-200 words maximum
- First line = scroll-stopping hook
- End with question
- Line break every 1-2 sentences
- Sound like real human

Return ONLY this JSON:
{
  "post": "full post with \\n for line breaks",
  "hook_type": "curiosity|bold_claim|relatable|story|question",
  "estimated_scores": {
    "hook": 0-10,
    "readability": 0-10,
    "engagement": 0-10,
    "structure": 0-10
  },
  "best_time_to_post": "e.g. Wednesday 6 PM",
  "suggested_hashtags": ["tag1", "tag2"]
}
`;
}
