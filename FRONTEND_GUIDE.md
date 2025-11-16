# Frontend Guide - Crypto Prediction Duels

## 🎯 Що Вже Створено

✅ Next.js проєкт з TypeScript та Tailwind CSS
✅ Wagmi та Viem для Web3 інтеграції
✅ Base Mini App SDK
✅ Конфігурація для Base Sepolia

## 📁 Структура Проєкту

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout з Providers
│   ├── page.tsx           # Головна сторінка
│   ├── predictions/       # Сторінка прогнозів
│   ├── duels/            # Сторінка дуелей
│   └── leaderboard/      # Лідерборд
├── components/            # React компоненти
│   ├── PredictionForm.tsx
│   ├── DuelCard.tsx
│   ├── LeaderboardTable.tsx
│   └── WalletConnect.tsx
├── lib/                   # Утиліти та конфігурація
│   ├── wagmi.ts          # Wagmi config
│   ├── contracts.ts      # Contract addresses
│   └── abis/             # Contract ABIs
└── public/
    └── .well-known/
        └── farcaster.json # Mini App manifest
```

## 🚀 Швидкий Старт

### 1. Копіювання ABI

Скопіюйте ABI з artifacts до frontend:

```bash
cd /Users/ivanyanchenko/farcaster

# Створіть директорію для ABIs
mkdir -p frontend/lib/abis

# Скопіюйте ABIs
cp artifacts/contracts/PriceOracle.sol/PriceOracle.json frontend/lib/abis/
cp artifacts/contracts/PredictionGame.sol/PredictionGame.json frontend/lib/abis/
cp artifacts/contracts/DuelManager.sol/DuelManager.json frontend/lib/abis/
```

### 2. Налаштування Environment Variables

Створіть `frontend/.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=84532
```

Отримайте WalletConnect Project ID тут: https://cloud.walletconnect.com/

### 3. Запуск Development Server

```bash
cd frontend
npm run dev
```

Відкрийте http://localhost:3000

## 📝 Наступні Кроки

### Крок 1: Створити Providers

Відредагуйте `app/layout.tsx`:

```typescript
'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize Base Mini App
    sdk.actions.ready();
  }, []);

  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

### Крок 2: Головна Сторінка

Відредагуйте `app/page.tsx`:

```typescript
'use client';

import { useAccount, useConnect } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Crypto Prediction Duels
        </h1>

        {!isConnected ? (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p className="mb-4">Connected: {address}</p>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/predictions"
                className="bg-green-500 text-white p-6 rounded-lg text-center"
              >
                <h2 className="text-2xl font-bold">Make Predictions</h2>
                <p>Predict crypto prices</p>
              </Link>

              <Link
                href="/duels"
                className="bg-purple-500 text-white p-6 rounded-lg text-center"
              >
                <h2 className="text-2xl font-bold">Duels</h2>
                <p>Challenge players</p>
              </Link>

              <Link
                href="/leaderboard"
                className="bg-orange-500 text-white p-6 rounded-lg text-center col-span-2"
              >
                <h2 className="text-2xl font-bold">Leaderboard</h2>
                <p>Top players</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

### Крок 3: Сторінка Прогнозів

Створіть `app/predictions/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import PredictionGameABI from '@/lib/abis/PredictionGame.json';

export default function PredictionsPage() {
  const [predictedHigher, setPredictedHigher] = useState(true);
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const makePrediction = async () => {
    if (!address) return;

    writeContract({
      address: CONTRACTS.PredictionGame,
      abi: PredictionGameABI.abi,
      functionName: 'makePrediction',
      args: ['ETH', predictedHigher],
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Make a Prediction</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl mb-4">ETH Price in 24 Hours</h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setPredictedHigher(true)}
              className={`flex-1 py-4 rounded-lg ${
                predictedHigher
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              📈 Higher
            </button>

            <button
              onClick={() => setPredictedHigher(false)}
              className={`flex-1 py-4 rounded-lg ${
                !predictedHigher
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              📉 Lower
            </button>
          </div>

          <button
            onClick={makePrediction}
            disabled={isPending}
            className="w-full bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit Prediction'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Крок 4: Base Mini App Manifest

Створіть `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "",
    "payload": "",
    "signature": ""
  },
  "miniapp": {
    "version": "1",
    "name": "Crypto Prediction Duels",
    "subtitle": "Predict & Duel",
    "description": "Predict cryptocurrency prices and challenge other players in duels!",
    "homeUrl": "https://your-app.vercel.app",
    "iconUrl": "https://your-app.vercel.app/icon.png",
    "splashImageUrl": "https://your-app.vercel.app/splash.png",
    "splashBackgroundColor": "#000000",
    "screenshotUrls": [
      "https://your-app.vercel.app/screenshot1.png"
    ],
    "primaryCategory": "gaming",
    "tags": ["crypto", "predictions", "gaming", "duels"],
    "heroImageUrl": "https://your-app.vercel.app/hero.png",
    "tagline": "Predict. Duel. Win.",
    "ogTitle": "Crypto Prediction Duels",
    "ogDescription": "Challenge friends and predict crypto prices!",
    "ogImageUrl": "https://your-app.vercel.app/og.png",
    "noindex": true
  }
}
```

## 🎨 Компоненти для Створення

### 1. DuelCard Component

```typescript
// components/DuelCard.tsx
interface DuelCardProps {
  duelId: number;
  creator: string;
  stakeAmount: bigint;
  duration: number;
  onJoin: () => void;
}

export function DuelCard({ duelId, creator, stakeAmount, duration, onJoin }: DuelCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <span>Duel #{duelId}</span>
        <span>{duration === 0 ? '24h' : duration === 1 ? '3d' : '7d'}</span>
      </div>
      <p>Stake: {stakeAmount.toString()} ETH</p>
      <p className="text-sm text-gray-600">by {creator.slice(0, 6)}...</p>
      <button
        onClick={onJoin}
        className="mt-4 w-full bg-purple-500 text-white py-2 rounded"
      >
        Join Duel
      </button>
    </div>
  );
}
```

### 2. Leaderboard Component

```typescript
// components/LeaderboardTable.tsx
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import PredictionGameABI from '@/lib/abis/PredictionGame.json';

export function LeaderboardTable() {
  const { data: leaderboard } = useReadContract({
    address: CONTRACTS.PredictionGame,
    abi: PredictionGameABI.abi,
    functionName: 'getLeaderboard',
    args: [10], // Top 10
  });

  if (!leaderboard) return <div>Loading...</div>;

  const [addresses, scores] = leaderboard as [string[], bigint[]];

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="p-2">Rank</th>
          <th className="p-2">Player</th>
          <th className="p-2">Score</th>
        </tr>
      </thead>
      <tbody>
        {addresses.map((address, index) => (
          <tr key={address} className="border-b">
            <td className="p-2 text-center">{index + 1}</td>
            <td className="p-2">{address.slice(0, 6)}...{address.slice(-4)}</td>
            <td className="p-2 text-center">{scores[index].toString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 🚢 Deployment

### На Vercel:

1. Push код на GitHub
2. Імпортуйте проєкт на Vercel
3. Встановіть environment variables
4. Deploy!

### Після Deployment:

1. Оновіть `farcaster.json` з вашим доменом
2. Створіть account association credentials на https://base.dev/preview
3. Опублікуйте в Base app!

## 📚 Додаткові Ресурси

- [Wagmi Docs](https://wagmi.sh)
- [Base Mini Apps](https://docs.base.org/mini-apps)
- [Next.js Docs](https://nextjs.org/docs)

## ⚡ Швидкі Команди

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

---

Успіхів з розробкою! 🚀
