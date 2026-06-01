import { registerAs } from '@nestjs/config';
import { IEnvironment } from './type/enviroment.type';

export default registerAs('config', (): IEnvironment => {
  const {
    PORT,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRE,
    DATA_KEY,
    HMAC_KEY,
    FRONT_URL,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_FROM,
    ENVIRONMENT,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_USERNAME,
    REDIS_PASSWORD,
  } = process.env;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  return {
    PORT: PORT ? parseInt(PORT, 10) : 3000,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRE: JWT_EXPIRE ?? '3600s',
    DATA_KEY: DATA_KEY ?? 'default-data-key',
    HMAC_KEY: HMAC_KEY ?? 'default-hmac-key',
    FRONT_URL: FRONT_URL ?? 'http://localhost:4200',
    MAIL_HOST: MAIL_HOST ?? 'smtp.example.com',
    MAIL_PORT: MAIL_PORT ? parseInt(MAIL_PORT, 10) : 587,
    MAIL_USER: MAIL_USER ?? 'user@example.com',
    MAIL_PASSWORD: MAIL_PASSWORD ?? 'password',
    MAIL_FROM: MAIL_FROM ?? '"Support" <support@example.com>',
    ENVIRONMENT: ENVIRONMENT ?? 'development',
    REDIS_HOST: REDIS_HOST ?? 'localhost',
    REDIS_PORT: REDIS_PORT ? parseInt(REDIS_PORT, 10) : 6379,
    REDIS_USERNAME: REDIS_USERNAME ?? 'default',
    REDIS_PASSWORD: REDIS_PASSWORD ?? 'password',
  };
});
