import { PublicKey } from "@solana/web3.js";
import type { MintAccount } from "./types";
import { getAccountInfo } from "./rpc";

// Metaplex metadata program ID
const METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWcYQvL7boEoHblfPqKsPa";
const METADATA_PROGRAM = () => new PublicKey(METADATA_PROGRAM_ID);

/**
 * Fetch and parse mint account data into structured MintAccount
 */
export async function parseMintAccount(mintAddress: string): Promise<MintAccount> {
  const mintPubkey = new PublicKey(mintAddress);
  const result = await getAccountInfo(mintPubkey);

  if (!result || !result.data) {
    throw new Error(`Could not find valid mint account for ${mintAddress}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedData = result.data as any;
  const parsedInfo = parsedData.parsed?.info;
  const program = parsedData.program;

  if (!parsedInfo) {
    throw new Error(`Mint account data is not in expected format`);
  }

  const isToken2022 = program === "spl-token-2022";

  // Extract fields — handle both Token Program and Token-2022 formats
  const mintAuthorityVal = parsedInfo.mintAuthority ?? parsedInfo.authority?.mint_authority;
  const freezeAuthorityVal = parsedInfo.freezeAuthority ?? parsedInfo.authority?.freeze_authority;
  const supplyRaw = parsedInfo.supply ?? parsedInfo.token_amount?.amount ?? "0";
  const decimals = parsedInfo.decimals ?? parsedInfo.token_amount?.decimals ?? 6;

  const supply = BigInt(supplyRaw.toString()) / (BigInt(10) ** BigInt(decimals));

  return {
    mintAuthority: mintAuthorityVal == null ? null : String(mintAuthorityVal),
    freezeAuthority: freezeAuthorityVal == null ? null : String(freezeAuthorityVal),
    supply,
    decimals,
    isToken2022,
  };
}

/**
 * Wrapper with error handling
 */
export async function fetchAndParseMint(mintAddress: string): Promise<MintAccount> {
  try {
    return await parseMintAccount(mintAddress);
  } catch (error) {
    console.error("Error parsing mint account:", error);
    throw new Error(`Failed to parse mint account: ${mintAddress}\n${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Derive Metaplex metadata account PDA for a given mint
 */
export function deriveMetadataAccount(mintPublicKey: PublicKey) {
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf-8"),
      METADATA_PROGRAM().toBytes(),
      mintPublicKey.toBytes(),
    ],
    METADATA_PROGRAM(),
  );
  return metadataPda;
}

/**
 * Validate Solana address format
 */
export function isValidSolAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize an address (remove spaces, normalize)
 */
export function sanitizeAddress(address: string): string {
  return address.replace(/\s/g, "").trim();
}
