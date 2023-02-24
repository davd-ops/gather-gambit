import Image from 'next/image';

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export type ImageType = {
  id?: number;
  href?: string;
  imageSrc: string;
  name?: string;
  username?: string;
};

export default function Gallery({ image }: { image: ImageType }) {
  return (
    <div className='mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8'>
      <div className='grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
        <BlurImage image={image} />
      </div>
    </div>
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
