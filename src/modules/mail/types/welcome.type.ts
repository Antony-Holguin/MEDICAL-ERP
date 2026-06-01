import { Brand } from './brand.type';

/**
 * Context interface for welcome email template data.
 *
 * This interface defines the structure of data required to render
 * a welcome email template, containing user identification information.
 *
 * @interface WelcomeEmailContext
 */
export interface WelcomeEmailContext {
  fullName: string;
  email: string;
}

export interface WelcomeEmailProps {
  brand: Brand;
  fullName: string;
  loginUrl: string;
  siteName?: string;
}
