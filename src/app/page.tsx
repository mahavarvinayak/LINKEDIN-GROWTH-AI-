"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronLeft,
  Users,
  Zap,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

// --- Types ---
interface Score {
  score: number;
  label: string;
  explanation: string;
}

interface AnalysisResult {
  scores: {
    hook: Score;
    readability: Score;
    engagement: Score;
    structure: Score;
  };
  overall_score: number;
  top_problems: string[];
  improved_post: string;
  improvement_summary: string;
}

const SOCIAL_PROOF = [
  { initials: "AR", color: "#2563eb" },
  { initials: "SJ", color: "#7c3aed" },
  { initials: "MK", color: "#059669" },
  { initials: "LP", color: "#d97706" },
];

const FEATURES = [
  { icon: BarChart3, label: "Hook Score", desc: "AI rates your opening line against 10K viral posts." },
  { icon: Zap, label: "Instant Rewrite", desc: "Get an improved version of your post in seconds." },
  { icon: BookOpen, label: "Editorial Report", desc: "Actionable breakdown across 4 signal categories." },
  { icon: Users, label: "Persona-matched", desc: "Results tailored to your audience and voice." },
];

export default function LandingPage() {
  const [view, setView] = useState<"input" | "loading" | "results">("input");
  const [postContent, setPostContent] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (postContent.trim().length < 20) return;
    setView("loading");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postContent }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze post");

      setResult(data);
      setView("results");
    } catch (error: any) {
      console.error("Analysis failed:", error);
      alert(error.message || "Something went wrong. Please try again.");
      setView("input");
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/10">
      <AnimatePresence mode="wait">

        {/* ======================== INPUT STATE ======================== */}
        {view === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-primary to-primary-container rounded-[3px]" />
                <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-on-background">Growth.AI</span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-[0.8125rem] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors font-mono"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-[0.8125rem] font-bold rounded-[8px] uppercase tracking-wider shadow-md hover:shadow-premium transition-all"
                >
                  Get Started
                </Link>
              </div>
            </nav>

            {/* Hero */}
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-[6px] ring-1 ring-primary/10 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-primary font-mono">
                  Trusted by 5,000+ LinkedIn creators
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-serif text-on-background leading-[1.05] mb-6">
                Is your post<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  scroll-worthy?
                </span>
              </h1>

              <p className="text-xl font-medium text-on-surface-variant max-w-lg mx-auto mb-14 leading-relaxed">
                Paste your LinkedIn post below. Get a free AI-powered editorial score based on 10,000+ viral posts — in seconds.
              </p>

              {/* Input Card */}
              <div className="bg-surface-container-lowest rounded-[16px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium focus-within:ring-primary/30 transition-all text-left">
                <textarea
                  placeholder="Start writing or paste your post here…"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full min-h-[200px] bg-transparent border-none focus:ring-0 text-[1rem] font-mono resize-none p-8 leading-relaxed text-on-background placeholder:text-on-surface-variant/30 outline-none"
                />
                <div className="flex items-center justify-between px-8 py-5 border-t border-[rgba(229,226,218,0.4)]">
                  <span className="text-[0.625rem] font-bold font-mono text-on-surface-variant/40 uppercase tracking-widest">
                    {postContent.length} characters — no signup required
                  </span>
                  <button
                    onClick={handleAnalyze}
                    disabled={postContent.trim().length < 20}
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 py-3.5 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98]"
                  >
                    Analyze for Free <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-4 mb-20">
              <div className="flex -space-x-2.5">
                {SOCIAL_PROOF.map(({ initials, color }) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[0.5625rem] font-bold text-white"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[0.8125rem] font-medium text-on-surface-variant italic">
                1,200+ creators joined this month
              </span>
            </div>

            {/* Feature Strip */}
            <div className="max-w-5xl mx-auto px-6 pb-24">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FEATURES.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="p-6 bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium hover:ring-primary/15 transition-all"
                  >
                    <div className="w-9 h-9 bg-primary/5 rounded-[8px] flex items-center justify-center mb-4">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="text-[0.875rem] font-bold text-on-background mb-1">{label}</div>
                    <div className="text-[0.8125rem] font-medium text-on-surface-variant leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================== LOADING STATE ======================== */}
        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-serif text-on-background mb-2">Running editorial analysis…</h2>
            <p className="text-[0.875rem] font-medium text-on-surface-variant mb-8">Cross-referencing 10,000+ viral post patterns</p>
            <div className="space-y-3 w-full max-w-xs">
              <div className="h-2 bg-surface-container rounded-full animate-pulse w-4/5" />
              <div className="h-2 bg-surface-container rounded-full animate-pulse w-full" />
              <div className="h-2 bg-surface-container rounded-full animate-pulse w-3/5" />
            </div>
          </motion.div>
        )}

        {/* ======================== RESULTS STATE ======================== */}
        {view === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto py-14 px-6"
          >
            {/* Top nav */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <button
                  onClick={() => setView("input")}
                  className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60 hover:text-primary transition-colors font-mono mb-4"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> New Analysis
                </button>
                <h2 className="text-4xl font-serif text-on-background">Editorial Report</h2>
              </div>
              <div className="bg-surface-container-lowest rounded-[12px] p-5 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium flex items-center gap-5">
                <div>
                  <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1">Overall Quality</div>
                  <div className={`text-4xl font-serif leading-none ${(result?.overall_score ?? 0) <= 4 ? "text-error" :
                      (result?.overall_score ?? 0) <= 6 ? "text-tertiary" : "text-secondary"
                    }`}>
                    {result?.overall_score}<span className="text-xl text-on-surface-variant/30">/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {result && Object.entries(result.scores).map(([key, value]) => (
                <div key={key} className="bg-surface-container-lowest rounded-[12px] p-6 ring-1 ring-[rgba(229,226,218,0.4)] hover:shadow-premium transition-all">
                  <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-3">{key}</div>
                  <div className={`text-3xl font-serif mb-3 ${value.score <= 4 ? "text-error" : value.score <= 6 ? "text-tertiary" : "text-secondary"
                    }`}>
                    {value.score}<span className="text-base text-on-surface-variant/30">/10</span>
                  </div>
                  <p className="text-[0.8125rem] font-medium text-on-surface-variant leading-relaxed">{value.explanation}</p>
                </div>
              ))}
            </div>

            {/* Problems + Rewrite */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium border-l-2 border-error">
                <div className="flex items-center gap-2 text-error font-bold mb-5 text-[0.875rem] uppercase tracking-wider font-mono">
                  <AlertCircle className="w-4 h-4" /> Identify & Eliminate
                </div>
                <ul className="space-y-4">
                  {result?.top_problems.map((problem, i) => (
                    <li key={i} className="flex gap-3 text-on-surface font-medium text-[0.9375rem] leading-relaxed">
                      <span className="text-error/30 font-mono">—</span> {problem}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium border-l-2 border-primary">
                <div className="flex items-center gap-2 text-primary font-bold mb-5 text-[0.875rem] uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-4 h-4" /> Executive Rewrite
                </div>
                <div className="bg-surface-2 rounded-[8px] p-5 text-[0.9375rem] text-on-background font-mono whitespace-pre-wrap leading-[1.8]">
                  {result?.improved_post}
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-[12px] p-12 text-center text-on-primary relative overflow-hidden shadow-premium">
              <div className="absolute -top-6 -right-6 opacity-[0.06] pointer-events-none">
                <BarChart3 className="w-56 h-56 text-white" />
              </div>
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-3xl font-serif mb-4">Scale your editorial precision.</h3>
                <p className="text-on-primary/80 font-medium text-[0.95rem] mb-10 leading-relaxed">
                  Join the platform. Every post you write will be automatically optimized to match your brand voice, career goals, and target audience.
                </p>
                <Link
                  href="/signup"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-on-primary px-8 py-3.5 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all inline-flex items-center gap-2"
                >
                  Create your free profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
