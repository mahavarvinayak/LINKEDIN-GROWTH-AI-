"use client";

import { Zap, BarChart2 } from "lucide-react";

interface CreditBadgeProps {
  analyze: number;
  generate: number;
  plan?: string;
}

export default function CreditBadge({ analyze, generate, plan }: CreditBadgeProps) {
  const isFree = plan === "free";

  return (
    <div className="flex items-center gap-3">
      {/* Analyze Credits */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container-lowest rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] shadow-sm">
        <BarChart2 className="w-4 h-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-[0.625rem] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none mb-1 font-mono">Analyze</span>
          <span className="text-[0.875rem] font-bold text-on-background leading-none">
            {isFree ? analyze : "∞"}
          </span>
        </div>
      </div>

      {/* Generate Credits */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-container-lowest rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] shadow-sm">
        <Zap className="w-4 h-4 text-secondary fill-secondary/20" />
        <div className="flex flex-col">
          <span className="text-[0.625rem] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none mb-1 font-mono">Generate</span>
          <span className="text-[0.875rem] font-bold text-on-background leading-none">
            {isFree ? generate : "∞"}
          </span>
        </div>
      </div>
    </div>
  );
}
