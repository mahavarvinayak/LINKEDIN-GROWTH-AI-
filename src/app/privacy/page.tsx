import Link from "next/link";
import { Check, Shield, Database, Cookie, Download, Trash2, Edit, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Editorial Growth Engine",
  description: "Read how Editorial Growth Engine curates, protects, and utilizes your information.",
};

const SECTIONS = [
  {
    title: "What We Collect",
    bg: "bg-surface",
    content: (
      <>
        <p>We believe in data minimalism. Our collection is limited to the essential variables required to calibrate your editorial voice:</p>
        <ul className="space-y-4 mt-6">
          <DataItem icon={<Check />} bold="Identity Data:" text="Name, professional email, and LinkedIn profile URL to synchronize your atelier workspace." />
          <DataItem icon={<Check />} bold="Creative Input:" text="Drafts, notes, and strategic briefs you upload for AI augmentation." />
          <DataItem icon={<Check />} bold="Technical Metadata:" text="IP addresses and browser configurations to optimize our performance for your specific environment." />
        </ul>
      </>
    ),
  },
  {
    title: "How We Use It",
    bg: "bg-background",
    content: (
      <>
        <p>Your data is the raw material for our intelligence engine. It is utilized exclusively for:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <UsageCard icon={<Shield className="w-5 h-5 text-primary" />} title="Refinement" desc="Fine-tuning the AI to mirror your unique vocabulary and rhetorical style." />
          <UsageCard icon={<Database className="w-5 h-5 text-primary" />} title="Strategy" desc="Generating growth metrics and engagement predictions for your published content." />
        </div>
      </>
    ),
  },
  {
    title: "AI & OpenAI Integration",
    bg: "bg-surface-container",
    isSpecial: true,
    content: (
      <div className="bg-[#1A1814] text-white p-10 md:p-12 rounded-[16px] relative overflow-hidden">
        <div className="relative z-10 font-mono text-[0.8125rem] space-y-5 opacity-90 leading-relaxed">
          <p>GROWTH ENGINE UTILIZES LARGE LANGUAGE MODELS PROVIDED BY OPENAI. BY INTERACTING WITH THE ATELIER, YOU ACKNOWLEDGE THAT YOUR INPUT DATA MAY BE PROCESSED VIA SECURE API ARCHITECTURE.</p>
          <p>IMPORTANT: WE DO NOT PERMIT OPENAI TO USE YOUR DATA TO TRAIN THEIR PUBLIC MODELS. YOUR INTELLECTUAL PROPERTY REMAINS CONFINED TO YOUR PRIVATE INSTANCE.</p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
      </div>
    ),
  },
  {
    title: "Data Storage & Security",
    bg: "bg-background",
    content: (
      <>
        <p>We house your data in encrypted, high-availability vaults. Our architecture employs industry-standard AES-256 encryption at rest and TLS 1.3 in transit.</p>
        <p className="mt-4">We perform regular penetration testing and maintain strict access controls (RBAC) to ensure that only authorized Editorial Growth Engine personnel can interact with our infrastructure—and only when strictly necessary for technical support.</p>
      </>
    ),
  },
  {
    title: "Cookies & Tracking",
    bg: "bg-surface",
    content: (
      <>
        <p>The Atelier uses functional cookies to remember your workspace settings and session state. We do not use third-party advertising trackers. Our cookies serve three primary purposes:</p>
        <ol className="list-decimal pl-6 space-y-4 mt-6">
          <li><strong>Essential:</strong> Keeping you logged into your secure session.</li>
          <li><strong>Preferences:</strong> Remembering your chosen font scales and dark mode settings.</li>
          <li><strong>Performance:</strong> Aggregated, anonymous telemetry to ensure the platform remains responsive.</li>
        </ol>
      </>
    ),
  },
  {
    title: "Your Sovereign Rights",
    bg: "bg-background",
    content: (
      <>
        <p>Under GDPR and CCPA, you retain full sovereignty over your digital footprint. At any time, you may exercise your right to:</p>
        <div className="space-y-3 mt-6">
          <RightRow icon={<Download className="w-5 h-5 text-primary" />} label="Data Portability (Export)" />
          <RightRow icon={<Trash2 className="w-5 h-5 text-error" />} label="The Right to be Forgotten (Delete)" />
          <RightRow icon={<Edit className="w-5 h-5 text-primary" />} label="Rectification (Edit)" />
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-primary to-primary-container rounded-[3px]" />
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em]">Growth.AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[0.8125rem] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider font-mono">Dashboard</Link>
          <Link href="/" className="text-[0.8125rem] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider font-mono">Home</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[680px] mx-auto px-6 pt-16 pb-12">
        <nav className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-6">
          <span>Legal</span>
          <span className="text-[0.5rem]">›</span>
          <span className="text-primary">Policy</span>
        </nav>
        <h1 className="text-6xl md:text-7xl font-serif leading-tight mb-8">Privacy Policy</h1>
        <p className="text-lg text-on-surface-variant leading-[1.7]">
          At Growth Engine AI Atelier, we treat your data with the same editorial precision we apply to your content. This policy outlines how we curate, protect, and utilize your information to drive your digital influence.
        </p>
        <div className="mt-8 flex items-center gap-4 text-[0.6875rem] font-mono text-on-surface-variant/40">
          <span className="bg-surface-container px-3 py-1 rounded-[4px]">Last Modified: OCT 24, 2023</span>
          <span className="bg-surface-container px-3 py-1 rounded-[4px]">Version 2.4.0-Stable</span>
        </div>
      </section>

      {/* Sections */}
      <div>
        {SECTIONS.map((s, i) => (
          <section key={i} className={`${s.bg} py-20 ${i === 0 ? "border-t border-[rgba(229,226,218,0.3)]" : ""}`}>
            <div className="max-w-[680px] mx-auto px-6">
              {!s.isSpecial && <h2 className="text-4xl font-serif mb-8 text-on-background">{s.title}</h2>}
              {s.isSpecial && <h2 className="text-4xl font-serif mb-8 text-on-background">{s.title}</h2>}
              <div className="text-on-surface-variant leading-[1.7] text-[0.9375rem]">{s.content}</div>
            </div>
          </section>
        ))}
      </div>

      {/* Contact CTA */}
      <section className="bg-[#1A1814] text-white py-28">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif mb-8 text-white">Contact Our Privacy Officer</h2>
          <p className="opacity-70 mb-12 leading-[1.7]">
            Should you have inquiries regarding our data practices or wish to exercise your legal rights, our legal team is available for consultation.
          </p>
          <a
            href="mailto:privacy@editorialgrowth.ai"
            className="inline-flex items-center gap-3 bg-gradient-to-br from-primary-container to-primary text-white px-8 py-4 rounded-full hover:scale-105 transition-transform font-bold"
          >
            <Mail className="w-5 h-5" /> privacy@editorialgrowth.ai
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-10 border-t border-[rgba(229,226,218,0.3)]">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="font-serif italic text-xl text-on-background">Growth Engine</span>
            <p className="text-[0.6875rem] text-on-surface-variant/50 font-mono mt-1">© 2023 ATELIER VENTURES INC. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex gap-8 text-[0.875rem] font-medium text-on-surface-variant">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span className="text-primary underline underline-offset-4">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function DataItem({ icon, bold, text }: { icon: React.ReactNode; bold: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="w-5 h-5 text-primary flex-shrink-0 mt-0.5">{icon}</span>
      <span><strong>{bold}</strong> {text}</span>
    </li>
  );
}

function UsageCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 bg-surface-container rounded-[12px]">
      <div className="mb-3">{icon}</div>
      <h3 className="text-[0.75rem] font-bold uppercase tracking-wider text-on-background mb-2">{title}</h3>
      <p className="text-[0.875rem]">{desc}</p>
    </div>
  );
}

function RightRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)]">
      <span className="font-medium text-on-background">{label}</span>
      {icon}
    </div>
  );
}
