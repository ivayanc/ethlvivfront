# Crypto Prediction Duels - Frontend

## 🎉 Frontend Created Successfully!

✅ Next.js 15 з TypeScript
✅ Wagmi + Viem для Web3
✅ Base Mini App SDK
✅ Providers налаштовані
✅ Contract addresses додано

## 🚀 Quick Start

### 1. Copy ABI Files

```bash
cd /Users/ivanyanchenko/farcaster
mkdir -p frontend/lib/abis
cp artifacts/contracts/PriceOracle.sol/PriceOracle.json frontend/lib/abis/
cp artifacts/contracts/PredictionGame.sol/PredictionGame.json frontend/lib/abis/
cp artifacts/contracts/DuelManager.sol/DuelManager.json frontend/lib/abis/
```

### 2. Create .env.local

```bash
cd frontend
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id" > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=84532" >> .env.local
```

Get Project ID: https://cloud.walletconnect.com/

### 3. Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000

## 📚 Full Guide

See **FRONTEND_GUIDE.md** for complete instructions with code examples!

## 🔗 Contracts (Base Sepolia)

- PriceOracle: 0x7bA9f7D7B3eFE92317996f8CF4BD0917e2499d88
- PredictionGame: 0xCE8160D4151f1B328feb58FdC8A590bBf003bb65
- DuelManager: 0x1F8493adf1776990FF7584036bbA173F9eac0863

Good luck! 🚀
