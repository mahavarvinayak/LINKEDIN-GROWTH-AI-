"use client";

import { X, Check, Zap, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: "starter",
    title: "Starter",
    price: "₹499",
    period: "/month",
    benefits: [
      "Unlimited AI text posts",
      "30 image credits/month",
      "Standard scheduling reminders",
    ],
    featured: false,
  },
  {
    id: "pro",
    title: "Pro",
    price: "₹999",
    period: "/month",
    benefits: [
      "Everything in Starter",
      "100 image credits/month",
      "Priority AI generation",
      "Weekly Analytics Report",
    ],
    featured: true,
  },
];

export default function Paywall({ isOpen, onClose }: PaywallProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="paywall-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: "rgba(26,24,20,0.7)", backdropFilter: "blur(12px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="paywall-modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-4xl rounded-[16px] overflow-hidden shadow-[0_24px_80px_rgba(26,24,20,0.3)] relative"
            style={{ background: "rgba(255,248,240,0.95)", backdropFilter: "blur(20px)" }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 p-2 rounded-[6px] bg-surface-2 text-on-surface-variant hover:text-on-background ring-1 ring-[rgba(229,226,218,0.4)] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left: Value Prop */}
              <div className="p-10 md:p-12 md:w-[45%] flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-[6px] ring-1 ring-primary/10 mb-8">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[0.5625rem] font-bold uppercase tracking-widest text-primary font-mono">Unlock Full Suite</span>
                  </div>

                  <h2 className="text-4xl font-serif text-on-background mb-4 leading-[1.1]">
                    You've used your<br />free credits.
                  </h2>
                  <p className="text-[0.9375rem] font-medium text-on-surface-variant leading-relaxed mb-10">
                    Upgrade to keep growing your LinkedIn presence with high-performing, AI-optimized editorial content.
                  </p>

                  <div className="space-y-4">
                    <Benefit text="Unlimited AI LinkedIn text posts" />
                    <Benefit text="Advanced Persona-driven generation" />
                    <Benefit text="Early access to viral templates" />
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-background bg-surface-container"
                        style={{ background: `hsl(${220 + i * 15}, 30%, ${75 - i * 5}%)` }}
                      />
                    ))}
                  </div>
                  <span className="text-[0.8125rem] font-medium text-on-surface-variant italic">
                    Joined by 1,200+ creators this month
                  </span>
                </div>
              </div>

              {/* Right: Plans */}
              <div className="md:w-[55%] p-8 md:p-10 bg-surface-container flex flex-col gap-5 justify-center">
                {PLANS.map((plan) => (
                  <PlanCard key={plan.id} {...plan} />
                ))}

                <div className="text-center mt-2">
                  <p className="text-[0.75rem] text-on-surface-variant/60 flex items-center justify-center gap-1.5 font-mono">
                    <MessageCircle className="w-3 h-3" />
                    Need a custom plan?{" "}
                    <button className="text-primary font-bold hover:underline underline-offset-4">
                      Chat with us
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-[4px] bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-primary" />
      </div>
      <span className="text-[0.875rem] font-medium text-on-surface-variant">{text}</span>
    </div>
  );
}

function PlanCard({
  title,
  price,
  period,
  benefits,
  featured,
}: {
  title: string;
  price: string;
  period: string;
  benefits: string[];
  featured: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-[12px] transition-all ${
        featured
          ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-premium"
          : "bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] text-on-background"
      }`}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h4
            className={`text-[0.625rem] font-bold uppercase tracking-widest font-mono mb-1 ${
              featured ? "text-on-primary/60" : "text-on-surface-variant/60"
            }`}
          >
            {title}
          </h4>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif">{price}</span>
            <span className={`text-[0.75rem] font-mono ${featured ? "text-on-primary/50" : "text-on-surface-variant/50"}`}>
              {period}
            </span>
          </div>
        </div>
        {featured && <Zap className="w-5 h-5 text-on-primary/70" />}
      </div>

      <ul className="space-y-2.5 mb-6">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-[0.8125rem] font-medium">
            <Check
              className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                featured ? "text-on-primary/70" : "text-secondary"
              }`}
            />
            <span className={featured ? "text-on-primary/80" : "text-on-surface-variant"}>
              {b}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => alert("Coming soon!")}
        className={`w-full py-3 rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98] ${
          featured
            ? "bg-white/15 hover:bg-white/25 text-on-primary border border-white/15 backdrop-blur-sm"
            : "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md hover:shadow-premium"
        }`}
      >
        Get {title}
      </button>
    </div>
  );
}
