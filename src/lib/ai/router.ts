import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// ─── Lazy Client Initialization ──────────────────────────────
// We defer construction so that missing env vars during `next build`
// don't crash the process. Clients are created on first use only.
let _gemini: GoogleGenerativeAI | null = null;
let _groq: Groq | null = null;
let nvidiaClientIndex = 0;

type NvidiaTextClient = {
  name: string;
  provider: "nvidia";
  type: "text";
  apiKey: string;
  baseURL: string;
  model: string;
};

type FallbackClient = {
  name: "gemini" | "groq";
  provider: "gemini" | "groq";
};

type UsageEntry = {
  count: number;
  lastReset: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_MINUTE = 40;

const usage: Record<string, UsageEntry> = {};

const NIM_DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";

function normalizeNimEndpoint(baseURL: string): string {
  const trimmed = baseURL.trim().replace(/\/+$/, "");
  if (/\/v1\/chat\/completions$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}/v1/chat/completions`;
}

const configuredNvidiaClients: NvidiaTextClient[] = [
  {
    name: "nvidia_text_1",
    provider: "nvidia",
    type: "text",
    apiKey: process.env.NVIDIA_NIM_API_KEY_1 || "",
    baseURL: process.env.NVIDIA_NIM_BASE_URL_1 || process.env.NVIDIA_NIM_BASE_URL || NIM_DEFAULT_BASE_URL,
    model: process.env.NVIDIA_NIM_MODEL_1 || process.env.NVIDIA_NIM_MODEL || NIM_DEFAULT_MODEL,
  },
  {
    name: "nvidia_text_2",
    provider: "nvidia",
    type: "text",
    apiKey: process.env.NVIDIA_NIM_API_KEY_2 || "",
    baseURL: process.env.NVIDIA_NIM_BASE_URL_2 || process.env.NVIDIA_NIM_BASE_URL || NIM_DEFAULT_BASE_URL,
    model: process.env.NVIDIA_NIM_MODEL_2 || process.env.NVIDIA_NIM_MODEL || NIM_DEFAULT_MODEL,
  },
];

const apiClients: NvidiaTextClient[] = configuredNvidiaClients.filter(
  (client) => client.apiKey.trim().length > 0
);

const fallbackClients: FallbackClient[] = [
  { name: "gemini", provider: "gemini" },
  { name: "groq", provider: "groq" },
];

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

function getNextClient(): NvidiaTextClient {
  const client = apiClients[nvidiaClientIndex % apiClients.length];
  nvidiaClientIndex += 1;
  return client;
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
export type UserPlan = "free" | "starter" | "pro";

// ─── Main Router Function ─────────────────────────────────────
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  userPlan: UserPlan,
  temperature: number = 0.5,
  maxTokens: number = 1000
): Promise<string> {
  void userPlan;

  const hasGroq = hasEnv("GROQ_API_KEY");
  const hasGemini = hasEnv("GEMINI_API_KEY");
  const hasNvidia = apiClients.length > 0;

  if (!hasNvidia && !hasGroq && !hasGemini) {
    throw new Error("No AI provider configured. Set NVIDIA_NIM_API_KEY_1/2, GEMINI_API_KEY, or GROQ_API_KEY.");
  }

  const nvidiaErrors: string[] = [];

  // FEATURE: Round-robin load balancing across NVIDIA clients.
  for (let attempt = 0; attempt < apiClients.length; attempt += 1) {
    const client = getNextClient();

    if (!canUseClient(client.name)) {
      nvidiaErrors.push(`${client.name}: rate limit reached (${MAX_REQUESTS_PER_MINUTE}/min)`);
      continue;
    }

    markClientUsed(client.name);

    try {
      return await callNvidia(client, systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      const message = normalizeError(error);
      nvidiaErrors.push(`${client.name}: ${message}`);
      console.warn(`NVIDIA client failed (${client.name}):`, message);
    }
  }

  const fallbackErrors: string[] = [];

  for (const fallback of fallbackClients) {
    if (fallback.provider === "gemini") {
      if (!hasGemini) {
        fallbackErrors.push("gemini: missing GEMINI_API_KEY");
        continue;
      }

      try {
        return await callGemini(systemPrompt, userPrompt, temperature, maxTokens);
      } catch (error) {
        fallbackErrors.push(`gemini: ${normalizeError(error)}`);
        console.warn("Gemini fallback failed:", error);
      }
      continue;
    }

    if (fallback.provider === "groq") {
      if (!hasGroq) {
        fallbackErrors.push("groq: missing GROQ_API_KEY");
        continue;
      }

      try {
        return await callGroq(systemPrompt, userPrompt, MODELS.groq_fallback, temperature, maxTokens);
      } catch (error) {
        fallbackErrors.push(`groq: ${normalizeError(error)}`);
        console.warn("Groq fallback failed:", error);
      }
    }
  }

  const details = [...nvidiaErrors, ...fallbackErrors].join(" | ");
  throw new Error(`All AI providers failed. ${details}`.trim());
}

// ─── NVIDIA NIM Call (Primary) ───────────────────────────────
async function callNvidia(
  client: NvidiaTextClient,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(normalizeNimEndpoint(client.baseURL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${client.apiKey}`,
      },
      body: JSON.stringify({
        model: client.model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
