export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true' ?? false;

export const JWT_SECRET_KEY = isLocal
  ? process.env.JWT_SECRET_KEY
  : process.env.JWT_SECRET_KEY;
