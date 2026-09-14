# RugCheck

Real-time on-chain security analyzer for Solana tokens. Paste any token mint address and get an instant risk assessment covering mint authorities, freeze permissions, liquidity locks, holder concentration, Token-2022 extensions, and creator wallet activity.

## Features

- **Mint & Freeze Authority** — detects whether the creator can print new tokens or freeze wallets
- **Liquidity Analysis** — checks if LP tokens are burned or locked
- **Holder Concentration** — flags wallets controlling a large share of supply
- **Token-2022 Extensions** — identifies transfer fees, permanent delegates, and other embedded risks
- **Creator Wallet Tracking** — analyzes the deployer's recent on-chain activity for dump signals (falls back to first-tx lookup when mint authority is revoked)
- **Metadata Verification** — checks name, symbol, image, and social links
- **Share on X** — one-click tweet of audit results

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Blockchain | `@solana/web3.js`, `@solana/spl-token` |
| RPC | [Helius](https://helius.dev) (optional) / Solana public RPC fallback |
| Token Data | Jupiter API (metadata + price) |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm/bun)

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Optional — improves RPC reliability and rate limits.
# Falls back to the public Solana RPC if not set.
HELIUS_RPC_KEY=your_helius_api_key
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/analyze/route.ts  # Analysis API endpoint (GET /api/analyze?address=...)
├── components/
│   ├── SearchBar.tsx         # Token address input + scan animation
│   ├── Results.tsx           # Full results dashboard
│   ├── TokenInfo.tsx         # Token metadata display
│   ├── RiskScore.tsx         # Score dial
│   ├── VerdictBadge.tsx      # Safe / Caution / Risky badge
│   ├── CheckSection.tsx      # Individual check rows
│   └── Icons.tsx             # SVG icon components
└── lib/
    ├── analyzers/
    │   ├── index.ts          # Orchestrator — runs all checks, computes score
    │   ├── authority.ts      # Mint & freeze authority checks
    │   ├── liquidity.ts      # LP lock/burn checks
    │   ├── holders.ts        # Holder concentration checks
    │   ├── token2022.ts      # Token-2022 extension checks
    │   ├── dev-wallet.ts     # Creator wallet activity checks
    │   └── metadata.ts       # Metadata quality checks
    └── solana/
        ├── rpc.ts            # Solana RPC connection + helpers
        ├── token.ts          # Mint account parsing + address validation
        └── types.ts          # Shared TypeScript interfaces
```

## API

### `GET /api/analyze?address=<mint_address>`

Runs the full analysis pipeline on a Solana token mint.

**Response:**

```json
{
  "success": true,
  "data": {
    "tokenAddress": "...",
    "overallScore": 35,
    "verdict": "caution",
    "checks": [...],
    "mint": { "mintAuthority": null, "freezeAuthority": "...", "supply": 1000000000, ... },
    "devActivity": { "devWallet": "...", "recentTransactions": [...], ... },
    "metadata": { "name": "...", "symbol": "...", ... },
    ...
  }
}
```

**Scoring:** Each check contributes risk points. Total is capped at 100.

| Score | Verdict |
|-------|---------|
| 0–30 | Safe |
| 31–60 | Caution |
| 61–100 | Risky |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Disclaimer

RugCheck reads public on-chain data via RPC and applies heuristic checks. Results are for informational purposes only and do not constitute financial advice. Always do your own research before trading.
