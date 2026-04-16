"use client";

import { Check, ArrowRight, Zap, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free Entity",
    price: "0",
    description: "Ideal for beginners starting their networking trajectory.",
    features: [
      "3 AI Analyses per day",
      "2 AI Content Generations",
      "Draft Storage",
      "Basic Consistency Streak",
      "Standard Algorithm Scoring"
    ],
    cta: "Current Plan",
    current: true,
    accent: "bg-surface-2"
  },
  {
    name: "Starter Engine",
    price: "499",
    description: "For professionals scaling their network velocity.",
    features: [
      "15 AI Analyses per day",
      "10 AI Content Generations",
      "Priority Draft Cloud",
      "Advanced Persona Suite",
      "Enhanced Gemini Model Access"
    ],
    cta: "Upgrade to Starter",
    current: false,
    accent: "bg-primary/5 ring-primary/20"
  },
  {
    name: "Pro Reactor",
    price: "999",
    description: "Maximum output for executive-level brand development.",
    features: [
      "Unlimited AI Analyses",
      "Unlimited Generations",
      "Deep Narrative Analysis",
      "Custom Brand Tone Mapping",
      "Priority Developer Support"
    ],
    cta: "Upgrade to Pro",
    current: false,
    accent: "bg-gradient-to-br from-primary/10 to-primary-container/10 ring-primary/30"
  }
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center pt-8">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-4 italic">Resource Allocation</p>
        <h1 className="text-5xl font-serif text-on-background mb-4">Scalable Intelligence.</h1>
        <p className="text-lg font-medium text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Select the compute capacity that aligns with your professional growth trajectory. Precise tools for serious network builders.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        {PLANS.map((plan) => (
          <div 
            key={plan.name}
            className={`rounded-[16px] p-8 flex flex-col justify-between ring-1 shadow-premium transition-all hover:scale-[1.01] ${plan.accent} ${plan.current ? 'opacity-80' : 'bg-surface-container-lowest'}`}
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[1.125rem] font-serif text-on-background">{plan.name}</h3>
                {plan.name === "Starter Engine" && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-[6px] text-[0.625rem] font-bold uppercase tracking-widest font-mono">Popular</span>
                )}
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif text-on-background">${plan.price}</span>
                  <span className="text-on-surface-variant/50 font-mono text-sm uppercase tracking-tighter">/month</span>
                </div>
                <p className="mt-4 text-[0.875rem] font-medium text-on-surface-variant leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-[0.8125rem] font-medium text-on-surface-variant font-mono uppercase tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              disabled={plan.current}
              className={`w-full py-4 rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 ${
                plan.current 
                  ? "bg-surface-2 text-on-surface-variant/40 cursor-not-allowed" 
                  : "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg hover:shadow-premium"
              }`}
            >
              {plan.cta} {!plan.current && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>

      {/* Perks Footer */}
      <div className="bg-surface-container-lowest rounded-[12px] p-10 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium grid grid-cols-1 md:grid-cols-3 gap-10">
        <Perk 
          icon={TrendingUp} 
          title="Exponential Growth" 
          desc="Our models are trained on Top 1% LinkedIn creators to ensure your reach multiplier is always active." 
        />
        <Perk 
          icon={Sparkles} 
          title="Narrative Authenticity" 
          desc="We don't just generate text; we craft your voice profile to resonate with high-value network nodes." 
        />
        <Perk 
          icon={Zap} 
          title="Compute Efficiency" 
          desc="Low-latency inference engines mean zero downtime for your creative workflow." 
        />
      </div>
    </div>
  );
}

function Perk({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="space-y-3">
      <div className="w-10 h-10 bg-primary/5 rounded-[8px] flex items-center justify-center ring-1 ring-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h4 className="text-[1rem] font-serif text-on-background">{title}</h4>
      <p className="text-[0.8125rem] font-medium text-on-surface-variant/80 leading-relaxed font-mono uppercase tracking-tight">{desc}</p>
    </div>
  );
}
