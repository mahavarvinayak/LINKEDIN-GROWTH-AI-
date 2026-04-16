import Link from "next/link";
import { Check, Ban, Download, Mail, MapPin, Sparkles } from "lucide-react";

export const metadata = {
  title: "Terms of Service | LinkedIn AI Growth Assistant",
  description: "Governance and usage protocols for the LinkedIn AI Growth Assistant platform.",
};

const TERMS_SECTIONS = [
  {
    num: "01",
    title: "Acceptance of Terms",
    bg: "bg-surface-container-lowest",
    content: (
      <>
        <p className="mb-4">By accessing or using the LinkedIn AI Growth Assistant (the &ldquo;Platform&rdquo;), operated by The Pi Lab, you agree to be bound by these Terms of Service. These terms govern your creative interaction with our suite of analysis and generation tools.</p>
        <p>Use of the Platform constitutes your acknowledgment that you have read, understood, and agree to be bound by these terms, which include our Privacy Protocol.</p>
      </>
    ),
  },
  {
    num: "02",
    title: "Atelier Subscription Plans",
    bg: "bg-surface-container",
    content: (
      <>
        <p className="mb-6">We provide tiered access to our editorial intelligence (&ldquo;Plans&rdquo;). We reserve the right to modify feature availability or compute quotas at any time to maintain system equilibrium.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-[12px] ring-1 ring-[rgba(229,226,218,0.3)]">
            <h4 className="font-bold text-on-background text-[0.75rem] uppercase tracking-wider mb-2">Starter Engine</h4>
            <p className="text-[0.8125rem] text-on-surface-variant">Designed for individual professionals scaling their network velocity.</p>
          </div>
          <div className="bg-primary/5 p-5 rounded-[12px] ring-1 ring-primary/10">
            <h4 className="font-bold text-primary text-[0.75rem] uppercase tracking-wider mb-2">Pro Reactor ⚡</h4>
            <p className="text-[0.8125rem] text-on-surface-variant">Maximum throughput for executive-level brand development and priority AI models.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    num: "03",
    title: "AI Editorial Disclosure",
    bg: "bg-surface-container-lowest",
    content: (
      <>
        <div className="bg-primary/5 p-6 rounded-[12px] mb-6 border-l-4 border-primary">
          <h4 className="font-mono text-[0.75rem] font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-primary">
            <Sparkles className="w-4 h-4" /> Algorithmic Responsibility
          </h4>
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            The Platform utilizes Large Language Models (Gemini/Llama) to generate editorial suggestions. While we aim for viral standards, AI-generated content may contain factual inaccuracies. **You retain 100% ownership** of final outputs but are ultimately responsible for vetting content before publication on LinkedIn.
          </p>
        </div>
        <p>You grant us a limited license to process your inputs for the sole purpose of providing the service. We do not use your creative data for persistent training of public AI models.</p>
      </>
    ),
  },
  {
    num: "04",
    title: "Subscription Payments",
    bg: "bg-surface-container",
    content: (
      <>
        <p className="mb-4">All plans are billed in advance. Due to the high compute costs associated with AI inference, we provide a 7-day adjustment window for refunds, after which all sales are final.</p>
        <p>Failed payments will result in a brief grace period before compute access is suspended. Data associated with unpaid accounts may be purged after 90 days of inactivity.</p>
      </>
    ),
  },
  {
    num: "05",
    title: "Governing Governance",
    bg: "bg-surface-container-lowest",
    content: (
      <>
        <p className="mb-6">These terms shall be governed by and construed in accordance with the laws of **Gujarat, India**, without regard to its conflict of law provisions.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:support@thepilab.ai" className="flex items-center gap-3 p-4 bg-surface-container rounded-[12px] hover:bg-surface-container-high transition-colors">
            <Mail className="w-5 h-5 text-primary" />
            <span className="font-mono text-[0.8125rem]">support@thepilab.ai</span>
          </a>
          <div className="flex items-center gap-3 p-4 bg-surface-container rounded-[12px]">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-mono text-[0.8125rem]">The Pi Lab HQ</span>
          </div>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Breadcrumb */}
        <nav className="mb-12 flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono">
          <Link href="/" className="hover:text-primary transition-colors">Growth.AI</Link>
          <span className="text-[0.5rem]">›</span>
          <span className="text-on-background font-bold tracking-normal">Terms of Service</span>
        </nav>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="text-6xl md:text-7xl font-serif text-on-background leading-tight mb-6 tracking-tight">Governance.</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[rgba(229,226,218,0.3)] pb-10">
            <div className="space-y-2">
              <p className="text-lg text-on-surface-variant font-medium">Effective Date: April 16, 2024</p>
              <p className="text-on-surface-variant/60 font-mono text-[0.8125rem]">Revision 4.2.0 — The Pi Lab Atelier</p>
            </div>
            <button className="bg-surface-container text-on-surface-variant px-6 py-3 rounded-[8px] font-bold flex items-center gap-2 ring-1 ring-[rgba(229,226,218,0.3)] hover:bg-primary/5 transition-all">
              <Download className="w-5 h-5" /> Download Archive
            </button>
          </div>
        </header>

        {/* Sections */}
        <div className="overflow-hidden rounded-[16px] ring-1 ring-[rgba(229,226,218,0.3)] shadow-premium">
          {TERMS_SECTIONS.map((s) => (
            <section key={s.num} className={`${s.bg} p-8 md:p-12 border-b border-[rgba(229,226,218,0.1)] last:border-none`}>
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <span className="font-mono text-primary text-[0.8125rem] uppercase tracking-widest mb-2 block font-bold">Clause {s.num}</span>
                  <h2 className="text-3xl font-serif text-on-background tracking-tight">{s.title}</h2>
                </div>
                <div className="md:col-span-8 text-on-surface-variant leading-relaxed text-[0.9375rem]">
                  {s.content}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-[rgba(229,226,218,0.3)] flex flex-col md:flex-row justify-between items-center gap-8 px-4">
          <div>
            <p className="text-2xl font-serif italic text-on-background">Growth.ai</p>
            <p className="text-on-surface-variant/50 text-[0.8125rem] font-mono">© 2024 The Pi Lab. All Rights Reserved.</p>
          </div>
          <div className="flex gap-10">
            <Link href="/" className="text-[0.875rem] font-bold text-on-surface-variant hover:text-primary transition-colors font-mono uppercase tracking-wider">Home</Link>
            <Link href="/privacy" className="text-[0.875rem] font-bold text-on-surface-variant hover:text-primary transition-colors font-mono uppercase tracking-wider">Privacy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
