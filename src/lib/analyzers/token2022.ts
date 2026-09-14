import type { CheckResult } from "../solana/types";

/**
 * Analyze Token-2022 extensions — transfer fees, blacklists, etc.
 */
export function analyzeTokenExtensions(
  isToken2022: boolean,
  feeEnabled: boolean,
  feeMaxPct: number,
  hasBlacklist: boolean,
): CheckResult[] {
  const checks: CheckResult[] = [];

  if (!isToken2022) {
    return [
      {
        id: "token_extensions",
        title: "Standard SPL Token",
        description: "Not a Token-2022 token — no extensions detected.",
        riskLevel: "safe",
        points: 0,
        details: "This is a standard SPL token (not Token-2022). It does not have extended features like transfer fees, forced transfers, or blacklists.",
        icon: "🪙",
      },
    ];
  }

  // Transfer fee check
  if (feeEnabled && feeMaxPct > 5) {
    checks.push({
      id: "transfer_fee",
      title: "High Transfer Fee Detected",
      description: `Transfer fee up to ${feeMaxPct.toFixed(1)}% per transaction.`,
      riskLevel: "danger",
      points: 10,
      details: `This Token-2022 token has a transfer fee of up to ${feeMaxPct.toFixed(1)}%. This means every buy/sell/transfer costs a cut that goes to the fee recipient. High fees (>10%) are often used in honeypot scams where selling becomes prohibitively expensive.`,
      icon: "💸",
    });
  } else if (feeEnabled && feeMaxPct >= 1 && feeMaxPct <= 5) {
    checks.push({
      id: "transfer_fee",
      title: "Low Transfer Fee Detected",
      description: `Small transfer fee of ${feeMaxPct.toFixed(1)}%.`,
      riskLevel: "warning",
      points: 3,
      details: `This Token-2022 token has a small transfer fee (${feeMaxPct.toFixed(1)}%). While not as concerning as high fees, this still represents a cost on every transaction. Verify this was intentional by the creator.`,
      icon: "⚠️",
    });
  } else if (feeEnabled) {
    checks.push({
      id: "transfer_fee",
      title: "Transfer Fee Enabled",
      description: `Minimal fee (<1%).`,
      riskLevel: "warning",
      points: 2,
      details: `A transfer fee exists (even at minimal rates). Ensure this matches the intended token configuration.`,
      icon: "ℹ️",
    });
  }

  // Blacklist check (if available from extension data)
  if (hasBlacklist) {
    checks.push({
      id: "blacklist",
      title: "Blacklist Extension Active",
      description: "Specific wallets can be blocked from holding/transferring tokens.",
      riskLevel: "danger",
      points: 8,
      details: "This token has a blacklist extension active. The admin can prevent specific addresses from transacting with this token — including YOUR wallet. This gives centralized control over who can participate.",
      icon: "🚫",
    });
  }

  checks.push({
    id: "token_2022_overall",
    title: "Token-2022 Overview",
    description: "Extended token program with additional features.",
    riskLevel: feeEnabled || hasBlacklist ? "warning" : "safe",
    points: feeEnabled || hasBlacklist ? 4 : 0,
    details: isToken2022
      ? "This token uses Solana's Token-2022 program which offers enhanced features. While powerful, these features can also be weaponized against investors."
      : "",
    icon: isToken2022 ? "🧩" : "🪙",
  });

  return checks;
}
