// pages/_app.js
import { Press_Start_2P } from '@next/font/google';
import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import type { AppProps } from 'next/app';
import { createClient, WagmiConfig } from 'wagmi';
import { arbitrum, fantom, mainnet, optimism, polygon } from 'wagmi/chains';

import '../styles/globals.css';

import Layout from '@/components/layout/Layout';

// If loading a variable font, you don't need to specify the font weight
export const inter = Press_Start_2P({
  weight: '400',
  subsets: ['cyrillic'],
});

const client = createClient(
  getDefaultClient({
    appName: 'ConnectKit',
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [mainnet, polygon, optimism, arbitrum, fantom],
  })
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <WagmiConfig client={client}>
        <ConnectKitProvider theme='retro'>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ConnectKitProvider>
      </WagmiConfig>
    </main>
  );
}

export default MyApp;
