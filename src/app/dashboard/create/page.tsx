"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  RotateCcw, 
  Bookmark, 
  BarChart2,
  Clock,
  Hash,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// --- Types ---
interface GeneratedPost {
  post: string;
  hook_type: string;
  estimated_scores: {
    hook: number;
    readability: number;
    engagement: number;
    structure: number;
  };
  best_time_to_post: string;
  suggested_hashtags: string[];
}

const PROMPT_SPARKS = [
  "Why I quit my job at 28",
  "Lessons from my failed startup",
  "3 common myths about AI",
  "The mistake that changed my career",
];

export default function CreatePostPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [userData, setUserData] = useState<{ credits_generate: number; plan: string } | null>(null);
  const supabase = createClient();

  // 1. Fetch User Data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("credits_generate, plan")
        .eq("id", user.id)
        .single();

      if (profile) setUserData(profile);
    };
    fetchUser();
  }, [supabase]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "no_credits") {
          alert("No credits remaining. Please upgrade your plan.");
          return;
        }
        throw new Error(data.error || "Generation failed");
      }

      setResult(data);
      setStep(2);
    } catch (err: any) {
      console.error("Generation error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!result?.post) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        type: "draft",
        topic: topic,
        improved_content: result.post,
        hook_score: result.estimated_scores.hook,
        engagement_score: result.estimated_scores.engagement,
        structure_score: result.estimated_scores.structure,
        readability_score: result.estimated_scores.readability,
        overall_score: (result.estimated_scores.hook + result.estimated_scores.engagement + result.estimated_scores.structure + result.estimated_scores.readability) / 4
      });

      if (error) throw error;
      alert("Draft saved successfully!");
      router.push("/dashboard/drafts");
    } catch (err: any) {
      console.error("Save draft error:", err);
      alert(err.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">

        {/* Step 1: Input */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="pt-2">
              <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-2">Content Studio</p>
              <h1 className="text-4xl font-serif text-on-background mb-2">What's on your mind?</h1>
              <p className="text-[0.95rem] font-medium text-on-surface-variant">Describe your topic, idea, or story. The AI will craft a high-impact post around it.</p>
            </div>

            {/* Input Box */}
            <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium focus-within:ring-primary/30 transition-all">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: I failed my first client pitch, but then I realized the one lesson nobody talks about..."
                className="w-full min-h-[200px] bg-transparent border-none focus:ring-0 text-[1rem] font-mono resize-none p-6 leading-relaxed text-on-background placeholder:text-on-surface-variant/30 outline-none"
              />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-t border-[rgba(229,226,218,0.4)]">
                <span className="text-[0.6875rem] font-bold font-mono text-on-surface-variant/40 uppercase tracking-widest">
                  {topic.length} characters
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || loading || !!(userData && userData.credits_generate <= 0)}
                  className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {userData && userData.credits_generate <= 0 ? "No Credits" : "Generate Post"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prompt Sparks */}
            <div>
              <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-3">Prompt Sparks</p>
              <div className="flex flex-wrap gap-2">
                {PROMPT_SPARKS.map((spark) => (
                  <button
                    key={spark}
                    onClick={() => setTopic(spark)}
                    className="px-4 py-2 bg-surface-2 text-on-surface-variant text-[0.8125rem] font-medium rounded-[6px] ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary transition-all"
                  >
                    {spark}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Result */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Back Nav */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60 hover:text-primary transition-colors font-mono"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Topic
              </button>
              <div className="px-3 py-1 bg-secondary/10 text-secondary text-[0.5625rem] font-bold uppercase tracking-widest rounded-[4px] font-mono ring-1 ring-secondary/20">
                AI Optimized ✦
              </div>
            </div>

            {/* Generated Post Card */}
            <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
              {/* Post Content */}
              <div className="p-8">
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-4">Generated Draft</p>
                <div className="whitespace-pre-wrap text-[1rem] text-on-background leading-[1.8] font-mono">
                  {result?.post}
                </div>
              </div>

              {/* Score Footer */}
              <div className="bg-surface-2 border-t border-[rgba(229,226,218,0.4)] px-8 py-4 flex flex-wrap gap-6 items-center">
                <ScoreChip label="Hook" score={result?.estimated_scores.hook} />
                <ScoreChip label="Engagement" score={result?.estimated_scores.engagement} />
                <ScoreChip label="Structure" score={result?.estimated_scores.structure} />
                <div className="h-4 w-px bg-[rgba(229,226,218,0.6)] hidden md:block" />
                <div className="flex items-center gap-2 text-[0.6875rem] font-bold text-on-surface-variant font-mono uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Best at {result?.best_time_to_post}
                </div>
              </div>
            </div>

            {/* Hashtags */}
            {result?.suggested_hashtags && result.suggested_hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.suggested_hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-2 text-on-surface-variant text-[0.75rem] font-bold rounded-[6px] ring-1 ring-[rgba(229,226,218,0.4)] font-mono"
                  >
                    <Hash className="w-3 h-3 opacity-50" />{tag.replace("#", "")}
                  </span>
                ))}
              </div>
            )}

            {/* Action Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleSaveDraft}
                className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 hover:text-primary transition-all"
              >
                <Bookmark className="w-4 h-4" /> Save Draft
              </button>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 hover:text-primary transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Regenerate
              </button>

              <button
                onClick={() => {
                  if (result?.post) {
                    const encodedPost = encodeURIComponent(result.post);
                    router.push(`/dashboard/analyze?content=${encodedPost}`);
                  }
                }}
                className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] shadow-md hover:shadow-premium transition-all"
              >
                <BarChart2 className="w-4 h-4" /> Analyze This
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function ScoreChip({ label, score }: { label: string; score?: number }) {
  const color = !score ? "text-on-surface-variant" : score <= 4 ? "text-error" : score <= 6 ? "text-tertiary" : "text-secondary";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">{label}</span>
      <span className={`text-[0.875rem] font-bold font-mono ${color}`}>{score ?? "–"}/10</span>
    </div>
  );
}
