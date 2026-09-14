import type { CheckResult } from "../solana/types";

/**
 * Check if mint and freeze authorities are revoked (good) or still enabled (bad)
 */
export function analyzeAuthorities(
  mintAuthority: string | null,
  freezeAuthority: string | null,
): CheckResult[] {
  const checks: CheckResult[] = [];

  // Mint authority check (weight: 25)
  if (mintAuthority === null) {
    checks.push({
      id: "mint_authority",
      title: "Mint Authority Revoked",
      description: "No one can mint new tokens. Supply is fixed.",
      riskLevel: "safe",
      points: 0,
      details: "The mint authority has been disabled. This means no new tokens can be created, protecting investors from infinite supply dilution.",
      icon: "✅",
    });
  } else {
    checks.push({
      id: "mint_authority",
      title: "Mint Authority Still Active",
      description: "Someone can still create new tokens — risk of inflation.",
      riskLevel: "danger",
      points: 25,
      details: `The mint authority (${mintAuthority.slice(0, 8)}…) is still active. This means someone can mint unlimited new tokens at any time, which would dilute your investment to near zero.`,
      icon: "🚨",
    });
  }

  // Freeze authority check (weight: 15)
  if (freezeAuthority === null) {
    checks.push({
      id: "freeze_authority",
      title: "Freeze Authority Revoked",
      description: "No one can freeze your token holdings.",
      riskLevel: "safe",
      points: 0,
      details: "The freeze authority has been disabled. Token holders cannot have their accounts forcibly frozen by the token creator.",
      icon: "✅",
    });
  } else {
    checks.push({
      id: "freeze_authority",
      title: "Freeze Authority Still Active",
      description: "Someone could freeze your wallet — blocking transfers/sales.",
      riskLevel: "danger",
      points: 15,
      details: `The freeze authority (${freezeAuthority.slice(0, 8)}…) is still active. The creator could freeze your wallet, preventing you from selling or transferring your tokens.`,
      icon: "❄️",
    });
  }

  return checks;
}
