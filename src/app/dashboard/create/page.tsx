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
  ChevronLeft,
  Zap,
  TrendingUp,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Paywall from "@/components/shared/Paywall";

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

interface RssTrendingPost {
  post: string;
  source: string;
  title: string;
  description?: string;
  link?: string;
  date?: string;
  suggested_hashtags?: string[];
}

const PROMPT_SPARKS = [
  "Why I quit my job at 28",
  "Lessons from my failed startup",
  "3 common myths about AI",
  "The mistake that changed my career",
];

type Tab = "ai" | "rss";

export default function CreatePostPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  
  // AI Generation state
  const [aiStep, setAiStep] = useState<1 | 2>(1);
  const [topic, setTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [creatingFromNews, setCreatingFromNews] = useState(false);
  const [aiResult, setAiResult] = useState<GeneratedPost | null>(null);
  
  // RSS Trending state
  const [rssLoading, setRssLoading] = useState(false);
  const [rssTrendingPosts, setRssTrendingPosts] = useState<RssTrendingPost[]>([]);
  const [selectedRssPost, setSelectedRssPost] = useState<RssTrendingPost | null>(null);
  const [rssRefreshTime, setRssRefreshTime] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<RssTrendingPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions] = useState([
    "AI", "Machine Learning", "Web Development", "React", "TypeScript",
    "JavaScript", "DevOps", "Cloud", "Crypto", "Startup", "Tech News"
  ]);
  
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<"daily_limit" | "no_credits" | "draft_limit">("daily_limit");
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  const getDraftLimit = (plan: string) => {
    if (plan === "pro") return 30;
    if (plan === "starter") return 10;
    return 0;
  };

  // --- AI GENERATION HANDLERS ---
  const handleGenerateAI = async () => {
    if (!topic.trim()) return;
    setAiLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (response.status === 429) {
        setPaywallReason("daily_limit");
        setShowPaywall(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "no_credits") {
          setPaywallReason("no_credits");
          setShowPaywall(true);
          return;
        }
        throw new Error(data.message || data.error || "Generation failed");
      }

      setAiResult(data);
      setAiStep(2);
    } catch (err: any) {
      console.error("Generation error:", err);
      setPaywallReason("daily_limit");
      setShowPaywall(true);
    } finally {
      setAiLoading(false);
    }
  };

  // --- RSS TRENDING HANDLERS ---
  const handleGetTrendingPosts = async (forceRefresh: boolean = false) => {
    setRssLoading(true);
    try {
      const response = await fetch("/api/generate-posts", {
        method: forceRefresh ? "POST" : "GET",
        headers: forceRefresh ? { "Content-Type": "application/json" } : {},
        body: forceRefresh ? JSON.stringify({ forceRefresh: true }) : undefined,
      });
      const data = await response.json();

      if (data.success && data.posts && data.posts.length > 0) {
        setRssTrendingPosts(data.posts);
        setRssRefreshTime(new Date().toLocaleTimeString());
      } else {
        setRssTrendingPosts([]);
      }
    } catch (err: any) {
      console.error("Trending posts error:", err);
    } finally {
      setRssLoading(false);
    }
  };

  // --- SEARCH TRENDING HANDLER ---
  const handleSearchTrending = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/search-trending?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();

      if (data.success && data.posts && data.posts.length > 0) {
        setSearchResults(data.posts);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      void handleSearchTrending(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- GENERATE FROM SELECTED NEWS ---
  const handleCreatePostFromNews = async () => {
    if (!selectedRssPost) return;

    setCreatingFromNews(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedRssPost.title,
          news: {
            title: selectedRssPost.title,
            description: selectedRssPost.description,
            source: selectedRssPost.source,
            link: selectedRssPost.link,
            date: selectedRssPost.date,
          },
        }),
      });

      if (response.status === 429) {
        setPaywallReason("daily_limit");
        setShowPaywall(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "no_credits") {
          setPaywallReason("no_credits");
          setShowPaywall(true);
          return;
        }
        throw new Error(data.message || data.error || "Generation failed");
      }

      setSelectedRssPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          post: data.post || prev.post,
          suggested_hashtags: data.suggested_hashtags || prev.suggested_hashtags,
        };
      });
    } catch (err: any) {
      console.error("Generate from news error:", err);
      setPaywallReason("daily_limit");
      setShowPaywall(true);
    } finally {
      setCreatingFromNews(false);
    }
  };

  // --- SAVE DRAFT HANDLERS ---
  const saveDraftFromAI = async () => {
    if (!aiResult?.post) return;
    await saveDraftGeneric(aiResult.post, aiResult.suggested_hashtags, topic);
  };

  const saveDraftFromRSS = async () => {
    if (!selectedRssPost?.post) return;
    await saveDraftGeneric(selectedRssPost.post, selectedRssPost.suggested_hashtags || [], selectedRssPost.title);
  };

  const saveDraftGeneric = async (postContent: string, hashtags: string[], postTopic: string) => {
    setAiLoading(true);
    setDraftNotice(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const [{ data: userProfile, error: profileError }, { count: draftCount, error: countError }] = await Promise.all([
        supabase.from("users").select("plan").eq("id", user.id).single(),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("type", "draft"),
      ]);

      if (profileError || !userProfile) {
        throw new Error("Failed to check your plan");
      }

      if (countError) {
        throw new Error("Failed to check draft usage");
      }

      const plan = userProfile.plan || "free";
      const limit = getDraftLimit(plan);
      const used = draftCount || 0;

      if (limit === 0) {
        setDraftNotice("Draft storage is not available on Free plan. Upgrade to Starter or Pro.");
        setPaywallReason("draft_limit");
        setShowPaywall(true);
        return;
      }

      if (used >= limit) {
        setDraftNotice(`You've reached your draft limit (${used}/${limit}) on ${plan} plan.`);
        setPaywallReason("draft_limit");
        setShowPaywall(true);
        return;
      }

      // Include hashtags in the post content
      const hashtagString = hashtags.length > 0 ? "\n\n" + hashtags.map(tag => `#${tag.replace("#", "")}`).join(" ") : "";
      const fullContent = postContent + hashtagString;

      // Default scores for RSS posts (they don't have scoring)
      const score = 7;

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        type: "draft",
        topic: postTopic,
        improved_content: fullContent,
        hook_score: score,
        engagement_score: score,
        structure_score: score,
        readability_score: score,
        overall_score: score
      });

      if (error) throw error;
      router.push("/dashboard/drafts");
    } catch (err: any) {
      console.error("Save draft error:", err);

      if (String(err?.message || "").toLowerCase().includes("draft_limit_reached")) {
        setDraftNotice("Draft limit reached for your current plan.");
        setPaywallReason("draft_limit");
        setShowPaywall(true);
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* TAB SWITCHER */}
      <div className="pt-2 mb-8">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-4">Content Studio</p>

        {draftNotice && (
          <div className="mb-4 rounded-[8px] border border-red-300 bg-red-50 px-4 py-3 text-[0.8125rem] font-medium text-red-700">
            {draftNotice}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setActiveTab("ai");
              setAiStep(1);
            }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all ${
              activeTab === "ai"
                ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md"
                : "bg-surface-container text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate Custom
          </button>
          <button
            onClick={() => setActiveTab("rss")}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all ${
              activeTab === "rss"
                ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md"
                : "bg-surface-container text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Get Trending Ideas
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* AI TAB CONTENT */}
        {activeTab === "ai" && (
          <motion.div
            key="ai-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* AI STEP 1: INPUT */}
            {aiStep === 1 && (
              <>
                <div>
                  <h2 className="text-3xl font-serif text-on-background mb-2">What's on your mind?</h2>
                  <p className="text-[0.95rem] font-medium text-on-surface-variant">Enter a topic, story, or idea. I'll generate a high-impact LinkedIn post.</p>
                </div>

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
                      onClick={handleGenerateAI}
                      disabled={!topic.trim() || aiLoading}
                      className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 py-3 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98]"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-3">Quick Prompts</p>
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
              </>
            )}

            {/* AI STEP 2: RESULT */}
            {aiStep === 2 && aiResult && (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setAiStep(1)}
                    className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60 hover:text-primary transition-colors font-mono"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <div className="px-3 py-1 bg-secondary/10 text-secondary text-[0.5625rem] font-bold uppercase tracking-widest rounded-[4px] font-mono ring-1 ring-secondary/20">
                    AI Optimized ✦
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
                  <div className="p-8">
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-4">Generated Draft</p>
                    <div className="whitespace-pre-wrap text-[1rem] text-on-background leading-[1.8] font-mono">
                      {aiResult.post}
                    </div>
                  </div>

                  <div className="bg-surface-2 border-t border-[rgba(229,226,218,0.4)] px-8 py-4 flex flex-wrap gap-6 items-center">
                    <ScoreChip label="Hook" score={aiResult.estimated_scores.hook} />
                    <ScoreChip label="Engagement" score={aiResult.estimated_scores.engagement} />
                    <ScoreChip label="Structure" score={aiResult.estimated_scores.structure} />
                    <div className="h-4 w-px bg-[rgba(229,226,218,0.6)] hidden md:block" />
                    <div className="flex items-center gap-2 text-[0.6875rem] font-bold text-on-surface-variant font-mono uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Best at {aiResult.best_time_to_post}
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                {aiResult.suggested_hashtags && aiResult.suggested_hashtags.length > 0 && (
                  <div>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-3">Suggested Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                      {aiResult.suggested_hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-2 text-on-surface-variant text-[0.75rem] font-bold rounded-[6px] ring-1 ring-[rgba(229,226,218,0.4)] font-mono"
                        >
                          <Hash className="w-3 h-3 opacity-50" />{tag.replace("#", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={saveDraftFromAI}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] shadow-md hover:shadow-premium transition-all"
                  >
                    <Bookmark className="w-4 h-4" /> Save to Drafts
                  </button>

                  <button
                    onClick={handleGenerateAI}
                    disabled={aiLoading}
                    className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 hover:text-primary transition-all disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Regenerate
                  </button>

                  <button
                    onClick={() => {
                      if (aiResult.post) {
                        const encodedPost = encodeURIComponent(aiResult.post);
                        router.push(`/dashboard/analyze?content=${encodedPost}`);
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 hover:text-primary transition-all"
                  >
                    <BarChart2 className="w-4 h-4" /> Analyze
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* RSS TAB CONTENT */}
        {activeTab === "rss" && (
          <motion.div
            key="rss-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-serif text-on-background mb-2">Trending Ideas</h2>
              <p className="text-[0.95rem] font-medium text-on-surface-variant">Discover posts based on what's trending in tech right now.</p>
            </div>

            {/* SEARCH SECTION */}
            {!selectedRssPost && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Search trending topics (e.g., AI, React, DevOps...)"
                    className="w-full bg-surface-container-lowest border border-[rgba(229,226,218,0.5)] rounded-[8px] pl-10 pr-4 py-3 text-[0.95rem] text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setIsSearching(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search suggestions */}
                {!isSearching && searchQuery.length === 0 && (
                  <div>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-2">
                      Popular topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setIsSearching(true);
                          }}
                          className="px-3 py-1.5 bg-surface-2 text-on-surface-variant text-[0.75rem] font-medium rounded-[6px] ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedRssPost ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleGetTrendingPosts(false)}
                  disabled={rssLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:opacity-40 disabled:pointer-events-none text-on-primary px-7 rounded-[8px] font-bold text-[0.875rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98]"
                >
                  {rssLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Load Trending Posts
                    </>
                  )}
                </button>

                {rssTrendingPosts.length > 0 && (
                  <button
                    onClick={() => handleGetTrendingPosts(true)}
                    disabled={rssLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-container text-on-surface-variant hover:ring-primary/30 disabled:opacity-40 disabled:pointer-events-none px-7 rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] ring-1 ring-[rgba(229,226,218,0.5)] transition-all"
                  >
                    {rssLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Refresh Posts
                        {rssRefreshTime && <span className="ml-2 hidden sm:inline text-[0.7rem] opacity-60">Last updated at {rssRefreshTime}</span>}
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRssPost(null);
                      setRssTrendingPosts([]);
                    }}
                    className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60 hover:text-primary transition-colors font-mono"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to List
                  </button>
                  <div className="px-3 py-1 bg-tertiary/10 text-tertiary text-[0.5625rem] font-bold uppercase tracking-widest rounded-[4px] font-mono ring-1 ring-tertiary/20">
                    Trending ✦
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
                  <div className="p-8">
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-2">From: {selectedRssPost.source}</p>
                    <p className="text-[0.8125rem] font-bold text-on-surface-variant/70 font-mono mb-2">{selectedRssPost.title}</p>
                    {selectedRssPost.description && selectedRssPost.description !== selectedRssPost.title && (
                      <p className="text-[0.875rem] text-on-surface-variant mb-6 leading-relaxed">{selectedRssPost.description}</p>
                    )}
                    <div className="whitespace-pre-wrap text-[1rem] text-on-background leading-[1.8] font-mono">
                      {selectedRssPost.post}
                    </div>
                  </div>
                </div>

                {selectedRssPost.suggested_hashtags && selectedRssPost.suggested_hashtags.length > 0 && (
                  <div>
                    <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono mb-3">Suggested Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRssPost.suggested_hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-2 text-on-surface-variant text-[0.75rem] font-bold rounded-[6px] ring-1 ring-[rgba(229,226,218,0.4)] font-mono"
                        >
                          <Hash className="w-3 h-3 opacity-50" />{tag.replace("#", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={saveDraftFromRSS}
                    className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] shadow-md hover:shadow-premium transition-all"
                  >
                    <Bookmark className="w-4 h-4" /> Save to Drafts
                  </button>

                  <button
                    onClick={handleCreatePostFromNews}
                    disabled={creatingFromNews}
                    className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 hover:text-primary transition-all disabled:opacity-50"
                  >
                    {creatingFromNews ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Create Post from This News
                  </button>

                  <button
                    onClick={() => setSelectedRssPost(null)}
                    className="flex items-center justify-center gap-2 py-3.5 bg-surface-container-lowest rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 hover:text-primary transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Another
                  </button>
                </div>
              </>
            )}

            {/* Trending Posts List or Search Results */}
            {(searchResults.length > 0 || rssTrendingPosts.length > 0) && !selectedRssPost && (
              <div className="space-y-3">
                <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono">
                  {isSearching 
                    ? `Search Results for "${searchQuery}" (${searchResults.length})` 
                    : `Available Posts (${rssTrendingPosts.length})`
                  }
                </p>
                {(isSearching ? searchResults : rssTrendingPosts).map((post, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedRssPost(post)}
                    className="w-full text-left p-4 bg-surface-container-lowest rounded-[8px] ring-1 ring-[rgba(229,226,218,0.5)] hover:ring-primary/30 transition-all"
                  >
                    <p className="text-[0.75rem] font-bold text-on-surface-variant/60 font-mono uppercase mb-1">{post.source}</p>
                    <p className="text-[0.9375rem] text-on-background font-medium mb-1">{post.title}</p>
                    {post.description && post.description !== post.title && (
                      <p className="text-[0.8125rem] text-on-surface-variant/70 line-clamp-2">{post.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No search results message */}
            {isSearching && searchResults.length === 0 && !searchLoading && searchQuery.length >= 2 && (
              <div className="text-center py-8">
                <p className="text-on-surface-variant/60 text-[0.9375rem] mb-2">
                  No posts found for "{searchQuery}"
                </p>
                <p className="text-on-surface-variant/40 text-[0.8125rem] mb-4">
                  Try searching for different topics like AI, React, DevOps, etc.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearching(false);
                  }}
                  className="px-4 py-2 bg-surface-2 text-on-surface-variant text-[0.8125rem] font-medium rounded-[6px] ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary transition-all"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Loading indicator for search */}
            {searchLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-on-surface-variant/60 text-[0.9375rem]">Searching...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Paywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason={paywallReason}
      />
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
