import { Brand } from './brand.type';

export interface ConfirmEmailContext {
  url: string;
}

export interface ConfirmEmailProps extends ConfirmEmailContext {
  brand: Brand;
}
