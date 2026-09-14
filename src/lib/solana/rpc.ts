import { Connection, PublicKey } from "@solana/web3.js";

// Try Helius first, fall back to public RPC
const HELIUS_API_KEY = process.env.HELIUS_RPC_KEY;
const MAINNET_RPC = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : "https://api.mainnet-beta.solana.com";

export const rpc: Connection = new Connection(MAINNET_RPC, "confirmed");

/**
 * Get parsed account info (returns value or null)
 */
export async function getAccountInfo(pubkey: PublicKey) {
  const result = await rpc.getParsedAccountInfo(pubkey);
  return result.value;
}

/**
 * Get all token accounts for a mint via program accounts
 */
export async function getAllTokenAccountsForMint(mintPublicKey: PublicKey) {
  const response = await rpc.getProgramAccounts(
    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VXY51"), // Token Program
    {
      filters: [
        { dataSize: 165 },
        {
          memcmp: {
            offset: 0,
            bytes: mintPublicKey.toBase58(),
          },
        },
      ],
    },
  );
  return response;
}

/**
 * Get signatures for an address (latest first)
 */
export async function getSignaturesForAddress(
  address: PublicKey,
  limit: number = 75,
) {
  try {
    return await rpc.getSignaturesForAddress(address, { limit });
  } catch {
    return [];
  }
}

/**
 * Find the earliest (creation) transaction for an address and return the
 * fee-payer — typically the account that created / deployed it.
 */
export async function getCreatorAddress(pubkey: PublicKey): Promise<string | null> {
  try {
    // Walk backwards through history to find the very first signature
    let before: string | undefined = undefined;
    let earliest = "";

    for (let i = 0; i < 5; i++) {
      const batch = await rpc.getSignaturesForAddress(pubkey, {
        limit: 1000,
        ...(before ? { before } : {}),
      });
      if (batch.length === 0) break;
      earliest = batch[batch.length - 1].signature;
      if (batch.length < 1000) break;
      before = earliest;
    }

    if (!earliest) return null;

    const tx = await rpc.getTransaction(earliest, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    // The fee payer (first signer / first static account key) is the creator
    const accountKeys = tx?.transaction.message.getAccountKeys();
    if (!accountKeys || accountKeys.length === 0) return null;
    return accountKeys.get(0)?.toBase58() ?? null;
  } catch {
    return null;
  }
}

/**
 * Get a single transaction by signature
 */
export async function getTransaction(signature: string) {
  try {
    const tx = await rpc.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    return tx;
  } catch {
    return null;
  }
}

/**
 * Check if RPC is healthy
 */
export async function checkRpcHealth() {
  try {
    await rpc.getVersion();
    return {
      healthy: true,
      source: HELIUS_API_KEY ? "helius" : "public",
      version: "ok",
    };
  } catch {
    return { healthy: false, source: "unknown", version: "" };
  }
}

/**
 * Fetch Jupiter metadata for a token (free, no key needed)
 */
export async function fetchJupiterMetadata(tokenAddress: string) {
  try {
    const res = await fetch(
      `https://api.jup.tf/coins/v2?addresses=${tokenAddress}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[tokenAddress] || null;
  } catch {
    return null;
  }
}

/**
 * Fetch Jupiter price for a token
 */
export async function fetchJupiterPrice(tokenAddress: string) {
  try {
    const res = await fetch(`https://api.jup.tf/price/v2?ids=${tokenAddress}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[tokenAddress]?.price || null;
  } catch {
    return null;
  }
}
