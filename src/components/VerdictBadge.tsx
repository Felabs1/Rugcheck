import React from "react";
import { ShieldCheckIcon, AlertTriangleIcon, ShieldAlertIcon } from "./Icons";

export type VerdictType = "safe" | "caution" | "risky";

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: "sm" | "md" | "lg";
}

const CONFIG = {
  safe: {
    label: "PASSED / SAFE",
    icon: ShieldCheckIcon,
    badgeClasses: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10",
    dotClass: "bg-emerald-400",
  },
  caution: {
    label: "CAUTION REQUIRED",
    icon: AlertTriangleIcon,
    badgeClasses: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10",
    dotClass: "bg-amber-400",
  },
  risky: {
    label: "HIGH RISK / DANGER",
    icon: ShieldAlertIcon,
    badgeClasses: "bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10",
    dotClass: "bg-red-400",
  },
};

export default function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
  const current = CONFIG[verdict] || CONFIG.caution;
  const IconComponent = current.icon;

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-5 py-2 text-base gap-2.5",
  }[size];

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }[size];

  return (
    <div
      className={`inline-flex items-center font-bold tracking-wider rounded-full border shadow-sm backdrop-blur-sm ${sizeStyles} ${current.badgeClasses}`}
    >
      <IconComponent size={iconSizes} className="flex-shrink-0" />
      <span>{current.label}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass} animate-pulse`} />
    </div>
  );
}
