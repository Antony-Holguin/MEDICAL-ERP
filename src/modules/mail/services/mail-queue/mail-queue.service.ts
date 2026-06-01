import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailQueueService {
  logger = new Logger(MailQueueService.name);
  constructor(@InjectQueue('mail-queue') private readonly mailQueue: Queue) {}

  async sendMailNewUser(email: string, fullName: string): Promise<void> {
    const job = await this.mailQueue.add('welcome-email', {
      email,
      fullName,
    });

    this.logger.log(`Job ${job.id} - Welcome email added to the queue`);
  }

  async sendTestEmails(emails: string[]): Promise<void> {
    const job = await this.mailQueue.add('test-email', {
      emails,
    });
    this.logger.log(`Job ${job.id} - Test emails added to the queue`);
  }

  async sendForgetPasswordEmail(
    email: string,
    token: string,
    fullName: string,
  ): Promise<void> {
    const job = await this.mailQueue.add('forget-password-email', {
      email,
      token,
      fullName,
    });

    this.logger.log(`Job ${job.id} - Forget password email added to the queue`);
  }

  async sendConfirmResetPasswordEmail(
    email: string,
    fullName: string,
  ): Promise<void> {
    const job = await this.mailQueue.add('confirm-reset-password-email', {
      email,
      fullName,
    });

    this.logger.log(
      `Job ${job.id} - Confirm reset password email added to the queue`,
    );
  }
}
