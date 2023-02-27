import { ConnectKitButton } from 'connectkit';
import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

const links = [
  { href: '/', label: 'Route 1' },
  { href: '/', label: 'Route 2' },
];

export default function Header() {
  return (
    <header className='sticky top-0 z-50'>
      <div className='layout flex h-14 items-center justify-between'>
        <UnstyledLink href='/' className='font-bold hover:text-gray-600'>
          Home
        </UnstyledLink>
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
