import { http, createConfig, createStorage } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
  },
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  ssr: true,
});

// Export the chain for easy reference
export { baseSepolia };

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
