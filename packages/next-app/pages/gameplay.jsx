import { readContract } from '@wagmi/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useContractRead, useContract, useSigner, useAccount } from 'wagmi';

import Select from 'react-select';
import { toast } from 'sonner';

import deployedContracts from '@/lib/hardhat_contracts.json';

import { Entity, locationObject } from './index';

const GamePlay = () => {
  const [loadEntity, setLoadEntity] = useState();

  const [loadingPage, setLoadingPage] = useState(true);

  const [tokenId, setTokenId] = useState();
  const [location, setLocation] = useState(0);

  const { data: signer } = useSigner();

  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setLoadingPage(true);
    } else {
      setLoadingPage(false);
    }
  }, [address]);

  const berryLandsAddress =
    deployedContracts[80001][0].contracts.BerryLands.address;

  const getEntity = async (tokenId) => {
    const gatherGambitGetEntityData = await readContract({
      address: deployedContracts[80001][0].contracts.GatherGambit.address,
      abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
      functionName: 'getEntity',
      args: [tokenId],
    });
    return gatherGambitGetEntityData;
  };

  const {
    data: gatherGambitStakedTokenData,
    // isError: gatherGambitError,
    isLoading: gatherGambitStakedTokenLoading,
  } = useContractRead({
    address: deployedContracts[80001][0].contracts.GatherGambit.address,
    abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
    functionName: 'tokensOfOwner',
    args: [berryLandsAddress],
  });

  useEffect(() => {
    gatherGambitStakedTokenData &&
      gatherGambitStakedTokenData.map((d, index) => {
        getEntity(parseInt(d)).then((r) => {
          setLoadEntity((prev) => ({ ...prev, [index]: r }));
        });
      });
  }, [gatherGambitStakedTokenData]);

  console.log({ gatherGambitStakedTokenData });
  console.log({ loadEntity });

  const berrriesLandContract = useContract({
    address: berryLandsAddress,
    abi: deployedContracts[80001][0].contracts.BerryLands.abi,
    signerOrProvider: signer,
  });

  const gatherGambitContract = useContract({
    address: deployedContracts[80001][0].contracts.GatherGambit.address,
    abi: deployedContracts[80001][0].contracts.GatherGambit.abi,
    signerOrProvider: signer,
  });

  if (!loadingPage) {
    return (
      <p className='text-center'>Loading.... Please connect your wallet</p>
    );
  }

  return (
    <div>
      <p className='text-center text-xl'>GamePlay</p>
      <div className='mt-8 grid grid-cols-2 place-items-center gap-2 md:grid-cols-4'>
        {gatherGambitStakedTokenData &&
          gatherGambitStakedTokenData.map((d, index) => (
            <div key={index}>
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
      {/* initiate Attack */}
      <div className='mx-auto mt-8 max-w-2xl '>
        <p>If you are wolf you can attack gathers for </p>
        <ul className='ml-8 list-disc'>
          <li>Get 40% of his collected $BERRIES if they are protected</li>
          <li>Get all $BERRIES</li>
        </ul>

        <div className='mx-auto max-w-lg space-y-8 p-2'>
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
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />

            <p>
              Location:{location} id: {tokenId}
            </p>

            <button
              className='btn'
              onClick={async () => {
                try {
                  await (
                    await gatherGambitContract.approve(
                      berryLandsAddress,
                      tokenId
                    )
                  ).wait();

                  await (
                    await berrriesLandContract.initiateAttack(tokenId, location)
                  ).wait();
                  let items = JSON.parse(localStorage.getItem('attack'));
                  let newItems = JSON.stringify([
                    {
                      tokenId: tokenId,
                      attackerAddress: address,
                      location: location,
                    },
                  ]);
                  if (items) {
                    items.push(newItems);
                    localStorage.setItem('attack', JSON.stringify(items));
                  } else {
                    localStorage.setItem('attack', newItems);
                  }
                  toast.success('Attack initiated successfully');
                } catch (e) {
                  toast.error(e.message);
                }
              }}
            >
              initiateAttack
            </button>
          </div>
        </div>
      </div>

      {/* Exit Berry Land */}
      <div className='mx-auto mt-8 max-w-2xl '>
        <p>Exit Berry land and claim your tasty berries </p>

        <div className='mx-auto max-w-lg space-y-8 p-2'>
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
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />

            <button
              className='btn-secondary btn'
              onClick={async () => {
                try {
                  // await (
                  //   await gatherGambitContract.approve(
                  //     berryLandsAddress,
                  //     tokenId
                  //   )
                  // ).wait();

                  toast.success(tokenId, location);

                  await (
                    await berrriesLandContract.exitBerryLands(tokenId, 0)
                  ).wait();

                  toast.success('Exit successfully');
                } catch (e) {
                  toast.error(e.message);
                }
              }}
            >
              Exit Berry Lands
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
