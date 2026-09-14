"use client";

import React, { useState } from "react";
import type { CheckResult } from "@/lib/solana/types";
import { CheckIcon, AlertTriangleIcon, AlertCircleIcon } from "./Icons";

interface CheckSectionProps {
  check: CheckResult;
  defaultOpen?: boolean;
}

const LEVEL_STYLES = {
  safe: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    border: "border-zinc-800/80 hover:border-emerald-500/30",
    pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    tag: "PASSED",
    icon: CheckIcon,
  },
  warning: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    border: "border-amber-900/30 hover:border-amber-500/40",
    pill: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    tag: "WARNING",
    icon: AlertTriangleIcon,
  },
  danger: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    iconBg: "bg-red-500/10 text-red-400 border-red-500/20",
    border: "border-red-900/40 hover:border-red-500/50",
    pill: "bg-red-500/10 text-red-400 border border-red-500/20",
    tag: "CRITICAL",
    icon: AlertCircleIcon,
  },
};

export default function CheckSection({ check, defaultOpen = false }: CheckSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || check.riskLevel === "danger");
  const current = LEVEL_STYLES[check.riskLevel] || LEVEL_STYLES.warning;
  const IconComponent = current.icon;

  return (
    <div
      className={`rounded-xl border bg-zinc-900/40 backdrop-blur-sm transition-all duration-200 overflow-hidden ${current.border}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-zinc-800/30 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          {/* Status Icon Indicator */}
          <div className={`p-2 rounded-lg border flex-shrink-0 ${current.iconBg}`}>
            <IconComponent size={16} />
          </div>

          {/* Title & Brief */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100">{check.title}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${current.pill}`}>
                {current.tag}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xl">
              {check.description}
            </p>
          </div>
        </div>

        {/* Right Score Penalty & Accordion Chevron */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span
            className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md border ${
              check.points > 0
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-zinc-800/80 text-zinc-400 border-zinc-700/50"
            }`}
          >
            {check.points > 0 ? `+${check.points} pts` : "0 pts"}
          </span>

          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-zinc-300" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2.5 bg-zinc-950/40 border-t border-zinc-800/60 animate-fade-in text-xs text-zinc-300 leading-relaxed space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Analysis:</span>
            <p className="text-zinc-300">{check.details}</p>
          </div>
        </div>
      )}
    </div>
  );
}
