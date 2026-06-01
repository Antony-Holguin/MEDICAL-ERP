import { Brand } from './brand.type';

export interface ConfirmResetPasswordProps {
  username?: string;
  brand: Brand;
  url: string;
}
