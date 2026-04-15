import Link from "next/link";
import { Check, Ban, Download, Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Editorial Growth Engine",
  description: "Terms of Service for the Editorial Growth Engine platform.",
};

const TERMS_SECTIONS = [
  {
    num: "01",
    title: "Acceptance",
    bg: "bg-surface-container-lowest",
    content: (
      <>
        <p className="mb-4">By accessing or using the Editorial Growth Engine (the &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity and its affiliates to these terms.</p>
        <p>Use of the Platform constitutes your acknowledgement that you have read, understood, and agree to be bound by these terms, which include our Privacy Policy.</p>
      </>
    ),
  },
  {
    num: "02",
    title: "Plans",
    bg: "bg-surface-container",
    content: (
      <>
        <p className="mb-6">We offer various subscription tiers (&ldquo;Atelier Plans&rdquo;) designed to match your editorial velocity. We reserve the right to modify the features or availability of these tiers at any time.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-[12px] ring-1 ring-[rgba(229,226,218,0.3)]">
            <h4 className="font-bold text-on-background text-[0.75rem] uppercase tracking-wider mb-2">Essential</h4>
            <p className="text-[0.8125rem] text-on-surface-variant">Up to 10 AI-assisted drafts per month for individual creators.</p>
          </div>
          <div className="bg-primary/5 p-5 rounded-[12px] ring-1 ring-primary/10">
            <h4 className="font-bold text-primary text-[0.75rem] uppercase tracking-wider mb-2">Strategy Pro</h4>
            <p className="text-[0.8125rem] text-on-surface-variant">Unlimited drafts, advanced analytics, and priority AI processing.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    num: "03",
    title: "Use",
    bg: "bg-surface-container-lowest",
    content: (
      <ul className="space-y-4">
        <li className="flex gap-4"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Users must provide accurate, complete registration information.</span></li>
        <li className="flex gap-4"><Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span>Account sharing outside of your licensed seat count is strictly prohibited.</span></li>
        <li className="flex gap-4"><Ban className="w-5 h-5 text-error flex-shrink-0 mt-0.5" /><span>You may not use the Platform for any illegal activity, including harassment or automated scraping.</span></li>
      </ul>
    ),
  },
  {
    num: "04",
    title: "AI Content",
    bg: "bg-surface-container",
    content: (
      <>
        <div className="bg-surface-container-high/40 p-6 rounded-[12px] mb-6">
          <h4 className="font-mono text-[0.75rem] font-bold mb-3 flex items-center gap-2 uppercase tracking-wider">⚡ Algorithm Disclosure</h4>
          <p className="font-mono text-[0.8125rem] text-on-surface-variant leading-relaxed">
            The Platform utilizes Large Language Models (LLMs) to generate editorial suggestions. While we strive for accuracy, AI-generated content may contain factual inaccuracies. Users retain full ownership of the final output but are responsible for vetting content before publication.
          </p>
        </div>
        <p>You grant us a limited, non-exclusive license to process your input data to improve our generative models, unless you are on an Enterprise plan with &ldquo;Zero-Retention&rdquo; enabled.</p>
      </>
    ),
  },
  {
    num: "05",
    title: "Payments",
    bg: "bg-surface-container-lowest",
    content: (
      <>
        <p className="mb-4">Subscriptions are billed in advance on a monthly or annual basis. All payments are non-refundable after the 7-day &ldquo;Refinement Window&rdquo; has expired.</p>
        <p>Failure to pay will result in a 3-day grace period, followed by account suspension and eventual data deletion after 30 days of inactivity.</p>
      </>
    ),
  },
  {
    num: "06",
    title: "Termination",
    bg: "bg-surface-container",
    content: (
      <p>You may terminate your account at any time via the Settings panel. Upon termination, your right to use the Platform will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive.</p>
    ),
  },
  {
    num: "07",
    title: "Liability",
    bg: "bg-surface-container-lowest",
    content: (
      <p className="italic">&ldquo;The Platform is provided &lsquo;AS IS&rsquo; without warranty of any kind. To the maximum extent permitted by law, Editorial Growth Engine shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service.&rdquo;</p>
    ),
  },
  {
    num: "08",
    title: "Governing Law",
    bg: "bg-surface-container",
    content: (
      <p>These terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
    ),
  },
  {
    num: "09",
    title: "Contact",
    bg: "bg-surface-container-lowest",
    content: (
      <>
        <p className="mb-6">If you have questions regarding these Terms, please reach out to our legal department.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:legal@growth-engine.ai" className="flex items-center gap-3 p-4 bg-surface-container rounded-[12px] hover:bg-surface-container-high transition-colors">
            <Mail className="w-5 h-5 text-primary" />
            <span className="font-mono text-[0.8125rem]">legal@growth-engine.ai</span>
          </a>
          <div className="flex items-center gap-3 p-4 bg-surface-container rounded-[12px]">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-mono text-[0.8125rem]">San Francisco, CA</span>
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
          <Link href="/" className="hover:text-primary transition-colors">Legal Center</Link>
          <span className="text-[0.5rem]">›</span>
          <span className="text-on-background">Terms of Service</span>
        </nav>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="text-6xl md:text-7xl font-serif text-on-background leading-tight mb-6">Terms of Service</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[rgba(229,226,218,0.3)] pb-10">
            <div className="space-y-2">
              <p className="text-lg text-on-surface-variant font-medium">Effective Date: October 24, 2023</p>
              <p className="text-on-surface-variant/60 font-mono text-[0.8125rem]">Version 2.4.1 — Editorial Growth Engine</p>
            </div>
            <button className="bg-gradient-to-br from-primary-container to-primary text-on-primary px-6 py-3 rounded-[8px] font-bold flex items-center gap-2 shadow-premium hover:shadow-lg transition-all active:scale-[0.97]">
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>
        </header>

        {/* Sections */}
        <div className="overflow-hidden rounded-[16px] ring-1 ring-[rgba(229,226,218,0.3)]">
          {TERMS_SECTIONS.map((s) => (
            <section key={s.num} className={`${s.bg} p-8 md:p-12`}>
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4">
                  <span className="font-mono text-primary text-[0.8125rem] uppercase tracking-tight mb-2 block">Section {s.num}</span>
                  <h2 className="text-3xl font-serif text-on-background">{s.title}</h2>
                </div>
                <div className="md:col-span-8 text-on-surface-variant leading-relaxed text-[0.9375rem]">
                  {s.content}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-[rgba(229,226,218,0.3)] flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-2xl font-serif">Editorial Growth Engine</p>
            <p className="text-on-surface-variant/50 text-[0.8125rem] font-mono">© 2023 All Rights Reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="text-[0.875rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Return to Home</Link>
            <Link href="/privacy" className="text-[0.875rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
