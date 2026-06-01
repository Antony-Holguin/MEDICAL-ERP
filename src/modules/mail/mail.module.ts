import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './services/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ReactAdapter } from '@webtre/nestjs-mailer-react-adapter';
import { BullModule } from '@nestjs/bull';
import { MailQueueService } from './services';
import { MailProcessor } from './processors/mail.processor';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: +configService.get<string>('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('BRAND_SERVICE')}" ${configService.get<string>('ENVIRONMENT') === 'development' ? 'TEST' : ''} <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new ReactAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
  ],
  providers: [MailService, MailQueueService, MailProcessor],
  exports: [MailService, MailQueueService],
})
export class MailModule {}
