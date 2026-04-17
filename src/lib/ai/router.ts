import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

let _gemini: GoogleGenerativeAI | null = null;
let _groq: Groq | null = null;

type NvidiaTextClient = {
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
};

type QualityProfile = {
  temperature: number;
  topP: number;
  maxTokensCap: number;
  thinking: boolean;
};

type UsageEntry = {
  count: number;
  lastReset: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_MINUTE = 40;

const usage: Record<string, UsageEntry> = {};

const NIM_DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const PREMIUM_DEFAULT_MODEL = "moonshotai/kimi-k2-instruct";
const SHARED_DEFAULT_MODEL = "deepseek-ai/deepseek-v3.1-terminus";

function getEnvValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function resolveNvidiaEndpoint(baseURL: string): string {
  const trimmed = baseURL.trim().replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(trimmed)) {
    return trimmed;
  }
  if (/\/v1$/i.test(trimmed)) {
    return `${trimmed}/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const premiumClient: NvidiaTextClient = {
  name: "nvidia_premium_kimi",
  apiKey: getEnvValue("NVIDIA_PREMIUM_API_KEY", "NVIDIA_NIM_API_KEY_1"),
  baseURL: getEnvValue("NVIDIA_PREMIUM_BASE_URL", "NVIDIA_NIM_BASE_URL_1", "NVIDIA_NIM_BASE_URL") || NIM_DEFAULT_BASE_URL,
  model: getEnvValue("NVIDIA_PREMIUM_MODEL", "NVIDIA_NIM_MODEL_1", "NVIDIA_NIM_MODEL") || PREMIUM_DEFAULT_MODEL,
};

const sharedClient: NvidiaTextClient = {
  name: "nvidia_shared_deepseek",
  apiKey: getEnvValue("NVIDIA_SHARED_API_KEY", "NVIDIA_NIM_API_KEY_2"),
  baseURL: getEnvValue("NVIDIA_SHARED_BASE_URL", "NVIDIA_NIM_BASE_URL_2", "NVIDIA_NIM_BASE_URL") || NIM_DEFAULT_BASE_URL,
  model: getEnvValue("NVIDIA_SHARED_MODEL", "NVIDIA_NIM_MODEL_2", "NVIDIA_NIM_MODEL") || SHARED_DEFAULT_MODEL,
};

const FREE_QUALITY_PROFILE: QualityProfile = {
  temperature: 0.2,
  topP: 0.7,
  maxTokensCap: 900,
  thinking: false,
};

const PRO_QUALITY_PROFILE: QualityProfile = {
  temperature: 0.2,
  topP: 0.7,
  maxTokensCap: 4096,
  thinking: true,
};

const PREMIUM_QUALITY_PROFILE: QualityProfile = {
  temperature: 0.6,
  topP: 0.9,
  maxTokensCap: 4096,
  thinking: false,
};

function resolvePlanTier(userPlan: UserPlan): "free" | "pro" | "premium" {
  if (userPlan === "starter" || userPlan === "premium") {
    return "premium";
  }
  if (userPlan === "pro") {
    return "pro";
  }
  return "free";
}

function hasEnv(key: string): boolean {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function getUsageEntry(clientName: string): UsageEntry {
  const now = Date.now();
  const existing = usage[clientName];

  if (!existing) {
    const next: UsageEntry = { count: 0, lastReset: now };
    usage[clientName] = next;
    return next;
  }

  if (now - existing.lastReset >= RATE_LIMIT_WINDOW_MS) {
    existing.count = 0;
    existing.lastReset = now;
  }

  return existing;
}

function canUseClient(clientName: string): boolean {
  const entry = getUsageEntry(clientName);
  return entry.count < MAX_REQUESTS_PER_MINUTE;
}

function markClientUsed(clientName: string): void {
  const entry = getUsageEntry(clientName);
  entry.count += 1;
}

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
  gemini: "gemini-1.5-flash",
  groq_fallback: "llama-3.1-8b-instant",
};

// ─── User Plan Type ──────────────────────────────────────────
export type UserPlan = "free" | "starter" | "pro" | "premium";

// ─── Main Router Function ─────────────────────────────────────
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  userPlan: UserPlan,
  temperature: number = 0.5,
  maxTokens: number = 1000
): Promise<string> {
  const hasGroq = hasEnv("GROQ_API_KEY");
  const hasGemini = hasEnv("GEMINI_API_KEY");
  const hasPremiumNvidia = premiumClient.apiKey.length > 0;
  const hasSharedNvidia = sharedClient.apiKey.length > 0;

  const tier = resolvePlanTier(userPlan);

  if (!hasPremiumNvidia && !hasSharedNvidia && !hasGroq && !hasGemini) {
    throw new Error("No AI provider configured. Set NVIDIA_PREMIUM_API_KEY or NVIDIA_SHARED_API_KEY (or NVIDIA_NIM_API_KEY_1/2), GEMINI_API_KEY, or GROQ_API_KEY.");
  }

  const providerErrors: string[] = [];

  if (tier === "premium") {
    if (hasPremiumNvidia) {
      try {
        return await callNvidia(premiumClient, PREMIUM_QUALITY_PROFILE, systemPrompt, userPrompt, temperature, maxTokens);
      } catch (error) {
        providerErrors.push(`premium model failed: ${normalizeError(error)}`);
        console.warn("Premium NVIDIA call failed:", error);
      }
    } else {
      providerErrors.push("premium model missing NVIDIA_PREMIUM_API_KEY");
    }
  }

  if (tier === "pro" || tier === "free" || providerErrors.length > 0) {
    if (hasSharedNvidia) {
      const profile = tier === "free" ? FREE_QUALITY_PROFILE : PRO_QUALITY_PROFILE;
      try {
        return await callNvidia(sharedClient, profile, systemPrompt, userPrompt, temperature, maxTokens);
      } catch (error) {
        providerErrors.push(`shared model failed: ${normalizeError(error)}`);
        console.warn("Shared NVIDIA call failed:", error);
      }
    } else {
      providerErrors.push("shared model missing NVIDIA_SHARED_API_KEY");
    }
  }

  if (hasGemini) {
    try {
      return await callGemini(systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      providerErrors.push(`gemini fallback failed: ${normalizeError(error)}`);
      console.warn("Gemini fallback failed:", error);
    }
  } else {
    providerErrors.push("gemini fallback unavailable (missing GEMINI_API_KEY)");
  }

  if (hasGroq) {
    try {
      return await callGroq(systemPrompt, userPrompt, MODELS.groq_fallback, temperature, maxTokens);
    } catch (error) {
      providerErrors.push(`groq fallback failed: ${normalizeError(error)}`);
      console.warn("Groq fallback failed:", error);
    }
  } else {
    providerErrors.push("groq fallback unavailable (missing GROQ_API_KEY)");
  }

  const details = providerErrors.join(" | ");
  throw new Error(`All AI providers failed. ${details}`.trim());
}

// ─── NVIDIA NIM Call (Primary) ───────────────────────────────
async function callNvidia(
  client: NvidiaTextClient,
  profile: QualityProfile,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  if (!canUseClient(client.name)) {
    throw new Error(`${client.name} rate limit reached (${MAX_REQUESTS_PER_MINUTE}/min)`);
  }

  markClientUsed(client.name);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(resolveNvidiaEndpoint(client.baseURL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${client.apiKey}`,
      },
      body: JSON.stringify({
        model: client.model,
        temperature: clamp((profile.temperature + temperature) / 2, 0, 2),
        top_p: clamp(profile.topP, 0, 1),
        max_tokens: Math.max(1, Math.min(maxTokens, profile.maxTokensCap)),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...(profile.thinking
          ? {
              extra_body: {
                chat_template_kwargs: {
                  thinking: true,
                },
              },
            }
          : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`status ${response.status}: ${errorText.slice(0, 240)}`);
    }

    const payload: any = await response.json();
    const text =
      payload?.choices?.[0]?.message?.content ||
      payload?.output_text ||
      payload?.text ||
      "";

    if (!text || typeof text !== "string") {
      throw new Error("empty response payload from NVIDIA NIM");
    }

    return text;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("request timeout after 15s");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Gemini Call (Paid Users) ─────────────────────────────────
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const model = getGemini().getGenerativeModel({
    model: MODELS.gemini,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
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
  temperature: number,
  maxTokens: number
): Promise<string> {
  const completion = await getGroq().chat.completions.create({
    model: modelName,
    temperature: temperature,
    max_tokens: maxTokens,
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
