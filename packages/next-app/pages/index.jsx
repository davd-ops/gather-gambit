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

import { setLocalStorageDb, getLocaleStorageDb } from '@/lib/localStorageDb';

export const CHAIN_ID = '250';

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
  const [attackLoading, setAttackLoading] = useState(false);
  const [berriesLoading, setBerryLoading] = useState(false);
  const [loadEntity, setLoadEntity] = useState();
  const [gatherTokenId, setGatherTokenId] = useState();
  const [myTokenIds, setMyTokenIds] = useState();
  const [gatherTokenToPotectId, setGatherTokenToPotectId] = useState();
  const [gatherTokenToPotectLoading, setGatherTokenToPotectLoading] =
    useState(false);

  const [wolfTokenId, setWolfTokenId] = useState();
  const [wolfTokenLoading, setWolfTokenLoading] = useState(false);

  const [tokenId, setTokenId] = useState();
  const [location, setLocation] = useState(0);

  const { address } = useAccount();

  const { data: signer } = useSigner();

  const [protectLoading, setProtectLoading] = useState(false);
  const [protectorTokenId, setProtectorTokenId] = useState();
  const [
    gatherTokenIdFromProtectorRemove,
    setGatherTokenIdFromProtectorRemove,
  ] = useState();

  useEffect(() => {
    if (address) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [address]);

  // Events

  useContractEvent({
    address: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.address,
    abi: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.abi,
    eventName: 'Transfer',
    listener(node, label, owner) {
      console.log({ node }, { label }, { owner });
    },
  });

  useContractEvent({
    address: deployedContracts[CHAIN_ID][0].contracts.BerryLands.address,
    abi: deployedContracts[CHAIN_ID][0].contracts.BerryLands.abi,
    eventName: 'StakedInBerryLands',
    listener(node, label, owner) {
      console.log({ node }, { label }, { owner });
      setLocalStorageDb({
        tokenId: parseInt(owner),
        address,
        event: 'STACKED',
      });
    },
  });

  // Getters GatherGambit

  const {
    data: gatherGambitData,
    // isError: gatherGambitError,
    // isLoading: gatherGambitIsLoading,
  } = useContractRead({
    address: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.address,
    abi: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.abi,
    functionName: 'tokensOfOwner',
    args: [address],
  });

  const getEntity = async (tokenId) => {
    const gatherGambitGetEntityData = await readContract({
      address: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.address,
      abi: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.abi,
      functionName: 'getEntity',
      args: [tokenId],
    });
    return gatherGambitGetEntityData;
  };

  // Setters GatherGambit

  const gatherGambitContract = useContract({
    address: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.address,
    abi: deployedContracts[CHAIN_ID][0].contracts.GatherGambit.abi,
    signerOrProvider: signer,
  });

  // Setters BerryLands
  const berryLandsAddress =
    deployedContracts[CHAIN_ID][0].contracts.BerryLands.address;

  const berrriesLandContract = useContract({
    address: berryLandsAddress,
    abi: deployedContracts[CHAIN_ID][0].contracts.BerryLands.abi,
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

  useEffect(() => {
    const items = getLocaleStorageDb({ event: 'STACKED' });
    if (items) setMyTokenIds(items);
  }, []);

  console.log({ myTokenIds });

  if (!isLoggedIn) {
    return (
      <p className='text-center'>Loading.... Please connect your wallet</p>
    );
  }

  return (
    <div className='mx-auto mb-16 max-w-2xl space-y-16'>
      {/* Mint */}
      <div>
        <p>Choose you destiny</p>
        <p>You can be Gather, Protector or Wolf</p>
        <button
          className='btn-primary btn'
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

      {/* Dashboad */}
      <div>
        <p>Dashboard</p>
        <div className=''>
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
                      src='/assets/graveyard.png'
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

      {/* My Tokens into Berry lands AKA stakced */}

      <div className='bg-red-500'>
        <p>Stacked Tokens</p>
        {myTokenIds &&
          myTokenIds.map((item, index) => <div key={index}>{item}</div>)}
      </div>

      {/* BerryLand */}
      <div>
        <div className=''>
          <p>Gather in Fertile Land</p>
          <ul className='list-disc'>
            <li>Yield: 2000 $BERRY/day</li>
            <li>If caught, gatherer loses all of his berries</li>
            <li>If caught while protected, loses only 40% of his berries</li>
          </ul>
          <hr />
          <p>Whispering Woods</p>
          <ul className='list-disc'>
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

            {/* Apprve and Enter into berryland  */}
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
      </div>

      {/* initiate Attack */}
      <div className='bg-blue-300'>
        <p>Attack on Berry lands </p>
        <p>If you are wolf you can attack gathers for </p>
        <ul className='list-disc'>
          <li>Get 40% of his collected $BERRIES if they are protected</li>
          <li>Get all $BERRIES</li>
        </ul>

        <Select
          options={locationObject}
          defaultValue={locationObject[0]}
          onChange={(e) => setLocation(e.value)}
        />

        <div className='grid grid-cols-2 gap-2'>
          <input
            type='number'
            placeholder='Enter token id of wolf'
            className='input-bordered input-primary input w-full max-w-xs'
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />

          <button
            className='btn-primary btn'
            onClick={async () => {
              if (!tokenId) {
                toast.error('Please enter Wolf token id');
                return;
              }

              setAttackLoading(true);
              try {
                await (
                  await gatherGambitContract.approve(berryLandsAddress, tokenId)
                ).wait();

                await (
                  await berrriesLandContract.initiateAttack(tokenId, location)
                ).wait();

                setLocalStorageDb({
                  tokenId,
                  address,
                  event: 'ATTACK',
                  location: location,
                });
                toast.success('Attack initiated successfully');
              } catch (e) {
                toast.error(e.message);
              }
              setAttackLoading(false);
            }}
          >
            {attackLoading ? 'Loading...' : 'initiateAttack'}
          </button>
        </div>
      </div>

      {/* Add Protector */}
      <div className='bg-red-300'>
        <p>Protect your Destiny </p>

        <input
          type='number'
          placeholder='protectoer id'
          className='input-primary input w-full max-w-xs'
          value={protectorTokenId}
          onChange={(e) => setProtectorTokenId(e.target.value)}
        />

        <input
          type='number'
          placeholder='gather token you want to protect'
          className='input-bordered input-primary input w-full max-w-xs'
          value={gatherTokenToPotectId}
          onChange={(e) => setGatherTokenToPotectId(e.target.value)}
        />

        <Select
          options={locationObject}
          defaultValue={locationObject[0]}
          onChange={(e) => setLocation(e.value)}
        />
        <button
          className='btn-primary btn'
          onClick={async () => {
            if (!tokenId) {
              toast.error('Please enter Wolf token id');
              return;
            }
            setProtectLoading(true);
            try {
              await (
                await gatherGambitContract.approve(
                  berryLandsAddress,
                  protectorTokenId
                )
              ).wait();

              await (
                await berrriesLandContract.addProtector(
                  protectorTokenId,
                  gatherTokenId,
                  location
                )
              ).wait();

              setLocalStorageDb({
                tokenId,
                address,
                event: 'PROTECT',
                location: location,
              });
              toast.success('Attack initiated successfully');
            } catch (e) {
              toast.error(e.message);
            }
            setProtectLoading(false);
          }}
        >
          {protectLoading ? 'Loading...' : 'Protect'}
        </button>
      </div>

      {/*  Remove Protector */}
      {/* uint256 _gathererId, Location _location */}

      <div className='bg-yellow-300'>
        <p>Remove Protector</p>
        <p>If you are wolf you can attack gathers for </p>
        <ul className='list-disc'>
          <li>Get 40% of his collected $BERRIES if they are protected</li>
          <li>Get all $BERRIES</li>
        </ul>

        <Select
          options={locationObject}
          defaultValue={locationObject[0]}
          onChange={(e) => setLocation(e.value)}
        />

        <div className='flex flex-col'>
          <input
            type='number'
            placeholder='Enter token id of Gather from which you want to remove protecter'
            className='input'
            value={gatherTokenIdFromProtectorRemove}
            onChange={(e) =>
              setGatherTokenIdFromProtectorRemove(e.target.value)
            }
          />

          <button
            className='btn-primary btn'
            onClick={async () => {
              if (!gatherTokenIdFromProtectorRemove) {
                toast.error('Please enter Gather token id');
                return;
              }

              setGatherTokenToPotectLoading(true);
              try {
                await (
                  await berrriesLandContract.removeProtector(
                    gatherTokenIdFromProtectorRemove,
                    location
                  )
                ).wait();

                toast.success('Remove Protector successfully');
              } catch (e) {
                toast.error(e.message);
              }
              setGatherTokenToPotectLoading(false);
            }}
          >
            {gatherTokenToPotectLoading ? 'Loading...' : 'Remove Protector'}
          </button>
        </div>
      </div>

      {/* resolveAttack */}

      {/*
       * @notice Resolves an attack.
       * @param _tokenId The token ID of the attacking Wolf.
       */}

      <div className='bg-green-300'>
        <p>Resolve Attack </p>
        <p>If you are wolf you can attack gathers for </p>
        <ul className='list-disc'>
          <li>Get 40% of his collected $BERRIES if they are protected</li>
          <li>Get all $BERRIES</li>
        </ul>

        <div className='grid grid-cols-2 gap-2'>
          <input
            type='number'
            placeholder='Enter wolf id of wolf'
            className='input-bordered input-primary input w-full max-w-xs'
            value={wolfTokenId}
            onChange={(e) => setWolfTokenId(e.target.value)}
          />

          <button
            className='btn-primary btn'
            onClick={async () => {
              if (!wolfTokenId) {
                toast.error('Please enter Wolf token id');
                return;
              }

              setWolfTokenLoading(true);
              try {
                await (
                  await berrriesLandContract.resolveAttack(wolfTokenId)
                ).wait();

                toast.success('Attack Resolved successfully');
              } catch (e) {
                toast.error(e.message);
              }
              setWolfTokenLoading(false);
            }}
          >
            {wolfTokenLoading ? 'Loading...' : 'initiateAttack'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
