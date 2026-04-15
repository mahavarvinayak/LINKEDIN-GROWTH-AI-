"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  CreditCard,
  UserCog,
  ChevronDown,
  ChevronUp,
  Play,
  BookOpen,
  Mail,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    items: [
      {
        question: "How do I analyze my first LinkedIn post?",
        answer: (
          <div className="font-mono text-[0.8125rem] text-on-surface-variant bg-surface-container p-6 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)] leading-relaxed">
            <p className="mb-4">{"// AI LABS ANALYSIS PROTOCOL"}</p>
            <p className="mb-4">
              To analyze a post, navigate to the <span className="text-primary font-bold">Analyze Post</span> tab in your dashboard.
              You can either paste text from a live LinkedIn post or upload a draft for pre-flight checking.
            </p>
            <p className="mb-4">Our engine will evaluate:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Hook strength and scroll-stop probability.</li>
              <li>Formatting for mobile readability.</li>
              <li>Sentiment alignment with your personal brand.</li>
            </ul>
          </div>
        ),
        actions: true,
      },
      { question: "Connecting your LinkedIn account safely", answer: null },
    ],
  },
  {
    id: "billing",
    title: "Credits & Billing",
    icon: <CreditCard className="w-5 h-5 text-primary" />,
    items: [
      { question: "How do AI credits renew each month?", answer: null },
      { question: "Upgrading or canceling your Pro subscription", answer: null },
    ],
  },
  {
    id: "account",
    title: "Account & Settings",
    icon: <UserCog className="w-5 h-5 text-primary" />,
    items: [
      { question: "Updating your email and security protocols", answer: null },
      { question: "Personalizing your editorial brand voice", answer: null },
    ],
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ "getting-started-0": true });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[rgba(229,226,218,0.3)]">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <span className="font-serif italic text-xl text-on-background">Editorial Growth Engine</span>
          <Link href="/dashboard" className="flex items-center gap-2 text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors font-mono">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif text-on-background mb-8 tracking-tight">How can we help?</h1>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-on-surface-variant/40" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-none py-5 pl-16 pr-8 rounded-[12px] shadow-premium text-lg focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 outline-none"
              placeholder="Search for articles, guides, or troubleshooting..."
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="md:col-span-3 space-y-8">
            <div>
              <h3 className="text-[0.5625rem] font-bold tracking-[0.15em] text-on-surface-variant/50 mb-4 uppercase font-mono">Support Categories</h3>
              <nav className="space-y-3">
                {FAQ_CATEGORIES.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="block text-[0.875rem] font-medium text-on-surface-variant hover:text-primary pl-4 transition-colors border-l-2 border-transparent hover:border-primary"
                  >
                    {cat.title}
                  </a>
                ))}
              </nav>
            </div>

            <div className="p-6 bg-surface-container rounded-[12px]">
              <h4 className="font-serif text-lg mb-2">Need a Specialist?</h4>
              <p className="text-[0.8125rem] text-on-surface-variant mb-4 leading-relaxed">Our concierge team is available 24/7 for Enterprise partners.</p>
              <button className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 font-mono">Speak to Sales</button>
            </div>
          </aside>

          {/* FAQ Sections */}
          <div className="md:col-span-9 space-y-12">
            {FAQ_CATEGORIES.map((cat) => (
              <section key={cat.id} id={cat.id}>
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
                  {cat.icon} {cat.title}
                </h2>
                <div className="space-y-2">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.id}-${idx}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={key} className="bg-surface-container-lowest rounded-[12px] shadow-[0_2px_8px_rgba(26,24,20,0.03)] ring-1 ring-[rgba(229,226,218,0.3)] overflow-hidden">
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container transition-colors"
                        >
                          <span className="font-medium text-[1rem] text-on-background">{item.question}</span>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-on-surface-variant/40" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant/40" />}
                        </button>
                        {isOpen && item.answer && (
                          <div className="px-6 pb-8">
                            {item.answer}
                            {item.actions && (
                              <div className="mt-6 flex gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-[8px] text-[0.8125rem] font-bold hover:shadow-md transition-all">
                                  <Play className="w-4 h-4" /> Watch Video Guide
                                </button>
                                <button className="px-4 py-2 ring-1 ring-[rgba(229,226,218,0.5)] rounded-[8px] text-[0.8125rem] font-medium text-on-surface-variant hover:bg-surface-container transition-all">
                                  <BookOpen className="w-4 h-4 inline mr-2" />Read documentation
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Contact Bento */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark CTA */}
          <div className="p-10 bg-[#1A1814] rounded-[16px] text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="relative z-10">
              <h2 className="font-serif text-3xl mb-4">Still need assistance?</h2>
              <p className="text-white/50 max-w-sm mb-8 leading-relaxed">Our editorial concierge is available for direct support and strategic implementation.</p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
              <a href="mailto:support@editorialgrowth.ai" className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-[8px] flex items-center gap-2 font-bold transition-all active:scale-[0.97]">
                <Mail className="w-4 h-4" /> Email Concierge
              </a>
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-[8px] flex items-center gap-2 font-medium backdrop-blur-sm transition-all active:scale-[0.97]">
                <MessageCircle className="w-4 h-4" /> WhatsApp Support
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
          </div>

          {/* Status Card */}
          <div className="p-10 bg-surface-container-high rounded-[16px] flex flex-col justify-between">
            <div>
              <h3 className="text-[0.5625rem] font-bold tracking-[0.15em] text-on-surface-variant/50 mb-6 uppercase font-mono">System Status</h3>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                <span className="font-mono text-[0.875rem] font-bold text-on-background">All Systems Operational</span>
              </div>
              <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
                The AI Engine and Analysis modules are currently running at peak performance. Average response time for support is <span className="font-bold text-on-background">14 minutes</span>.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-[rgba(229,226,218,0.4)]">
              <div className="flex -space-x-3 mb-4">
                {["AR", "SJ", "MK"].map((initials, i) => (
                  <div key={initials} className="w-10 h-10 rounded-full border-2 border-surface bg-primary flex items-center justify-center text-[0.5625rem] font-bold text-white" style={{ background: `hsl(${220 + i * 30}, 60%, 50%)` }}>
                    {initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-surface flex items-center justify-center text-[0.625rem] font-bold text-on-surface-variant">+12</div>
              </div>
              <span className="text-[0.75rem] text-on-surface-variant/60 font-mono">A team of experts is standing by to help.</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-10 border-t border-[rgba(229,226,218,0.3)] px-8 text-center">
        <p className="text-[0.625rem] text-on-surface-variant/40 font-mono uppercase tracking-widest">Editorial Growth Engine © 2024 — Precision Strategy Lab</p>
      </footer>
    </main>
  );
}
