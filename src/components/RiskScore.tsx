import React from "react";

interface RiskScoreProps {
  score: number;
}

export default function RiskScore({ score }: RiskScoreProps) {
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Normalized 0 to 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = "#10b981"; // green (safe)
  let glowColor = "rgba(16, 185, 129, 0.35)";
  let bgGradient = "from-emerald-500/10 to-transparent";
  let label = "LOW RISK";
  let labelColor = "text-emerald-400";

  if (normalizedScore > 60) {
    strokeColor = "#ef4444"; // red (danger)
    glowColor = "rgba(239, 68, 68, 0.35)";
    bgGradient = "from-red-500/10 to-transparent";
    label = "DANGER";
    labelColor = "text-red-400";
  } else if (normalizedScore > 30) {
    strokeColor = "#f59e0b"; // amber (caution)
    glowColor = "rgba(245, 158, 11, 0.35)";
    bgGradient = "from-amber-500/10 to-transparent";
    label = "CAUTION";
    labelColor = "text-amber-400";
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-36 h-36 flex items-center justify-center rounded-full bg-gradient-to-b ${bgGradient} p-2`}>
        {/* Glow backdrop */}
        <div
          className="absolute inset-2 rounded-full blur-xl opacity-60 pointer-events-none transition-all duration-700"
          style={{ background: glowColor }}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#1c2438"
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Arc */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease",
            }}
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {normalizedScore}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            / 100 Risk
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className={`inline-block text-xs font-bold tracking-wider ${labelColor}`}>
          {label}
        </span>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {normalizedScore <= 30
            ? "Token has passed key safety checks"
            : normalizedScore <= 60
              ? "Multiple warning flags identified"
              : "High risk of rugpull or loss"}
        </p>
      </div>
    </div>
  );
}
