import type { CheckResult, AnalysisResult, MintAccount, TokenHolder, LpPosition, DevActivity, TokenExtensions, TokenMetadata } from "../solana/types";
import { analyzeAuthorities } from "./authority";
import { analyzeLiquidity } from "./liquidity";
import { analyzeHolders } from "./holders";
import { analyzeTokenExtensions } from "./token2022";
import { analyzeDevActivity } from "./dev-wallet";
import { analyzeMetadata } from "./metadata";

export async function runAnalysis(args: {
  tokenAddress: string;
  mint: MintAccount;
  topHolders: TokenHolder[];
  liquidity: LpPosition[];
  devActivity: DevActivity;
  extensions: Partial<TokenExtensions>;
  metadata: TokenMetadata | null;
}): Promise<AnalysisResult> {
  const checks: CheckResult[] = [];

  // Run all analyzer modules
  checks.push(...analyzeAuthorities(args.mint.mintAuthority, args.mint.freezeAuthority));
  checks.push(...analyzeLiquidity(args.liquidity));
  checks.push(...analyzeHolders(args.topHolders, args.mint.supply));
  checks.push(...analyzeTokenExtensions(
    args.mint.isToken2022,
    args.extensions.transferFeeEnabled ?? false,
    args.extensions.transferFeeMax ?? 0,
    false, // hasBlacklist
  ));
  checks.push(...analyzeDevActivity(args.devActivity));
  checks.push(...analyzeMetadata(args.metadata));

  // Calculate total score
  const totalScore = checks.reduce((sum, check) => sum + check.points, 0);
  const cappedScore = Math.min(totalScore, 100);

  // Determine verdict
  const verdict =
    cappedScore <= 30
      ? ("safe" as const)
      : cappedScore <= 60
        ? ("caution" as const)
        : ("risky" as const);

  return {
    tokenAddress: args.tokenAddress,
    overallScore: cappedScore,
    verdict,
    checks,
    mint: args.mint,
    topHolders: args.topHolders,
    liquidity: args.liquidity,
    devActivity: args.devActivity,
    extensions: {
      transferFeeEnabled: args.extensions.transferFeeEnabled ?? false,
      transferFeeMax: args.extensions.transferFeeMax ?? 0,
      transferFeeRecipient: args.extensions.transferFeeRecipient,
      transferHookEnabled: false,
      preTransitionInstructions: false,
      permanentDelegate: args.extensions.permanentDelegate,
      confidentialTransferEnabled: false,
      closeAuthorityRequired: false,
    },
    metadata: args.metadata,
    analyzedAt: Date.now(),
  };
}
