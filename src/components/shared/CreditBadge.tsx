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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
        <BarChart2 className="w-4 h-4 text-blue-500" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Analyze</span>
          <span className="text-sm font-bold text-slate-700 leading-none">
            {isFree ? analyze : "∞"}
          </span>
        </div>
      </div>

      {/* Generate Credits */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
        <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Generate</span>
          <span className="text-sm font-bold text-slate-700 leading-none">
            {isFree ? generate : "∞"}
          </span>
        </div>
      </div>
    </div>
  );
}
