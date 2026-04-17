# LinkedIn AI Growth Assistant

Analyze, improve, and generate LinkedIn posts with AI. Get a score for your hook, readability, and engagement instantly.

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

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
