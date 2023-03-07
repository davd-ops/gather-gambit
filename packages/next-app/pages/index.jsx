import { readContract } from '@wagmi/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, useContract, useContractRead, useSigner } from 'wagmi';

import deployedContracts from '@/lib/hardhat_contracts.json';

const Entity = {
  0: 'Unrevealed',
  1: 'Gatherer',
  2: 'Protector',
  3: 'Wolf',
};

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadEntity, setLoadEntity] = useState();
  const [mintLoading, setmintLoading] = useState(false);
  const { address } = useAccount();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (address) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [address]);

  // Getters GatherGambit

  const {
    data: gatherGambitData,
    // isError: gatherGambitError,
    // isLoading: gatherGambitIsLoading,
  } = useContractRead({
    address: deployedContracts[80001][0].contracts.GatherGambit.address,
    abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
    functionName: 'tokensOfOwner',
    args: [address],
  });

  const getEntity = async (tokenId) => {
    const gatherGambitGetEntityData = await readContract({
      address: deployedContracts[80001][0].contracts.GatherGambit.address,
      abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
      functionName: 'getEntity',
      args: [tokenId],
    });
    return gatherGambitGetEntityData;
  };

  // Setters GatherGambit

  const gatherGambitContract = useContract({
    address: deployedContracts[80001][0].contracts.GatherGambit.address,
    abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    gatherGambitData &&
      gatherGambitData.map((d, index) => {
        getEntity(parseInt(d)).then((r) => {
          setLoadEntity((prev) => ({ ...prev, [index]: r }));
        });
      });
  }, [gatherGambitData]);

  if (!isLoggedIn) {
    return (
      <p className='text-center'>Loading.... Please connect your wallet</p>
    );
  }

  return (
    <div className='mx-auto max-w-2xl space-y-8 p-4'>
      {/* Mint GatherGambit */}
      <div>
        <p>Choose you destiny</p>
        <p>You can be Gather, Protector or Wolf</p>
        <button
          className='btn mt-4'
          onClick={async () => {
            setmintLoading(true);
            try {
              await (await gatherGambitContract.mint(address)).wait();
              setmintLoading(false);
              toast.success('Successfully minted!');
            } catch (error) {
              console.log(error);
              toast.error(error);
            }
          }}
        >
          {mintLoading ? 'Loading...' : 'Mint'}
        </button>
      </div>
      {/* Gather */}
      {/* Dashboad */}
      <div>
        <p>Dashboard</p>
        <div className='px-8'>
          <p>My GatherGambit Tokens</p>
          <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
            {gatherGambitData &&
              // <pre>{JSON.stringify(gatherGambitData, null, 2)}</pre>
              gatherGambitData.map((d, index) => (
                <div key={index}>
                  {/* {getEntity(d, index)} */}
                  <div className=''>
                    <Image
                      alt=''
                      src='/assets/background.png'
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                    <p> tokenId: {parseInt(d)}</p>
                    <p> Entity: {loadEntity && Entity[loadEntity[index]]}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div>
        <div className='ml-8 space-y-4'>
          <p>Gather in Fertile Land</p>
          <ul className='ml-8 list-disc'>
            <li>Yield: 2000 $BERRY/day</li>
            <li>If caught, gatherer loses all of his berries</li>
            <li>If caught while protected, loses only 40% of his berries</li>
          </ul>
          <button className='btn-primary btn'>Gather in Fertile Land</button>

          {/* Enter into Berry land */}
          {/* Approve on the GatherGambit */}

          {/* Enter into berryland  */}
        </div>
        <p>Gather in Whisper Woods</p>
      </div>
    </div>
  );
};

export default Home;
