"use client";

import React, { useState } from "react";
import type { TokenMetadata } from "@/lib/solana/types";
import { CopyIcon, CheckIcon, TwitterIcon, TelegramIcon, GlobeIcon, ExternalLinkIcon, CoinIcon } from "./Icons";

interface TokenInfoProps {
  metadata: TokenMetadata | null;
  tokenAddress: string;
}

export default function TokenInfo({ metadata, tokenAddress }: TokenInfoProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const truncatedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-6)}`;
  const hasMetadata = Boolean(metadata && metadata.name);
  const tokenName = hasMetadata ? metadata!.name : "Unregistered Token";
  const tokenSymbol = hasMetadata ? metadata!.symbol : "UNKNOWN";

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3.5">
        {/* Token Avatar / Fallback */}
        <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 flex items-center justify-center shadow-inner">
          {metadata?.image && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={metadata.image}
              alt={tokenName}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-800/80 font-bold text-base">
              {tokenSymbol.slice(0, 3).toUpperCase() || <CoinIcon size={20} />}
            </div>
          )}
        </div>

        {/* Name, Symbol & Tags */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white truncate tracking-tight">
              {tokenName}
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/80 text-xs font-mono font-semibold text-emerald-400">
              ${tokenSymbol}
            </span>
          </div>

          {metadata?.description && (
            <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5" title={metadata.description}>
              {metadata.description}
            </p>
          )}
        </div>
      </div>

      {/* Address & Quick Copy */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Mint:</span>
          <span className="hidden sm:inline text-zinc-300">{tokenAddress}</span>
          <span className="sm:hidden text-zinc-300">{truncatedAddress}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-1 p-1 hover:text-white text-zinc-400 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500"
            title="Copy address"
          >
            {copied ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} />}
          </button>
        </div>

        {copied && (
          <span className="text-[11px] font-medium text-emerald-400 animate-fade-in">
            Copied to clipboard!
          </span>
        )}

        {/* Explorer Link */}
        <a
          href={`https://solscan.io/token/${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg transition-colors"
        >
          <span>Solscan</span>
          <ExternalLinkIcon size={12} />
        </a>
      </div>

      {/* Social Links */}
      {metadata && (metadata.twitter || metadata.telegram || metadata.website) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
          {metadata.twitter && (
            <a
              href={metadata.twitter.startsWith("http") ? metadata.twitter : `https://x.com/${metadata.twitter.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <TwitterIcon size={13} className="text-zinc-300" />
              <span>Twitter</span>
            </a>
          )}
          {metadata.telegram && (
            <a
              href={metadata.telegram.startsWith("http") ? metadata.telegram : `https://t.me/${metadata.telegram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-sky-300 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <TelegramIcon size={13} className="text-sky-400" />
              <span>Telegram</span>
            </a>
          )}
          {metadata.website && (
            <a
              href={metadata.website.startsWith("http") ? metadata.website : `https://${metadata.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-300 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <GlobeIcon size={13} className="text-emerald-400" />
              <span>Website</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
