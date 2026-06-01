export interface IEnvironment {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  DATA_KEY: string;
  HMAC_KEY: string;
  FRONT_URL: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASSWORD: string;
  MAIL_FROM: string;
  ENVIRONMENT: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
}
