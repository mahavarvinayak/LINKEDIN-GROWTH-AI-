"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
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

interface RatingItem {
  display_name: string;
  rating: number;
  opinion: string;
  created_at: string;
}

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
  const [ratingsFeed, setRatingsFeed] = useState<RatingItem[]>([]);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is logged in via Supabase
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setIsLoggedIn(true);
        setAuthChecked(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (isLoggedIn) {
      setShowSignupGate(false);
      return;
    }

    const hasAnalyzed = localStorage.getItem("linkedin_ai_analyzed");
    if (hasAnalyzed === "true") {
      setShowSignupGate(true);
    }
  }, [isLoggedIn, authChecked]);

  useEffect(() => {
    let isMounted = true;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/ratings", { cache: "force-cache" });
        if (!response.ok || !isMounted) return;

        const payload = await response.json();
        if (isMounted) {
          setRatingsFeed(payload.ratings || []);
        }
      } catch (error) {
        console.error("Failed to load ratings feed:", error);
      }
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const handleAnalyze = async () => {
    if (postContent.trim().length < 20) return;

    // Check if user has already used their free analysis
    if (!isLoggedIn && authChecked) {
      const hasAnalyzed = localStorage.getItem("linkedin_ai_analyzed");
      if (hasAnalyzed === "true") {
        // Show signup gate immediately — don't allow analysis
        setShowSignupGate(true);
        return;
      }
    }

    setView("loading");
    setAnalyzeError(null);

    try {
      const endpoint = isLoggedIn ? "/api/analyze" : "/api/analyze-public";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postContent }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze post");

      setResult(data);

      // Mark that user has used their free analysis
      if (!isLoggedIn) {
        localStorage.setItem("linkedin_ai_analyzed", "true");
        setShowSignupGate(true);
      }

      setView("results");
    } catch (error: unknown) {
      console.error("Analysis failed:", error);
      const message = error instanceof Error ? error.message : "Something went wrong. Try again.";
      setAnalyzeError(message);
      setView("input");
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/10">
      {/* ======================== INPUT STATE ======================== */}
      {view === "input" && (
          <div key="input">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2">
                <img src="/brand/lunvo-logo.png" alt="LUNVO logo" className="w-4 h-4 rounded-[3px] object-contain" />
                <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-on-background">LUNVO</span>
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
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-primary/80 mb-5">LUNVO • Smarter LinkedIn content. Zero guesswork.</p>
              <h1 className="text-6xl md:text-7xl font-serif text-on-background leading-[1.05] mb-6">
                Is your post<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  scroll-worthy?
                </span>
              </h1>

              <p className="text-xl font-medium text-on-surface-variant max-w-lg mx-auto mb-14 leading-relaxed">
                Paste your LinkedIn post below. Get a free AI-powered editorial score based on 10,000+ viral posts — in seconds.
              </p>

              {showSignupGate && !isLoggedIn ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    You&apos;ve used your free analysis
                  </h2>
                  <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto">
                    Sign up free to analyze unlimited posts, generate content,
                    and track your LinkedIn growth.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="/signup"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl text-base transition-colors"
                    >
                      Create free account →
                    </a>
                    <a
                      href="/login"
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-xl text-base transition-colors"
                    >
                      Log in
                    </a>
                  </div>

                  <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-sm mx-auto text-left">
                    <p className="text-sm font-medium text-gray-700 mb-3">Free account includes:</p>
                    <ul className="space-y-2">
                      {[
                        "2 post analyses per day",
                        "1 post generation per day",
                        "Writing streak tracker",
                        "30-day LinkedIn learning course",
                        "Saved drafts"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-gray-400 mt-6">
                    No credit card required. Free forever.
                  </p>
                </div>
              ) : (
                <>
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
                  {analyzeError && (
                    <div className="max-w-4xl mx-auto px-6 mt-4">
                      <div className="flex items-center gap-3 p-4 rounded-[8px] bg-red-50 border border-red-200">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">{analyzeError}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {ratingsFeed.length > 0 && (
              <div className="max-w-5xl mx-auto px-6 pb-10">
                <div className="overflow-hidden rounded-[12px] border border-[rgba(229,226,218,0.5)] bg-surface-container-lowest p-3 shadow-premium">
                  <div className="rating-track flex w-max items-center gap-3">
                    {[...ratingsFeed, ...ratingsFeed].map((item, idx) => (
                      <div
                        key={`${item.display_name}-${item.created_at}-${idx}`}
                        className="min-w-[280px] rounded-[8px] border border-[rgba(229,226,218,0.5)] bg-white px-3 py-2"
                      >
                        <p className="text-[0.75rem] font-semibold text-on-background">
                          {item.display_name} rated {"★".repeat(item.rating)}
                        </p>
                        <p className="text-[0.72rem] text-on-surface-variant line-clamp-1">{item.opinion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
          </div>
      )}

      {/* ======================== LOADING STATE ======================== */}
      {view === "loading" && (
          <div
            key="loading"
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
          </div>
      )}

      {/* ======================== RESULTS STATE ======================== */}
      {view === "results" && (
          <div
            key="results"
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
          </div>
      )}

      <div className="overflow-hidden border-y border-[rgba(229,226,218,0.4)] bg-surface-container-lowest py-4">
        <div className="credit-track flex w-max items-center gap-10 px-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <p
              key={idx}
              className="text-[1.125rem] md:text-[1.75rem] font-serif font-bold uppercase tracking-[0.08em] text-on-background/85 whitespace-nowrap"
            >
              Built with love by VINAYAK MAHAVAR
            </p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container py-20 border-t border-[rgba(229,226,218,0.3)]">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="inline-flex items-center gap-2 mb-6">
              <img src="/brand/lunvo-logo.png" alt="LUNVO logo" className="w-5 h-5 rounded-[4px] object-contain" />
              <span className="font-serif italic text-2xl text-on-background">LUNVO</span>
            </div>
            <p className="text-[0.9375rem] text-on-surface-variant max-w-sm leading-relaxed mb-8">
              Smarter LinkedIn content. Zero guesswork.
            </p>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/the-%CF%80-lab/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors ring-1 ring-[rgba(229,226,218,0.4)]">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-6">Product</h4>
            <ul className="space-y-4 text-[0.875rem] font-medium text-on-surface-variant">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              <li><Link href="/onboarding" className="hover:text-primary transition-colors">Persona Setup</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-6">Help & Legal</h4>
            <ul className="space-y-4 text-[0.875rem] font-medium text-on-surface-variant">
              <li><Link href="/support" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:mahavarvinayak@gmail.com" className="hover:text-primary transition-colors">mahavarvinayak@gmail.com</a></li>
              <li><a href="https://www.thepilab.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">THE Π LAB Website</a></li>
              <li><a href="https://www.linkedin.com/company/the-%CF%80-lab/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">THE Π LAB LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 mt-20 pt-10 border-t border-[rgba(229,226,218,0.3)] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[0.6875rem] text-on-surface-variant/40 font-mono uppercase tracking-widest">
            © 2024 THE Π LAB — MERCHANT: MAHAVAR VINAYAK DILIPKUMAR
          </p>
          <div className="flex gap-6 text-[0.6875rem] font-mono font-bold uppercase tracking-tighter text-on-surface-variant/30">
             <span>v4.2.0-stable</span>
             <span>Status: All Nodes Green</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .rating-track {
          animation: rating-scroll 32s linear infinite;
        }

        .credit-track {
          animation: credit-scroll 18s linear infinite;
        }

        @keyframes rating-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes credit-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}
