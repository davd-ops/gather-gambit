import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { inter } from 'pages/_app';
import { Fragment, useRef } from 'react';

import { ImageType } from '@/components/Gallery';

export default function BreedModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (arg0: boolean) => void;
}) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-10'
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div
          className={`fixed inset-0 z-10 overflow-y-auto ${inter.className}`}
        >
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-red-300 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                <div className='bg-green-500'>
                  <div className='sm:flex sm:items-start'>
                    <div className='mx-auto mt-3 max-w-lg '>
                      <div className='mx-auto mt-2 flex max-w-lg flex-col place-items-center items-center justify-center'>
                        <p className='text-center text-lg'>
                          Do you ❤️ wanna Breed 🤫️
                        </p>

                        <div className='mt-8 grid grid-cols-2 gap-2 p-2 '>
                          <div className='aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8 w-full overflow-hidden rounded-lg bg-gray-200'>
                            <Image
                              width={500}
                              height={500}
                              src='/assets/clouds.png'
                              alt='breeding'
                            />
                          </div>
                          <div className='aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8 w-full overflow-hidden rounded-lg bg-gray-200'>
                            <Image
                              width={500}
                              height={500}
                              src='/assets/town.png'
                              alt='breeding'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-green-300 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                  <button
                    type='button'
                    className='mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function BlurImage({ image }: { image: ImageType }) {
  return (
    <a href={image.href} className='group'>
      <div className='aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8 w-full overflow-hidden rounded-lg bg-gray-200'>
        <Image
          alt=''
          src={image.imageSrc}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <h3 className='mt-4 text-sm text-gray-700'>{image.name}</h3>
      <p className='mt-1 text-lg font-medium text-gray-900'>{image.username}</p>
    </a>
  );
}
