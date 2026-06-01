import { Process, Processor } from '@nestjs/bull';
import { MailService } from '../services';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { WelcomeEmailContext } from '../types';

@Processor('mail-queue')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process('welcome-email')
  async handleWelcomeEmail(job: Job<WelcomeEmailContext>) {
    this.logger.log(`Processing welcome email for ${job.data.email}`);

    try {
      await this.mailService.sendMailNewUser(job.data);
      this.logger.log(`Welcome email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${job.data.email}`,
        error.stack,
      );
      throw error;
    }

    this.logger.log(`Welcome email sent to ${job.data.email}`);
  }

  @Process('forget-password-email')
  async handleForgetPasswordEmail(
    job: Job<{ email: string; token: string; fullName: string }>,
  ) {
    this.logger.log(`Processing forget password email for ${job.data.email}`);

    try {
      await this.mailService.sendForgetPasswordEmail(
        job.data.email,
        job.data.token,
        job.data.fullName,
      );
      this.logger.log(`Forget password email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send forget password email to ${job.data.email}`,
        error.stack,
      );
      throw error;
    }

    this.logger.log(`Forget password email sent to ${job.data.email}`);
  }

  @Process('confirm-reset-password-email')
  async handleConfirmResetPasswordEmail(
    job: Job<{ email: string; fullName: string }>,
  ) {
    this.logger.log(
      `Processing confirm reset password email for ${job.data.email}`,
    );

    try {
      await this.mailService.sendConfirmResetPasswordEmail(
        job.data.email,
        job.data.fullName,
      );
      this.logger.log(`Confirm reset password email sent to ${job.data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send confirm reset password email to ${job.data.email}`,
        error.stack,
      );
      throw error;
    }

    this.logger.log(`Confirm reset password email sent to ${job.data.email}`);
  }
}
