"use client";

import React, { useState, useCallback, useEffect } from "react";
import Results from "./Results";
import type { AnalysisResult } from "@/lib/solana/types";
import {
  SearchIcon,
  CopyIcon,
  CloseIcon,
  AlertCircleIcon,
  SolanaIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  LockIcon,
  UsersIcon,
} from "./Icons";

const SCAN_STEPS = [
  "Connecting to Solana RPC cluster...",
  "Parsing Mint Account & Decimals...",
  "Verifying Mint & Freeze Authorities...",
  "Auditing Liquidity Pools & LP Locks...",
  "Scanning Dev Wallet & Recent Transfers...",
  "Evaluating Token-2022 Extensions & Taxes...",
  "Compiling Risk Verdict & Security Score...",
];

const POPULAR_TOKENS = [
  {
    name: "Wrapped SOL",
    symbol: "SOL",
    address: "So11111111111111111111111111111111111111112",
    badge: "Official",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkLDwyYtQv",
    badge: "Stablecoin",
  },
  {
    name: "Bonk",
    symbol: "BONK",
    address: "DezXAZ8z7SnrpJFxfhJChRBHFDktfYkZCbSKxn3Eqo",
    badge: "Meme",
  },
];

export default function SearchBar() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  // Scan step progression animation while loading
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 450);

    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = useCallback(
    async (targetAddress?: string) => {
      const query = (targetAddress || address).trim();
      if (!query) return;

      setLoading(true);
      setScanStepIndex(0);
      setError("");
      setResult(null);

      try {
        const res = await fetch(`/api/analyze?address=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || "Failed to analyze token");
          return;
        }

        setResult(data.data ?? null);
      } catch {
        setError("Network error — could not reach the analysis endpoint. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [address],
  );

  const handleSelectSample = (sampleAddress: string) => {
    setAddress(sampleAddress);
    handleAnalyze(sampleAddress);
  };

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text.trim());
      }
    } catch {
      // clipboard access denied
    }
  }, []);

  const handleClear = () => {
    setAddress("");
    setError("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Container */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2 sm:p-2.5 backdrop-blur-xl shadow-2xl transition-all focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Input field with leading icon */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
              <SearchIcon size={18} />
            </div>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste any Solana token mint address (e.g. DezX...)"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={loading}
              className="w-full pl-10 pr-10 py-3 bg-transparent text-zinc-100 placeholder-zinc-500 font-mono text-xs sm:text-sm focus:outline-none"
            />

            {address && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 text-zinc-500 hover:text-zinc-300 rounded-md transition-colors"
                title="Clear input"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handlePaste}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 disabled:opacity-50 text-zinc-300 hover:text-white rounded-xl border border-zinc-700/50 text-xs font-semibold transition-all"
              title="Paste from clipboard"
            >
              <CopyIcon size={14} />
              <span>Paste</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={loading || !address.trim()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:border-zinc-800 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-zinc-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon size={16} />
                  <span>Scan Token</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Progression Banner */}
      {loading && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              <SolanaIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Analyzing Smart Contract & Liquidity
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Step {scanStepIndex + 1} of {SCAN_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 truncate font-mono">
                {SCAN_STEPS[scanStepIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 backdrop-blur-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0 mt-0.5">
              <AlertCircleIcon size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Analysis Failed
              </h4>
              <p className="text-xs text-red-300/90 mt-0.5 leading-relaxed">
                {error}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Hint: Ensure the address is a valid base58 Solana token mint address on mainnet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && <Results result={result} onRescan={() => handleAnalyze()} />}

      {/* Empty State / Quick Discovery */}
      {!result && !loading && (
        <div className="space-y-8 pt-4">
          {/* Sample Token Quick-Select */}
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Or test an instant demo token:
            </span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {POPULAR_TOKENS.map((token) => (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => handleSelectSample(token.address)}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                  <span className="font-bold">{token.name}</span>
                  <span className="text-zinc-500 font-mono">${token.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    {token.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Educational Trust & Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 pt-6 border-t border-zinc-800/80">
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheckIcon size={16} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">Mint Authority Check</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Verifies if the supply is fixed or if the creator can secretly mint infinite tokens to dump on buyers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <ShieldAlertIcon size={16} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">Freeze Authority Audit</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Detects if developer can blacklist or freeze user wallets to prevent anyone from selling their tokens.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                <LockIcon size={16} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">LP Lock Verification</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Audits Raydium, Orca, and Meteora pools to confirm liquidity tokens are burned or timelocked safely.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <UsersIcon size={16} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">Whale Distribution</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Scans top wallets and developer address holdings to detect heavy centralization and cluster dumps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
