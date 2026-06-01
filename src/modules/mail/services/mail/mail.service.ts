import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Brand, WelcomeEmailContext } from '@modules/mail/types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly _mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  brand: Brand = {
    name: this.configService.get<string>('BRAND_NAME'),
    year: this.configService.get<string>('BRAND_YEAR'),
    emailSupport: this.configService.get<string>('BRAND_EMAIL_SUPPORT'),
    address: this.configService.get<string>('BRAND_ADDRESS'),
    imageUrl: this.configService.get<string>('BRAND_LOGO_URL'),
  };

  async sendForgetPasswordEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<boolean> {
    try {
      const res = await this._mailerService.sendMail({
        to: email,
        subject: 'Password recovery',
        template: 'forgetPassword',
        context: {
          url: `${this.configService.get<string>('FRONT_URL')}/auth/reset-password?token=${token}`,
          fullName,
          brand: this.brand,
        },
      });
      this.logger.log(res);
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  async sendConfirmResetPasswordEmail(
    email: string,
    fullName: string,
  ): Promise<boolean> {
    try {
      const res = await this._mailerService.sendMail({
        to: email,
        subject: 'Confirmación de restablecimiento de contraseña',
        template: 'confirmResetPassword',
        context: {
          username: fullName,
          brand: this.brand,
        },
      });
      this.logger.log(res);
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  async sendMailNewUser(data: WelcomeEmailContext): Promise<boolean> {
    try {
      const res = await this._mailerService.sendMail({
        to: data.email,
        subject: 'Creación de cuenta',
        template: 'welcome',
        context: {
          siteName: 'Facts by Urbeecode',
          fullName: data.fullName,
          loginUrl: `${this.configService.get<string>('FRONT_URL')}/auth/login`,
          brand: this.brand,
        },
      });
      this.logger.log(res);
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
