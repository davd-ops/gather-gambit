import { readContract } from '@wagmi/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import {
  useAccount,
  useContract,
  useContractEvent,
  useContractRead,
  useSigner,
} from 'wagmi';

import deployedContracts from '@/lib/hardhat_contracts.json';

export const Entity = {
  0: 'Unrevealed',
  1: 'Gatherer',
  2: 'Protector',
  3: 'Wolf',
};

export const locationObject = [
  {
    value: 0,
    label: 'Fertile Field',
  },
  {
    value: 1,
    label: 'Whispering Woods',
  },
];

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mintLoading, setmintLoading] = useState(false);
  const [berriesLoading, setBerryLoading] = useState(false);
  const [loadEntity, setLoadEntity] = useState();
  const [gatherTokenId, setGatherTokenId] = useState();
  const [location, setLocation] = useState(0);
  const { address } = useAccount();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (address) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [address]);

  // Events

  useContractEvent({
    address: deployedContracts[80001][0].contracts.GatherGambit.address,
    abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
    eventName: 'NewEpoch',
    listener(node, label, owner) {
      console.log(node, label, owner);
    },
  });

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

  // Setters BerryLands
  const berryLandsAddress =
    deployedContracts[80001][0].contracts.BerryLands.address;

  const berrriesLandContract = useContract({
    address: berryLandsAddress,
    abi: deployedContracts[80001][0].contracts.BerryLands.abi,
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
    <div className='mx-auto mb-16 max-w-2xl space-y-8 p-4'>
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
        {/* Approve on the GatherGambit */}
        {/* Enter into berryland  */}
        <div className='ml-8 space-y-4 '>
          <p>Gather in Fertile Land</p>
          <ul className='ml-8 list-disc'>
            <li>Yield: 2000 $BERRY/day</li>
            <li>If caught, gatherer loses all of his berries</li>
            <li>If caught while protected, loses only 40% of his berries</li>
          </ul>
          <hr />
          <p>Whispering Woods</p>
          <ul className='ml-8 list-disc'>
            <li>Yield: 5000 $BERRY/day</li>
            <li>
              If caught, gatherer is killed, wolves steal all of his berries
            </li>
            <li>
              If caught while protected, loses 70% of his berries, 5% chance to
              kill the wolf
            </li>
          </ul>

          <Select
            options={locationObject}
            defaultValue={locationObject[0]}
            onChange={(e) => setLocation(e.value)}
          />

          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              placeholder='Enter Gather token id'
              className='input-bordered input-primary input w-full max-w-xs'
              value={gatherTokenId}
              onChange={(e) => setGatherTokenId(e.target.value)}
            />

            <button
              onClick={async () => {
                if (!gatherTokenId) {
                  toast.error('Please enter Gather token');
                  return;
                }
                setBerryLoading(true);
                try {
                  await (
                    await gatherGambitContract.approve(
                      berryLandsAddress,
                      gatherTokenId
                    )
                  ).wait();

                  await (
                    await berrriesLandContract.enterBerryLands(
                      gatherTokenId,
                      location
                    )
                  ).wait();
                } catch (e) {
                  toast.error(e.message);
                  console.error(e);
                }
                setBerryLoading(false);
              }}
              className='btn-primary btn'
            >
              {berriesLoading
                ? 'Loading...'
                : `Gather in ${locationObject[location].label}`}
            </button>
          </div>
        </div>
        {/* Berries */}
        <div className='mt-8'>
          <p>Berries</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
