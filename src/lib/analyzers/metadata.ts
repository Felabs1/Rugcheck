import type { CheckResult, TokenMetadata } from "../solana/types";

/**
 * Analyze token metadata quality — is this a real project or anonymous dump?
 */
export function analyzeMetadata(metadata: TokenMetadata | null): CheckResult[] {
  const checks: CheckResult[] = [];

  if (!metadata) {
    return [
      {
        id: "metadata",
        title: "No Metadata Found",
        description: "Could not find any on-chain metadata for this token.",
        riskLevel: "warning",
        points: 5,
        details:
          "This token has no verifiable metadata (name, symbol, image). It may be an unregistered token, a very early launch before metadata was set, or potentially an impersonation attempt. Always verify you're checking the correct contract address.",
        icon: "📭",
      },
    ];
  }

  // Name check
  if (metadata.name && metadata.name.length > 2) {
    checks.push({
      id: "token_name",
      title: "Valid Token Name",
      description: `"${metadata.name}"`,
      riskLevel: "safe",
      points: 0,
      details: `Token name "${metadata.name}" (${metadata.symbol}) is registered on-chain via Metaplex standard.`,
      icon: "🏷️",
    });
  } else {
    checks.push({
      id: "token_name",
      title: "Empty or Minimal Token Name",
      description: "Token lacks a proper name — could be copycat or placeholder.",
      riskLevel: "warning",
      points: 3,
      details: 'The token name is empty or minimal. This is common with hastily created tokens that may be copying popular projects.',
      icon: "❓",
    });
  }

  // Social links analysis
  const socialCount = [metadata.twitter, metadata.telegram, metadata.website].filter(Boolean).length;

  if (socialCount >= 2) {
    checks.push({
      id: "social_links",
      title: "Strong Social Presence",
      description: `${socialCount} social links found.`,
      riskLevel: "safe",
      points: 0,
      details: `Found ${socialCount} social links in metadata${metadata.twitter ? ", including Twitter" : ""}${metadata.telegram ? ", Telegram" : ""}${metadata.website ? ", website" : ""}. Projects with verifiable social presence tend to be more legitimate.`,
      icon: "🌐",
    });
  } else if (socialCount === 1) {
    checks.push({
      id: "social_links",
      title: "Limited Social Presence",
      description: `Only 1 social link found.`,
      riskLevel: "warning",
      points: 3,
      details: "The token metadata only has one social link. Legitimate projects typically have multiple channels for community engagement. Lack of social presence makes it harder to verify the team's identity.",
      icon: "🔗",
    });
  } else {
    checks.push({
      id: "social_links",
      title: "No Social Links",
      description: "No Twitter, Telegram, or website in metadata.",
      riskLevel: "danger",
      points: 5,
      details: "No social links were found in the token metadata. While not all meme coins need socials, anonymous launches carry inherently higher risk since there's no way to identify the creators.",
      icon: "👻",
    });
  }

  // Image check
  if (metadata.image) {
    checks.push({
      id: "token_image",
      title: "Token Has Custom Artwork",
      description: "An image/logo was found in the metadata.",
      riskLevel: "safe",
      points: 0,
      details: "The token has custom artwork associated with it, suggesting at least basic branding effort.",
      icon: "🎨",
    });
  }

  // Image as IPFS check
  if (metadata.image?.includes("ipfs://")) {
    checks.push({
      id: "image_storage",
      title: "Image Stored on IPFS",
      description: "Uses decentralized storage for metadata.",
      riskLevel: "safe",
      points: 0,
      details: "The token image is hosted on IPFS (decentralized storage), meaning it won't disappear if a centralized server goes down.",
      icon: "🌍",
    });
  }

  checks.push({
    id: "metadata_overall",
    title: "Metadata Summary",
    description: "Full metadata profile assessment.",
    riskLevel: socialCount <= 1 ? "warning" : "safe",
    points: socialCount <= 1 ? 4 : 0,
    details: metadata.description
      ? `Description: ${truncate(metadata.description, 150)}`
      : "No description provided in metadata.",
    icon: "📋",
  });

  return checks;
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}
