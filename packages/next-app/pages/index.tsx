import type { NextPage } from 'next';
import { useState } from 'react';

import { gather, mint } from '@/lib/smartContractFunction';

import { useContract } from 'wagmi';

import BreedModal from '@/components/BreedModal';
import Gallery from '@/components/Gallery';
import Modal from '@/components/Modal';
import { PixelButton } from '@/components/PixelButton';

import { abi } from '../../hardhat/artifacts/contracts/GatherGambit.sol/GatherGambit.json';

console.log(abi);

const Home: NextPage = () => {
  const [openGatherModal, setOpenGatherModal] = useState(false);
  const [openBreedModal, setOpenBreedModal] = useState(false);

  // const contract = useContract({
  //   address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  //   abi: abi,
  //   // signerOrProvider: provider,
  // });

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
