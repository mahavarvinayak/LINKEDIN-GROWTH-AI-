"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  PenTool, 
  BarChart2, 
  Bookmark, 
  Settings,
  LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// --- Navigation Configuration ---
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Create Post", href: "/dashboard/create", icon: PenTool },
  { label: "Analyze Post", href: "/dashboard/analyze", icon: BarChart2 },
  { label: "Saved Drafts", href: "/dashboard/drafts", icon: Bookmark },
  { label: "Pricing", href: "/dashboard/pricing", icon: BarChart2 }, // Reusing an icon or check CreditCard
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-on-background font-sans">
      {/* Sidebar - Desktop (Dark Atelier) */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen z-10" style={{ background: "#1A1814" }}>
        {/* Logo */}
        <div className="px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5">
            <div className="w-5 h-5 bg-gradient-to-br from-[#2563eb] to-[#1D4ED8] rounded-[4px]" />
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white/90">Growth.AI</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-white/[0.06]" />

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-[8px] font-medium transition-all ${
                  isActive
                    ? "text-[#2563eb] bg-white/[0.04]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                {/* Active needle indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#2563eb] rounded-r-full" />
                )}
                <Icon className="w-[1.1rem] h-[1.1rem] flex-shrink-0" />
                <span className="text-[0.8125rem] font-bold uppercase tracking-[0.06em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom utility section */}
        <div className="mx-6 h-px bg-white/[0.06]" />
        <nav className="p-4 py-2 space-y-1">
          <Link
            href="/support"
            className="flex items-center gap-3 px-4 py-2 rounded-[8px] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all"
          >
            Support
          </Link>
          <Link
            href="/changelog"
            className="flex items-center gap-3 px-4 py-2 rounded-[8px] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all"
          >
            Changelog
          </Link>
        </nav>

        <div className="mx-6 h-px bg-white/[0.06]" />
        <div className="p-4 mb-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-white/30 hover:text-red-400 hover:bg-white/[0.03] rounded-[8px] transition-all"
          >
            <LogOut className="w-[1.1rem] h-[1.1rem]" />
            <span className="text-[0.8125rem] font-bold uppercase tracking-[0.06em]">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around p-2 pb-6 bg-background border-t border-[rgba(229,226,218,0.4)]">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-[8px] transition-all ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon className="w-[1.15rem] h-[1.15rem]" />
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
