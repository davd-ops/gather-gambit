import { ConnectKitButton } from 'connectkit';
import * as React from 'react';
import ButtonLink from '../links/ButtonLink';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 p-8'>
      <div className='layout flex items-center justify-between'>
        <ButtonLink href='/'>Home</ButtonLink>
        <ButtonLink href='/gameplay'>Game Play</ButtonLink>
        <nav>
          <ul className='flex items-center justify-between space-x-4'>
            <div
              style={{
                display: 'flex',
                padding: '25px',
                zIndex: 1000,
                justifyContent: 'right',
              }}
            >
              <ConnectKitButton />
            </div>
          </ul>
        </nav>
      </div>
    </header>
  );
}
