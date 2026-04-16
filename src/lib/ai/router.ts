import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// ─── Lazy Client Initialization ──────────────────────────────
// We defer construction so that missing env vars during `next build`
// don't crash the process. Clients are created on first use only.
let _gemini: GoogleGenerativeAI | null = null;
let _groq: Groq | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!_gemini) {
    _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _gemini;
}

function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  }
  return _groq;
}

// ─── Model Names ─────────────────────────────────────────────
const MODELS = {
  gemini: "gemini-1.5-flash",       // paid users — best quality
  groq_free: "llama-3.1-8b-instant", // free users — fast
  groq_fallback: "llama-3.3-70b-versatile", // fallback — good and large
};

// ─── User Plan Type ──────────────────────────────────────────
export type UserPlan = "free" | "starter" | "pro";

// ─── Main Router Function ─────────────────────────────────────
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  userPlan: UserPlan,
  temperature: number = 0.5
): Promise<string> {

  // Route based on user plan
  if (userPlan === "free") {
    // Free users → Groq 8B first, Gemini fallback (within free RPM) or Groq 70B
    try {
      return await callGroq(systemPrompt, userPrompt, MODELS.groq_free, temperature);
    } catch (error) {
      console.log("Groq 8B failed, falling back to Groq 70B:", error);
      return await callGroq(systemPrompt, userPrompt, MODELS.groq_fallback, temperature);
    }
  } else {
    // Paid users (starter/pro) → Gemini first, Groq 70B fallback
    try {
      return await callGemini(systemPrompt, userPrompt, temperature);
    } catch (error) {
      console.log("Gemini failed, falling back to Groq 70B:", error);
      return await callGroq(systemPrompt, userPrompt, MODELS.groq_fallback, temperature);
    }
  }
}

// ─── Gemini Call (Paid Users) ─────────────────────────────────
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  temperature: number
): Promise<string> {
  const model = getGemini().getGenerativeModel({
    model: MODELS.gemini,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: 1200,
    },
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();

  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

// ─── Groq Call (Free & Fallback) ─────────────────────────────
async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  modelName: string,
  temperature: number
): Promise<string> {
  const completion = await getGroq().chat.completions.create({
    model: modelName,
    temperature: temperature,
    max_tokens: 1200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

// ─── JSON Parser Helper ───────────────────────────────────────
export function parseAIJson<T>(rawText: string): T {
  // 1. Initial cleanup
  let cleaned = rawText.trim();

  // 2. Remove markdown backticks if present (including variations like ```json or ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch (initialError) {
    // 3. Heuristic: Try to find the first '{' and last '}'
    const startIndex = cleaned.indexOf("{");
    const endIndex = cleaned.lastIndexOf("}");

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonContent = cleaned.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(jsonContent) as T;
      } catch (nestedError) {
        console.error("Failed to parse extracted JSON block:", jsonContent);
      }
    }

    // 4. Last resort: Clean common AI mistakes like trailing commas
    const repaired = cleaned
      .replace(/,\s*([\]}])/g, "$1") // Remove trailing commas
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // Ensure keys are quoted (if missing)

    try {
      return JSON.parse(repaired) as T;
    } catch {
      console.error("All AI JSON parsing attempts failed for text:", rawText);
      throw new Error("Could not parse AI response as valid data structure.");
    }
  }
}
