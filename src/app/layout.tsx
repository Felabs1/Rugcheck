import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RugCheck — Solana Token Safety & Smart Contract Auditor",
  description: "Instant on-chain security analysis for Solana tokens. Check mint authority, freeze authority, liquidity locks, top holder concentration, and Token-2022 extensions before you trade.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
