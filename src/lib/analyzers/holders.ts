import type { CheckResult, TokenHolder } from "../solana/types";

/**
 * Analyze holder concentration — top wallets holding too much is a risk
 */
export function analyzeHolders(
  topHolders: TokenHolder[],
  totalSupply: bigint,
): CheckResult[] {
  const checks: CheckResult[] = [];

  if (topHolders.length === 0) {
    return [
      {
        id: "holders",
        title: "No Holder Data Available",
        description: "Could not determine token distribution.",
        riskLevel: "warning",
        points: 8,
        details:
          "We could not retrieve holder data. This might be a very new token or one with limited on-chain activity. Proceed with extra caution.",
        icon: "❓",
      },
    ];
  }

  // Calculate concentration metrics
  const top10Balance = topHolders.slice(0, 10).reduce((sum, h) => sum + h.balance, BigInt(0));
  const top5Balance = topHolders.slice(0, 5).reduce((sum, h) => sum + h.balance, BigInt(0));
  const top1Balance = topHolders[0]?.balance ?? BigInt(0);

  const top1Pct = (Number(top1Balance) / Number(totalSupply)) * 100;
  const top5Pct = (Number(top5Balance) / Number(totalSupply)) * 100;
  const top10Pct = (Number(top10Balance) / Number(totalSupply)) * 100;

  // Top 5 concentration check if top 1 isn't extreme
  if (top5Pct > 60 && top1Pct <= 30) {
    checks.push({
      id: "holder_top_5",
      title: "Top 5 Wallets Control >60% of Supply",
      description: `Top 5 holders control ${top5Pct.toFixed(1)}% — significant clustering.`,
      riskLevel: "warning",
      points: 4,
      details: `The top 5 addresses control ${top5Pct.toFixed(1)}% of total supply (${formatAmount(top5Balance)} tokens). This level of concentration increases rug/dump risk.`,
      icon: "👥",
    });
  }

  // Top 1 check (weight: ~6)
  if (top1Pct > 30) {
    checks.push({
      id: "holder_top_1",
      title: "Single Holder Controls >30% of Supply",
      description: `${topHolders[0].address.slice(0, 8)}… holds ${top1Pct.toFixed(1)}% — huge concentration risk.`,
      riskLevel: "danger",
      points: Math.round((top1Pct / 30) * 6),
      details: `The single largest holder (${topHolders[0].label || "unknown"} wallet) controls ${top1Pct.toFixed(1)}% of the total supply (${formatAmount(topHolders[0].balance)}. tokens). If they sell everything, price will crash dramatically.`,
      icon: "🐋",
    });
  } else if (top1Pct > 15) {
    checks.push({
      id: "holder_top_1",
      title: "Top Holder Has >15% of Supply",
      description: `${topHolders[0].address.slice(0, 8)}… holds ${top1Pct.toFixed(1)}%.`,
      riskLevel: "warning",
      points: Math.round((top1Pct / 15) * 4),
      details: `The largest holder controls ${top1Pct.toFixed(1)}% of supply. While less concerning than extreme concentration, this still represents significant selling power.`,
      icon: "🐟",
    });
  } else {
    checks.push({
      id: "holder_top_1",
      title: "Top Holder Distribution Reasonable",
      description: `Largest holder has only ${top1Pct.toFixed(1)}% of supply.`,
      riskLevel: "safe",
      points: 0,
      details: `The largest holder controls just ${top1Pct.toFixed(1)}% of supply. This is a healthy distribution for early-stage meme coins.`,
      icon: "✅",
    });
  }

  // Top 10 check (weight: 9)
  if (top10Pct > 70) {
    checks.push({
      id: "holder_top_10",
      title: "Top 10 Holders Control >70% of Supply",
      description: "Extreme centralization detected.",
      riskLevel: "danger",
      points: 9,
      details: `The top 10 wallets collectively control ${top10Pct.toFixed(1)}% of the total supply (${formatAmount(top10Balance)} tokens). This suggests centralized control — devs may be distributing tokens across multiple wallets to mask ownership.`,
      icon: "🐙",
    });
  } else if (top10Pct > 50) {
    checks.push({
      id: "holder_top_10",
      title: "Top 10 Holders Control >50% of Supply",
      description: "Moderate to high concentration among top holders.",
      riskLevel: "warning",
      points: 5,
      details: `The top 10 wallets control ${top10Pct.toFixed(1)}% of supply. For meme coins, <50% is generally healthier. Monitor for coordinated dump patterns.`,
      icon: "⚠️",
    });
  } else {
    checks.push({
      id: "holder_top_10",
      title: "Healthy Holder Distribution",
      description: `Top 10 holders have ${top10Pct.toFixed(1)}% of supply.`,
      riskLevel: "safe",
      points: 0,
      details: `The top 10 wallets control just ${top10Pct.toFixed(1)}% of supply. This indicates relatively wide distribution.`,
      icon: "✅",
    });
  }

  // Total unique holders estimate
  checks.push({
    id: "holder_distribution",
    title: "Holder Distribution",
    description: `${topHolders.length} wallets with balance`,
    riskLevel: topHolders.length > 100 ? "safe" : topHolders.length > 20 ? "warning" : "danger",
    points: topHolders.length <= 20 ? 5 : topHolders.length <= 100 ? 2 : 0,
    details: `We identified ${topHolders.length} wallets holding this token. More holders typically means better decentralization.`,
    icon: topHolders.length > 100 ? "👥" : topHolders.length > 20 ? "👤" : "😶",
  });

  return checks;
}

function formatAmount(balance: bigint): string {
  const num = Number(balance);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
