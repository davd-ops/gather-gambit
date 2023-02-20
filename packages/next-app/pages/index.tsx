import { ConnectKitButton } from 'connectkit';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        padding: '25px',
        justifyContent: 'right',
        height: '100vh',
      }}
    >
      <ConnectKitButton />
    </div>
  );
};

export default Home;
