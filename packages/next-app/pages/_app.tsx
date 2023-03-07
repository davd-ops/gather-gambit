// pages/_app.js
import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import type { AppProps } from 'next/app';
import { Toaster } from 'sonner';
import { createClient, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  fantom,
  localhost,
  mainnet,
  optimism,
  polygon,
  polygonMumbai,
} from 'wagmi/chains';

import '../styles/globals.css';

import Layout from '@/components/layout/Layout';

// If loading a variable font, you don't need to specify the font weight
// export const inter = Press_Start_2P({
//   weight: '400',
//   subsets: ['cyrillic'],
// });

const client = createClient(
  getDefaultClient({
    appName: 'ConnectKit',
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [
      polygonMumbai,
      mainnet,
      polygon,
      optimism,
      arbitrum,
      fantom,
      localhost,
    ],
  })
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <main className={inter.className}>
    <main>
      <WagmiConfig client={client}>
        <ConnectKitProvider theme='retro'>
          <Layout>
            <Toaster />
            <Component {...pageProps} />
          </Layout>
        </ConnectKitProvider>
      </WagmiConfig>
    </main>
  );
}

export default MyApp;
