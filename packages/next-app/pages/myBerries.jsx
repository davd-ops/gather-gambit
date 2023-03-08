import { readContract } from '@wagmi/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useContractRead, useContract, useSigner, useAccount } from 'wagmi';

import Select from 'react-select';
import { toast } from 'sonner';

import deployedContracts from '@/lib/hardhat_contracts.json';

import { Entity, locationObject, CHAIN_ID } from './index';
import { formatUnits } from 'ethers/lib/utils.js';

const MyBerries = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [address]);

  const {
    data: berries,
    // isError: gatherGambitError,
    // isLoading: gatherGambitStakedTokenLoading,
  } = useContractRead({
    address: deployedContracts[CHAIN_ID][0].contracts.Berries.address,
    abi: deployedContracts[CHAIN_ID][0].contracts.Berries.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  //   console.log(formatUnits(berries, 18));

  if (!isLoggedIn) {
    return (
      <p className='text-center'>Loading.... Please connect your wallet</p>
    );
  }

  return (
    <div>
      Claimed Berries - {berries ? formatUnits(berries, 18) : 'No Berries'}{' '}
      $Berries
    </div>
  );
};

export default MyBerries;
