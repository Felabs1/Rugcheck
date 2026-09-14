import type { CheckResult, LpPosition } from "../solana/types";

/**
 * Analyze liquidity pool status — is LP burned/locked or can devs pull liquidity anytime?
 */
export function analyzeLiquidity(positions: LpPosition[]): CheckResult[] {
  const checks: CheckResult[] = [];

  if (positions.length === 0) {
    return [
      {
        id: "liquidity",
        title: "No Liquidity Detected",
        description: "This token may not have any liquidity pool.",
        riskLevel: "danger",
        points: 20,
        details:
          "We could not detect any liquidity pool for this token. This could mean it's a brand new token with no liquidity added yet, or potentially a honeypot/rugpull setup where LP was immediately removed.",
        icon: "⚠️",
      },
    ];
  }

  // Check each position
  for (const lp of positions) {
    if (lp.lpBurned || lp.lpLocked) {
      let reason = "";
      if (lp.lpBurned) {
        reason = "LP tokens have been sent to the burn address — they cannot be reclaimed.";
      } else {
        reason = `LP tokens are locked${lp.lockEnd ? ` until ${lp.lockEnd.toDateString()}` : ""}.`;
      }

      checks.push({
        id: `liquidity_${lp.version}_${lp.poolId.slice(0, 8)}`,
        title: `${capitalize(lp.version)} Liquidity Secure`,
        description: "Liquidity appears protected.",
        riskLevel: "safe",
        points: 0,
        details: `${reason} Pool value: $${formatUsd(lp.poolValueUsd)}.`,
        icon: "🔒",
      });
    } else {
      checks.push({
        id: `liquidity_${lp.version}_${lp.poolId.slice(0, 8)}`,
        title: `${capitalize(lp.version)} Liquidity Not Locked`,
        description: "LP is not burned or locked — dev can remove liquidity at any time.",
        riskLevel: "danger",
        points: 20,
        details: `The LP tokens for this ${lp.version} pool are NOT burned or locked. The developer(s) can withdraw all liquidity at any time, making your tokens worthless instantly. This is the most common rugpull method. Pool value: $${formatUsd(lp.poolValueUsd)}.`,
        icon: "💧",
      });
    }
  }

  // Summary check
  const hasAnySecure = positions.some((lp) => lp.lpBurned || lp.lpLocked);
  const totalLpValue = positions.reduce((sum, lp) => sum + (lp.poolValueUsd ?? 0), 0);

  checks.push({
    id: "liquidity_summary",
    title: "Liquidity Summary",
    description: `${positions.filter((lp) => !lp.lpBurned && !lp.lpLocked).length}/${positions.length} pools unprotected.`,
    riskLevel: hasAnySecure ? "safe" : "danger",
    points: hasAnySecure ? 5 : 15,
    details: `Total liquidity across all detected pools: $${formatUsd(totalLpValue)}. ${hasAnySecure ? "At least one pool has secured LP." : "None of the LP is burned or locked."}`,
    icon: hasAnySecure ? "🛡️" : "⚠️",
  });

  return checks;
}

function capitalize(str: string): string {
  return str.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatUsd(value: number | undefined): string {
  if (value === undefined) return "N/A";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}
