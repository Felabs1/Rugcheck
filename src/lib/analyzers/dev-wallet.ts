import type { CheckResult, DevActivity } from "../solana/types";

/**
 * Analyze creator/dev wallet activity — did they dump tokens after launch?
 */
export function analyzeDevActivity(devActivity: DevActivity): CheckResult[] {
  const checks: CheckResult[] = [];

  if (!devActivity.devWallet) {
    return [
      {
        id: "dev_activity",
        title: "Creator Wallet Unknown",
        description: "Could not identify the token creator/developer wallet.",
        riskLevel: "warning",
        points: 3,
        details:
          "We could not determine which wallet created this token. This is not necessarily a red flag for very old tokens, but makes tracking developer activity harder.",
        icon: "❓",
      },
    ];
  }

  // Total amount analysis
  const totalTrackedAmount = devActivity.recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const remainingAmount = Math.max(totalTrackedAmount - devActivity.totalSold24h, 0);

  // Large sell check (weight: varies)
  if (devActivity.totalSold24h > 100_000_000 && devActivity.isStillHolding) {
    checks.push({
      id: "dev_dump",
      title: "Creator Dumping Tokens",
      description: `Dev sold ${formatAmount(devActivity.totalSold24h)} tokens in last 24h while still holding ${devActivity.holdPercentage.toFixed(1)}%.`,
      riskLevel: "danger",
      points: 10,
      details: `${devActivity.devWallet.slice(0, 8)}… has sold ${formatAmount(devActivity.totalSold24h)} tokens in the last 24 hours and is still holding ${devActivity.holdPercentage.toFixed(1)}% of supply. This is a classic early exit pattern — devs often seed their own wallets with large allocations then dump on buyers.`,
      icon: "🏃",
    });
  } else if (devActivity.totalSold24h > 10_000_000) {
    checks.push({
      id: "dev_dump",
      title: "Significant Dev Selling Activity",
      description: `Dev sold ${formatAmount(devActivity.totalSold24h)} tokens recently.`,
      riskLevel: "warning",
      points: 5,
      details: `${devActivity.devWallet.slice(0, 8)}… has been actively selling (${formatAmount(devActivity.totalSold24h)} in 24h). While not always malicious, significant dev selling often correlates with price declines.`,
      icon: "📉",
    });
  }

  // Still holding check
  if (devActivity.isStillHolding && devActivity.holdPercentage > 10) {
    checks.push({
      id: "dev_hold",
      title: "Developer Still Holding Tokens",
      description: `Dev holds ${devActivity.holdPercentage.toFixed(1)}% of supply (~${formatAmount(remainingAmount)} tokens remaining).`,
      riskLevel: devActivity.holdPercentage > 30 ? "danger" : "warning",
      points: devActivity.holdPercentage > 30 ? 6 : 3,
      details: `The creator wallet still holds ${devActivity.holdPercentage.toFixed(1)}% of total supply (~${formatAmount(remainingAmount)} tokens). With this much inventory left, the rug pull risk remains until tokens are distributed or burned.`,
      icon: devActivity.holdPercentage > 30 ? "⚠️" : "👤",
    });
  }

  // Recent activity summary
  const txCount = devActivity.recentTransactions.length;
  const hasLiquidityTx = devActivity.recentTransactions.some(
    (tx) => tx.type === "liquidity_add" || tx.type === "liquidity_remove",
  );

  checks.push({
    id: "dev_overall",
    title: "Developer Activity Summary",
    description: `${txCount} tracked transactions${hasLiquidityTx ? ", LP activity detected" : ""}.`,
    riskLevel: hasLiquidityTx ? "warning" : "safe",
    points: hasLiquidityTx ? 2 : 0,
    details: `Tracked ${txCount} recent on-chain transactions for the creator wallet. ${hasLiquidityTx ? "LP interactions were observed." : "No liquidity pool activity recently."}`,
    icon: "📊",
  });

  return checks;
}

function formatAmount(balance: number | bigint): string {
  const num = Number(balance);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
