import React from "react";
import SearchBar from "@/components/SearchBar";
import { ShieldCheckIcon, SolanaIcon } from "@/components/Icons";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] bg-radial-hero text-zinc-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-xl bg-zinc-950 flex items-center justify-center text-emerald-400">
                <ShieldCheckIcon size={20} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  RugCheck
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center gap-3">
            {/* Solana Network Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-300">
              <SolanaIcon size={14} />
              <span className="text-zinc-400">Mainnet:</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800/60"
            >
              Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Copy */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-time On-chain Security Analysis</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Verify Any Solana Token{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Before You Trade
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Audit mint authorities, freeze permissions, liquidity pool locks, holder concentration, and Token-2022 transfer taxes in seconds.
          </p>
        </div>

        {/* Search & Audit Flow */}
        <SearchBar />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 mt-auto py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon size={16} className="text-emerald-500" />
            <span className="text-zinc-400 font-medium">RugCheck Security Engine</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <p className="text-center sm:text-right max-w-md text-[11px] text-zinc-600">
            RugCheck reads public on-chain blockchain data via RPC. Heuristic checks are for informational purposes and do not constitute financial advice. Always DYOR.
          </p>
        </div>
      </footer>
    </div>
  );
}
