"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  CreditCard,
  ShieldCheck,
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface UserProfile {
  full_name: string;
  email: string;
  plan: string;
  daily_analyze_count: number;
  daily_generate_count: number;
  streak_count: number;
}

function getDailyAnalyzeLimit(plan: string): number {
  if (plan === "pro") return 15;
  if (plan === "starter") return 5;
  return 2;
}

function getDailyGenerateLimit(plan: string): number {
  if (plan === "pro") return 10;
  if (plan === "starter") return 5;
  return 2;
}

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [referralData, setReferralData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const p: UserProfile = {
        full_name: data?.full_name || "",
        email: user.email || "",
        plan: data?.plan || "free",
        daily_analyze_count: data?.daily_analyze_count ?? 0,
        daily_generate_count: data?.daily_generate_count ?? 0,
        streak_count: data?.streak_count ?? 0,
      };
      setProfile(p);
      setFullName(p.full_name);

      const referralResponse = await fetch("/api/referral/stats");
      if (referralResponse.ok) {
        const referralJson = await referralResponse.json();
        setReferralData(referralJson);
      }

      setLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("users")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    await supabase.auth.resetPasswordForEmail(profile.email);
    alert(`Password reset email sent to ${profile.email}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse pt-2">
        <div className="h-10 bg-surface-container rounded-[8px] w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-surface-container rounded-[12px]" />
        ))}
      </div>
    );
  }

  const isPro = profile?.plan === "pro";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-2">Configuration</p>
        <h1 className="text-4xl font-serif text-on-background">Settings</h1>
      </div>

      {/* Profile Section */}
      <SettingsCard
        icon={<User className="w-4 h-4" />}
        title="Identity"
        subtitle="Your editorial profile"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.4)] focus:ring-[2px] focus:ring-primary focus:bg-white outline-none text-[0.9375rem] font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)]">
              <Mail className="w-4 h-4 text-on-surface-variant/30 flex-shrink-0" />
              <span className="text-[0.9375rem] font-mono text-on-surface-variant/70">{profile?.email}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || fullName === profile?.full_name}
            className={`flex items-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98] disabled:pointer-events-none ${
              saved
                ? "bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                : "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md hover:shadow-premium disabled:opacity-40"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <><Check className="w-4 h-4" /> Saved</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </SettingsCard>

      {/* Referral Section */}
      <SettingsCard
        icon={<Sparkles className="w-4 h-4" />}
        title="Referral Program"
        subtitle="Share your link and track rewards"
      >
        {referralData ? (
          <div className="space-y-4">

            {/* Points Progress */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-blue-900">Your referral points</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {referralData.points} <span className="text-base font-normal text-blue-400">/ 150</span>
                  </p>
                </div>
                {referralData.is_eligible_for_upgrade && (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                    🎉 Eligible for upgrade!
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (referralData.points / 150) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {referralData.is_eligible_for_upgrade
                  ? "You've earned 1 month Starter free! Admin will approve shortly."
                  : `${referralData.points_remaining} more referrals needed for 1 month Starter free`
                }
              </p>
            </div>

            {/* Referral Link */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Your referral link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralData.referral_link}
                  readOnly
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralData.referral_link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {copied ? "Copied! ✓" : "Copy link"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Share this link. When someone signs up using it, you get +1 point.
              </p>
            </div>

            {/* Referral History */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">
                People you referred ({referralData.total_referrals})
              </p>
              {referralData.referrals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No referrals yet. Share your link to get started!
                </p>
              ) : (
                <div className="space-y-2">
                  {referralData.referrals.map((ref: any) => (
                    <div key={ref.referred_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {ref.user?.full_name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(ref.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        ref.reward_status === "approved"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}>
                        {ref.reward_status === "approved" ? "✓ Approved" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          // Loading skeleton
          <div className="animate-pulse space-y-3">
            <div className="h-24 bg-gray-100 rounded-xl"></div>
            <div className="h-16 bg-gray-100 rounded-xl"></div>
          </div>
        )}
      </SettingsCard>

      {/* Plan & Credits */}
      <SettingsCard
        icon={<CreditCard className="w-4 h-4" />}
        title="Subscription"
        subtitle="Your current plan & daily usage"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)]">
            <div>
              <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-1">Active Plan</div>
              <div className="text-xl font-serif text-on-background capitalize">{profile?.plan} Entity</div>
            </div>
            <span className={`px-3 py-1 rounded-[6px] text-[0.5625rem] font-bold uppercase tracking-widest font-mono ring-1 ${
              isPro
                ? "bg-secondary/10 text-secondary ring-secondary/20"
                : "bg-primary/8 text-primary ring-primary/15"
            }`}>
              {isPro ? "Pro ⚡" : "Free Tier"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <QuotaChip
              label="Analyze"
              value={`${profile?.daily_analyze_count ?? 0}/${getDailyAnalyzeLimit(profile?.plan || "free")}`}
              suffix="used today"
            />
            <QuotaChip
              label="Generate"
              value={`${profile?.daily_generate_count ?? 0}/${getDailyGenerateLimit(profile?.plan || "free")}`}
              suffix="used today"
            />
            <QuotaChip label="Streak" value={profile?.streak_count ?? 0} suffix="days" />
          </div>

          {!isPro && (
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-primary/5 to-primary-container/10 rounded-[10px] ring-1 ring-primary/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-[0.8125rem] font-bold text-on-background">Upgrade to Pro</div>
                  <div className="text-[0.75rem] text-on-surface-variant font-medium">Unlimited posts + priority AI</div>
                </div>
              </div>
              <button 
                onClick={() => router.push("/dashboard/pricing")}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-[6px] font-bold text-[0.75rem] uppercase tracking-wider font-mono shadow-md hover:shadow-premium transition-all"
              >
                Upgrade <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Security */}
      <SettingsCard
        icon={<ShieldCheck className="w-4 h-4" />}
        title="Security"
        subtitle="Authentication & access keys"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)]">
            <div>
              <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-1">Password</div>
              <div className="text-[0.9375rem] font-mono text-on-surface-variant/60">••••••••••••</div>
            </div>
            <button
              onClick={handlePasswordReset}
              className="px-4 py-2 bg-surface-container-lowest rounded-[6px] font-bold text-[0.75rem] uppercase tracking-wider text-on-surface-variant font-mono ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary transition-all"
            >
              Reset via Email
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* Help & Legal */}
      <SettingsCard
        icon={<BookOpen className="w-4 h-4" />}
        title="Resources & Legal"
        subtitle="Platform governance and support"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/support" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Help Center</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">FAQs & Analysis Guides</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/privacy" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Privacy Protocol</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Data Governance Standards</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/terms" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Terms of Service</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Usage & Editorial Policy</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </Link>
          <a href="mailto:hello@thepilab.in" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Contact Concierge</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Direct Strategic Support</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </a>
          <a href="https://www.thepilab.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">THE Π LAB Website</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">www.thepilab.in</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </a>
          <a href="https://www.linkedin.com/company/the-%CF%80-lab/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">THE Π LAB LinkedIn</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Official company profile</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </a>
        </div>
      </SettingsCard>

    </div>
  );
}

function SettingsCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
      <div className="flex items-center gap-3 px-7 py-5 border-b border-[rgba(229,226,218,0.3)]">
        <div className="w-7 h-7 bg-primary/8 rounded-[6px] flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <div className="text-[0.875rem] font-bold text-on-background">{title}</div>
          <div className="text-[0.6875rem] font-medium text-on-surface-variant/60">{subtitle}</div>
        </div>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

function QuotaChip({ label, value, suffix = "left" }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="p-4 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)] text-center">
      <div className="text-2xl font-serif text-on-background mb-1">{value}</div>
      <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">{label}</div>
      <div className="text-[0.5rem] font-mono text-on-surface-variant/30 uppercase tracking-widest mt-0.5">{suffix}</div>
    </div>
  );
}
