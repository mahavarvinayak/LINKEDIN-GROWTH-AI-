import Link from "next/link";
import { Verified, Sparkles, Rocket, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Changelog | Editorial Growth Engine",
  description: "Stay updated with the latest improvements, features, and refinements.",
};

const ENTRIES = [
  {
    version: "v1.2",
    date: "Oct 24, 2023",
    badge: { label: "Feature", icon: <Verified className="w-4 h-4" />, color: "bg-secondary/10 text-secondary" },
    title: "Saved Drafts",
    description:
      "We've introduced a robust draft management system. You can now save multiple versions of your LinkedIn posts, revisit them later, and even set internal status markers like \"Researching\" or \"Ready for Review.\"",
    details: (
      <div className="bg-surface-container rounded-[8px] p-6 font-mono text-[0.8125rem] text-on-surface-variant border-l-4 border-primary leading-relaxed">
        <h4 className="text-[0.625rem] uppercase font-bold mb-3 text-on-background tracking-wider">Key Capabilities:</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3"><span className="text-primary mt-0.5">→</span><span>Auto-save functionality every 30 seconds to prevent data loss.</span></li>
          <li className="flex items-start gap-3"><span className="text-primary mt-0.5">→</span><span>Version history toggle to compare changes across different drafting sessions.</span></li>
          <li className="flex items-start gap-3"><span className="text-primary mt-0.5">→</span><span>Multi-tag support for organizing drafts by campaign or client.</span></li>
        </ul>
      </div>
    ),
    active: true,
  },
  {
    version: "v1.1",
    date: "Sep 12, 2023",
    badge: { label: "Improvement", icon: <Sparkles className="w-4 h-4" />, color: "bg-primary/10 text-primary" },
    title: "Smarter AI Rewrites",
    description:
      "Our AI engine has been fine-tuned for the LinkedIn ecosystem. It now understands \"The Hook\" and \"The CTA\" better than ever, producing content that feels less like a bot and more like a seasoned strategist.",
    details: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        <div className="bg-surface-container rounded-[8px] p-5">
          <span className="block font-mono text-[0.5625rem] uppercase text-on-surface-variant/50 mb-2 tracking-widest">Old Algorithm</span>
          <p className="text-[0.875rem] italic text-on-surface-variant line-through">&ldquo;Here are five ways to grow your network on the platform using strategic outreach...&rdquo;</p>
        </div>
        <div className="bg-primary/5 rounded-[8px] p-5 ring-1 ring-primary/10">
          <span className="block font-mono text-[0.5625rem] uppercase text-primary mb-2 tracking-widest">New Algorithm (v1.1)</span>
          <p className="text-[0.875rem] font-medium text-on-background">&ldquo;Most outreach is noise. Here are the 5 exact frameworks I use to cut through the static...&rdquo;</p>
        </div>
      </div>
    ),
    active: false,
  },
  {
    version: "v1.0",
    date: "Aug 01, 2023",
    badge: { label: "Launch", icon: <Rocket className="w-4 h-4" />, color: "bg-tertiary/10 text-tertiary" },
    title: "Hello, World.",
    description:
      "Today we launch the Editorial Growth Engine. A dedicated workspace for LinkedIn power users who want to treat their personal brand like a premier editorial desk.",
    details: (
      <div className="flex flex-wrap gap-3 mt-4">
        {["Growth Analytics", "AI Post Editor", "Scheduling"].map((f) => (
          <div key={f} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-[0.8125rem] font-medium">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" /> {f}
          </div>
        ))}
      </div>
    ),
    active: false,
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[rgba(229,226,218,0.3)]">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-serif italic text-xl text-on-background">Editorial Growth Engine</span>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/dashboard/drafts" className="text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Drafts</Link>
              <span className="text-[0.8125rem] font-bold text-primary">Changelog</span>
            </nav>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-[0.8125rem] text-on-surface-variant hover:text-primary transition-colors font-mono">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16 md:py-24">
        {/* Hero */}
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-serif text-on-background tracking-tight mb-6">What&apos;s new</h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
            Stay updated with the latest improvements, features, and refinements at the Editorial Growth Engine.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-16">
          <button className="px-5 py-2 rounded-full bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold text-[0.8125rem] transition-all">All Updates</button>
          {["Features", "Improvements", "Fixes"].map((f) => (
            <button key={f} className="px-5 py-2 rounded-full bg-surface-container text-on-surface-variant font-medium text-[0.8125rem] hover:bg-surface-container-high transition-colors ring-1 ring-[rgba(229,226,218,0.3)]">
              {f}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-0 md:left-32 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-transparent opacity-20" />

          {ENTRIES.map((entry) => (
            <div key={entry.version} className="relative grid grid-cols-1 md:grid-cols-[128px_1fr] gap-8 mb-24 items-start">
              {/* Date / Version */}
              <div className="hidden md:block pr-8 text-right pt-2">
                <span className="font-mono text-[0.6875rem] text-on-surface-variant/50 uppercase tracking-widest block mb-1">{entry.date}</span>
                <span className="font-bold text-primary text-[0.875rem] uppercase">{entry.version}</span>
              </div>

              {/* Card */}
              <div className="pl-8 md:pl-12 relative">
                {/* Mobile date */}
                <div className="md:hidden flex items-center gap-3 mb-4">
                  <span className="font-mono text-[0.6875rem] text-on-surface-variant/50 uppercase">{entry.date}</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.5625rem] font-bold">{entry.version}</span>
                </div>

                {/* Dot */}
                <div className={`absolute left-[-5px] md:left-[-41px] top-3 w-2.5 h-2.5 rounded-full border-2 border-background z-10 ${
                  entry.active ? "bg-primary ring-4 ring-primary/10" : "bg-on-surface-variant/40"
                }`} />

                <div className="bg-surface-container-lowest rounded-[12px] p-8 md:p-10 shadow-premium ring-1 ring-[rgba(229,226,218,0.3)]">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${entry.badge.color} mb-6`}>
                    {entry.badge.icon}
                    <span className="text-[0.5625rem] font-bold uppercase tracking-widest">{entry.badge.label}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-on-background mb-4">{entry.title}</h2>
                  <p className="text-on-surface-variant leading-relaxed text-[1rem] mb-6">{entry.description}</p>
                  {entry.details}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 border-t border-[rgba(229,226,218,0.3)] pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-on-surface-variant text-[0.75rem] font-mono uppercase tracking-widest">End of Recent Updates</div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-[0.875rem]">
              ← Earlier Updates
            </button>
            <div className="w-px h-4 bg-[rgba(229,226,218,0.4)]" />
            <button className="text-on-surface-variant hover:text-primary transition-colors font-medium text-[0.875rem]">Archive</button>
          </div>
        </div>
      </div>
    </main>
  );
}
