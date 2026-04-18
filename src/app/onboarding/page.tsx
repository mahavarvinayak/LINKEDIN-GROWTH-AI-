"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Target, 
  MessageSquare, 
  Users, 
  Briefcase,
  ArrowRight,
  Loader2,
  Check
} from "lucide-react";

// --- Configuration ---
const OPTIONS = {
  roles: ["Student", "Founder", "Freelancer", "Job Seeker", "Influencer", "Product Manager", "Marketing Expert", "Sales Professional", "Other"],
  topics: ["AI", "Startups", "Career", "Design", "Tech", "Marketing", "Finance", "Leadership", "Productivity"],
  goals: ["Get followers", "Generate leads", "Find a job", "Build my brand", "Networking", "Thought Leadership", "Industry Insights", "Other"],
  tones: ["Bold & direct", "Storytelling", "Educational", "Casual & friendly", "Witty & Humorous", "Data-Driven", "Inspirational", "Other"],
  audiences: ["Students", "Founders", "Recruiters", "Engineers", "Executive Leaders", "Creatives", "Other"]
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    role: "",
    topics: [] as string[],
    goal: "",
    tone: "",
    audience: ""
  });

  // Check if onboarding is already complete
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("persona_complete")
          .eq("id", user.id)
          .single();

        if (userData?.persona_complete) {
          router.push("/dashboard");
        } else {
          setInitialLoading(false);
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        // On error, show the form so user can try again
        setInitialLoading(false);
      }
    };
    checkStatus();
  }, [router, supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("pending_ref_code", ref);
    }
  }, []);

  const toggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const isFormValid = 
    formData.role && 
    formData.topics.length > 0 && 
    formData.topics.every(t => t && t.trim().length > 0) &&
    formData.goal && 
    formData.tone && 
    formData.audience;

  const handleComplete = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const refCode = sessionStorage.getItem("pending_ref_code");
      const body = {
        ...formData,
        ref_code: refCode || null
      };

      const response = await fetch("/api/persona/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save persona");

      sessionStorage.removeItem("pending_ref_code");

      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding saving error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completedSections = [
    !!formData.role,
    formData.topics.length > 0,
    !!formData.goal,
    !!formData.tone,
    !!formData.audience,
  ].filter(Boolean).length;

  const progressPct = Math.round((completedSections / 5) * 100);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Initializing Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-6 text-on-background font-sans">
      <div className="max-w-[760px] mx-auto">

        {/* Header / Brandmark */}
        <div className="flex items-center justify-between mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-[6px] ring-1 ring-primary/10">
            <div className="w-3 h-3 bg-primary rounded-[2px]"></div>
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-primary font-mono">Persona Configuration</span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="text-[0.75rem] font-bold font-mono text-on-surface-variant tabular-nums">{completedSections}/5 Complete</div>
            <div className="h-2 w-28 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-14">
          <h1 className="text-5xl font-serif text-on-background leading-[1.1] mb-4">
            Define your<br />editorial voice.
          </h1>
          <p className="text-[0.95rem] font-medium text-on-surface-variant max-w-md leading-relaxed">
            30 seconds. Every analysis and generated post will align perfectly with your unique signature.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-10">

          {/* Section 1: Role */}
          <Section icon={<Briefcase className="w-4 h-4" />} title="I am a..." count={formData.role ? 1 : 0}>
            <div className="flex flex-wrap gap-3">
              {OPTIONS.roles.map(role => (
                <Tag
                  key={role}
                  label={role}
                  selected={formData.role === role}
                  onClick={() => setFormData({ ...formData, role })}
                />
              ))}
            </div>
          </Section>

          {/* Section 2: Topics */}
          <Section icon={<Rocket className="w-4 h-4" />} title="I post about..." count={formData.topics.length} hint="Select all that apply">
            <div className="flex flex-wrap gap-3">
              {OPTIONS.topics.map(topic => (
                <Tag
                  key={topic}
                  label={topic}
                  selected={formData.topics.includes(topic)}
                  onClick={() => toggleTopic(topic)}
                />
              ))}
            </div>
          </Section>

          {/* Section 3: Goal */}
          <Section icon={<Target className="w-4 h-4" />} title="My primary objective..." count={formData.goal ? 1 : 0}>
            <div className="flex flex-wrap gap-3">
              {OPTIONS.goals.map(goal => (
                <Tag
                  key={goal}
                  label={goal}
                  selected={formData.goal === goal}
                  onClick={() => setFormData({ ...formData, goal })}
                />
              ))}
            </div>
          </Section>

          {/* Section 4: Tone */}
          <Section icon={<MessageSquare className="w-4 h-4" />} title="My voice register..." count={formData.tone ? 1 : 0}>
            <div className="flex flex-wrap gap-3">
              {OPTIONS.tones.map(tone => (
                <Tag
                  key={tone}
                  label={tone}
                  selected={formData.tone === tone}
                  onClick={() => setFormData({ ...formData, tone })}
                />
              ))}
            </div>
          </Section>

          {/* Section 5: Audience */}
          <Section icon={<Users className="w-4 h-4" />} title="I write for..." count={formData.audience ? 1 : 0}>
            <div className="flex flex-wrap gap-3">
              {OPTIONS.audiences.map(audience => (
                <Tag
                  key={audience}
                  label={audience}
                  selected={formData.audience === audience}
                  onClick={() => setFormData({ ...formData, audience })}
                />
              ))}
            </div>
          </Section>

        </div>

        {/* Submit */}
        <div className="mt-16 pt-10 border-t border-[rgba(229,226,218,0.4)]">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[0.85rem] font-medium text-on-surface-variant">
              {isFormValid
                ? "✦ Persona matrix complete. Ready to deploy."
                : `${5 - completedSections} section${5 - completedSections !== 1 ? 's' : ''} remaining`}
            </p>
            {isFormValid && (
              <span className="text-[0.75rem] font-bold uppercase tracking-widest text-secondary font-mono">Calibrated</span>
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={!isFormValid || loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium disabled:from-surface-container-high disabled:to-surface-container-high disabled:text-on-surface-variant/40 text-on-primary font-bold py-4 rounded-[8px] transition-all shadow-md active:scale-[0.98] disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="uppercase tracking-[0.05em]">Deploy Identity & Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </main>
  );
}

function Section({
  icon,
  title,
  count,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.4)] shadow-premium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center transition-colors ${count > 0 ? 'bg-primary text-on-primary' : 'bg-surface-2 text-on-surface-variant'}`}>
            {count > 0 ? <Check className="w-4 h-4" /> : icon}
          </div>
          <span className="text-[1rem] font-serif text-on-background">{title}</span>
        </div>
        {hint && <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface-variant/50 font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Tag({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-[8px] text-[0.875rem] font-medium transition-all flex items-center gap-2 ${
        selected
          ? "bg-primary text-on-primary shadow-md ring-1 ring-primary"
          : "bg-surface-2 text-on-surface-variant ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/40 hover:text-primary hover:bg-surface-container-lowest"
      }`}
    >
      {selected && <Check className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}
