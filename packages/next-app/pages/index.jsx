import { readContract } from '@wagmi/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';

import deployedContracts from '@/lib/hardhat_contracts.json';

const Entity = {
  0: 'Unrevealed',
  1: 'Gatherer',
  2: 'Protector',
  3: 'Wolf',
};

const Home = () => {
  // const account = getAccount();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loadEntity, setLoadEntity] = useState();

  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setIsLoggedIn(true);
    }
  }, [address]);

  const {
    data: gatherGambitData,
    // isError: gatherGambitError,
    // isLoading: gatherGambitIsLoading,
  } = useContractRead({
    address: '0xD92Ff95c3bd9b27DB37eCe08712939bDcA67F9Dc',
    abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
    functionName: 'tokensOfOwner',
    args: [address],
  });

  const getEntity = async (tokenId) => {
    const gatherGambitGetEntityData = await readContract({
      address:
        deployedContracts[80001][0].contracts.GatherGambit.address.toString(),
      abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
      functionName: 'getEntity',
      args: [tokenId],
    });
    return gatherGambitGetEntityData;
  };

  useEffect(() => {
    gatherGambitData &&
      gatherGambitData.map((d, index) => {
        getEntity(parseInt(d)).then((r) => {
          setLoadEntity((prev) => ({ ...prev, [index]: r }));
        });
      });
  }, [gatherGambitData]);

  if (!isLoggedIn) {
    return <p className='text-center'>Loading... Please connect your wallet</p>;
  }

  return (
    <div className='mx-auto max-w-2xl space-y-8'>
      {/* Mint GatherGambit */}
      <div>
        <p>Choose you destiny</p>
        <p>You can be Gather, Protector or Wolf</p>
        <button className='btn'>mint</button>
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
                    tokenId: {parseInt(d)}
                    Entity: {loadEntity && Entity[loadEntity[index]]}
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
