import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import type { AppProps } from 'next/app';
import { createClient, WagmiConfig } from 'wagmi';
import { arbitrum, fantom, mainnet, optimism, polygon } from 'wagmi/chains';

import '../styles/globals.css';

const client = createClient(
  getDefaultClient({
    appName: 'ConnectKit',
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [mainnet, polygon, optimism, arbitrum, fantom],
  })
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme='retro'>
        <Component {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
