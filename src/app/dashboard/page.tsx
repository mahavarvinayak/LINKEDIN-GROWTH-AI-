"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Flame, 
  BarChart2, 
  Zap, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import CreditBadge from "@/components/shared/CreditBadge";
import Paywall from "@/components/shared/Paywall";

// --- Types ---
interface UserData {
  full_name: string;
  plan: string;
  credits_analyze: number;
  credits_generate: number;
  streak_count: number;
  post_count?: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      // 2. Fetch Post Count
      const { count: postCount } = await supabase
        .from("posts")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      setUserData({
        full_name: profile?.full_name || "User",
        plan: profile?.plan || "free",
        credits_analyze: profile?.credits_analyze || 0,
        credits_generate: profile?.credits_generate || 0,
        streak_count: profile?.streak_count || 0,
        post_count: postCount || 0,
      });
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-surface-container rounded-[8px] w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-surface-container rounded-[12px]" />
          <div className="h-36 bg-surface-container rounded-[12px]" />
          <div className="h-36 bg-surface-container rounded-[12px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-56 bg-surface-container rounded-[12px]" />
          <div className="h-56 bg-surface-container rounded-[12px]" />
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-10">
      {/* Greeting Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">{greeting}</p>
          <h1 className="text-4xl font-serif text-on-background leading-tight">
            {userData?.full_name.split(" ")[0]},<br />
            <span className="text-on-surface-variant/60">your suite is ready.</span>
          </h1>
        </div>
        <div className="flex flex-col md:items-end gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/8 text-primary rounded-[6px] text-[0.625rem] font-bold uppercase tracking-[0.1em] ring-1 ring-primary/15 font-mono">
              {userData?.plan} Entity
            </span>
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant/50 hover:text-primary transition-colors font-mono"
            >
              Upgrade ↗
            </button>
          </div>
          <CreditBadge
            analyze={userData?.credits_analyze || 0}
            generate={userData?.credits_generate || 0}
            plan={userData?.plan}
          />
        </div>
      </div>

      <Paywall isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="Content Assets"
          value={userData?.post_count?.toString() || "0"}
          icon={BarChart2}
          trend="+12% velocity"
        />
        <StatCard
          label="Conversion Multiplier"
          value="+2.4x"
          icon={TrendingUp}
          trend="Top 5% of network"
        />
        <StatCard
          label="Generation Quota"
          value={(userData?.credits_generate || 0).toString()}
          icon={Zap}
          trend="Refreshes 00:00 UTC"
        />
      </div>

      {/* Streak + Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Panel */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[12px] p-8 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[1rem] font-serif text-on-background flex items-center gap-2">
              <Flame className="w-4 h-4 text-tertiary" /> Consistency Vector
            </h2>
            <div className="px-3 py-1 bg-surface-container rounded-[6px] font-mono text-[0.6875rem] font-bold text-tertiary ring-1 ring-[rgba(229,226,218,0.5)]">
              🔥 {userData?.streak_count} Days Active
            </div>
          </div>

          <div className="flex justify-between items-end gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const isToday = day === format(new Date(), "eee");
              const isPast = i < new Date().getDay() - 1;
              return (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[0.6rem] font-bold text-on-surface-variant/50 uppercase tracking-widest font-mono">{day}</span>
                  <div className={`w-full max-w-[48px] aspect-square rounded-[10px] flex items-center justify-center transition-all ${
                    isToday
                      ? "bg-gradient-to-br from-primary to-primary-container shadow-[0_4px_16px_rgba(37,99,235,0.25)] ring-2 ring-primary/20"
                      : isPast
                      ? "bg-surface-container"
                      : "bg-surface-2"
                  }`}>
                    {isPast && <CheckIcon />}
                    {isToday && <Plus className="w-5 h-5 text-on-primary" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Action Card */}
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-[12px] p-7 text-on-primary flex flex-col justify-between shadow-premium relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-[0.06] pointer-events-none">
            <Sparkles className="w-40 h-40 text-white" />
          </div>
          <div className="relative z-10">
            <div className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] font-mono opacity-70 mb-5">Priority Objective</div>
            <h3 className="text-xl font-serif mb-3 leading-snug">Vulnerability Arbitrage</h3>
            <p className="text-[0.875rem] opacity-80 leading-relaxed">
              Disclose one tactical failure and the resulting systemic correction. Algorithm strongly favors narrative authenticity.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="mt-7 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-on-primary border border-white/20 py-3 rounded-[8px] font-bold text-[0.8125rem] text-center transition-all flex items-center justify-center gap-2 relative z-10 uppercase tracking-[0.05em]"
          >
            Initiate Draft <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4">
        <SuggestionCard
          title="Optimal Broadcasting Window"
          body="Network activity indicates maximum visibility at 18:00 UTC. Schedule your next post for peak reach."
          icon={Clock}
          cta="Configure Schedule"
        />
        <SuggestionCard
          title="Engagement Mechanics"
          body="Terminal inquiries (questions at the end) increase engagement volume by 45% across your audience segment."
          icon={LightbulbIcon}
          cta="View Examples"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: React.ElementType; trend: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium hover:ring-primary/20 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="p-2.5 bg-surface-2 rounded-[8px]">
          <Icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
        </div>
        <span className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-primary/70 font-mono">{trend}</span>
      </div>
      <div className="text-3xl font-serif text-on-background mb-1">{value}</div>
      <div className="text-[0.75rem] font-bold uppercase tracking-wider text-on-surface-variant/60 font-mono">{label}</div>
    </div>
  );
}

function SuggestionCard({ title, body, icon: Icon, cta }: { title: string; body: string; icon: React.ElementType; cta: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium flex items-start gap-5">
      <div className="p-3 bg-primary/5 rounded-[8px] flex-shrink-0 ring-1 ring-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-serif text-on-background text-[1rem] mb-2">{title}</h4>
        <p className="text-[0.875rem] font-medium text-on-surface-variant mb-5 leading-relaxed">{body}</p>
        <button className="text-[0.75rem] text-primary font-bold hover:underline underline-offset-4 transition-all flex items-center gap-1 uppercase tracking-wider font-mono">
          {cta} <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
      <path d="M16.6667 5L7.50001 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
  );
}
