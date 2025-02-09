'use client';

import { PrivyProvider } from '@privy-io/react-auth';

const baseChain = {
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm6xebft801ung7fpaubzze23'}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#14b8a6',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: baseChain,
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord', 'github'],
        supportedChains: [baseChain],
      }}
    >
      {children}
    </PrivyProvider>
  );
} 