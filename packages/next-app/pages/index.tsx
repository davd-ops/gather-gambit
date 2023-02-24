import type { NextPage } from 'next';
import { useState } from 'react';

import { gather, mint } from '@/lib/smartContractFunction';

import BreedModal from '@/components/BreedModal';
import Gallery from '@/components/Gallery';
import Modal from '@/components/Modal';
import { PixelButton } from '@/components/PixelButton';

const Home: NextPage = () => {
  const [openGatherModal, setOpenGatherModal] = useState(false);
  const [openBreedModal, setOpenBreedModal] = useState(false);
  return (
    <>
      <PixelButton text='MINT' onClick={mint} />
      <Gallery image={{ imageSrc: '/assets/background.png' }} />

      {/* Game function */}

      {/* TOOD:CHECK IF TOKEN IN GATHERER  */}
      <div className='grid grid-cols-2 gap-4'>
        <PixelButton
          text='GATHER'
          onClick={gather}
          openModal={() => {
            console.log('open gather modal');
            setOpenGatherModal(true);
          }}
        />
        <PixelButton
          text='BREED'
          onClick={mint}
          openModal={() => {
            console.log('open Breed modal');
            setOpenBreedModal(true);
          }}
        />
        <Modal open={openGatherModal} setOpen={setOpenGatherModal} />;
        <BreedModal open={openBreedModal} setOpen={setOpenBreedModal} />;
      </div>
    </>
  );
};

export default Home;
