import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import type { AnalysisResult, TokenMetadata, TransactionEvent } from "@/lib/solana/types";
import { fetchAndParseMint, deriveMetadataAccount, isValidSolAddress, sanitizeAddress } from "@/lib/solana/token";
import { rpc, getSignaturesForAddress, getTransaction, getCreatorAddress } from "@/lib/solana/rpc";
import { runAnalysis } from "@/lib/analyzers";

// BigInt JSON replacer — JSON.stringify can't handle BigInt natively
function jsonReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const addressParam = url.searchParams.get("address");

  if (!addressParam) {
    return NextResponse.json(
      { success: false, error: "Missing 'address' parameter" },
      { status: 400 },
    );
  }

  const sanitized = sanitizeAddress(addressParam);

  if (!isValidSolAddress(sanitized)) {
    return NextResponse.json(
      { success: false, error: `Invalid Solana address: ${sanitized}` },
      { status: 400 },
    );
  }

  try {
    const result = await performAnalysis(sanitized);
    // Use replacer to handle BigInt serialization
    return new NextResponse(
      JSON.stringify({ success: true, data: result }, jsonReplacer),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze token",
      },
      { status: 500 },
    );
  }
}

async function performAnalysis(mintAddress: string): Promise<AnalysisResult> {
  // Step 1: Parse mint account
  console.log("Step 1: Parsing mint account...");
  const mint = await fetchAndParseMint(mintAddress);

  // Step 2: Fetch top holders (placeholder — v1 returns empty array)
  console.log("Step 2: Fetching token holders...");
  const topHolders: Array<{ address: string; balance: bigint; percent: number }> = [];

  // Step 3: Check liquidity pools (placeholder — v1 returns empty array)
  console.log("Step 3: Checking liquidity...");
  const liquidity: Array<{
    poolId: string;
    poolAddress: string;
    lpTokenBalance: bigint;
    lpBurned: boolean;
    lpLocked: boolean;
    version: string;
    poolValueUsd?: number;
  }> = [];

  // Step 4: Analyze dev wallet activity
  // If mint authority is revoked (null), look up the original creator
  // from the mint's first on-chain transaction (fee payer = deployer).
  console.log("Step 4: Analyzing dev wallet activity...");
  let devWalletAddress = mint.mintAuthority ?? "";
  if (!devWalletAddress) {
    console.log("Mint authority revoked — looking up creator from first tx...");
    devWalletAddress = await getCreatorAddress(new PublicKey(mintAddress)) ?? "";
  }
  const devActivity = await analyzeDevWallet(devWalletAddress);

  // Step 5: Token-2022 extensions (simplified)
  const extensions = {
    transferFeeEnabled: false,
    transferFeeMax: 0,
    transferFeeRecipient: undefined as string | undefined,
    permanentDelegate: undefined as string | undefined,
  };

  // Step 6: Fetch metadata
  console.log("Step 6: Fetching metadata...");
  const metadata = await fetchMetadata(mintAddress);

  // Step 7: Run analysis orchestrator
  console.log("Step 7: Running checks...");
  const result = await runAnalysis({
    tokenAddress: mintAddress,
    mint,
    topHolders,
    liquidity,
    devActivity,
    extensions,
    metadata,
  });

  return result;
}

/**
 * Analyze creator/dev wallet transactions
 */
async function analyzeDevWallet(devWalletAddress: string) {
  if (!devWalletAddress || devWalletAddress === "" || devWalletAddress === "undefined" || devWalletAddress === "null") {
    return {
      devWallet: "",
      recentTransactions: [],
      totalSold24h: 0,
      totalBought24h: 0,
      isStillHolding: false,
      holdPercentage: 0,
    };
  }

  try {
    // Validate dev wallet address before creating PublicKey
    if (!isValidSolAddress(devWalletAddress)) {
      return {
        devWallet: devWalletAddress,
        recentTransactions: [],
        totalSold24h: 0,
        totalBought24h: 0,
        isStillHolding: false,
        holdPercentage: 0,
      };
    }

    // Get recent transactions
    const devPubkey = new PublicKey(devWalletAddress);
    const txSignatures = await getSignaturesForAddress(devPubkey, 75);

    if (txSignatures.length === 0) {
      return {
        devWallet: devWalletAddress,
        recentTransactions: [],
        totalSold24h: 0,
        totalBought24h: 0,
        isStillHolding: false,
        holdPercentage: 0,
      };
    }

    // Fetch first few transaction details
    const firstTxs = txSignatures.slice(0, 20).map((sig) => sig.signature);
    const transactions: TransactionEvent[] = [];

    for (const sig of firstTxs) {
      const tx = await getTransaction(sig);
      if (tx && tx.meta) {
        transactions.push({
          signature: sig,
          type: "transfer" as TransactionEvent["type"],
          timestamp: tx.blockTime ?? 0,
          amount: Math.abs(tx.meta.fee ?? 0),
          usdValue: 0,
        });
      }
    }

    return {
      devWallet: devWalletAddress,
      recentTransactions: transactions,
      totalSold24h: 0, // Would require detailed swap parsing
      totalBought24h: 0,
      isStillHolding: true,
      holdPercentage: 0,
    };
  } catch (error) {
    console.error("Error analyzing dev wallet:", error);
    return {
      devWallet: devWalletAddress,
      recentTransactions: [],
      totalSold24h: 0,
      totalBought24h: 0,
      isStillHolding: false,
      holdPercentage: 0,
    };
  }
}

/**
 * Fetch Metaplex metadata for a token
 */
async function fetchMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const metadataPda = deriveMetadataAccount(mintPubkey);
    const result = await rpc.getParsedAccountInfo(metadataPda);

    if (!result?.value) return null;

    // parsed data is only available on Token Program accounts (not Buffer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedData = (result.value.data as any).parsed?.info;
    if (!parsedData) return null;

    const image = extractImage(parsedData);

    return {
      name: String(parsedData.name ?? ""),
      symbol: String(parsedData.symbol ?? ""),
      uri: String(parsedData.uri ?? ""),
      image,
      description: typeof parsedData.description === "string" ? parsedData.description : "",
    };
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImage(metadata: Record<string, any>): string | undefined {
  const rawImage = metadata.image;
  if (!rawImage) return undefined;

  const imageUrl = Array.isArray(rawImage) ? rawImage[0] : rawImage;
  if (typeof imageUrl === "string") {
    if (imageUrl.startsWith("ipfs://")) {
      return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return imageUrl;
  }
  return undefined;
}
