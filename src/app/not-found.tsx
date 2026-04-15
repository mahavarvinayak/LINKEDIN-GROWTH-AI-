import Link from "next/link";
import { AlertCircle, LayoutDashboard, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Large 404 Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[18rem] md:text-[28rem] font-serif leading-none text-surface-container opacity-40 -translate-y-6">
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg text-center space-y-8">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-high text-primary">
            <AlertCircle className="w-8 h-8" />
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif text-on-background tracking-tight">
          Page not found
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed max-w-md mx-auto">
          The editorial piece you&apos;re looking for has been moved, archived, or exists only in another dimension of our AI Atelier.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-[8px] bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold flex items-center justify-center gap-2 shadow-premium hover:shadow-lg transition-all active:scale-[0.97]"
          >
            <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 rounded-[8px] bg-surface-container-lowest text-on-background font-bold ring-1 ring-[rgba(229,226,218,0.5)] flex items-center justify-center gap-2 hover:bg-surface-container transition-all active:scale-[0.97]"
          >
            <Home className="w-5 h-5" /> Go Home
          </Link>
        </div>

        {/* Technical Metadata */}
        <div className="pt-10">
          <div className="inline-block px-4 py-2 bg-surface-container rounded-[6px]">
            <p className="font-mono text-[0.6875rem] text-on-surface-variant/50 flex items-center gap-2 uppercase tracking-widest">
              ERR_CODE: 404_ROUTE_ABANDONED | Growth Engine
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <footer className="fixed bottom-0 left-0 w-full py-8 text-center">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="h-px w-12 bg-on-surface-variant/15 mb-2" />
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/40">
            Editorial Growth Engine
          </p>
        </div>
      </footer>

      {/* Background Blurs */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/3 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
    </main>
  );
}
