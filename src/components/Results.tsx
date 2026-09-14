"use client";

import React, { useState, useMemo } from "react";
import RiskScore from "./RiskScore";
import VerdictBadge from "./VerdictBadge";
import CheckSection from "./CheckSection";
import TokenInfo from "./TokenInfo";
import type { AnalysisResult, CheckResult } from "@/lib/solana/types";
import {
  LockIcon,
  UnlockIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  ExternalLinkIcon,
  WalletIcon,
  UsersIcon,
  TwitterIcon,
} from "./Icons";

interface ResultsProps {
  result: AnalysisResult;
  onRescan?: () => void;
}

export default function Results({ result, onRescan }: ResultsProps) {
  const [filter, setFilter] = useState<"all" | "danger" | "warning" | "safe">("all");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Group check counts
  const counts = useMemo(() => {
    let danger = 0;
    let warning = 0;
    let safe = 0;
    for (const c of result.checks) {
      if (c.riskLevel === "danger") danger++;
      else if (c.riskLevel === "warning") warning++;
      else safe++;
    }
    return { danger, warning, safe, total: result.checks.length };
  }, [result.checks]);

  // Filter checks
  const filteredChecks = useMemo(() => {
    if (filter === "all") return result.checks;
    return result.checks.filter((c: CheckResult) => c.riskLevel === filter);
  }, [result.checks, filter]);

  // Format supply
  const formattedSupply = useMemo(() => {
    const s = Number(result.mint.supply);
    if (s >= 1_000_000_000) return `${(s / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;
    if (s >= 1_000_000) return `${(s / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
    if (s >= 1_000) return `${(s / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`;
    return s.toLocaleString();
  }, [result.mint.supply]);

  // Copy brief audit summary
  const handleCopySummary = async () => {
    const text = `RugCheck Audit for ${result.metadata?.name || result.tokenAddress} ($${result.metadata?.symbol || "TOKEN"}):
Risk Score: ${result.overallScore}/100 (${result.verdict.toUpperCase()})
Mint Authority: ${result.mint.mintAuthority === null ? "Revoked" : "Active"}
Freeze Authority: ${result.mint.freezeAuthority === null ? "Revoked" : "Active"}
Checks: ${counts.safe} Passed, ${counts.warning} Warnings, ${counts.danger} Critical Risks
Address: ${result.tokenAddress}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // ignore
    }
  };

  // Share results on Twitter / X
  const handleShareTwitter = () => {
    const name = result.metadata?.name || "Unknown Token";
    const symbol = result.metadata?.symbol || "TOKEN";
    const score = result.overallScore;
    const verdict = result.verdict.toUpperCase();
    const mint = result.mint.mintAuthority === null ? "Revoked" : "Active";
    const freeze = result.mint.freezeAuthority === null ? "Revoked" : "Active";
    const addr = `${result.tokenAddress.slice(0, 6)}...${result.tokenAddress.slice(-4)}`;

    const text = [
      `RugCheck Audit: ${name} ($${symbol})`,
      ``,
      `Score: ${score}/100 — ${verdict}`,
      `Mint: ${mint} | Freeze: ${freeze}`,
      `${counts.danger} Critical · ${counts.warning} Warning · ${counts.safe} Passed`,
      ``,
      `CA: ${addr}`,
      ``,
      `Verified on RugCheck`,
    ].join("\n");

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  const isMintRevoked = result.mint.mintAuthority === null;
  const isFreezeRevoked = result.mint.freezeAuthority === null;
  const hasLiquidity = result.liquidity && result.liquidity.length > 0;
  const isLpProtected = hasLiquidity && result.liquidity.some((lp) => lp.lpBurned || lp.lpLocked);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Main Score & Metadata Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Column: Risk Dial & Verdict */}
          <div className="flex flex-col items-center gap-3 md:border-r md:border-zinc-800/80 md:pr-8 flex-shrink-0">
            <RiskScore score={result.overallScore} />
            <VerdictBadge verdict={result.verdict} size="md" />
          </div>

          {/* Right Column: Token Identity & Summary */}
          <div className="flex-1 w-full min-w-0">
            <TokenInfo metadata={result.metadata} tokenAddress={result.tokenAddress} />

            {/* Quick Action Buttons Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-800/80">
              <a
                href={`https://dexscreener.com/solana/${result.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700/90 text-xs font-semibold text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                <span>DexScreener</span>
                <ExternalLinkIcon size={12} />
              </a>

              <a
                href={`https://birdeye.so/token/${result.tokenAddress}?chain=solana`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700/90 text-xs font-semibold text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                <span>Birdeye</span>
                <ExternalLinkIcon size={12} />
              </a>

              <a
                href={`https://jup.ag/swap/SOL-${result.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-xs font-semibold text-emerald-300 border border-emerald-800/50 transition-colors"
              >
                <span>Jupiter Swap</span>
                <ExternalLinkIcon size={12} />
              </a>

              <button
                type="button"
                onClick={handleShareTwitter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-100 border border-zinc-700/50 transition-colors ml-auto"
              >
                <TwitterIcon size={12} />
                <span>Share on X</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 text-xs font-semibold text-zinc-300 border border-zinc-700/50 transition-colors"
              >
                <span>{copiedSummary ? "Audit Copied!" : "Share Summary"}</span>
              </button>

              {onRescan && (
                <button
                  type="button"
                  onClick={onRescan}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 text-xs font-semibold text-zinc-300 border border-zinc-700/50 transition-colors"
                >
                  <span>Re-scan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Security Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Pillar 1: Mint Authority */}
        <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
          isMintRevoked
            ? "bg-zinc-900/50 border-emerald-500/20 hover:border-emerald-500/40"
            : "bg-red-950/20 border-red-500/30 hover:border-red-500/50"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mint Authority</span>
            {isMintRevoked ? (
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheckIcon size={14} />
              </span>
            ) : (
              <span className="p-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlertIcon size={14} />
              </span>
            )}
          </div>
          <div className="text-base font-bold text-white">
            {isMintRevoked ? "Revoked" : "Active / Mutable"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isMintRevoked
              ? "Supply is permanently capped. No new tokens can be printed."
              : "Warning: Creator can mint new tokens to dump on buyers."}
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
            Supply: <span className="text-zinc-200">{formattedSupply}</span>
          </div>
        </div>

        {/* Pillar 2: Freeze Authority */}
        <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
          isFreezeRevoked
            ? "bg-zinc-900/50 border-emerald-500/20 hover:border-emerald-500/40"
            : "bg-red-950/20 border-red-500/30 hover:border-red-500/50"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Freeze Authority</span>
            {isFreezeRevoked ? (
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheckIcon size={14} />
              </span>
            ) : (
              <span className="p-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlertIcon size={14} />
              </span>
            )}
          </div>
          <div className="text-base font-bold text-white">
            {isFreezeRevoked ? "Revoked" : "Active"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isFreezeRevoked
              ? "Wallets cannot be frozen or blacklisted by the dev."
              : "High Risk: Dev can freeze user wallets and block sales."}
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
            Decimals: <span className="text-zinc-200">{result.mint.decimals}</span>
          </div>
        </div>

        {/* Pillar 3: Liquidity Status */}
        <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
          isLpProtected
            ? "bg-zinc-900/50 border-emerald-500/20 hover:border-emerald-500/40"
            : hasLiquidity
              ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
              : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Liquidity Pool</span>
            {isLpProtected ? (
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <LockIcon size={14} />
              </span>
            ) : (
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <UnlockIcon size={14} />
              </span>
            )}
          </div>
          <div className="text-base font-bold text-white">
            {isLpProtected ? "Locked / Burned" : hasLiquidity ? "Unlocked LP" : "No LP Found"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isLpProtected
              ? "Liquidity is locked or burned, preventing sudden pulls."
              : hasLiquidity
                ? "LP is not burned or locked. Dev can pull liquidity."
                : "No decentralized liquidity pool detected on-chain."}
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
            Pools: <span className="text-zinc-200">{result.liquidity?.length ?? 0}</span>
          </div>
        </div>

        {/* Pillar 4: Token Standards & Taxes */}
        <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
          !result.extensions?.transferFeeEnabled
            ? "bg-zinc-900/50 border-emerald-500/20 hover:border-emerald-500/40"
            : "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Transfer Tax</span>
            {!result.extensions?.transferFeeEnabled ? (
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheckIcon size={14} />
              </span>
            ) : (
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlertIcon size={14} />
              </span>
            )}
          </div>
          <div className="text-base font-bold text-white">
            {result.extensions?.transferFeeEnabled
              ? `${result.extensions.transferFeeMax}% Tax`
              : "0% Fee (Standard)"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {result.extensions?.transferFeeEnabled
              ? `Token charges a transfer fee up to ${result.extensions.transferFeeMax}%.`
              : "No transfer fee tax configured. Trades transfer 1:1."}
          </p>
          <div className="mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
            Type: <span className="text-zinc-200">{result.mint.isToken2022 ? "Token-2022" : "SPL Token"}</span>
          </div>
        </div>
      </div>

      {/* Developer & Supply On-Chain Telemetry (if available) */}
      {(result.devActivity?.devWallet || (result.topHolders && result.topHolders.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Dev Wallet Card */}
          {result.devActivity?.devWallet && (
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <WalletIcon size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Creator / Dev Wallet
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">
                  {result.devActivity.devWallet.slice(0, 8)}...{result.devActivity.devWallet.slice(-8)}
                </span>
                <a
                  href={`https://solscan.io/account/${result.devActivity.devWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                >
                  <span>View Dev Solscan</span>
                  <ExternalLinkIcon size={11} />
                </a>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase">Holding Status</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">
                    {result.devActivity.isStillHolding
                      ? `Holding ~${result.devActivity.holdPercentage.toFixed(1)}%`
                      : "Sold / Transferred"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase">Recent On-Chain Txs</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">
                    {result.devActivity.recentTransactions?.length || 0} tracked
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Holders Concentration */}
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Holders & Distribution
              </span>
            </div>
            <div className="text-xs text-zinc-300">
              {result.topHolders && result.topHolders.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-400 text-xs">
                    <span>Identified Holders</span>
                    <span className="font-mono text-zinc-200">{result.topHolders.length} top wallets</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-xs">
                    <span>Largest Holder</span>
                    <span className="font-mono text-zinc-200">
                      {result.topHolders[0]?.percent?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">
                  Detailed holder distribution scanned from on-chain data.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Checks Section with Category Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Security Audits & Vulnerability Checks</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                {counts.total}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comprehensive breakdown of contract parameters, permissions, and liquidity.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === "all"
                  ? "bg-zinc-200 text-zinc-900 shadow-sm"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
              }`}
            >
              All ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setFilter("danger")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === "danger"
                  ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
                  : "bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-900/30"
              }`}
            >
              Critical ({counts.danger})
            </button>
            <button
              type="button"
              onClick={() => setFilter("warning")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === "warning"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                  : "bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-900/30"
              }`}
            >
              Warnings ({counts.warning})
            </button>
            <button
              type="button"
              onClick={() => setFilter("safe")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === "safe"
                  ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm shadow-emerald-500/20"
                  : "bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-900/30"
              }`}
            >
              Passed ({counts.safe})
            </button>
          </div>
        </div>

        {/* Checks List */}
        <div className="space-y-2.5">
          {filteredChecks.length > 0 ? (
            filteredChecks.map((check: CheckResult) => (
              <CheckSection key={check.id} check={check} />
            ))
          ) : (
            <div className="text-center py-8 bg-zinc-900/20 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
              No checks found in this category.
            </div>
          )}
        </div>
      </div>

      {/* Audit Meta Footer */}
      <div className="text-center text-zinc-600 text-xs pt-2">
        <span>Analyzed via Solana Mainnet RPC on {new Date(result.analyzedAt).toLocaleString()}</span>
        <span className="mx-2">•</span>
        <span>Deterministic Rule Engine v1.0</span>
      </div>
    </div>
  );
}
