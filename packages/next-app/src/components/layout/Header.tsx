import { ConnectKitButton } from 'connectkit';

import * as React from 'react';

import ButtonLink from '../links/ButtonLink';

export default function Header() {
  return (
    <div className='mx-auto my-8 grid grid-cols-6 space-x-16'>
      <ButtonLink className='' href='/'>
        Home
      </ButtonLink>
      <ButtonLink href='/gameplay'>Game Play</ButtonLink>
      <ButtonLink href='/myBerries'>Berries</ButtonLink>
      <ButtonLink href='/assets/FantomHackaton.png'>
        Our Game play theory
      </ButtonLink>
      <ButtonLink href='https://github.com/davd-ops/gather-gambit'>
        Github{' '}
      </ButtonLink>
      <ConnectKitButton />
    </div>
  );
}
