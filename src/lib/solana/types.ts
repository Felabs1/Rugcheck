// On-chain account data for a token mint
export interface MintAccount {
  mintAuthority: string | null; // null = revoked
  freezeAuthority: string | null; // null = revoked
  supply: bigint;
  decimals: number;
  isToken2022: boolean;
  extensions?: Record<string, unknown>;
}

// Token holder info
export interface TokenHolder {
  address: string;
  balance: bigint;
  percent: number; // % of total supply
  label?: string; // "dev", "lp", "known"
}

// Liquidity pool position
export interface LpPosition {
  poolId: string;
  poolAddress: string;
  lpTokenBalance: bigint;
  lpBurned: boolean;
  lpLocked: boolean;
  lockEnd?: Date;
  poolValueUsd?: number;
  version: string; // "raydium_amm", "raydium_clmm", "orca", etc.
}

// Dev wallet activity
export interface DevActivity {
  devWallet: string;
  recentTransactions: TransactionEvent[];
  totalSold24h: number; // amount sold in last 24h
  totalBought24h: number;
  isStillHolding: boolean;
  holdPercentage: number;
}

export interface TransactionEvent {
  signature: string;
  type: "buy" | "sell" | "transfer" | "liquidity_add" | "liquidity_remove";
  timestamp: number;
  amount: number;
  usdValue: number;
}

// Token metadata (from Metaplex)
export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  description?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

// Token-2022 extension data
export interface TokenExtensions {
  transferFeeEnabled: boolean;
  transferFeeMax: number; // percentage
  transferFeeRecipient?: string;
  transferHookEnabled: boolean;
  preTransitionInstructions: boolean;
  permanentDelegate?: string;
  confidentialTransferEnabled: boolean;
  closeAuthorityRequired: boolean;
}

// Individual check result
export interface CheckResult {
  id: string;
  title: string;
  description: string;
  riskLevel: "safe" | "warning" | "danger";
  points: number; // contribution to total score (0-weight)
  details: string;
  icon?: string;
}

// Full analysis result
export interface AnalysisResult {
  tokenAddress: string;
  overallScore: number; // 0-100
  verdict: "safe" | "caution" | "risky";
  checks: CheckResult[];
  mint: MintAccount;
  topHolders: TokenHolder[];
  liquidity: LpPosition[];
  devActivity: DevActivity;
  extensions: TokenExtensions;
  metadata: TokenMetadata | null;
  analyzedAt: number; // Unix timestamp
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
