# LUNVO

Analyze, improve, and generate LinkedIn posts with AI. Get a score for your hook, readability, and engagement instantly.

Built by THE Π LAB
- Website: https://www.thepilab.in
- LinkedIn: https://www.linkedin.com/company/the-%CF%80-lab/
- Support: hello@thepilab.in

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Database & Auth:** Supabase
- **AI Routing:** NVIDIA NIM (primary, round-robin) with Gemini and Groq fallbacks
- **Styling:** Tailwind CSS

## Getting Started

### 1. Prerequisites

Ensure you have Node.js 18+ installed.

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

You will need:
- [Supabase](https://supabase.com/) project URL and Anon key.
- [NVIDIA NIM](https://build.nvidia.com/) API key(s) for primary generation.
- [Google AI Studio](https://aistudio.google.com/) Gemini Key (fallback).
- [Groq Console](https://console.groq.com/) API Key (fallback).

### Cashfree Payment Testing (Sandbox)

1. Log in to Cashfree Merchant Dashboard.
2. Switch to `Test` mode.
3. Generate API keys from Developers > API Keys.
4. Copy keys into `.env.local`:

```bash
CASHFREE_ENV="sandbox"
CASHFREE_APP_ID="TEST_..."
CASHFREE_SECRET_KEY="TEST_..."
NEXT_PUBLIC_CASHFREE_MODE="sandbox"
```

Notes:
- Sandbox keys always start with `TEST_`.
- Do not share production keys (`PROD_`) for testing.
- Share only sandbox credentials for QA/demo testing.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
