/**
 * Environment Variable Check Script
 * Logs status of required environment variables.
 */

const requiredEnvs = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY"
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

if (missing) {
  console.log("\n⚠️  Some required environment variables are missing.");
  process.exit(1);
} else {
  console.log("\n✨ All required environment variables are present.");
}
