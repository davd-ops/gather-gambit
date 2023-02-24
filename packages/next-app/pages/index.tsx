import { ConnectKitButton } from 'connectkit';
import type { NextPage } from 'next';

import { PixelButton } from '@/components/PixelButton';

const Home: NextPage = () => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          padding: '25px',
          zIndex: 1000,
          justifyContent: 'right',
        }}
      >
        <ConnectKitButton />
      </div>
      <PixelButton />
      <p>Checking stuff</p>
    </>
  );
};

export default Home;
