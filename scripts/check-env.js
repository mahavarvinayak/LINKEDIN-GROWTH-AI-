/**
 * Environment Variable Check Script
 * Logs status of required environment variables.
 */

const requiredEnvs = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const aiProviderEnvs = [
  "NVIDIA_PREMIUM_API_KEY",
  "NVIDIA_SHARED_API_KEY",
  "NVIDIA_NIM_API_KEY_1",
  "NVIDIA_NIM_API_KEY_2",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
];

console.log("🔍 Checking Environment Variables...");

let missing = false;

requiredEnvs.forEach((env) => {
  if (process.env[env]) {
    console.log(`✅ ${env} is set.`);
  } else {
    console.log(`❌ ${env} is MISSING.`);
    missing = true;
  }
});

const configuredAiProviders = aiProviderEnvs.filter((env) => Boolean(process.env[env]));

if (configuredAiProviders.length === 0) {
  console.log("❌ No AI provider key is configured.");
  console.log("   Set NVIDIA_PREMIUM_API_KEY and NVIDIA_SHARED_API_KEY (recommended), or fallback keys.");
  missing = true;
} else {
  console.log(`✅ AI providers configured: ${configuredAiProviders.join(", ")}`);
}

const hasPremiumNvidia = Boolean(process.env.NVIDIA_PREMIUM_API_KEY || process.env.NVIDIA_NIM_API_KEY_1);
const hasSharedNvidia = Boolean(process.env.NVIDIA_SHARED_API_KEY || process.env.NVIDIA_NIM_API_KEY_2);

if (!hasPremiumNvidia) {
  console.log("⚠️  Premium NVIDIA key missing. Starter/Premium users will fall back to shared/fallback providers.");
}

if (!hasSharedNvidia) {
  console.log("⚠️  Shared NVIDIA key missing. Free/Pro users will fall back to Gemini/Groq.");
}

if (!hasPremiumNvidia && !hasSharedNvidia) {
  console.log("⚠️  NVIDIA NIM keys are not configured. Traffic will use fallback providers only.");
}

if (missing) {
  console.log("\n⚠️  Some required environment variables are missing.");
  process.exit(1);
} else {
  console.log("\n✨ All required environment variables are present.");
}
