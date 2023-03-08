import { ConnectKitButton } from 'connectkit';
import * as React from 'react';
import ButtonLink from '../links/ButtonLink';

export default function Header() {
  return (
    <div className='mx-auto my-8 grid max-w-3xl grid-cols-4 space-x-16'>
      <ButtonLink className='' href='/'>
        Home
      </ButtonLink>
      <ButtonLink href='/gameplay'>Game Play</ButtonLink>
      <ButtonLink href='/myBerries'>Berries</ButtonLink>
      <ConnectKitButton />
    </div>
  );
}
